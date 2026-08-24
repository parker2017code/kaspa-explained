# Visual audit

Method: automated geometry scan (`getBoundingClientRect` + `getComputedStyle`)
run inside same-origin iframes at 390/768/1024/1280px against a local
`serve-local.py`-equivalent server (`127.0.0.1:4491`), covering all 19 pages
in `site-manifest.json` plus `start-here.html` and `demos/index.html` (21
pages total). Every `<details>` was force-opened (`d.open = true`) before
measuring. Theme was set by writing `data-theme` on `<html>` and
`kaspa-explained-theme` in `localStorage`, then verifying
`getComputedStyle(body).backgroundColor` actually changed
(`rgb(16,14,12)` dark vs `rgb(255,255,255)` light) in the same call that
took the measurement. `location.href` and `innerWidth` were captured in
every measurement call, never trusted from a prior call.

**Environment note, not a site finding:** this session started by driving
`resize_window` against the shared Browser pane, which turned out to be
the owner's own live Chrome window, not an isolated tab. The coordinator
caught this partway through and told me to stop; I switched to the
same-origin iframe harness method for everything after that point, and
re-verified the handful of readings taken before the switch (`index.html`,
`what-is-kaspa.html`, `why-kaspa-matters.html`, `crypto-from-scratch.html`)
against the harness afterward. They agree. No further `resize_window`
calls were made. The tab pool was also being contended by other concurrent
agent sessions for part of the run (tabs silently changed URL/port between
calls); every reading kept in this report has a matching `href`/`innerWidth`
captured in the same call, so contaminated reads were caught and discarded,
not reported.

**Not done:** a full per-page, per-width, per-theme visual screenshot pass
(misalignment, spacing rhythm, contrast, control affordance) was not
completed. The Browser pane's narrow viewport made side-by-side 4-width
screenshots impractical without `resize_window`, which was off-limits, so
visual coverage past the geometry scan is limited to source-level CSS
inspection plus two spot screenshots (`index.html` 390 dark,
`kaspa-mining.html` 390 dark, both confirmed on-tab before capture). Light
theme contrast was not visually reviewed on any page. Every finding below
is numeric geometry, not a screenshot judgment, per the "measure, don't
describe" instruction. State this gap plainly rather than implying full
coverage: **light-theme contrast, spacing-rhythm consistency across
pages, and control-affordance review (slider handles, disabled-vs-live
buttons) are unverified.**

---

## Findings, ranked

### 1. HIGH — `.nc-demo` (Node cost demo) breaks its host card at 390px, kaspa-mining.html

`kaspa-mining.html`, 390px, both themes. The "Node cost" interactive demo
sits inside a `<details class="guide-detail" id="node-cost">` nested inside
a plain `.summary-grid.grid-cards` `<article>` (source line 2416, inside
the article opened at line 2413). With the details forced open, that
`<article>` measures **848px wide** (`left:34, right:882`) against a
390px viewport and a 322px-wide grid column (`left:34, right:356`).
Root cause, confirmed in source: `styles.css` sets `.nc-demo .wrap
{max-width:780px; margin:0 auto;}` (line 2557 of `kaspa-mining.html`,
inline block) with no responsive cap tied to the host container. This is
exactly the "demo carries its own visual language into a page that didn't
share it" risk named in the brief: the demo was sized as if it always
gets a full content column, but it is nested inside a narrow summary
card here. Body `overflow-x` is `hidden` sitewide, so the excess is not a
scrollbar, it is silently invisible content past the right edge on a
phone.
Fix direction: cap `.nc-demo .wrap` at `min(780px, 100%)` (or `100%` and
let the demo's own internal grid handle small widths, since the demo
apparently already has a narrow-width design elsewhere on the page).

### 2. HIGH — `.reality-table` overflows its wrapper at exactly 1024px, 10 pages, both themes

Confirmed via measured geometry (table `right` vs `innerWidth`, wrapper
`overflowX`) on: `what-is-kaspa.html` (+21px past viewport, table 980px
in a 927px wrapper), `crypto-from-scratch.html` (+21px), `argent-explained.html`
(+21px), `build-on-kaspa.html` (+21px), `kaspa-origin-story.html` (+40px),
`kaspa-mining.html` (+21px, 3 tables), `kips.html` (+40px), `sources.html`
(+40px), `status.html` (+37px, worst count: 241 offending descendant
elements, several `reality-table.status-snapshot` instances on one page),
`skeptical-case.html` (see #3, same root cause, much worse). Not
reproduced on `why-kaspa-matters.html`, `chain-comparer.html`,
`model-picker.html` at 1024 (their tables are narrower or absent). Clean
at 768 and 1280 everywhere tested; at 768 `.table-wrap` still carries
`overflow-x: auto` so the same-width table scrolls inside its box
instead of bleeding.

Root cause, in `styles.css` around line 9358:
```
@media (min-width: 1000px) {
  .table-wrap { overflow: visible; }
}
```
The comment directly above this rule (same file, ~line 9263) states the
rule was verified "measured on status.html at 1280px, none of its tables
are actually wider than their wrapper at that width... the scroll
behavior is already inert there." That check was only run at 1280. The
media query fires starting at 1000px, and at 1024px — inside that same
band, and one of the four required audit widths — the real table width
(980px, fixed by cell content) is wider than the wrapper (927–1063px
depending on page padding) on at least 8 of the 10 pages that use this
class. The fix that removed the scroll clip for wide desktop screens
also removed it for a width where the table still doesn't fit.
Fix direction: raise the media query's `min-width` past the point where
every `.reality-table` instance actually fits its wrapper (site-wide,
that looks like ~1150–1200px based on the widest table found, 980px,
needing roughly 1030px of wrapper including padding), or scope the rule
to pages/tables narrow enough to be safe at 1024, or keep `overflow-x:
auto` permanently since it is inert (costs nothing) whenever the table
does fit.

### 3. HIGH — Same root cause, much worse instance: skeptical-case.html reality-table + open `cell-detail`, 1024px

`skeptical-case.html`, 1024px, both themes. A `<details class="cell-detail">`
inside a table cell, forced open, drives the table to need its full
980px, but this page's `.table-wrap` sits in a **246px-wide column**
(`left:389, right:635`), not the ~927–1063px column the other 9 pages
give it. Measured: table `left:405, right:1385` — **361px past the
1024px viewport edge**, and 750px past its own wrapper. This is the
worst single overflow found in the audit. Not reproduced at 768 (wrapper
still has `overflow-x:auto` there, confirmed) or 390 (clean). Same fix
as #2 resolves this if the media-query boundary moves; if the narrow
246px column is intentional layout elsewhere on the page, this table may
need its own `overflow-x:auto` fallback independent of the shared rule.

### 4. MEDIUM — `table.constants` overflows inside a `<details>` foldout, kaspa-origin-story.html, 390px

`kaspa-origin-story.html`, 390px, both themes. Inside a collapsed
`<details>` (`.deep-body` wrapper), `<table class="constants">`
(source line 840, page-local `<style>` block at line 735:
`.dt-demo table.constants { width: 100%; ... }`) renders at 329px wide
against a 254px-wide parent (`.deep-body`, `left:68, right:322`) and
bleeds 7px past the 390px viewport itself (`right:397`). `width:100%`
does not constrain an auto-layout table whose cells need more than that
to lay out unwrapped; some cell content is forcing a wider min-content
width than the stated `width:100%` maximum. This exactly matches the
brief's "closed section hides its own bug, long numbers/words are where
it shows" prediction — the table is invisible until the surrounding
`<details>` is opened. Not reproduced at 768/1024/1280.
Fix direction: add `table-layout: fixed` with explicit column widths, or
`word-break`/`overflow-wrap` on the cells carrying the long content, or
wrap the table in its own `overflow-x:auto` box matching the sitewide
`.table-wrap` pattern.

### 5. LOW — `.info-affordance__panel` tooltips overflow at 390px, kaspa-mining.html

`kaspa-mining.html`, 390px, both themes, 6 instances found in the page's
first viewport alone (e.g. `right:591, left:311` against a 390px
viewport). These are the small "i" info tooltips (distinct component
from `.term-def__panel`, not part of the underline-resize work in
progress). Each panel's centering math doesn't account for viewport
edges, the same failure mode already fixed for `.term-def__panel` /
`info-affordance__panel` max-width elsewhere in `styles.css` (line ~9358
region, the "Defect B" comment) — but that existing fix
(`.info-affordance__panel { max-width: min(220px, 32vw); }`) evidently
does not stop every instance from overflowing; these six still do.
Worth re-running that harness's own audit tool against the current state
rather than treating it as separately fixed.

---

## Explicitly not counted as findings (in flux per the brief)

- `.term-def__panel` edge overflow, small (7–36px), seen at 768px and
  1024px on `argent-explained.html`, `build-on-kaspa.html`,
  `status.html`, `kips.html`, `start-here.html`. This is the dotted-
  underline/definition-panel component named as actively being resized
  in this session; not re-reported as a new finding, but it is still
  live in the current build as of this scan and should be re-checked
  once that change lands.

---

## Coverage

**Automated overflow/theme scan (this report's primary evidence), full
21-page x 4-width x 2-theme matrix completed:** `index.html`,
`start-here.html`, `what-is-kaspa.html`, `why-kaspa-matters.html`,
`crypto-from-scratch.html`, `chain-comparer.html`, `model-picker.html`,
`kaspa-origin-story.html`, `argent-explained.html`, `build-on-kaspa.html`,
`status.html`, `skeptical-case.html`, `kaspa-mining.html`, `kips.html`,
`sources.html`, `utxo-vs-accounts.html`, `the-instrument.html`,
`search.html`, `404.html`, `demos/index.html`. Every `<details>` on every
one of these pages was forced open before measuring, so collapsed-content
overflow (findings #1 and #4) was caught by this pass, not missed by it.

**Not reached / not verified:**
- Full visual (screenshot) review for misalignment, spacing-rhythm
  consistency, and light-theme contrast: not done at any page/width
  beyond two spot screenshots (see above). This is the largest gap
  against the brief's instructions and should be treated as the next
  pass, ideally using the same same-origin iframe harness
  (`/private/tmp/.../scratchpad/kx-audit-harness.html`, served via
  `scratchpad/dual-serve.py --port 4491`) with a wider Browser pane or a
  stitched multi-shot capture per iframe, since `resize_window` cannot be
  used against the shared pane.
- Touch-target sizing (44px minimum) at 390px: not measured for any
  control beyond the theme toggle, which the brief states is already
  fixed sitewide.
- Individual `demos/*.html` standalone files (21 files under `demos/`):
  not audited directly. `site-manifest.json` only lists `demos/index.html`
  as a real routed page; the individual demo files are embedded into
  their parent pages via anchors/`<details>`, and those parent-page
  instances were covered by the pass above (e.g. the node-cost demo
  inside `kaspa-mining.html`, finding #1). Whether the standalone
  `demos/*.html` files are still reachable on their own and in what
  state was not checked.
