import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getCriticalCssForPage } from './critical-css-presets.mjs';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname);
const distDir = path.join(repoRoot, 'dist');
const extractedDir = path.join(distDir, 'css', 'extracted');

await fs.mkdir(extractedDir, { recursive: true });

const htmlFiles = await collectFiles(distDir, (filePath, stats) => stats.isFile() && filePath.endsWith('.html'));

for (const file of htmlFiles) {
  const html = await fs.readFile(file, 'utf8');
  const rel = path.relative(distDir, file).replace(/\\/g, '/');
  const pageDir = getPageDir(rel);
  const headMatch = html.match(/<head>([\s\S]*?)<\/head>/i);
  if (!headMatch) continue;

  const headContent = headMatch[1];
  const extractedCssChunks = [];
  const fontCssChunks = [];

  const nextHead = headContent.replace(/<style(?:[^>]*)>([\s\S]*?)<\/style>/gi, (_, css) => {
    const { fontCss, restCss } = splitFontFaceCss(css);
    if (fontCss) {
      fontCssChunks.push(fontCss);
    }

    if (hasMeaningfulCss(restCss)) {
      extractedCssChunks.push(rewriteRelativeCssUrls(restCss.trim(), pageDir));
    }

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

  const criticalMarkup = buildCriticalMarkup(rel, html, fontCssChunks);
  const headWithCritical = insertCriticalMarkup(nextHead, criticalMarkup);
  const rebuiltHead = bundleMarkup ? insertBundleMarkup(headWithCritical, bundleMarkup) : headWithCritical;
  const nextHtml = `${html.slice(0, headMatch.index)}<head>${rebuiltHead}</head>${nextBody}`;
  await fs.writeFile(file, nextHtml, 'utf8');
}

function buildCriticalMarkup(rel, html, fontCssChunks) {
  const chunks = [];
  const fontCss = normalizeCss(fontCssChunks.join('\n'));
  const pageCss = normalizeCss(getCriticalCssForPage(rel, html));

  if (fontCss) {
    chunks.push(`<style data-critical="fonts">\n${fontCss}\n</style>`);
  }

  if (pageCss) {
    chunks.push(`<style data-critical="page">\n${pageCss}\n</style>`);
  }

  return chunks.join('\n');
}

function insertCriticalMarkup(headContent, criticalMarkup) {
  if (!criticalMarkup) return headContent;
  const firstScriptIndex = headContent.search(/<script\b/i);
  if (firstScriptIndex !== -1) {
    return `${headContent.slice(0, firstScriptIndex)}${criticalMarkup}\n${headContent.slice(firstScriptIndex)}`;
  }

  return `${headContent}\n${criticalMarkup}`;
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

function splitFontFaceCss(css) {
  const fontRanges = [];
  const fontRulePattern = /@font-face\s*{/gi;
  let match;

  while ((match = fontRulePattern.exec(css))) {
    const start = match.index;
    const openBraceIndex = css.indexOf('{', start);
    const end = findMatchingBrace(css, openBraceIndex);
    if (end === -1) continue;
    fontRanges.push([start, end + 1]);
    fontRulePattern.lastIndex = end + 1;
  }

  if (!fontRanges.length) {
    return { fontCss: '', restCss: css };
  }

  const fontCss = fontRanges.map(([start, end]) => css.slice(start, end)).join('\n');
  let restCss = '';
  let cursor = 0;
  for (const [start, end] of fontRanges) {
    restCss += css.slice(cursor, start);
    cursor = end;
  }
  restCss += css.slice(cursor);

  return { fontCss, restCss };
}

function findMatchingBrace(input, openBraceIndex) {
  if (openBraceIndex === -1) return -1;
  let depth = 0;
  for (let index = openBraceIndex; index < input.length; index += 1) {
    const char = input[index];
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function hasMeaningfulCss(css) {
  return stripCssComments(css).trim().length > 0;
}

function normalizeCss(css) {
  return stripCssComments(css).trim();
}

function stripCssComments(css) {
  return String(css || '').replace(/\/\*[\s\S]*?\*\//g, '');
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
