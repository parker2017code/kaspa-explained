# UX audit 2, independent second pass

Run on 31 August 2026 against `origin/main` at `649f3b7`, served from
`scripts/serve-local.py --port 4677`. Written before reading `UX-AUDIT.md`,
so the two are independent by construction.

Scope is what the publish gate cannot check. Text contrast, touch targets,
font-size floor, and element overlap are machine-checked every run at zero
violations and are not re-examined here.

## Method

Four measured sweeps, not screenshots.

1. **Overflow.** Every page in `site-manifest.json` except `the-instrument.html`,
   loaded at 390x844 and 320x844, comparing `documentElement.scrollWidth` against
   `clientWidth` and walking every rendered element for a right edge past the
   viewport, skipping anything whose ancestor chain establishes its own
   horizontal scroll or clip.
2. **States.** Every visible interactive element (`a[href]`, `button`, `input`,
   `select`, `textarea`, `summary`, `[tabindex]`, `[role=button]`), one
   representative per tag-plus-class signature, snapshotting 12 computed
   properties in default, `:hover`, and `:focus` and diffing them. Elements
   inside a closed `<details>`, or with no `offsetParent`, are excluded: they
   are not rendered, and probing them yields false "no state" readings. That
   filter is the difference between this table and a first draft of it that
   reported 40 phantom defects.
3. **Links.** Every visible link on every page, individually, not one per
   signature, because class alone does not predict a link's hover treatment.
4. **Failure paths.** Each of the six live-fetching pages loaded twice, once
   normally and once with every non-localhost request aborted via request
   interception, comparing table row counts and caption text between the two.

## Verdicts

Legend: `pass`, or a one-line defect. Perspective in brackets: `[E]` expert,
`[N]` novice.

| Surface | 1 states | 2 overflow 390/320 | 3 label clarity | 4 newcomer Qs | 5 consistency | 6 failure path |
|---|---|---|---|---|---|---|
| index.html | pass | pass | pass | n/a | pass | n/a |
| start-here.html | **D1** path-grid doors: zero hover response [N] | pass | pass | pass | pass, and see D1's note: no card grid on this site lifts on hover [E] | n/a |
| crypto-from-scratch.html | **D5b** nine checkbox rows: no hover [N] | pass | pass | n/a | **D5b** same gap on four more checkbox controls, three other pages [E] | n/a |
| what-is-kaspa.html | **D4** slider thumbs: no hover [E] | pass | pass | pass | pass | **D7** livenet fallback prints "0 blocks were racing" before any read [N] |
| kips.html | **D4** slider thumbs [E] | pass | pass | pass | pass | pass, baseline stands and caption restamps |
| kaspa-origin-story.html | **D4** sliders; **D6** view-switch Chart/Table: no hover [E] | pass | pass | pass | **D6** same view-switch, three pages, no hover on any [E] | n/a |
| why-kaspa-matters.html | **D3** relaxed/normal/strict pills: no hover on any of the three [N] | pass | pass | pass, though the demo carries no heading of its own | pass | n/a |
| utxo-vs-accounts.html | **D5** checkbox: no hover [E] | pass | pass | pass | pass | n/a |
| status.html | **D5** search input: no hover [E] | pass | pass | n/a | pass | n/a |
| skeptical-case.html | **D4** sliders [E] | pass | pass | pass | pass | n/a |
| kaspa-mining.html | **D4** sliders [E] | pass | pass | pass | pass | pass, restamps "The live read from api.kaspa.org failed" |
| build-on-kaspa.html | **D2** five `.cvb-attack` buttons: no hover [N]; **D5** select and number inputs [E] | pass | pass | pass | **D2** the demo's other buttons hover, its five primary ones do not [E] | pass, no content depends on the external fetch |
| argent-explained.html | pass | pass | pass | pass | pass | pass, restamps "The live read from GitHub failed" |
| chain-comparer.html | **D4** eleven sliders [E] | pass | pass | pass | pass | n/a |
| model-picker.html | **D4** six sliders; **D5** checkbox, select [E] | pass | pass | pass | pass | n/a |
| model-picker-method.html | pass | pass | pass | n/a | pass | n/a |
| model-picker-data.html | **D5** search input [E] | pass | pass | pass | pass | pass, fully static, no external fetch |
| sources.html | pass | pass | pass | n/a | pass | n/a |
| search.html | **D5** search input [E] | pass | pass | pass | pass | n/a |
| 404.html | pass | pass | pass | n/a | pass | n/a |

`the-instrument.html` is hosted guest work and was not touched or measured.

### Per-demo, items 3 and 4

Each demo was read for the four newcomer questions inside its own container
plus its heading and the single lede above it.

| Demo | What am I looking at | What do I touch | What just happened | Why it matters |
|---|---|---|---|---|
| GHOSTDAG, what-is-kaspa | pass | pass | pass | pass |
| collision, what-is-kaspa | pass | pass | pass | pass |
| mass-calculator, what-is-kaspa | pass | pass | pass | pass |
| livenet, what-is-kaspa | pass | pass | pass | pass, but see D7 |
| argent pipeline | pass | pass | pass | pass |
| parallel, utxo-vs-accounts | pass | pass | pass | pass |
| emission-schedule, kaspa-mining | pass | pass | pass | pass |
| attack-cost, kaspa-mining | pass | pass | pass | pass |
| fee-market, kaspa-mining | pass | pass | pass | pass |
| node-cost, kaspa-mining | pass | pass | pass | pass |
| covenant-breaker, build-on-kaspa | pass | pass | pass | pass |
| ZK-boundary, build-on-kaspa | pass | pass | pass | pass |
| supply-split, kips | pass | pass | pass | pass |
| parameterless, kips | pass | pass | pass | pass |
| security-budget, skeptical-case | pass | pass | pass | pass |
| dial tool, chain-comparer | pass | pass | pass | pass |
| picker, model-picker | pass | pass | pass | pass |
| filter and tables, model-picker-data | pass | pass | pass | pass |
| fair-launch, kaspa-origin-story | pass | pass | pass | pass |
| dag-time, kaspa-origin-story | pass | pass | pass | pass |
| confirmation-risk, why-kaspa-matters | pass | pass | pass | pass |
| search, search.html | pass | pass | pass | pass |
| vocab quiz, start-here | pass | pass | pass | pass |
| path grid, start-here | pass | pass | pass | pass |

Every demo names its subject before you touch it, has one control that reads
as the obvious first move, and states its result in plain words with a unit.
That is the strongest part of the site and no copy change is warranted.

## Defects

**D1. `.path-grid a` has no hover state at all.** `styles.css:5657` neutralizes
`.path-grid a:hover` to `border: 0; background: var(--card-bg)`, byte-identical
to the default state. Measured across all 13 properties including `transform`:
no change. These are the two doors the site's own start page asks you to choose
between. Severity: high.

My first read of this said the fix was to add `.path-grid a` to the
`translateY(-2px)` card lift at `styles.css:4980`. That was wrong, and the
measurement caught it: `styles.css:4369` sets `transform: none !important` on
hover for a 35-selector list that includes `.path-grid a`, so no card grid on
this site lifts on hover and nothing can out-specify an `!important`. The rule's
stated reason, backdrop-filter cards flickering while they move, died with the
de-glassing. Two further facts about that list, since they bear on any later
cleanup: only `.path-grid` and `.check-grid` of its 35 selectors appear in any
page at all, and the lift at `styles.css:4980` it overrides is therefore dead
code in its entirety. Removing either is a separate job with a much wider blast
radius than this pass.
Fixed: a background step on `.path-grid a:hover`, which is the Apple idiom
`design/STANDARD.md` names first anyway, and which no `!important` blocks.

**D2. Five `.cvb-attack` buttons dead on hover.** `build-on-kaspa.html:374`
sets the attack buttons' background at the same specificity as
`.cvb-demo button:hover` on line 371 but later in the file, so the base
background wins and the hover is silently discarded. These are the five
primary controls of the covenant-breaker demo, the only things on that panel
a reader is meant to press first. Severity: high. Fixed: added
`.cvb-demo button.cvb-attack:hover` and `.cvb-demo button.cvb-attack.repeat:hover`.

**D3. `relaxed / normal / strict` pills have no `:hover` rule.**
`why-kaspa-matters.html:265` styles `.cr-pill-group button` and its
`aria-pressed="true"` state, and defines no hover. All three read as inert
until clicked. Severity: medium. Fixed: added a hover background.

**D4. No range slider anywhere on the site responds to hover.** Ten separate
`::-webkit-slider-thumb` definitions across ten pages, none with a hover or
active state. The slider is the primary control of eleven demos, so this is
the single highest-count gap found. Severity: medium, but broad.
Fixed: one global rule in `styles.css` scaling the thumb on hover and on
press, chosen because no per-page rule sets `transform` on the thumb and so
no specificity fight is possible.

**D5. Native form controls have no hover.** Selects, number inputs, and search
inputs give no pointer feedback on any page. Severity: low. Fixed with a border
tint, plus a page-scoped rule on `build-on-kaspa.html` where `.cvb-field`'s own
border-color out-specifies the global one.

**D5b. Nine checkbox rows on `crypto-from-scratch.html`, plus five more across
three other pages, have no hover.** A bare checkbox cannot take a background,
but the label wrapping it is the real click target and the real control, and it
was inert. Severity: medium on `crypto-from-scratch.html`, where the nine rows
are the page's only interactive element. Fixed with a background step on
`label:has(> input[type="checkbox"])`, mixed over `--card-bg` rather than
transparent so the card rows stay opaque.

**D6. `.view-switch` Chart/Table toggle has no hover**, on all three pages
carrying it. Severity: low. Fixed with the same background step the site's
other segmented controls use.

**D7. The livenet demo's failure text asserts a number it never measured.**
With the network cut off before any successful read, the panel prints
"0 blocks were racing for that spot when this page last reached the network."
There was no last read. The next sentence does say the count is not current,
but a reader who takes the first sentence at face value is told that zero
blocks race on a network whose entire premise is that many do. Severity:
medium, novice-facing. Fixed: the pre-read case now says no read has happened
yet instead of printing a zero.

## What passed, stated positively

**Horizontal overflow: clean.** Zero pages overflow at 390px, and zero at
320px. Long URLs, wide tables, code blocks, and SVG viewBoxes all hold. This
was the sweep most likely to find something and it found nothing.

**Focus: complete.** Every visible interactive element on every page changes
at least one computed property on focus. There is no keyboard-invisible
control anywhere on the site, including the seventeen focusable SVG groups
in the model picker.

**Failure paths: exemplary, and better than the rule requires.** All six
live-fetching pages leave the hand-written baseline standing, restamp the
caption with what actually happened, and never render an empty table. They
distinguish three cases in the caption text, not two: a live read, a rate-limit
("GitHub's public quota for this network is used up"), and a hard failure
("The live read from GitHub failed"). `model-picker-data.html` makes no
external request at all. Nothing here needed fixing except D7.

**Term tooltips work, and the coarse sweep was wrong about them.** The
per-signature sweep flagged `.term-def` on nine pages as having no hover. It
does: `styles.css:6707` reveals the definition panel, measured going from
`opacity 0 / hidden` to `opacity 1 / visible` on hover. What does not change is
the span's own computed style, which is all the sweep was reading. Recorded
here because it is the same false-positive shape as the closed-`<details>`
problem, and the next person running this harness should expect it.

**Demo copy: the site's strongest surface.** See the per-demo table.

## Coverage I did not achieve

- I did not press Tab through each page by hand. Focus states were measured
  programmatically on every visible interactive element, which is stronger
  evidence for "is there an indicator" and weaker evidence for "is the tab
  order sane." Tab order was not checked.
- Disabled, loading, and empty states were checked only where a page enters
  them on its own. I did not drive each demo into every one of its states.
- Hover was measured at 1280px. A coarse-pointer pass was not run.
- Light theme was not measured separately; all figures above are dark theme,
  the site default.

## Against `UX-AUDIT.md`, read only after the above was written

**Agreement.** Zero horizontal overflow at 390px, zero focusable elements
without a visible ring, and a pass on the four newcomer questions for every
demo. Two independent methods, same verdicts.

**Where the first pass is stronger, and this one should not be read as
replacing it.** Its overflow sweep ran twice, once cold and once after opening
every `<details>` and clicking every button. Mine ran cold only, so on
post-interaction overflow its evidence is better than mine and my 390px "pass"
is the weaker of the two. Its focus check was a real `Tab` traversal of 950
elements, which proves tab order reaches everything; mine measured computed
style on every visible interactive element, which proves an indicator exists
but says nothing about order. It also drove each demo's primary control with a
real event and read the readout back, where I read the rendered container and
operated only some controls, so its four-question verdicts rest on more than
mine do. Its two fixes, the `.reality-table tr[hidden]` bug below 700px and the
absent `:active` state sitewide, were both real class defects and both landed
before this pass began.

**Where it was wrong, and it says so itself.** Its closing section states:
"Hover states were not independently screenshotted per control; verified by
reading each component's CSS for a `:hover` rule... A hover state that is
defined in CSS but visually wrong (e.g. same color as default) would not be
caught by this method." That is precisely the defect class, and all seven
hover defects here sit inside it. The problem is that the table above that
admission records PASS on component states for `start-here.html`,
`build-on-kaspa.html`'s covenant-breaker, and `why-kaspa-matters.html`'s
confirmation-risk demo, the three surfaces measured here at literally zero
hover response, and one row reads "hover/disabled/focus-visible/aria-pressed
all defined and rendered correctly" when hover was not rendered-verified
anywhere. A method's known blind spot has to reach the verdicts, not only the
caveats section. Reading the rule is not measuring the result: three of the
seven defects here are a rule that exists and loses, one of them to an
`!important` that nothing can beat.

**Where it declined to check and inference happened to hold.** It did not force
the live-data failure paths, reasoning from the `catch` code and the documented
pattern instead. Forcing all six confirms the inference and finds one thing
reading could not: `what-is-kaspa.html`'s livenet demo printed a measured-
sounding zero in a state where it had measured nothing.

**What neither pass covered.** Post-interaction overflow at 320px. Tab order
as opposed to focus visibility. Light theme measured separately. Coarse-pointer
behavior. Every demo driven into its disabled, loading, and empty states
deliberately rather than only where a page enters them on its own.

---

# Third pass, 31 August 2026: the five gaps the section above names

The closing section above lists what neither of the first two passes covered:
post-interaction overflow at 320px, tab order as opposed to focus visibility,
light theme measured separately, coarse-pointer behavior, and every demo
driven into its states deliberately. That list is what this pass measured.
Nine defects found, nine fixed, in five classes.

Every harness below was run against a planted defect and watched go red before
its clean result was believed. Two were wrong on the first try and the planted
defect is what caught it; both are recorded where they happened.

## The check that could not fail

`html` and `body` both set `overflow-x: hidden` (styles.css:101, 128).
`document.scrollWidth` therefore can never exceed `clientWidth`, so every
overflow assertion written against that comparison, including
`scripts/check-render.mjs` assertion 1 and both prior passes' "zero horizontal
overflow at 390px", is a check that cannot go red. Content wider than the
viewport is not scrolled to. It is clipped, which is worse than a scrollbar:
unreachable by mouse, keyboard and touch alike, with nothing to hint it exists.

Measuring elements rather than the document, and counting one only when
nothing between it and `<body>` can be scrolled to reveal it, found real
clipping that the document-level assertion had reported as zero for two passes.

## 1. Tab order

Walked with real `Tab` presses on all 22 pages at 1280px, recording the
focused element's document position at every stop, then comparing the tab
sequence against visual order. A multi-column link list is read column by
column, not row by row, so a pair counts as out of order only when the two
controls overlap horizontally, which is to say sit in the same column.
`position: fixed` and `position: sticky` controls are excluded: their document
y is a viewport offset, not a place in the reading order.

**Clean, and the check can fail.** 1,105 tab stops across 22 pages. Zero
controls out of order, zero positive `tabindex`, zero focus traps, zero
focusable elements that should not be: nothing `aria-hidden`, nothing without
an accessible name, nothing zero-area. The negative control plants a positive
`tabindex`, an `aria-hidden` focusable, and one control moved to the top of the
page without moving in the tab sequence, and the detector reports all three.

The first version of that detector had its inversion comparison backwards and
returned "clean" on every page for a reason that had nothing to do with the
site. The planted defect is what exposed it.

## 2. Post-interaction overflow, 390px and 320px

Every `<details>` opened, every button and `[role="button"]` and `summary`
clicked one at a time, every slider driven to both ends, every text input
filled with a 200-character string and then emptied and submitted, with a
measurement after each action. Both themes.

Three defects, all at 320px, all fixed:

| Page | Control | Trigger | Measured |
| --- | --- | --- | --- |
| why-kaspa-matters.html | confirmation-risk readout row | merchant-share slider at 60 | row ran to x=328 against a 320px viewport |
| build-on-kaspa.html | covenant-breaker vault rule | opening "Vault details and rules" | rule text ran to x=333 |
| kips.html | KCC-0020 quote citation | cold load | bare-URL link text 280px wide in a 237px box, 9px past the viewport, cutting the issue number |

Two classes. The first two are `min-width: auto`, the default for a grid or
flex item, which refuses to shrink below the content's min-content width;
`min-width: 0` on the row and on its text column fixes both. The third is a URL
with no break opportunity in an element whose `overflow-wrap` is `normal`.

After: zero clipped elements at either width, in either theme, after every
action above.

The detector missed the third shape on its first run. An unbreakable token in a
block overflows the box without the element's own rect moving, so a
box-geometry test cannot see it. The planted defect caught that too. The
element-content test it needed then produced two false positives, both
`.info-affordance` wrappers whose `scrollWidth` counts an absolutely positioned
panel, which is why the final predicate skips elements with out-of-flow
descendants.

## 3. Floating panels clipped at the viewport edge

`.info-affordance__panel` and `.term-def__panel` are absolutely positioned and
centered on their trigger, so a trigger near either edge pushes the panel
outside the viewport, where the `overflow-x: hidden` above clips it.

Measured with nav.js blanked, over all 22 pages at 390px and 320px: **15 panels
outside the viewport across 7 pages**, 10 past the right edge (worst
`#tps-info-panel` on kaspa-mining.html at right=435 against 390) and 5 past the
left edge (worst `#ln-intro-info-panel` on what-is-kaspa.html at left=-14).
Left-edge clipping had never been looked for.

Three of the fifteen are the fee-market demo panels that styles.css's own
"Defect 2" note records as unfixed, having correctly diagnosed the remaining
overflow as positioning rather than width and said the fix had to happen
outside that rule. Width was the wrong lever and had already been tried three
times: a panel centered on a trigger 20px from the edge overflows at any width.
nav.js now measures the rendered box and shifts it back inside with an 8px
gutter, on the `translate` property rather than `transform` so it composes with
whatever the cascade already set and no CSS rule has to change.

After: 0 panels outside the viewport, both themes.

## 4. Light theme, measured separately

Two findings the dark-theme passes could not have seen, and one correction to
this document's own method.

**The entry doors, light only.** `#door-one` and `#door-two` on
start-here.html changed zero computed properties on hover in light and changed
their background in dark. styles.css:5660 carries a
`:root[data-theme="light"] .path-grid a:hover` reset at specificity (0,3,1),
which outranks the (0,2,1) fix at styles.css:7700 in light only. A fix the
previous pass verified in dark was silently reverted in the other theme, which
is exactly the defect shape that pass named and could not measure, one theme
further on.

**Eighty of ninety-two `<summary>` elements, both themes.** Screenshotted at
rest and hovered and compared byte for byte, 80 of the site's 92 summaries were
identical on hover, across 14 pages. styles.css defined no `summary:hover` at
all. The 12 that do respond are covered by six page-scoped rules in
model-picker.html and chain-comparer.html, and those are the measure this is
judged against: the site already treats a disclosure trigger as something that
answers the pointer, and most of them were missed. Fixed with an inset shadow
rather than a background, because many of these summaries carry a background
already and a background would replace it. After: 0 of 92 identical, both
themes.

**Computed style is not enough for a slider, and a signature sweep says so
wrongly.** A computed-style sweep reported 9 range sliders as having no hover
or press response in either theme. That is false. `getComputedStyle` cannot
read `::-webkit-slider-thumb`, because Chromium does not expose UA shadow
pseudo-elements, and the thumb is where the feedback lives. Screenshotting each
slider at rest, hovered and pressed shows all 42 responding in both themes.
Recorded because it is the mirror image of the false positive the second pass
recorded for `.term-def`: there the change sat on a descendant the sweep did
not walk, here on a pseudo-element no sweep can walk.

**The four nav links reported dead are correct as they stand.** On each page,
the nav link for that page carries `aria-current="page"` and already renders in
the emphasized state hover would move it to. The state reaches assistive
technology through the attribute, not through color alone.

## 5. Coarse pointer

All 22 pages in a touch context reporting `(pointer: coarse)` and
`(hover: none)`, with every `.term-def` and `.info-affordance` tapped using
real touch input.

**Clean.** 0 affordances that a tap did not open, 0 hover-only reveal rules
without a click or focus equivalent anywhere in the stylesheet, 0 pages where
the media query reported the wrong pointer type. `.info-affordance` carries an
explicit click toggle. `.term-def` has no click handler at all and relies on
`:focus-within`, which a tap on its `tabindex="0"` host satisfies: measured
directly, after a tap `focus-within` matches, the activeElement is the
`.term-def` span, and the panel goes visible.

The site has **zero** `@media (hover: hover)` guards and needs none on this
evidence, because every hover reveal has a focus or click path beside it.

Removing `tabindex` alone does not make these panels unreachable: Chromium's
touch emulation produces a sticky `:hover` after a tap exactly as a real phone
browser does. The negative control therefore deletes the `:hover` reveal rule
as well, and with both paths gone all 7 panels on the test page go unreachable,
which is what makes the clean result mean anything.

## 6. Demos driven into their states deliberately

Every live-fetching page loaded five times with its external requests
intercepted: aborted, HTTP 500, HTTP 403 with a rate-limit body, HTTP 200 with
an empty body, and never resolving at all.

**Two defects in the same shape, both fixed.** argent-explained.html and
kips.html each ask the GitHub rate-limit endpoint before spending quota, and
each read the answer as
`limits && limits.resources && limits.resources.core ? remaining : 0`. That
turns "could not ask" into "asked, and the answer was zero".
argent-explained.html printed "GitHub's public quota for this network is used
up" on HTTP 500, on HTTP 403, and on an empty 200 body, three states in which
it held no quota reading at all. Only the abort case, which throws into the
catch, said the read had failed. kips.html carries a `quotaLeft` flag for
exactly this distinction and the flag was false in all three of the same
states. Both now require a real numeric reading before the quota sentence is
allowed. No new strings: each page already carried the "live read failed"
wording.

kips.html separately treated a 200 that parses to zero KIP rows as a quiet
success and returned without restamping, leaving its caption saying the table
"refreshes live on load" when nothing had refreshed. Now a failure like any
other. The adjacent KCC pull-request list keeps its quiet return on purpose,
because a zero-length list there is a real answer rather than a broken read.

After, across all five states on all six live surfaces: every caption names the
cause it actually observed, no table renders empty, no readout is left on a
placeholder, and no numeric field shows a non-number.

**One thing found and deliberately not changed.** what-is-kaspa.html's livenet
section keeps the standing line "a live read of Kaspa's own public API, not a
simulation" in every failure state, including the one where the request never
resolves. The demo's own readout restamps correctly; the prose above it does
not, and the reader meets the prose first. Left alone because this pass was
scoped out of changing prose and claim text. It is the same defect class as the
zero the second pass found this demo printing, one layer up, and it wants an
owner decision rather than an agent's rewrite.

## 7. Screen-reader semantics, disclosure state, print

**Custom `[role="button"]` controls: clean.** 61 non-button elements carry
`role="button"`. All 61 are focusable and all 61 have an accessible name.
Driven with real input rather than synthesized keyboard events, the GHOSTDAG
playground's blocks produce identical results from a mouse click, an Enter
press and a Space press. An earlier sweep reported 15 of them as answering
neither key; that was the harness, because a synthesized keyboard event does
not trigger the browser's activation behavior and focusing the element had
already opened the panels being compared.

**Live regions: clean.** 32 `aria-live` regions. The two a first sweep reported
as permanently empty, `#gp-mine-caption` and `#gp-focus-caption`, both fill on
the actions they report on; the sweep had clicked the demo's own reset
afterwards.

**Disclosure state across navigation: clean.** Every in-page anchor whose
target sits inside a closed `<details>`, on all 22 pages, opens that disclosure
and lands the target in the viewport. nav.js's ancestor reveal needed nothing.

**Print: one defect, fixed.** styles.css carried no `@media print` block. The
fixed pill header printed on 22 of 22 pages, over the top of the first page,
with its backdrop strip and the footer link list, and nothing inside a closed
`<details>` printed at all. Counting the words `innerText` renders under print
media, the block adds **12,377 words** across the site: 5,032 on
what-is-kaspa.html, 1,650 on kips.html, 1,392 on model-picker.html, 1,310 on
kaspa-mining.html.

Revealing that content takes two rules rather than one. Chromium hides a closed
disclosure's contents through
`::details-content { content-visibility: hidden }`, which a `display` rule on
the children cannot reach: with the `display` rule alone the sweep gained 3,172
words, almost all of them on a single page.

## Cache keys, found while bumping them

`demos/index.html` was pinned to the 25 August stylesheet and nav script while
the 21 root pages were six days ahead, and `design/patterns.html` and
`design/page-template.html` were a week behind on the stylesheet. Every key now
matches across all 24 files. The previous pass's note about shipping CSS
without a bump describes the failure; this is the same failure standing in
three files nobody swept.

## Coverage I did not achieve

- The hover, press and focus sweep drives one control at a time and cannot see
  a state that needs two controls in a particular combination.
- Demos were driven into their fetch-failure, loading and empty states. Their
  `:disabled` states were exercised only where a control disables itself under
  some input. I did not force `disabled` onto controls that never set it, so a
  disabled style that exists in CSS and is never reached is unmeasured here.
- Tab order was measured at 1280px only. A layout that reflows at 390px could
  reorder columns against a sequence that is correct at desktop width.
- Print was measured as rendered word count and chrome suppression under
  emulated print media, not as a paginated PDF. Column breaks, orphans and page
  break placement are unmeasured.
- The livenet prose on what-is-kaspa.html, named above, is a real finding left
  unfixed by scope.
