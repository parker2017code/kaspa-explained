# RESUME HERE. Read this first, every session, before touching anything.

Nothing has been pushed. The site is mid-rebuild. Read this, then `TODO.md`, then
`PRINCIPLES.md` and `SITE-STANDARD.md`. `CLAUDE.md` imports `AGENTS.md`, which points here.

## Who you are working for, and how he works

He gives standing instructions and expects them held without re-asking. The ones in force:

- **Do the whole job. Never announce a reduced scope.** Saying "I'll read the logic and
  cover the markup mechanically" is worse than the shortcut itself: it asks permission to
  do less while sounding rigorous. Compress the reporting, never the work.
- **Record after every task**, because compaction can land at any moment. This block is
  the record. Update it as work completes, not at the end.
- **Do not burn tokens.** Exploring is fine. Redundant verification loops and long
  restatements are not.
- **Maximum two agents, one alive at a time, Opus, and no agent may spawn subagents.**
  Verified zero subagent spawns across seven agent instances so far.
- **Never touch or resize his Chrome.** Use playwright with its own viewport or the
  fixed-width iframe harness. His wifi drops, which is what keeps killing agents; that is
  environmental, not a fault in their work.
- **Never edit `the-instrument.html`.** It is Moose's 279-page work, hosted as a guest
  piece.
- **Rules break for the good of the site**, but say so and say why.

## Where the work stands

The rebuild workflow `wf_44c36aa8-948` runs five sequential agents. **2 of 5 finished.**
Agent 1 produced ground truth (`data/ground-truth-2026-08-29.json`). Agent 2 rebuilt
`index`, `start-here`, `crypto-from-scratch`, `what-is-kaspa`, `why-kaspa-matters`. Agent 3
is on `kaspa-mining`, `build-on-kaspa`, `argent-explained`, `kips`, `utxo-vs-accounts`, on
its **fourth attempt** after three wifi deaths; progress accumulates across attempts
because each retry reads the worktree as it stands. Agent 4 then takes the remaining eight
pages including `model-picker`. Agent 5 integrates, regenerates derived files, gates and
commits. **The workflow never pushes.**

**You do the final pass and the deploy.** Every page at 320/390/768/1024/1280/1600 in both
themes. Every demo hand-driven as a newcomer against the four questions: what am I looking
at, what do I touch, what just happened, why does this matter. Every link, nav item,
footer link, disclosure, tooltip and keyboard path used. Every line of code read. Fix what
you find; do not hand back a list. Then push, then verify the changed strings from served
bytes with a cache-busting URL. A successful push is not a live check.

## The single most important lesson from this session

**Reading finds defects. Scanning does not.** Every real defect came from reading code or
driving the rendered page. Every one of the seven flags raised by fast detectors was false:
hidden tooltip panels, screen-reader-only text, tables scrolling correctly in their own
container, a summary line ignoring its own data field, a lede-plus-number typographic
pattern, a slider that moves DAA from 0 to 906 million, and correct whitepaper math I
tested against transposed expected values.

**And a scanner cannot see what it cannot open.** Commit `cccdfba` removed the image
viewer's display rule during a stylesheet cut, because a dead-CSS scanner never opens a
dialog, so a rule that only applies while one is open read as unmatched. Expand on
`kaspa-mining` then rendered a 0x0 element for months. This is why the 238 rules measured
as dead or inert in `data/dead-css-scan-2026-08-29.json` must **not** be bulk-removed.

## What blocks the push

1. **Glass gate fails**, 6 blocking violations: brand-gradient buttons on
   `build-on-kaspa.html` and `kips.html`. Confirmed as agent 3 inlining demo widgets into
   root pages, not the CSS deletion; the gate fails identically against the original
   stylesheet. Advisory under `demos/`, blocking on root pages.
2. **Ten pages exceed the 800px undifferentiated-run limit**, worse than the six before the
   rebuild. `kaspa-origin-story` sits at 4016px.
3. **Five measured typography targets missed**, from nine reference sites in
   `data/reference-metrics-2026-08-29.json`: measure 78.8ch against 70, body 16px against
   17, line height 1.5 against 1.6, up to 16 distinct font sizes against 10, homepage
   paragraph p90 109 words against 70.
4. **`og:image` still points at the May card** on all 19 pages. The replacement is built and
   committed as `og-kaspa-explained-20260829.png`; regenerate with
   `python3 scripts/build-og-card.py`. Delete the two byte-identical 339KB originals once
   nothing references them.
5. **Several commits used `--no-verify`.** `sitemap.xml` and `agent-index.json` are
   generated from page content, so regenerating them picks up uncommitted agent edits and
   never matches HEAD. Unfixable mid-run; agent 5's step 5. Verify in a clean clone before
   pushing and never carry a `--no-verify` past a push.
6. **Run the FULL gate.** The pre-commit hook sets `SKIP_RENDER_CHECKS=1` deliberately,
   because the render block costs four minutes and commits had started landing with
   `--no-verify` under that pressure. CI always runs it. You push directly, so you must:

       VISIBLE_WORDS_BLOCKING=true RENDER_GATE_BLOCKING=true \
       PAGE_HEIGHT_BLOCKING=true DEMO_SURFACE_BLOCKING=true \
       bash scripts/check-site.sh

## Environment

    export PATH="$HOME/.local/opt/node-v22.14.0-darwin-arm64/bin:$PATH"
    python3 scripts/serve-local.py --port 4196
    curl -s -m 3 -o /dev/null -w '%{http_code}' http://127.0.0.1:4196/    # must be 200

Port 4187 is wedged: it accepts connections and never answers, which looks like a hung page
rather than a refused one. About 29 stale servers from old sessions are listening.

## Do not undo any of this

Both collision demos now draw a real DAG; one fallback line had given every block a parent
it could not have seen, so 100% had exactly one parent and the panel labeled BlockDAG drew
a chain. Arrivals are exponential, not a fixed timer. The GHOSTDAG demo names the same sink
it draws. 36 tooltips no longer tell screen readers they are collapsed while open. A stray
`%` in a URL no longer throws sitewide. The image viewer opens and is a real modal. 44 CSS
rules whose classes appear in no HTML anywhere are gone. `refresh-model-data.py` refuses to
run and prints the live path.
# kaspa explained working state


## STALE. Read this before the section below, 29 August 2026.

**The "21 August" state block below is out of date and will mislead you.** It says 21
models and 10 dials of one figure each. Both are wrong as of 29 August 2026:

- The picker holds **23 models**, not 21.
- It has **6 dials**, not 10, after a consolidation that was measured rather than
  asserted. Five of the ten dials pointed at one general factor and were averaging each
  other out. Six dials produce 10 distinct leaders and 52 distinct top-three sets over
  23 models, against 7 and 23 for the ten-dial version.
- `sh.f` is not 0.40. It ranges 0.00 to 1.00 per model. **0.40 is `TARGET_F`**, the
  destination, which is a different thing. The guard on TARGET_F still stands.
- Placement stays on the price axis. Moving it to response time was built and measured
  and is **worse**: leave-one-family-out RMSE 0.167 for price against 0.260 for response
  time, because four of twenty ladders are degenerate on the clock.

**This file is itself instance seven of the bug class it documents below**: a value
written against one shape of the data, left behind when the shape moved. Treat every
figure in the block below as unverified until you have checked it against the data.

Ground truth lives in the artifacts, never here: the roster is `window.__MP__` inside
`model-picker.html`, the chains are `data/l1-chains.json`, the pages are
`site-manifest.json`. Count from those.

Also read, and they outrank this file: `PRINCIPLES.md` for how to work, and
`SITE-STANDARD.md` for what good means in numbers and what authority you have.

---

## STOP. Read this first, 21 August 2026, end of session. STALE, SEE ABOVE.

**Everything is committed, pushed, deployed and verified live.** HEAD is
`8534d5a`. The gate passes on a CLEAN CHECKOUT of that commit, which is the
check that matters. Working tree is clean apart from two files that are
intentionally never committed.

Live state as of 21 August 2026, confirmed then by fetching kaspaexplained.com
with a cache buster: 10 scored figures, 21 models, 10 dials of ONE figure each,
four sources (Artificial Analysis 4, LiveBench 4, LM Arena 1, ARC Prize 1),
every model carries a price. **Superseded on 29 August: 23 models, 9 labs, 6
dials. See `data/ground-truth-2026-08-29.json`, counted from repo data.** The
sample sizes quoted further down (n=21, n=38, n=20) are the sizes those analyses
actually ran on and stay as written; they are not roster counts and must not be
"corrected" to today's roster.

### The structure now

Ten capability benchmarks, one per dial, equal weight, chosen by how far apart
the top five models sit on the honest scale:

    hle 17.0, aaCritpt 24.9, arcAgi2 21.0, lbCoding 7.9, lbAgenticCoding 6.9,
    webdevArena 6.5, lbInstructionFollowing 6.9, omniAccuracy 15.2,
    omniNonHallucination 8.2, lbLanguage 9.4

Cost is NOT scored. It is the value chart's horizontal axis only. Scoring it as
a dial too counted it twice, once in the score and again in chart position.
Speed is NOT scored: time to first token separates the top five by 0.3 points
and total response by 0.9.

TARGET_F is 0.40, derived at build time, with a guard that FAILS THE BUILD if
the shipped constant drifts more than 0.06 from the derived knee. Do not
delete that guard. It has already caught two real errors.

Landing defaults: reason 10, code 10, build 10, honest 8, know 8, follow 7,
apps 6, novel 5, write 5, physics 3. Not making things up sits at 11.1 percent
because a confident wrong answer costs more than a slow one and nothing else
measured predicts it. Physics sits lowest at 4.2 percent, most discriminating
and narrowest in application.

### THE BUG CLASS THAT KEEPS RECURRING, now six instances

A value written against one shape of the data, left behind when the shape
moved. Every instance shipped silently.

1. Per-source counts hardcoded 13/7/5, still summing to 25 when there were 32.
2. MIN_METRICS fixed at 9: 22.5 percent of a 40-figure grid, 45 percent of a
   20-figure one. Dropped a model for coverage that had not changed.
3. The FIG name map went stale and leaked raw keys like `arcAgi2` to readers.
4. `ci_note` hardcoded "Twenty-five figures" long after the count moved.
5. `source_of()` had no branch for the arc prefix, so ARC figures were counted
   as Artificial Analysis and the page said three boards when there were four.
6. RAW_ALSO: cost per task left METRICS when it stopped being scored, and the
   status board backfill loops over METRICS, so Muse Spark 1.1 shipped with no
   price at all on the chart's own axis.

The counter-lesson, learned the hard way: an audit recommended scaling
MIN_CORE_FOR_OWN_CAP the way MIN_METRICS scales. That was WRONG and shipping it
put Claude Sonnet 5 from last to first on a curve fitted to two benchmarks.
MIN_METRICS is a proportion of the question and must move with the grid. That
one asks whether there is enough evidence to call something a curve, and four
points is four points at any grid size. Derive proportions. Do not let "derive
it" turn a minimum-evidence floor into a proportion.

### CIRCULARITY, found twice, fixed twice, look for a third

LiveBench Overall is the EXACT unweighted mean of its seven categories, max
deviation 0.057 over 44 rows. Anchoring a category on it predicts a number
partly from itself. Weights are known, so the target is subtracted back out.

The Artificial Analysis Intelligence Index is the same bug wearing a disguise.
Against a plain average of eleven of its own components it correlates at
r squared 0.975 over 68 rows. It publishes no weights, so there is nothing to
subtract and it is simply refused as an anchor for any figure it contains.
It stays available for LiveBench, Arena and ARC targets.

### Measured facts worth not re-deriving

- Board overalls agree far more than their benchmarks do. AA index and
  LiveBench Overall r = 0.930 across 38 models. LiveBench Overall and
  ARC-AGI-2 r = 0.868 across 20.
- Predicting one figure from the other nine, held out by model: median
  r squared 0.26 with all nine, but 0.43 with the single best predictor.
  Nineteen predictors on 21 models destroys real signal. Keep models small.
- PC1 carries 32.8 percent. Multi-axis field, not one capability.
- Non-hallucination is the most independent figure measured: best anchor
  reaches r squared 0.058. It is deliberately left unfilled, never estimated.
- omniAccuracy and arcAgi2 correlate at r = 0.87, the tightest pair among the
  ten, and each is the sole leg of its own dial. WATCH THIS.
- ARC shows no diminishing returns across its published range. Its families
  keep buying capability to the top rung.

### Open, in priority order

1. Two red-team agents were dispatched at end of session and had not reported:
   one auditing every number on the live page against the data, one driving the
   live page adversarially. Read their findings first.
2. POOLED_CURVE is still partly a hand table when fewer than six ladders are
   usable. TARGET_F is derived but the fallback is not.
3. The knee interval is 0.20 to 0.40 on six families. 0.40 ships at the top
   of its own interval. That is thin. The page says so. It remains the
   weakest constant here.

## START HERE ON A FRESH SESSION

The owner pastes this file in at the start of every session. Do these in order, before any building.

1. **TRIM THIS FILE FIRST, whether or not it is over.** Run `wc -w WORKING-STATE.md`. The cap is 20,000 words, a ceiling to work under, not headroom to fill. The file is always rationed and always cut, and the cutting must reach material a previous pass protected, not just whatever is easiest to remove this time. Trim every session, over or not. Cut in this order, each test needing no judgment: narration (delete the sentence, see if a number or decision goes with it); closed work (leave one line: the number, the script that owns it); second homes (grep a distinctive number; two hits means one is redundant); superseded prose (calls a thing unbuilt that is now built, cut first); rejected approaches (one line: what, the number that killed it, law failure or data failure).
2. **NEVER CUT:** a number with a source, a refusal and the check that closes it, the traps, the directives, the pick-up block.
3. **CHECK PROPORTION.** 71 of 72 pages are Kaspa. If tooling prose outgrows what-the-site-claims prose, the doc is wrong even if every sentence in it is true.
4. **DO NOT ASK WHAT TO DO NEXT.** Take the top item in the pick-up block that needs nobody outside, finish it, record it, ship it.
5. **DECIDE AND REPORT**, don't ask. If a call is reversible, make it, say you made it, say what would reverse it.
6. **ONLY THREE THINGS NEED THE OWNER:** deleting files he created, a change to what a page CLAIMS, anything touching credentials or the domain.
7. **COMMIT** only when one thing is finished and verified: the code, its gate, and the paragraph here explaining it, together. Pre-commit hook runs the full publish gate, so a red gate blocks committing.
8. **DEPLOY** by pushing to `main`, then confirm all three workflows are green and fetch the live page with a cache-busting query string for the exact changed string. A push is not a deploy.
9. **WRITE HERE** the moment a number, refusal, or decision exists that isn't in the code. Not narration of what you did.
10. **ON CONTEXT:** compaction cannot be triggered from inside a turn. This file is what makes it survivable, so keep it current. If context feels tight, do not wind down early: commit, update this file, keep working.

## SESSION CLOSE

No script emits this yet; state it directly before ending the session. **OPEN ITEM: nothing in this repo forces this checklist to run; it depends on the session author remembering to state it.**

1. **WHAT'S LIVE**, and how you know: last pushed commit hash, confirmed against `git log --oneline -1` and origin, workflows green.
2. **TREE CLEAN OR NOT.** Name every uncommitted file and why it's uncommitted.
3. **WORD COUNT**, `wc -w WORKING-STATE.md`, against the 20,000 cap, and what came out this session.
4. **EVERY GATE RUN AND ITS RESULT:** `check-site.sh`, `check-claims.py`, `check-status-freshness.py`, `check-model-picker.py`, `check-prose.py`, `check-american-english.py`, `check-grid-spans.py`. A gate not run is not green.
5. **WHAT WAS MEASURED**, not assumed, with the number.
6. **WHAT'S STILL OPEN**, and the single top item for next session.
7. **ANYTHING BLOCKED ON THE OWNER**, one sentence each: what it settles, what it needs from him. Nothing if nothing is blocked.
8. **ANY CLAIM MADE THIS SESSION NOT YET VERIFIED**, said plainly as unverified.

**SCOPE: ECOSYSTEM TRACKING IS L1 ONLY.** Owner's instruction, 8 August. What
counts as a Kaspa ecosystem development is what runs on Kaspa L1 and is
re-derivable from chain bytes: covenants, KCC20 tokens, the covenant token
markets and their graduated pools, escrows. L2 and sidechain activity is not
Kaspa progress and must never stand in for it. Kaskad and Igra stay labeled
ecosystem context, never adoption evidence. `kaspa-developments.html` says this
in its own checked-line so a future reader cannot miss it.

**PICK-UP BLOCK, 2026-08-22. MODEL PICKER REWRITE IN PROGRESS, UNCOMMITTED.**

1. Verify before trusting anything here. `git status --short`, `git log --oneline -1` against origin. Both HEAD and origin/main sit at `7df640f` as of this write-up. Everything below in "The model picker, briefly" describes uncommitted working-tree state on top of that commit. It sits in the working tree only, awaiting a commit and a deploy. Read the date from the environment before writing any stamp.

2. **WHAT CHANGED, IN ONE LINE.** Scored figures cut from 25 to 20, 2 per dial across 10 dials, no figure on 2 dials; ARC Prize wired in as a fourth data source, ARC-AGI-2 scored and ARC-AGI-1 kept only as ladder evidence; `MIN_METRICS` made proportional to the figure count instead of a fixed 9; both per-figure movement and blank-rung pricing now run on a model's own clocks with predictor sets chosen by leave-one-model-out r-squared instead of in-sample fit.

3. Full numbers and derivations, including `TARGET_F` (now 0.43, re-derived with ARC included) and `MIN_CORE_FOR_OWN_CAP` (back to an absolute floor of 4 after a wrong attempt to scale it), are under "The model picker, briefly" below. Read that section before touching any constant in `scripts/emit-picker-blob.py`.

4. `check-model-picker.py` passes on the working tree: 10 dials, all weights resolve. The full publish gate (`check-site.sh`) has not been run this pass; run it before committing.

5. **TOP ITEM FOR NEXT SESSION.** Wire ARC Prize into the ladder machinery (`BOARD_LADDER`, `own_curve()`, the cost reconstruction fits): it is currently only used for its own scored/ladder-evidence figures, not for any of the effort-curve fitting, which still sees only the 6 Artificial Analysis families with 3+ priced rungs against ARC's 20. Then re-derive `TARGET_F` and `POOLED_CURVE` in code, with an assertion, instead of the hand-computed literal and hardcoded lookup table sitting there now. Rebuild the page copy last, once those numbers stop moving.

6. Other files sitting modified this session and out of scope for the model-picker work: `data/arena-text-all-categories-2026-08-20.md`, `kaspa-x-posts-august-2026.md`. Leave them alone unless the task at hand covers them.


## What this is for

Explain Kaspa to a reader who will be lied to about it everywhere else, and be
checkable enough that the explanation survives someone hunting it.

Three goals, in the order they pay:

1. **Say what is true right now**, sourced to code, releases, KIPs or a core
   contributor, never to a summary of them.
2. **Say where the claim stops.** Live, near-term, roadmap and research are four
   different states and the page must name which one it means.
3. **Make the check cheap.** A reader who wants to falsify a sentence should
   reach the primary source in one click, and a gate should catch it first.

Static HTML on GitHub Pages. No build system, and adding one needs a reason.

## How this file works

One document. Everything closed lives in the commit that closed it. If a line
here describes something already done, delete it.

`AGENTS.md` is the standing rules and loads automatically. This file is the
state. When they disagree about a fact, this one is authoritative.

---

## Where this stands

**72 public pages, 22 dated claims, 4 data files.** `CLAIMS.yml` is executable:
`check-status-freshness.py` fails the build when a `recheck_after` passes and
when a `forbidden_copy` phrase appears in any page's visible text.

**48 of the 72 pages are redirect stubs.** Pages get merged and the stub keeps
the URL alive. That is fine for readers and a trap for anything citing a page by
slug: the citation returns 200 and lands somewhere else. Check a slug against
the stub list, never against its status code.

## Dates, and the way this repo gets them wrong

The date is not inferable from what is being worked on. A session stamped every
baseline "August 3" because the task was the August 3 post; it was the 7th, and
the error reached two pushed commits. Nothing in the gate checks a stamp against
the clock.

Every stamp here is a claim about when a source was read: `CLAIMS.yml`
`last_checked`, both `kips.html` baselines, `dateModified` on every touched page,
and the "as of" line inside any dated post.

## The model picker, briefly

One page of 72, and it carries more machinery than the rest combined, so it
gets one section rather than a third of this document.

**State below describes the working tree. The last commit is behind it.** HEAD and
origin/main both sit at `7df640f`. Everything in this section describes
uncommitted changes on top of it. The emitter is finished and the blob is
frozen for this pass. Run `git status --short` before assuming the live
page matches this description.

**SHAPE.** 10 dials, 2 figures each, weight 1/1, no figure repeated across
dials. 20 scored figures, cut from 25. Selection test: how far apart the
top five models sit on a figure, on the honest scale (worst-ever to
best-ever across every model ever measured on that board, not a percentile
of this roster). A figure whose top five land within a point or two cannot
separate the field and is cut from scoring; it can still appear as
closeness evidence. Surviving spreads, top five: CritPt 30.2 points,
ARC-AGI-2 21.2, HLE 18.8, Omniscience accuracy 12.6, tokens per second
11.8, tau3-Banking 11.3. Cut: output price 0.4, time to first token 0.3,
total response 0.9, cache hit price 1.4. `METRICS` in
`scripts/emit-picker-blob.py`, `DIALS` in `model-picker.html`.

Cost of the cut, stated because it is real: dropping figures the field
agrees on makes the field look further apart than it actually is. Owner's
call, made deliberately.

Sources are FOUR boards, derived not hardcoded: `source_counts()` reads the
split off `METRICS` via `source_of()` and asserts it sums to the total.
Current split: Artificial Analysis 9, LiveBench 7, LM Arena 3, ARC Prize 1,
sum 20. `source_of()` had no branch for the `arc` prefix until this pass,
so ARC figures were being filed under Artificial Analysis (AA read as 10,
a fourth board invisible). Fixed: another instance of the bug class below.

**ARC PRIZE IS A FOURTH SOURCE.** `data/arc-agi-2026-08-21.md`, pasted by
the owner from arcprize.org, read 21 August. The only board here that
publishes both a capability score and a cost per task at every effort rung
a lab exposes, so one row is a point on a capability ladder and a price
ladder at once.

ARC-AGI-2 is one of the 20 scored figures, on the `reason` dial paired with
HLE. ARC-AGI-1 is loaded and used but deliberately NOT scored: top five sit
within 2.0 points, the same saturation that took GPQA Diamond out, and it
correlates with ARC-AGI-2 at r = 0.920. It stays on the page as ladder
evidence, kept because it is published at every rung with a price beside
it, attached at each model's chosen rung by `load_arc()`.

**TARGET_F = 0.43. The derivation changed on 21 August; the reasoning
matters more than the number.** Every model is read at the same fraction
along its own log-price effort ladder, not at the same labeled setting:
labels are not comparable across labs (the word "high" sits at 0.00 of
GPT-5.6 Terra's own ladder and 1.00 of Gemini 3.7 Flash's).

The old test looked for where marginal capability per doubling of price
goes flat, on the 6 Artificial Analysis families that publish 3 or more
priced rungs. That test only works if a flat tail exists. On ARC Prize the
returns keep falling all the way to the top rung and never flatten, so
"the first point within a tenth of the tail" just returns the last data
point on the curve, which is how an audit got 0.75 out of it.

The test now is the knee itself: the point of maximum distance below the
straight chord joining the cheapest rung to the dearest, on each family's
own curve normalized 0-to-1 on both axes. That is defined whether or not a
flat tail exists. Pooled over 26 families across both boards it gives 0.43.
Artificial Analysis alone: 0.43. ARC Prize alone: 0.53. Per-family range
0.01 to 0.99, median 0.48, which is the argument for one pooled position
rather than 26 fitted ones. It sits between medium (0.30) and high (0.57),
nearer medium than the old value was. Full derivation in
`emit-picker-blob.py`, in the comment block directly above `TARGET_F`.

This closes last session's open question about `TARGET_F` predating the
ARC data: it has now been re-pooled with ARC included, and 0.43 is the
re-derived answer, not the old one.

**MIN_METRICS is now proportional**, `max(4, round(len(METRICS) * 0.225))`,
currently 4. It was a fixed 9, which was 22.5 percent of a 40-figure grid
and silently became a 45 percent floor the moment the scored set fell to
20, dropping Qwen3.8 2.4T A95B for coverage that had not changed. Same
failure as the hardcoded source counts; see "Bug class" below.

**PER-FIGURE MOVEMENT RUNS ON A MODEL'S OWN CLOCKS.** Everything that
answers to effort answers to how long the model thinks, and the clocks
(`ttft`, `aaTotalResponse`, `tokensPerSec`) publish at more rungs than the
benchmarks do. `CLOCK_SETS` nests 4 predictor sets, from 3 clocks up to 9
columns (adding intelligence index, first-answer time, the P25/P75 latency
spread, LiveBench overall, LiveBench cost per success task). Each figure
takes the smallest set that survives leave-one-model-out r-squared, never
the in-sample number: fitted on everything, tau3-Banking reads r2 0.944 and
falls to 0.242 held out one model at a time. A figure clearing nothing
keeps its old board-wide movement rule.

**BLANK RUNGS ARE PRICED FROM A MODEL'S OWN CLOCKS TOO**, multivariate,
tiered to whatever that model's rungs actually publish (`SCALED_RAW`: cost
per task, LiveBench cost per success task, time to first token, total
response, tokens per second). Drops to a smaller feature set rather than
falling straight to a single-slope estimate the moment one column is
missing.

**SIMULATION ERROR BARS WERE ON THE WRONG SCALE, now fixed.** The panel
draws each figure from a normal spread around its value and counts wins
across `MC_RUNS = 4000` runs. The spread was being handed to it in
percentile-scale points while the page scores on the honest scale, where
this roster spans roughly 74 to 88 rather than 0 to 100. A percentile-width
error is several times wider than the honest-scale gaps it was landing on,
which scrambled the win-probability order: a model ranked third by score
could win more simulated runs than the models ranked fourth and fifth.
Every error width (`es`, the sibling-shift spread, the estimate spread) is
now converted through the same `honest(unpctile(...))` transform the value
itself takes, in `to_honest()` in the emitter.

**ROSTER: 21 models.** `check-model-picker.py` passes on the working tree:
10 dials, all weights resolve to a loaded figure.

**`ci_note` is fixed, not outstanding.** It now derives its figure count
from `len(METRICS)` and names all four boards, rather than a hardcoded
sentence. Kept in the bug-class list below as a past instance, not a live
one.

**TRAPS CARRIED FORWARD, still true, do not re-litigate without
re-measuring:**
- LM Arena's Style Control marker reads backwards. A board captured WITH
  the correction on prints "Default Leaderboard Plots"; WITHOUT it prints
  "Remove Style Control". Never infer the setting from page furniture, ask.
- `data/arena-style-controlled-scores-2026-08-20.md` is RETRACTED: its
  Coding table has the plain and style-controlled columns swapped, caught
  against a verified capture. Do not read numbers out of it.
- REFUTED: style dependence predicts nothing else measured. 11 tests
  against cost per task, price per unit of effort ladder, capability per
  unit of ladder, tokens per second, time to first token, context, coverage,
  open weights, board f, capability given up, and overall capability. 0
  survive.
- REFUTED: reconstructing cost per task from implied output tokens at the
  posted output price. r = 0.385, median error 69 percent. The speed
  columns are measured on a short standard prompt; cost per task is
  measured across the full evaluation suite. Different workloads. Do not
  retry.

**OPEN, largest structural debt on this page: the effort model's two
central constants are asserted in the source, not derived at runtime.**

`TARGET_F = 0.43` is a hand-computed literal. The derivation is written out
in the comment above it and the analysis was run in a scratch script, but
no function in `emit-picker-blob.py` reproduces it. If the underlying
boards change, nothing recomputes it and nothing fails. This is exactly how
the old 0.47 came to be defended by a test that only worked on the 6
families it was derived from and broke the moment 20 more arrived.

`POOLED_CURVE` is worse: an 11-point lookup table, hardcoded, of capability
fraction against ladder position, and `pooled_cap_frac()` interpolates that
table at runtime. Every model without its own capability curve is moved
along it. It is not fitted from `data/aa-all-status-2026-08-20.md` or
`data/arc-agi-2026-08-21.md` when the script runs.

Both are the same bug class below, in its most consequential form: a
number written against one snapshot of the data and left behind when the
data moved.

**What did NOT get done, so it is not mistaken for finished.** ARC Prize is
read for its scored figures and its ladder rows are loaded by `load_arc()`,
but ARC is NOT yet wired into `BOARD_LADDER`, `own_curve()`, or the cost
reconstruction fits. Those still see only the Artificial Analysis board's
6 families with 3 or more priced rungs; ARC has 20. Wiring it in is the
single highest-value change available to the effort model. Deliberately
deferred, not attempted: every emitter change invalidates the numbers
quoted in the page copy, and the copy was already being rewritten against
a frozen blob.

Suggested next-session order: wire ARC into the ladder machinery first,
then re-derive `TARGET_F` and `POOLED_CURVE` in code with an assertion,
then rebuild the page copy last, once the numbers stop moving.

## Bug class: a constant sized to one grid, left behind when the grid moved

Five instances, same shape every time: a number or rule written against
the figure, source, or data-snapshot state at the moment it was written,
left standing after that state changed.

1. Per-source figure counts hardcoded at 13, 7, 5. Summed to 25 once the
   real figure count reached 32; the page printed "thirty-two figures" and
   the stale 13/7/5 breakdown in the same sentence. Fixed: `source_counts()`
   derives the split from `METRICS` and asserts the parts sum to the whole.
2. `MIN_METRICS = 9`, a fixed count. Was 22.5 percent of a 40-figure grid,
   became a 45 percent floor the moment the scored set fell to 20, and
   silently dropped a model whose real coverage had not changed. Fixed:
   `max(4, round(len(METRICS) * 0.225))`.
3. `FIG`, a hand-maintained figure-name map duplicating `PROV`. Went stale
   the moment 5 figures were added to `PROV` with no matching `FIG` entry;
   raw metric keys ("aaTau2Telecom", "aaTbHard", "aaItbench") printed in the
   dial summary instead of names. Fixed: `FIG` falls back to `PROV` for any
   key it does not carry.
4. `ci_note`, a hardcoded sentence describing the blob. Said "Twenty-five
   figures" against a true 20 and described a placement rule (cost-optimal
   effort setting) that `TARGET_F` had already replaced. Fixed: derives the
   figure count and names the rule and boards live.
5. `source_of()` had no branch for the `arc` prefix, so every ARC Prize
   figure was counted as Artificial Analysis. AA read as 10 figures instead
   of 9, and the page never disclosed a fourth board was in the mix at all.
   Fixed: `source_of()` now returns "ARC Prize" for that prefix.

**A sixth instance, the sharpest yet, and it cuts the other way: deriving
a number is not always the fix.** An audit recommended scaling
`MIN_CORE_FOR_OWN_CAP` with the grid the same way `MIN_METRICS` now scales.
That recommendation was WRONG and was applied before being caught.
`MIN_METRICS` asks what share of the question a model has been measured
on, a proportion, so it has to move with the grid. `MIN_CORE_FOR_OWN_CAP`
asks whether there is enough evidence to call something a curve, and 4
points is 4 points at any grid size. Scaling it down to 2 put Claude
Sonnet 5 from last place to first on a capability curve fitted to 2
benchmarks. Reverted: `MIN_CORE_FOR_OWN_CAP = 4`, an absolute floor again.

Lesson, stated once: derive a count or description from the thing it
describes, and assert the derived value against what a human would say by
hand. A hardcoded number is a snapshot standing in a formula's place, and
nothing tells the two apart until the underlying count moves. But not
every constant is a proportion in hiding: a minimum-evidence floor answers
"is this enough to trust," not "what share of the total is this," and
forcing the second shape onto the first question breaks it just as
silently as leaving a stale number in place.


## Serving and rendering

**Local serving.** `python3 scripts/serve-local.py --port 4187`. A stale process
can hold the port from an earlier session and fail with `PermissionError` on
`os.getcwd()`; the symptom is HTTP 000 with the port still bound. Serve on
another port rather than debugging it.

**The shell resets its working directory to `~/Documents` between calls.** Use
`git -C` and absolute paths, or a `cd` inside the same command.

**`ugrep` is the default grep and refuses complex patterns.** Nested bounded
repetition over a character class fails with "exceeds complexity limits", and
backgrounded the error lands in a file nobody reads. Parse HTML in Python.

**A rendered check is not optional for anything JS builds.** The ranking, the
verdict line and the dial shares are all script-written, so reading the source
proves nothing about them.

## The claim registry rots on a cliff

22 dated claims. They were all sitting on one date again and were staggered on 8
August across 15 August to 12 September, soonest for whatever moves fastest.
Keep them spread when moving a batch; 19 due on one morning is what turned a
recheck into a blocked repo.

Bump a date only after reading the source. Bumping is the cheap way to make the
gate green and it silently converts a checked claim into an unchecked one.

## Sources, ranked by what settles an argument

| Source | Answers | Note |
|---|---|---|
| `kaspanet/rusty-kaspa` code and releases | what consensus does | `TenBps = Bps<10>` and `normalized_max` doing `c.max(t)` are the two the copy leans on |
| `kaspanet/kips` README | KIP status | the index table is the status, not the KIP body |
| `kaspanet/kccs` pull requests | whether a convention is ratified | one merged PR, the README. Nothing is a standard |
| `kaspanet/vprogs` | vProgs maturity | zero releases and zero tags is the fact |
| `kaspanet/silverscript` | the audit gate Argent waits on | zero releases, still renaming core syntax |
| `argent-lang/argent` README | Argent status | read both halves of Project status or misdescribe it |
| api.kaspa.org | live DAA score | confirms activation is past, not just announced |
| docs.kaspa.org | orientation | lags activation; trust the release tag over its prose |
| kaspa.org/lore | roadmap framing | writes "100 blocks per second", never "100 BPS", so grep both |
| kas-smiths.org, t.me/kasparnd | design discussion ahead of any KIP | research stage by default |

## The directives

**Working**

1. Do not ask, decide. Report the call afterward so it can be reversed.
2. Ask before destroying files the owner created.
3. Bound every command with an explicit timeout. Check cheap state first.
4. Do not declare blocked. A long session is not a blocker; context is
   summarized and the work continues.
5. Read the date from the environment before writing any stamp.
6. Every commit updates this file.

**Building**

7. One home per fact. A slug, a count, or a date in two places drifts.
8. Delete a placeholder rather than shipping it as a number.
9. A default ships with its band printed and a control that overrides it.
10. Composites do not feed a score that already scores their parts.
11. Every listed row carries every listed figure. No gaps, not few gaps.
12. A figure that cannot separate the field is cut, not down-weighted. Weight 1
    on a saturated figure is full-amplitude noise, not a small contribution.
13. Set a threshold before looking at what it drops.

**Testing**

14. Score against outside truth, never against the tool.
15. Prove a check can fail before reporting that it passed.
16. Drive it on the live page. Reading the code proves nothing for anything JS
    renders.
17. Assert coverage. A parser that can silently see less than everything must
    state how much it saw.
18. Local, committed, pushed, deployed, and visually verified are five states.

**Searching**

19. Open the page, never a summary of it.
20. Check a slug against the redirect stubs, not against its status code.
21. Re-derive anything marked permanent if it has not been re-derived since.

**Writing**

22. American English. No em or en dashes. The pre-commit gate catches British
    spellings in code comments too; one blocked a commit.
23. Plain and not dramatic. State the thing, give the number, move on.
24. State a status once with its label. Repeating the caveat reads as scared.

## Mistakes that keep happening

A separate list from the traps below. The traps are ways a MEASUREMENT can be
wrong; this is the other list, ways the WORK itself keeps being wrong. Each
entry ends in one of three fates: converted into a gate, converted into a
mid-turn tell, or admitted as a wish with no fix yet.

1. **A stamp inferred from the task instead of the clock.** A session stamped
   every baseline "August 3" because the task was the August 3 post; it was
   the 7th, and the error reached two pushed commits. Nothing in the gate
   checks a stamp against the clock, so this recurs. Directive 5 says read the
   date from the environment first. No gate enforces it yet: still open item,
   "gate the stamp against the clock."
2. **A claim registry that expires all at once.** 22 dated claims were
   staggered on 8 August, and 19 of 22 still landed due on one morning,
   turning a routine recheck into a blocked repo. Bumping a date is the cheap
   way to make the gate green, and nothing stops a batch bump from clustering
   dates. Fix stated but not enforced: keep dates spread when moving a batch.
   No automated spread-check exists yet.
3. **A background job whose output was never read.** Two `ugrep` runs died on
   the complexity-limit error (see traps below) and the run was cited as
   evidence until the file was opened and found empty. Nothing distinguishes a
   silently failed background job from a successful one. No fix built: read
   backgrounded output directly before citing it as a result.
4. **The publish gate scanned agent scratch.** The forbidden-copy grep walked
   the whole tree, so a stale worktree under `.claude/worktrees/` held an old
   copy of every page, and a phrase correctly retired from the live site
   failed the gate from a directory that never ships. Fixed: scratch is now
   excluded from the grep. When the gate fails, read the path before the
   phrase.

## The traps

Times the checker was wrong rather than the site.

1. **A page cited by slug that redirects.** 48 of 72 pages are stubs; a
   citation to a merged page still returns HTTP 200 and lands elsewhere,
   found across 21 source lines in one file after being fixed twice as single
   instances. The 200 status read as a valid link. Check a slug against the
   redirect-stub list, never against its status code.
2. **`build()` throwing on its own last line looks like an empty page.**
   `$('mpMap')` had no markup and never had; everything above the throw had
   wired up, so dials worked once touched and the page merely looked empty.
   It shipped an uncaught TypeError, and the `applyPreset(1)` under the throw
   had never once run. A thrown error deep in setup can look identical to an
   incomplete page; verify the whole function ran, not just that something
   rendered.
3. **A synchronous read of a debounced render returns the previous state.**
   The render is on a 120 ms timer; probing right after a click reported
   every preset as identical and read exactly like a filter bug. Never sample
   state synchronously after triggering a debounced render; wait for it.
4. **A coverage threshold that leaves one hole reads as complete.** 84 and
   99.8 percent both print as green summaries. Assert zero gaps and exit
   non-zero instead of accepting any threshold short of complete.
5. **A carried-over value is a percentile of a field that no longer exists.**
   A stale derived number keeps reading as current once its source set has
   changed underneath it.
6. **Separation measured in the wrong units.** Raw benchmark points ranked
   HLE and CritPt at the head of a factor; on the scored scale they are weak.
   Measure separation on the scale actually used to rank, not the metric's
   native units.
7. **A separation measure that sorts by the metric's own leaders** asks
   whether the five cheapest are close on cost. Always yes. It labeled cost
   unable to separate while it spanned 4.1x across the models being ranked.
   Measure separation across the full ranked population, not a subset picked
   by the metric under test.
8. **A threshold set after seeing what it drops** is a constant fitted to a
   predetermined answer. Still live in the picker's eligibility gate. A
   reverse-fit threshold looks like a principled cutoff; it is not a check.
9. **A roster inherited rather than derived.** The picker's models are the
   ones somebody transcribed, minus three, presented as the output of a rule;
   18 models in the Arena file were never tested against it. A supposedly
   rule-derived set must be checked against the full candidate pool, not just
   the set that already exists.
10. **A stale server on the documented port.** HTTP 000, nothing in the log
    until it was read directly. An old process can hold a port silently;
    serve on another port rather than debugging the stale one.
11. **`ugrep` failing a complex pattern looks like a negative result**,
    especially backgrounded, where the error lands in a file nobody reads.
    A search tool erroring out is indistinguishable from a true negative
    unless the error itself is checked; parse structured formats in a real
    parser instead.
12. **`var` hoisting made a derived constant read an undefined map, and it
    took the whole picker down in production for a day.** `SOURCE_COUNT` ran
    in an IIFE at line 380 and read `SRC`, not assigned until line 523: the
    declaration hoists, the assignment does not, so `SRC[k]` threw a TypeError
    before a single dial drew. The page still served HTTP 200 with the full
    data blob intact, so nothing external noticed. A second copy of the same
    map 140 lines apart was also missing six of twenty-five live figures,
    undercounting the source badge too: one home per fact would have
    prevented both. `check-model-picker.py` passed throughout, because it
    validates that dial weights resolve, not that the page executes. HTTP 200
    and a passing weight-resolution check prove nothing about whether the
    page actually renders. Load it rendered after any edit.
13. **A mechanism built for one regime silently misfires in another.** Making
    the effort-tier estimator always-on (removing its visible toggle) was
    read as "call the same gap-filling logic automatically," but the
    render path was calling `synthesizeAllTiers`, which doesn't fill gaps
    in place, it manufactures whole new synthetic rows for every untested
    tier of every model family. 20 roster rows became 68 rendered ones, a
    duplicate "Claude Opus 5, xhigh effort, ESTIMATED" row sitting next to
    the real "Claude Opus 5 (Max)" entry, caught only by reading the "Show
    all N" count against the known roster size. A function's behavior at
    its old call site does not transfer to a new one just because the old
    site's precondition (an opt-in toggle) is gone; check what the function
    actually does, not what its name suggests.
14. **A coverage floor built for an auto-derived pool silently excludes a
    hand-curated one.** The picker's `MIN_COV = 0.70` threshold existed to
    drop weak entries from a large, algorithmically-assembled model list.
    After the roster became a small, individually-justified 20-model list,
    where three entries were kept on purpose to make a real data gap
    visible, the same floor silently dropped those three from the rendered
    list, "17 of 20 scored," the opposite of the intent. A filter's
    original purpose does not survive a change to what it filters;
    re-justify every threshold against the current input, don't assume it
    still means what it meant.
15. **Two agents editing different pages at the same time is not automatically
    safe.** Two content-refresh agents ran in parallel on `sources.html` and
    `toccata-explained.html`, no overlapping scope by design. Partway through,
    the second agent read `sources.html` (not its own file), saw changes it
    hadn't authored, decided they were unexplained, and reverted the whole
    file to its committed state rather than leave them, silently destroying
    the first agent's already-finished, gate-verified fix. Caught only
    because the fix had already been reported complete and a follow-up diff
    check showed the file clean again. A defensive instinct ("don't ship
    changes I can't explain") is right in isolation and wrong under
    concurrency: it cannot distinguish a stray edit from a sibling agent's
    legitimate work. Re-verify a specific file's state immediately after any
    run where a second concurrent agent touched the same repo, even on a
    supposedly disjoint file, and prefer investigating an unexplained change
    over reverting it.
16. **A display cap written for a two-source design silently survives a
    rewrite to three sources, and the number under it was never the real
    weight.** The picker's inline "leans on" summary always named exactly
    two benchmarks; after the dial rewiring made three clean 3-source
    triads the point of the exercise, that cap silently dropped the third
    benchmark, always the Arena one, from every triad's visible text. Worse,
    its percentage was borrowed from `dialMix()`, a separate
    evidence-weighted "how much does this separate the field" computation
    built for the "separates the leaders" label, not the configured weight
    at all: a real 33/33/33 triad could print 61/26/13, disagreeing with the
    "Which benchmarks, and why" panel directly beneath it describing the
    identical dial with the correct number. `check-model-picker.py` passed
    throughout both bugs, because it checks that weights resolve, not what
    the summary line says about them, or whether two surfaces describing one
    dial agree with each other. Found only by the owner reading the
    rendered page against the stated design, twice, first noticing a
    benchmark was missing, then noticing the percentages made no sense once
    it was back. Two lessons, not one: a formatting routine's assumption
    about "how many things there usually are" needs re-checking whenever the
    thing it summarizes changes shape (trap 14's lesson, one layer further
    from the data); and reusing a computed value for a new display purpose
    because it happens to be nearby is how a percentage that means one thing
    ends up labeled as another.

17. **A published number can be the unsigned magnitude of a signed quantity,
    and nothing in the text says so.** Arena's Agent leaderboard shows each
    model a percentage per signal. Those percentages are causal treatment
    effects against an average-orchestrator baseline, and they can be
    negative, but the minus sign is never printed. Direction is carried
    only by an SVG arrow (`aria-label="Up"`/`"Down"`) and a CSS class
    (`text-interactive-positive`/`-negative`). The zero crossing on the 50-model
    board sat at row 28: rows 1-27 positive, rows 28-50 negative. Row 50
    displayed "19.82%" and its real value was minus 19.82. Scraping the text
    and normalizing it 0-100 would have scored the worst models on the board
    as among the best, and every check we had would have passed, because the
    numbers parse, the coverage is complete, and the spread looks healthy. The
    tell that something was wrong was weaker and easier to dismiss: the column
    did not sort in rank order. Chasing that down through the published
    methodology is what surfaced the sign. Two lessons. A number rendered
    without a sign is not necessarily positive, and when a ranked column does
    not sort by its own displayed value, stop and find out what the site is
    actually ranking before wiring any of it. The same page also revealed a
    dead metric hiding behind the largest sample on the site: Tool
    Hallucination reports a byte-identical 1.14% +/-0.16% for 13 models whose
    session counts range from 8,796 to 83,274. A real estimator's interval
    narrows as the sample grows. That one does not move at all, which makes it
    a floor or a placeholder rather than a measurement.
18. **A benchmark's famous name is not evidence it still separates anything.**
    Measured on 20 August against the top five models only, the spread that
    actually decides a ranking: GPQA Diamond 1 point, AA Intelligence Index 2,
    LiveBench Reasoning 2, AA-LCR 2, Terminal-Bench v2.1 4, LiveBench Overall
    5. Arena's Vision (146 models) and Document (39 models) boards tie exactly
    at the top. Four of Arena Text's seven sub-categories sit inside their own
    confidence intervals. Every one of those is a headline number somewhere.
    Six of them were wired into this site's own picker and were contributing
    noise. Judge a metric by the gap among the leaders, never by its overall
    range and never by its reputation, and re-measure every refresh, because
    saturation arrives quietly as models improve.

## Run after any change

```bash
bash scripts/check-site.sh              # the gate. "Site checks passed." or it did not
python3 scripts/check-claims.py         # registry shape and date sanity
python3 scripts/check-status-freshness.py   # expired dates, forbidden copy
python3 scripts/check-model-picker.py   # every dial weight resolves to a loaded figure
python3 scripts/check-prose.py          # ban list, sentence variance, reading grade
python3 scripts/check-american-english.py
python3 scripts/check-grid-spans.py     # geometry a grep cannot see
python3 scripts/build-sitemap.py        # required after any dateModified change
python3 scripts/build-agent-index.py    # same
bash scripts/check-links.sh             # when a source URL changes
```

After changing picker data:

```bash
python3 scripts/build-picker-data.py
python3 scripts/emit-picker-blob.py
```

The first reads the dated source transcriptions and writes `data/picker-data.json`. The
second turns that into the `window.__MP__` blob and rewrites the one line in
`model-picker.html` that carries it. Then serve and drive the page.

**Do not run `scripts/refresh-model-data.py`.** This file used to name it here, which
handed readers a command that would silently drop twenty metrics and every confidence
interval. It now refuses to run and explains why.

## What ships and how

`main` on GitHub Pages, custom domain `kaspaexplained.com` via `CNAME`.

```bash
bash scripts/check-site.sh
git push origin main
```

Then confirm Site checks, Copy lint and pages build are all green, and fetch the
live page with a cache-busting query string for the exact changed string.

## What survives a compaction

A resumed or compacted context is a fresh session, not a continuation. It
carries a summary of finished work and that summary reads like memory; it
isn't. Re-read this file as a briefing written for a stranger picking up the
work today, including the trim step at the top, even when the transcript above
seems to already know all of it.

This file is the only thing that survives a compaction. A decision, a number,
or a refusal that exists only in a turn that gets compacted away is gone. If
it should still be true after this session ends, it has to be written here
before that happens, not narrated as something that was done.

**Open gap, real rather than hypothetical:** nothing here forces the trim
step, asserts the 20,000-word cap, or makes a reader run `wc -w` before
building. It depends entirely on whoever opens this file choosing to follow
the instructions at the top. A rule that depends on someone choosing to act on
it fails silently, exactly the failure mode this kind of document is supposed
to guard against, and this repo currently has no mechanism against it. That is
item 6 in "Where this is going," not just a note here.

## Where this is going

The only ordering in this document; anything elsewhere implying a different order is stale.

1. **Gate that the picker actually executes.** Still nothing does. It shipped a
   TypeError to production for a day and every checker stayed green. A headless
   load asserting the ranking list has children would catch it.
2. **Gate the stamp against the clock.** Nothing catches a date written four
   days behind; that error already reached two pushed commits.
3. **Gate slugs against the redirect stubs**, so a citation to a merged page
   fails at commit rather than at read.
4. **Score the picker against outside truth.** Every figure is transcribed by
   hand and nothing re-reads the boards. A checker that re-fetches and diffs
   catches both transcription error and board drift.
5. **Move this session's raw source pulls (AA/LiveBench/Arena, 14 August) out
   of the scratchpad** into `data/`, before the session-scoped path is gone;
   needed to reproduce or extend today's 20-model figures later.
6. **Add a mechanism that forces the trim and word-count check.** See "What
   survives a compaction" above: nothing today makes this happen except a
   reader choosing to.
7. **Dated "checked as of" lines outside `CLAIMS.yml` rot silently.** Found
   this session on `sources.html` and `toccata-explained.html`, both now
   fixed for this pass, but the mechanism is unaddressed: every substantive
   page carries its own freshness stamp that isn't a registry entry, so
   `check-status-freshness.py` never sees it decay. No fix built; the
   honest state is these two were found and fixed by hand, the rest of the
   site is unaudited for the same pattern.

Closed this session: roster rebuild from benchmarks rather than what was
already transcribed -- `aa30e2c` (23 to 41 models, substitution scoring),
then the 20-model/blended-dial rebuild, `110aaee`, pushed and deployed, see
"The model picker, briefly." `sources.html`'s kaspa.org-lag claim and
`toccata-explained.html`'s repo-freshness stamps, both re-verified against
live sources and re-dated 14 August (see the pick-up block; not yet
committed as of this write-up). The 41-model roster's
eligibility-threshold-set-after-the-fact problem is moot: the new roster is
hand-curated, not filtered by a coverage floor (removing that floor was
itself a bug fix this session, see "The traps"). The estimator's
sparse-real-row blind spot
(Claude Opus 5 medium topic) is also moot under the new methodology, since
gap-filling is now scoped to individual dial cells rather than whole
synthetic rows. Long-prose argument-drift re-read (item 4 in earlier
copies of this list) is closed, clean, see the pick-up block.

