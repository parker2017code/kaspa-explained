# CSS audit: glass era vs. Apple design layer

Analysis only. No CSS, HTML, or JS files were changed to produce this. Method: static
parsing of `styles.css` selectors and declared properties, cross-referenced against
`class=` attributes in all HTML files, and against runtime class injection in every
`.js` file (`classList.add/toggle/remove`, `className =`, template literals containing
`class="..."`). Numbers below come from scripts run against the actual files in this
repo, not from `design/house-style.md`'s prose description of the split.

## Task 1: the real boundary

The comment `APPLE DESIGN LAYER — 2026-07-08` is at line 6389. `styles.css` is 8,406
lines total.

- Old ("glass") region: lines 1-6388 (6,388 lines, 135,125 bytes).
- New ("Apple") region: lines 6389-8406 (2,018 lines, 51,184 bytes).

**The split is not "everything above is dead."** It is confirmed too tidy, exactly as
flagged. The new layer's first rule is `:root[data-theme="light"]` (line 6395), and the
bare `:root` / `:root[data-theme="dark"]` default block follows at line 6440 — both
self-contained, no dependency on the old region for token values.

But most component selectors that exist in both regions are **partial overrides, not
replacements**. Parsing property names per selector (not just selector presence) shows:

- 227 exact selector strings appear in both regions.
- Of those, 215 have old-region properties that the new region never re-declares for
  that same selector.

The new layer overrides surface/theme properties: `border-color`, `background`,
`backdrop-filter`, `box-shadow`, `transform`, `color`. It almost never re-declares
structural properties: `display`, `grid-template-columns`, `padding`, `gap`,
`align-items`, `position`, `min-width`, `overflow`, `z-index`. Those come from the old
region and are still load-bearing. Examples: `.footer-grid` (old supplies
`display, grid-template-columns, gap, align-items, padding-top`; new only retints it),
`.hero` (old supplies `display, min-height, padding, position`), `.check-grid label`
(old supplies `display, gap, border-radius, padding, position` for the entire checkbox
card layout).

Practical reading: the old region is not a dead system sitting underneath a live one.
It is the layout and structure layer for most components; the new region is a re-skin
applied on top. Deleting the old region wholesale would strip layout from nearly every
component that has any rule in both regions — not just recolor them.

## Task 2 and 3: classification

Selectors defined **only** in the old region (not redefined by any exact selector
string in the new region): 127 classes, 2 ids.

Cross-referenced against:
- `class="..."` attributes in all 72 HTML files (25 live pages + 47 redirect stubs,
  which carry no classes and were excluded) and the 13 files in `demos/`.
- `classList.add/toggle/remove/contains(...)` and `className = ...` / template-literal
  `class="..."` strings in every `.js` file (`nav.js`, `ask-ai.js`, `live-kaspa.js`,
  `reality-check.js`, `survey.js`, `experiment/*.js`).

Result, three-way:

**Live (93 classes)** — old-region-only, and actually attached to markup today, so the
old region is their *sole* source of style, not a leftover. Concrete example that
validates the "grep the HTML alone gives a confidently wrong answer" warning:
`.image-viewer-open` / `.image-viewer-close` never appear in any HTML file's `class=`
attribute. They are built by `nav.js` at runtime — `viewer.className = "image-viewer"`,
a template literal containing `class="image-viewer-close"`, and
`document.body.classList.add("image-viewer-open")` (`nav.js` lines 97-126). A pure HTML
grep would have called both dead.

Other live examples and where they render: `.diagram-node`, `.pressure-node`,
`.quad-cell` and their color-name modifiers (`.blue`, `.red`, `.btc`, `.kas`, `.sol`)
on `why-kaspa-matters.html`'s concept diagrams; `.footer-link-group` /
`.footer-nav-groups` / `.skip-link` / `.nav-menu-button` / `.site-related` on every
current page footer (`404.html`, `about.html`, `argent-explained.html`,
`build-on-kaspa.html`, and others); `.essay-visual*` and `.essay-section-grid` on
`toccata-essay.html`; `.mining-cycle-page`, `.clock-diagram`, `.fast-lane`/`.slow-lane`
on `kaspa-mining.html`; `.glossary-page`/`.related-terms` on `glossary.html`;
`.status-page`/`.status-snapshot`/`.roadmap` across the status pages. Full list is
reproducible from the `only_old_classes.txt` minus the dead list below.

**Overridden but still applying (215 of the 227 shared selectors)** — see Task 1.
Every one of these needs a computed-style check before its old-region rule is touched,
because "shared selector" does not mean "safe to delete the old declaration": the new
region typically only overrides a subset of properties.

**Definitely dead (34 classes + 1 id, 35 selectors, 43 rule blocks)** — no `class=`
attribute match in any of the 72 HTML files or 13 demo files, no `classList`/
`className`/template-literal match in any `.js` file, and no plausible dynamic-prefix
construction found (checked by grepping the bare string, not just the `class=` form,
so a script that builds `"ai-" + suffix` would still have surfaced `ai-ask-panel` as a
substring hit — none did):

```
ai-ask-layout, ai-ask-panel, ai-copy-status, ai-destination-grid, ai-preset-strip,
ai-prompt-toolbar, api-command-note, body-copy, builder-ledger, capability-grid,
compare-table, dag-visual, diagram-caption, field-study-grid, fit-page,
freshness-panel, homepage-route-grid, learning-routes, link-grid, mechanics-readout,
method-strip, one-screen-grid, pitch-ai-actions, pitch-ai-card, pitch-layout,
pitch-score, route-card-grid, source-strip, source-tier, survey-layout,
toccata-builder-party, toccata-status-copy, toccata-status-feature, visual-caption
```
plus id `#miner` (`#demo-arrow` is live — it's an SVG marker id referenced from
`index.html`'s inline `<svg>`, would have been misclassified as dead by a class-only
grep). These read like remnants of a dropped "pitch an AI" / "ask AI" page concept and
an earlier survey/builder-ledger layout — plausible orphans, not currently reachable
from any shipped page or script.

**Could not classify with full confidence:** the 215 "overridden but still applying"
selectors are classified as a category, not individually verified property-by-property
against rendered output — that would need the computed-style comparison in Task 5,
which was not run (no proposed diff exists yet to compare against). Static string
extraction also does not resolve specificity conflicts (an old-region declaration
inside a media query, or with a combinator, can lose to a same-region rule later in
the cascade) — the property lists reported are "declared," not "winning at every
viewport." Treat the 215 as "needs individual verification before touching," not as
independently confirmed live rules.

## Task 4: quantified

| region | lines | bytes (raw) | gzip |
|---|---|---|---|
| old (glass), lines 1-6388 | 6,388 | 135,125 | 22,023 |
| new (Apple), lines 6389-8406 | 2,018 | 51,184 | 7,692 |
| full file today | 8,406 | 186,309 | 28,739 |
| confirmed-dead rule blocks only | 345 | 5,790 | not separately measured, small |

The site is served from GitHub Pages behind a custom domain (`CNAME` =
`kaspaexplained.com`), which serves text assets gzip/brotli-compressed by default. The
28,739-byte gzip figure is what a visitor's browser actually receives today, not
186,309. Compression matters more than the raw split suggests: old and new regions
overlap heavily in token names and property syntax, so gzip's shared dictionary means
deleting the old region would not free 22,023 bytes of transfer — removing only the
confirmed-dead 5,790 raw bytes would free well under that in the compressed stream,
plausibly a few hundred bytes, because that content is highly repetitive boilerplate
(`.ai-*` micro-classes) that gzips very well already. The honest number requires
gzipping the file with and without the removed blocks and diffing, not scaling the raw
byte count — treat any percentage claim about "size win" as unscored until that
diff is run.

## Task 5: staged removal plan

Stage 0, now (safe, small, boring):
1. Remove the 43 confirmed-dead rule blocks (the 34 classes + `#miner`) identified
   above. Nothing references them by any mechanism checked.
2. Verification: re-run the same class/id extraction after the edit — confirm the
   removed selectors produce zero matches — and do a visual diff of the 25 live pages
   before/after. Concretely, with the tools available in this session: serve the repo
   with a local static server (`python3 -m http.server`), open each of the 25 live
   pages (skip the 47 redirect stubs — none load `styles.css` or carry classes) via the
   Claude Browser tools, and dump `getComputedStyle` for every element on the page
   before and after the edit, diffed programmatically. This is mechanically feasible
   here — no build step, plain static HTML — and avoids a human eyeballing 72 pages;
   only the 25 real pages need a pass, and a script can flag any computed-style diff
   rather than requiring visual judgment.

Stage 1, after Stage 0 lands clean:
1. Selector by selector, for each of the 215 "overridden but still applying" cases,
   diff the old-region declaration against the new-region declaration for the same
   selector and decide, per property, whether the old value is still the one rendering
   or whether the new region's later, more specific, or !important rule already wins.
   This is not a bulk operation — a rule that supplies `display: grid` for a card
   layout cannot be deleted just because its `border-color` line is dead weight.
2. Verification: same computed-style diff as Stage 0, run per-page rather than
   site-wide, since a change to one shared selector can affect several pages that all
   use that class.

Stage 2, only after the page rebuild referenced in `PLAN-REDESIGN.md` rewrites markup:
1. Re-run this entire audit against the rebuilt markup. The rebuild invalidates every
   usage count above — a class alive today because `about.html` uses it is dead the
   moment `about.html` is rewritten without it.
2. Delete whatever the old region has left after Stage 1 and the rebuild, since by
   then the new region should be the only styling surface a rebuilt page can reach.

## Timing recommendation

Do Stage 0 before the rebuild. It is small (345 lines, no live dependency found by any
method tried), independently safe, and gets a genuinely dead 5,790 bytes off the file
regardless of what the rebuild does later — no reason to carry it forward.

Do not attempt Stage 1 (the 215 partial-override selectors) before the rebuild. The
rebuild is explicitly going to rewrite most page markup, which is the cheaper moment to
discover which of those 215 survive: post-rebuild, a selector with zero remaining
`class=` matches across the new markup is unambiguously removable, whereas today it
requires per-property, per-page verification against markup that is about to be
thrown away. Doing that verification work now is effort spent on soon-to-be-obsolete
usage data.

Do Stage 2 during or immediately after the rebuild, not as a separate later pass —
the rebuild is the one moment old-region usage can be measured against final markup
without a second stale-data problem.

## What was not checked

- No dynamic class construction via string concatenation of variables (e.g.
  `` `pressure-node-${key}` ``) was found in any `.js` file, but this was checked by
  literal substring search, not by executing the scripts; a build-time or
  server-rendered concatenation this repo doesn't run locally would not surface.
- `_preview-site/` and `experiment/*.html` were scanned for class usage but are not
  counted among the 25 live pages or 47 stubs; if either is actually served in
  production, re-run the reference check against them explicitly.
- The 215 partial-override selectors are a classification, not a verified list —
  see Task 3's "could not classify with full confidence" note.
