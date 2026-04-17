import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname);
const distDir = path.join(repoRoot, 'dist');
const extractedDir = path.join(distDir, 'css', 'extracted');

await fs.mkdir(extractedDir, { recursive: true });

const htmlFiles = await collectFiles(distDir, (filePath, stats) => stats.isFile() && filePath.endsWith('.html'));

for (const file of htmlFiles) {
  const html = await fs.readFile(file, 'utf8');
  const headMatch = html.match(/<head>([\s\S]*?)<\/head>/i);
  if (!headMatch) continue;

  const rel = path.relative(distDir, file).replace(/\\/g, '/');
  const pageDir = getPageDir(rel);
  let changed = false;
  const extractedBodyLinks = [];

  const replacedHead = await replaceAsync(headMatch[1], /<style(?:[^>]*)>([\s\S]*?)<\/style>/gi, async (_, css) => {
    const linkTag = await emitCssFile(css, pageDir);
    changed = true;
    return linkTag;
  });

  let nextHtml = html.replace(headMatch[0], `<head>${replacedHead}</head>`);

  nextHtml = await replaceAsync(nextHtml, /<style(?:[^>]*)>([\s\S]*?)<\/style>/gi, async (_, css) => {
    extractedBodyLinks.push(await emitCssFile(css, pageDir));
    changed = true;
    return '';
  });

  if (extractedBodyLinks.length) {
    nextHtml = nextHtml.replace('</head>', `${extractedBodyLinks.join('\n')}\n</head>`);
  }

  if (!changed) continue;
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

async function emitCssFile(css, pageDir) {
  const normalizedCss = rewriteRelativeCssUrls(css.trim(), pageDir);
  const hash = crypto.createHash('sha256').update(normalizedCss).digest('hex').slice(0, 16);
  const cssFilename = `${hash}.css`;
  const cssPath = path.join(extractedDir, cssFilename);

  try {
    await fs.access(cssPath);
  } catch {
    await fs.writeFile(cssPath, normalizedCss + '\n', 'utf8');
  }

  return `<link rel="stylesheet" href="/css/extracted/${cssFilename}">`;
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

async function replaceAsync(input, regex, replacer) {
  const matches = Array.from(input.matchAll(regex));
  if (!matches.length) return input;

  let output = '';
  let lastIndex = 0;

  for (const match of matches) {
    const replacement = await replacer(...match);
    output += input.slice(lastIndex, match.index) + replacement;
    lastIndex = match.index + match[0].length;
  }

  output += input.slice(lastIndex);
  return output;
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
