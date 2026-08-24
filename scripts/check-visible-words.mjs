/**
 * Visible-word ceiling gate (design/STANDARD.md, "The 300-word surface",
 * 2026-08-23).
 *
 * No page shows more than 300 visible words. "Visible" means what a reader
 * sees without opening or hovering anything: content inside a closed
 * <details>, an info panel that starts hidden, a tooltip, or anything else
 * not rendered on load does not count; content inside an already-open
 * <details> does count. Source-text word counts cannot tell an open
 * <details> from a closed one (both are the same markup), so this loads
 * every page in a real browser and counts words the way
 * scripts/check-heading-link-color.mjs already reads computed style: from
 * the rendered DOM, not the HTML source. It shares that Playwright
 * rendering harness rather than inventing a second one.
 *
 * The exemption logic (which pages are personal essays, and what ceiling
 * they get instead of 300) is read from scripts/essay-pages.json, the same
 * file scripts/check-density.sh and scripts/audit-content-flow.mjs already
 * read, so the three gates cannot drift on which pages count as an essay.
 * An essay's ceiling mirrors audit-content-flow.mjs exactly: 4,000 words if
 * extended_word_limit is true, 2,400 otherwise (its normal, pre-existing
 * total-word ceiling) -- essays are exempt from the 300-word surface rule,
 * not exempt from every word limit.
 *
 * Usage: node scripts/check-visible-words.mjs
 */
import { readFileSync, readdirSync } from 'node:fs';
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
    console.log('SKIPPED visible-words check: playwright not installed');
    process.exit(0);
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SURFACE_LIMIT = 300;
const ESSAY_LIMIT_EXTENDED = 4000; // mirrors essayPageWordLimit in audit-content-flow.mjs
const ESSAY_LIMIT_NORMAL = 2400; // mirrors normalPageWordLimit in audit-content-flow.mjs

const manifest = JSON.parse(readFileSync(path.join(ROOT, 'site-manifest.json')));
const essayEntries = JSON.parse(readFileSync(path.join(ROOT, 'scripts/essay-pages.json'))).essays;
const essayLimits = new Map(
  essayEntries.map((e) => [e.file, e.extended_word_limit ? ESSAY_LIMIT_EXTENDED : ESSAY_LIMIT_NORMAL])
);

// Long-form and reference pages (design/STANDARD.md, "The 300-word surface",
// decision recorded in HANDOFF.md 2026-08-23): held to a per-section rule
// instead of this whole-page ceiling. scripts/check-visible-sections.mjs
// checks them (no unbroken prose run over 300 words between structural
// breaks); this script skips them entirely rather than also enforcing the
// whole-page total, so the two gates cannot disagree about the same page.
const essayModule = JSON.parse(readFileSync(path.join(ROOT, 'scripts/essay-pages.json')));
const sectionPages = new Set((essayModule.per_section_pages || []).map((e) => e.file));

const demoFiles = readdirSync(path.join(ROOT, 'demos'))
  .filter((f) => f.endsWith('.html'))
  .map((f) => `demos/${f}`)
  .sort();

// A redirect stub has no visible-word surface to measure, and loading one
// navigates the page out from under page.evaluate, which crashes the run with
// "Execution context was destroyed". Every demo became a stub when the demos
// were inlined into their topic pages on 23 August 2026, so this filter is the
// difference between a working gate and a gate that cannot start.
const isRedirectStub = (rel) => {
  try {
    return /http-equiv=["']refresh["']/i.test(readFileSync(path.join(ROOT, rel), 'utf8'));
  } catch {
    return false;
  }
};

const pages = [...new Set([...manifest.pages, ...demoFiles])].filter(
  (rel) => !isRedirectStub(rel)
);

// Runs inside the page. Counts words in text nodes that are actually
// rendered: not inside script/style/svg/nav/header/footer (site chrome and
// non-content, same exclusion set as scripts/check-density.sh), not hidden
// by display/visibility/opacity (covers closed <details>, hidden info
// panels, and hover/focus-only tooltips), not under aria-hidden="true", and
// not clipped to a 1x1 box (the site's .sr-only / .visually-hidden pattern).
function countVisibleWords() {
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'SVG', 'NAV', 'HEADER', 'FOOTER', 'TEMPLATE', 'NOSCRIPT']);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      let el = node.parentElement;
      while (el) {
        if (SKIP_TAGS.has(el.tagName)) return NodeFilter.FILTER_REJECT;
        el = el.parentElement;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let words = 0;
  const samples = [];
  let node;
  while ((node = walker.nextNode())) {
    const text = node.textContent.trim();
    if (!text) continue;
    const el = node.parentElement;
    if (!el) continue;

    if (typeof el.checkVisibility === 'function') {
      if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
    } else {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') continue;
    }

    let ancestor = el;
    let ariaHidden = false;
    while (ancestor) {
      if (ancestor.getAttribute && ancestor.getAttribute('aria-hidden') === 'true') {
        ariaHidden = true;
        break;
      }
      ancestor = ancestor.parentElement;
    }
    if (ariaHidden) continue;

    const rect = el.getBoundingClientRect();
    if (rect.width <= 1 && rect.height <= 1) continue; // clip-based sr-only pattern

    const count = text.split(/\s+/).filter(Boolean).length;
    words += count;
    if (samples.length < 12) samples.push(text.slice(0, 80));
  }
  return { words, samples };
}

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
const results = [];
const failures = [];

for (const rel of pages) {
  if (sectionPages.has(rel)) continue; // checked instead by check-visible-sections.mjs
  const url = pathToFileURL(path.join(ROOT, rel)).href;
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 20000 });
  } catch (err) {
    failures.push(`${rel}: could not load (${err.message})`);
    continue;
  }
  await page.waitForTimeout(60); // let inline scripts finish populating readouts

  const { words } = await page.evaluate(countVisibleWords);
  const limit = essayLimits.get(rel) ?? SURFACE_LIMIT;
  const isEssay = essayLimits.has(rel);
  results.push({ page: rel, words, limit, isEssay });
  if (words > limit) {
    failures.push(
      `${rel}: ${words} visible words (limit ${limit}${isEssay ? ', essay budget' : ''})`
    );
  }
}

await browser.close();

results.sort((a, b) => b.words - a.words);

console.log(`Visible-word surface check: ${results.length} page(s) rendered and measured.`);
console.log(`${essayLimits.size} essay page(s) exempt from the 300-word surface, on their own budget ` +
  `(see scripts/essay-pages.json). ${sectionPages.size} long-form/reference page(s) held to the ` +
  `per-section rule instead (see scripts/check-visible-sections.mjs). Everyone else: ${SURFACE_LIMIT} ` +
  `visible words, hard limit.\n`);

console.log('All pages, worst first:');
for (const r of results) {
  const flag = r.words > r.limit ? '  OVER' : '';
  console.log(`  ${r.page.padEnd(38)} words=${String(r.words).padStart(5)}  limit=${r.limit}${flag}`);
}

if (failures.length) {
  console.error(`\nVisible-word surface check failed. ${failures.length} page(s) over budget, worst first:`);
  failures
    .sort((a, b) => {
      const wa = Number(a.match(/: (\d+) visible/)?.[1] ?? 0);
      const wb = Number(b.match(/: (\d+) visible/)?.[1] ?? 0);
      return wb - wa;
    })
    .forEach((f) => console.error('  ' + f));
  console.error(
    '\nMove excess content behind a disclosure mechanism (see design/house-style.md ' +
    'for the site\'s info-affordance, term-definition, and secondary-view components), ' +
    'or cut it. Do not hide the primary payoff sentence -- see design/STANDARD.md, ' +
    '"The 300-word surface."'
  );
  process.exit(1);
}

console.log('\nVisible-word surface: no violations.');
