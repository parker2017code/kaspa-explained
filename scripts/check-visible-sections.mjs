/**
 * Per-section prose gate (design/STANDARD.md, "The 300-word surface",
 * decision recorded in HANDOFF.md 2026-08-23).
 *
 * The whole-page 300-word ceiling in scripts/check-visible-words.mjs fits a
 * demo, the homepage, or a routing page: the whole point of those pages is
 * that everything on them is the surface. It does not fit a long-form guide
 * or a reference page, where length is the content, not a defect. Applying
 * the literal 300-word cap to a 3,287-word mining guide would hide ninety
 * percent of it behind a click, which is the inverted disclosure
 * design/STANDARD.md itself bans ("Hiding the primary content ... Cut long
 * primary content instead of burying it").
 *
 * So pages classified as long-form or reference in scripts/essay-pages.json
 * (the "per_section_pages" list) are exempt from the whole-page ceiling and
 * instead held to this rule: no single unbroken run of visible prose runs
 * longer than 300 words without a structural break. A structural break is
 * anything that already gives the reader a place to stop, scan, or skip: a
 * heading (h1-h6), a table, a figure, a details/summary disclosure, a list
 * (ul/ol/dl), or one of the site's own card/grid/view-switch components
 * (identified by class name, read from the live pages rather than guessed --
 * see the BREAK_CLASS_SUFFIXES/BREAK_CLASSES lists below, matched against
 * grid-cards, view-switch, and the *-grid/*-card/*-rail/*-console/*-shelf/
 * table-wrap component families actually used across kaspa-mining.html,
 * build-on-kaspa.html, why-kaspa-matters.html, and the rest of the
 * per-section list).
 *
 * This shares the same rendered-DOM, same-visibility-rules measurement as
 * check-visible-words.mjs (Playwright, checkVisibility/aria-hidden/sr-only
 * clip all handled identically) so the two gates cannot disagree about what
 * "visible" means. Closed <details> content does not count (hidden by the
 * browser). Open <details> content counts as visible, but the <details>
 * element itself is a break, so its content cannot extend a run from
 * outside it, and does not itself get measured as a single giant run either
 * -- it is prose the reader opted into, already behind its own disclosure.
 *
 * Pages NOT in essay-pages.json's per_section_pages list keep the ordinary
 * whole-page 300-word ceiling in check-visible-words.mjs; this script does
 * not touch them.
 *
 * Usage: node scripts/check-visible-sections.mjs
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

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
    console.log('SKIPPED per-section prose check: playwright not installed');
    process.exit(0);
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const RUN_LIMIT = 300;

const essayData = JSON.parse(readFileSync(path.join(ROOT, 'scripts/essay-pages.json')));
const sectionPages = (essayData.per_section_pages || []).map((e) => e.file);

if (sectionPages.length === 0) {
  console.log('Per-section prose check: no pages classified in essay-pages.json per_section_pages. Nothing to check.');
  process.exit(0);
}

// Runs inside the page. Walks the DOM in document order (elements and text
// together, so break elements can reset the run both entering and leaving
// them), tracking the longest run of visible-prose words seen between two
// structural breaks. Mirrors check-visible-words.mjs's visibility rules
// exactly: same SKIP_TAGS, same checkVisibility/aria-hidden/sr-only clip
// exclusions, so a word invisible to one gate is invisible to both.
function measureLongestRun() {
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'SVG', 'NAV', 'HEADER', 'FOOTER', 'TEMPLATE', 'NOSCRIPT']);
  const BREAK_TAGS = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'TABLE', 'FIGURE', 'DETAILS', 'UL', 'OL', 'DL']);
  // Class-name families for the site's own card/grid/view-switch components,
  // read off the actual markup rather than guessed: every *-grid and
  // *-card(s) container across kaspa-mining.html, build-on-kaspa.html,
  // why-kaspa-matters.html, start-here.html, status.html, sources.html and
  // the rest of the per-section pages uses one of these suffixes, plus the
  // exact tokens "grid-cards", "view-switch" and "table-wrap".
  const BREAK_CLASS_EXACT = new Set(['grid-cards', 'table-wrap']);
  const BREAK_CLASS_PREFIX = ['view-switch'];
  const BREAK_CLASS_SUFFIX = ['-grid', '-cards', '-card', '-rail', '-console', '-shelf'];

  function isVisible(el) {
    if (typeof el.checkVisibility === 'function') {
      if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false;
    } else {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false;
    }
    let ancestor = el;
    while (ancestor) {
      if (ancestor.getAttribute && ancestor.getAttribute('aria-hidden') === 'true') return false;
      ancestor = ancestor.parentElement;
    }
    const rect = el.getBoundingClientRect();
    if (rect.width <= 1 && rect.height <= 1) return false; // sr-only clip pattern
    return true;
  }

  function isBreakElement(el) {
    if (BREAK_TAGS.has(el.tagName)) return true;
    const classes = (el.getAttribute('class') || '').split(/\s+/).filter(Boolean);
    for (const c of classes) {
      if (BREAK_CLASS_EXACT.has(c)) return true;
      if (BREAK_CLASS_PREFIX.some((p) => c.startsWith(p))) return true;
      if (BREAK_CLASS_SUFFIX.some((s) => c.endsWith(s))) return true;
    }
    return false;
  }

  let runWords = 0;
  let maxRun = 0;
  let maxRunPreview = '';
  let runPreview = '';

  function flushRun() {
    if (runWords > maxRun) {
      maxRun = runWords;
      maxRunPreview = runPreview.trim().slice(0, 140);
    }
    runWords = 0;
    runPreview = '';
  }

  // suppressed > 0 means we are inside a break element's subtree: its own
  // text does not extend or start a run. Nested breaks are fine; the count
  // just stays suppressed until we exit the outermost one.
  function walk(node, suppressed) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (suppressed > 0) return;
      const text = node.textContent.trim();
      if (!text) return;
      const el = node.parentElement;
      if (!el || !isVisible(el)) return;
      const words = text.split(/\s+/).filter(Boolean);
      runWords += words.length;
      if (runPreview.length < 140) runPreview += (runPreview ? ' ' : '') + text;
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    if (SKIP_TAGS.has(node.tagName)) return;
    if (!isVisible(node)) return;

    const isBreak = isBreakElement(node);
    if (isBreak) flushRun();
    const nextSuppressed = suppressed + (isBreak ? 1 : 0);
    for (const child of node.childNodes) walk(child, nextSuppressed);
    if (isBreak) flushRun();
  }

  walk(document.body, 0);
  flushRun();
  return { maxRun, maxRunPreview };
}

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
const results = [];
const failures = [];

for (const rel of sectionPages) {
  const filePath = path.join(ROOT, rel);
  const url = pathToFileURL(filePath).href;
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 20000 });
  } catch (err) {
    failures.push(`${rel}: could not load (${err.message})`);
    continue;
  }
  await page.waitForTimeout(60);

  const { maxRun, maxRunPreview } = await page.evaluate(measureLongestRun);
  results.push({ page: rel, maxRun, maxRunPreview });
  if (maxRun > RUN_LIMIT) {
    failures.push(
      `${rel}: longest unbroken prose run is ${maxRun} words (limit ${RUN_LIMIT}), starting "${maxRunPreview}..."`
    );
  }
}

await browser.close();

results.sort((a, b) => b.maxRun - a.maxRun);

console.log(`Per-section prose check: ${results.length} long-form/reference page(s) measured ` +
  `(scripts/essay-pages.json, per_section_pages). Longest unbroken run allowed between structural ` +
  `breaks (headings, tables, figures, details, lists, card/grid components): ${RUN_LIMIT} words.\n`);

for (const r of results) {
  const flag = r.maxRun > RUN_LIMIT ? '  OVER' : '';
  console.log(`  ${r.page.padEnd(38)} longest_run=${String(r.maxRun).padStart(5)}${flag}`);
}

if (failures.length) {
  console.error(`\nPer-section prose check failed. ${failures.length} page(s) with a run over ${RUN_LIMIT} words:`);
  failures.forEach((f) => console.error('  ' + f));
  console.error(
    '\nBreak the run up with a heading, a table, a figure, a details/summary disclosure, ' +
    'a list, or one of the site\'s card/grid components -- see design/STANDARD.md, ' +
    '"The 300-word surface."'
  );
  process.exit(1);
}

console.log('\nPer-section prose check: no violations.');
