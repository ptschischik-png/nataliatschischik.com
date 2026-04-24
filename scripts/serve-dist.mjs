import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname);
const distDir = path.join(repoRoot, 'dist');
const port = Number(process.env.PORT || 8081);
const host = process.env.HOST || '127.0.0.1';

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${host}:${port}`);
    const filePath = await resolveDistPath(url.pathname);

    if (!filePath) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    const stats = await fs.stat(filePath);
    res.writeHead(200, {
      'content-type': mimeType(filePath),
      'content-length': stats.size,
      'cache-control': cacheControl(filePath)
    });
    createReadStream(filePath).pipe(res);
  } catch (error) {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    res.end(String(error?.stack || error));
  }
});

server.listen(port, host, () => {
  console.log(`Serving dist at http://${host}:${port}/`);
});

async function resolveDistPath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const candidates = [];

  if (decoded === '/') {
    candidates.push('index.html');
  } else {
    const clean = decoded.replace(/^\/+/, '');
    candidates.push(clean);
    if (!path.extname(clean)) {
      candidates.push(`${clean}.html`, `${clean}/index.html`);
    }
  }

  for (const candidate of candidates) {
    const resolved = path.resolve(distDir, candidate);
    if (!resolved.startsWith(distDir)) continue;
    if (await exists(resolved)) return resolved;
  }

  return '';
}

function mimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  if (ext === '.js') return 'text/javascript; charset=utf-8';
  if (ext === '.avif') return 'image/avif';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.ico') return 'image/x-icon';
  if (ext === '.woff2') return 'font/woff2';
  if (ext === '.xml') return 'application/xml; charset=utf-8';
  if (ext === '.txt') return 'text/plain; charset=utf-8';
  return 'application/octet-stream';
}

function cacheControl(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (['.avif', '.webp', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff2'].includes(ext)) {
    return 'public, max-age=31536000, immutable';
  }
  return 'no-store';
}

function exists(filePath) {
  return fs.access(filePath).then(() => true, () => false);
}
