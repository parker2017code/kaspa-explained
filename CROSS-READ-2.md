# Cross-read 2: post demo-merge adversarial pass

Read solo, no subagents, per the coordinator's correction. Other agents were
writing to this tree while this pass ran (`git status` showed
`argent-explained.html`, `build-on-kaspa.html`, `kaspa-mining.html`,
`kaspa-origin-story.html`, `crypto-from-scratch.html`, and more, modified and
uncommitted at read time), so findings below reflect the file content at the
moment each section was read, not a single frozen snapshot. Line numbers can
drift if another agent lands a change first; the quoted text is the
anchor to re-find a passage if a line number stops matching.

Live-site reading was attempted (`kaspaexplained.com`) but the shared browser
tab was reclaimed mid-task before a page loaded, consistent with the brief's
warning that this happens repeatedly today. Every finding below is sourced
from the repository files on disk, which is what the live site serves
statically; no finding depends on browser-only rendering behavior.

Coverage, honestly stated: full read of the demo seams (prose immediately
around each embed, not the CSS/JS bodies) on `kaspa-mining.html` (4 demos),
`what-is-kaspa.html` (4 demos), `kips.html` (2 demos, `parameterless`
skipped per instruction since it is being rebuilt), `utxo-vs-accounts.html`
(2 demos), `argent-explained.html`, `build-on-kaspa.html`,
`kaspa-origin-story.html`, `why-kaspa-matters.html`, and `skeptical-case.html`.
Full-text grep sweeps across all 37 root pages over 2 KB plus all 18 files in
`demos/` for casing, status language, and the concept-to-name questions in
the brief. Not read line-by-line: `model-picker.html`, `chain-comparer.html`
(read its embedded JSON data blob and caveats object, not its UI copy),
`sources.html`, `the-instrument.html`, `kaspa-origin-story.html`'s
`dag-time` demo specifically (mapped but not read closely), and none of the
CSS or JS bodies of any embedded demo (their visible captions, labels, and
lede paragraphs were read; their internal comments and formulas were not).

## Ranked findings

### 1. Kaspa's and Solana's own measured TPS disagree across three pages, one without sourcing (high confusion)

Three different figures for Kaspa's actual measured throughput exist on the
live site simultaneously, and two of them are unsourced against the third:

- `chain-comparer.html`'s embedded data blob: `"tps":0.949` for Kaspa,
  `"tps":2032.805` for Solana, both stamped as `tps_sustained`, "recomputed
  2026-08-22" from live RPC 30-day means, with the caveat text spelling out
  the exact endpoint and window for each.
- `kaspa-mining.html` (line ~1623, inside the `fee-market` demo's
  "Traffic scenarios" sourcing block): "Kaspa's own 0.894 tx/s... Solana's
  figure (1,579.6 tx/s)... a one-day snapshot, not a 30-day mean," sourced to
  `CLAIMS.yml`'s `fees_vs_subsidy_2026_08_22` entry and explicitly labeled as
  a different basis (one day, not 30) from chain-comparer's number.
- `skeptical-case.html` (line 115): "roughly 12,000 times Kaspa's own
  measured 0.895 TPS... higher than any sustained rate in this site's own
  comparison data, including Solana's 1,175." No stated date, no stated
  window (one-day snapshot or 30-day mean), and the number matches neither
  of the other two sources it implicitly claims to summarize. 0.895 is close
  enough to kaspa-mining's 0.894 to read as the same measurement rounded
  differently, but Solana's 1,175 matches neither kaspa-mining's 1,579.6 nor
  chain-comparer's 2032.805. It is a fourth number nothing else on the site
  produces.

Winner: kaspa-mining.html's approach, which names its date, names its window
(one day vs. 30-day mean), and cites the exact CLAIMS.yml entry, is the
model every other page citing Kaspa's or a peer's actual throughput should
match. `skeptical-case.html`'s Solana figure needs to be re-derived from
either `chain-comparer`'s current 30-day figure or the same
`CLAIMS.yml`/one-day basis kaspa-mining uses, and stamped with which one it
is. This is the same defect class the brief names ("a page contradicted its
own hash rate figure"), except spread across three pages instead of within
one file, which makes it harder for a single editor to catch by reading any
one page alone.

### 2. Eight links still point at retired `/demos/<name>` URLs instead of the new anchor destinations (medium confusion, contradicts the site's own stated goal)

`PLAN-DEMO-MERGE.md` states the target plainly: "All 18 demo URLs stop being
destinations and need stubs pointing at the target page's anchor." The stubs
exist and redirect correctly (verified: `demos/attack-cost.html` ->
`/kaspa-mining#attack-cost`, `demos/fair-launch.html` ->
`/kaspa-origin-story#fair-launch-demo`, `demos/confirmation-risk.html` ->
`/why-kaspa-matters#confirmation-risk-demo`, all working meta-refresh plus
canonical). But the content pages themselves were not all updated to point
directly at the new destination, so a reader still takes the redirect hop
the merge was supposed to eliminate:

- `status.html:684` links `/demos/parameterless` (should be
  `/kips#parameterless`, once that section is rebuilt).
- `status.html:692` links `/demos/shared-state` (should be
  `/utxo-vs-accounts#shared-state`, per the merge's own mapping table).
- `kips.html:332` links `/demos/parameterless` (same page, same fix
  once rebuilt).
- `kips.html:497` links `/demos/confirmation-risk` (should be
  `/why-kaspa-matters#confirmation-risk-demo`).
- `kips.html:833` links `/demos/covenant-breaker` (should be
  `/build-on-kaspa#covenant-breaker-demo`).
- `skeptical-case.html:117` links `/demos/attack-cost` (should be
  `/kaspa-mining#attack-cost`) — inconsistent with the SAME page's own
  line 178, which already correctly links `/kaspa-mining#attack-cost`
  directly. One page links the same demo two different ways.
- `skeptical-case.html:137` links `/demos/fair-launch` (should be
  `/kaspa-origin-story#fair-launch-demo`).
- `what-is-kaspa.html:1626` links `/demos/confirmation-risk` (should be
  `/why-kaspa-matters#confirmation-risk-demo`) — this is the "what-is-kaspa
  keeps a link" case the merge plan explicitly calls for, just pointed at
  the old address instead of the new one.

Winner: the direct anchor URL in every case; that is what the merge plan
itself specifies, and `skeptical-case.html` already demonstrates the correct
form on its own attack-cost link at line 178, so the fix pattern already
exists on the site to copy from.

### 3. `emission-schedule` demo sits inside a "cycle model" `<details>` block whose surrounding argument is about hot/cold ASIC phases, not emission (low-medium confusion, structural not factual)

On `kaspa-mining.html`, `<details id="emission-schedule">` opens under the
heading "Coins and ASICs heat and cool at different times" and a lede
crediting a named community figure's "Carnot-engine model, four phases." The
four-phase cycle content (hot/cold coin, hot/cold ASIC) runs for several
paragraphs, then pivots via one bridging sentence ("Kaspa's fast emission
schedule moves supply toward its cap quickly...") into the fully separate
emission-schedule demo, which teaches a different claim entirely (no
emission cliff, DAA-keyed step-downs). The bridge sentence does real work,
so this is not a broken seam, but a reader who opens "Four phases" expecting
the hot/cold cycle content gets an emission calculator appended to it under
the same `<summary>` label, and the section's own preview text ("Phase-by-
phase breakdown, plus the emission-schedule demo") is the only place that
warns two different subjects are coming. Consider giving the emission demo
its own `<details>` sibling rather than nesting it inside the cycle-model
one, so the summary label matches what is inside it.

### 4. `SilverScript` casing bug from the prior audit appears fixed; confirm and close it

The brief names "SilverScript against Silverscript... wrong on two pages
before" as a known defect class to check. A full-site grep for
`[Ss]ilver[Ss]cript` across all 37 root pages plus `demos/` found zero
instances of the old "SilverScript" (mid-word capital S) form. Every visible
occurrence is "Silverscript" (one leading capital), consistent across
`argent-explained.html`, `status.html`, `build-on-kaspa.html`,
`kaspa-origin-story.html`, `what-is-kaspa.html`, `why-kaspa-matters.html`,
and `sources.html`. Lowercase "silverscript" only appears inside `id=` and
`aria-describedby=` attribute values (e.g. `id="silverscript-def-wkm"`),
which is normal HTML-id casing, not a prose defect. Recorded here so the
next auditor does not re-flag it as new; it is resolved, not outstanding.

### 5. DAGKnight, vProgs, and Toccata status language is consistent everywhere checked

Checked against the coordinator's stated ground truth (Toccata live on
mainnet as of 30 June 2026, DAGKnight KIP-2 Status: Proposed and not on
mainnet, vProgs not on testnet) across `status.html`, `kips.html`,
`what-is-kaspa.html`, `why-kaspa-matters.html`, `start-here.html`,
`skeptical-case.html`, `build-on-kaspa.html`, `utxo-vs-accounts.html`,
`chain-comparer.html`'s caveat text, and `index.html`. Every instance found
uses "Research" for DAGKnight, "Roadmap" for vProgs, and "Live" for Toccata,
with the same activation figure repeated verbatim in three places (DAA score
474,165,565, roughly 30 June 2026 16:15 UTC) in `status.html`,
`what-is-kaspa.html`, and `why-kaspa-matters.html`. No page found calling
DAGKnight live, vProgs shipped, or Toccata anything but activated. This is
the strongest area of the site right now; no action needed.

### 6. Terminology census: no defect found on `mergeset`, `blue score`/`blue work`, or `DAA score` casing

Built the concept-to-name table the coordinator asked for, checked against
every root page over 2 KB plus `demos/`:

| Concept | Names found on site | Winner | Note |
|---|---|---|---|
| The set of past blocks a new block pulls into its view | `mergeset` (one word), consistently, in `sources.html`, `kaspa-origin-story.html`, `what-is-kaspa.html`, `utxo-vs-accounts.html`, `kaspa-mining.html`; `mergeSet` camelCase only inside JavaScript identifiers in `what-is-kaspa.html` | `mergeset` | No page uses the two-word "merge set" the brief flagged as a risk; that risk did not materialize. camelCase is code, not prose, and does not count against consistency. |
| Accumulated PoW weight carried by blue blocks, used to pick the selected parent | `blue work`, defined identically in `what-is-kaspa.html`'s and `why-kaspa-matters.html`'s tooltip spans ("Accumulated proof-of-work weight carried by blue blocks") | `blue work` | `blue score` appears exactly twice sitewide, both as the literal title of an external Learn Kaspa article link (`sources.html`) or inside a hidden search-index keyword blob (`search.html`), never in visible prose describing the concept. Not a live conflation; leave as is. |
| DAA score | `DAA score` (55 instances, the standard), `DAA Score` (1, inside a quoted external article title, not site prose), `DAA-score`/`daa-score` (5, all inside `id=`/anchor slugs, not prose), `daa score` lowercase (1, inside a hidden search-index blob) | `DAA score` | Already the overwhelming standard; no visible-prose deviation found. |
| GHOSTDAG | `GHOSTDAG` (2 instances all-caps in visible prose spot-checked) vs. lowercase `ghostdag` (4, all inside URL slugs/anchors like `id="ghostdag"` or file paths) | `GHOSTDAG` | Casing looks consistent in prose; the lowercase hits are structural (ids, slugs), not a prose defect. Worth a second, wider pass since this table's `GHOSTDAG` sample was small relative to its true prose frequency across the site — flagging as unverified-at-scale rather than clean. |
| Argent (the app-composition system) | `Argent` (2, sentence-initial) vs. `argent` (9, all confirmed mid-sentence and grammatically lowercase because they are not the start of a sentence — English capitalization, not a proper-noun casing bug) | `Argent` | No defect: checked each mid-sentence lowercase hit and none of them is actually the product name miscapitalized; false alarm from the raw grep count alone. |

### 7. Not independently re-verified: whether `kaspa-mining.html`'s fee-market demo and `what-is-kaspa.html`'s mass-calculator demo actually agree on the numbers `kaspa-mining.html` claims they share

`kaspa-mining.html` (line 1602) states as fact: "This demo's three
transaction shapes plug the same fixed inputs... into the identical formulas
as [mass-calculator], so the two demos agree on every number: a plain
payment costs 1,624 mass, a covenant costs 5,660, and a ZK-proof-style
transaction... costs 16,528." These three numbers do not appear as literal
text anywhere in `what-is-kaspa.html`; both demos compute mass live from
shared formulas in client-side JavaScript rather than hardcoding presets, so
confirming the claim needs either running both demos with matching inputs in
a browser or diffing the two demos' mass-formula JavaScript byte for byte,
neither of which this pass did. Flagging as an open item rather than a
finding: the claim is plausible (both files' `README.md`/comment
provenance point at the same rusty-kaspa source, `consensus/core/src/mass/
mod.rs`) but unverified by this read.

## What this pass did not reach

`dag-time` on `kaspa-origin-story.html`, `argent-pipeline` on
`argent-explained.html` beyond its opening paragraph, `zk-boundary` and
`covenant-breaker` demo internals on `build-on-kaspa.html` beyond their
seam prose, `node-cost`'s and `live-network`'s own JS/output tables, and the
`utxo-vs-accounts.html` self-hosted `utxo-vs-accounts` demo (as opposed to
its `shared-state` demo, which was read). None of the 33 stub/redirect
pages under 2 KB were opened past their `<meta refresh>` and canonical tag
except `toccata-explained.html`, `toccata-status.html`, and `about.html`,
which the brief named explicitly (all three verified: they redirect
correctly and their target pages carry the content they claim to have
absorbed). `llms.txt` and `agent-index.json` were not read; the merge plan
flags both as carrying stale `/demos/` references that need a synchronized
update, and that update was out of scope for a reading-only pass.
