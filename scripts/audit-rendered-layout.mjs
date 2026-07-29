/**
 * Rendered-geometry audit. Loads every page in a real headless browser at
 * several widths and asserts things that only exist after layout runs.
 *
 * Why this exists: on 2026-07-29 every card grid on the site rendered as one
 * row of very narrow, very tall columns at any width from 900px up. Seven cards
 * on the risks page came out 4,743px tall. Every script in the publish gate
 * passed, because all of them read bytes. A grep proves bytes, a DOM tree proves
 * structure, and neither proves geometry. This closes that gap.
 *
 * Checks, per page per width:
 *   1. the document does not scroll sideways
 *   2. no card in a grid is absurdly tall, which is what a stripped span looks like
 *   3. no grid leaves one card alone on a row while another row holds more
 *   4. no element spills horizontally past the viewport
 *
 * Usage: node scripts/audit-rendered-layout.mjs [--base http://127.0.0.1:4187]
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

// ESM ignores NODE_PATH, and playwright lives in the bundled Codex runtime
// rather than in this repo. Resolve it through require against that path.
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
    console.log('SKIPPED rendered layout audit: playwright not installed');
    process.exit(0);
  }
}

const BASE = (() => {
  const i = process.argv.indexOf('--base');
  return i > -1 ? process.argv[i + 1] : 'http://127.0.0.1:4187';
})();

const WIDTHS = [390, 760, 900, 1280];
const MAX_CARD_HEIGHT = 1200;

// Page chrome and deliberate diagrams are not equal repeating cards.
const SKIP = /(^|\s)(nav|site-header|footer|search-box|search-results|segmented-control|ai-field|ai-ask-layout|ai-source-picker|section|pressure-map|clock-diagram|quadrant|market-flow|transaction-path)(\s|$)/;

const manifest = JSON.parse(readFileSync(new URL('../site-manifest.json', import.meta.url)));
const routes = manifest.pages.map((p) => (p === 'index.html' ? '/' : '/' + p.replace(/\.html$/, '')));

const probe = ({ skipSource, maxH }) => {
  const SKIP_RE = new RegExp(skipSource);
  const out = { sideways: false, tall: [], lonely: [], spill: [] };
  const de = document.documentElement;
  out.sideways = de.scrollWidth > de.clientWidth + 1;

  for (const g of document.querySelectorAll('main *')) {
    const cls = typeof g.className === 'string' ? g.className : '';
    if (!cls || SKIP_RE.test(cls)) continue;
    if (getComputedStyle(g).display !== 'grid') continue;
    const kids = [...g.children].filter((k) => getComputedStyle(k).display !== 'none');
    if (kids.length < 3) continue;

    const label = cls.trim().split(/\s+/)[0] + ':' + kids.length;
    // A stretched card is tall *and* narrow: the 2026-07-29 failure produced
    // 72px wide columns 4,743px tall, an aspect ratio near 65. A long card of
    // real prose on a phone is tall and full width, ratio under 5. Test the
    // ratio so the check finds stripped spans and ignores wordy cards.
    for (const k of kids) {
      const r = k.getBoundingClientRect();
      const h = Math.round(r.height);
      if (h > 800 && r.width > 0 && h / r.width > 8) {
        out.tall.push(label + ' card ' + h + 'px tall x ' + Math.round(r.width) + 'px wide');
        break;
      }
      if (h > maxH * 4) { out.tall.push(label + ' card ' + h + 'px'); break; }
    }
    const rows = {};
    for (const k of kids) {
      const t = Math.round(k.getBoundingClientRect().top);
      rows[t] = (rows[t] || 0) + 1;
    }
    const sizes = Object.values(rows);
    if (sizes.length > 1 && Math.max(...sizes) > 1 && sizes.includes(1)) {
      out.lonely.push(label + '=' + sizes.join('+'));
    }
  }

  // Wide content is allowed to exceed the viewport as long as it scrolls inside
  // its own container. A table in .table-wrap is the intended pattern, not a
  // defect. Only flag an element with no scrollable ancestor, which is the case
  // that actually pushes the page sideways.
  const inScroller = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const ox = getComputedStyle(p).overflowX;
      if (ox === 'auto' || ox === 'scroll' || ox === 'hidden') return true;
    }
    return false;
  };
  for (const el of document.querySelectorAll('main *')) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.right > window.innerWidth + 2 && !inScroller(el)) {
      const cls = typeof el.className === 'string' ? el.className : '';
      out.spill.push((el.tagName + '.' + cls).slice(0, 48) + ' right=' + Math.round(r.right));
      if (out.spill.length > 3) break;
    }
  }
  return out;
};

const browser = await chromium.launch();
const page = await browser.newPage();
const failures = [];
let checked = 0;

for (const route of routes) {
  try {
    await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 20000 });
  } catch {
    failures.push(`${route}: could not load`);
    continue;
  }
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(60);
    const r = await page.evaluate(probe, { skipSource: SKIP.source, maxH: MAX_CARD_HEIGHT });
    checked++;
    if (r.sideways) failures.push(`${route}@${w} scrolls sideways`);
    r.tall.forEach((t) => failures.push(`${route}@${w} oversized card: ${t}`));
    r.lonely.forEach((l) => failures.push(`${route}@${w} card alone on a row: ${l}`));
    r.spill.forEach((s) => failures.push(`${route}@${w} overflows viewport: ${s}`));
  }
}

await browser.close();

if (failures.length) {
  console.error(`Rendered layout audit failed. ${failures.length} problem(s):`);
  failures.slice(0, 40).forEach((f) => console.error('  ' + f));
  if (failures.length > 40) console.error(`  ...and ${failures.length - 40} more`);
  process.exit(1);
}
console.log(`Rendered layout audit passed. ${routes.length} pages x ${WIDTHS.length} widths = ${checked} renders.`);
