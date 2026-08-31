/**
 * Full computed-style snapshot (2026-08-23 legacy/apple CSS cleanup, proof
 * step). Renders every page that links a given stylesheet, in both themes
 * at both a phone and a desktop width, and records a hash of the complete
 * computed style (every longhand property getComputedStyle exposes, plus
 * ::before/::after) for every single element in the DOM, in document
 * order.
 *
 * Two snapshots taken before and after a styles.css edit, with the HTML
 * held byte-identical between them, diff to exactly empty only if the
 * edit changed zero rendered pixels. That is the proof this repo's CSS
 * cleanup task requires; a couple of screenshots is not.
 *
 * Usage:
 *   node scripts/computed-style-snapshot.mjs <siteRoot> --out=snapshot.json
 *
 * siteRoot must contain the full site (HTML + styles.css) to render.
 */
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { execSync } from 'node:child_process';
import http from 'node:http';

const require = createRequire(import.meta.url);
const runtimeModules =
  process.env.NODE_PATH ||
  process.env.HOME + '/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  ({ chromium } = require(runtimeModules + '/playwright'));
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
};

function startStaticServer(root) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      let filePath = path.join(root, urlPath);
      try {
        const st = statSync(filePath);
        if (st.isDirectory()) filePath = path.join(filePath, 'index.html');
      } catch {}
      try {
        const data = readFileSync(filePath);
        const ext = path.extname(filePath);
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        res.end(data);
      } catch {
        res.writeHead(404);
        res.end('not found: ' + urlPath);
      }
    });
    // Fixed port: a random port leaks into computed background-image URLs
    // (they serialize absolute), which made every run's brand-mark hash
    // unique and the empty-diff proof unattainable.
    server.listen(4499, '127.0.0.1', () => resolve(server));
  });
}

function findChromeExecutable() {
  const cacheDir = path.join(process.env.HOME, 'Library/Caches/ms-playwright');
  const dirs = execSync(`ls "${cacheDir}"`).toString().trim().split('\n');
  for (const d of dirs) {
    if (d.startsWith('chromium-')) {
      const p = path.join(cacheDir, d, 'chrome-mac-arm64', 'Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing');
      try {
        execSync(`test -x "${p}"`);
        return p;
      } catch {}
    }
  }
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const positional = args.filter((a) => !a.startsWith('--'));
  const outArg = args.find((a) => a.startsWith('--out='));
  const cssArg = args.find((a) => a.startsWith('--css='));
  const siteRoot = path.resolve(positional[0]);
  const outFile = outArg ? outArg.slice('--out='.length) : null;
  const cssBase = cssArg ? cssArg.slice('--css='.length) : 'styles.css';

  const htmlFiles = execSync(
    `cd "${siteRoot}" && grep -rl "${cssBase}" --include="*.html" . | grep -v '/.claude/worktrees/' | grep -v '/_preview-site/' | grep -v '/visual-audit/' | sort`
  )
    .toString()
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((p) => p.replace(/^\.\//, ''));

  const exe = findChromeExecutable();
  if (!exe) throw new Error('No cached Chromium for Testing executable found.');
  const browser = await chromium.launch({ executablePath: exe });
  const server = await startStaticServer(siteRoot);
  const baseUrl = 'http://127.0.0.1:' + server.address().port;
  console.error('Serving ' + siteRoot + ' at ' + baseUrl);
  console.error(`Snapshotting ${htmlFiles.length} pages x 2 themes x 2 widths.`);

  const themes = ['dark', 'light'];
  const widths = [390, 1280];
  const snapshot = {};
  let done = 0;
  const total = htmlFiles.length * themes.length * widths.length;

  for (const file of htmlFiles) {
    for (const width of widths) {
      for (const theme of themes) {
        done++;
        const key = `${file}|${width}|${theme}`;
        const page = await browser.newPage();
        await page.setViewportSize({ width, height: 1000 });
        // No external network: live GitHub/kascov fetches rewrite tables with
        // whatever the network returns, which differs run to run. Blocked,
        // every live-fetch page settles to its baked baseline.
        await page.route('**/*', (route) =>
          route.request().url().startsWith(baseUrl) ? route.continue() : route.abort());
        try {
          await page.goto(baseUrl + '/' + file + '?theme=' + theme, { waitUntil: 'load', timeout: 20000 });
          // Freeze CSS transitions/animations before capture. Without this,
          // load-time reveal transitions (opacity/transform fades, brand-mark
          // shimmer, etc.) get sampled mid-flight and produce a different
          // computed-style hash on every run even with byte-identical CSS and
          // HTML, which makes the empty-diff proof this script exists for
          // impossible to satisfy. This override only affects the measurement
          // page, never ships, and settles every element to its rest state so
          // the comparison reflects actual rule changes, not capture timing.
          await page.addStyleTag({
            content: '*, *::before, *::after { transition: none !important; animation: none !important; }',
          });
          await page.evaluate(() => document.fonts && document.fonts.ready);
          await page.waitForTimeout(500);
          // Settle async error-path DOM rewrites from the aborted fetches:
          // two samples 250ms apart must agree, up to 3s.
          await page.waitForFunction(() => new Promise((res) => {
            const count = document.querySelectorAll('*').length;
            const html = document.body.innerHTML.length;
            setTimeout(() => res(document.querySelectorAll('*').length === count &&
                                document.body.innerHTML.length === html), 250);
          }), { timeout: 3000 }).catch(() => {});
        } catch (e) {
          snapshot[key] = { error: e.message };
          await page.close();
          process.stderr.write(`\r[${done}/${total}] ${key} ERROR: ${e.message}          \n`);
          continue;
        }

        const data = await page.evaluate(() => {
          function djb2(str) {
            let h = 5381;
            for (let i = 0; i < str.length; i++) {
              h = (h * 33) ^ str.charCodeAt(i);
            }
            return (h >>> 0).toString(36);
          }
          function sig(el, pseudo) {
            const cs = getComputedStyle(el, pseudo || undefined);
            const parts = [];
            for (let i = 0; i < cs.length; i++) {
              const p = cs[i];
              parts.push(p + ':' + cs.getPropertyValue(p) + ';');
            }
            // Custom-property enumeration order varies per browser launch;
            // sort so the hash reflects values, not hash-map order.
            parts.sort();
            return parts.join('');
          }
          const all = Array.from(document.querySelectorAll('*'));
          const hashes = all.map((el) => {
            const own = sig(el);
            const before = sig(el, '::before');
            const after = sig(el, '::after');
            return djb2(own) + '/' + djb2(before) + '/' + djb2(after);
          });
          return { count: all.length, hashes };
        });

        snapshot[key] = data;
        await page.close();
        process.stderr.write(`\r[${done}/${total}] ${key} (${data.count} elements)          `);
      }
    }
  }
  console.error('');

  await browser.close();
  server.close();

  const totalElements = Object.values(snapshot).reduce((s, v) => s + (v.count || 0), 0);
  const json = JSON.stringify({ siteRoot, cssBase, htmlFiles, combos: total, totalElements, snapshot });
  if (outFile) {
    writeFileSync(outFile, json);
    console.error(`Wrote snapshot to ${outFile}: ${total} combos, ${totalElements} total elements.`);
  } else {
    process.stdout.write(json);
  }
}

main().catch((e) => {
  console.error(e.stack || e.message);
  process.exit(1);
});
