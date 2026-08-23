# BREAK.md: interactive audit

Method: static read of every file under `demos/`, `chain-comparer.html`, `model-picker.html`,
and every page that embeds a demo via `<iframe>`; syntax-checked every inline `<script>` block
with `node --check` to catch the apostrophe-class parse error the same way it actually shipped;
served the tree on `localhost:4214` and drove it with a real Chrome instance (`javascript_tool`
executing in-page, plus `resize_window` for viewport, plus a network kill-switch that replaces
`window.fetch` before reload) via the Claude_Browser MCP tools. Playwright's `chromium.launch`
was unavailable in this environment (no `npm`/`npx`, no local Playwright install, no system
Chrome binary reachable from the sandboxed node), and the shared browser pane was being
actively driven by other concurrent agents for the whole session, which repeatedly hijacked the
one tab available mid-script; every finding below marked "confirmed in browser" survived a
same-origin re-check (`location.href` verified inside the same script) to rule out a raced read.
Findings marked "confirmed by code" were not independently reproduced in the browser this pass
but are unambiguous from the call site plus the DOM; reproduction steps are given so anyone can
check in ten seconds.

## Top 10 defects most likely to be hit by a normal person doing a normal thing

1. **Every embedded demo on a content page clips its own content, at every viewport.** Confirmed
   in browser at both 390px and 1280px. Content pages embed demos in `<iframe scrolling="no"
   style="height:600px">` (520px for `supply-split`) with no resize signaling between the demo
   and its parent. Measured actual embed-mode content height against the fixed iframe: `fair-launch`
   1453–1460px into a 600px box, `confirmation-risk` 936px, `fee-market` 962px, `dag-time` 885px,
   `ghostdag-playground` 880px, `covenant-breaker` 975–986px, `collision-sim` 843px,
   `parameterless` 1017px, `emission-schedule` 775px, `attack-cost` 720px, `supply-split` 679px
   into 600px. 11 of 15 embeds tested overflow their box with scrolling disabled, so the bottom
   third to half of the demo is simply gone, unreachable, not just below the fold. This hits
   anyone who scrolls to a demo on `argent-explained.html`, `build-on-kaspa.html`,
   `kaspa-mining.html`, `kips.html`, `kaspa-origin-story.html`, `what-is-kaspa.html`,
   `why-kaspa-matters.html`, `crypto-from-scratch.html`, `start-here.html`, `utxo-vs-accounts.html`,
   or `skeptical-case.html`. Repro: open any of those pages, scroll to the embedded demo, note it
   cuts off mid-content with no scrollbar. `demos/index.html`'s own card previews use a
   `ResizeObserver` to fit dynamically (see `demos/index.html:196,370-371`); none of the
   content-page embeds do.

2. **`chain-comparer.html`'s "claims vs. measured" gap table never renders, on this build and on
   the live site.** Confirmed by code, in both places. `buildGap()` is called unconditionally
   during setup (`chain-comparer.html:483`) and its own first line is
   the early-return guard on line 649, with the comment "this panel's container markup isn't
   shipped on the page, skip instead of crashing." No element with `id="ccGap"` exists anywhere
   in the file. Grep
   confirms it on `kaspaexplained.com/chain-comparer.html` too (`curl` shows the same two dead
   references, zero container). The surrounding comment calls this "the whole point of the panel."
   It is not a crash, which is exactly why nobody has noticed: it fails silently, exactly the
   failure mode the apostrophe bug should have taught this codebase to distrust. Repro: open
   chain-comparer.html, devtools console, `document.getElementById('ccGap')` returns `null`.

3. **No `<noscript>` fallback on any of the 21 interactive files.** Grepped every file under
   `demos/`, `chain-comparer.html`, `model-picker.html`: zero `<noscript>` tags anywhere. With
   JavaScript off, every demo renders its static markup shell: labels, a slider or button at its
   HTML-default value, no computed numbers, no "this needs JavaScript" message. A reader with
   scripting disabled sees dead controls with no explanation of why.

4. **`live-network.html` and `attack-cost.html`'s live claims are genuine and well-guarded. Verify
   the labeling, not just the claim.** Confirmed in browser: `attack-cost.html`'s `#liveStatus`
   read "Hash rates and market values read live just now." after a real load (hash rate from
   api.kaspa.org/mempool.space/litecoinspace.org, price from Kraken). This is not a defect, it's
   flagged so nobody re-flags it after a curl check gets a CORS-blocked response and assumes it's
   fake the way the last false claim shipped. `emission-schedule.html`'s `fetchLive()` (line
   446–470) and `live-network.html`'s poll loop (line 592) both have honest failure text
   ("Network unreachable. Showing a reading from ...", "Can't reach the public API right now.
   Retrying every 9 seconds.") rather than silently freezing on stale numbers. Reviewed by code,
   not re-verified live this pass due to tab contention, but the catch paths are unconditional and
   unambiguous.

5. **`node-cost.html` has exactly one control** (`hoursSlider`, a single 0–36 range) plus a zoom
   button. It's a static bar comparison of disk footprint across chains that a slider nudges
   slightly. No moment, no surprise, nothing that couldn't be a paragraph with a table. See "not
   worth using" below.

6. `demos/mass-calculator.html` and `demos/fee-market.html` were stress-tested in browser: every
   range slider driven to both extremes and back, all buttons double-clicked rapid-fire, theme
   toggled mid-interaction. No `NaN`, `Infinity`, or `undefined` leaked into the rendered text in
   either case, and no page-specific console errors. Both hold up under the exact abuse pattern
   that broke chain-comparer.html. Listed here as things that did *not* break, so the ten-item list
   above isn't read as exhaustive of demo count. Most of the 17 demos are solid; the failures
   cluster in the embed layer and in one dead panel, not in the per-demo interaction logic.

7. `covenant-breaker.html`'s two `<input type="number">` fields (`amount`, `elapsed`) have no
   `isNaN` guard in the surrounding code, but both reads go through
   `Math.max(0, parseInt(x, 10) || 0)` (lines 620, 719, 721), which already absorbs `NaN`, empty
   string, and negative input to `0`. Checked by code; not a live defect, but worth knowing this is
   the only numeric-text-input surface in any demo, and it's the one that happens to be guarded.

8. `demos/live-network.html` runs `setInterval(tick, POLL_MS)` with no matching `clearInterval`
   anywhere in the file (grep confirms 1 `setInterval`, 0 `clearInterval`). Not a live defect on
   this static multi-page site, since there's no SPA router to leak the interval across navigations,
   but flagged because it's the only demo with an uncleared timer, in case this codebase ever
   gains client-side routing.

9. Server behavior note, not a site defect: this site's production routing serves clean URLs
   (`/demos/attack-cost`, no `.html`) and the pages themselves prefetch neighboring demo routes
   with a `?preview=1` query string on hover (visible in `demos/index.html`'s network traffic). A
   naive static file server that doesn't map extensionless paths to `.html` and drop query strings
   will 404 on every one of those prefetches. Confirmed this is a test-harness artifact, not a
   production bug, by fixing the local server's routing and re-checking, but any other tester
   spinning up a quick local server for this repo will hit the identical false positive and should
   not report it as a broken link.

10. Two files were not exercised as thoroughly as the rest this pass:
    `demos/argent-pipeline.html` and `demos/collision-sim.html` got embed-height checks only (see
    #1); their in-page control-by-control stress test (drag-to-extremes, rapid double-click,
    text-field fuzzing) was not completed before the browser tab was reclaimed by another agent
    for the final time. Re-run before shipping if either changed recently.

## Demos judged not worth using as-is

- **`node-cost.html`**: one slider, no discovery moment. The payoff ("Kaspa's stays near 50 GB
  regardless of how long the chain has run") is stated in the meta description; the demo doesn't
  make you find that out, it just lets you nudge a slider across a chart that already shows it.
  This is the shape of demo the owner already called "boring, dull, dumb," not broken, just not
  worth the click. Fix direction: give it a moment where the reader is surprised, for example race the
  reader's intuition (guess whether Kaspa's line keeps climbing) against the actual flat curve
  animating in, instead of a static chart nudged by a slider.

- **`chain-comparer.html`'s gap panel**, once #2 above is fixed and the table actually renders, is
  probably the single most interesting thing on the page: real claim-vs-measured ratios, several
  of them absurd (Sui claims 3,200x its observed rate). Right now a reader never sees it, which
  means the current shipped experience of chain-comparer.html is weaker than the code backing it
  deserves. Not "not worth using" on the merits: worth using and currently not deliverable.

Everything else under `demos/` (`ghostdag-playground`, `confirmation-risk`, `dag-time`,
`emission-schedule`, `fair-launch`, `fee-market`, `mass-calculator`, `attack-cost`, `covenant-breaker`,
`zk-boundary`, `fair-launch`, `supply-split`, `utxo-vs-accounts`, `shared-state`, `live-network`,
`parameterless`, `collision-sim`) has a real, findable moment (a race that resolves, a reorg that
gets refused, a proof that fails on the thing it can't prove) and earns its interactivity on
inspection of its own script. `model-picker.html`'s ten dials reorder a real ranking live and held
up under a slam-to-max stress test with no NaN. None of these are flagged as dull.
