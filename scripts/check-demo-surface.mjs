/**
 * Demo-surface gate (design/STANDARD.md, "A demo's surface budget", added
 * 2026-08-25).
 *
 * THE DEFECT THIS CATCHES. The 300-word surface rule (scripts/check-
 * visible-words.mjs) is enforced per PAGE, or per SECTION on the pages
 * listed in scripts/essay-pages.json's per_section_pages (kaspa-mining.html,
 * build-on-kaspa.html, why-kaspa-matters.html, kaspa-origin-story.html,
 * crypto-from-scratch.html, what-is-kaspa.html, kips.html, argent-
 * explained.html, plus three pages that are not demo hosts). It is never
 * enforced per DEMO. A page can carry that per-section exemption for a good
 * reason -- "a reader arrives already knowing which proposal they want," for
 * example -- while an interactive demo embedded partway down that same page
 * is the one thing a stranger actually lands on cold. The page-level
 * reasoning does not transfer to the demo, so nothing has ever stopped a
 * demo's own visible surface from growing arbitrarily large, on any page,
 * governed or exempt. This gate closes that hole by measuring each demo on
 * its own, independent of which page hosts it.
 *
 * WHAT COUNTS AS A DEMO, AND WHERE ITS BOUNDARY IS. The site has no single
 * markup convention for "this is a demo" (a <section>, a plain <div>, or a
 * <details> body all show up in practice), but it has one consistent
 * naming tell: every interactive widget on the site carries "demo" in its
 * own id or class, confirmed by grepping every *.html file's id="..." and
 * class="..." attributes for /demo/i before writing this selector. That is
 * also the exact convention scripts/check-page-height.mjs already treats as
 * a landmark (`[class*="demo"]`), so this script matches it rather than
 * inventing a second convention for the same word.
 *
 * A demo's boundary is the outermost element on the page whose id or class
 * contains "demo" (case-insensitive). "Outermost" matters: several demos
 * nest an inner class like `.wrap` or a second demo-named node inside the
 * container that actually starts the widget (e.g. kaspa-mining.html's
 * `#emission-schedule` guide-detail wraps a `.es-demo` div), and the goal is
 * one boundary per demo, not one per matching descendant. Matches nested
 * inside another match are dropped, keeping only the outermost, the same
 * de-duplication check-page-height.mjs already runs for its landmark list.
 * A handful of demos identify themselves by id only, without "demo" in a
 * class (what-is-kaspa.html's #collision-sim, #ghostdag-demo, #masscalc-
 * demo, #livenet-demo container ids), which the id-side of the same match
 * already covers -- no separate list was needed.
 *
 * THE STATE A DEMO IS MEASURED IN (rewritten 2026-08-25, after a planted
 * 140-word fixture inside kips.html's #parameterless-demo produced "no
 * violations" whether the fixture was there or not). The first version of
 * this script measured every demo exactly as raw page load leaves it, and
 * routed any demo sitting inside a closed <details> at that point into a
 * separate "collapsed, not scored" bucket. More than half this site's
 * demos sit behind their own single-click entry-point <details> by the
 * site's own default-collapsed convention, so more than half this site's
 * demos -- kips.html's KIP-2 demo among them, the one this gate exists to
 * police -- were structurally exempt from the word count no matter what
 * was inside them.
 *
 * A reader does not meet a demo in that raw, everything-closed state; they
 * meet it by clicking its entry point, or by a link that lands them on it
 * directly, and this site already has code for exactly that: nav.js's
 * revealAncestorDetails(target), the reason /kaspa-mining#node-cost opens
 * that demo on arrival while /kaspa-mining does not. openEntryPoint()
 * below is that same algorithm, applied with the demo's own boundary as
 * the target: open every closed <details> ancestor of the boundary
 * (opening the boundary itself if it is one, since the walk starts there),
 * plus any details[data-fragment-demo] found inside a non-details
 * boundary, matching nav.js's own fragment-demo branch. Word count is
 * taken in that state, then those ancestors are closed again immediately
 * so one demo's measurement cannot leak into the next demo on the same
 * page. Anything still closed after that single accepted click stays
 * closed and correctly does not count -- genuine depth the reader chose
 * not to open, not burial (see buriedCheck() below for what does count as
 * burial). Every demo is scored against the budget; none are exempted for
 * having started closed.
 *
 * Every visible word inside the boundary, in that state, counts, using the
 * identical rendered-DOM visibility test scripts/check-visible-words.mjs
 * already uses (skip script/style/svg/nav/header/footer, checkVisibility()
 * with opacity and CSS checks, aria-hidden ancestor check, the 1x1
 * sr-only clip pattern) so the two gates cannot disagree about what
 * "visible" means for the same text node -- with one further exclusion,
 * described in isChrome() below: the interface itself (control labels,
 * button text, output values, headings, readout/verdict/gauge/status-pill
 * regions) does not count either. See isChrome() for why and what exactly
 * is excluded.
 *
 * A demo nested inside another demo's boundary is not double-counted (the
 * outermost-only match above already guarantees this).
 *
 * THE BUDGET: 120 visible words, on arrival, inside a demo's own boundary.
 * Justification: the two demos the owner has already implicitly approved
 * by never flagging them are index.html's collision-sim instance (122
 * visible words, on a page explicitly rebuilt to the Apple test 24 August
 * 2026) and the same demo's full write-up on what-is-kaspa.html before this
 * pass. 120 is chosen just under that approved figure rather than above it,
 * so the ceiling reflects what has actually read as right-sized rather than
 * a number backed into from what currently happens to fit. This is
 * deliberately tighter than the whole-page 300-word ceiling: a demo is a
 * component on a page, not the page, and a stranger who has scrolled to a
 * demo already has page-level context around it (a heading, a lede) that a
 * bare demo dropped on a route-page would not have -- the demo itself only
 * needs to say what it is and what to touch, not re-argue the page's whole
 * case. Longer methodology, guarantees, derivations, and worked examples
 * belong behind one of the site's disclosure mechanisms (info affordance,
 * term-definition reveal, secondary view, or a details triangle), per
 * design/STANDARD.md's "Ten ways to hide something" -- they do not need to
 * disappear, only to stop sitting open on arrival.
 *
 * Advisory for now, behind DEMO_SURFACE_BLOCKING, same pattern as
 * VISIBLE_WORDS_BLOCKING, RENDER_GATE_BLOCKING, and PAGE_HEIGHT_BLOCKING in
 * scripts/check-site.sh. Flip it to blocking once every demo is under
 * budget.
 *
 * Usage: node scripts/check-demo-surface.mjs
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
    console.log('SKIPPED demo-surface check: playwright not installed');
    process.exit(0);
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const DEMO_BUDGET = 120;

const manifest = JSON.parse(readFileSync(path.join(ROOT, 'site-manifest.json')));

// Same isRedirectStub / NOT_A_DESTINATION convention every other render
// script in this repo uses (check-visible-words.mjs, check-page-height.mjs,
// check-broken-and-blank.mjs): a redirect stub has no content of its own,
// and navigating one destroys the page context mid-evaluate. demos/*.html
// are all such stubs since the demos were inlined into their topic pages on
// 23 August 2026 -- the live copies this script measures live in the
// manifest pages, not in demos/.
const isRedirectStub = (rel) => {
  try {
    return /http-equiv=["']refresh["']/i.test(readFileSync(path.join(ROOT, rel), 'utf8'));
  } catch {
    return false;
  }
};

// 404.html is not a real destination for link-graph purposes (see
// NOT_A_DESTINATION in check-broken-and-blank.mjs / build-sitemap.py /
// check-html.py / check-redirect-stubs.sh) and carries no demo, so it is
// skipped the same way those scripts skip it.
const NOT_A_DESTINATION = new Set(['404.html']);

const pages = manifest.pages.filter((rel) => !isRedirectStub(rel) && !NOT_A_DESTINATION.has(rel));

// Runs inside the page. Finds every outermost demo-boundary element, then
// for each one counts visible words strictly inside it using the same
// visibility test as scripts/check-visible-words.mjs.
function findDemoSurfaces() {
  const all = Array.from(document.querySelectorAll('[id],[class]')).filter((el) => {
    const id = el.id || '';
    const cls = typeof el.className === 'string' ? el.className : '';
    return /demo/i.test(id) || /demo/i.test(cls);
  });
  // Keep only outermost matches: drop any match nested inside another match.
  const set = new Set(all);
  const outermost = all.filter((el) => {
    let p = el.parentElement;
    while (p) {
      if (set.has(p)) return false;
      p = p.parentElement;
    }
    return true;
  });

  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'SVG', 'NAV', 'HEADER', 'FOOTER', 'TEMPLATE', 'NOSCRIPT']);

  // THE MEASUREMENT ITSELF ONLY COUNTS PROSE (corrected 2026-08-25, after
  // the first version of this budget counted a demo's own controls and
  // readouts against it -- which is exactly backwards, and is what made
  // "wrap the sliders in a details" look like a legitimate way to hit the
  // number on kips.html's KIP-2 demo. The owner's correction: the budget
  // applies to the prose framing a demo, never to the interface a reader
  // operates. So this excludes, in addition to the invisible/hidden checks
  // below, every element that IS that interface rather than prose about
  // it:
  //   - label            a control's own label ("Block rate (blocks/sec)")
  //   - button           a control's own text ("Healthy (0.5 s)"); this
  //                      also removes an info-affordance__trigger's own
  //                      text, which is already just an aria-hidden glyph
  //   - output           a live-computed value ("124", "4.3 min")
  //   - h1-h6            a heading names a section or a side of a
  //                      comparison, the same reason headings are not
  //                      landmarks in check-page-height.mjs -- it tells a
  //                      reader what is there, it is not the reading
  //                      itself
  //   - [class*="valline"]     the site's own convention for one line
  //                            pairing a control with its live value
  //                            (confirmed by grepping every demo's own
  //                            slider-readout markup before writing this
  //                            list)
  //   - [class*="verdict"]     a short pass/fail line tied to a gauge
  //   - [class*="gauge"]       the gauge/output row itself
  //   - [class*="status-pill"] a short state tag ("Live", "Research")
  // Deliberately NOT excluded: a role="status" region or a class
  // containing "payoff" or "result" whose content is a full explanatory
  // sentence rather than a bare value -- kips.html's own payoff-line
  // ("At 10 blocks/sec, GHOSTDAG's margin sits at k=124 against
  // DAGKnight's k=18. The paper's own no-visible-attack bound puts...")
  // is prose synthesizing the comparison, not a value with a unit, and a
  // reader has to read it the same way they read the lede. A demo whose
  // "payoff" element is actually just a bare value should use .valline or
  // <output> for it instead, which this measurement already excludes.
  const CHROME_SEL = 'label,button,output,h1,h2,h3,h4,h5,h6,[class*="valline"],[class*="verdict"],[class*="gauge"],[class*="status-pill"]';

  function isChrome(el, root) {
    let p = el;
    while (p && p !== root.parentElement) {
      if (p.matches && p.matches(CHROME_SEL)) return true;
      p = p.parentElement;
    }
    return false;
  }

  function countVisibleWordsIn(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        let el = node.parentElement;
        while (el && el !== root.parentElement) {
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
      while (ancestor && ancestor !== root.parentElement) {
        if (ancestor.getAttribute && ancestor.getAttribute('aria-hidden') === 'true') {
          ariaHidden = true;
          break;
        }
        ancestor = ancestor.parentElement;
      }
      if (ariaHidden) continue;

      const rect = el.getBoundingClientRect();
      if (rect.width <= 1 && rect.height <= 1) continue; // clip-based sr-only pattern

      if (isChrome(el, root)) continue; // control label, button, output, heading, readout, verdict, pill

      const count = text.split(/\s+/).filter(Boolean).length;
      words += count;
      if (samples.length < 8) samples.push(text.slice(0, 90));
    }
    return { words, samples };
  }

  // THE ARRIVAL STATE (rewritten 2026-08-25, after a planted 140-word
  // fixture inside kips.html's #parameterless-demo produced "no
  // violations" in both the planted and removed states). The bug: this
  // measured every demo exactly as it sits in the raw DOM on a plain page
  // load, then routed any demo that turned out to be inside a closed
  // <details> into a separate "collapsed, not scored" bucket. Ten of this
  // site's twenty demos sit behind their own single-click entry-point
  // <details> by the site's own default-collapsed convention, so ten of
  // twenty demos -- including kips.html's KIP-2 demo, the one this whole
  // gate exists to police -- were structurally unmeasurable and always
  // reported "no violations" regardless of what prose sat inside them.
  //
  // A reader does not meet a demo in that raw, everything-closed state.
  // They meet it by clicking the entry point, or by following a link that
  // lands them on it directly -- and this site already has code for
  // exactly that: nav.js's revealAncestorDetails(target), which is why
  // /kaspa-mining#node-cost opens the node-cost demo on arrival while
  // /kaspa-mining does not. This function is that same algorithm, applied
  // with the demo's own boundary element as the target, so "the state a
  // reader actually meets it in" is not a guess this script invents but
  // the site's own real navigation behavior:
  //
  //   1. Walk from the boundary up to the document root, opening every
  //      closed <details> ancestor found along the way (nav.js's own
  //      loop). If the boundary itself is a closed <details> -- true for
  //      more than half this site's demos, e.g. kips.html's
  //      #parameterless-demo -- it gets opened here too, since the walk
  //      starts at the boundary itself, exactly like nav.js starting at
  //      its target.
  //   2. If the boundary itself is NOT a <details> (e.g. build-on-kaspa's
  //      #zk-boundary-demo, a plain <section>), also open any
  //      details[data-fragment-demo] found INSIDE the boundary -- nav.js's
  //      own fragment-demo branch, which is how a demo whose actual entry
  //      point is a details sitting a few elements below its linked anchor
  //      still opens correctly.
  //   3. Anything still closed after that -- an inner methodology
  //      disclosure, a second comparison the reader hasn't asked for --
  //      stays closed. That is genuine depth the reader chose not to open,
  //      not burial, and correctly does not count.
  //
  // Ancestors opened here are recorded and closed again immediately after
  // this demo's word count is taken, so opening one demo's entry point
  // cannot leak into the next demo's measurement on the same page.
  function openEntryPoint(el) {
    const opened = [];
    let node = el;
    while (node) {
      if (node.tagName === 'DETAILS' && !node.open) {
        node.open = true;
        opened.push(node);
      }
      node = node.parentElement;
    }
    if (el.tagName !== 'DETAILS') {
      el.querySelectorAll('details[data-fragment-demo]').forEach((d) => {
        if (!d.open) {
          d.open = true;
          opened.push(d);
        }
      });
    }
    return opened;
  }

  // THE BURIED-DEMO CHECK (added 2026-08-25, after this gate's word budget
  // was met by wrapping an entire slider/output panel in a second, inner
  // closed <details> -- kips.html's KIP-2 demo passed the word count with
  // zero controls and zero readouts visible, which is worse than the
  // 395-word version it replaced. The owner's correction: a demo's
  // controls and its primary readouts are never surface words to be
  // reduced. They are what the budget exists to protect. This check is
  // separate from and takes priority over the word count below.
  //
  // A demo commonly sits behind its own single "Try it" entry-point
  // <details> (kaspa-mining's emission-schedule and attack-cost,
  // kaspa-origin-story's dag-time and fair-launch, what-is-kaspa's
  // livenet-demo, kips.html's own outer KIP-2 and supply-split wrappers).
  // That is not burial -- it is the site's established one-click pattern,
  // and every demo on the site already gets this same single click via
  // whatever wraps it. Burial is specifically a SECOND, inner closed
  // <details> that hides the controls or readouts even after that outer
  // entry point is opened, which is exactly what happened here: the outer
  // "Try it" opened onto a lede and then another closed triangle with
  // nothing else visible.
  //
  // So this check opens every closed <details> ANCESTOR of the demo
  // boundary (simulating "the reader already clicked to reach the demo"),
  // but deliberately leaves any closed <details> INSIDE the boundary
  // alone, then asks: with the demo reached, is at least one control and
  // at least one readout actually visible? Ancestor state is restored
  // immediately after, so this probe cannot affect the word count measured
  // elsewhere in this function.
  //
  // Controls: input/select/textarea/button, excluding an
  // info-affordance__trigger (the small (i) hint icon is not one of the
  // demo's own primary controls, and a demo whose only "visible button" is
  // an unrelated hint trigger while its sliders stay buried must still
  // fail). Readouts: <output>, [role="status"] (the site's convention for
  // a live verdict/result region, e.g. .verdict, .payoff-line), and any
  // element whose class contains "readout", "verdict", "payoff", or
  // "stat" (confirmed by grepping every demo's markup for its own output
  // convention before writing this list: .big-readout, .payoff-line,
  // .verdict, .stat all appear this way across different demos). A demo
  // with zero controls, or zero matching readout elements, is not judged
  // on that axis at all -- some demos are legitimately control-free or use
  // a convention this list does not anticipate, and this check should
  // never invent a failure for a demo it cannot correctly interpret.
  function buriedCheck(el) {
    // Deliberately NOT a checkVisibility() probe. A demo's own readout
    // legitimately starts CSS-hidden until the reader interacts (e.g.
    // build-on-kaspa's zk-boundary demo shows its consequence panel only
    // after "Generate proof" is clicked) -- that is normal progressive
    // reveal, not burial, and checkVisibility() cannot tell the two apart.
    //
    // What actually happened to kips.html's KIP-2 demo was structural, and
    // specifically TWO closed <details> deep: the demo's own boundary is
    // itself the single-click entry point (e.g. kips.html's
    // #parameterless-demo, a <details> a reader opens once to reach the
    // demo -- the same one-click convention kaspa-mining's emission-
    // schedule, attack-cost, kaspa-origin-story's dag-time and fair-
    // launch, and what-is-kaspa's livenet-demo all already use, none of
    // which are burial), and then its controls were wrapped in a SECOND,
    // inner closed <details> that stayed shut even after that first click.
    // One accepted entry-point click is the norm; a second one hiding the
    // controls or readouts behind it is the defect. So this counts every
    // closed <details> ancestor of a control/readout, from that node all
    // the way to the document root (not just within the boundary, since
    // the boundary's own closed state is exactly the one accepted click)
    // -- one is fine, two or more is burial.
    function closedDetailsDepth(node) {
      let depth = 0;
      let p = node.parentElement;
      while (p) {
        if (p.tagName === 'DETAILS' && !p.open) depth++;
        p = p.parentElement;
      }
      return depth;
    }

    const controls = Array.from(el.querySelectorAll('input,select,textarea,button')).filter(
      (c) => !c.classList.contains('info-affordance__trigger')
    );
    const readouts = Array.from(
      el.querySelectorAll('output,[role="status"],[class*="readout"],[class*="verdict"],[class*="payoff"],[class*="stat"]')
    ).filter((r) => !controls.includes(r));

    const hasControls = controls.length > 0;
    const hasReadouts = readouts.length > 0;
    const buriedControls = hasControls && controls.every((c) => closedDetailsDepth(c) >= 2);
    const buriedReadouts = hasReadouts && readouts.every((r) => closedDetailsDepth(r) >= 2);

    return { hasControls, hasReadouts, buriedControls, buriedReadouts };
  }

  return outermost.map((el) => {
    const id = el.id || null;
    const cls = typeof el.className === 'string' ? el.className : '';

    // Order matters. buriedCheck() must run against the pristine,
    // untouched DOM -- it is answering "does a reader who has already
    // clicked this demo's one accepted entry point still find nothing to
    // touch," and opening that entry point first would erase the very
    // ancestor it needs to see. neededEntryClick records whether the
    // demo's own boundary started closed (informational: did this demo
    // require the one accepted click, or was it already open), computed
    // before openEntryPoint mutates anything. Word count then runs in the
    // arrival state (entry point opened, per openEntryPoint above), and
    // the opened ancestors are restored immediately after so the next
    // demo on this page starts from the same pristine state.
    const buried = buriedCheck(el);
    const neededEntryClick = el.matches('details:not([open])') || !!el.closest('details:not([open])');
    const openedAncestors = openEntryPoint(el);
    const { words, samples } = countVisibleWordsIn(el);
    openedAncestors.forEach((d) => {
      d.open = false;
    });

    return {
      selector: id ? `#${id}` : `.${cls.split(/\s+/)[0]}`,
      neededEntryClick,
      words,
      samples,
      buried,
    };
  });
}

function urlFor(rel) {
  return pathToFileURL(path.join(ROOT, rel)).href;
}

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
const results = [];
const failures = [];
const buriedFailures = [];

for (const rel of pages) {
  const url = urlFor(rel);
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 20000 });
  } catch (err) {
    failures.push(`${rel}: could not load (${err.message})`);
    continue;
  }
  await page.waitForTimeout(60); // let inline scripts finish populating readouts

  const demos = await page.evaluate(findDemoSurfaces);
  for (const d of demos) {
    results.push({ page: rel, ...d });
    // Buried-demo check takes priority and applies regardless of word
    // count: a demo whose controls and readouts are hidden behind an
    // inner closed <details>, even after its own single accepted entry
    // point is opened, is not "under budget," it is broken. See
    // buriedCheck() above.
    if (d.buried.buriedControls) {
      buriedFailures.push(`${rel} ${d.selector}: controls not visible on arrival (buried behind an inner disclosure)`);
    }
    if (d.buried.buriedReadouts) {
      buriedFailures.push(`${rel} ${d.selector}: readouts not visible on arrival (buried behind an inner disclosure)`);
    }
    // Every demo is scored, full stop. The earlier version of this gate
    // exempted any demo that sat inside a closed <details> at raw page
    // load from the word count entirely -- ten of this site's twenty
    // demos, kips.html's KIP-2 demo among them -- which is exactly the
    // loophole that let that demo's prose grow unchecked while this gate
    // printed "no violations." Word count is now taken with the demo's
    // own entry point opened (see openEntryPoint above), so it reflects
    // what a reader actually meets, and there is no longer a bucket that
    // skips the check.
    if (d.words > DEMO_BUDGET) {
      failures.push(`${rel} ${d.selector}: ${d.words} visible words on arrival (limit ${DEMO_BUDGET})`);
    }
  }
}

await browser.close();

results.sort((a, b) => b.words - a.words);

console.log(`Demo-surface check: ${results.length} demo(s) found across ${pages.length} page(s).`);
console.log(`Budget: ${DEMO_BUDGET} visible words on arrival, per demo (see script header for why). ` +
  'Measured with the demo\'s own entry-point disclosure opened, matching nav.js\'s ' +
  'revealAncestorDetails -- the state a reader actually meets a demo in, not raw page load. Every ' +
  'demo is scored; none are exempted for having started closed.\n');

console.log('Demos, worst first:');
for (const r of results) {
  const flag = r.words > DEMO_BUDGET ? '  OVER' : '';
  const clickNote = r.neededEntryClick ? '  (opened one entry-point disclosure to measure)' : '';
  console.log(`  ${r.page.padEnd(28)} ${r.selector.padEnd(28)} words=${String(r.words).padStart(4)}${flag}${clickNote}`);
}

if (buriedFailures.length) {
  console.error(`\nDemo-surface check failed. ${buriedFailures.length} demo(s) have their controls or readouts buried:`);
  buriedFailures.forEach((f) => console.error('  ' + f));
  console.error(
    '\nA demo\'s controls and its primary readouts are never surface words to be reduced -- they are ' +
    'the thing the budget exists to protect. If a word-count fix leaves a slider or a result hidden ' +
    'behind a second, inner closed disclosure, that is not compliance, it is worse than the defect this ' +
    'gate exists to catch: a reader who reaches the demo still finds nothing to touch. Move PROSE ' +
    '(methodology, caveats, derivations, sources, worked examples) behind a mechanism instead, or report ' +
    'that the word budget is wrong for a demo of this complexity.'
  );
}

if (failures.length) {
  console.error(`\nDemo-surface check failed. ${failures.length} demo(s) over budget, worst first:`);
  failures
    .sort((a, b) => {
      const wa = Number(a.match(/: (\d+) visible/)?.[1] ?? 0);
      const wb = Number(b.match(/: (\d+) visible/)?.[1] ?? 0);
      return wb - wa;
    })
    .forEach((f) => console.error('  ' + f));
  console.error(
    '\nMove methodology, caveats, derivations, sources, and worked examples behind a mechanism ' +
    '(info affordance, term-definition reveal, secondary view, or a details triangle -- vary it, ' +
    'design/STANDARD.md, "Ten ways to hide something"). Leave on the surface only what the reader ' +
    'needs to know what they are looking at and what to touch. Do not cut a number, a caveat, or a ' +
    'citation to make the count.'
  );
}

if (buriedFailures.length || failures.length) {
  process.exit(1);
}

console.log('\nDemo-surface check: no violations.');
