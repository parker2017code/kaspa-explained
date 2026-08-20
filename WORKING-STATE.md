# kaspa explained working state

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

**PICK-UP BLOCK, 2026-08-20 LATE. MODEL PICKER NORMALIZED ON EFFORT CURVES. GATE GREEN, DEPLOYED.**

1. Check `git log --oneline -1` against origin before trusting anything here. Read the date from the environment before writing any stamp. Head is `cabbd7d`. Twelve commits shipped this session, oldest first: `ff8e67b` one row per model, `a69171d` one effort setting, `e860cbe` what a point is worth, `75f926f` the too-close benchmarks, `488cd11` per-figure rungs, `6dfebdb` Fable normalized, `ff44ef7` tier corrections, `0e9ff58` curve position not label, `5b2bf13` prose cut, `7b28b28` clock partial, `cabbd7d` clock universal.

2. **WHAT THE PAGE NOW DOES, IN ONE LINE.** 21 models, one row each, every model quoted at the same POSITION on its own effort curve rather than at the same labeled setting, with every figure, price and clock moved there separately and each carrying its own error.

3. **THE CENTRAL IDEA, AND WHY THE OBVIOUS VERSION IS WRONG.** Labels are not comparable across labs. Measured as a fraction `f` along a model's own log-price ladder, 0 at its cheapest published setting and 1 at its dearest, the word "high" lands at 0.00 for GPT-5.6 Terra, which is its cheapest, and 1.00 for Gemini 3.7 Flash, which is its dearest. Sol's high sits at 0.52, Claude Opus 5's at 0.62. Quoting everything at "high" puts one model at the bottom of its curve and another at the top. `TARGET_F = 0.35` is a position, derived, and every model is interpolated to it.

4. **HOW TARGET_F WAS DERIVED. Do not change it without redoing this.** Pooling the families that publish three or more settings and reading marginal capability per doubling of price along the normalized curve gives 30.2, 19.4 and 18.2 points per doubling over the first third, then 11.9, 11.9, then a flat 10.3, 9.8, 9.8, 9.8, 9.8 across the whole top half. Marginal return falls by a third at the 0.3-to-0.4 break and never recovers. That is the knee. It sits past most labs' medium (pooled f 0.30) and short of most labs' high (pooled f 0.57), which is the band the owner asked for.

5. **EVERY FIGURE MOVES SEPARATELY. This was the second big error and it is fixed.** A full low-to-max climb buys 71.9 percentile points on Terminal-Bench v2.1 and 2.2 on the non-hallucination rate on the four-family fit. On the 24-family corpus fit the non-hallucination rate is **minus 7.0 raw points**, quartiles minus 18.0 to 0.0: more effort makes a model measurably more likely to make things up. The sign flipped when the family count went from 4 to 24, which is the clearest argument in this file for fitting on the whole board rather than the shipped roster. The pooled number is 23.3, so one shift for all figures understated Terminal-Bench by 48 points and overstated hallucination resistance by 21. Some figures move backwards: Claude Opus 5 loses 10 points of AA-LCR climbing to max while GPT-5.6 Sol gains 70 on the same figure. A model with its own ladder is read off its own curve figure by figure with no pooling; a model without one borrows how much that figure responds board-wide. Constants live in `per_metric_gain()` and `metric_shift()` in `scripts/emit-picker-blob.py`.

6. **THE CLOCK IS A FLOOR PLUS THINKING TIME. Best-fitting law found this session.** Latency is not one multiplier: across the ten Artificial Analysis families with a ladder, a full climb multiplies the wait by anywhere from 0.96 to 133.8. What predicts it is how slow the model already is at the top, and log ratio against log max-effort latency fits at **r = 0.970**. Every model starts from about the same floor: the cheapest setting of each family reads 0.92, 1.67, 1.78, 1.96, 2.78, 3.07, 3.51, 4.29 seconds, median 1.91, while max-effort readings run 0.88 to 223. All the spread is thinking. The thinking budget is spent late, fitted as `f ** 3.5` with rms 0.111, so only about 2.5 percent of it happens before `TARGET_F`. Sol goes 209.1s to 4.6s, Sonnet 5 172.6 to 6.2, Fable 141.4 to 5.5, while GLM-5.2 moves 2 percent and DeepSeek V4 Pro not at all, because they were never thinking before answering. `CLOCK_SHAPE`, `POOLED_FLOOR` and `clock_at_target()` in the emitter.

7. **HYPOTHESES TESTED THIS SESSION, WITH VERDICTS. Do not re-litigate without re-measuring.**
   - Cost collapses far faster than capability when models are normalized down: **CONFIRMED**. The models submitted at max lose 59 percent of price for about 2.0 points of Terminal-Bench. Median across all 17 moved models is minus 26 percent price for minus 0.7 points.
   - The clock collapses harder still: **CONFIRMED**, and it is the largest effect on the board. Full climb multiplies price by 3.9, total response by 11.7, time to first token by 35.6 in the 4-family fit and 13.2 in the 10-family fit, against capability moving 29.7 points on a field spanning about 35.
   - Correction should scale with how much room a model has on that axis: **CONFIRMED FOR CLOCKS** at r = 0.970, which is what the floor-plus-thinking model is.
   - Same idea for benchmarks, that a model near a test's ceiling has less to gain: **REFUTED**. Correlation between room remaining and points gained is minus 0.043 across 32 figure-by-model observations. What predicts the gain is which test it is, not which model. No headroom term was added.
   - A per-lab offset on the cross-figure regression: **REFUTED** earlier. Moved mean error 12.5 to 12.3 and left calibration untouched, which on 111 predictions is noise. Reasoning recorded next to `NO_IMPUTE`.

8. **THE OTHER TWO ESTIMATORS, both validated by holding data out.** Sibling fill: a figure the shipped setting never published is carried from that model's nearest setting, shifted by how far apart the two measured on everything they share. Cross-metric regression: a figure no setting published is predicted from correlated figures the model does have, needing three separate correlations at r >= 0.70 with at least twelve models behind each. Validated by hiding each model's figures in turn: predictions land 12.5 points off on average and 94.6 percent of held-out misses fall inside the interval the prediction declares. Looser settings filled twice as many figures and overstated their confidence, so they were dropped. Price and speed are never predicted.

9. **TIER CORRECTIONS. The audit's 147 was inflated; five survive.** Silence is not disagreement: LiveBench printing "Kimi K3" with no suffix while AA prints "(max)" is one board making a claim, not two disagreeing. What counts is a board printing a different setting. Three models where Arena tested a rung below everyone else, so their Arena figures carry `high` and are not moved down: Claude Fable 5, DeepSeek V4 Pro 0813, DeepSeek V4 Flash 0731. Two where AA prints nothing but LiveBench and Arena both print High, so the model gets that rung: Gemini 3.6 Flash, Gemini 3.1 Pro Preview. Claude Opus 5 was already correct, its high and max Arena rows never merged. `ARENA_TIER` and `VARIANT_FIX` in the emitter. Also `EFFORT_ALIAS`: AA charts Claude Fable 5 as "(with fallback)" while its own prose calls it "Adaptive Reasoning, Max Effort, Opus 4.8 Fallback", so it is max, and before that mapping it was the one model escaping normalization entirely while ranked first.

9c. **THE PRICE LADDER IS THE BEST-MEASURED THING HERE, not the weakest. Settled 20 August; do not reopen.** It rests on 24 adjacent rung steps with a median ratio of 1.57 and quartiles of 1.46 and 1.71, a 17 percent spread across the interquartile range. Counting families undersells it: ten families, twenty-four measurements. Reconstructing prices for the fifteen families that publish effort settings without prices was tried and fails. Cost per task is output tokens times price per token and price per token does not move with effort, so a rung's cost ratio should be its token ratio, and the board publishes tokens per second and both timings. Four forms were tested against the 22 steps carrying both a price and a timing: tokens per second times total response, tokens per second times time to first token, and each timing alone. Correlations landed between minus 0.16 and minus 0.07, median errors 41 to 85 percent. Timing does not predict price on this board. Recorded so it is not tried a third time.

10. **LADDER FITTING RULES.** Pooled by source then averaged across sources equally, never a flat average over observations, because the boards do not sample independently and LiveBench republishing the same model across five releases would otherwise set the ladder for everyone. Inside a source, weighted by release: `RELEASE_DECAY = [1.0, 0.6, 0.35]` and `RELEASE_TAIL = 0.1`. A rotating benchmark gets harder each release and the ladder widens with it, measured: Claude 4.5 Opus reads a medium-to-high gap of 11.2 points on the 2025-11-25 LiveBench release and 16.9 on 2026-01-08, and GPT-5.1's reasoning-on gap goes 20.0 to 29.4 over the same span. Effort buys more on harder tasks. Scores are never comparable across releases; compute every gap within one.

11. **DATA COLLECTED THIS SESSION, all in `data/`, all read visually with no API.** `aa-all-status-2026-08-20.md` is the big one: 610 models, Status filter set to All, 41 columns. The agent reported 54 families with two or more settings; that counted date-versioned rows. The real numbers are 25 families with two or more EFFORT settings and 10 with a price at two or more of them, and both are now measured by the emitter rather than taken on report. Also `arena-text-all-categories-2026-08-20.md` (PARTIAL: 6 of 29 categories, being Overall, Multi-Turn, Hard Prompts English, and three Occupational sub-categories. No Style Control or Factuality variants captured at all. The agent died when the laptop slept. Restart fresh), `livebench-historical-2026-08-20.md` (nine releases: 2024-06-24 v1, 2024-07-26, 2024-08-31, 2024-11-25, 2025-04-02, 2025-04-25, 2025-05-30, 2025-11-25, 2025-12-23. MISSING 2026-01-08 only, because the agent died when the laptop slept. Verify before trusting; restart it fresh rather than resuming, it died twice), `livebench-subtasks-2026-08-20.md` (all 23 components, 44 models, cross-checked two ways), `arena-agent-categories-2026-08-20.md` (Overall/Code/Chat/Work at 50 rows each plus all five signal tables), `arena-extra-2026-08-20.md` (Vision Arena's 9 undocumented sub-categories), `aa-extra-2026-08-20.md` (AA-Briefcase, AutomationBench, Harvey LAB, EnterpriseOps-Gym), `livebench-extra-2026-08-20.md`, `tier-audit-2026-08-20.md`.

12. **PARTLY WIRED IN NOW.** `load_ladder_corpus_all()` parses `aa-all-status-2026-08-20.md` and the per-figure gains are fit on it: up to 24 families for a capability figure, against 4 before. A capability ladder needs two rungs and not a price at each, which is why the count is 24 and not 10. The price and position curve is still fit on the 10 priced families, correctly, because a price curve needs prices. STILL NOT WIRED: the LiveBench historical releases, the Arena text categories, and the Arena agent sub-boards. Neither are the LiveBench historical releases, the Arena text categories, or the Arena agent sub-boards. Wiring those in is the single highest-value next step and every constant in items 4 through 7 should be refit once they are.

12b. **STYLE CONTROL: measured, recorded, not yet wired.** `data/arena-style-control-2026-08-20.md`. LM Arena's Style Control strips formatting and length from the ranking and the gap to the plain board says how much of a model's standing is presentation. Across 33 models the median loses 10 points. GPT-5.6 Sol loses 28, Luna 22, Terra 20, Claude Sonnet 5 19, Claude Fable 5 13. Claude Opus 5 is the only real gainer, plus 16 at max and plus 12 at high, moving from rank 12 to rank 2 while Fable falls from 1 to 5. The page still scores the plain Arena numbers, because Style Control was only read for Overall and Hard Prompts and this page scores four Arena figures. Getting Creative Writing, Instruction Following and Longer Query under Style Control is the next data ask, and then the swap is worth making.

13. **CLOSENESS EVIDENCE, not scored.** Figures cut for saturation are shown as evidence that the field is close, never ranked on: GPQA Diamond (20 models span 89 to 95 percent, top five inside 1 point), CritPt, MMMU Pro, LiveBench reasoning, LM Arena Coding, plus eleven LiveBench component tasks. Components can never be scored, because a component is part of a category already on the page. `CLOSENESS`, `SUBTASK_PICKS` in the emitter, `CLOSE_DIAL` and `CAT_DIAL` on the page.

14. **THE PROSE WAS CUT ON THE OWNER'S INSTRUCTION.** Roughly 600 words sat between the value chart and the ranking; it is 139 now. The closeness panel collapses behind one line and lists four figures, not fifteen. Do not let it grow back.

15. **KNOWN DEFECTS AND OPEN QUESTIONS.** Three Qwen models (3.8 Max, 27B, 2.4T A95B) publish no effort setting on any board, so they are quoted unnormalized and this is not disclosed on their rows. The Arena Agent board prints unsigned magnitudes for what are negative values below rank 28, confirmed across all 24 tables, so it is read and never scored. Qwen3.8 Max license disagrees across boards (LiveBench says open, AA and Arena say Proprietary; we follow AA and Arena). The asterisk on AA's Intelligence Index appears on 434 of 610 rows and the site never explains it.

16. **AGENT OPERATIONS, learned the hard way.** Three separate agents flagged mid-flight `SendMessage` instructions as prompt injection and correctly ignored them. Instructions must go in the spawn brief; mid-flight messages are not reliable. Agents also share one browser pane and interfere with each other, closing tabs and typing into each other's search boxes, and coordinate-based clicking was broken this session. Keep concurrent browser agents low or expect re-verification work.

17. **THE DAILY JOB is the X-post calendar**, local and uncommitted by standing instruction. Aug 3-19 done. Aug 20 still not written.


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
gets one section rather than a third of this document. Rebuilt three times
this session; read this version, not memory of an earlier pass.

**Local, verified, gate-clean, ready to push: 9 dials, 17 models, every
dial a clean 50/50 pair.** Owner's instructions arrived in stages and each
stage changed the design: first, reconsider the whole benchmark set (3-5
per dial, up to 2 per source, drop saturated benchmarks, redefine dials
that don't fit). That produced a version where 6 of 9 dials could not draw
one benchmark from each of Artificial Analysis, LiveBench, and LM Arena,
because Arena runs exactly four boards total and none of the six ever had
a fifth to claim. Second stage, on seeing that gap: "must use at least 1
source from each per dial, or dial must change," which produced a 5-dial
version merging the six into two broad blends (one an 8-benchmark
"reasoning and real-world work," the other a 7-benchmark "honest, fast,
and cheap" that still couldn't reach Arena, since Arena has never
published cost, speed, or hallucination data under any framing). Owner's
verdict on that result: the source-purity rule itself was the problem, not
the dials, stated directly as a test of whether the arbitrary rule would
be caught rather than mechanically satisfied. Third and final stage: back
to 9 dials, each blending exactly 2 benchmarks at a flat 50/50, picked for
what they measure rather than for which source published them, with no
source-count requirement at all. Writing code and agentic coding trimmed
from their original 3 benchmarks to the 2 most distinct legs (an
automated eval plus a live Arena judgment in both cases); general quality
trimmed from 4 to 2 (Artificial Analysis Intelligence Index plus Arena
Text Overall). Reasoning, finishing real work, honesty, long context,
speed, and cost are their original clean 2-benchmark pairs, several of
them single-source by nature (responsiveness is two Artificial Analysis
figures because no other source tracks speed; honesty is two Artificial
Analysis figures because neither other source tracks hallucination). A
tenth dial, following instructions, was tried again and dropped again:
IFBench, its only real second benchmark, has real scores for 5 of 17
models, the same thin-coverage floor (real data for fewer than roughly 10
of 17) that sank every other rejected candidate this session. GPQA
Diamond, Omniscience Index, and MMMU Pro stay dropped for the same
reasons as before (saturated, double-counting, category error). Roster
stays at 17: all three previously excluded models (Claude Opus 4.8 High,
Claude Opus 4.7 High, GPT-5.5 xHigh) still carry zero Artificial Analysis
data, and every one of the nine dials draws on at least one Artificial
Analysis figure, so the exclusion holds regardless of how the dials are
shaped. `check-model-picker.py` passes (9 dials, all weights resolve);
`check-site.sh` reaches "Site checks passed."

**Two real display bugs from earlier this session (truncated benchmark
list; percentage from `dialMix()`'s separation-share instead of the real
weight) stayed fixed through all four rebuilds**, reverified live each
time: every dial's inline text now names both benchmarks backing it at a
plain 50%, matching the "Which benchmarks, and why" panel underneath.

Dial sliders run 0-10 (11 steps); the badge that counts sources is derived,
not stored, because a hardcoded count silently goes stale the day a source
stops covering everything (see the `var`-hoisting trap in "The traps").


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
python3 scripts/refresh-model-data.py data/leaderboards-2026-08-07.json
```

It prints what it dropped and asserts zero gaps. Then serve and drive the page.

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
