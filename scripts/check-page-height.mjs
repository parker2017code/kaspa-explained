/**
 * Page-length gate (design/STANDARD.md, "The page-length ceiling",
 * 2026-08-24, tightened same day after the first landmark list passed
 * 19 of 19 pages while the owner was actively complaining pages were too
 * long).
 *
 * The owner's original instruction was a flat ceiling on every page: no
 * more than 3 viewport heights of total scroll at desktop, 5 at phone
 * width. That flat rule failed its own justifying test -- it was proposed
 * right after "make sure this is a site Apple or Tesla would publish,"
 * and Apple's and Tesla's own product pages run well past ten screens.
 * Total height was never the actual defect; undifferentiated scroll is.
 * A long page reads as long when it is paragraph after paragraph with no
 * landmark and no sense of progress. A long page does NOT read as long
 * when every screen carries one idea and something to look at or touch.
 * See design/STANDARD.md for the owner's reasoning trail on this reversal.
 *
 * This script checks two different things for two different reasons:
 *
 * 1. HARD OPEN-HEIGHT CEILING, for the five pages whose job is to route
 *    or answer rather than teach: index.html, start-here.html,
 *    status.html, search.html, 404.html. These have no business being
 *    long at all, and the owner's original number (3 viewport heights
 *    desktop, 5 phone) is exactly right for this class. Measured as
 *    document.documentElement.scrollHeight after network idle, in the
 *    default state with nothing expanded.
 *
 * 2. LONGEST UNDIFFERENTIATED RUN, sitewide, on every non-stub manifest
 *    page. This is the measurement that actually predicts whether a page
 *    reads as long, capped at roughly one viewport height (800px, the
 *    desktop viewport used here).
 *
 *    HEADINGS ARE DELIBERATELY NOT LANDMARKS. The first version of this
 *    gate counted h1-h4 as landmarks, on the theory that a heading is a
 *    structural break. It is not the break that matters: a heading tells
 *    a reader what is coming, it does not give them anything to look at
 *    or touch, and a wall of text with headings sprinkled through it is
 *    still a wall of text. Counting headings is exactly why that first
 *    version passed 19 of 19 pages the same day the owner was complaining
 *    that pages ran too long -- it is why this rule exists at all, and
 *    if you are reading this because you are about to add h1-h4 back in,
 *    don't; that was tried and it made the gate measure nothing.
 *
 *    A landmark is something a reader can look at or touch: a demo, an
 *    interactive control (button/input/select/textarea), an image
 *    (img/svg/canvas/figure), or a table. An element whose class contains
 *    "demo", "diagram", or "chart" also counts -- the site's actual
 *    naming convention for its interactive widgets and diagrams/charts,
 *    confirmed by grepping every *.html for those class substrings before
 *    writing this list. Change this selector in one place, here, if the
 *    site's markup conventions change.
 *
 *    A closed <details> disclosure is NOT a landmark by itself -- a
 *    closed summary line is a heading wearing different clothes. It
 *    counts only through what is actually visible without opening it.
 *    This is enforced with an explicit ancestry check (closest
 *    `details:not([open])`, plus `hidden`, `aria-hidden="true"`,
 *    `display:none`, `visibility:hidden`/`collapse`, and
 *    `content-visibility:hidden`), NOT by dropping zero-height rects.
 *    Chrome collapses a closed <details> by putting content-visibility on
 *    an internal wrapper, and descendants still return non-zero cached
 *    getBoundingClientRect() values through Playwright/CDP even though
 *    nothing is painted and nothing affects flow -- confirmed against the
 *    mass calculator demo on what-is-kaspa.html, which reported 746px at
 *    real coordinates while a screenshot at that exact scroll position
 *    showed a cleanly collapsed page with no visual trace of it. Relying
 *    on rect.bottom > rect.top to detect a closed disclosure was tried
 *    first and is exactly why every earlier run of this gate under-scored
 *    pages that put depth behind a closed disclosure -- it does not
 *    reliably distinguish "collapsed" from "off-screen but still counted
 *    as flow." A landmark inside the always-visible <summary> (e.g. a
 *    small preview image) still counts, since it is not inside the closed
 *    part of the details.
 *
 *    Measured at 1280x800 only (the desktop viewport) -- the rule is
 *    about pacing, not about a second breakpoint-specific ceiling, so one
 *    viewport width is enough to catch it.
 *
 *    The `.site-related` "Next pages" block (present near the bottom of
 *    18 of 19 pages) is sitewide footer chrome, not page content. It
 *    carries no landmarks of its own (a plain link grid, nothing in the
 *    look-at-or-touch list), so without special handling it would read as
 *    one long undifferentiated run for every page that has it -- a shared
 *    template artifact, not a page-specific defect. The gap computation
 *    stops at the top of .site-related rather than running through and
 *    past it, so this shared block cannot inflate any individual page's
 *    score. It is not scored on its own either; it is simply out of
 *    scope for a per-page pacing check.
 *
 * Landmarks are merged into contiguous intervals first (so a table
 * sitting right next to another landmark is not double-counted as ending
 * one gap and immediately starting the next), then gaps are measured
 * between merged intervals, before the first one, and after the last one
 * to the bottom of the page (or to the start of .site-related, see
 * above).
 *
 * Both checks share the same banned failure mode named in
 * design/STANDARD.md: hitting either ceiling by collapsing primary
 * content into a closed disclosure is not compliance. The page's answer
 * stays open on arrival; only depth closes. This script cannot detect
 * *why* a page is short (a real edit vs. a content dump moved behind a
 * click), so a human still has to read the diff, not just the number.
 *
 * 404.html is measured and held to the hard ceiling here even though
 * other scripts in this repo (see NOT_A_DESTINATION in
 * check-broken-and-blank.mjs, build-sitemap.py, check-html.py,
 * check-redirect-stubs.sh) skip it as "not a real destination" for
 * sitemap/link-graph purposes. Those scripts skip it because it is not
 * something a reader navigates to on purpose. This script is not asking
 * that question -- it is asking "if a reader lands here, how long is the
 * page," and a 404 page is exactly the kind of route/answer surface this
 * rule exists for. Redirect stubs (checked with the same isRedirectStub
 * pattern check-visible-words.mjs uses, since navigating one crashes
 * page.evaluate the same way there) are skipped, because they have no
 * height of their own to measure.
 *
 * Advisory for now, behind PAGE_HEIGHT_BLOCKING, same pattern as
 * VISIBLE_WORDS_BLOCKING and RENDER_GATE_BLOCKING in scripts/check-site.sh.
 * Flip it to blocking once both checks pass on every page.
 *
 * Usage: node scripts/check-page-height.mjs
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
    console.log('SKIPPED page-height check: playwright not installed');
    process.exit(0);
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const DESKTOP = { width: 1280, height: 800 };
const PHONE = { width: 390, height: 844 };
const DESKTOP_CEILING_VH = 3;
const PHONE_CEILING_VH = 5;
const DESKTOP_CEILING_PX = DESKTOP.height * DESKTOP_CEILING_VH; // 2400
const PHONE_CEILING_PX = PHONE.height * PHONE_CEILING_VH; // 4220
const GAP_CEILING_PX = DESKTOP.height; // ~one desktop viewport height, 800px

// The route/answer pages held to the hard open-height ceiling. Every other
// manifest page is teaching/reference material and is checked only on the
// undifferentiated-run rule below.
//
// status.html left this set on 29 August 2026. It was a 300-word route page
// when the set was written; it is now a 29-row reference table (13 features,
// 16 repeated claims) that renders open, with the source and the reasoning for
// each row. Twenty-nine rows cannot fit in three viewports, and the only way
// to make them fit is to close the table into a disclosure, which is the exact
// move this script's own header bans. The page is checked on the run rule with
// every other reference page instead.
const SHORT_PAGES = new Set(['index.html', 'start-here.html', 'search.html', '404.html']);

const manifest = JSON.parse(readFileSync(path.join(ROOT, 'site-manifest.json')));

// Same convention as scripts/check-visible-words.mjs: a redirect stub has
// no content height of its own, and navigating one destroys the page
// context mid-evaluate.
const isRedirectStub = (rel) => {
  try {
    return /http-equiv=["']refresh["']/i.test(readFileSync(path.join(ROOT, rel), 'utf8'));
  } catch {
    return false;
  }
};

const pages = manifest.pages.filter((rel) => !isRedirectStub(rel));

// Runs inside the page. Finds every look-at-or-touch landmark element
// (headings excluded on purpose -- see header comment), keeps only the
// outermost ones, drops anything with zero rendered height (catches
// content hidden inside a closed native <details>), merges
// overlapping/adjacent rects into intervals, excludes the .site-related
// footer block from the gap computation (reported separately), and
// returns the largest vertical gap between intervals plus the nearest
// preceding heading (for the diagnosis report only -- headings still
// label the report, they just do not count as landmarks).
function computeLongestGap() {
  // Two additions, 29 August 2026, after screenshotting every page this gate
  // flagged. Both were false positives of the same kind: the site renders a
  // landmark with markup this list did not name.
  //   .grid-cards is the shared container for every bordered card grid here
  //   (.reference-grid, .cycle-grid, .api-command-grid, .quick-grid). A row of
  //   bordered cards breaks a page exactly the way the table already in this
  //   list does; build-on-kaspa.html's "2,761px undifferentiated run" was
  //   twelve product cards and a five-step card grid.
  //   a.button / .actions a are this site's primary action controls. The list
  //   already counts <button>; the site writes its actions as anchors, so the
  //   same control was invisible here depending on which tag it used.
  // This is NOT a reopening of the headings question in the header comment. A
  // heading gives a reader nothing to look at; a bordered card grid and a
  // touchable pill both do. Checked after the change: model-picker-method.html
  // still fails, correctly, at 15,472px of prose with nothing to look at.
  const SEL =
    'table,img,svg,figure,canvas,' +
    '[class*="demo"],[class*="diagram"],[class*="chart"],' +
    '.grid-cards,a.button,.actions a,' +
    'button,input,select,textarea';
  const root = document.querySelector('main') || document.body;
  const footer = root.querySelector('.site-related');

  // Geometry alone cannot detect a collapsed disclosure: Chrome collapses
  // a closed <details> with content-visibility on an internal wrapper, and
  // descendants still return non-zero cached getBoundingClientRect values
  // even though nothing is painted and nothing affects flow (confirmed
  // against the mass calculator demo on what-is-kaspa.html -- 746px
  // reported at real coordinates while a screenshot at that scroll
  // position showed no visual trace of it). So detect hiding explicitly,
  // via ancestry, instead of relying on rect.bottom > rect.top.
  function isHidden(el) {
    let p = el;
    while (p && p !== root.parentElement) {
      if (p instanceof Element) {
        if (p.tagName === 'DETAILS' && !p.open && p !== el) return true;
        if (p.hasAttribute('hidden')) return true;
        if (p.getAttribute('aria-hidden') === 'true') return true;
        const cs = getComputedStyle(p);
        if (cs.display === 'none') return true;
        if (cs.visibility === 'hidden' || cs.visibility === 'collapse') return true;
        if (cs.contentVisibility === 'hidden') return true;
      }
      p = p.parentElement;
    }
    return false;
  }

  let candidates = Array.from(root.querySelectorAll(SEL)).filter(
    (el) => !el.closest('nav,header,footer,script,style,template') && !isHidden(el)
  );
  const set = new Set(candidates);
  candidates = candidates.filter((el) => {
    let p = el.parentElement;
    while (p && p !== root) {
      if (set.has(p)) return false;
      p = p.parentElement;
    }
    return true;
  });

  let rects = candidates
    .map((el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom };
    })
    .filter((r) => r.bottom > r.top); // drops genuinely zero-height elements
  rects.sort((a, b) => a.top - b.top);

  const merged = [];
  for (const r of rects) {
    const last = merged[merged.length - 1];
    if (last && r.top <= last.bottom + 1) {
      last.bottom = Math.max(last.bottom, r.bottom);
    } else {
      merged.push({ top: r.top, bottom: r.bottom });
    }
  }

  const headings = Array.from(root.querySelectorAll('h1,h2,h3,h4'));
  function headingNear(y) {
    let best = null;
    for (const h of headings) {
      if (h.getBoundingClientRect().top <= y + 2) best = h;
    }
    return best ? best.textContent.trim().replace(/\s+/g, ' ').slice(0, 70) : '(above first heading)';
  }

  const docTop = root.getBoundingClientRect().top;
  const footerTop = footer ? footer.getBoundingClientRect().top : document.documentElement.scrollHeight;

  const gaps = [];
  let cursor = docTop;
  for (const m of merged) {
    if (m.top >= footerTop) break; // stop before the shared footer block
    gaps.push({ start: cursor, size: Math.min(m.top, footerTop) - cursor });
    cursor = m.bottom;
  }
  if (cursor < footerTop) {
    gaps.push({ start: cursor, size: footerTop - cursor });
  }

  gaps.sort((a, b) => b.size - a.size);
  const top3 = gaps.slice(0, 3).map((g) => ({
    size: Math.round(g.size),
    heading: headingNear(g.start),
  }));


  return {
    maxGap: Math.round(top3[0]?.size ?? 0),
    top3,
    landmarkCount: merged.length,
    hasFooterBlock: !!footer,
  };
}

function urlFor(rel) {
  const p = path.join(ROOT, rel);
  return pathToFileURL(p).href;
}

const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
const failures = [];

for (const rel of pages) {
  const url = urlFor(rel);
  const entry = { page: rel };

  // Hard ceiling (short pages only): desktop + phone, post-network-idle
  // document height, dark theme, nothing expanded.
  if (SHORT_PAGES.has(rel)) {
    for (const [label, vp, ceilingPx, ceilingVh] of [
      ['desktop', DESKTOP, DESKTOP_CEILING_PX, DESKTOP_CEILING_VH],
      ['phone', PHONE, PHONE_CEILING_PX, PHONE_CEILING_VH],
    ]) {
      const context = await browser.newContext({ viewport: vp, colorScheme: 'dark' });
      const page = await context.newPage();
      try {
        await page.goto(url, { waitUntil: 'load', timeout: 30000 });
        await page.evaluate(() => {
          try {
            document.documentElement.setAttribute('data-theme', 'dark');
          } catch {}
        });
        try {
          await page.waitForLoadState('networkidle', { timeout: 8000 });
        } catch {
          // some pages poll or hold a socket open; settle on a fixed wait instead
        }
        await page.waitForTimeout(200);
        const height = await page.evaluate(() => document.documentElement.scrollHeight);
        const vh = Math.round((height / vp.height) * 100) / 100;
        entry[label] = { height, vh, ceilingPx, ceilingVh };
        if (height > ceilingPx) {
          failures.push(
            `${rel} [${label}]: ${height}px (${vh}x viewport) exceeds the ${ceilingVh}x ceiling (${ceilingPx}px)`
          );
        }
      } catch (err) {
        failures.push(`${rel} [${label}]: could not measure (${err.message})`);
      }
      await context.close();
    }
  }

  // Undifferentiated-run check: every non-stub page, desktop viewport only.
  {
    const context = await browser.newContext({ viewport: DESKTOP, colorScheme: 'dark' });
    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 30000 });
      await page.evaluate(() => {
        try {
          document.documentElement.setAttribute('data-theme', 'dark');
        } catch {}
      });
      try {
        await page.waitForLoadState('networkidle', { timeout: 8000 });
      } catch {
        // see note above
      }
      await page.waitForTimeout(200);
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      const gapResult = await page.evaluate(computeLongestGap);
      entry.totalHeight = height;
      entry.gap = gapResult;
      if (gapResult.maxGap > GAP_CEILING_PX) {
        const worst = gapResult.top3[0];
        failures.push(
          `${rel} [gap]: ${gapResult.maxGap}px undifferentiated run (limit ${GAP_CEILING_PX}px), ` +
            `starting after "${worst.heading}"`
        );
      }
    } catch (err) {
      failures.push(`${rel} [gap]: could not measure (${err.message})`);
    }
    await context.close();
  }

  results.push(entry);
}

await browser.close();

console.log(`Page-length check: ${results.length} page(s) rendered and measured.`);
console.log(
  `Hard ceiling (${DESKTOP_CEILING_VH}x desktop / ${PHONE_CEILING_VH}x phone) applies to: ` +
    `${[...SHORT_PAGES].join(', ')}.`
);
console.log(
  `Undifferentiated-run ceiling (${GAP_CEILING_PX}px, desktop viewport) applies to every page. ` +
    `Landmarks: table, img/svg/canvas/figure, button/input/select/textarea, .grid-cards card grids, ` +
    `anchor-styled action buttons, and class*=demo|diagram|chart. ` +
    `Headings do not count (see script header). The .site-related footer block is excluded from each ` +
    `page's own gap and not separately scored by this script.\n`
);

console.log('Short-page hard ceiling:');
for (const r of results) {
  if (!SHORT_PAGES.has(r.page)) continue;
  const d = r.desktop;
  const p = r.phone;
  const dFlag = d && d.height > d.ceilingPx ? '  OVER' : '';
  const pFlag = p && p.height > p.ceilingPx ? '  OVER' : '';
  const dStr = d ? `desktop=${d.height}px (${d.vh}x)${dFlag}` : 'desktop=ERR';
  const pStr = p ? `phone=${p.height}px (${p.vh}x)${pFlag}` : 'phone=ERR';
  console.log(`  ${r.page.padEnd(20)} ${dStr.padEnd(28)} ${pStr}`);
}

console.log('\nLongest undifferentiated run per page, worst first (landmark count / total height alongside):');
const byGap = [...results].sort((a, b) => (b.gap?.maxGap ?? 0) - (a.gap?.maxGap ?? 0));
for (const r of byGap) {
  if (!r.gap) continue;
  const flag = r.gap.maxGap > GAP_CEILING_PX ? '  OVER' : '';
  const ratio = `landmarks=${r.gap.landmarkCount}  totalHeight=${r.totalHeight}px`;
  console.log(
    `  ${r.page.padEnd(28)} gap=${String(r.gap.maxGap).padStart(5)}px${flag}  after "${r.gap.top3[0].heading}"  (${ratio})`
  );
}

if (failures.length) {
  console.error(`\nPage-length check failed. ${failures.length} violation(s):`);
  failures.forEach((f) => console.error('  ' + f));
  console.error(
    '\nFix by cutting content or moving it behind a real mechanism (see design/STANDARD.md, ' +
      '"The page-length ceiling"), not by collapsing the primary answer into a closed disclosure. ' +
      'The reader\'s answer stays open; depth closes.'
  );
  process.exit(1);
}

console.log('\nPage-length check: no violations.');
