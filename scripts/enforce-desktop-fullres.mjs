import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname);
const srcDir = path.join(repoRoot, 'src');
const sourceExtensions = new Set(['.html', '.njk', '.cjs']);
const responsiveSuffixPattern = /-(?:400w|800w)\.webp(?:$|[?#])/i;

const files = await collectFiles(srcDir, (filePath) => sourceExtensions.has(path.extname(filePath)));
let changedCount = 0;
let imageCount = 0;

for (const file of files) {
  const original = await fs.readFile(file, 'utf8');
  const updated = original
    .replace(/<img\b[^>]*>/gi, (tag) => updateImageTag(tag, file))
    .replace(/<source\b[^>]*>/gi, (tag) => updateSourceTag(tag))
    .replace(/<link\b[^>]*>/gi, (tag) => updateImagePreloadTag(tag, file));
  if (updated !== original) {
    await fs.writeFile(file, updated);
    changedCount += 1;
  }
}

console.log(`Updated ${imageCount} image tags in ${changedCount} source files.`);

function updateImageTag(tag, filePath) {
  let next = tag;
  const srcMatch = next.match(/\ssrc=(["'])(.*?)\1/i);
  const src = srcMatch?.[2] || '';

  if (responsiveSuffixPattern.test(src)) {
    const fullSrc = toFullResolutionSrc(src, filePath);
    if (fullSrc && fullSrc !== src) {
      next = next.replace(/\ssrc=(["'])(.*?)\1/i, ` src=$1${fullSrc}$1`);
    }
  }

  if (/\ssrcset=(["'])(?:(?!\1)[\s\S])*-(?:400w|800w)\.webp(?:(?!\1)[\s\S])*\1/i.test(next)) {
    next = next.replace(/\s+srcset=(["'])(?:(?!\1)[\s\S])*?\1/i, '');
    next = next.replace(/\s+sizes=(["'])(?:(?!\1)[\s\S])*?\1/i, '');
  }

  if (next !== tag) imageCount += 1;
  return next;
}

function updateSourceTag(tag) {
  if (!/-(?:400w|800w)\.webp/i.test(tag)) return tag;
  if (/\smedia=(["'])(?:(?!\1)[\s\S])*?\1/i.test(tag)) return tag;
  imageCount += 1;
  return tag.replace(/^<source\b/i, '<source media="(max-width: 768px)"');
}

function updateImagePreloadTag(tag, filePath) {
  const escaped = tag.includes('\\"');
  const quotedAttr = escaped ? '\\\\?"' : '["\']';
  const relPattern = new RegExp(`\\brel=${quotedAttr}preload${quotedAttr}`, 'i');
  const asPattern = new RegExp(`\\bas=${quotedAttr}image${quotedAttr}`, 'i');
  if (!relPattern.test(tag) || !asPattern.test(tag)) return tag;
  if (!/-(?:400w|800w)\.webp/i.test(tag)) return tag;

  const media = escaped
    ? tag.match(/\smedia=\\?"([^"]+)\\?"/i)?.[1] || ''
    : tag.match(/\smedia=(["'])(.*?)\1/i)?.[2] || '';
  if (/\bmax-width\b/i.test(media) && !/\bmin-width\b/i.test(media)) return tag;

  let next = escaped
    ? tag.replace(/\shref=\\?"([^"\\]+)\\?"/i, (match, href) => {
      const fullHref = responsiveSuffixPattern.test(href) ? toFullResolutionSrc(href, filePath) : href;
      return ` href=\\"${fullHref}\\"`;
    })
    : tag.replace(/\shref=(["'])(.*?)\1/i, (match, quote, href) => {
      const fullHref = responsiveSuffixPattern.test(href) ? toFullResolutionSrc(href, filePath) : href;
      return ` href=${quote}${fullHref}${quote}`;
    });
  next = escaped
    ? next
      .replace(/\s+imagesrcset=\\?"[^"\\]*(?:\\.[^"\\]*)*\\?"/i, '')
      .replace(/\s+imagesizes=\\?"[^"\\]*(?:\\.[^"\\]*)*\\?"/i, '')
    : next
      .replace(/\s+imagesrcset=(["'])(?:(?!\1)[\s\S])*?\1/i, '')
      .replace(/\s+imagesizes=(["'])(?:(?!\1)[\s\S])*?\1/i, '');
  imageCount += 1;
  return next;
}

function toFullResolutionSrc(src, filePath) {
  const stripped = src.replace(/-(?:400w|800w)(\.webp(?:$|[?#]))/i, '$1');
  if (src.includes('{{') || src.includes('{%')) return stripped;

  const localPath = resolveLocalAssetPath(stripped, filePath);
  if (!localPath) return stripped;

  return fsSyncExists(localPath)
    ? stripped
    : bestExistingVariant(stripped, filePath) || stripped;
}

function resolveLocalAssetPath(url, filePath) {
  const cleanUrl = url.split(/[?#]/)[0];
  if (!cleanUrl || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(cleanUrl)) return null;
  if (cleanUrl.startsWith('/')) return path.join(srcDir, cleanUrl.slice(1));
  return path.resolve(path.dirname(filePath), cleanUrl);
}

function bestExistingVariant(strippedSrc, filePath) {
  const localPath = resolveLocalAssetPath(strippedSrc, filePath);
  if (!localPath) return '';

  const parsed = path.parse(localPath);
  let entries = [];
  try {
    entries = fsSyncReaddir(parsed.dir);
  } catch {
    return '';
  }

  const escapedName = escapeRegExp(parsed.name);
  const candidates = entries
    .map((entry) => {
      const match = entry.match(new RegExp(`^${escapedName}-(\\d+)w\\.webp$`, 'i'));
      return match ? { entry, width: Number(match[1]) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.width - a.width);

  if (!candidates.length) return '';
  const best = candidates[0].entry;
  return strippedSrc.replace(/[^/?#]+\.webp(?=$|[?#])/, best);
}

function fsSyncExists(filePath) {
  return fsSync.existsSync(filePath);
}

function fsSyncReaddir(dirPath) {
  return fsSync.readdirSync(dirPath);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function collectFiles(dir, predicate) {
  const result = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...await collectFiles(fullPath, predicate));
      continue;
    }
    if (predicate(fullPath)) result.push(fullPath);
  }
  return result;
}
