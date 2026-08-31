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
| start-here.html | **D1** path-grid doors: zero hover response [N] | pass | pass | pass | **D1** every other card grid lifts on hover; these two do not [E] | n/a |
| crypto-from-scratch.html | **D5** checkboxes: no hover [E] | pass | pass | n/a | pass | n/a |
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
to the default state, and the `translateY(-2px)` lift the site's other card
grids get at `styles.css:4980` never lists `.path-grid a`. Measured across all
13 properties including `transform`: no change. These are the two doors the
site's own start page asks you to choose between. Severity: high. Class also
covers `.toccata-evidence-map a` and `.toccata-builder-grid a`.
Fixed: added `.path-grid a`, `.toccata-evidence-map a`, and
`.toccata-builder-grid a` to the site's existing card-lift hover treatment.

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

**D5. Native form controls have no hover.** Checkboxes, radios, selects,
number inputs, and search inputs give no pointer feedback on any page.
Severity: low. Fixed for the text-entry controls, which carry a visible
border that can take a tint.

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
