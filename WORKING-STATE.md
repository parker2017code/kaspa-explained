# RESUME HERE. Read this first, every session, before touching anything.

Everything through the 30 Aug rebuild is pushed and closed; `origin/main` history has
the session logs this file used to carry. This file is the state. Read `TODO.md`,
`PRINCIPLES.md` and `SITE-STANDARD.md` next. `CLAUDE.md` imports `AGENTS.md`, which
points here.

## Who you are working for, and how he works

He gives standing instructions and expects them held without re-asking. The ones in force:

- **Do the whole job. Never announce a reduced scope.** Saying "I'll read the logic and
  cover the markup mechanically" is worse than the shortcut itself: it asks permission to
  do less while sounding rigorous. Compress the reporting, never the work.
- **Record after every task**, because compaction can land at any moment. This block is
  the record. Update it as work completes, not at the end.
- **Do not burn tokens.** Exploring is fine. Redundant verification loops and long
  restatements are not.
- **Agent limits are whatever he last said, not a fixed number.** They have moved
  several times (two total, then five, then three concurrent, model changing from
  Opus to Sonnet to Fable). No agent may spawn subagents; that part has never moved.
- **Never touch or resize his Chrome.** Use playwright with its own viewport or the
  fixed-width iframe harness. His wifi drops, which is what keeps killing agents; that is
  environmental, not a fault in their work.
- **Never edit `the-instrument.html`.** It is Moose's 279-page work, hosted as a guest
  piece.
- **Rules break for the good of the site**, but say so and say why.

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

## Where the work stands, 1 September 2026

A freshness and consistency pass over every dated claim and every page baseline,
re-read against primary sources rather than bumped. Three things had gone stale
and are corrected in `dc7a075`: kaspanet/kccs merged a FOURTH KCC on 27 August
(KCC-0, purpose, format, lifecycle and finalization criteria, PR #17), which the
30 August pass missed and which three surfaces said was three; KCC-0020's spec
moved twice (PR #16 on 27 August makes an identical `extension_commitment` a
condition of fungibility for the standard transfer, PR #18 on 28 August is a
second change) against a page that said no spec change had merged, with issue #14
still open; and llms.txt still called the rusty-kaspa dagknight branch dormant
since 22 March when its newest commit is 28 August, a phrase `CLAIMS.yml` already
bans on HTML pages but cannot see in a .txt file.

Baselines re-read and moved: kaspa-mining's network snapshot, build-on-kaspa's
covenant adoption (84,196 created, 687 active, 1,561,431 KAS live value, 88,493
active on TN10), the Argent repo table, status.html's L1 line (DAA
528,309,833), and both kips.html stamps.

**Verified unmoved against the source, not assumed:** the whole KIP index table,
the five open KCC PRs, KIP-2 still Proposed with no mention of 100 BPS or
netsplit, vprogs at 79 commits with zero releases and zero tags since 28 July,
rusty-kaspa v2.0.1 still newest with #1101 still newest on master, the Toccata
operator guide byte-for-byte, kaspa-python-sdk at 2.0.2rc1, and the TN10 submit
schema still dropping compute_budget.

**One real null-deref found by driving, not by scanning.** `entryValue()` in the
covenant-breaker demo read `.value` off an unchecked-group querySelector result
with no fallback. Not reachable by a click (a radio group cannot be emptied from
the UI), but the throw took the whole demo down when it happened. It was watched
throwing, then watched clean after the fallback. Hardened in place.

The 30 August pass, for the record. An editorial pass over the whole rendered site: every real page screenshotted at
1280 and 375-390 in both themes and looked at, all 18 demos driven with a real
interaction, zero console errors and zero broken internal links measured sitewide.
Landed: demos/index footer disclosure aligned with the sitewide wording and its
stale styles.css cache key (v=20260825) fixed by unifying every page on one key;
the dead-CSS removal above; 30 closed session-record .md files deleted from the
repo root (git history keeps them); a word-cut seam repaired on crypto-from-scratch
where "That checking is the cost" had lost its antecedent.

Judged and deliberately left alone: `experiment/` (noindexed, unlinked by design,
kept as the TN12 record), all redirect stubs, llms.txt (dated, consistent,
maintained), the mixed comma selectors still naming dead classes (pruning them is
what broke the light theme).

**Not read, stated plainly:** the fourteen raw leaderboard transcriptions under
`data/` (~48,000 lines of scraped board tables); if a picker number is disputed,
read the board file that carries it then.

## Environment

    export PATH="$HOME/.local/opt/node-v22.14.0-darwin-arm64/bin:$PATH"
    python3 scripts/serve-local.py --port 4196
    curl -s -m 3 -o /dev/null -w '%{http_code}' http://127.0.0.1:4196/    # must be 200

## Do not undo any of this

Both collision demos now draw a real DAG; one fallback line had given every block a parent
it could not have seen, so 100% had exactly one parent and the panel labeled BlockDAG drew
a chain. Arrivals are exponential, not a fixed timer. The GHOSTDAG demo names the same sink
it draws. 36 tooltips no longer tell screen readers they are collapsed while open. A stray
`%` in a URL no longer throws sitewide. The image viewer opens and is a real modal. 44 CSS
rules whose classes appear in no HTML anywhere are gone. `refresh-model-data.py` refuses to
run and prints the live path.

Added 31 Aug 2026: 33 more CSS rules whose selector classes appear in no HTML or JS
byte anywhere were removed, proven safe by byte-identical full-page screenshots on
84 of 88 page/width/theme combos (the other 4 differ only in live-demo animation
frames). The part-pruning variant of that cleanup, deleting dead parts from mixed
comma selectors, BROKE the light theme sitewide and was reverted before commit; do
not retry it without the pixel harness.

Added 31 Aug 2026, second session, the technical-backlog pass:

- **The proof instrument for CSS edits is `scripts/computed-style-snapshot.mjs`,
  now hardened.** Raw screenshots are timing-unstable here (two identical trees
  differed on 85 of 88 shots); the computed-style hash is the instrument, and it
  needed four fixes to reach a true empty diff on identical trees: sort
  properties before hashing (custom-property enumeration order varies per
  browser launch), serve on a fixed port (a random port serializes into
  `background-image` URLs and changed the brand-mark hash every run), abort all
  external requests (live GitHub/kascov fetches rewrite tables differently every
  run), and wait for the DOM to settle after the aborts. It was watched failing
  on a planted 0.02px change before being trusted. `scripts/driven-style-snapshot.mjs`
  is the same hash taken with the menu clicked open, every details opened and
  every dialog shown; its noise floor is the two live collision demos.
- **styles.css 7,496 -> 6,735 lines, every cut proven.** 445 page-local token
  copies now inherit the shared tokens (55 var() rewrites, 390 deletions;
  deliberate divergences carry a one-line audit comment per style block). 260
  declarations shadowed by a later identical-selector rule in the same context
  deleted by cascade algebra. Dead-rule triage of the 238 scanner flags:
  52 already gone, 158 "overridden" KEPT (they match; cold-load evidence is the
  `cccdfba` trap), 6 generated `.grid-cards:has()` rules kept as uncertain,
  15 kept after matching in driven states (`.cell-detail[open]` matched only on
  the design/ pages, which the first state-check missed), 7 deleted after
  matching nothing in any driven state.
- **Two cleverer passes were built and thrown away**: part-level shadowing
  (deleting a declaration when every comma part reappears in later rules)
  produced real sitewide regressions the snapshot caught, and block merging
  tripped its own parser; neither is sound as written. The conservative passes
  above are idempotent and re-runnable.
- **Tab order at 390 found one real inversion** (the 1280-only check missed
  it): skeptical-case's security-budget demo floats the readout above the
  controls at <=759px (`order:-1`) while Reset sat last in DOM; Reset now ends
  the controls panel. The GHOSTDAG diagram's block-number focus order scatters
  vertically by DAG layout at both widths and is correct as is.
- **Picker data verified deeper than asked**: `emit-picker-blob.py` regenerates
  the shipped `window.__MP__` byte-identically from `data/picker-data.json`,
  and 15 randomly sampled cells (seed 20260831) all traced through
  picker-data.json to their exact raw lines in the `data/*-2026-08-25.md`
  dumps, including the two derived-looking ones (ARC figures are attached at
  blob build time; webdev 44.42 is the win probability of elo 1518 against the
  roster mean). Zero defects.
- **check-page-height.mjs was failing the blocking gate on origin/main
  already** (search.html, 843px "undifferentiated" run that a screenshot shows
  as a column of elevated result cards). `.search-results` joined the landmark
  list, the same under-named-class fix as the two 29 Aug additions.
- **audit-visual-guardrails.mjs asserted the FIRST definition of a selector**,
  which after consolidation is the overridden relic, not the rendered value; it
  reads the cascaded last-wins value across identical-selector blocks, and
  three stale expectations (72px nav, 14px mobile padding, body::before
  opacity caps on an element the final layer hides) were retired to the
  winning values.

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

**PICK-UP BLOCK:** none open. The 2026-08-22 model-picker pick-up block is closed; `model-picker-data.html` shipped and the gate owns the constants now.

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

**91 HTML files in the root and under `demos/`, 36 claims and 27 dated recheck
triggers, 4 data files.**
`CLAIMS.yml` is executable: `check-status-freshness.py` fails the build when a
`recheck_after` passes and when a `forbidden_copy` phrase appears in any page's
visible text.

**72 of the 91 are redirect stubs, leaving 19 live pages** (counted 1 September
2026 by grepping every file in the root and `demos/` for a refresh meta tag; that
is 18 in `site-manifest.json`, which includes `404.html`, plus `demos/index.html`,
and it agrees with `sitemap.xml`, `agent-index.json` and llms.txt). The 21 this
block carried was the count before the model picker came down, and it was already
one high. Pages get merged and the stub keeps
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

## The model picker: taken down 1 September 2026

Three pages (`model-picker.html`, `model-picker-method.html`,
`model-picker-data.html`) were deleted on owner request. Git history holds them,
`data/` and `scripts/emit-picker-blob.py` stay in the repo, and two gate checks
that read those pages are commented out in `check-site.sh` with a restore note.
The site is 19 live pages. Roughly 240 lines describing that tool's dials,
figures, constants and roster used to sit here and were cut on 1 September; the
commits that built it carry the detail. Two things from it are general and stay:

**CIRCULARITY.** Anchoring a figure on an index that contains it predicts the
figure partly from itself. LiveBench Overall is the exact unweighted mean of its
seven categories (max deviation 0.057 over 44 rows), so the target gets
subtracted back out. The Artificial Analysis Intelligence Index is the same bug
wearing a disguise: r squared 0.975 against a plain average of eleven of its own
components over 68 rows, and it publishes no weights, so it was refused as an
anchor rather than corrected. Look for a third instance anywhere a composite
score is used to predict one of its own parts.

## Bug class: a constant sized to one grid, left behind when the grid moved

Six instances found, same shape every time: a number or rule written against the
state of the data at the moment it was written, left standing after that state
changed. Per-source figure counts hardcoded at 13/7/5 while the real count
reached 32. A minimum-coverage floor fixed at 9, which was 22.5 percent of one
grid and silently became 45 percent of a smaller one. A hand-maintained name map
duplicating the table it should have read from. A hardcoded sentence describing a
blob that had moved. A prefix dispatch with no branch for a whole fourth data source, so
that source was invisible.

**The sixth cuts the other way, and it is the one worth carrying.** An audit
recommended scaling a minimum-evidence floor with the grid the way the coverage
floor scales. That was wrong and shipped before it was caught: it fitted a
capability curve to 2 benchmarks and moved a model from last to first. Derive a
count or a description from the thing it describes. But a minimum-evidence floor
answers "is this enough to trust," not "what share of the total is this," and
forcing the second shape onto the first question breaks it just as silently as
leaving a stale number in place.
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

36 claims, 27 of them carrying a `recheck_after` trigger. They were all sitting
on one date again and were staggered on 8 August across 15 August to 12
September, soonest for whatever moves fastest. Restaggered 1 September across 8
to 22 September.
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
| `kaspanet/silverscript` | the audit gate Argent waits on | v1-rc1, 30 Aug 2026, its first release ever, pre-release. Review and standardization, not a security audit, so the audit is still unevidenced |
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

