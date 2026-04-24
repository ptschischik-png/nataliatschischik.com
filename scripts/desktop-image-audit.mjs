import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname);
const distDir = path.join(repoRoot, 'dist');
const reportDir = path.join(repoRoot, 'reports');
const chromePath = process.env.CHROME_PATH || '/tmp/pwaudit-browsers/chromium_headless_shell-1217/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const baseUrl = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:4183';
const debugPort = Number(process.env.CHROME_DEBUG_PORT || 9233);
const port = Number(new URL(baseUrl).port || 4183);
const responsiveVariantPattern = /-(?:400w|800w|1200w)\.(?:webp|avif)(?:$|[?#])/i;

async function main() {
  await fs.mkdir(reportDir, { recursive: true });
  const pages = (await collectFiles(distDir, (filePath) => filePath.endsWith('.html')))
    .map((filePath) => {
      const rel = path.relative(distDir, filePath).replace(/\\/g, '/');
      return { rel, urlPath: rel === 'index.html' ? '/' : `/${rel}` };
    })
    .sort((a, b) => a.urlPath.localeCompare(b.urlPath));

  const server = await startStaticServer(port);
  const chrome = spawn(chromePath, [
    `--remote-debugging-port=${debugPort}`,
    '--headless',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--user-data-dir=/tmp/nt-desktop-image-audit-chrome',
    'about:blank'
  ], { stdio: ['ignore', 'pipe', 'pipe'] });
  let chromeStderr = '';
  chrome.stderr.on('data', (chunk) => { chromeStderr += chunk.toString(); });

  const results = [];
  try {
    await waitForChrome(debugPort, () => chromeStderr);

    for (const [index, page] of pages.entries()) {
      const result = await auditPage(`${baseUrl}${page.urlPath}`, page.rel);
      results.push(result);
      const status = result.failures.length ? 'FAIL' : 'OK';
      console.log(`[${index + 1}/${pages.length}] ${status} ${page.rel} (${result.imageRequestCount} image requests)`);
      for (const failure of result.failures) console.log(`  - ${failure}`);
    }
  } finally {
    await closeBrowser(debugPort).catch(() => null);
    chrome.kill('SIGTERM');
    await new Promise((resolve) => server.close(resolve));
  }

  const report = {
    generatedAt: new Date().toISOString(),
    profile: {
      device: 'desktop',
      viewport: '1440x1000 @ DPR 1',
      baseUrl
    },
    summary: {
      pageCount: results.length,
      failedPages: results.filter((result) => result.failures.length).map((result) => result.rel)
    },
    results
  };
  await fs.writeFile(path.join(reportDir, 'desktop-image-audit.json'), JSON.stringify(report, null, 2) + '\n');

  if (report.summary.failedPages.length) {
    throw new Error(`Desktop image audit failed for ${report.summary.failedPages.length} page(s).`);
  }

  console.log(`\nDesktop image audit passed for ${results.length} pages.`);
  console.log('Wrote reports/desktop-image-audit.json');
}

async function auditPage(url, rel) {
  const target = await createTarget(debugPort, 'about:blank');
  const client = await CdpClient.connect(target.webSocketDebuggerUrl);
  const imageRequests = [];

  try {
    await client.send('Network.enable');
    await client.send('Network.setCacheDisabled', { cacheDisabled: true });
    await client.send('Network.clearBrowserCache').catch(() => null);
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: false,
      screenWidth: 1440,
      screenHeight: 1000
    });

    client.on('Network.responseReceived', (event) => {
      if (event.type !== 'Image' && !event.response.mimeType.startsWith('image/')) return;
      if (!event.response.url.startsWith(baseUrl)) return;
      imageRequests.push(event.response.url.replace(baseUrl, ''));
    });

    const loaded = waitForEvent(client, 'Page.loadEventFired', 45000);
    await client.send('Page.navigate', { url });
    await loaded;
    await scrollThroughPage(client);
    await delay(500);

    const evaluated = await client.send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const images = Array.from(document.images).map((img) => ({
          src: img.getAttribute('src') || '',
          currentSrc: img.currentSrc || '',
          srcset: img.getAttribute('srcset') || '',
          dataSrc: img.getAttribute('data-src') || '',
          dataSrcset: img.getAttribute('data-srcset') || ''
        }));
        const html = document.documentElement.outerHTML;
        return {
          images,
          dynamicImgSrcset: /\\bimg\\.setAttribute\\(\\s*["']srcset["']|\\bimg\\.srcset\\s*=/.test(html)
        };
      })()`
    });

    const failures = [];
    const badRequests = unique(imageRequests.filter((request) => responsiveVariantPattern.test(request)));
    if (badRequests.length) {
      failures.push(`desktop requested responsive image candidates: ${badRequests.join(', ')}`);
    }

    for (const image of evaluated.result.value.images) {
      if (responsiveVariantPattern.test(image.currentSrc || image.src)) {
        failures.push(`desktop currentSrc is responsive candidate: ${image.currentSrc || image.src}`);
      }
      if (image.srcset) {
        failures.push(`img has srcset: ${image.src}`);
      }
      if (responsiveVariantPattern.test(image.dataSrc)) {
        failures.push(`img data-src is responsive candidate: ${image.dataSrc}`);
      }
      if (responsiveVariantPattern.test(image.dataSrcset)) {
        failures.push(`img data-srcset contains responsive candidates: ${image.dataSrcset}`);
      }
    }

    if (evaluated.result.value.dynamicImgSrcset) {
      failures.push('page script dynamically sets img srcset');
    }

    return {
      rel,
      url,
      imageRequestCount: imageRequests.length,
      responsiveImageRequests: badRequests,
      failures: unique(failures)
    };
  } finally {
    await client.close();
    await closeTarget(debugPort, target.id);
  }
}

async function scrollThroughPage(client) {
  const heightResult = await client.send('Runtime.evaluate', {
    returnByValue: true,
    expression: 'Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0)'
  });
  const scrollHeight = Number(heightResult.result.value) || 0;
  for (let y = 0; y <= scrollHeight + 1000; y += 900) {
    await client.send('Runtime.evaluate', { expression: `window.scrollTo(0, ${y})` });
    await delay(80);
  }
  await client.send('Runtime.evaluate', { expression: 'window.scrollTo(0, 0)' });
}

function startStaticServer(serverPort) {
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || '/', `http://127.0.0.1:${serverPort}`);
      const filePath = await resolveDistPath(url.pathname);
      if (!filePath) {
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        res.end('Not found');
        return;
      }
      const body = await fs.readFile(filePath);
      res.writeHead(200, {
        'content-type': mimeType(filePath),
        'cache-control': 'no-store'
      });
      res.end(body);
    } catch (error) {
      res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      res.end(String(error?.stack || error));
    }
  });
  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(serverPort, '127.0.0.1', () => resolve(server));
  });
}

async function resolveDistPath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const candidates = [];
  if (decoded === '/') candidates.push('index.html');
  else {
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
  if (ext === '.webp') return 'image/webp';
  if (ext === '.avif') return 'image/avif';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.woff2') return 'font/woff2';
  return 'application/octet-stream';
}

function exists(filePath) {
  return fs.access(filePath).then(() => true, () => false);
}

async function createTarget(cdpPort, url) {
  return requestJson(cdpPort, `/json/new?${encodeURIComponent(url)}`, 'PUT');
}

async function closeTarget(cdpPort, id) {
  await requestJson(cdpPort, `/json/close/${id}`).catch(() => null);
}

async function closeBrowser(cdpPort) {
  const version = await requestJson(cdpPort, '/json/version');
  const client = await CdpClient.connect(version.webSocketDebuggerUrl);
  await client.send('Browser.close').catch(() => null);
  client.close();
}

async function waitForChrome(cdpPort, getStderr) {
  const started = Date.now();
  while (Date.now() - started < 10000) {
    try {
      await requestJson(cdpPort, '/json/version');
      return;
    } catch {
      await delay(100);
    }
  }
  throw new Error(`Chrome DevTools endpoint did not become available.\n${getStderr ? getStderr() : ''}`);
}

function requestJson(cdpPort, endpoint, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port: cdpPort, path: endpoint, method }, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function CdpClient(ws) {
  this.ws = ws;
  this.nextId = 1;
  this.pending = new Map();
  this.listeners = new Map();
  ws.addEventListener('message', (event) => this.handleMessage(event.data));
}

CdpClient.connect = async function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  return new CdpClient(ws);
};

CdpClient.prototype.send = function send(method, params = {}) {
  const id = this.nextId++;
  this.ws.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => {
    this.pending.set(id, { resolve, reject });
  });
};

CdpClient.prototype.on = function on(method, callback) {
  if (!this.listeners.has(method)) this.listeners.set(method, []);
  this.listeners.get(method).push(callback);
};

CdpClient.prototype.handleMessage = function handleMessage(data) {
  const message = JSON.parse(data);
  if (message.id && this.pending.has(message.id)) {
    const pending = this.pending.get(message.id);
    this.pending.delete(message.id);
    if (message.error) pending.reject(new Error(message.error.message || JSON.stringify(message.error)));
    else pending.resolve(message.result || {});
    return;
  }
  if (message.method && this.listeners.has(message.method)) {
    for (const callback of this.listeners.get(message.method)) callback(message.params || {});
  }
};

CdpClient.prototype.close = function close() {
  this.ws.close();
};

function waitForEvent(client, method, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out waiting for ${method}`)), timeoutMs);
    client.on(method, (payload) => {
      clearTimeout(timer);
      resolve(payload);
    });
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function unique(values) {
  return [...new Set(values)];
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

await main();
