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
