import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname);
const distDir = path.join(repoRoot, 'dist');
const reportDir = path.join(repoRoot, 'reports');
const chromePath = process.env.CHROME_PATH || '/tmp/pwaudit-browsers/chromium_headless_shell-1217/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const baseUrl = process.env.AUDIT_BASE_URL || 'http://127.0.0.1:4173';
const debugPort = Number(process.env.CHROME_DEBUG_PORT || 9223);
const auditPageFilter = process.env.AUDIT_PAGE || '';

async function main() {
  await fs.mkdir(reportDir, { recursive: true });

  const pages = (await collectFiles(distDir, (filePath) => filePath.endsWith('.html')))
    .map((filePath) => {
      const rel = path.relative(distDir, filePath).replace(/\\/g, '/');
      if (rel === 'index.html') return { rel, urlPath: '/' };
      return { rel, urlPath: `/${rel}` };
    })
    .filter((page) => page.rel !== '404.html')
    .filter((page) => !auditPageFilter || page.rel === auditPageFilter || page.urlPath === auditPageFilter)
    .sort((a, b) => a.urlPath.localeCompare(b.urlPath));

  if (auditPageFilter && pages.length === 0) {
    throw new Error(`No page matched AUDIT_PAGE=${auditPageFilter}`);
  }

  const useExistingChrome = process.env.AUDIT_EXISTING_CHROME === '1';
  let chrome = null;
  let chromeStderr = '';

  if (!useExistingChrome) {
    chrome = spawn(chromePath, [
      `--remote-debugging-port=${debugPort}`,
      '--headless',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-networking',
      '--user-data-dir=/tmp/nt-mobile-audit-chrome',
      'about:blank'
    ], { stdio: ['ignore', 'pipe', 'pipe'] });
    chrome.stderr.on('data', (chunk) => { chromeStderr += chunk.toString(); });
  }

  try {
    await waitForChrome(debugPort, () => chromeStderr);
    const results = [];
    for (const [index, page] of pages.entries()) {
      const result = await auditPage(`${baseUrl}${page.urlPath}`, page.rel);
      results.push(result);
      console.log(`[${index + 1}/${pages.length}] ${page.rel}: LCP ${formatMs(result.metrics.lcp)} | ${formatKb(result.page.totalTransferBytes)} | ${result.page.requestCount} requests`);
    }

    const summary = summarize(results);
    const report = {
      generatedAt: new Date().toISOString(),
      profile: {
        device: 'mobile',
        viewport: '390x844 @ DPR 3',
        userAgent: 'Moto G Power / Chrome mobile emulation',
        network: 'CDP Fast 4G-ish throttling',
        cpuThrottlingRate: 4,
        baseUrl
      },
      summary,
      results
    };

    await fs.writeFile(path.join(reportDir, 'mobile-page-speed-audit.json'), JSON.stringify(report, null, 2) + '\n');
    await fs.writeFile(path.join(reportDir, 'mobile-page-speed-audit.md'), renderMarkdown(report));
    console.log(`\nWrote reports/mobile-page-speed-audit.json and reports/mobile-page-speed-audit.md`);
  } finally {
    if (useExistingChrome) await closeBrowser(debugPort).catch(() => null);
    else if (chrome) chrome.kill('SIGTERM');
  }
}

async function auditPage(url, rel) {
  const target = await createTarget(debugPort, 'about:blank');
  const client = await CdpClient.connect(target.webSocketDebuggerUrl);
  const requests = new Map();

  try {
    await client.send('Network.enable');
    await client.send('Network.setCacheDisabled', { cacheDisabled: true });
    await client.send('Network.clearBrowserCache').catch(() => null);
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Performance.enable');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true,
      screenWidth: 390,
      screenHeight: 844
    });
    await client.send('Emulation.setUserAgentOverride', {
      userAgent: 'Mozilla/5.0 (Linux; Android 11; moto g power) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36'
    });
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 150,
      downloadThroughput: 1.6 * 1024 * 1024 / 8,
      uploadThroughput: 750 * 1024 / 8,
      connectionType: 'cellular4g'
    });
    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await client.send('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        window.__mobileAudit = { cls: 0, lcp: 0, longTasks: [], paints: {} };
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            window.__mobileAudit.paints[entry.name] = entry.startTime;
          }
        }).observe({ type: 'paint', buffered: true });
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const last = entries[entries.length - 1];
          if (last) window.__mobileAudit.lcp = last.startTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!entry.hadRecentInput) window.__mobileAudit.cls += entry.value;
          }
        }).observe({ type: 'layout-shift', buffered: true });
        new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            window.__mobileAudit.longTasks.push({ startTime: entry.startTime, duration: entry.duration });
          }
        }).observe({ type: 'longtask', buffered: true });
      `
    });

    client.on('Network.requestWillBeSent', (event) => {
      requests.set(event.requestId, {
        url: event.request.url,
        method: event.request.method,
        type: event.type,
        status: 0,
        mimeType: '',
        encodedDataLength: 0
      });
    });
    client.on('Network.responseReceived', (event) => {
      const request = requests.get(event.requestId);
      if (!request) return;
      request.status = event.response.status;
      request.mimeType = event.response.mimeType;
    });
    client.on('Network.loadingFinished', (event) => {
      const request = requests.get(event.requestId);
      if (!request) return;
      request.encodedDataLength = event.encodedDataLength || 0;
    });

    const domReadyPromise = waitForEvent(client, 'Page.domContentEventFired', 45000);
    await client.send('Page.navigate', { url });
    await domReadyPromise;
    await delay(9000);

    const evaluated = await client.send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const nav = performance.getEntriesByType('navigation')[0];
        const resources = performance.getEntriesByType('resource').map((entry) => ({
          name: entry.name,
          initiatorType: entry.initiatorType,
          transferSize: entry.transferSize || 0,
          encodedBodySize: entry.encodedBodySize || 0,
          decodedBodySize: entry.decodedBodySize || 0,
          duration: entry.duration || 0,
          startTime: entry.startTime || 0
        }));
        const audit = window.__mobileAudit || {};
        return {
          title: document.title,
          nav: nav ? {
            domContentLoaded: nav.domContentLoadedEventEnd,
            load: nav.loadEventEnd,
            responseEnd: nav.responseEnd,
            transferSize: nav.transferSize || 0,
            encodedBodySize: nav.encodedBodySize || 0
          } : {},
          audit,
          resources,
          documentElement: {
            scrollHeight: document.documentElement.scrollHeight,
            bodyTextLength: document.body ? document.body.innerText.length : 0
          }
        };
      })()`
    });

    const value = evaluated.result.value;
    const resources = value.resources || [];
    const networkRequests = Array.from(requests.values()).filter((request) => request.url.startsWith(baseUrl));
    const totalTransferBytes = sum(networkRequests.map((request) => request.encodedDataLength)) || sum(resources.map((resource) => resource.transferSize || resource.encodedBodySize));
    const imageBytes = sum(networkRequests.filter((request) => request.mimeType.startsWith('image/')).map((request) => request.encodedDataLength));
    const cssBytes = sum(networkRequests.filter((request) => request.mimeType.includes('css')).map((request) => request.encodedDataLength));
    const jsBytes = sum(networkRequests.filter((request) => request.mimeType.includes('javascript')).map((request) => request.encodedDataLength));
    const largestResources = networkRequests
      .filter((request) => request.encodedDataLength > 0)
      .sort((a, b) => b.encodedDataLength - a.encodedDataLength)
      .slice(0, 8)
      .map((request) => ({
        url: request.url.replace(baseUrl, ''),
        type: request.type,
        mimeType: request.mimeType,
        bytes: request.encodedDataLength
      }));

    const longTasks = value.audit.longTasks || [];
    const metrics = {
      fcp: value.audit.paints?.['first-contentful-paint'] || 0,
      lcp: value.audit.lcp || 0,
      cls: value.audit.cls || 0,
      domContentLoaded: value.nav.domContentLoaded || 0,
      load: value.nav.load || 0,
      longTaskCount: longTasks.length,
      totalLongTaskMs: sum(longTasks.map((task) => task.duration))
    };

    return {
      rel,
      url,
      title: value.title,
      metrics,
      page: {
        requestCount: networkRequests.length,
        totalTransferBytes,
        imageBytes,
        cssBytes,
        jsBytes,
        htmlBytes: value.nav.transferSize || value.nav.encodedBodySize || 0,
        largestResources,
        scrollHeight: value.documentElement.scrollHeight,
        bodyTextLength: value.documentElement.bodyTextLength
      },
      grades: grade(metrics, totalTransferBytes)
    };
  } finally {
    await client.close();
    await closeTarget(debugPort, target.id);
  }
}

function summarize(results) {
  const byLcp = [...results].sort((a, b) => b.metrics.lcp - a.metrics.lcp);
  const byBytes = [...results].sort((a, b) => b.page.totalTransferBytes - a.page.totalTransferBytes);
  const byCls = [...results].sort((a, b) => b.metrics.cls - a.metrics.cls);
  return {
    pageCount: results.length,
    medianLcp: percentile(results.map((r) => r.metrics.lcp), 0.5),
    p75Lcp: percentile(results.map((r) => r.metrics.lcp), 0.75),
    medianTransferBytes: percentile(results.map((r) => r.page.totalTransferBytes), 0.5),
    p75TransferBytes: percentile(results.map((r) => r.page.totalTransferBytes), 0.75),
    worstLcp: byLcp.slice(0, 10).map(summaryRow),
    heaviestPages: byBytes.slice(0, 10).map(summaryRow),
    worstCls: byCls.slice(0, 10).map(summaryRow)
  };
}

function summaryRow(result) {
  return {
    rel: result.rel,
    lcp: Math.round(result.metrics.lcp),
    fcp: Math.round(result.metrics.fcp),
    cls: Number(result.metrics.cls.toFixed(3)),
    transferBytes: result.page.totalTransferBytes,
    requestCount: result.page.requestCount
  };
}

function grade(metrics, totalTransferBytes) {
  return {
    lcp: metrics.lcp <= 2500 ? 'good' : metrics.lcp <= 4000 ? 'needs-improvement' : 'poor',
    cls: metrics.cls <= 0.1 ? 'good' : metrics.cls <= 0.25 ? 'needs-improvement' : 'poor',
    transfer: totalTransferBytes <= 1_000_000 ? 'good' : totalTransferBytes <= 2_000_000 ? 'needs-improvement' : 'poor'
  };
}

function renderMarkdown(report) {
  const lines = [
    '# Mobile Page-Speed Audit',
    '',
    `Generated: ${report.generatedAt}`,
    `Pages audited: ${report.summary.pageCount}`,
    `Profile: ${report.profile.viewport}, CPU x${report.profile.cpuThrottlingRate}, ${report.profile.network}`,
    '',
    '## Summary',
    '',
    `- Median LCP: ${formatMs(report.summary.medianLcp)}`,
    `- P75 LCP: ${formatMs(report.summary.p75Lcp)}`,
    `- Median transfer: ${formatKb(report.summary.medianTransferBytes)}`,
    `- P75 transfer: ${formatKb(report.summary.p75TransferBytes)}`,
    '',
    '## Worst LCP',
    '',
    table(report.summary.worstLcp),
    '',
    '## Heaviest Pages',
    '',
    table(report.summary.heaviestPages),
    '',
    '## Worst CLS',
    '',
    table(report.summary.worstCls),
    '',
    '## All Pages',
    '',
    table(report.results.map(summaryRow)),
    ''
  ];
  return lines.join('\n');
}

function table(rows) {
  const body = rows.map((row) => `| ${row.rel} | ${formatMs(row.lcp)} | ${formatMs(row.fcp)} | ${row.cls.toFixed(3)} | ${formatKb(row.transferBytes)} | ${row.requestCount} |`);
  return ['| Page | LCP | FCP | CLS | Transfer | Requests |', '|---|---:|---:|---:|---:|---:|', ...body].join('\n');
}

async function createTarget(port, url) {
  return requestJson(port, `/json/new?${encodeURIComponent(url)}`, 'PUT');
}

async function closeTarget(port, id) {
  await requestJson(port, `/json/close/${id}`).catch(() => null);
}

async function closeBrowser(port) {
  const version = await requestJson(port, '/json/version');
  const client = await CdpClient.connect(version.webSocketDebuggerUrl);
  await client.send('Browser.close').catch(() => null);
  client.close();
}

async function waitForChrome(port, getStderr) {
  const started = Date.now();
  while (Date.now() - started < 10000) {
    try {
      await requestJson(port, '/json/version');
      return;
    } catch {
      await delay(100);
    }
  }
  throw new Error(`Chrome DevTools endpoint did not become available.\n${getStderr ? getStderr() : ''}`);
}

function requestJson(port, endpoint, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port, path: endpoint, method }, (res) => {
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

function sum(values) {
  return values.reduce((total, value) => total + (Number(value) || 0), 0);
}

function percentile(values, p) {
  const sorted = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

function formatMs(value) {
  return `${Math.round(value)}ms`;
}

function formatKb(value) {
  return `${Math.round(value / 1024)}KB`;
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
