# Handoff

State of the kaspa-explained rebuild. Written for whoever picks this up
next, including a future instance of me after a context compaction.

## What this site is

An independent Kaspa explainer at kaspaexplained.com, static HTML on
GitHub Pages, repo `parker2017code/kaspa-explained`, deployed from
`main`. Seventeen interactive demos under `demos/`, plus reading pages.

The owner's standing framing, recorded in `design/STANDARD.md`: the job
is to represent concepts visually so a reader sees a thing happen rather
than reading a claim that it happens. Learning resource first, argument
second. Where Kaspa is weak, show the weakness plainly; a demo that
flatters Kaspa is worth less than one that does not, because the reader
can tell.

## The governing documents, read these first

- `design/STANDARD.md` carries the design bar (macOS and iOS), the 300-word
  visible ceiling, and the weaknesses-are-the-material rule.
- `design/handoff-checklist.md` sets the mandatory cold read that runs
  before anything reaches the owner.
- `design/house-style.md`, `design/density-budget.md`,
  `design/interaction-standard.md`.
- `CLAIMS.yml` holds the checked claim set. Its `forbidden_copy` list
  records phrasings banned because they were wrong before.
- `data/chain-methodology-2026-08-22.md` records how the chain data was
  measured, and the standing rule about protocol constants.

## Hard rules

- Every claim needs a primary source. `kaspa.org` marketing pages are
  banned and enforced by `scripts/check-source-ban.sh`; wiki, docs and
  api subdomains are fine. Third-party explainers including `kaspa.com`
  (KaspaCom) are not accepted.
- Never present a protocol constant as a measurement. Bitcoin at exactly
  600.0s and Polkadot at exactly 6.0 were both constants posing as
  observations; both were re-derived from raw timestamps.
- Quotations must be verbatim against source. Three separate instances of
  silently smoothed quotes were found and corrected today.
- Anything invented in a demo must say it is invented. A vault holding
  10,000 KAS and a token called KAI both had to be labeled.
- `the-instrument.html` is a hosted guest piece by Moose. Never edited.
- `kaspa-x-posts-*.md` stay local and uncommitted. Now gitignored.
- Never `--no-verify`. `bash scripts/check-site.sh` must end in
  "Site checks passed."
- Subagents are Sonnet only.

## Rules leak unless mechanized

This is the most important lesson from this session. Every rule fixed by
hand came back. The kaspa.org citation ban leaked four times before
`check-source-ban.sh` existed and has not leaked since. Heading-as-link
color was fixed and returned, so `scripts/check-heading-link-color.mjs`
now renders every page in both themes and reads computed color, because
a grep cannot catch a CSS specificity fight.

When you fix a class of defect, add a gate check for it, and watch the
check fail before you trust it passing.

## Outstanding work

- Supply-split has failed the owner three times. It demonstrates nothing
  legible to him. Consider whether it should exist rather than reworking
  it a fourth time.
- A full multi-viewport verification sweep of every page: phone, tablet,
  desktop, both themes, top to bottom.
- The DAGKnight optimistic/pessimistic regime split, in flight.
- History rewrite to remove three `kaspa-x-posts-*.md` files from git
  history. Owner authorized; needs a clean tree and a force push. Full
  backup bundle and file copies are in the session scratchpad.

## What the owner rejects, learned the hard way

- Text walls. He counts "blah blah blah" out loud.
- Chrome that states the obvious. A footer saying the page is part of
  this site was noise and was removed sitewide.
- Collapsing primary content while leaving trivia visible.
- The same disclosure mechanism on every page. Vary it.
- Demos that are mechanically correct and demonstrate nothing legible.
- Being asked to catch bugs himself. Finding them is the agents' job.

## State at 23 August 2026, mid-session

Live and deploying continuously from `main`. Every commit runs the gate
via a pre-commit hook, and the gate must end in "Site checks passed."

Agents in flight, each owning disjoint files so they cannot collide:
attack-cost plus the supply-split judgment call; the four tool pages
(argent-explained, model-picker, kaspa-claims-checker, chain-comparer);
six long-form guides; six reference pages; four demos with touch and
text defects; seven short pages under the ceiling; and the glass scan on
styles.css.

### Decisions taken this session

The 300-word ceiling is hard for demos, the homepage and routing pages.
On long-form guides and reference surfaces it becomes a per-section rule
instead: no run of prose exceeds roughly 300 words without structure
breaking it up. Applying the cap literally to a 3,287-word mining guide
would hide ninety percent of it, which is the inverted disclosure the
same standard bans.

supply-split is delisted from the demos index pending a recommendation
on whether it should exist at all. It failed the owner three times. The
page still resolves directly. The index says sixteen demos.

Live pricing stays, and is now wired to Kraken's public ticker for BTC,
LTC, XMR, ETH and SOL, plus api.kaspa.org for Kaspa. Both were tested by
real browser fetch on this origin, never curl, which is how the original
bug shipped. Coinbase has no KAS pair, Binance blocks this origin, and
CoinCap's public tier failed outright. Kraken serves price but not market
cap, so some figures are a live price against a dated supply ratio and
the sourcing lines say which half is which.

One correction to the record: the false "read live" claim was blamed on
broken fallback logic. Forced-failure testing could not reproduce that.
The fallback was already honest. The real fault was CoinGecko rate
limiting under bursty traffic and returning errors with no CORS header,
which a browser reports as a bare CORS block.

supply-split is cut, not just delisted. It works and is correctly
sourced. It was cut because the subject is a static one-path fact rather
than a system with parameter space, and kips.html already teaches it in
prose with better sourcing. The file stays on disk and still resolves so
no link 404s.

### Known remaining work

Dead CSS cleanup: 34 classes and one id confirmed unused, plus 227
selectors defined in both the legacy region and the Apple layer where
the legacy one still supplies layout. Queued behind the glass scan,
because the scan establishes which rules actually render.

Verification gaps from the last full sweep: 768px was only spot checked,
light theme was only spot checked, anchor scrolling was not tested, and
contrast was not computed numerically.

The visible-word check is advisory. Flip `VISIBLE_WORDS_BLOCKING` to
true once the over-limit list is empty.

## Finish standard

Work stops when all seven are green. Not before, and not after: no
unprompted improvements past this line. Each item is a command or a
count, not an opinion, so it can be checked rather than argued.

1. `bash scripts/check-site.sh` ends in "Site checks passed." on a fresh
   clone, not just in the working tree.
2. `VISIBLE_WORDS_BLOCKING=true bash scripts/check-site.sh` passes. Every
   page is under the ceiling or carries a listed exemption in
   `scripts/essay-pages.json`. Then the variable's default flips to true.
3. `scripts/check-glass.mjs` reports only sanctioned brand-gradient
   accents, in both themes, across every page and every demo. The
   `_preview-site/measure.html` harness named in CLAUDE.md does not exist
   in this checkout, which is why the scan has to be a committed script.
4. Every page and demo renders clean at 390, 768 and 1280 in both themes:
   no horizontal scroll, no body text under 16px, no touch target under
   44px, no console errors, no text contrast under 4.5:1 computed
   numerically, and every in-page anchor lands on its target.
5. The site survives an adversarial wave, run only after everything else
   is green, by agents that built none of what they are attacking. Four
   jobs, and no agent gets its own work:

   - Break it. Drag every control to its limits, both ends and past
     them. Empty input, absurd input, rapid clicking, double submit,
     back button mid-interaction, reload mid-state, deep link into a
     fragment, disable JavaScript, kill the network mid-fetch. Anything
     that renders a wrong number, a stuck state, or a blank panel is a
     defect.
   - Misunderstand it. Read every page as a newcomer who knows no
     Kaspa vocabulary and read it again as a hostile skeptic looking
     for a claim to catch out. Record every place the two readers
     reach different conclusions, and every sentence either one has to
     read twice. A page that can be honestly misread is a defect even
     when every sentence is true.
   - Check it. Every number, date, quotation, and claim against its
     primary source, not against another page of this site. Every
     quotation verbatim. Every invented example labeled as invented.
     Every live figure actually read live, tested by browser fetch on
     this origin, never curl.
   - Cross-read it. One concept, one name, one phrasing, everywhere.
     Two pages teaching the same mechanism in different words is a
     defect. So is a demo whose voice does not match the guide that
     links to it.

   Every finding gets fixed and re-checked, by a different agent than
   the one that found it. Nothing reaches the owner as a known defect.
6. No `recheck_after` date in `CLAIMS.yml` has passed.
7. Tree clean, pushed, and the live domain serves the same commit hash.

At green, hand to the owner and stop. He drives, then says what is next.

The handoff is not a list of what was done. It is a short list of what
he specifically needs to look at, and nothing else: the judgment calls
only he can make, the places where two defensible choices existed and
one was taken, and anything cut or kept against the obvious reading. He
does not review defects. Finding those is the agents' job, and any
defect that reaches him is a failure of this process, not a request for
his help.

## State at 23 August 2026, late session

Live at commit 7ac46ac. Read TODO.md for the running list and
design/STANDARD.md for the bar; both were rewritten today and are current.

### What the owner cares about, in his own framing

The governing test, which outranks every rule in every document: if
Apple, Google, Tesla, or Meta would not write it that way, design it that
way, keep it that length, or leave it stale, it does not ship.

`utxo-vs-accounts.html` is the model page. His words: "an example of an
amazing page and how every single page should work." Roughly 235 visible
words, two working demos embedded, a little scrolling, the demos carrying
the explanation.

Every page carries a demo. Where none fits, build one. He specifically
wants a demo showing how Argent compiles to Silverscript and Silverscript
to Kaspa script.

If nobody reads it, delete it. Pages, sentences, words.

He does not find defects. If he finds one, the process failed.

### Traps this session walked into, do not repeat

Cutting visible words by moving them behind a disclosure. A 5,000-word
methodology ended up behind one triangle on model-picker. A gate now
fails any disclosure over 1,200 words.

Stripping a page's substance to hit a ceiling. An agent cut model-picker
from 1,840 words to 289 by hiding most of its ranking and broke a page
the owner built over a full day. It is now exempt from the word ceiling
and from copy lint, as is chain-comparer. Never edit either for length.

Work lost to concurrency. Three separate times an agent's `git reset` or
`git stash` destroyed another agent's uncommitted work, including the
model page, which had to be rebuilt from scratch. Commit immediately
after any retirement or new page; never leave it in the working tree.

Orphaned browsers. Agents leak headless Chrome. It reached 139 processes
and load average 28, at which point the gate could not finish and the
owner's local server was starved. Sweep with
`pkill -f "user-data-dir=/var/folders"`. Port 4187 is his, never bind it.

Gates that fight the goal. A guardrail REQUIRED the glossy sheen on six
components. A checker flagged "dialogue" as British. Three linters
treated internal reports as reader-facing copy. When a rule and a good
page disagree, fix the rule and say so.

### Still owed

about, glossary, kaspa-developments, search, demos/index never got a full
pass. glossary and kaspa-developments were retired once and restored by a
reset; retire them again and commit immediately. The stylesheet is still
about 9,000 lines. 23 markdown docs at root, unconsolidated. Not every
demo has been judged for whether it is worth using.

## Deploy state, end of 23 August 2026

Live was 7ac46ac for a long stretch while a large amount of finished work
sat undeployed. The cause was not the work; it was the gate cycle. Five
separate checks turned out to be wrong rather than the code, each costing
a four minute cycle to discover:

- a visual guardrail that REQUIRED the glossy sheen it was supposed to ban
- the American English checker flagging "dialogue", which is correct
- three linters treating internal reports and scrape logs as reader copy
- a search check demanding the 404 page appear in search results
- a grid check recognizing only one of two valid span patterns
- a content-flow check requiring a link to a page that had been retired
- the same check applying a whole-page word ceiling to long-form guides
  that are governed by the per-section rule instead

All are fixed. The lesson worth carrying: on this repo the gates need the
same scrutiny as the pages, and a blocked commit is as likely to be a
wrong rule as a wrong change.

The second cause was concurrency. Agents running `git reset`, `git stash`
and `git checkout` destroyed each other's uncommitted work at least four
times, including the model page, which had to be rebuilt from scratch.
Every agent brief now forbids those commands outright and forbids
committing; one committer only.

### What is done and deployed

Glass gone sitewide including the `--glass-*` tokens that hid it from four
previous audits. Model picker restored to the owner's own version after an
agent cut it from 1,840 words to 289 and broke it; it is now exempt from
the word ceiling and from copy lint, as is chain-comparer. Footer at a
third its height with full navigation. Covenant defined in plain language.
Demos embedded in guides.

### What is done and was landing at session end

Nav cut from seven items to five. Glossary, the claims checker, the
monthly digest and the questions page all retired into the pages that
needed them, with twelve definitions wired inline. A fatal JavaScript
syntax error in chain-comparer that had killed the entire tool in every
browser since it shipped. A claims-versus-measured table on that same page
that had never rendered because its container was never in the markup. A
new demo showing Argent compiling to Silverscript to Kaspa script. Four
demos restructured to fit one screen. Card previews scaling instead of
cropping.

### Still owed

The stylesheet is still around 9,000 lines. The demos index is 3.2 MB
across 77 requests. Terms used with no explanation anywhere: Crescendo,
TangVM, Hashdag, RTD, netsplit-resilient, TN10, TN12, the KCC codes. A
full cold read has never completed; two attempts produced false reports of
site-wide breakage caused by browser contention, and both were disproven.

## Agents in flight at compaction, 23 August 2026

Eight running, cap ten. Each is forbidden from git entirely; one
committer only. Reports land in files at the repo root.

- Stylesheet shrink toward 6,000 lines. A previous attempt broke the
  mobile nav and theme toggle and was reverted; the proof bar is an empty
  computed-style diff plus a passing visual guardrail audit.
- The eight terms used with no explanation anywhere: Crescendo, TangVM,
  Hashdag, RTD, netsplit-resilient, TN10, TN12, the KCC codes. Wired at
  first use per page via the term-def reveal. TangVM may be unsourceable;
  no definition is better than a wrong one.
- Cold read by an agent with no site knowledge, forbidden from using its
  own Kaspa knowledge to fill gaps. Writes COLD-READ.md.
- Cross-read for contradictions. Wrote CROSS-READ.md, now being acted on.
- Demos index: every card must show a live, moving, uncropped preview.
  Retargeted from performance to correctness on the owner's instruction
  that right matters more than fast.
- Fixing everything in CROSS-READ.md.
- Fixing everything real in BREAK.md.

### Findings already acted on

llms.txt claimed completeness while missing five demos; all added.
chain-comparer contradicted its own hash rate in the same file, 0.312
against its data row's 0.30269; prose corrected to 0.303. SilverScript
capitalization corrected on two pages.

### Findings disproven, do not chase

Embedded demos do not clip; the resize script matches box to content
exactly. Discrete buttons across the site do work; two agents reported
otherwise from browsers another agent was re-navigating.

### The scope the owner considers outstanding

Three things, not a growing list: the stylesheet at 9,000 lines, the
demos index at 3.2 MB, and the eight undefined terms. Everything else on
any internal list is bookkeeping, not his scope.

## A stale worktree is measuring against the wrong file

`.claude/worktrees/vigorous-kowalevski-9a48e7/` holds its own copy of the
repo including `styles.css`. An agent measured that copy, reported the
stylesheet at 5,892 lines, and refused to do its task on the grounds that
the brief's numbers were stale. The repo root is 9,105 lines.

Any agent doing measurement work must confirm it is at the repo root.
Checking a premise is right; checking it in the wrong directory produces
a confident wrong answer, which is worse than no answer.

Remove the worktree once nothing depends on it.
