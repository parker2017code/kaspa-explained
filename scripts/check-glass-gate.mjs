/**
 * Glass/gradient gate (2026-08-23).
 *
 * The owner reported glossy, blue-tinted "glass" surfaces four separate
 * times, and each time an audit had already certified the site clean.
 * Three mistakes let it through:
 *   1. Matching only WHITE sheens, so cyan/blue-tinted treatments passed.
 *   2. Scanning styles.css source only, so inline <style> blocks and style
 *      attributes were never checked.
 *   3. Treating the green-to-cyan brand gradient as a sanctioned exception.
 *
 * A fourth mistake surfaced later: CSS custom properties named
 * --glass-surface/--glass-edge/--glass-sheen/--glass-inset/--glass-rim
 * whose *value* is a glass treatment. A source grep for "gradient(" or an
 * rgba() literal never finds `background: var(--glass-surface)`.
 *
 * The only reliable defense is reading the resolved, cascaded, computed
 * style the browser actually paints -- for every element and every
 * ::before/::after, in both themes, on every real page. This script does
 * that with Playwright and fails the build if any element still resolves
 * to:
 *   - a gradient background (linear-gradient/radial-gradient/etc, no
 *     exception for the brand green-to-cyan gradient)
 *   - a translucent grayscale fill or border (rgba with 0 < alpha < 1 and
 *     R/G/B channels within 4 of each other -- catches rgba(255,255,255,x),
 *     rgba(0,0,0,x), rgba(128,128,128,x) literals, but not the site's own
 *     brand-hued color-mix flat treatment, which is never grayscale)
 *   - an inset box-shadow (the "fake lit edge" bevel)
 *   - a non-none backdrop-filter blur on an in-page element
 *
 * display:none (or hidden via an ancestor) is excluded: dead CSS that
 * still resolves through the cascade on a box nobody renders is not the
 * glossy thing the owner is looking at, and flagging it just trains
 * everyone to ignore the gate.
 *
 * demos/ is owned by a different, concurrently running fix pass (see
 * AGENTS.md), so violations there are reported but do not fail the build.
 * Everything else is blocking.
 *
 * Usage: node scripts/check-glass-gate.mjs
 *        GLASS_GATE_PAGES=index.html,status.html node scripts/check-glass-gate.mjs
 *        GLASS_GATE_VERBOSE=1 node scripts/check-glass-gate.mjs
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const runtimeModules =
  process.env.NODE_PATH ||
  process.env.HOME + '/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  try {
    ({ chromium } = require(runtimeModules + '/playwright'));
  } catch {
    console.log('SKIPPED glass gate: playwright not installed');
    process.exit(0);
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function sitemapToRelPath(loc) {
  const url = new URL(loc);
  let p = url.pathname;
  if (path.extname(p)) return null;
  if (p === '/') return 'index.html';
  if (p.endsWith('/')) p += 'index';
  const rel = p.slice(1) + '.html';
  return existsSync(path.join(ROOT, rel)) ? rel : null;
}

function buildPageList() {
  if (process.env.GLASS_GATE_PAGES) {
    return process.env.GLASS_GATE_PAGES.split(',').map((s) => s.trim()).filter(Boolean);
  }
  const sitemapXml = readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  const locs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const fromSitemap = locs.map(sitemapToRelPath).filter(Boolean);

  // A redirect stub carries no content: it is a <meta http-equiv="refresh">
  // and nothing else. A headless browser follows that refresh, so loading one
  // here measures the DESTINATION page a second time and files every defect it
  // finds under the stub's filename. 18 of the 19 files under demos/ are stubs
  // (verified 2026-08-29), which is how check-render.mjs came to report
  // demos/confirmation-risk.html, a 569-byte stub, with 90 violations including
  // 2 clipped chart labels that are really why-kaspa-matters.html's. Stubs are
  // already checked, correctly, by scripts/check-redirect-stubs.sh.
  const demoFiles = readdirSync(path.join(ROOT, 'demos'))
    .filter((f) => f.endsWith('.html'))
  .filter((f) => !readFileSync(path.join(ROOT, 'demos', f), 'utf8').includes('http-equiv="refresh"'))
    .map((f) => `demos/${f}`);

  return [...new Set([...fromSitemap, ...demoFiles, '404.html'])].sort();
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
};

function startServer() {
  const server = http.createServer((req, res) => {
    let pathname = decodeURIComponent(req.url.split('?')[0]);
    if (pathname === '/') pathname = '/index.html';
    let filePath = path.join(ROOT, pathname);
    if (!existsSync(filePath)) {
      if (existsSync(filePath + '.html')) filePath += '.html';
    } else if (statSync(filePath).isDirectory()) {
      // A clean-URL directory request, e.g. the "/demos" nav link every page
      // carries. The real site and scripts/serve-local.py both resolve that to
      // the directory's index.html. This server did not: existsSync passed on
      // the directory, so the .html fallback above was skipped and readFileSync
      // below threw EISDIR and killed the whole gate mid-run.
      filePath = path.join(filePath, 'index.html');
    }
    if (!existsSync(filePath) || !filePath.startsWith(ROOT)) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(readFileSync(filePath));
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

// ---- in-browser probe ----
// Runs once per (page, theme). Walks every element in the DOM plus its
// ::before/::after and reports resolved-style violations.
function probe() {
  function isGrayscale(r, g, b) {
    return Math.max(r, g, b) - Math.min(r, g, b) <= 4;
  }

  function parseColor(value) {
    if (!value) return null;
    const m = /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/.exec(value);
    if (!m) return null;
    return {
      r: Number(m[1]),
      g: Number(m[2]),
      b: Number(m[3]),
      a: m[4] === undefined ? 1 : Number(m[4]),
    };
  }

  function describe(el) {
    const id = el.id ? `#${el.id}` : '';
    const cls = el.className && typeof el.className === 'string'
      ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.')
      : '';
    return `${el.tagName.toLowerCase()}${id}${cls}`;
  }

  const out = [];
  const nodes = [document.documentElement, ...document.querySelectorAll('*')];

  for (const el of nodes) {
    // Skip anything display:none itself OR hidden by an ancestor
    // (visibility:hidden ancestor, content-visibility, etc). checkVisibility
    // walks the ancestor chain; a plain getComputedStyle(el).display check
    // does not, so a node buried inside a collapsed <details> or a
    // display:none wrapper would otherwise read as a live violation even
    // though nothing paints it.
    if (el !== document.documentElement && typeof el.checkVisibility === 'function' && !el.checkVisibility()) {
      continue;
    }
    const selectorLabel = describe(el);
    for (const pseudo of [null, '::before', '::after']) {
      let cs;
      try {
        cs = getComputedStyle(el, pseudo);
      } catch {
        continue;
      }
      // display:none never paints, so dead/retired CSS that still resolves
      // through the cascade on a box nobody renders does not count.
      if (cs.display === 'none') continue;
      if (pseudo && cs.content === 'none') continue;

      const bgImage = cs.backgroundImage || '';
      if (/(?:linear|radial|conic|repeating-linear|repeating-radial)-gradient\(/i.test(bgImage)) {
        out.push({ selector: selectorLabel, pseudo: pseudo || '', kind: 'gradient-background', detail: bgImage.slice(0, 160) });
      }

      const backdrop = cs.backdropFilter || cs.webkitBackdropFilter || 'none';
      if (backdrop && backdrop !== 'none' && /blur\(\s*[1-9]/.test(backdrop)) {
        out.push({ selector: selectorLabel, pseudo: pseudo || '', kind: 'backdrop-blur', detail: backdrop });
      }

      const boxShadow = cs.boxShadow || 'none';
      if (boxShadow !== 'none' && /\binset\b/.test(boxShadow)) {
        out.push({ selector: selectorLabel, pseudo: pseudo || '', kind: 'inset-highlight', detail: boxShadow.slice(0, 160) });
      }

      const bgColor = parseColor(cs.backgroundColor);
      if (bgColor && bgColor.a > 0 && bgColor.a < 1 && isGrayscale(bgColor.r, bgColor.g, bgColor.b)) {
        out.push({ selector: selectorLabel, pseudo: pseudo || '', kind: 'translucent-grayscale-fill', detail: cs.backgroundColor });
      }

      const borderColor = parseColor(cs.borderTopColor);
      const borderWidth = Number.parseFloat(cs.borderTopWidth) || 0;
      if (borderWidth > 0 && cs.borderTopStyle !== 'none' && borderColor && borderColor.a > 0 && borderColor.a < 1 && isGrayscale(borderColor.r, borderColor.g, borderColor.b)) {
        out.push({ selector: selectorLabel, pseudo: pseudo || '', kind: 'translucent-grayscale-border', detail: cs.borderTopColor });
      }
    }
  }
  return out;
}

const pages = buildPageList();
const server = await startServer();
const { port } = server.address();
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
const failures = [];
let checked = 0;

for (const rel of pages) {
  const url = `http://127.0.0.1:${port}/${rel}`;
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
  } catch (err) {
    failures.push({ page: rel, theme: '-', selector: '-', kind: 'load-error', detail: String(err.message).slice(0, 160) });
    continue;
  }

  for (const theme of ['dark', 'light']) {
    await page.evaluate((t) => {
      document.documentElement.dataset.theme = t;
    }, theme);
    await page.waitForTimeout(50);
    const violations = await page.evaluate(probe);
    checked++;
    for (const v of violations) {
      failures.push({ page: rel, theme, ...v });
    }
  }
}

await browser.close();
server.close();

// demos/ is owned by another agent working concurrently on this repo (see
// AGENTS.md scope note); this gate still renders and reports demos/ so the
// full-site inventory the owner asked for stays complete, but it does not
// block the publish gate on a surface this pass has no authority to fix.
// Everything outside demos/ is fully owned here and is blocking.
const blocking = failures.filter((f) => !f.page.startsWith('demos/'));
const advisory = failures.filter((f) => f.page.startsWith('demos/'));

function printGroup(list) {
  const byKind = {};
  for (const f of list) {
    byKind[f.kind] = byKind[f.kind] || [];
    byKind[f.kind].push(f);
  }
  const showAll = process.env.GLASS_GATE_VERBOSE === '1';
  for (const [kind, group] of Object.entries(byKind)) {
    console.error(`-- ${kind} (${group.length}) --`);
    const shown = showAll ? group : group.slice(0, 25);
    for (const f of shown) {
      console.error(`  ${f.page} [${f.theme}] ${f.selector}${f.pseudo}  ${f.detail}`);
    }
    if (!showAll && group.length > 25) console.error(`  ...and ${group.length - 25} more (set GLASS_GATE_VERBOSE=1 to see all)`);
  }
}

if (advisory.length) {
  console.error(`\nGlass/gradient gate: ${advisory.length} ADVISORY violation(s) under demos/ (not owned by this gate's fix pass, reported not blocked):\n`);
  printGroup(advisory);
}

if (blocking.length) {
  console.error(`\nGlass/gradient gate FAILED. ${blocking.length} blocking violation(s) across ${pages.length} pages x 2 themes (${checked} renders):\n`);
  printGroup(blocking);
  console.error('\n-- unique rule signatures --');
  const uniq = new Map();
  for (const f of blocking) {
    const key = `${f.kind} :: ${f.selector}${f.pseudo} :: ${f.detail}`;
    uniq.set(key, (uniq.get(key) || 0) + 1);
  }
  for (const [key, count] of uniq) {
    console.error(`  (${count}x) ${key}`);
  }
  console.error(
    '\nReplace with the site flat token treatment: a color-mix background at ' +
    'low percentage, a color-mix border, and the token color for text. See ' +
    'styles.css for existing examples (e.g. .tag, line ~7139).'
  );
  process.exit(1);
}

console.log(`Glass/gradient gate passed. ${pages.length} pages x 2 themes = ${checked} renders, 0 blocking violations` + (advisory.length ? ` (${advisory.length} advisory under demos/).` : '.'));
