# kaspa explained working state

## START HERE ON A FRESH SESSION

The owner pastes this file in at the start of every session.

**FIRST JOB, before any building: trim this file.** Run `wc -w
WORKING-STATE.md`. The cap is 20,000, a ceiling and not a target. Trim every
session, over or not. The rule below is mechanical, so apply it and move on.

**Read it as a briefing for a stranger who has to continue the work today.** Not
an archive. A paragraph that does not change what the reader does next is not
earning its place, however true it is.

**CUT, in this order. Each has a test that needs no judgment.**

1. **Narration.** Any sentence describing the doing rather than the result.
   Test: delete it and see whether a number or a decision goes with it.
2. **Closed work.** A section whose outcome is now a shipped default or a
   passing gate. Leave one line with the number and the script that owns it.
3. **Second homes.** Any topic explained twice. Grep a distinctive number from
   it; two hits means one is redundant.
4. **Superseded prose.** Anything calling a thing unbuilt or unknown that is now
   built or known. Cut these first when found.
5. **Rejected approaches.** One line each: what, the number that killed it, and
   whether it is a law failure or a data failure.

**NEVER CUT.** A number with a source. A refusal and the check that would close
it. The traps. The directives. The pick-up block.

**HOW TO WORK, once the trim is done.**

- **Do not ask what to do next.** The queue below is ordered. Take the top item
  that needs nobody outside, finish it, record it, ship it.
- **Decide and report.** If a call is reversible, make it, say you made it, and
  say what would reverse it.
- **Three things need the owner, and only these three.** Deleting files he
  created. A change to what a page CLAIMS, since that is his positioning.
  Anything touching credentials or the domain.
- **Where this is heading.** Every public sentence is sourced to code, a
  release, a KIP or a core contributor, and carries its status label. Every
  check a reader might run should be cheaper than the claim it tests.

**THE RHYTHM.**

- **COMMIT** when one thing is finished and verified. A commit is the code, its
  gate, and the paragraph here that explains it, together. The pre-commit hook
  runs the full publish gate, so a red gate blocks committing, not just pushing.
- **DEPLOY** by pushing to `main`. Then confirm all three workflows are green
  and fetch the live page with a cache-busting query string for the exact
  changed string. A push is not a deploy and a deploy is not a verified page.
- **WRITE HERE** the moment a number, a refusal or a decision exists that is not
  in the code. Not narration of what you did.
- **REPORT** with the outcome first: what is live, what is committed, what is
  measured, what is open.

**On context.** Compaction cannot be triggered from inside a turn. What makes it
survivable is this file, so keep it current as you go. If context feels tight, do
not wind down early: commit, update this file, keep working.

**PICK-UP BLOCK, 2026-08-08.**

> Live is `3e9c5d1`, tree clean but for the X-posts draft, every gate green.
>
> READ THE DATE FROM THE ENVIRONMENT BEFORE WRITING ANY STAMP. This is trap 2
> and it cost two pushed commits.
>
> DO FIRST, and it is the one thing that makes the model picker defensible: the
> roster is still the 20 models somebody transcribed by hand, not the models
> that pass a rule. Requiring every model to appear in Arena's file was gating
> it, and Arena's four figures separate 44 to 56 where GDPval separates 100.
> Qwen3.8 Max is top five on both LiveBench and Artificial Analysis and is
> absent for that reason alone. Transcribe every model appearing in both
> LiveBench and AA. It forces one trade the owner should see first: adding
> models without Arena data means dropping Arena's four figures, since the grid
> must stay dense. Those four are the weakest on the board, so the trade is
> probably right.
>
> THEN: the eligibility threshold, "a model missing more than two scored figures
> is out", was set AFTER seeing which models it would drop. That is fitting a
> constant to a predetermined answer and it cannot be fixed by measuring. Set it
> before looking, on a stated principle.
>
> The X-posts draft is local and uncommitted by the owner's instruction. The
> August calendar runs to the 31st; he asks for them a day at a time.

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

## The model picker

More machinery than the rest of the site combined.

**`build-model-data.py` is dead and kept for history.** Written for a 19-metric
page, its input file gone. Running it drops every metric added since and every ci
array. **`refresh-model-data.py` is the live one.**

**The grid is fully dense, and coverage thresholds were the wrong instrument.**
80 and 90 percent floors still left one hole. A model missing a figure does not
score badly on it, it skips it, so its average is taken over an easier question
than the model beside it that published a weak number. Partial coverage rewards
not publishing. The build searches for the largest submatrix with no missing cell
and exits non-zero if one survives. Currently 20 models by 28 figures, 560 of 560.

**Area alone picks the wrong side of that trade, provably.** Keeping a model
multiplies the whole figure set, so keeping a model beats keeping a figure at
every possible weight: 19 by 28 can never outscore 23 by 24. No figure weighting
fixes it. What fixes it is an eligibility gate ahead of the search. **That gate's
threshold was fitted to the answer somebody already wanted, and that is an open
flaw, not a settled rule.**

**Most benchmarks cannot rank the frontier, and a dead one is worse than
absent.** Percentile normalization stretches a one-point gap across the full 0
to 100 range, so a saturated figure at weight 1 injects full-amplitude noise.
Measured on the scored scale across the top eight: LiveBench reasoning separates
24, output speed 26, GPQA Diamond 30, SciCode 32, HLE 39, Terminal-Bench v2.1 43,
Arena steerability 44. All are cut. What leads: GDPval 100, time to first token
99, LiveBench coding 98, cost per finished task 94, agentic coding 86, language
83.

**Measure separation on the scale that enters the score, not in raw points.** An
earlier weighting used raw point spread and put HLE and CritPt at the head of the
reasoning factor; on the scored scale they separate 39 and 53. Same shape as trap
7: a number is only meaningful inside the arithmetic it feeds.

**`frontierSpread` measured the wrong frontier.** It sorted by each figure's own
top five, which asks whether the five cheapest models are close on cost. They
always are, so cost read "cannot separate" while spanning 4.1x across the models
actually being ranked. Saturated benchmarks came out right by accident and skewed
ones did not. It now ranks by the score the reader sees.

**Read each column's definition before scoring it.** GDPval is published as
`(Elo-500)/2000`, a rescaled Elo and not a success rate. Non-hallucination is
measured on the Omniscience set, which asks things models mostly do not know, so
it scores admitting ignorance rather than truthfulness in general.

**Composites stay out of the dials.** LiveBench overall and the AA intelligence
index are weighted blends of figures already scored here, so dialing them counts
each sub-score twice at a mix somebody else chose. Both load; neither feeds a
factor.

**Arena signals are rebuilt from source, never carried across.** Carrying them is
exact only while the roster never moves, and it moves by design. A carried value
is a percentile of a field that no longer exists.

**Speed and latency drift between reads.** Nineteen of twenty models had
different tps, time to first token or total response between two reads of the same
board hours apart. Benchmark columns did not move. Re-read the speed columns on
every refresh.

**Ten factors, and a factor built on saturated figures is decoration.** The page
computes separation per factor and labels it.

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

22 dated claims, and they were not staggered: 19 came due on one morning, which
turned a recheck into a blocked repo. Stagger `recheck_after` when moving a batch.

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

1. Do not ask, decide. Report the call afterwards so it can be reversed.
2. Ask before destroying files the owner created.
3. Bound every command with an explicit timeout. Check cheap state first.
4. Do not declare blocked. A long session is not a blocker; context is
   summarized and the work continues.
5. Read the date from the environment before writing any stamp.
6. Every commit updates this file.

**Building**

7. One home per fact. A slug, a count or a date in two places drifts.
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
16. Drive it on the live page. Reading the code is worth nothing for anything JS
    renders.
17. Assert coverage. A parser that can silently see less than everything must
    state how much it saw.
18. Local, committed, pushed, deployed and visually verified are five states.

**Searching**

19. Open the page, never a summary of it.
20. Check a slug against the redirect stubs, not against its status code.
21. Re-derive anything marked permanent if it has not been re-derived since.

**Writing**

22. American English. No em or en dashes. The pre-commit gate catches British
    spellings in code comments too; one blocked a commit.
23. Plain and not dramatic. State the thing, give the number, move on.
24. State a status once with its label. Repeating the caveat reads as scared.

## The traps

Times the checker was wrong rather than the site.

1. **A page cited by slug that redirects.** 48 of 72 are stubs; the citation
   returns 200 and lands elsewhere. Found across 21 source lines in one file
   after being fixed twice as single instances.
2. **A stamp inferred from the task instead of the clock.** Two commits shipped
   four days behind.
3. **`build()` throwing on its own last line looks like an empty page.**
   `$('mpMap')` had no markup and never had. Everything above the throw had
   wired up, so dials worked the moment one was touched and the page merely
   looked empty. It shipped an uncaught TypeError, and the `applyPreset(1)`
   under the throw had never once run.
4. **A synchronous read of a debounced render returns the previous state.** The
   simulation is on a 120 ms timer, so probing right after a click reported
   every preset as identical and looked exactly like a filter bug.
5. **A coverage threshold that leaves one hole reads as complete.** 84 and 99.8
   percent both print as green summaries. Assert zero gaps and exit non-zero.
6. **A carried-over value is a percentile of a field that no longer exists.**
7. **Separation measured in the wrong units.** Raw benchmark points ranked HLE
   and CritPt at the head of a factor; on the scored scale they are weak.
8. **A separation measure that sorts by the metric's own leaders** asks whether
   the five cheapest are close on cost. Always yes. It labeled cost unable to
   separate while it spanned 4.1x across the models being ranked.
9. **A threshold set after seeing what it drops** is a constant fitted to a
   predetermined answer. Still live in the picker's eligibility gate.
10. **A roster inherited rather than derived.** The picker's models are the ones
    somebody transcribed, minus three, presented as the output of a rule. 18
    models in the Arena file were never tested against it.
11. **A stale server on the documented port.** HTTP 000, nothing in the log
    until it was read directly.
12. **`ugrep` failing a complex pattern looks like a negative result**,
    especially backgrounded.
13. **A claim registry that expires all at once.** 19 of 22 on one morning.
14. **A background job whose output was never read.** Two greps died on trap 12
    and the run was cited as evidence until the file was opened and found empty.

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

## Where this is going

1. **Rebuild the picker roster from the benchmarks**, not from what was already
   transcribed. See the pick-up block. This is the item that makes the tool
   defensible.
2. **Set the eligibility threshold before looking at what it drops.**
3. **Stagger the claim dates** so the registry stops expiring in one block.
4. **Gate the stamp against the clock.** Nothing catches a date written four
   days behind.
5. **Gate slugs against the redirect stubs**, so a citation to a merged page
   fails at commit rather than at read.
6. **Score the picker against outside truth.** Every figure is transcribed by
   hand and nothing re-reads the boards. A checker that re-fetches and diffs
   catches both transcription error and board drift.
