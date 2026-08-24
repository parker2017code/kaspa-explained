# Voice and consistency audit, 2026-08-24

Method: `git diff HEAD` against every changed file (97 files, 650 insertions),
read in full, checked against THE-BAR.md sections 1 and 2. Term-definition
tooltips (`.term-def__panel`) were extracted and diffed verbatim across every
page that carries one, since those are the clearest "same fact, two mouths"
test available. Unchanged text was not re-judged.

## Verdict

The site reads as one writer. Twenty agents touched 97 files today and the
prose does not show it: sentence rhythm, register, and the specificity habit
(numbers over adjectives, mechanism named over outcome asserted) hold steady
from `argent-explained.html` through `kaspa-mining.html` through
`utxo-vs-accounts.html`. No em dashes, no hype vocabulary, no rhetorical-
question headings, no "it's not just X, it's Y," no fake intimacy, no
performed enthusiasm turned up anywhere in today's added lines (checked by
grep across the full diff, not just spot-read). The cringe list is clean.

The one real seam class is definitional: a handful of terms got written
twice by two different agents who each thought they were defining it for the
first time. KIP, UTXO, bps, and Inter-Covenant Communication, the four terms
this task named explicitly, are verbatim-identical on every page that defines
them (checked all 8 KIP instances, all 11 UTXO instances, both bps instances,
all 3 ICC instances). Three other terms that got the same inline-definition
treatment today were not kept identical. None of the three live in a file I
can edit; all three are reported below with exact replacement text.

## Findings: one concept, two names

### DAA score — two different definitions, both written today

- `index.html`, tooltip id `daa-def-home`:
  **"Kaspa's progress marker, roughly analogous to block height."**
- `kaspa-mining.html`, tooltip id `daa-def-snapshot`:
  **"Difficulty-Adjusted Age: a running block count Kaspa consensus uses
  instead of wall-clock time, since many blocks land in parallel."**

These aren't a paraphrase of each other, they teach different things: the
index.html version never expands the acronym or says what DAA actually
tracks (difficulty-adjusted age, not raw block count), it just gestures at
"progress marker." The kaspa-mining.html version is the correct, complete
one and should win everywhere.

**Fix:** replace `index.html`'s tooltip text with kaspa-mining.html's:
"Difficulty-Adjusted Age: a running block count Kaspa consensus uses instead
of wall-clock time, since many blocks land in parallel."

I cannot make this edit: `index.html` is on the do-not-touch list.
`kaspa-mining.html` is correct as-is and needs no change.

### GHOSTDAG — two different definitions, both written today

- `index.html`, tooltip id `ghostdag-def-home`:
  **"Kaspa's live rule for ordering the blockDAG so parallel work counts."**
- `start-here.html`, tooltip id `ghostdag-def-startpage`:
  **"The rule that ranks and orders every block a miner produces, kept ones
  included, instead of discarding all but one."**

The start-here.html version does real teaching work: it names the mechanism
(rank and order) and the counterintuitive fact (kept, not discarded) in one
sentence, which is exactly the site's own standard for a definition. The
index.html version is a compressed restatement that drops the "kept instead
of discarded" payoff, which is the one fact GHOSTDAG's own name is trying to
telegraph.

**Fix:** replace `index.html`'s tooltip text with start-here.html's: "The
rule that ranks and orders every block a miner produces, kept ones included,
instead of discarding all but one."

I cannot make this edit: `index.html` is on the do-not-touch list.
`start-here.html` is not in my editable set either.

### Covenant — phrasing drift, same meaning, written today

- `argent-explained.html` (`covenant-def-argent`) and `index.html`
  (`covenant-def-home`): **"A rule attached to a coin. The network itself
  checks it on every spend, not a server's promise."** (two sentences)
- `kips.html` (`covenant-def-kips`, used twice on that page): **"A rule
  attached to a coin that the network itself checks on every spend, not a
  server's promise."** (one sentence, subordinate clause instead of a
  period)

Same fact, same words almost throughout, but the period was dropped and a
"that" spliced in. Minor on its own, but it's exactly the kind of drift the
task exists to catch: two agents typed the same definition from memory
instead of one agent typing it once.

**Fix, in `kips.html`, both occurrences of the covenant tooltip text:**
Replace:
`A rule attached to a coin that the network itself checks on every spend, not a server's promise.`
With:
`A rule attached to a coin. The network itself checks it on every spend, not a server's promise.`

I cannot make this edit: `kips.html` is not in my editable set.

## Findings: pre-existing, not from today (noted, not acted on)

Three more terms carry inconsistent tooltip text on `sources.html`, but none
of the three sentences changed in today's diff, they predate this pass and
are not a seam this round of parallel work created. Listed for completeness
since `sources.html` is one of the files I can edit, but I left them alone:
fixing text nobody touched today is outside this task's scope and the diff
method this task specifies.

- Hashdag: `sources.html` says "Sompolinsky's research site." while
  `kaspa-origin-story.html`, `status.html`, and `why-kaspa-matters.html` all
  say "Kaspa co-founder Yonatan Sompolinsky's research writing site, where he
  lays out design ideas ahead of protocol work."
- TangVM: `sources.html` says "Unbuilt oracle trigger." while `status.html`
  and `why-kaspa-matters.html` say "A proposed add-on, not yet built, that
  would let a smart contract watch outside data and trigger itself instead
  of waiting for someone to trigger it by hand."
- RTD: `sources.html` says "Real-time PoW framing." while
  `why-kaspa-matters.html` says "Hashdag's framing: Bitcoin-style PoW
  security operating in real time."

If a future pass wants these unified, the fuller versions above should win;
the `sources.html` versions read as table-cell compressions rather than
independently-considered definitions, and the site's own rule is that a
repeated fact keeps one phrasing.

Also pre-existing and not from today: TN10, TN12, and KCC each carry two
different tooltip texts (`build-on-kaspa.html`/`skeptical-case.html` share
one phrasing, `status.html` uses a different one for each). None of the
three files touched by today's diff for those specific spans, so this is a
standing gap, not a new seam. Worth a follow-up pass, not urgent for this one.

## Findings: voice drift between authors

None found. Read start-to-finish, page to page: `argent-explained.html`
(the Argent/Silverscript piece), `build-on-kaspa.html`, `kaspa-mining.html`
(long, many hands), `kaspa-origin-story.html`, `kips.html`,
`utxo-vs-accounts.html`, `what-is-kaspa.html`, and `why-kaspa-matters.html`
all hold the same register: confident, third person, evidence attached to
the claim it settles, numbers doing the work adjectives would otherwise do.
A few specific things worth naming because they're the kind of small tell
that would have shown if the seams were bad:

- `kaspa-mining.html`'s new line about the Carnot-engine framing
  ("This framing is an outside opinion, not a sourced protocol fact: an X
  account, @Themooseisloos5, cast the coin-and-ASIC cycle as a Carnot-engine
  model...") is a genuinely new sentence added today, and it reads as though
  it always belonged there: it does the site's own job of separating a
  named person's framing from a protocol fact, in the site's own voice.
- `why-kaspa-matters.html`'s KAS-price-check rewrite ("Run KAS through the
  same token-necessity question as any other coin... Whether that clears the
  bar better than another token's answer is for the reader to judge") is a
  real improvement over what it replaced ("KAS clears the token-necessity
  question more easily than most app tokens do"), which was the site
  grading its own subject rather than handing the reader the test. Today's
  version is more careful and reads as the same writer, not a more cautious
  one dropped in.
- `kaspa-mining.html`'s KCC-0020 dispute thread got a substantial update
  (Knitser's August 23 reply, the new pull request) written in the same
  dry, source-tracking voice as the original three paragraphs it extends.
  No seam visible at the join.

## Findings: summary lines and link text

Checked as a set: `demos/index.html`'s title/description/OG/Twitter block,
its H1, and its lead. All four metadata strings were changed today and kept
identical to each other (title "Demos | Kaspa Explained", description
"Kaspa Explained's eighteen interactive demos, each anchored inside the page
it backs, ranked by how much it matters." verbatim across meta, og, and
twitter tags), which satisfies the site's own one-canonical-description-
string rule. The H1 ("Every demo") and lead echo the same fact without
restating it word for word, which is the intended variety, not drift.

The ~90 redirect-stub bodies (`<p><a href="...">...</a></p>`, no
explanatory sentence) are a today-wide pattern change: every stub used to
carry a one-off sentence ("This page merged into...", "This demo now lives
inline on...") and all of them were flattened to a bare link today. That is
consistent across all ~90 files, checked by diffing a sample from
`about.html` through `where-kaspa-fits.html`, so it reads as one deliberate
decision applied uniformly, not drift. It is also, on its own terms, a
defensible simplification: a redirect stub nobody is meant to linger on
doesn't need a sentence, and cutting it removes 90 near-duplicate sentences
that were never going to be read as a set anyway.

## Files edited

None. `sources.html`, `search.html`, `demos/index.html`, `README.md`, and
`llms.txt` were already internally consistent in today's diff; `404.html`
was untouched today. The three concrete fixes above (DAA on `index.html`,
GHOSTDAG on `index.html`, covenant on `kips.html`) all live in files outside
my edit list and are reported for the next pass to apply directly.
