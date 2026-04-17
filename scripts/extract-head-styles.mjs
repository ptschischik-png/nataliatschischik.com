import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname);
const distDir = path.join(repoRoot, 'dist');
const extractedDir = path.join(distDir, 'css', 'extracted');
const MAX_INLINE_HEAD_STYLES = 2;

await fs.mkdir(extractedDir, { recursive: true });

const htmlFiles = await collectFiles(distDir, (filePath, stats) => stats.isFile() && filePath.endsWith('.html'));

for (const file of htmlFiles) {
  const html = await fs.readFile(file, 'utf8');
  const rel = path.relative(distDir, file).replace(/\\/g, '/');
  const pageDir = getPageDir(rel);
  const headMatch = html.match(/<head>([\s\S]*?)<\/head>/i);
  if (!headMatch) continue;

  const headContent = headMatch[1];
  const headStyleMatches = Array.from(headContent.matchAll(/<style(?:[^>]*)>([\s\S]*?)<\/style>/gi));
  const extractedCssChunks = [];

  let headStyleIndex = 0;
  const nextHead = headContent.replace(/<style(?:[^>]*)>([\s\S]*?)<\/style>/gi, (_, css) => {
    headStyleIndex += 1;
    if (headStyleIndex <= MAX_INLINE_HEAD_STYLES) {
      return `<style>${css}</style>`;
    }
    extractedCssChunks.push(rewriteRelativeCssUrls(css.trim(), pageDir));
    return '';
  });

  const bodyOnly = html.slice(headMatch.index + headMatch[0].length);
  const nextBody = bodyOnly.replace(/<style(?:[^>]*)>([\s\S]*?)<\/style>/gi, (_, css) => {
    extractedCssChunks.push(rewriteRelativeCssUrls(css.trim(), pageDir));
    return '';
  });

  let bundleMarkup = '';
  if (extractedCssChunks.length) {
    const href = await emitCssBundle(extractedCssChunks);
    bundleMarkup = [
      `<link rel="preload" as="style" href="${href}">`,
      `<link rel="stylesheet" href="${href}" media="print" onload="this.media='all'">`,
      `<noscript><link rel="stylesheet" href="${href}"></noscript>`
    ].join('\n');
  }

  const rebuiltHead = bundleMarkup ? insertBundleMarkup(nextHead, bundleMarkup) : nextHead;
  const nextHtml = `${html.slice(0, headMatch.index)}<head>${rebuiltHead}</head>${nextBody}`;
  await fs.writeFile(file, nextHtml, 'utf8');
}

function getPageDir(relPath) {
  const clean = relPath.replace(/index\.html$/, '').replace(/[^/]+$/, '');
  const withLeadingSlash = `/${clean}`.replace(/\/+/g, '/');
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

function rewriteRelativeCssUrls(css, pageDir) {
  return css.replace(/url\((['"]?)([^'")]+)\1\)/g, (full, quote, rawUrl) => {
    const value = rawUrl.trim();
    if (!value || isAbsoluteUrl(value)) return full;
    const absolutePath = path.posix.normalize(path.posix.join(pageDir, value));
    return `url(${quote}${absolutePath}${quote})`;
  });
}

function insertBundleMarkup(headContent, bundleMarkup) {
  const scriptIndex = headContent.search(/<script\b/i);
  if (scriptIndex === -1) return `${headContent}\n${bundleMarkup}`;
  return `${headContent.slice(0, scriptIndex)}${bundleMarkup}\n${headContent.slice(scriptIndex)}`;
}

async function emitCssBundle(chunks) {
  const normalizedCss = chunks.join('\n\n').trim();
  const hash = crypto.createHash('sha256').update(normalizedCss).digest('hex').slice(0, 16);
  const cssFilename = `${hash}.css`;
  const cssPath = path.join(extractedDir, cssFilename);

  try {
    await fs.access(cssPath);
  } catch {
    await fs.writeFile(cssPath, normalizedCss + '\n', 'utf8');
  }

  return `/css/extracted/${cssFilename}`;
}

function isAbsoluteUrl(value) {
  return (
    value.startsWith('/') ||
    value.startsWith('data:') ||
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('//') ||
    value.startsWith('#')
  );
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

    const stats = await fs.stat(fullPath);
    if (predicate(fullPath, stats)) result.push(fullPath);
  }

  return result;
}
