# Consistency audit: the 25 live pages

Method: static comparison of the 25 live pages listed in `sitemap.xml` (index,
start-here, what-is-kaspa, why-kaspa-matters, crypto-from-scratch,
chain-comparer, model-picker, kaspa-origin-story, toccata-explained,
argent-explained, toccata-status, toccata-essay, build-on-kaspa, status,
skeptical-case, kaspa-mining, kaspa-developments, kips, kaspa-claims-checker,
sources, glossary, about, the-instrument, search, 404) against each other and
against `design/house-style.md`. Header, footer, and section markup extracted
per page and diffed; every `class="..."` attribute collected and cross-tabbed
by how many of the 25 pages use it; `styles.css` cross-referenced against
class usage the same way `design/css-audit.md` did. No files were edited to
produce this.

Findings are ranked at the end by visibility to a reader, per the brief.

## 1. Page shell

**Header: consistent content, inconsistent bytes.** All 25 pages share
identical nav links, theme-toggle button, and CTA. But the brand markup
splits into two byte-for-byte variants:

- 18 pages write it multi-line: `<a class="brand" ...>\n<span class="brand-mark" ...></span>\nKaspa Explained\n</a>`: index, start-here, what-is-kaspa,
  why-kaspa-matters, crypto-from-scratch, kaspa-origin-story,
  toccata-explained, argent-explained, toccata-essay, build-on-kaspa, status,
  skeptical-case, kaspa-mining, sources, glossary, about, search, 404.
- 7 pages write it single-line: `<a class="brand" ...><span class="brand-mark" ...></span>Kaspa Explained</a>`: chain-comparer, kaspa-claims-checker,
  kaspa-developments, kips, model-picker, the-instrument, toccata-status.

HTML collapses the whitespace either way, so **this renders identically in
every browser.** It is invisible to a reader. It is still real drift (two
different hands wrote the same element differently), and it's the kind of
thing that will bite a future find-and-replace across "the header." Winner:
the 18-page multi-line form, on majority and on readability of the source.

Within each camp the header is byte-identical (confirmed by diff). No
further drift once you set the whitespace aside.

**Footer: fully consistent.** All 25 pages share byte-identical footer markup
and copy, down to the four link groups and their contents. The only variance
is the same whitespace-only pattern on the outer `<footer>` tag on
chain-comparer and model-picker (2 changed lines, both leading-indentation).
Not worth a separate pass. Fix in the same commit as the header whitespace.

**Theme init: doc says inline, ships as deferred external.**
`house-style.md` states the mechanism is "a small inline script... see
`design/page-template.html`'s script block for the exact thirteen lines," and
`page-template.html` does carry a real inline `<script>` at the end of
`<body>` that sets `document.documentElement.dataset.theme` before paint.
None of the 25 live pages do this. Every one instead loads
`<script defer src="nav.js?v=...">`, and the theme-setting logic lives inside
`nav.js`'s `IIFE`. `defer` runs after the HTML has parsed, not before first
paint. Since bare `:root` defaults to dark (`color-scheme: dark`), a reader
who has stored a **light** preference gets a dark flash on every page load
until `nav.js` executes and flips `data-theme`. This is consistent across all
25 pages (so it's not "inconsistency" between pages), but it is a real,
site-wide gap between the documented mechanism and the shipped one, and a
genuine minor visible bug for light-theme readers. Not a per-page issue to
fix page-by-page. Fix once, in `nav.js`'s loading strategy or by inlining
the theme-set snippet the way `page-template.html` models it.

Minor, low-priority note: `<meta name="theme-color" content="#000000">` is
identical on all 25 pages (consistent) but is a flat hardcoded black that
doesn't track either theme's `--bg` token and never changes with the toggle. It is
cosmetic (mobile browser chrome tint only), not a design-system violation
worth prioritizing.

## 2. Section structure

Two legitimate page archetypes exist, not one:

- **Grid pages** (22 of 25): `.section` wrapper, `.eyebrow` + heading + `.lead`,
  content in `.grid-cards`-based card grids or `.reality-table`s. This is the
  house pattern and it's followed consistently.
- **Long-form narrative pages** (3): start-here, kaspa-origin-story,
  toccata-essay share a second wrapper, `.section article-body` (inside an
  outer `.knowledge-page`/`.knowledge-hero`), for prose-heavy essay-style
  reading. This is a deliberate, earned second archetype, shared across
  three pages and not invented once and abandoned, but it isn't named anywhere
  in `house-style.md`, which only documents the grid pattern. Worth adding a
  short "narrative page" entry to the house-style doc so the next agent
  doesn't mistake it for drift.

The "Keep reading" related-links grid (`.section site-related`) is present
and byte-identical on all 25 pages. Fully consistent, no fix needed.

The "check it yourself" sources callout (`.next-step.section`) appears on 11
of 25 pages (about, argent-explained, build-on-kaspa, crypto-from-scratch,
glossary, kaspa-claims-checker, sources, start-here, toccata-explained,
toccata-status, what-is-kaspa). This reads as content-driven, not visual
drift: it's used on pages making a falsifiable claim worth a dedicated
source-check block, and skipped on pages (skeptical-case, kaspa-mining,
kips, kaspa-developments, status) that already carry inline citations or a
`.reality-table` doing the same job. No fix recommended; flagging only so
it isn't mistaken for a missing component on 14 pages.

## 3. Components

**Status pill "research" state uses an invented, undocumented color.**
`styles.css` defines exactly five status-pill modifiers:
`.live` (green), `.target` (cyan), `.roadmap` (purple), `.research`, and
`.not-live` (muted), matching the five-state system `house-style.md`
describes. But `.research` doesn't reuse `--purple` or `--orange`; it hardcodes
its own hex pair (`#a44fc9` light / `#f0abfc` dark, `styles.css` lines
3573 and 6905-6910). That's a sixth accent color, invented solely for one
status word, directly against house-style's explicit rules ("Reach for green
first. Do not invent a fifth color" and "No arbitrary hex colors... every
color traces back to a token in the Palette table"). It renders on every page
that labels a claim "research": kaspa-claims-checker, kaspa-developments,
status, toccata-explained, toccata-status, what-is-kaspa (6 pages, 8 pill
instances). Visible every time: it's a distinct magenta the reader has not
seen used for anything else on the site. Fix: remap to `--orange` (roadmap
already owns purple), or if a sixth semantic color is genuinely wanted for
"research," add it to the Palette table in `house-style.md` rather than
letting it live only as an undocumented literal in the stylesheet.

**Status pill "testnet" modifier is broken.** `toccata-status.html` line 152
uses `class="status-pill testnet"` for the "TN10/TN12 testing" row. There is
no `.status-pill.testnet` rule anywhere in `styles.css`. It silently falls
back to the base `--status-color: var(--muted)`, which is the *same* color as
`.not-live`, so a testnet-stage claim renders with the identical gray
"not live" treatment used for wrong/unsupported claims elsewhere on the same
page. This is the one outright bug found in this audit: a single-instance,
single-page defect, but it directly undermines the site's core promise (that
color plus word together tell a reader the claim's status), because the
color half of that pairing is wrong. Fix: add
`.status-pill.testnet { --status-color: var(--cyan); }` (matching `.target`,
since testnet activity is closer to "targeted/in progress" than to
"not live"), or change the class to an existing modifier.

**The two tool pages each hand-rolled their own, near-duplicate component
system.** `chain-comparer.html` and `model-picker.html` each carry their own
inline `<style>` block, entirely separate from `styles.css`
(`chain-comparer.html:35-98`, 64 rules under a `.cc-` prefix;
`model-picker.html:35-153`, ~119 rules across two blocks under an `.mp-`
prefix). The two block sets implement the same tool shape (preset chips, a
weighted-slider control panel, a ranked result list, a methodology
`<details>`, a reset link) under parallel but independently-named classes:
`cc-shell`/`mp-shell`, `cc-block`/`mp-block`, `cc-label`/`mp-label`,
`cc-presets`/`mp-presets`, `cc-dial`/`mp-dial`, `cc-check`/`mp-check`,
`cc-method`/`mp-method`, `cc-results-head`/`mp-results-head`,
`cc-reset`/`mp-reset`, `cc-list`/`mp-list`, `cc-row`/`mp-row`,
`cc-rank`/`mp-rank`, `cc-cell`/`mp-cell`, `cc-title`/`mp-title`,
`cc-name`/`mp-name`, `cc-tier`/`mp-tier`, `cc-meta`/`mp-meta`,
`cc-bar`/`mp-bar`, `cc-score`/`mp-score`, `cc-gap`/`mp-gap`,
`cc-empty`/`mp-empty`, `cc-map`/`mp-map`, matched near line-for-line. This is
the clearest evidence in the whole audit of the exact failure mode the brief
warned about: the same visual language, built twice by hand, guaranteed to
diverge further every time either file is edited without the other in mind.

`model-picker`'s version is the more evolved of the two: it adds a
model-comparison mode (`.mp-mc-*`), a closing-argument disclosure
(`.mp-close`, `.mp-close-d`), an estimate badge (`.mp-est-badge`), a
`.table-wrap` overflow container, and a code comment documenting a real bug
fix (`minmax(0, 1fr)` vs bare `1fr` clipping the results table on a 307px
phone) that `chain-comparer` does not carry. **`model-picker`'s system should
win.** It is the later, more field-tested iteration, and `chain-comparer`'s
`.cc-*` block should be refactored onto it rather than the reverse.
Longer-term, this shared "comparison tool" component set belongs in one
place (a shared partial or a documented pattern), not copy-pasted per file.

Inside both blocks, three smaller violations ride along with the
duplication, present in both files identically:

- `color: #06251f` on `[aria-pressed="true"]` is a hardcoded hex that's a
  near-miss for the documented `--ink` token (`#06201b` dark / `#ffffff`
  light). It should be `var(--ink)`.
- `model-picker` only: `color: var(--red, #e0605e)` references an undefined
  `--red` custom property (not in the Palette table) with a hardcoded
  fallback. It should resolve to an existing token.
- Non-scale border-radii inside both blocks: `.cc-row`/`.mp-row` at 10px,
  `.cc-tier`/`.mp-tier` at 4px, `.mp-cov select` at 7px, `.mp-close` at 10px,
  `.mp-est-badge` at `.3rem` (~4.8px). None of these are one of the five
  sanctioned radii (980 / 28 / 18 / 14 / 8px). All should snap to 8px, the
  documented radius for small controls.
- `model-picker` only: a scroll-edge fade mask,
  `linear-gradient(to right, #000 88%, transparent)` (used twice), is a
  second gradient beyond the one sanctioned `--brand-gradient`. It's a mask,
  not a visible fill, so the visual risk is low, but house-style states no
  other gradient exists anywhere in the Apple layer, so it is worth a one-line
  carve-out in the doc if it's being kept, rather than leaving it
  undocumented.

**Two documented components exist only on paper.** `.evidence-note` (a
citation block pairing "Source / Establishes / Does not establish") is fully
specified in `house-style.md` and demonstrated with its own inline sample CSS
in `design/patterns.html` and `design/page-template.html`, but has zero rule
in `styles.css` and zero usage across all 25 live pages, confirmed by
`grep -c evidence-note styles.css` returning 0 and no live page's `class=`
attributes matching it. Given the site's whole premise is grading claims by
evidence tier, this is the component built for exactly that job, and no page
uses it; pages instead lean on `.source-inline` (8 of 25: index,
what-is-kaspa, toccata-explained, argent-explained, toccata-status,
toccata-essay, build-on-kaspa, kaspa-developments) or bare inline citation
prose. `.stat-tile` (a labeled number with unit, as-of date, and source) has
the same story: documented, demoed once in `design/patterns.html`, absent
from `styles.css` and from every live page; pages that show a bare labeled
number (status.html, kaspa-developments.html) do it with ad hoc markup
instead. Neither is "broken" in the sense of malfunctioning, since they were
never wired into production, but both are a real gap between the spec and
what's shipped. This is an editorial call, not a bug: either build them out
where the content calls for them, or strike them from `house-style.md` so it
stops describing components a fresh agent will go looking for and not find.

**Cards and tables: no drift found.** Every card grid across all 25 pages
converges on `.grid-cards` plus a semantic modifier class per section
(`.reference-grid.grid-cards`, `.summary-grid.grid-cards`, and 22 more: 24 distinct
modifiers, one base). Every table converges on `.table-wrap` +
`.reality-table` plus an optional semantic modifier. This is the one area
audited that had already fully converged. Worth stating plainly so it isn't
re-litigated in a future pass.

## 4. Type and spacing

Outside the tool-page radii called out above, no live page uses a font
size, weight, or spacing value that falls outside `house-style.md`'s
documented scale. The 22 non-essay, non-tool pages hold to `.section`,
`.eyebrow`, and the documented type scale without exception.

## 5. Class drift

232 of the classes used across the 25 pages appear on exactly one page.
The large majority of these are legitimate, page-specific diagram and demo
names (`.clock-diagram`, `.pressure-node`, `.diagram-node`,
`.essay-visual-*`), consistent with `design/css-audit.md`'s "Live (93
classes)" findings. Each one names something specific to its page,
not a reinvented version of an existing pattern. The one cluster that is
drift rather than legitimate specificity is the `cc-*`/`mp-*` pair
described above, because it duplicates one component twice instead of
naming something that exists only once.

## 6. Dark and light

The theme mechanism itself (the `data-theme` attribute, `nav.js`,
`localStorage["kaspa-explained-theme"]`, the toggle button) is identical
across all 25 pages. No page diverges in how theming works. The one
cross-cutting issue is the deferred-script flash described in section 1,
which is a site-wide timing bug, not a per-page inconsistency. No hardcoded
color that fails to flip with the theme was found on any live page outside
the tool-page hex values already flagged above.

## 7. Tool pages and essay pages: judgment call

- **chain-comparer vs. model-picker: not earned.** Same tool shape (a
  weighted, preset-driven comparison with a ranked result list and a
  methodology disclosure), independently built twice. This is drift, and
  it is the most consequential finding in this audit. See section 3.
- **toccata-essay vs. the-instrument: earned.** `the-instrument.html` is
  intentionally minimal: a single `.section` with the standard eyebrow,
  heading, lead, and `.actions` buttons, using zero one-off classes. It's a
  cover page for a hosted PDF and correctly doesn't reach for anything
  special. `toccata-essay.html` is intentionally rich: a long visual essay
  that needs its own diagram rail (`.essay-visual*`, `.essay-section-grid`).
  It shares its outer shell (`article-body`/`knowledge-page`) with two
  other narrative pages rather than inventing that shell for itself. Both
  pages' differences from the grid-page norm are earned by what they
  actually are; neither needs to be pulled back toward the house pattern.

## Fix order, ranked by visibility to a reader

1. **Status-pill "testnet" miscoloring** (toccata-status.html, 1 page, 1
   instance). Broken, not just inconsistent: a testnet-stage claim reads
   with the same color as a wrong/unsupported one. Smallest possible fix,
   highest reason to do it first.
2. **Status-pill "research" invented color** (6 pages, 8 instances). Every
   "research"-labeled claim on the site renders an off-system color a
   careful reader will eventually notice doesn't match the other four
   states.
3. **Tool-page duplication, `cc-*` vs `mp-*`** (2 pages). Moderate direct
   visibility (a reader bouncing between the two tools will feel they're
   "close but not quite" the same product), high cost if left alone since
   every future edit to one won't reach the other. Consolidate onto
   `model-picker`'s more evolved pattern; fix the tagging radii and hex
   near-misses in the same pass since they live in the same blocks.
4. **Theme-init flash on light mode** (all 25 pages, site-wide). Invisible
   to the default dark-theme reader, but a real flash for every returning
   light-mode visitor on every page load. Fix once, not per page.
5. **Header whitespace variant** (7 of 25 pages). Zero visual impact,
   confirmed by diff to render identically; fix opportunistically in the
   same pass as anything else touching the header, not on its own.
6. **Undocumented dead components** (`.evidence-note`, `.stat-tile`). An
   editorial decision on scope, not a rendering problem. Lowest priority:
   resolve by either building them into a page where they fit or removing
   them from `house-style.md`.
