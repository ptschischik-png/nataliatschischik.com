import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname);
const distDir = path.join(repoRoot, 'dist');
const srcDir = path.join(repoRoot, 'src');
const sitemapData = JSON.parse(await fs.readFile(path.join(srcDir, '_data', 'sitemap-meta.json'), 'utf8'));
const htmlFiles = await collectFiles(distDir, (filePath, stats) => stats.isFile() && filePath.endsWith('.html'));
const entries = [];

for (const file of htmlFiles) {
  const rel = path.relative(distDir, file).replace(/\\/g, '/');
  if (rel === '404.html' || rel === 'datenschutzerklaerung.html') continue;

  const html = await fs.readFile(file, 'utf8');
  const canonical = capture(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i);
  const robots = (capture(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["'][^>]*>/i) || 'index, follow').toLowerCase();
  if (!canonical || robots.includes('noindex')) continue;

  const meta = sitemapData[canonical] || {};
  const stats = await fs.stat(file);
  const lastmod = new Date(stats.mtimeMs).toISOString().slice(0, 10);
  entries.push({
    canonical,
    lastmod,
    changefreq: meta.changefreq || inferChangefreq(canonical),
    priority: meta.priority || inferPriority(canonical),
    images: Array.isArray(meta.images) ? meta.images : []
  });
}

entries.sort((a, b) => a.canonical.localeCompare(b.canonical));

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
  ...entries.map(renderEntry),
  '</urlset>'
].join('\n');

await fs.writeFile(path.join(distDir, 'sitemap.xml'), xml + '\n', 'utf8');

function renderEntry(entry) {
  const lines = [
    '  <url>',
    `    <loc>${escapeXml(entry.canonical)}</loc>`,
    `    <lastmod>${entry.lastmod}</lastmod>`,
    `    <changefreq>${entry.changefreq}</changefreq>`,
    `    <priority>${entry.priority}</priority>`
  ];

  for (const image of entry.images) {
    lines.push('    <image:image>');
    lines.push(`      <image:loc>${escapeXml(image.loc)}</image:loc>`);
    if (image.caption) lines.push(`      <image:caption>${escapeXml(image.caption)}</image:caption>`);
    lines.push('    </image:image>');
  }

  lines.push('  </url>');
  return lines.join('\n');
}

function inferChangefreq(canonical) {
  if (canonical === 'https://nataliatschischik.com/') return 'weekly';
  if (canonical.includes('/journal') || canonical.includes('/portfolio')) return 'weekly';
  if (canonical.includes('/reportagen/')) return 'monthly';
  return 'monthly';
}

function inferPriority(canonical) {
  if (canonical === 'https://nataliatschischik.com/') return '1.0';
  if (canonical.endsWith('/portfolio') || canonical.endsWith('/preise')) return '0.9';
  if (canonical.includes('/reportagen/')) return '0.8';
  if (canonical.includes('/journal/')) return '0.6';
  if (canonical.endsWith('/journal')) return '0.7';
  if (canonical.endsWith('/impressum') || canonical.endsWith('/datenschutz')) return '0.2';
  return '0.7';
}

function capture(input, regex) {
  const match = input.match(regex);
  return match ? match[1].trim() : '';
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
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
