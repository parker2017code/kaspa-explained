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

**PROPORTION.** This site is about Kaspa. 71 of its 72 pages are Kaspa. If a
section about tooling grows past a section about what the site claims, the doc
is wrong even if every sentence in it is true.

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

**PICK-UP BLOCK, 2026-08-08, session end.**

> Check `git log --oneline -1` against three green workflows before trusting
> anything here. READ THE DATE FROM THE ENVIRONMENT BEFORE WRITING ANY STAMP,
> trap 2, it cost two pushed commits.
>
> **THE DAILY JOB is the X-post calendar.** `kaspa-x-posts-august-2026.md`,
> local and uncommitted by the owner's instruction, running to 31 August, asked
> for one day at a time. Aug 3 to 8 are done. Every post is verified against
> primary sources before handover and its source slug checked against the
> redirect stubs. Aug 3 was rewritten for quoting one half of Argent's README;
> Aug 8 gained a paragraph because it told readers to verify on an explorer and
> explorers cannot decode covenant data.
>
> **NOT YET DONE, and it is the next real job: a full site overview.** All 24
> live pages read end to end against CLAIMS.yml and the primary sources, not
> just scanned. The 8 August sweep was a SCANNER pass for AI tells and self-talk
> (clean: zero em dashes, one self-talk line cut, the rest domain vocabulary and
> FAQ headings) plus a self-count check on one page. Nobody has read the other
> 23 pages for stale facts. Start with the pages carrying dated or numeric
> claims: status, toccata-status, kaspa-claims-checker, what-is-kaspa,
> build-on-kaspa, kips, toccata-explained, skeptical-case.
>
> **CLAIM DATES all sit on 2026-08-21 and will block the repo together.** 19 of
> 22 came due on one morning last time. Stagger them.
>
> **THE PICKER is current and deployed**: 23 models, 25 figures, 575 of 575
> cells, both boards re-read 8 August. Its one open flaw is the eligibility
> threshold, set after seeing which models it dropped.

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

One page of 72, and it carries more machinery than the rest combined, so it gets
one section rather than a third of this document.

23 models by 25 figures, 575 of 575 cells, zero gaps, two sources.
`refresh-model-data.py` is the live build; `build-model-data.py` is dead and kept
for history. Five rules that took a day to learn. The grid must be fully dense,
because a model missing a figure skips it rather than scoring badly on it. A
figure that cannot separate the frontier is cut, not down-weighted, since
percentiles stretch a one-point gap to full range. Separation is measured on the
scored scale, not in raw points. Labels are part of the claim, which is how every
row came to print "default setting" while carrying max-effort figures, and how
the source badge said "all three leaderboards" after one board stopped feeding
it. And a selection rule must not read the thing it feeds: the eligibility gate
read the live dials, so rewriting a factor moved the roster with no new data.

Arena's four session signals came out on 8 August to admit three models Arena
never scored, including Qwen3.8 Max, top five on both remaining boards. Cost per
task came back the same day, when the one model missing it published one.

OPEN: the eligibility threshold was set after seeing which models it dropped.


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
