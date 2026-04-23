import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname);
const distDir = path.join(repoRoot, 'dist');

const failures = [];
const forbiddenFilePatterns = [
  /\.DS_Store$/,
  /\.zip$/,
  /\.py$/,
  /\.claude(\/|$)/,
  /^scripts(\/|$)/
];
const forbiddenTextPatterns = [
  /workers\.dev/i,
  /icy-sunset-af0f/i
];

const allFiles = await collectFiles(distDir, (filePath, stats) => stats.isFile());
for (const file of allFiles) {
  const rel = path.relative(distDir, file).replace(/\\/g, '/');
  if (forbiddenFilePatterns.some((pattern) => pattern.test(rel))) {
    failures.push(`Forbidden deploy artifact in dist: ${rel}`);
  }
}

await checkIcons();
await checkTextFiles(allFiles);
await checkHtmlFiles(allFiles.filter((file) => file.endsWith('.html')));
await checkLocalReferences(allFiles.filter((file) => file.endsWith('.html')));
await checkSitemapAndRedirects();

if (failures.length) {
  console.error(`Site checks failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log('All site checks passed.');

async function checkIcons() {
  const faviconSvg = await fs.readFile(path.join(distDir, 'favicon.svg'), 'utf8');
  if (!faviconSvg.trim().startsWith('<svg')) {
    failures.push('favicon.svg is not a valid SVG asset.');
  }

  const appleTouch = await fs.readFile(path.join(distDir, 'apple-touch-icon.png'));
  const signature = appleTouch.subarray(0, 8).toString('hex');
  if (signature !== '89504e470d0a1a0a') {
    failures.push('apple-touch-icon.png is not a valid PNG asset.');
  }
}

async function checkTextFiles(files) {
  const textExtensions = new Set(['.html', '.xml', '.txt', '.css', '.js', '.svg', '.json']);
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!textExtensions.has(ext)) continue;
    const text = await fs.readFile(file, 'utf8');
    for (const pattern of forbiddenTextPatterns) {
      if (pattern.test(text)) {
        failures.push(`${path.relative(distDir, file).replace(/\\/g, '/')} contains forbidden legacy hostname ${pattern}`);
      }
    }
  }
}

async function checkHtmlFiles(files) {
  for (const file of files) {
    const rel = path.relative(distDir, file).replace(/\\/g, '/');
    const html = await fs.readFile(file, 'utf8');
    const head = capture(html, /<head>([\s\S]*?)<\/head>/i);
    const body = capture(html, /<body[^>]*>([\s\S]*?)<\/body>/i);
    const robots = capture(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["'][^>]*>/i).toLowerCase();
    const canonical = capture(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i);
    const ogUrl = capture(html, /<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["'][^>]*>/i);
    const headStyleCount = (head.match(/<style(?:\s|>)/gi) || []).length;

    if (rel !== '404.html' && rel !== 'datenschutzerklaerung.html') {
      if (!html.includes('/js/tracking-bootstrap.js')) {
        failures.push(`${rel} is missing the centralized tracking bootstrap.`);
      }
    }

    if (canonical && ogUrl && canonical !== ogUrl) {
      failures.push(`${rel} has mismatched canonical and og:url values.`);
    }

    if (rel === '404.html' && !robots.includes('noindex')) {
      failures.push('404.html must remain noindex.');
    }

    if (html.includes('id="contactForm"') && !html.includes('contact-form.js')) {
      failures.push(`${rel} contains a contact form without the form handler script.`);
    }

    if (headStyleCount > 2) {
      failures.push(`${rel} has ${headStyleCount} inline head style blocks; expected at most 2 critical-inline blocks.`);
    }

    if (/<style(?:\s|>)/i.test(body)) {
      failures.push(`${rel} still contains body inline styles instead of bundled CSS files.`);
    }

    checkDesktopFullResolutionImages(rel, html);
  }
}

function checkDesktopFullResolutionImages(rel, html) {
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    const src = capture(tag, /\ssrc=["']([^"']+)["']/i);
    if (src && /-(?:400w|800w)\.webp(?:$|[?#])/i.test(src)) {
      failures.push(`${rel} has desktop image src limited to responsive candidate: ${src}`);
    }

    if (/\ssrcset=["'][^"']+["']/i.test(tag)) {
      failures.push(`${rel} has img srcset; use <source media="(max-width: ...)"> plus full-resolution img src for desktop.`);
    }
  }

  for (const tag of html.match(/<source\b[^>]*>/gi) || []) {
    if (!/-(?:400w|800w)\.webp/i.test(tag)) continue;
    const media = capture(tag, /\smedia=["']([^"']+)["']/i);
    if (!/\bmax-width\b/i.test(media) || /\bmin-width\b/i.test(media)) {
      failures.push(`${rel} has responsive image source without mobile-only media: ${tag.slice(0, 160)}`);
    }
  }

  for (const tag of html.match(/<link\b[^>]*rel=["']preload["'][^>]*as=["']image["'][^>]*>|<link\b[^>]*as=["']image["'][^>]*rel=["']preload["'][^>]*>/gi) || []) {
    if (!/-(?:400w|800w)\.webp/i.test(tag)) continue;
    const media = capture(tag, /\smedia=["']([^"']+)["']/i);
    if (!/\bmax-width\b/i.test(media) || /\bmin-width\b/i.test(media)) {
      failures.push(`${rel} has responsive image preload without mobile-only media: ${tag.slice(0, 160)}`);
    }
  }
}

async function checkLocalReferences(files) {
  for (const file of files) {
    const rel = path.relative(distDir, file).replace(/\\/g, '/');
    const pageDir = path.dirname(rel) === '.' ? '' : `${path.dirname(rel)}/`;
    const html = await fs.readFile(file, 'utf8');
    const urls = [
      ...extractAttributeUrls(html, /\b(?:href|src|poster)=["']([^"']+)["']/gi),
      ...extractSrcsetUrls(html)
    ];

    for (const rawUrl of urls) {
      const url = normalizeLocalUrl(rawUrl);
      if (!url) continue;

      const target = url.startsWith('/')
        ? url.slice(1)
        : path.posix.normalize(pageDir + url);

      if (!await localTargetExists(target)) {
        failures.push(`${rel} references missing local asset/page: ${rawUrl}`);
      }
    }
  }
}

async function checkSitemapAndRedirects() {
  const sitemap = await fs.readFile(path.join(distDir, 'sitemap.xml'), 'utf8');
  const redirectRules = await fs.readFile(path.join(distDir, '_redirects'), 'utf8');
  const redirectTargets = Array.from(redirectRules.matchAll(/^\S+\s+(\/[^\s?#]+)\s+301$/gm)).map((match) => match[1]);
  const sitemapLocs = new Set(Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)).map((match) => match[1]));

  const required = [
    'https://nataliatschischik.com/',
    'https://nataliatschischik.com/portfolio',
    'https://nataliatschischik.com/preise',
    'https://nataliatschischik.com/journal'
  ];

  for (const loc of required) {
    if (!sitemapLocs.has(loc)) failures.push(`Sitemap is missing required location ${loc}`);
  }

  for (const target of redirectTargets) {
    if (target === '/datenschutz' || target === '/impressum') continue;
    const absolute = `https://nataliatschischik.com${target === '/' ? '/' : target}`;
    if (!sitemapLocs.has(absolute) && !target.includes('#')) {
      failures.push(`Redirect target missing from sitemap: ${target}`);
    }
  }
}

function capture(input, regex) {
  const match = input.match(regex);
  return match ? match[1].trim() : '';
}

function extractAttributeUrls(input, regex) {
  return Array.from(input.matchAll(regex), (match) => match[1]);
}

function extractSrcsetUrls(input) {
  const urls = [];
  for (const match of input.matchAll(/\bsrcset=["']([^"']+)["']/gi)) {
    for (const candidate of match[1].split(',')) {
      const url = candidate.trim().split(/\s+/)[0];
      if (url) urls.push(url);
    }
  }
  return urls;
}

function normalizeLocalUrl(rawUrl) {
  if (!rawUrl) return '';
  const url = rawUrl.trim().split(/[?#]/)[0];
  if (!url || url.startsWith('#')) return '';
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url)) return '';
  return url;
}

async function localTargetExists(target) {
  if (target === '..' || target.startsWith('../')) return false;
  if (await existsInDist(target)) return true;
  if (!path.posix.extname(target)) {
    return await existsInDist(`${target}.html`) || await existsInDist(`${target}/index.html`);
  }
  return false;
}

async function existsInDist(relPath) {
  return fs.access(path.join(distDir, relPath)).then(() => true, () => false);
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
