# kaspa explained working state

## What this is for

Explain Kaspa to a reader who will be lied to about it everywhere else, and be
checkable enough that the explanation survives someone hunting it.

Three goals, in the order they pay:

1. **Say what is true right now**, sourced to code, releases, KIPs or a core
   contributor, never to a summary of them.
2. **Say where the claim stops.** Live, near-term, roadmap and research are four
   different states and the page must name which one it means.
3. **Make the check cheap.** A reader who wants to falsify a sentence should
   reach the primary source in one click, and a gate should catch it before they
   do.

The site is static HTML on GitHub Pages. There is no build system and adding one
needs a reason.

## How this file works

One document. Everything closed lives in the commit that closed it. If a line
here describes something already done, delete it. The directives are the standing
rules; everything else is a finding, a number, or a queue item, and nothing
restates a directive.

`AGENTS.md` stays the repo instruction file the agents load. This file is the
state: what is true today, what rots, what has already gone wrong. When the two
disagree about a fact, this file is wrong and gets fixed, because `AGENTS.md` is
loaded automatically and this one is not.

---

## Where this stands

**72 public pages, 22 dated claims, 4 data files.** The claim registry is
`CLAIMS.yml` and it is executable: `check-status-freshness.py` fails the build
when a `recheck_after` passes and when a `forbidden_copy` phrase appears in any
page's visible text.

**48 of the 72 pages are redirect stubs.** Pages get merged and the stub keeps
the URL alive. That is fine for readers and it is a trap for anything that cites
a page by slug: the citation resolves, returns 200, and lands somewhere else.
Verified 2026-08-07: 15 distinct dead slugs across 21 source lines in one drafts
file. Check a slug against the stub list, not against HTTP status.

**The publish gate is wired into `.githooks/pre-commit`.** It runs on every
commit, not only when invoked by hand, so a red gate blocks committing rather
than blocking pushing. "Site checks passed." is the only success line that
counts.

**Deploys come from `main` on GitHub Pages.** Three workflows run: Site checks,
Copy lint, and pages build and deployment. Committed, pushed and deployed are
three states, and live-and-verified is a fourth.

## Dates, and the way this repo gets them wrong

The date is not inferable from what is being worked on. On 2026-08-07 a whole
session stamped every baseline "August 3" because the task was the August 3 post,
and the error reached two pushed commits before anything caught it. Nothing in
the gate checks a stamp against the clock.

Read the date from the environment, not from the work. Every stamp this repo
carries is a claim about when a source was read: `CLAIMS.yml` `last_checked`, the
two `kips.html` baselines, `dateModified` on every touched page, and the "as of"
line inside any dated post.

## The model picker

Its own section because it carries more machinery than the rest of the site
combined.

**`build-model-data.py` is dead and kept for history.** It was written for a
19-metric page and its input file is gone. Running it drops every metric added
since and every ci array, and `check-model-picker.py` then fails because dials
name figures that no longer load. **`refresh-model-data.py` is the live one.**

**The grid is fully dense on purpose, and thresholds were the wrong instrument.**
80 and 90 percent coverage floors still left one hole. A model missing a figure
does not score badly on it, it skips it, so its average is taken over an easier
question than the model beside it that published a weak number. Partial coverage
rewards not publishing. The build now searches for the largest submatrix with no
missing cell and exits non-zero if one survives. Currently 20 models by 28
figures, 560 of 560.

**Area alone picks the wrong side of that trade, provably.** Keeping a model
multiplies the whole figure set, so keeping a model beats keeping a figure at
every possible figure weight: 19 models by 28 figures can never outscore 23 by
24. Weighting figures does not fix it and no weight exists that does. What fixes
it is an eligibility gate ahead of the search, on the owner's rule: a model that
skipped more than two scored figures is out. Three were, and GDPval,
Terminal-Bench v2.1 and tau-3 stayed in because of it.

**Most of these benchmarks cannot rank the frontier.** Measured across the top
five on 2026-08-07: GPQA Diamond spans 1 point, LiveBench reasoning 2, data
analysis 2, math 3, long-context reasoning 3, SciCode 4, Terminal-Bench v2.1 4.
Percentile normalization then stretches that single GPQA point across the full
0 to 100 range. Four figures separate: non-hallucination 21,
Omniscience accuracy 13, GDPval 12, CritPt 9. Weight inside a factor accordingly,
and let the page print the separation per factor rather than hiding it.

**Read each column's definition before scoring it.** GDPval is published as
`(Elo-500)/2000`, a rescaled Elo rather than a success rate. Non-hallucination is
measured on the Omniscience set, which asks things models mostly do not know, so
it scores admitting ignorance rather than general truthfulness. Two columns can
carry the same name and different arithmetic.

**Composites stay out of the dials.** LiveBench overall and the Artificial
Analysis intelligence index are weighted blends of the figures already scored
here, so dialing them counts each sub-score twice at a mix somebody else chose.
Both are loaded and neither feeds a factor.

**Arena's four session signals are rebuilt, never carried across.** Carrying them
from the previous build is exact only while the roster never moves, and the
roster moves by design here. A carried value is a percentile of a field that no
longer exists sitting beside figures scaled to the field that does.

**Speed and latency drift between reads.** On 2026-08-07 nineteen of twenty
models had different tps, time-to-first-token or total response between two reads
of the same board hours apart. Benchmark columns did not move. Re-read the speed
columns whenever the file is refreshed.

**Ten factors, and nine of them separate the leaders.** A factor built on
saturated figures is decoration: it prints a share and cannot move an answer. The
page computes separation per factor and labels it. Cost is the one that currently
cannot separate, and it says so.

## Serving and rendering, the two routes that keep costing time

**Local serving.** `python3 scripts/serve-local.py --port 4187`. A stale process
can hold the port from an earlier session and fail with `PermissionError` on
`os.getcwd()` because its working directory is gone; the symptom is HTTP 000 with
the port still bound. Serve on another port rather than debugging it.

**The shell resets its working directory to `~/Documents` between calls.** Use
`git -C` and absolute paths, or a `cd` inside the same command.

**`ugrep` is the default grep here and it refuses complex patterns.** Any regex
with nested bounded repetition over a character class fails with "exceeds
complexity limits", and the failure looks like an empty result rather than an
error when it runs in the background. Parse HTML in Python instead.

**A rendered check is not optional for anything JS builds.** The page's ranking,
its verdict line and its dial shares are all written by script, so reading the
source proves nothing about them.

## The claim registry rots on a cliff

`CLAIMS.yml` carries 22 dated claims and they were not staggered: 19 came due on
the same morning, 2026-08-06, which turned an ordinary recheck into a blocked
repo. Stagger `recheck_after` when moving a batch.

Bump a date only after reading the source. The rule exists because
bumping is the cheap way to make the gate green and it silently converts a
checked claim into an unchecked one.

**What each expired claim needs, and what settles it:**

| Claim | Settles it |
|---|---|
| `toccata` | rusty-kaspa releases; no tag after v2.0.1 means nothing moved |
| `dagknight` | KIP-2 status line in the kips README |
| `vprogs` | kaspanet/vprogs releases, tags and commit dates |
| `argent` | argent-lang/argent README and commit count |
| `covenant_tooling_and_support` | kaspa-python-sdk releases, prerelease flag included |
| `kcc_conventions` | kaspanet/kccs open pull requests and merge count |
| `tps_and_speed_context` | `bps.rs` and `mass/mod.rs` in rusty-kaspa |
| the research rows | kaspa.org/lore and docs.kaspa.org read as pages, not summaries |

## Sources, and which are primary

Ranked by what settles an argument.

| Source | Answers | Note |
|---|---|---|
| `kaspanet/rusty-kaspa` code and releases | what consensus does | `TenBps = Bps<10>` and `normalized_max` doing `c.max(t)` are the two the copy leans on |
| `kaspanet/kips` README | KIP status | the index table is the status, not the KIP body |
| `kaspanet/kccs` pull requests | whether a convention is ratified | one merged PR, the README. Nothing is a standard |
| `kaspanet/vprogs` | vProgs maturity | zero releases and zero tags is the fact |
| `kaspanet/silverscript` | the audit gate Argent waits on | zero releases, and still renaming core syntax |
| `argent-lang/argent` README | Argent status | read both halves of Project status or misdescribe it |
| api.kaspa.org | live DAA score, blue score | confirms activation is past, not just announced |
| docs.kaspa.org | orientation and framing | lags activation; trust the release tag over its prose |
| kaspa.org/lore | roadmap framing | says "100 blocks per second", never "100 BPS", so grep both |
| kas-smiths.org, t.me/kasparnd | design discussion ahead of any KIP | research stage by default, whatever the thread is named |

## The directives

**Working**

1. Do not ask, decide. Act on best judgment and report the call afterwards so it
   can be reversed. This does not cover destroying files.
2. Ask before destroying. Deleting or moving files the owner created needs a
   question first.
3. Bound every command with an explicit timeout, a few minutes at most. Check
   cheap state first and skip the expensive call when it is a no-op.
4. Do not declare blocked until the search is exhausted. A long session is not a
   blocker; context is summarized and the work continues.
5. Read the date from the environment before writing any stamp.
6. Every commit updates this file.

**Building**

7. One home per fact. A slug, a count or a date written in two places drifts.
8. Delete a placeholder rather than shipping it as a number.
9. A default ships with its band printed and a control that overrides it.
10. Composites do not feed a score that already scores their parts.
11. Every listed row carries every listed figure. No gaps, not few gaps.
12. Where a figure cannot separate the field, say so on the page rather than
    letting its percentile imply it can.

**Testing**

13. Score against outside truth, never against the tool.
14. Prove a check can fail before reporting that it passed.
15. Drive it on the live page. Reading the code and concluding it works is worth
    nothing for anything JS renders.
16. Assert coverage. A parser that can silently see less than everything must
    state how much it saw.
17. Local, committed, pushed, deployed and visually verified are five states.
    Name which one is true.

**Searching**

18. Open the page, never a summary of it.
19. Check a slug against the redirect stubs, not against its status code.
20. Re-derive anything marked permanent if it has not been re-derived since it
    was written.

**Writing**

21. American English. No em or en dashes anywhere.
22. Plain and not dramatic. State the thing, give the number, move on.
23. State a status once with its label and move on. Repeating the caveat reads
    as scared rather than careful.

## The traps

Times the checker was wrong rather than the site.

1. **A page cited by slug that redirects.** 48 of 72 pages are stubs. The citation
   returns 200 and lands elsewhere, so status code proves nothing. Found across
   21 source lines in one file after being "fixed" twice as single instances.
2. **A stamp inferred from the task instead of the clock.** The work was the
   August 3 post, so every date written that day said August 3. It was the 7th.
   Two commits shipped with it.
3. **`build()` throwing on its own last line looks like an empty page.**
   `$('mpMap')` had no markup and never had. Everything above the throw had
   already wired up, so dials worked the moment one was touched and the page
   merely looked empty. It had been shipping an uncaught TypeError, and the
   `applyPreset(1)` under the throw had never once run.
4. **A synchronous read of a debounced render returns the previous state.** The
   simulation is on a 120 ms timer, so probing right after a click reported every
   preset as identical and looked exactly like a filter bug. It was the probe.
5. **A coverage threshold that leaves one hole reads as complete.** 84 percent
   coverage and 99.8 percent coverage both print as green summaries. Assert zero
   gaps, and exit non-zero on one.
6. **A carried-over value is a percentile of a field that no longer exists.**
   Arena signals were carried across a roster change and would have sat beside
   figures scaled to a different set.
7. **A benchmark that cannot rank the frontier still produces a full 0 to 100
   spread.** GPQA spans one point across the top five and normalizes to the whole
   range. The percentile hides saturation rather than showing it.
8. **A stale server on the documented port.** Port 4187 stayed bound by a dead
   process whose working directory no longer existed. HTTP 000, and nothing in
   the log until it was read directly.
9. **`ugrep` failing a complex pattern looks like a negative result**, especially
   backgrounded, where the error lands in a file nobody reads.
10. **A claim registry that expires all at once.** 19 of 22 on one morning, which
    is a blocked repo rather than a recheck.
11. **A background job whose output was never read.** Two greps died on trap 9
    and the run was reported as evidence until the file was opened and found
    empty.

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

After changing the model picker data, also:

```bash
python3 scripts/refresh-model-data.py data/leaderboards-2026-08-07.json
```

It prints what it dropped and asserts zero gaps. Then serve and drive the page:
the ranking, the verdict line and the dial shares are all script-written.

## What ships and how

`main` on GitHub Pages, custom domain `kaspaexplained.com` via `CNAME`.

```bash
bash scripts/check-site.sh
git push origin main
```

Then confirm all three workflows are green and fetch the live page with a
cache-busting query string for the exact changed string. A push is not a deploy
and a deploy is not a verified page.

## Where this is going

1. **Stagger the claim dates** so the registry stops expiring in one block.
2. **Gate the stamp against the clock.** Nothing currently catches a date written
   four days behind.
3. **Gate slugs against the redirect stubs**, so a citation to a merged page
   fails at commit rather than at read.
4. **Score the model picker against outside truth.** Every figure is transcribed
   by hand from three boards and nothing re-reads them. A checker that re-fetches
   and diffs would catch both transcription error and board drift.
5. **Assert transcription coverage.** The data file states which columns it read;
   nothing asserts it read all of them.
