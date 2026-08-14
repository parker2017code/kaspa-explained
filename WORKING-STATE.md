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

**PICK-UP BLOCK, 2026-08-14, session end.**

1. Check `git log --oneline -1` against origin before trusting anything here. Read the date from the environment before writing any stamp (see "Mistakes that keep happening" item 1).
2. **MODEL PICKER: verified locally, deploying now.** `110aaee` is what's live on the site; the 9-dial/17-model rebuild described in "The model picker, briefly" below supersedes it and is what's being pushed this session. If this pick-up block still says "deploying now" next session, the push did not finish; check `git log` before trusting either state.
3. **SOURCES.HTML AND TOCCATA-EXPLAINED.HTML: fixed and pushed**, commit `6c3544b`. Both staleness items are resolved and live.
4. **THE DAILY JOB is the X-post calendar**, `kaspa-x-posts-august-2026.md`, local and uncommitted by standing instruction. Aug 3-14 done (Aug 12 has no entry in this transcript; check the file before assuming a gap).
5. **SITE REVIEW DONE THIS SESSION, clean.** No voice drift anywhere across all 72 pages, including the six long-prose pages flagged as never read end to end for argument drift (kaspa-mining, chain-comparer, sources, crypto-from-scratch, toccata-essay, kaspa-origin-story) plus toccata-explained.html. That item is closed.
6. **RAW SOURCE DATA for this session's picker rebuild** (Artificial Analysis, LiveBench, and LM Arena pulls, all dated 14 August) lives only in the session-scoped scratchpad, not the repo: `aa-fresh-2026-08-14.md`, `livebench-fresh-2026-08-14.md`, `arena-fresh-2026-08-14.md`. It will not survive past this session. Move it into `data/` before the next picker data refresh needs to reproduce or extend today's numbers.

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
gets one section rather than a third of this document. Rebuilt twice more
this session after the summary below was first written; read this version,
not memory of an earlier pass, since the methodology changed underneath it.

**Deployed (`110aaee`):** the 20-model, up-to-3-benchmarks-per-dial, 10-dial
version. Still live on the site as of this write-up.

**Local, verified, ready to ship, supersedes `110aaee`:** rebuilt to a
stricter rule, owner's explicit instruction: every dial draws exactly one
benchmark from Artificial Analysis, one from LiveBench, and one from LM
Arena, evenly weighted, UNLESS a source publishes nothing relevant at all
to that dial's concept, in which case the dial is honestly disclosed as a
two-source (or, for one dial, single-source) blend rather than padded with
an irrelevant or saturated benchmark to hit three. GPQA Diamond was dropped
outright (93-95% across the whole frontier, too tight to separate anyone).
Three clean 3-source triads survive: writing code (SciCode, LiveBench
coding, Arena WebDev), agentic coding and terminal work (Terminal-Bench
v2.1, LiveBench agentic coding, Arena Agent), general quality (AA
Intelligence Index, LiveBench global average, Arena Text Overall). Five
dials are honest 2-source pairs (reasoning, finishing real work, working
across a long context, responsiveness, cost), because LiveBench and Arena
between them publish nothing for long-context, hallucination, or speed at
all. One dial, not making things up, is honestly single-sourced
(Artificial Analysis non-hallucination rate only): neither LiveBench nor
Arena publishes anything hallucination-specific, and Arena's Search
leaderboard, the one candidate proxy, does not cover enough of the roster to
use.

**"Following instructions" was cut entirely, not patched.** It was the
weakest fit: both its benchmarks (IFBench, LiveBench IF) correlate heavily
with the general-quality dial already, and instruction-adherence is a less
distinct real-world decision factor than the other nine. Owner's call,
mid-session: rather than keep every original dial alive by forcing a thin
fit, drop the one that does not earn its place. The picker now has 9 dials,
not 10.

**Roster dropped from 20 to 17.** New rule, owner's explicit instruction:
exclude any model missing more than 10 of the total ~20 individual
benchmark metrics wired across the 9 dials, computed fresh against the
current (smaller) metric set, not a leftover percentage floor from an
earlier design. Three models cleared the old design's bar but not this one:
Claude Opus 4.8 High (12 missing), Claude Opus 4.7 High (11 missing), GPT-5.5
xHigh (12 missing), the same three with zero Artificial Analysis data. This
is a deliberate exclusion, not a bug: unlike the coverage floor removed
earlier this session, which was a stale leftover fighting a hand-curated
roster's intent, this threshold was set fresh for the current design and
should not be second-guessed the same way.

**Two real display bugs, both found by the owner and fixed, same root
cause.** First: the inline "leans on" summary under each dial capped at two
named benchmarks no matter how many actually backed it, so a 3-source
triad and a 2-source pair rendered in the identical shape, silently
dropping the Arena figure from all three triads every time (Arena WebDev
from writing code, Arena Agent from agentic coding, Arena Text Overall
from general quality). Second, and worse: that same summary's percentage
was never the configured weight at all. It came from `dialMix()`, an
evidence-weighted "how much does this figure actually separate the field"
computation built for a different purpose (the "separates the leaders"
label), reused here by mistake. A clean 33/33/33 triad could render as
61/26/13, and the number disagreed with the "Which benchmarks, and why"
panel directly underneath it describing the same dial with the real
weight. Both are fixed together: the summary now names every benchmark
that backs a dial and states its real configured share, matching the
panel below it exactly, every dial reading a plain 50%, 33%, or 100%
depending on how many sources it draws from. `dialMix()`/`dialSeparation()`
are untouched and still used for the separation label, which is a
legitimately different question from how much a benchmark counts.

Dial sliders run 0-10 (11 steps), widened from 0-4 for finer control;
`DEFAULTS` and every named preset were rescaled by the same factor so the
percentage split each dial gets held steady through that change.

The badge that counts sources is derived, not stored, because a hardcoded
count silently goes stale the day a source stops covering everything: see the
`var`-hoisting trap in "The traps," which cost a day of downtime once
already.


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
