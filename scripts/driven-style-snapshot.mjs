// Computed-style hash snapshot in DRIVEN state: menu opened by real click,
// every <details> opened, every <dialog> shown. Same hashing as the hardened
// snapshot (sorted properties). Serves the given root at fixed port 4498.
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import http from 'node:http';
import { chromium } from 'playwright';

const siteRoot = path.resolve(process.argv[2]);
const outFile = process.argv[3];
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  let fp = path.join(siteRoot, urlPath);
  try { if (statSync(fp).isDirectory()) fp = path.join(fp, 'index.html'); } catch {}
  try { const data = readFileSync(fp); res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' }); res.end(data); }
  catch { res.writeHead(404); res.end('nf'); }
});
await new Promise((r) => server.listen(4498, '127.0.0.1', r));

const htmlFiles = execSync(`cd "${siteRoot}" && grep -rl "styles.css" --include="*.html" . | sort`)
  .toString().trim().split('\n').map((p) => p.replace(/^\.\//, ''));
const browser = await chromium.launch();
const snapshot = {};
for (const file of htmlFiles) {
  for (const width of [390, 1280]) {
    for (const theme of ['dark', 'light']) {
      const key = `${file}|${width}|${theme}`;
      const page = await browser.newPage();
      await page.setViewportSize({ width, height: 1000 });
      await page.route('**/*', (r) => r.request().url().includes('127.0.0.1') ? r.continue() : r.abort());
      try {
        await page.goto('http://127.0.0.1:4498/' + file + '?theme=' + theme, { waitUntil: 'load', timeout: 20000 });
        await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
        await page.waitForTimeout(400);
        const btn = await page.$('.nav-menu-button');
        if (btn) { try { await btn.click({ timeout: 1500 }); } catch {} }
        await page.evaluate(() => {
          document.querySelectorAll('details').forEach((d) => { d.open = true; });
          document.querySelectorAll('dialog').forEach((d) => { try { d.showModal(); } catch {} });
        });
        await page.waitForTimeout(400);
        const data = await page.evaluate(() => {
          function djb2(str) { let h = 5381; for (let i = 0; i < str.length; i++) h = (h * 33) ^ str.charCodeAt(i); return (h >>> 0).toString(36); }
          function sig(el, ps) { const cs = getComputedStyle(el, ps || undefined); const parts = []; for (let i = 0; i < cs.length; i++) parts.push(cs[i] + ':' + cs.getPropertyValue(cs[i]) + ';'); parts.sort(); return parts.join(''); }
          const all = Array.from(document.querySelectorAll('*'));
          return { count: all.length, hashes: all.map((el) => djb2(sig(el)) + '/' + djb2(sig(el, '::before')) + '/' + djb2(sig(el, '::after'))) };
        });
        snapshot[key] = data;
      } catch (e) { snapshot[key] = { error: e.message.slice(0, 120) }; }
      await page.close();
    }
  }
}
await browser.close();
server.close();
writeFileSync(outFile, JSON.stringify({ combos: Object.keys(snapshot).length, totalElements: Object.values(snapshot).reduce((s, v) => s + (v.count || 0), 0), snapshot }));
console.log('wrote', outFile, Object.keys(snapshot).length, 'combos');
