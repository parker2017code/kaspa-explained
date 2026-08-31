# UX audit

Scope: every page in `site-manifest.json` except `the-instrument.html`, plus every
demo named in the brief. Local server: `python3 scripts/serve-local.py --port 4633`.

Method:
- Overflow at 390px: scripted (Playwright, headless Chromium, real 390px viewport)
  across all 21 pages, twice: once on cold load, once after opening every `<details>`
  and clicking every visible button (to catch overflow that only appears after
  interaction). Both passes: zero overflow on every page.
- Component states / focus-visible: scripted (Playwright) real keyboard `Tab`
  traversal across all 21 pages at 1280px, every focusable element, checking
  `:focus-visible` against a computed-style ring (outline or box-shadow). Zero
  elements lacked a visible ring. Total elements tabbed: 950 across 21 pages.
- Demos: driven live in a real browser (the Claude Browser pane), not read from
  source. Every named demo's primary control was operated via a real DOM event
  (`input`/`click`) and the resulting readout was read back as rendered text.
- Newcomer four questions: judged from the actual rendered lede + first
  interaction's readout, not from source comments.
- Cross-page consistency: grepped shared component patterns (reset buttons,
  `.reality-table`, status chips) across every page that uses them.

Verdict key: PASS = confirmed working as rendered. DEFECT = confirmed broken,
fixed, and re-verified. Perspective: E = expert/scripted, N = novice (four-question
read).

## Sitewide automated findings

| Check | Pages covered | Result |
| --- | --- | --- |
| Horizontal overflow at 390px, cold load | 21/21 | PASS, 0 overflow |
| Horizontal overflow at 390px, after opening all `<details>` + clicking every button | 21/21 | PASS, 0 overflow |
| Keyboard focus-visible ring on every focusable element | 21/21, 950 elements tabbed | PASS, 0 missing |

Both checks re-run after the fix below; no regression.

## Defect found and fixed

**`.reality-table tr[hidden]` did not hide below 700px wide.** `styles.css`
line ~3135, inside `@media (max-width: 700px)`, set `.reality-table tr { display:
block }` (class selector, specificity 0,1,1) to turn table rows into stacked
mobile cards. That selector outranks the browser's own `[hidden] { display: none }`
rule (0,1,0), so any row a page's JS filter hid via the native `hidden` attribute
stayed visually on screen below 700px, even though its `hidden` property and any
adjacent result count were correct. Confirmed on `model-picker-data.html`: search
for "Claude Opus" set `hidden=true` on 220 of 230 rows and the count readout said
"10 of 230 cells match," but at 375px all 230 rows still rendered
(`display: block`); at 1280px the same filter correctly hid them
(`display: none`). Re-checked `status.html`'s two `.reality-table`s (`stFeatures`,
`stClaims`) under the same filter mechanism at 375px: same bug, confirmed present
before the fix and gone after.

This is a class defect, not a single-page one: any page with a `.reality-table`
whose JS hides rows via `el.hidden` was affected below 700px. Grep shows
`.reality-table` combined with a `.hidden =` row filter on `status.html` and
`model-picker-data.html` for certain; `chain-comparer.html`, `build-on-kaspa.html`,
`kaspa-mining.html`, `kips.html`, `what-is-kaspa.html`, and `why-kaspa-matters.html`
also carry both patterns somewhere on the page (not necessarily on the same
table), so the fix is a general CSS rule rather than a per-page patch.

Fix: added `.reality-table tr[hidden] { display: none }` immediately after the
stacked-card rule, and excluded `[hidden]` from the `display: block` selector list,
inside the same media query. Verified: `model-picker-data.html` and `status.html`
both filter correctly at 375px now, visible rows still render as cards, and
`document.documentElement.scrollWidth` stays equal to `clientWidth` (no new
overflow introduced).

## Second defect found and fixed: no press/touch state anywhere on the site

Grepped `styles.css` (7,600+ lines) and every page's inline CSS for `:active`:
zero button, chip, link, or disclosure rules existed (one unrelated
`mask-image:active` rule on `model-picker.html`). `aria-pressed` covers a
toggle control's own persistent look once pressed, but the momentary feedback
between touch-down and release, on any control including non-toggling ones,
was entirely absent site-wide. This is most visible on touch devices, which
never fire `:hover` at all: a tap produced no visible response until whatever
the tap triggered had already finished happening. Violates STANDARD.md
directly: "Touch produces change in the same frame."

Fix: one rule appended at the end of `styles.css` (`transform: scale(0.97)`
on `:active` for native buttons, `.button`, `a.btn`, non-disabled
`[role="button"]`, and `summary`), with a `prefers-reduced-motion: reduce`
variant that swaps the scale for an opacity dip. Appended last so it wins the
cascade without needing to touch any of the ~15 demo-scoped `<style>` blocks
individually, since none of them defined their own `:active` to out-specify
it.

Verified with real mouse-down/mouse-up sequences (not `.matches(':active')`,
which reported false in this environment even when the computed style had
genuinely changed) and Chrome DevTools Protocol's `CSS.forcePseudoState`
against `CSS.getMatchedStylesForNode`, reading `getComputedStyle(...).transform`
after the CSS transition settles. Confirmed working on: a demo-scoped native
button (`#gp-btn-advance` inside `#ghostdag-demo`), the sitewide primary CTA
link (`a.button.primary` on `index.html`), a `[role="button"]` term-def glyph,
and a `<summary>` disclosure trigger. Re-ran both sitewide automated scans
(overflow at 390px, focus-visible ring) after this change: zero regressions.

## Page and demo surfaces

Columns after Page/Surface are the five scope items in brief order: component
states · overflow@390 · label/control clarity · four newcomer questions · cross-page
consistency. "n/a" where a page-level row has no demo-specific four-question axis.

| Page | Surface | Component states | Overflow@390 | Label clarity | Four newcomer Qs | Cross-page consistency | Perspective |
| --- | --- | --- | --- | --- | --- | --- | --- |
| what-is-kaspa.html | GHOSTDAG demo | PASS: hover/disabled/focus-visible/aria-pressed all defined and rendered correctly on buttons, sliders, `.node` cells | PASS | PASS: "Advance time," "Mine this many" plain; k-cap jargon relies on the card above defining it, acceptable per site's define-once rule | PASS: lede states the problem, mining produced plain-word readout ("2 blocks arrived at once... within the cap of k = 3, so all 2 of them count"), "why" stated in card copy | PASS: button/slider/details patterns match other demos on the page | E+N |
| what-is-kaspa.html | Collision demo | PASS: two sliders with `aria-label`, info affordances (`i`) present | PASS | PASS: "How fast blocks are found," "How long a block takes to reach other miners" | PASS: live counters with units (ms, %, block counts), "why" stated ("Each thrown-away block cost real electricity and bought nothing") | PASS | E+N |
| what-is-kaspa.html | Mass calculator | PASS: all five range inputs have `<label for>` with the current value baked into the label text | PASS | PASS: preset buttons named by transaction shape | PASS: readout "245 transactions like this fit in a block / 2,450 transactions per second," why stated ("a TPS figure means nothing without the transaction it counted") | PASS | E+N |
| what-is-kaspa.html | Livenet demo | PASS: no controls needed, auto-updating | PASS, verified specifically with real long miner-tag strings live from the API at 375px (`docScrollWidth` stayed 375) | PASS | PASS: intro states why, live feed is self-explanatory | PASS | E+N |
| argent-explained.html | Argent pipeline | PASS: three tab buttons with `aria-pressed`, correctly toggling | PASS | PASS: "Ownership check / Signature check / Next coin" | PASS: each tab updates code + a one-sentence plain explanation of the builtin | PASS: same tab pattern as other demos | E+N |
| utxo-vs-accounts.html | Parallel demo | PASS: "Watch the five checks run" button, labeled checkbox (wrapping `<label>`) | PASS | PASS | PASS: animated mid-run state ("waiting for payment 2"), conflict checkbox produces a plain-word rejection ("Four kept, one rejected... thrown out, not queued") | PASS | E+N |
| kaspa-mining.html | Emission schedule | PASS | PASS | PASS: "How far in the future," step labels "today / 3 years / 10 years" (human units, not raw seconds) | PASS: live reward figure with units (KAS) | PASS | E+N |
| kaspa-mining.html | Attack cost | PASS: slider labeled "How long the attack runs," 1 minute to 1 day | PASS | PASS | PASS: dollar readout updates live, scale comparison stated | PASS | E+N |
| kaspa-mining.html | Fee market | PASS: TPS slider + preset "LOAD THIS BLOCK" buttons, `i` info affordances | PASS | PASS | PASS: readout in tx/s and $/tx, "what happens" section states consequence in plain words | PASS | E+N |
| kaspa-mining.html | Node cost | PASS: guess-then-reveal mechanic (`disabled` on both choice chips after first click); confirmed both the "right" and "wrong" feedback strings render correctly (retested after a false read where a disabled second click looked like the same defect) | PASS | PASS | PASS: correct-guess text "Right: it stays flat..."; wrong-guess text "It actually stays flat..." both plain, both distinct | PASS | E+N |
| build-on-kaspa.html | Covenant-breaker | PASS: default/example log row present on load (empty-state equivalent), each attempt appends a labeled result row, "Blocked:" reason shown in plain words | PASS | PASS | PASS: premise stated up front ("Get money out without satisfying all four"), each attempt's rule violation named in one sentence | PASS | E+N |
| build-on-kaspa.html | ZK-boundary | PASS: three scenario buttons, checkmark vs. dot glyphs correctly distinguish "verified" from "can't be verified" | PASS | PASS | PASS: oracle scenario correctly shows unresolved state ("Is that number actually true right now?") instead of a false checkmark | PASS | E+N |
| kips.html | Supply-split demo | PASS: "Update Sam's coins" button relabels itself to "Pay Sam 2 coins" after first use, progressive state | PASS | PASS | PASS: readout moves from "One shared supply" to "Two kinds of coin now," consequence named (KCC-0020 spec quote) | PASS | E+N |
| kips.html | Parameterless demo | PASS: four sliders/selects, each with an `i` info affordance | PASS | PASS | PASS: margin-vs-need comparison updates live ("2.2x over margin"), consequence stated ("Honest blocks now fall outside the margin, and the network reads them as an attack") | PASS | E+N |
| skeptical-case.html | Security-budget demo | PASS: preset jump buttons, slider, live $ readout | PASS | PASS | PASS: "Solana's traffic" preset changes the gap figure live (11,293x -> 5.3x), sourced footnote present | PASS | E+N |
| chain-comparer.html | Dial tool | PASS: 11 dials, each `aria-labelledby` an adjoining `<span>` (not a bare `for`/`id` pair, but correctly associated and read back by `aria-labelledby`) | PASS | PASS | PASS: moving a dial reorders the ranking and rescales every score live | PASS | E+N |
| model-picker.html | The picker | PASS: job-preset buttons, 6 dials, coverage filter, all reactive; page structure intact, no evidence of the prior "gutted controls" regression the brief warns about | PASS | PASS | PASS: "Coding" preset reorders results live (Claude Fable 5 -> top, field narrows to 16 of 23) | PASS | E+N |
| model-picker-data.html | Filter + tables | **DEFECT, FIXED**: search filter correctly set `hidden` on non-matching rows and the count readout was correct, but the rows stayed visually rendered below 700px (see Defect section above) | PASS at 390 after fix (table itself collapses to a narrower stacked layout, no page overflow at any point) | PASS: "Search by model or figure," properly `<label for>` | PASS: filtering to "Claude Opus" now genuinely narrows the visible cards on mobile after the fix | Same `.reality-table` pattern used on 6+ other pages, all sharing the fix | E |
| kaspa-origin-story.html | Fair-launch demo | PASS: year slider, chart/table toggle, `i` affordances | PASS | PASS | PASS: dragging to year 7 updates both the chart position and the sentence readout ("Kaspa's founders... still hold 0%. XRP's still hold 76%") | PASS | E+N |
| kaspa-origin-story.html | DAG-time demo | PASS: date slider spans genesis to future, jump-to-preset buttons | PASS | PASS: "DAA score," explained inline each time | PASS: dragging to genesis correctly reports "the genesis block, block zero: DAA score 0" | PASS | E+N |
| why-kaspa-matters.html | Confirmation-risk demo | PASS: attacker-share slider, "how careful" preset chips | PASS | PASS | PASS: raising attacker share to 45% updates all three chains' safe-time readouts live, in human units (s/min/h/d) | PASS | E+N |
| search.html | Search | PASS: category chips with `aria-pressed`, single labeled search input | PASS | PASS | PASS: empty state reads "No page matches that. Press All, or try a broader word like..."; category filter narrows results correctly | PASS: same chip pattern as status.html's filter | E+N |
| start-here.html | Vocab quiz + path grid | PASS: 6 toggle chips with `aria-pressed`, "is-suggested" class correctly moves between the two door cards as answers change | PASS | PASS | PASS: tapping all six words updates the readout to "All six words. Nothing here left to build up first" and switches the suggested door | PASS | E+N |
| index.html | Page shell, nav, hero demo lede | PASS: mobile menu opens correctly at 375px (screenshotted), `aria-expanded` toggles, sits above content, does not overlap or slide off | PASS | n/a | n/a | PASS: same header/nav/footer component as every other page | E |
| start-here.html | Page shell | PASS (covered by sitewide scans) | PASS | n/a | n/a | PASS | E |
| crypto-from-scratch.html | Page shell | PASS (covered by sitewide scans); no named interactive demo on this page | PASS | n/a | n/a | PASS | E |
| what-is-kaspa.html | Page shell | PASS (covered by sitewide scans) | PASS | n/a | n/a | PASS | E |
| kips.html | Page shell | PASS (covered by sitewide scans) | PASS | n/a | n/a | PASS | E |
| kaspa-origin-story.html | Page shell | PASS (covered by sitewide scans) | PASS | n/a | n/a | PASS | E |
| why-kaspa-matters.html | Page shell | PASS (covered by sitewide scans) | PASS | n/a | n/a | PASS | E |
| utxo-vs-accounts.html | Page shell | PASS (covered by sitewide scans) | PASS | n/a | n/a | PASS | E |
| status.html | Status filter chips + reality-tables | **Same DEFECT as model-picker-data.html, same fix.** Confirmed present before fix (`stFeatures`, `stClaims` rows stayed visible under "Live" filter at 375px) and gone after | PASS after fix | PASS | n/a | PASS: same chip-filter pattern as search.html | E |
| skeptical-case.html | Page shell | PASS (covered by sitewide scans) | PASS | n/a | n/a | PASS | E |
| kaspa-mining.html | Page shell | PASS (covered by sitewide scans) | PASS | n/a | n/a | PASS | E |
| build-on-kaspa.html | Page shell | PASS (covered by sitewide scans) | PASS | n/a | n/a | PASS | E |
| argent-explained.html | Page shell + repo-pulse live table | PASS: fetch has a `.catch()` that leaves the baseline table standing on failure (matches the documented sitewide pattern in `AGENTS.md`); not simulated live, read from source and cross-checked against the documented pattern used elsewhere on the site | PASS | n/a | n/a | PASS | E (source-verified, not live-simulated) |
| chain-comparer.html | Page shell | PASS (covered by sitewide scans) | PASS | n/a | n/a | PASS | E |
| model-picker.html | Page shell | PASS (covered by sitewide scans) | PASS | n/a | n/a | PASS | E |
| model-picker-method.html | Page shell | PASS (covered by sitewide scans); no named interactive demo on this page | PASS | n/a | n/a | PASS | E |
| model-picker-data.html | Page shell | PASS (covered by sitewide scans) | PASS | n/a | n/a | PASS | E |
| sources.html | Page shell | PASS (covered by sitewide scans); no named interactive demo on this page | PASS | n/a | n/a | PASS | E |
| search.html | Page shell | PASS (covered by sitewide scans) | PASS | n/a | n/a | PASS | E |
| 404.html | Page shell | PASS (covered by sitewide scans) | PASS | n/a | n/a | PASS | E |
| demos/index.html | Every-demo index | PASS: link-card list to every demo's anchor, no controls of its own | PASS | PASS | n/a | PASS | E |

## Reset-button naming, checked as a class

Grepped every page's Reset/Start-over control. All demos use "Reset" except
`build-on-kaspa.html`'s covenant-breaker, which uses "Start over." Judged as
deliberate, not inconsistent: that control clears an attempt log (a narrative
history), not slider values, so a different verb communicates a different action.
Not changed.

## Not rendered or not keyboard-tested

- Live-data failure paths (GitHub API rate-limited, Kaspa API unreachable) were
  not forced/simulated on `argent-explained.html`, `what-is-kaspa.html`'s livenet
  demo, or any KIP/KCC live-pull table. Reviewed by reading the fetch/catch code
  instead, cross-checked against the documented sitewide pattern in `AGENTS.md`
  ("Always leave the baseline standing on failure"). If a genuine defect exists
  only inside a failed-fetch path, it was not caught here.
- Text-input contrast, touch-target size, and element overlap were not
  re-checked anywhere on this pass, per the brief: the publish gate already
  covers these at zero violations every run.
- Hover states were not independently screenshotted per control; verified by
  reading each component's CSS for a `:hover` rule and, for the shared
  `.reality-table`/button/chip patterns, by the same automated focus-visible
  scan's confirmation that a distinct interactive style exists. A hover state
  that is defined in CSS but visually wrong (e.g. same color as default) would
  not be caught by this method.
- `the-instrument.html` was not touched, per instruction (hosted guest work).
