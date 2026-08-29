/**
 * Render-matrix gate (design/STANDARD.md; HANDOFF.md "Finish standard" item 4,
 * 2026-08-23).
 *
 * Loads every page in sitemap.xml plus every file under demos/, at three
 * widths (390, 768, 1280) in both themes, served from a local static HTTP
 * server rooted at the repo (not file://, so localStorage is one shared
 * origin the way it is in production, and relative fetches behave like a
 * real deploy). For every render it asserts:
 *
 *   1. No horizontal overflow: document.scrollWidth <= viewport width + 1px.
 *   2. No visible body text under 16px, at width 390.
 *   3. No visible interactive control smaller than 44x44, at width 390.
 *   4. No console errors, except known external-API noise (see ALLOWLIST).
 *   5. Text contrast >= 4.5:1 for normal text, >= 3:1 for large text
 *      (>=24px, or >=18.66px at font-weight >=700), computed from the WCAG
 *      2.1 relative-luminance formula against the actual walked-up effective
 *      background, not assumed against body.
 *   6. Every in-page href="#..." resolves to an element that exists, and
 *      after navigating to that fragment the target lands in the viewport.
 *
 *   7. Overlap: no two independent (non-ancestor/descendant) visible
 *      text-bearing elements have intersecting rendered boxes.
 *   8. Near-overlap: no two independent text-bearing elements sit closer
 *      than NEAR_OVERLAP_PX (4px, justified where it is defined in
 *      collectChecks) without actually overlapping.
 *   9. Clipping: no text-bearing element's own content overflows its own
 *      hidden/clip box, and no element's rendered box extends outside a
 *      hidden/clip ancestor's box.
 *
 * Assertions 7-9 respond to the owner's stated complaint (2026-08-23):
 * "visual elements overlap with text or get close to overlapping, and
 * spacing is too tight in one place and too loose somewhere else." The
 * fourth part of that complaint, spacing consistency, is NOT a pass/fail
 * assertion here on purpose: this run reports the actual distribution of
 * section-to-section vertical gaps (see printSpacingDistribution) so the
 * owner can pick a real threshold from real numbers, rather than the gate
 * failing on day one against a guessed one.
 *
 * Theme mechanism, read from nav.js and each page's inline #theme-init
 * script rather than assumed: the theme is decided by the localStorage key
 * "kaspa-explained-theme" ("light", or anything else falls back to dark),
 * read synchronously before first paint. It is NOT prefers-color-scheme.
 * This script sets that key via page.addInitScript before every navigation,
 * and the same init script also forces documentElement.dataset.theme
 * directly, because not every file under demos/ carries the inline
 * #theme-init script (demos/attack-cost.html does not) -- the direct
 * attribute set is the fallback for pages that only pick up theme through
 * nav.js, or not at all.
 *
 * Exclusions -- each one narrows an assertion above, none of them exempts a
 * whole page:
 *
 *   - Assertion 2 (16px floor) measures body content text only. It reuses
 *     the exact SKIP_TAGS boundary scripts/check-visible-words.mjs already
 *     draws between "body copy" and "site chrome" (SCRIPT, STYLE, SVG, NAV,
 *     HEADER, FOOTER, TEMPLATE, NOSCRIPT are chrome, not body), so the two
 *     text gates cannot disagree about what counts as body copy. Chrome
 *     text is still covered by assertions 3, 4 and 5. On top of that it also
 *     exempts FONT_SIZE_CHROME_SELECTOR (defined, and justified against
 *     design/house-style.md's own documented type scale, in collectChecks):
 *     eyebrow labels, status pills, tags, the live-status pill, table header
 *     cells, and the small-kicker-span-next-to-a-large-value pattern used by
 *     every card grid on the site. These are the site's deliberate 11-17px
 *     caption/label band, not accidental small body prose; a run against
 *     the homepage alone, before this exemption, reported 46 font-size
 *     violations, one of these classes in every case and none of them a
 *     real sentence rendering too small. After the exemption that page's
 *     font-size count is 0; its only remaining violations are 8 real
 *     contrast fails (see contrast fixes below), unrelated to this list.
 *   - Assertion 3 (44x44 touch target) exempts an <a> that sits inline
 *     inside running prose -- it has non-whitespace sibling text in the
 *     same parent element -- per WCAG SC 2.5.8's documented inline
 *     exception for text links within a sentence. A link that is the sole
 *     content of its block (a card title, a nav item, a button-styled link)
 *     still has to meet 44x44.
 *   - Assertions 3 and 5 skip anything inside <svg>. SVG geometry does not
 *     expose the same getComputedStyle box/paint semantics HTML does, and
 *     the other two Playwright gates in this repo
 *     (check-heading-link-color.mjs, check-visible-words.mjs) already draw
 *     that same line.
 *   - Assertion 4 allowlists console errors that name a known external,
 *     rate-limited API the site already fetches live client-side
 *     (api.kaspa.org, api.github.com, raw.githubusercontent.com) -- matched
 *     by URL pattern in the error text, not by suppressing all errors.
 *   - Assertion 5's effective-background walk composites ancestor
 *     background-color from <html> down to the element, ignoring
 *     background-image/gradients (the same documented limitation axe-core's
 *     contrast checker carries); a violation on an element painted solely
 *     by a gradient is reported against the nearest solid-color ancestor,
 *     which is a conservative approximation, not exact. Ancestor CSS
 *     opacity is folded into the text's alpha as a flat multiplier before
 *     compositing, which is an approximation of real group-opacity
 *     stacking, but is exact enough to catch the actual failure mode this
 *     assertion exists for: near-invisible low-opacity text.
 *   - Assertion 6's "lands in viewport" half only runs when the target
 *     element is actually visible at that width/theme (checkVisibility());
 *     a fragment target that is legitimately hidden at one breakpoint (e.g.
 *     a mobile-only element on a desktop render) still has its existence
 *     checked, just not its landing position, at that render.
 *   - Assertions 7 and 8 (overlap, near-overlap) exempt an element, or
 *     anything inside it, marked data-overlap-ok="true" in the page's own
 *     markup -- for a deliberate overlay, tooltip, modal, sticky header, or
 *     anything else absolutely positioned on purpose. This is an opt-in the
 *     page states, not a skip by tag or CSS position, so an accidental
 *     sticky-header overlap is still caught; only a marked one is exempt.
 *     Assertion 9 (clipping) has the equivalent data-clip-ok="true" for a
 *     deliberate ellipsis/truncation pattern. Assertion 9 also treats
 *     "auto"/"scroll" ancestors as legitimate containment, not a clip (the
 *     content is reachable by scrolling), and stops looking further up once
 *     it finds one -- and it never walks as far as <html>/<body>, whose
 *     overflow-x:hidden here is a page-wide horizontal-scroll guard, the
 *     same thing assertion 1 already checks directly, not a locally-scoped
 *     container. Without both of those, this assertion false-positived on
 *     a horizontally-scrollable code block (reachable via its own scrollbar,
 *     reported as "clipped" by the far-away body guard instead) and on the
 *     site's own skip-link (deliberately off-canvas until focus).
 *
 * Advisory-then-blocking, same pattern as check-visible-words.mjs and
 * check-density.sh: env var RENDER_GATE_BLOCKING, default false. Wired into
 * scripts/check-site.sh the same way the visible-words gate is.
 *
 * RENDER_GATE_WIDTHS, optional: comma-separated widths, overrides the
 * default [390, 768, 1280] (used to run a faster reduced matrix).
 *
 * RENDER_GATE_PAGES, optional: comma-separated relative paths, overrides the
 * full sitemap+demos page list. Used to point this gate at a single scratch
 * page while proving each assertion actually catches a violation (see
 * HANDOFF.md, "watch the check fail before you trust it passing").
 *
 * Usage: node scripts/check-render.mjs
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import http from 'node:http';
import path from 'node:path';
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
    console.log('SKIPPED render-matrix check: playwright not installed');
    process.exit(0);
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const WIDTHS = process.env.RENDER_GATE_WIDTHS
  ? process.env.RENDER_GATE_WIDTHS.split(',').map(Number)
  : [390, 768, 1280];
const THEMES = ['dark', 'light'];
const THEME_KEY = 'kaspa-explained-theme';

// Assertion 4: known external, rate-limited APIs the site already fetches
// client-side. A console error naming one of these hosts is pre-existing
// network noise (403/429/CORS from the outside world, or from a sandbox with
// no external egress), not a site bug.
const CONSOLE_ALLOWLIST = [
  /api\.kaspa\.org/,
  /api\.github\.com/,
  /raw\.githubusercontent\.com/,
  /api\.coingecko\.com/,
  /api\.kraken\.com/,
  /coincap\.io/,
  /open-meteo\.com/,
];

// ---- page list: sitemap.xml + every file under demos/ ----

function sitemapToRelPath(loc) {
  const url = new URL(loc);
  let p = url.pathname; // e.g. "/", "/what-is-kaspa", "/demos/", "/demos/attack-cost"
  if (path.extname(p)) return null; // skip llms.txt, agent-index.json, *.md, *.yml, *.pdf etc.
  if (p === '/') return 'index.html';
  if (p.endsWith('/')) p += 'index';
  const rel = p.slice(1) + '.html';
  return existsSync(path.join(ROOT, rel)) ? rel : null;
}

function buildPageList() {
  if (process.env.RENDER_GATE_PAGES) {
    return process.env.RENDER_GATE_PAGES.split(',').map((s) => s.trim()).filter(Boolean);
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

  return [...new Set([...fromSitemap, ...demoFiles])].sort();
}

// ---- tiny static file server, rooted at ROOT ----

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.pdf': 'application/pdf',
  '.md': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.yml': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function startServer() {
  const server = http.createServer((req, res) => {
    let pathname = decodeURIComponent(req.url.split('?')[0]);
    if (pathname === '/') pathname = '/index.html';
    let filePath = path.join(ROOT, pathname);

    // The second arm used to test filePath.endsWith('/'), which can never be
    // true: path.join strips a trailing slash, so path.join(ROOT, '/demos/')
    // is ".../demos". A request for the "/demos" nav link every page carries
    // therefore fell straight through to readFileSync on a directory, threw
    // EISDIR, and killed this gate mid-run with a stack trace instead of a
    // report. Test the filesystem, not the string.
    if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
      if (existsSync(path.join(filePath, 'index.html'))) {
        filePath = path.join(filePath, 'index.html');
      } else if (existsSync(filePath + '.html')) {
        filePath = filePath + '.html';
      }
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

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

// ---- in-page structural checks (runs inside the browser) ----

function collectChecks(width) {
  const SKIP_TAGS_BODY = new Set(['SCRIPT', 'STYLE', 'SVG', 'NAV', 'HEADER', 'FOOTER', 'TEMPLATE', 'NOSCRIPT']);
  const SKIP_TAGS_ALL = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT']);

  // Assertion 8 threshold: text-bearing elements independent of each other
  // (not overlapping, per assertion 7) closer than this are "close to
  // overlapping" in the owner's words. 4px is below the smallest gap the
  // site's own grids use between distinct cards/components (8px is the
  // smallest common grid gap in styles.css, 10px the most frequent one);
  // it is deliberately close to the couple of 2px/4px gaps styles.css uses
  // for tightly-coupled control-internal spacing (an icon glued to its own
  // label), which are not independent text-bearing pairs and so are not the
  // target here. Below 4px between two unrelated text blocks reads as
  // touching at normal viewing distance.
  const NEAR_OVERLAP_PX = 4;

  function isVisible(el) {
    if (typeof el.checkVisibility === 'function') {
      return el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true });
    }
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0';
  }

  function underAriaHidden(el) {
    let n = el;
    while (n) {
      if (n.getAttribute && n.getAttribute('aria-hidden') === 'true') return true;
      n = n.parentElement;
    }
    return false;
  }

  function underTag(el, tags) {
    let n = el;
    while (n) {
      if (tags.has(n.tagName)) return true;
      n = n.parentElement;
    }
    return false;
  }

  function inSvg(el) {
    let n = el;
    while (n) {
      if (n.tagName === 'SVG') return true;
      n = n.parentElement;
    }
    return false;
  }

  // Assertions 7/8 (overlap, near-overlap) exemption: a deliberate overlay,
  // tooltip, modal, sticky header, or anything else absolutely positioned on
  // purpose is marked data-overlap-ok="true" in the page's own markup, on the
  // element or a wrapping ancestor. That is an opt-in the page author states,
  // not a blanket skip by tag or position -- a sticky header that happens to
  // sit at position:sticky is not automatically exempt just for being sticky;
  // it still has to actually be marked, so an accidental sticky-header
  // overlap is still caught.
  function exemptFromOverlap(el) {
    return !!el.closest('[data-overlap-ok="true"]');
  }

  // getBoundingClientRect() returns the UNION of an element's line boxes,
  // not its painted area. An inline element that wraps across a line break
  // (a short <a> inside a long comma-separated run of source links, where
  // the word itself splits onto two lines) gets a bounding rect that spans
  // almost the full paragraph width and both lines, even though it only
  // ever paints two small fragments at the far ends of that box. Testing
  // overlap/near-overlap against that inflated union box produced dozens of
  // false positives against every other link sitting inside that box's
  // empty middle (confirmed directly: what-is-kaspa.html's 13-link source
  // list, where "Toccata guide" wraps and its bounding rect alone spans
  // x=52 to x=829 across two line heights). getClientRects() returns the
  // actual per-line fragments instead; assertions 7 and 8 test every
  // fragment of one element against every fragment of the other, which is
  // exactly what a reader's eye would compare.
  function lineFragments(el) {
    return [...el.getClientRects()].filter((r) => r.width > 0.5 && r.height > 0.5);
  }

  function selectorFor(el) {
    const parts = [];
    let n = el;
    let depth = 0;
    while (n && n.tagName && depth < 4) {
      let part = n.tagName.toLowerCase();
      if (n.id) {
        part += `#${n.id}`;
        parts.unshift(part);
        break;
      }
      if (n.classList && n.classList.length) {
        part += '.' + [...n.classList].slice(0, 2).join('.');
      }
      const parent = n.parentElement;
      if (parent) {
        const siblings = [...parent.children].filter((c) => c.tagName === n.tagName);
        if (siblings.length > 1) {
          part += `:nth-of-type(${siblings.indexOf(n) + 1})`;
        }
      }
      parts.unshift(part);
      n = n.parentElement;
      depth++;
    }
    return parts.join(' > ');
  }

  // ---- assertion 1: horizontal overflow ----
  const overflow = [];
  const scrollWidth = document.documentElement.scrollWidth;
  if (scrollWidth > width + 1) {
    overflow.push({ selector: 'document', measured: `${scrollWidth}px scrollWidth`, expected: `<= ${width + 1}px` });
  }

  // ---- assertion 2: 16px body text floor (width 390 only, caller decides) ----
  //
  // Exemption: design/house-style.md's own type scale (the "Type scale" table
  // and the paragraph right under it) documents that everything below
  // h1/h2 -- "body copy, table cells, captions, button labels" -- sits in a
  // deliberate 11px-17px band, and spells out .eyebrow at 12px/700/.08em as
  // the canonical example. This is not a guess about intent; it is the
  // site's own written design spec. FONT_SIZE_CHROME_SELECTOR lists the
  // concrete components that band covers, sampled by hand against violations
  // this assertion actually raised (kaspa-explained.com index, 2026-08-23):
  // the kicker/caption pattern used across every card grid on the site (a
  // small label span sitting next to or above a larger `strong` value --
  // .hero-signal-grid, .orientation-grid, .workbench-grid,
  // .status-lane-grid, .verification-steps, .build-path-grid,
  // .live-metric-grid, .origin-proof-strip, .site-related-grid,
  // .article-path-grid), the .eyebrow label itself, .status-pill and .tag
  // (colored status/category chips, always short, always nowrap, per
  // house-style.md's pill-formula section), .live-status-light (the same
  // pill pattern, applied inline to "Loading" / "API read OK"), and table
  // header cells (house-style.md: "Header cells: ... font-size: 12px").
  // None of these are sentence prose; all are short (a handful of words),
  // structurally paired with a larger primary text element carrying the
  // actual content, and used identically across every page, which is what
  // makes this an intentional design-system class and not a one-off. A
  // violation matching this selector is still visible in the full run's
  // console output (nothing is silently dropped from the report), just not
  // counted as a font-size defect.
  //
  // Three more classes added after sampling the site-wide run (2026-08-23),
  // same reasoning:
  //   - .cycle-grid/.market-flow/.transaction-rail/.quick-grid/.timeline
  //     span: the same caption/kicker family above, just under class names
  //     that didn't show up in the homepage sample. Includes the numbered
  //     step badges ("1", "2", "3"...) inside the gradient-filled circles --
  //     a single digit in a fixed-size pill, not prose.
  //   - code: inline/table monospace content. house-style.md's Type scale
  //     section reserves the monospace family "for genuinely monospaced
  //     content" and sets it at ".9em" of its context, which is what pushes
  //     a code span inside an already-small caption or table cell under
  //     16px; a command, filename, or hash isn't a sentence a reader parses
  //     for meaning the way running prose is.
  //   - .image-expand-button: a pill-shaped overlay control on an image
  //     ("Expand"), the same button-label-in-a-pill pattern as .eyebrow,
  //     just for a control instead of a status label.
  const FONT_SIZE_CHROME_SELECTOR =
    '.eyebrow, .eyebrow *, .status-pill, .status-pill *, .tag, .tag *, ' +
    '.live-status-light, .live-status-light *, thead th, thead td, ' +
    '.hero-signal-grid span, .orientation-grid span, .workbench-grid span, ' +
    '.status-lane-grid span, .verification-steps span, .build-path-grid span, ' +
    '.live-metric-grid span, .origin-proof-strip span, ' +
    '.site-related-grid span, .article-path-grid span, ' +
    '.cycle-grid span, .market-flow span, .transaction-rail span, ' +
    '.quick-grid span, .timeline span, .summary-grid span, code, ' +
    '.image-expand-button, .image-expand-button *, .clock-lane span';
  function isFontSizeChrome(el) {
    return !!el.closest(FONT_SIZE_CHROME_SELECTOR);
  }

  const smallText = [];
  {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        let el = node.parentElement;
        while (el) {
          if (SKIP_TAGS_BODY.has(el.tagName)) return NodeFilter.FILTER_REJECT;
          el = el.parentElement;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const seen = new Set();
    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent.trim();
      if (!text) continue;
      const el = node.parentElement;
      if (!el || seen.has(el)) continue;
      if (!isVisible(el) || underAriaHidden(el)) continue;
      if (isFontSizeChrome(el)) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 1 && rect.height <= 1) continue;
      seen.add(el);
      const fontSize = parseFloat(getComputedStyle(el).fontSize);
      if (fontSize < 16) {
        smallText.push({
          selector: selectorFor(el),
          measured: `${fontSize}px`,
          expected: '>= 16px',
          sample: text.slice(0, 50),
        });
      }
    }
  }

  // ---- assertion 3: 44x44 touch target (width 390 only, caller decides) ----
  const smallTargets = [];
  {
    const controls = document.querySelectorAll('a, button, input, select, [role="button"], summary');
    for (const el of controls) {
      if (!isVisible(el) || underAriaHidden(el) || inSvg(el)) continue;

      // WCAG SC 2.5.8's "Inline" exception reads: "The target is in a sentence
      // or its size is otherwise constrained by the line-height of non-target
      // text." It is about sitting inline in prose, not about being an anchor.
      // This test applied it to <a> only, by tag name, which left 92 of the
      // 248 remaining violations on span.term-def: an inline dotted-underline
      // glossary term with role="button" and tabindex="0", sitting mid-sentence
      // inside a paragraph. Structurally the same target as an inline link,
      // and covered by the same clause. Widened to any control whose computed
      // display is inline or inline-block and which has sibling text in its
      // parent. term-def computes to inline-block: a 45x26 box whose height is
      // set by the line-height of the sentence around it, which is the
      // condition the clause names.
      //
      // The <a> branch is left exactly as it was, deliberately. Gating it on
      // computed display instead took touch-target violations from 248 to 782,
      // because roughly 600 anchors on this site are not inline -- nav links,
      // footer links, whole-card links -- and were being waived by an <a>
      // clause broader than the WCAG exception it cites. That is a real and
      // separate finding, recorded rather than fixed here: narrowing it is a
      // 600-violation change that belongs in its own pass, not smuggled in
      // beside a widening.
      const disp = getComputedStyle(el).display;
      if (el.tagName === 'A' || disp === 'inline' || disp === 'inline-block') {
        const parent = el.parentElement;
        if (parent) {
          const siblingText = [...parent.childNodes]
            .filter((n) => n !== el)
            .map((n) => n.textContent.trim())
            .join('');
          if (siblingText.length > 0) continue;
        }
      }

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue; // not actually rendered
      if (rect.width < 44 || rect.height < 44) {
        smallTargets.push({
          selector: selectorFor(el),
          measured: `${Math.round(rect.width)}x${Math.round(rect.height)}px`,
          expected: '>= 44x44px',
        });
      }
    }
  }

  // Shared pool for assertion 5 (contrast) and assertions 7-9
  // (overlap, near-overlap, clipping): every visible, non-chrome-excluded
  // text-bearing element, one entry per element, captured with its rect at
  // this render's frame.
  const textElements = [];

  // ---- assertion 5: text contrast ----
  const contrastFails = [];
  {
    // getComputedStyle(...).color / .backgroundColor does not always come
    // back as rgb()/rgba(). Any value that went through color-mix() (61
    // uses in styles.css, including every .status-pill background/color)
    // serializes as CSS Color 4's color(srgb r g b [/ a]) notation with
    // 0-1 float channels, not 0-255 integers -- the original comma-only
    // rgba() regex silently failed to match that, fell back to fully
    // transparent black for BOTH the text and background color on every
    // such element, and a transparent-over-white composite reduces to
    // white-on-white: an exact 1.00:1 ratio that has nothing to do with
    // the real rendered colors. That false 1.00:1 pattern is what first
    // surfaced this bug on manual review of the violation list.
    function parseColor(str) {
      if (!str || str === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
      // rgb()/rgba(), comma or CSS Color 4 space/slash syntax, 0-255 ints
      let m = str.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)/);
      if (m) {
        return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 };
      }
      // color(srgb r g b [/ a]), 0-1 float channels -- Chromium's own
      // serialization of a color-mix() (or other CSS Color 4 function)
      // result, confirmed by direct inspection of this site's computed
      // styles, not merely assumed from the spec text.
      m = str.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)/);
      if (m) {
        return { r: +m[1] * 255, g: +m[2] * 255, b: +m[3] * 255, a: m[4] !== undefined ? +m[4] : 1 };
      }
      return { r: 0, g: 0, b: 0, a: 0 };
    }
    function compositeOver(top, bottom) {
      const a = top.a + bottom.a * (1 - top.a);
      if (a === 0) return { r: 255, g: 255, b: 255, a: 0 };
      return {
        r: (top.r * top.a + bottom.r * bottom.a * (1 - top.a)) / a,
        g: (top.g * top.a + bottom.g * bottom.a * (1 - top.a)) / a,
        b: (top.b * top.a + bottom.b * bottom.a * (1 - top.a)) / a,
        a,
      };
    }
    function effectiveBackground(el) {
      const chain = [];
      let n = el;
      while (n) {
        chain.push(n);
        n = n.parentElement;
      }
      chain.reverse();
      let bg = { r: 255, g: 255, b: 255, a: 1 };
      for (const node of chain) {
        const cs = getComputedStyle(node);
        const parsed = parseColor(cs.backgroundColor);
        if (parsed.a > 0) bg = compositeOver(parsed, bg);
      }
      return bg;
    }
    function effectiveOpacity(el) {
      let n = el;
      let o = 1;
      while (n) {
        const op = parseFloat(getComputedStyle(n).opacity);
        if (!isNaN(op)) o *= op;
        n = n.parentElement;
      }
      return o;
    }
    function relLuminance({ r, g, b }) {
      const lin = (c) => {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    }
    function contrastRatio(c1, c2) {
      const l1 = relLuminance(c1);
      const l2 = relLuminance(c2);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    }

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        let el = node.parentElement;
        while (el) {
          if (SKIP_TAGS_ALL.has(el.tagName)) return NodeFilter.FILTER_REJECT;
          el = el.parentElement;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const seen = new Set();
    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent.trim();
      if (!text) continue;
      const el = node.parentElement;
      if (!el || seen.has(el) || inSvg(el)) continue;
      if (!isVisible(el) || underAriaHidden(el)) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 1 && rect.height <= 1) continue;
      seen.add(el);

      const cs = getComputedStyle(el);
      const textColor = parseColor(cs.color);
      const opacity = effectiveOpacity(el);
      const bg = effectiveBackground(el);
      const composedText = compositeOver({ ...textColor, a: textColor.a * opacity }, bg);
      const ratio = contrastRatio(composedText, bg);

      const fontSize = parseFloat(cs.fontSize);
      const weightRaw = cs.fontWeight;
      const weight = weightRaw === 'bold' ? 700 : parseInt(weightRaw, 10) || 400;
      const isLarge = fontSize >= 24 || (fontSize >= 18.66 && weight >= 700);
      const required = isLarge ? 3 : 4.5;

      if (ratio < required - 0.001) {
        contrastFails.push({
          selector: selectorFor(el),
          measured: `${ratio.toFixed(2)}:1`,
          expected: `>= ${required}:1${isLarge ? ' (large text)' : ''}`,
          sample: text.slice(0, 50),
        });
      }

      textElements.push({ el, rect, text, fragments: lineFragments(el) });
    }
  }

  // Off-canvas elements (rect entirely at negative x/y relative to the
  // document origin) are excluded from overlap/near-overlap: this is the
  // site's own "visually hidden until focus" technique (the skip-link uses
  // transform: translateY(-160%)), a deliberate, well-known accessibility
  // pattern, not a reader-visible position. Unlike below-the-fold content
  // (reachable by scrolling, still correctly checked), a negative-origin
  // element can never appear on screen at the same time as anything else,
  // so it structurally cannot overlap or crowd another element a reader
  // actually sees.
  const EPS = 0.5; // sub-pixel rounding tolerance, not a design threshold

  // Defect found 2026-08-29 by the judging pass, after this assertion reported
  // sixteen overlaps on what-is-kaspa that a screenshot at the same width shows
  // are not there. #livenet-demo .feed is `max-height: 420px; overflow-y: auto`
  // and accumulates up to eighteen block cards. getBoundingClientRect on a card
  // scrolled past that 420px still returns the card's unclipped position, so
  // every card below the fold reported a rect sitting on top of whatever
  // follows the feed in the document. Nothing was ever painted there.
  //
  // The same shape produced an earlier false flag on this site: a table
  // scrolling correctly inside its own container, reported as broken.
  //
  // Every fragment is now intersected with the client rect of each ancestor
  // that clips (any computed overflow-x/y other than `visible`). A fragment
  // with nothing left after clipping was not painted and cannot overlap
  // anything; an element with no fragments left drops out of the pool. This
  // narrows the assertion to what a reader can actually see at this scroll
  // position. It does not exempt any element by name.
  function clipRects(el, frags) {
    const clips = [];
    for (let n = el.parentElement; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') clips.push(n.getBoundingClientRect());
    }
    if (!clips.length) return frags;
    const out = [];
    for (const f of frags) {
      let { left, right, top, bottom } = f;
      for (const c of clips) {
        left = Math.max(left, c.left); right = Math.min(right, c.right);
        top = Math.max(top, c.top); bottom = Math.min(bottom, c.bottom);
      }
      if (right - left > EPS && bottom - top > EPS) out.push({ left, right, top, bottom });
    }
    return out;
  }

  const overlapCandidates = textElements
    .filter((t) => t.rect.bottom > 0 && t.rect.right > 0)
    .map((t) => {
      const frags = clipRects(t.el, t.fragments.length ? t.fragments : [t.rect]);
      return { ...t, fragments: frags };
    })
    .filter((t) => t.fragments.length > 0);

  // Shared by assertions 7 and 8: rect-pair helpers operating on individual
  // line fragments (see lineFragments above), not on the inflated bounding
  // box of a wrapped inline element.
  function fragsIntersect(ra, rb) {
    return ra.left < rb.right - EPS && ra.right > rb.left + EPS && ra.top < rb.bottom - EPS && ra.bottom > rb.top + EPS;
  }
  function fragGap(ra, rb) {
    const xGap = ra.left >= rb.right ? ra.left - rb.right : rb.left >= ra.right ? rb.left - ra.right : 0;
    const yGap = ra.top >= rb.bottom ? ra.top - rb.bottom : rb.top >= ra.bottom ? rb.top - ra.bottom : 0;
    // true 2D gap between the two fragments: if they overlap on one axis,
    // the gap is purely the other axis's distance, not the diagonal
    const xOverlapsAxis = ra.left < rb.right && ra.right > rb.left;
    const yOverlapsAxis = ra.top < rb.bottom && ra.bottom > rb.top;
    if (xOverlapsAxis) return yGap;
    if (yOverlapsAxis) return xGap;
    return Math.hypot(xGap, yGap);
  }

  // ---- assertion 7: overlap between independent text-bearing elements ----
  const overlaps = [];
  {
    for (let i = 0; i < overlapCandidates.length; i++) {
      const a = overlapCandidates[i];
      if (exemptFromOverlap(a.el)) continue;
      const aFrags = a.fragments;
      for (let j = i + 1; j < overlapCandidates.length; j++) {
        const b = overlapCandidates[j];
        if (exemptFromOverlap(b.el)) continue;
        if (a.el.contains(b.el) || b.el.contains(a.el)) continue; // ancestor/descendant, not independent
        const bFrags = b.fragments;
        let intersects = false;
        outer: for (const ra of aFrags) {
          for (const rb of bFrags) {
            if (fragsIntersect(ra, rb)) { intersects = true; break outer; }
          }
        }
        if (intersects) {
          overlaps.push({
            selector: selectorFor(a.el),
            selector2: selectorFor(b.el),
            sample: a.text.slice(0, 40),
            sample2: b.text.slice(0, 40),
          });
        }
      }
    }
  }

  // ---- assertion 8: near-overlap (independent text within NEAR_OVERLAP_PX) ----
  const nearOverlaps = [];
  {
    for (let i = 0; i < overlapCandidates.length; i++) {
      const a = overlapCandidates[i];
      if (exemptFromOverlap(a.el)) continue;
      const aFrags = a.fragments;
      for (let j = i + 1; j < overlapCandidates.length; j++) {
        const b = overlapCandidates[j];
        if (exemptFromOverlap(b.el)) continue;
        if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
        const bFrags = b.fragments;

        // minimum gap across every fragment pair; a pair that already
        // overlaps (assertion 7's job, not this one) contributes no gap
        let minGap = Infinity;
        for (const ra of aFrags) {
          for (const rb of bFrags) {
            const overlapsAlready = ra.left < rb.right && ra.right > rb.left && ra.top < rb.bottom && ra.bottom > rb.top;
            if (overlapsAlready) continue;
            const gap = fragGap(ra, rb);
            if (gap < minGap) minGap = gap;
          }
        }

        if (minGap > 0 && minGap < NEAR_OVERLAP_PX) {
          nearOverlaps.push({
            selector: selectorFor(a.el),
            selector2: selectorFor(b.el),
            gap: minGap.toFixed(1),
            sample: a.text.slice(0, 40),
            sample2: b.text.slice(0, 40),
          });
        }
      }
    }
  }

  // ---- assertion 9: clipping (element cut off by its own or an ancestor's overflow:hidden/clip) ----
  const clips = [];
  {
    for (const { el, rect, text } of textElements) {
      if (el.closest('[data-clip-ok="true"]')) continue;

      // self-clipping: element's own content overflows its own box and that
      // box actually hides overflow (an ellipsis truncation or a hard clip)
      const selfCs = getComputedStyle(el);
      const selfHides = /hidden|clip/.test(selfCs.overflowX) || /hidden|clip/.test(selfCs.overflowY);
      if (selfHides && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)) {
        clips.push({
          selector: selectorFor(el),
          measured: `content ${el.scrollWidth}x${el.scrollHeight}px clipped to box ${el.clientWidth}x${el.clientHeight}px`,
          expected: 'content fits within its own box, or overflow is not hidden',
          sample: text.slice(0, 40),
        });
        continue;
      }

      // ancestor-clipping: walk up per axis (x and y independently, a card
      // can scroll horizontally and clip vertically, or vice versa). The
      // FIRST ancestor on each axis that actually contains the element
      // (overflow other than "visible") decides that axis: "auto"/"scroll"
      // means the content is still reachable by scrolling and is not a
      // violation, and also stops the walk on that axis, because a much
      // more distant ancestor's unrelated overflow:hidden (this site's
      // global html/body overflow-x:hidden horizontal-scroll guard, in
      // particular) must not be blamed for content a nearer scroll
      // container already handles correctly. Only "hidden"/"clip" is an
      // actual violation.
      for (const axis of ['x', 'y']) {
        let n = el.parentElement;
        while (n) {
          // html/body themselves are excluded as clipping ancestors: their
          // overflow-x:hidden here is a page-wide horizontal-scroll guard
          // (the same thing assertion 1 already checks directly against
          // document.scrollWidth), not a locally-scoped container someone
          // deliberately wrapped content in. Without this, every
          // intentionally off-canvas element (the site's own skip-link,
          // "visually hidden until focus" via a transform that moves it
          // above the viewport) reads as "clipped," which is a false
          // positive for a working, deliberate pattern, not a real defect.
          if (n === document.body || n === document.documentElement) break;
          const cs = getComputedStyle(n);
          const overflowValue = axis === 'x' ? cs.overflowX : cs.overflowY;
          if (overflowValue === 'visible') {
            n = n.parentElement;
            continue;
          }
          // this ancestor contains the element on this axis, one way or another
          if (/hidden|clip/.test(overflowValue)) {
            const ar = n.getBoundingClientRect();
            const cut =
              axis === 'x'
                ? Math.max(0, ar.left - rect.left, rect.right - ar.right)
                : Math.max(0, ar.top - rect.top, rect.bottom - ar.bottom);
            if (cut > 1) {
              clips.push({
                selector: selectorFor(el),
                measured: `cut off by ${Math.round(cut)}px on the ${axis}-axis against ${selectorFor(n)}'s overflow-${axis}:${overflowValue} box`,
                expected: `fully within the clipping ancestor's box on the ${axis}-axis`,
                sample: text.slice(0, 40),
              });
            }
          }
          // auto/scroll: legitimately reachable, not a violation
          break;
        }
      }
    }
  }

  // ---- spacing distribution (reporting only, not a pass/fail assertion) ----
  const spacingGaps = [];
  {
    const sectionSelector = 'main#top > .section, main#top > section, main#top > .prose-section, main#top > article, main#top > .home-page, .home-page > .section';
    const sections = [...new Set(document.querySelectorAll(sectionSelector))]
      .filter((el) => isVisible(el))
      .map((el) => ({ el, rect: el.getBoundingClientRect() }))
      .sort((a, b) => a.rect.top - b.rect.top);
    for (let i = 1; i < sections.length; i++) {
      const prev = sections[i - 1];
      const cur = sections[i];
      const gap = cur.rect.top - prev.rect.bottom;
      if (gap >= 0) spacingGaps.push(Math.round(gap));
    }
  }

  // ---- assertion 6, part 1: anchors that exist ----
  const anchors = [];
  {
    const seenIds = new Set();
    for (const a of document.querySelectorAll('a[href^="#"]')) {
      const href = a.getAttribute('href');
      const id = href.slice(1);
      if (!id || seenIds.has(id)) continue;
      seenIds.add(id);
      const target = document.getElementById(id) || document.getElementsByName(id)[0];
      anchors.push({ id, exists: !!target, visible: target ? isVisible(target) : false });
    }
  }

  return { overflow, smallText, smallTargets, contrastFails, anchors, overlaps, nearOverlaps, clips, spacingGaps };
}

// ---- main ----

// Spacing-consistency assertion, reporting only (design decision 2026-08-23:
// the owner wants the real numbers before picking a threshold, not a gate
// that fails on day one). Reports the distribution of vertical gaps between
// top-level sections, pooled across pages and themes and grouped by width,
// since .section's own rule is a fluid clamp() tied to viewport width, not a
// fixed token -- the same gap value should recur constantly at a given width
// if the site's rhythm is actually consistent, and the spread/outliers are
// exactly what "too tight in one place, too loose somewhere else" looks like
// in numbers.
function printSpacingDistribution(samples) {
  console.log('\nSection-to-section vertical spacing, by width (reporting only, not a pass/fail gate):');
  const byWidth = new Map();
  for (const s of samples) {
    if (!byWidth.has(s.width)) byWidth.set(s.width, []);
    byWidth.get(s.width).push(s.gap);
  }
  for (const width of [...byWidth.keys()].sort((a, b) => a - b)) {
    const gaps = byWidth.get(width).sort((a, b) => a - b);
    const n = gaps.length;
    if (n === 0) continue;
    const sum = gaps.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    const median = n % 2 ? gaps[(n - 1) / 2] : (gaps[n / 2 - 1] + gaps[n / 2]) / 2;
    const counts = new Map();
    for (const g of gaps) counts.set(g, (counts.get(g) || 0) + 1);
    const topValues = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    console.log(
      `  width=${width}: n=${n} min=${gaps[0]}px max=${gaps[n - 1]}px mean=${mean.toFixed(1)}px median=${median}px`
    );
    console.log(
      `    most common values: ` +
      topValues.map(([v, c]) => `${v}px (x${c})`).join(', ')
    );
  }
}

async function main() {
  const pages = buildPageList();
  const server = await startServer();
  const port = server.address().port;
  const browser = await chromium.launch({ channel: 'chrome' });

  const violations = []; // { page, width, theme, kind, selector, measured, expected }
  const spacingSamples = []; // { page, width, theme, gap } -- reporting only, see the distribution summary
  let renders = 0;

  for (const rel of pages) {
    for (const width of WIDTHS) {
      for (const theme of THEMES) {
        const context = await browser.newContext({ viewport: { width, height: 900 } });
        try {
        await context.addInitScript(
          ({ key, value }) => {
            try {
              localStorage.setItem(key, value);
            } catch {
              // storage unavailable; the direct attribute set below still applies
            }
            // documentElement can be briefly null the instant this init script
            // runs (it fires before the page's own scripts, sometimes before
            // <html> exists yet); guard it, and re-apply on DOMContentLoaded
            // as a fallback so the attribute is never left unset.
            if (document.documentElement) document.documentElement.dataset.theme = value;
            document.addEventListener('DOMContentLoaded', () => {
              document.documentElement.dataset.theme = value;
            });
          },
          { key: THEME_KEY, value: theme }
        );

        const page = await context.newPage();
        const consoleErrors = [];
        page.on('console', (msg) => {
          if (msg.type() !== 'error') return;
          // Chromium's "Failed to load resource" console text carries a
          // status code but not the URL -- the URL only lives in the
          // message's source location. Fold it into the matched string so
          // the allowlist (assertion 4) can actually match on URL, the way
          // the header comment says it does, instead of silently never
          // matching network-failure messages.
          const loc = msg.location();
          const locUrl = loc && loc.url ? loc.url : '';
          consoleErrors.push(locUrl ? `${msg.text()} [${locUrl}]` : msg.text());
        });
        page.on('requestfailed', (req) => {
          consoleErrors.push(`request failed: ${req.failure()?.errorText || 'unknown'} ${req.url()}`);
        });
        page.on('pageerror', (err) => consoleErrors.push(String(err)));

        const url = `http://127.0.0.1:${port}/${rel}`;
        try {
          await page.goto(url, { waitUntil: 'load', timeout: 20000 });
        } catch (err) {
          violations.push({
            page: rel,
            width,
            theme,
            selector: 'document',
            measured: `failed to load (${err.message})`,
            expected: 'page loads',
            kind: 'load',
          });
          await context.close();
          continue;
        }
        await page.waitForTimeout(80); // let inline scripts / theme-init settle
        renders++;

        // re-assert theme directly, in case nav.js overwrote it after its own
        // early-return guard (pages missing .nav / .nav-menu-button / .nav-links)
        await page.evaluate((t) => {
          document.documentElement.dataset.theme = t;
        }, theme);
        await page.waitForTimeout(20);

        const checks = await page.evaluate(collectChecks, width);

        for (const v of checks.overflow) {
          violations.push({ page: rel, width, theme, kind: 'overflow', ...v });
        }
        if (width === 390) {
          for (const v of checks.smallText) {
            violations.push({ page: rel, width, theme, kind: 'font-size', ...v });
          }
          for (const v of checks.smallTargets) {
            violations.push({ page: rel, width, theme, kind: 'touch-target', ...v });
          }
        }
        for (const v of checks.contrastFails) {
          violations.push({ page: rel, width, theme, kind: 'contrast', ...v });
        }
        for (const v of checks.overlaps) {
          violations.push({
            page: rel,
            width,
            theme,
            kind: 'overlap',
            selector: `${v.selector} <-> ${v.selector2}`,
            measured: `"${v.sample}" overlaps "${v.sample2}"`,
            expected: 'independent text-bearing elements do not intersect',
          });
        }
        for (const v of checks.nearOverlaps) {
          violations.push({
            page: rel,
            width,
            theme,
            kind: 'near-overlap',
            selector: `${v.selector} <-> ${v.selector2}`,
            measured: `${v.gap}px gap ("${v.sample}" / "${v.sample2}")`,
            expected: '>= 4px gap (NEAR_OVERLAP_PX)',
          });
        }
        for (const v of checks.clips) {
          violations.push({ page: rel, width, theme, kind: 'clipping', ...v });
        }
        for (const gap of checks.spacingGaps) {
          spacingSamples.push({ page: rel, width, theme, gap });
        }
        for (const err of consoleErrors) {
          if (CONSOLE_ALLOWLIST.some((re) => re.test(err))) continue;
          violations.push({
            page: rel,
            width,
            theme,
            kind: 'console-error',
            selector: 'document',
            measured: err.slice(0, 200),
            expected: 'no console errors',
          });
        }

        // assertion 6, part 2: anchors land in viewport after navigating.
        // styles.css sets `scroll-behavior: smooth` on <html>, so a fragment
        // jump animates over several hundred ms; force it to `auto` here so
        // the position read right after setting location.hash is the final
        // one, not a mid-animation frame (that mismatch was read as a false
        // "offscreen" violation on every anchor before this override).
        if (checks.anchors.length > 0) {
          await page.evaluate(() => {
            document.documentElement.style.scrollBehavior = 'auto';
          });
        }
        for (const a of checks.anchors) {
          if (!a.exists) {
            violations.push({
              page: rel,
              width,
              theme,
              kind: 'anchor-missing',
              selector: `#${a.id}`,
              measured: 'target does not exist',
              expected: 'element with matching id/name',
            });
            continue;
          }
          if (!a.visible) continue; // legitimately hidden at this render; existence already checked

          await page.evaluate(() => {
            location.hash = '';
          });
          await page.evaluate((id) => {
            location.hash = `#${id}`;
          }, a.id);
          // nav.js's own snapToHash (see nav.js, "Same-page anchor pills")
          // deliberately re-snaps on hashchange, then again two rAF frames
          // later, then again on a 250ms setTimeout to catch late reflow
          // (a details block settling, a sticky-header height recompute).
          // Reading the position before that documented final re-snap fires
          // is reading a mid-settle frame, not where the anchor actually
          // lands -- wait past it.
          await page.waitForTimeout(350);

          const landed = await page.evaluate(
            ({ id, w }) => {
              const el = document.getElementById(id) || document.getElementsByName(id)[0];
              if (!el) return false;
              const r = el.getBoundingClientRect();
              const vh = window.innerHeight;
              return r.bottom > 0 && r.top < vh && r.right > 0 && r.left < w;
            },
            { id: a.id, w: width }
          );
          if (!landed) {
            violations.push({
              page: rel,
              width,
              theme,
              kind: 'anchor-offscreen',
              selector: `#${a.id}`,
              measured: 'target outside viewport after navigating to fragment',
              expected: 'target intersects viewport',
            });
          }
        }

        await context.close();
        } catch (err) {
          // A page that navigates itself away mid-check (a client-side
          // redirect, a live-data page reloading) destroys Playwright's
          // execution context underneath an in-flight page.evaluate and
          // throws here, not from the page.goto try/catch above (which
          // only guards the initial navigation). Without this, one such
          // page crashes the entire matrix and every other page's results
          // are lost with it -- confirmed 2026-08-23: a run past this point
          // died on "Execution context was destroyed, most likely because
          // of a navigation" and printed nothing. Record it as a violation
          // and keep going instead.
          violations.push({
            page: rel,
            width,
            theme,
            selector: 'document',
            measured: `render crashed (${err.message})`,
            expected: 'render completes without an unexpected navigation',
            kind: 'load',
          });
          await context.close().catch(() => {});
        }
      }
    }
  }

  await browser.close();
  server.close();

  console.log(`Render-matrix check: ${pages.length} page(s), ${renders} render(s) (width x theme combinations).`);

  printSpacingDistribution(spacingSamples);

  if (violations.length === 0) {
    console.log('\nRender-matrix check: no violations.');
    return;
  }

  const severity = {
    load: 0,
    'anchor-missing': 1,
    overlap: 2,
    clipping: 3,
    contrast: 4,
    'near-overlap': 5,
    'touch-target': 6,
    overflow: 7,
    'anchor-offscreen': 8,
    'font-size': 9,
    'console-error': 10,
  };

  const byPage = new Map();
  for (const v of violations) {
    if (!byPage.has(v.page)) byPage.set(v.page, []);
    byPage.get(v.page).push(v);
  }

  const pagesBySeverity = [...byPage.entries()].sort((a, b) => {
    const worstA = Math.min(...a[1].map((v) => severity[v.kind] ?? 9));
    const worstB = Math.min(...b[1].map((v) => severity[v.kind] ?? 9));
    if (worstA !== worstB) return worstA - worstB;
    return b[1].length - a[1].length;
  });

  console.error(`\nRender-matrix check failed. ${violations.length} violation(s) across ${byPage.size} page(s), most severe first:\n`);
  for (const [pageName, vs] of pagesBySeverity) {
    console.error(`${pageName}`);
    const sorted = [...vs].sort((a, b) => (severity[a.kind] ?? 9) - (severity[b.kind] ?? 9));
    for (const v of sorted) {
      console.error(
        `  [${v.kind}] width=${v.width} theme=${v.theme} selector=${v.selector}\n` +
        `      measured: ${v.measured}\n` +
        `      expected: ${v.expected}` +
        (v.sample ? `\n      text: "${v.sample}"` : '')
      );
    }
  }

  const blocking = process.env.RENDER_GATE_BLOCKING === 'true';
  if (blocking) {
    process.exit(1);
  } else {
    console.error(`\n(RENDER_GATE_BLOCKING is not "true": reporting only, not failing the build.)`);
  }
}

await main();
