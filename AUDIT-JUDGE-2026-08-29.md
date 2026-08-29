# Newcomer judgment of every demo, 29 August 2026

Written by the judging pass, which built none of the demos it judges. The
producer of these demos assessed them mechanically and said so; this file is
the separate judgment it could not perform on itself.

## The reader

Finished high school. Rough idea what crypto is. Does not know UTXO, DAG,
GHOSTDAG, covenant, mergeset, blue work, DAA score, mass, anticone, finality
depth, pruning depth, or confirmation. Has not read the page around the demo
and will not.

## What counts as the demo's surface

In scope: the demo container, plus the heading and the one lede paragraph
immediately above it. Out of scope: anything further up the page, and anything
inside a closed `<details>`. A sentence that only exists behind a disclosure
has not been said.

## The four questions

1. **What am I looking at**, in the reader's own words, before touching anything.
2. **What do I touch.** The primary control is obvious without instruction.
3. **What just happened**, after moving one control. Visible change, plain words,
   units. "4.3 minutes" passes, "t = 258" fails, "124" alone fails.
4. **Why does this matter**, stated plainly, once, on the surface.

## Verdicts

| Demo | Page | Q1 what | Q2 touch | Q3 changed | Q4 why |
|---|---|---|---|---|---|
| collision-sim | what-is-kaspa | pass | pass | pass | **fail** |
| collision-sim | index | pass | pass | pass | **fail** |
| ghostdag-playground | what-is-kaspa | **fail** | pass | pass | **fail** |
| live-network | what-is-kaspa | pass | pass | pass | pass |
| mass-calculator | what-is-kaspa | pass | pass | pass | **fail** |
| attack-cost | kaspa-mining | pass | pass | pass | **fail** |
| emission-schedule | kaspa-mining | pass | pass | pass | **fail** |
| fee-market | kaspa-mining | pass | pass | pass | **fail** |
| node-cost | kaspa-mining | pass | pass | pass | pass |
| parameterless | kips | **fail** | **fail** | **fail** | **fail** |
| supply-split | kips | pass | pass | pass | pass |
| dag-time | kaspa-origin-story | pass | pass | pass | **fail** |
| fair-launch | kaspa-origin-story | pass | pass | pass | pass |
| parallel payments | utxo-vs-accounts | pass | pass | pass | pass |
| covenant-breaker | build-on-kaspa | pass | pass | pass | pass |
| zk-boundary | build-on-kaspa | pass | pass | pass | pass |
| confirmation-risk | why-kaspa-matters | pass | pass | pass | pass |
| argent-pipeline | argent-explained | pass | pass | pass | **fail** |
| security-budget | skeptical-case | pass | pass | pass | pass |

Nine of nineteen carry at least one failure. Eight of those nine fail only
question 4.

## The roster was wrong

The brief listed nineteen instances and named the pages holding them. It missed
`#security-budget-demo` on skeptical-case, and counted a second demo on
utxo-vs-accounts that does not exist: `/demos/shared-state.html` redirects to
`utxo-vs-accounts#shared-state`, which is a prose section and a three-row table,
not a demo. One in, one out. The count of nineteen survives; the roster did not.

## The dominant failure is question 4

Eight demos state what happens and never state why a reader should care. The
sentence usually exists, and is usually good, and is usually inside a closed
`<details>` or three paragraphs down the page. collision-sim is the clearest
case: "A single chain can only keep one block per collision, so the loser's
work is wasted" sits inside "How this works, and the sources", closed by
default. The reader who watches 33 blocks turn orange is never told that the
orange ones cost real electricity and bought nothing.

This is not a caption problem. Each fix is one sentence naming the consequence,
placed where the reader already is.

## parameterless is the one that fails outright

It fails all four.

- Four sliders, no primary. Two are labeled "Worst-case latency GHOSTDAG
  assumes in advance" and "Actual latency". The reader knows neither word.
- The two headline numbers, 124 and 18, carry no unit anywhere on the surface.
  They are counts of blocks. Nothing says so.
- Three separate hedges sit under three separate controls: "Runs past mainnet's
  rate on purpose", "Not a measured figure", "Hypothetical, not observed".
  Defensive register, and the reader has raised no objection yet.
- Two labels narrate what the interaction already shows. "Within the cap.
  Concurrent blocks stay inside the fixed margin" sits beside a gauge whose bar
  is visibly inside a marker labeled "cap". "No cap to exceed, and no person to
  retune it" sits beside a gauge that visibly has no cap marker. Move the
  latency dial and both facts are demonstrated. The labels teach nothing the
  bar has not already taught.

## Where this disagrees with the prior comprehension audit

The prior audit scored 9 of 17 failing. This pass scores 9 of 19 failing, but
not the same nine, and for different reasons.

- **Disagree, `parallel payments` (utxo-vs-accounts).** Previously failed on
  "no obvious primary control". "Watch the five checks run" is the only
  accent-filled button on the surface, centered under both panels, in the same
  viewport at 1280 and 768. It passes. Note that this page sits at 296 visible
  words against a hard 300 and reading grade 9.043 against a 9.0 cap, so a fix
  here would have had to remove as much as it added. Nothing needed removing.
- **Disagree, `live-network`.** Previously failed question 4. "An empty block is
  not a fault. The network makes room for ten a second whether anyone fills it
  or not, and most of that room goes unused" is on the surface, uncollapsed,
  and is exactly the consequence statement question 4 asks for.
- **Disagree, `covenant-breaker`.** Previously failed question 1. "This vault
  holds 10,000 KAS behind four rules. Get any of it to an address you control
  without satisfying all four" is a task, not a mechanism, and the reader can
  restate it in their own words in seconds.
- **Agree, `parameterless`,** and more harshly. The prior audit marked it a
  question-3 failure. It fails all four.
- **Withdrawn on rereading, `dag-time` question 1.** The label "DAA score" is
  an abbreviation the reader does not know, but the sentence directly above the
  slider defines the thing in plain words: it "rises by about one per accepted
  block, not once a second". A working definition beats an expansion. It passes
  question 1 and fails only question 4.
- **New, `ghostdag-playground`.** The main graphic's panel title is "The DAG".

## Three things that do not rescue a failing demo

A longer caption. Correctness. Familiarity. All nine failures above are
correct; that is not what was being tested.

---

# What the gates actually measured, 29 August 2026

Numbers below are before and after on the same command, not estimates.

## Render matrix

`RENDER_GATE_BLOCKING=true node scripts/check-render.mjs`, 20 pages, 120
renders, three widths, both themes.

| Assertion | Before | After |
|---|---|---|
| font-size | 1152 | 69 |
| contrast | 331 | 239 |
| touch-target | 298 | 88 |
| near-overlap | 172 | 94 |
| overlap | 0 | 8 |
| **total** | **1953** | **498** |

The exemption roster is unchanged. 303 sub-16px declarations were raised, a
floor block was appended to styles.css, and five near-miss color tokens were
recomputed against the surfaces they actually sit on.

## Density

`DENSITY_GATE_BLOCKING=true bash scripts/check-density.sh`: 37 to 6. Twenty
three of the original 37 were the gate counting hover-only tooltip text into
the paragraph hosting it. Eight were real and are cut. The six that remain are
all the same measure, words before the first thing a reader can touch:
skeptical-case 446, why-kaspa-matters 386, kaspa-mining 177, status 172,
crypto-from-scratch 157, kaspa-origin-story 154, against a limit of 150.

## Page length

Six pages over the 800px undifferentiated-run cap, before and after.
model-picker-method went from 15,365px with zero landmarks to 10,686px with
five. The other five are unchanged and are listed in the gate's own output.

# Three claims in the brief that did not survive checking

**`ul.mm-toc > li > a` at 14.4px on sources.html.** The class is real but it is
on model-picker-method.html. sources.html has no font-size violation at all,
before or after: its entire violation list was six touch-target and two
near-overlap.

**Body type at 16px against a 17px target, and line height 1.5 against 1.6.**
Both come from `scripts/measure-typography.mjs`, which defines "body" as the
paragraph with the most words on the page. On this site that is usually a demo
lede or an inline definition. Checked with getComputedStyle on the live page,
what-is-kaspa's body element is 17px with a computed line-height of 27.2px,
which is 1.6. Both targets were already met before this pass started. Measure
and the size ladder are real and still open: 67.6ch to 85.4ch across five pages
against 70ch, and 15 to 16 distinct sizes on the two largest pages.

**2,048 render violations.** The number was 1,953 on a clean run at HEAD.

# Gates watched failing

Both planted, watched red, reverted, and the revert confirmed by SHA-256 and by
`git status` reporting the file byte-identical to HEAD.

- **check-render.mjs.** A 12px paragraph and a 2.38:1 color planted on
  start-here.html took that page from 0 violations to 20: twelve font-size, six
  contrast, two touch-target. Reverted, back to 0.
- **check-density.sh.** A 70-word paragraph and a 40-word table cell planted on
  the same page took the gate from 6 to 8 and from exit 0 to exit 1, naming both
  by word count. Reverted, back to 6.

Not watched failing: check-page-height.mjs, check-demo-surface.mjs,
check-visible-words.mjs, check-glass-gate.mjs, check-orphan-classes.mjs, and
every script in the publish gate. Their behavior here is unverified.
