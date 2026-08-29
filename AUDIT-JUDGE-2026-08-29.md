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
