# Comprehension audit: the high school test

Graded cold, as the subject the standard names: finished high school, knows
roughly what a cryptocurrency is, does not know UTXO, DAG, GHOSTDAG,
DAGKnight, covenant, mergeset, blue work, DAA score, mass, finality depth,
pruning depth, or confirmation. Has not read the surrounding article. Tested
at 390 width in an iframe harness (media queries respond to iframe width, a
faithful mobile render) and spot-checked at 1280, both themes, via the
`?theme=dark`/`?theme=light` URL param the site itself supports. The
`what-is-kaspa.html` live-network demo could not be exercised end to end:
this sandbox has no route to `api.kaspa.org`, so its own honest
"can't reach the public network" state is what rendered instead of live
blocks. Graded on its static structure and copy instead, flagged below.

## Table

| # | Page | Demo | Verdict | One fix |
|---|------|------|---------|---------|
| 1 | kaspa-mining.html | Attack cost calculator | **FAIL** | Default to Kaspa only with the duration slider as the one control; move the other-chain picker behind a secondary toggle. |
| 2 | kaspa-mining.html | Emission schedule | PASS | — |
| 3 | kaspa-mining.html | Fee market | **FAIL** | Delete "the mempool samples by weight, not a strict fee sort" from the visible payoff; keep only the plain fee-vs-subsidy sentence. |
| 4 | kaspa-mining.html | Node cost | **FAIL** | Delete the finality/pruning boundary card and the hours-since-a-block panel from the surface; leave only the one Kaspa-vs-other-chains storage bar. |
| 5 | what-is-kaspa.html | Collision simulator | PASS | — |
| 6 | what-is-kaspa.html | GHOSTDAG demo | PASS | — |
| 7 | what-is-kaspa.html | Mass calculator | **FAIL** | Collapse the three named mass bars (compute/storage/transient) into one number, "transactions that fit in a block"; move the three-way breakdown to an advanced disclosure. |
| 8 | what-is-kaspa.html | Live network feed | PASS (structure only; live fetch untestable here) | — |
| 9 | kips.html | Supply-split demo | PASS | — |
| 10 | utxo-vs-accounts.html | Who wins the same slot | **FAIL** | Make the coin-count/total line refresh on every action; it currently freezes at the starting total while the balance tile updates, so two numbers on screen disagree. |
| 11 | utxo-vs-accounts.html | Race for the exact same data | **FAIL** | Cut the "vProgs" sub-panel's abstract caption ("exit-style pattern," "sovereignty") or move that whole toggle behind a details; keep only the clear "Grab it" race on the surface. |
| 12 | build-on-kaspa.html | Attack a covenant vault | PASS | — |
| 13 | build-on-kaspa.html | What a proof can and can't verify | PASS | — |
| 14 | why-kaspa-matters.html | Confirmation risk | **FAIL** | Wire the per-chain readout list to update on every slider move; it currently freezes at the starting values while the sentence below it updates, so two numbers for the same thing visibly disagree. |
| 15 | argent-explained.html | Argent → Silverscript → Kaspa Script pipeline | **FAIL** | Replace the line-by-line code comparison with one conceptual number ("how much of this did Argent actually have to invent"); move the code itself to a dev-only disclosure. |
| 16 | kaspa-origin-story.html | Fair launch chart | PASS | — |
| 17 | kaspa-origin-story.html | DAA score / date converter | **FAIL** | Make the plain-English date the headline readout, not the raw DAA score; delete the timestamp-cheating sub-mechanic from the surface entirely. |

**9 fail, 8 pass.**

---

## 1. Attack cost calculator — kaspa-mining.html — FAIL

1. **First impression:** "What an attack would cost." Reads as a cost
   calculator for attacking a cryptocurrency network. Clear enough.
2. **What to touch:** Three competing controls arrive at once with no
   visual lead: a duration slider, six chain buttons, and a two-way
   rent/buy toggle. Nothing marks one as primary over the others.
3. **Touch it:** Moving the slider scales the dollar figure correctly
   ($3.15K at one minute to $4.54M at one day for Bitcoin) — real,
   legible change. But switching the chain to **Kaspa**, the subject of
   the entire site, returns "not priceable" with a note about missing
   rental markets. The one chain a first-time reader came to learn about
   is the one that dead-ends.
4. **Words not understood:** NiceHash, rentable capacity, hash rate,
   proof-of-work / proof-of-stake (used as an unglossed two-way label:
   "Four proof-of-work chains and two proof-of-stake chains"), EH/s (in
   the Bitcoin/Litecoin compare note), "the network secures" (market cap,
   unexplained).
5. **Numbers:** Dollar cost — calculated, unit clear (USD), but *of what*
   requires knowing "renting hash power" is a real market. Percent of
   "network secures" — calculated, but the denominator concept
   (aggregate coin value standing in for a security budget) isn't
   established anywhere on screen.
6. **Verdict: FAIL.** Three simultaneous controls with no lead, and the
   site's own coin returns a non-answer.
7. **Fix:** Default to Kaspa only with the duration slider as the single
   visible control. Move the other-chain picker into a secondary "compare
   to" toggle, so the first thing on screen is the coin the reader came
   for, and it has an answer.

## 2. Emission schedule — kaspa-mining.html — PASS

1. **First impression:** "How fast the new supply shrinks." A supply
   curve you can scrub.
2. **What to touch:** One slider ("How far in the future"), unmissable.
   A secondary "Around today / All time" toggle sits above it, clearly
   subordinate by size.
3. **Touch it:** Dragging forward updates the big number, the sentence,
   and the bar chart together: "3.3 years from now, each block pays about
   0.22 KAS, 90.08% less than today." Cause and effect are obvious.
4. **Words not understood:** None on the visible surface. "Genesis"
   appears only after switching to "All time" and is used the way a
   reader would guess ("the start").
5. **Numbers:** KAS per block (calculated from a fixed schedule), percent
   of maximum supply issued (calculated), both tagged **MEASURED** or
   **PROJECTED** so the reader knows which is real and which is a
   forecast — exactly the "measured vs. calculated" distinction the
   standard asks for.
6. **Verdict: PASS.**

## 3. Fee market — kaspa-mining.html — FAIL

1. **First impression:** "The fee market." Kaspa's blocks are mostly
   empty; load one with traffic and see what happens to fees. Clear.
2. **What to touch:** One slider (transactions per second) plus five
   preset chips is a reasonable "pick a scenario, then fine-tune"
   pattern, and the site correctly hides shape/block-rate/fee/price/time
   behind an "Advanced" disclosure by default — good restraint. But on a
   390px screen the preset row is wider than the viewport and cuts off
   mid-label ("Bit...") with no visible scroll cue, so a phone reader
   doesn't know there's more to see.
3. **Touch it:** Clicking "Fill this block exactly" produces a legible
   plain sentence: "Kaspa earns $16,711/day in fees, about 3.5× below the
   $58,631/day subsidy." That part works. But the block-grid caption
   right next to it reads "So did 29 that paid less: the mempool samples
   by weight, not a strict fee sort" — unexplained jargon sitting on the
   primary, not the advanced, panel.
4. **Words not understood:** mempool, weight (as used here), mass, slots
   (used loosely for "room in a block").
5. **Numbers:** tx/s (a slider input, not measured), capacity (calculated
   from mass limits, unlabeled as such), fees/day and subsidy/day
   (calculated from a real snapshot, at least dated).
6. **Verdict: FAIL.** The plain payoff sentence would pass alone; the
   mempool aside next to it doesn't.
7. **Fix:** Cut the "mempool samples by weight" sentence from the visible
   payoff. It explains a mechanism the reader doesn't need to know the
   headline point.

## 4. Node cost — kaspa-mining.html — FAIL

1. **First impression:** "What a node costs." Storage comparison across
   chains — clear at a glance.
2. **What to touch:** Four separate interactive panels sit stacked with
   no hierarchy: a chain-toggle bar chart, a "guess before you look"
   button pair, an "hours since a block" slider with a diagram, and a
   "full vs. archival" disclosure. No single obvious first action.
3. **Touch it:** Moving the hours slider to 30 produces: "Kept: 1,080,000
   blocks deep, past finality. Refused outright, but kept anyway as
   safety margin." A first-time reader cannot parse this sentence at
   all — it assumes "finality" and "refused outright" already mean
   something.
4. **Words not understood:** finality, pruning, MuHash, archival,
   posterity chain, UTXO commitment, coinbase transaction, DAA score —
   and this is the one demo on the site where **finality** and
   **pruning** appear as raw, permanently visible labels (a "boundary
   card" panel, not behind any disclosure): "Finality: 432,000 blocks, 12
   hours" / "Pruning: 1,080,000 blocks, 30 hours." These are two of the
   terms the standard explicitly names as things the subject does not
   know, shown with no gloss, on the primary surface.
5. **Numbers:** GB by chain (measured/sourced, reasonably clear unit).
   Block counts and hour counts on the finality/pruning card — no unit
   problem, but no explanation of what "finality" or "pruning" *do*
   accompanies them.
6. **Verdict: FAIL.** Explicitly-banned jargon on the always-visible
   surface, plus four competing panels.
7. **Fix:** Delete the finality/pruning boundary card and the
   hours-since-a-block mechanism panel from the surface entirely (move to
   a details, or cut). Leave only the single "Kaspa: 50 GB vs. Bitcoin
   758 GB, Ethereum 2 TB..." bar comparison, which is legible on its own.

## 5. Collision simulator — what-is-kaspa.html — PASS

1. **First impression:** Two panels, "Single chain" vs. "BlockDAG,"
   each showing recent blocks colored kept/discarded. Reads as "here's
   what happens when blocks arrive fast."
2. **What to touch:** One large primary slider ("How fast blocks are
   found"), visually distinct from the smaller secondary delay slider
   below it — real hierarchy, not just two equal controls.
3. **Touch it:** Setting the rate to Bitcoin's pace: "0% discarded."
   Setting it to Kaspa's pace: "about 83% discarded... The blockDAG keeps
   all of it." The before/after is immediate and the point (parallel
   blocks get thrown away on a single chain, kept on Kaspa's) lands
   without needing the term "blockDAG" defined anywhere.
4. **Words not understood:** "BlockDAG" is used as a panel label, but the
   demo teaches its meaning by contrast rather than requiring the reader
   already know it — a legitimate "show, don't define" move.
5. **Numbers:** percent discarded (calculated, live-updating, clearly a
   running tally per its own caption), block rate and delay in plain
   units (minutes/seconds, not raw block-time constants).
6. **Verdict: PASS.**

## 6. GHOSTDAG demo — what-is-kaspa.html — PASS

1. **First impression:** "Blocks arrive in parallel... Advance time and
   watch how many arrive together." Sets up the action clearly.
2. **What to touch:** One button, "Advance time" — unambiguous. A
   secondary "force a count" row and two "Advanced" disclosures sit
   visibly subordinate.
3. **Touch it:** Repeated clicks produce plain outcomes: "4 blocks
   arrived at once, 3 beside each of them. That is still within the cap
   of k = 3, so all 4 of them count," then later "5 blocks arrived...
   over the cap of k = 3, so 1 of them got locked out." Cause and effect
   are legible even without knowing what "k" formally means — the
   sentence itself explains its role as a cap.
4. **Words not understood:** "k" is used as a bare variable with only a
   functional gloss ("the cap"), not defined by name. Minor; the
   sentence still parses.
5. **Numbers:** count of blocks arrived (deterministic per click, not
   random-feeling), the cap value k=3 (a parameter, clearly labeled as a
   cap).
6. **Verdict: PASS.**

## 7. Mass calculator — what-is-kaspa.html — FAIL

1. **First impression:** The intro sentence alone is a wall: "Kaspa
   doesn't charge by byte count alone. Every transaction is measured on
   three limits, compute, storage, and transient (proof data), and
   charged by whichever is largest, never the sum." A first-time reader
   loses the thread in the first sentence.
2. **What to touch:** Four preset buttons plus four sliders (inputs,
   outputs, amount, payload) — no single lead control.
3. **Touch it:** Moving sliders changes three bars: "Compute mass,"
   "Storage mass," "Transient mass," each shown as "N / 500,000" with a
   "binding" tag on whichever applies. The numbers move, but a reader
   cannot tell what they're numbers *of* — "mass" is a made-up Kaspa
   accounting unit, not bytes, not explained on the surface.
4. **Words not understood:** mass, compute mass, storage mass, transient
   mass, binding, TPS (used as an abbreviation without expansion nearby).
5. **Numbers:** three mass totals against fixed limits — all calculated,
   none has a real-world unit a reader could hold onto ("500,000" of
   what?). TPS at 10 blocks/second — calculated, at least labeled.
6. **Verdict: FAIL.** This is the demo the standard's own list of unknown
   terms (mass, among others) names directly, and it's on the surface,
   not behind a disclosure.
7. **Fix:** Collapse the three named mass bars into one number: "N of
   this kind of transaction fit in a block." Move the compute/storage/
   transient breakdown into an advanced disclosure for readers who want
   it.

## 8. Live network feed — what-is-kaspa.html — PASS (structure only)

Live fetch could not be exercised: this sandbox has no path to
`api.kaspa.org`, and the widget's own honest fallback ("Can't reach the
public network right now... nothing on this page is invented while it
waits") is what rendered. Graded on copy and structure.

1. **First impression:** "– blocks racing for the same spot right now.
   Kaspa doesn't make them wait in line." Framing is plain even before
   data loads.
2. **What to touch:** One button, Pause. This is a watch-and-read demo,
   not a manipulate demo, which is a legitimate variation per house
   style.
3. **Touch it (by source):** Each arriving block renders as "Empty
   block" or "N real transfers" — plain language for the main label.
   Occasional "covenant" or "app: ciph_msg" pills are rare secondary
   tags, not blocking comprehension of the main feed.
4. **Words not understood:** "covenant" and "app: ciph_msg" tags, when
   they appear, are unglossed, but they are the exception rather than the
   rule in the feed.
5. **Numbers:** the payoff sentence, "Kaspa targets 10 new blocks every
   second. Most of what you're watching arrive is a block holding
   exactly one transaction: the miner paying itself," is plain and
   concrete once data is flowing.
6. **Verdict: PASS**, on structure. Flagging that live behavior is
   unverified here is a caveat, not a separate failure.

## 9. Supply-split demo — kips.html — PASS

(The other kips.html demo, parameterless-demo, was excluded per
instructions — it is being rebuilt.)

1. **First impression:** "You and Sam hold the same token. Update just
   one of you, and that stops being true, for good." A concrete
   two-person story, immediately legible.
2. **What to touch:** One button, "Update Sam's coins," that becomes
   "Pay Sam 2 coins" on the next click. Single, obvious progression.
3. **Touch it:** Click one: "Sam's coins now carry extra state yours
   don't." Click two: "**Refused.** Your coins and Sam's just became two
   separate, permanently unmergeable supplies of the same named token."
   The consequence is stated in plain English and the button visibly
   disables.
4. **Words not understood:** "KCC-0020" is named but immediately glossed
   in the same sentence ("lets an issuer update some holders and skip
   everyone else"). "Extra state" is the only unglossed phrase, and it's
   load-bearing enough to be a minor deduction, not a failure.
5. **Numbers:** none load-bearing; this demo is entirely narrative.
6. **Verdict: PASS.**

## 10. Who wins the same slot — utxo-vs-accounts.html — FAIL

1. **First impression:** Two panels, "Same account balance" and UTXO
   coins, with a prompt to "Pick a move." Clear enough as a
   side-by-side comparison.
2. **What to touch:** Four buttons (Pay a little / Pay a lot / Combine /
   Split) with no visual lead — four equally-weighted options.
3. **Touch it:** Clicking "Pay a little" correctly drops the account
   balance from 1,240 to 900, and correctly shows one coin consumed and
   a new 160 KAS "change" coin appear in the UTXO panel — a genuinely
   good visual of the core lesson. But the line right below it, "4
   coins, 1,240 KAS total," **does not update** — it still reports the
   old total even though the tile above it and the coin row both changed.
   A reader staring at the screen sees two different totals for the same
   wallet.
4. **Words not understood:** none serious; "change" (as in change coin)
   is used correctly and is common enough.
5. **Numbers:** the balance tile is calculated and correct; the coin-count
   caption is calculated and **wrong** (stale).
6. **Verdict: FAIL.** A demo whose own headline number contradicts
   itself fails regardless of how clear the underlying idea is.
7. **Fix:** Make the coin-count/total caption refresh on every action,
   the same way the balance tile already does.

## 11. Race for the exact same data — utxo-vs-accounts.html — FAIL

1. **First impression:** "One shared slot. Both want it now." Reads as a
   race for one spot.
2. **What to touch:** One button, "Grab it" — clear for the top panel.
3. **Touch it:** "The rival won. Their transaction reached the slot
   first, that is the only reason. Yours is rejected outright, not
   merged, not queued." Plain, concrete, legible — this half of the demo
   passes on its own.
4. **Words not understood:** the demo doesn't stop there. A second,
   bundled panel below it toggles "Same transaction / Many users /
   vProgs," and selecting "vProgs" produces: "vProgs (proposed, not
   running on mainnet) targets exactly that many-user gap... reaching for
   that live, synchronous interaction costs standalone independence...
   that give-and-take, not a free upgrade, is what 'sovereignty' means
   here." This is dense, abstract, and assumes context the surface never
   supplies. "vProgs" itself is never expanded.
5. **Numbers:** none in either panel; both are narrative/status-based.
6. **Verdict: FAIL.** Two demos are stapled into one widget, and the
   second one fails badly even though the first is genuinely good.
7. **Fix:** Cut the vProgs caption down to something a first-time reader
   can parse, or move that whole toggle behind a details. Keep only the
   clear "Grab it" race on the surface.

## 12. Attack a covenant vault — build-on-kaspa.html — PASS

1. **First impression:** "This vault holds 10,000 KAS behind four rules.
   Get any of it out without satisfying all four." A game with a clear
   goal.
2. **What to touch:** Five preset attack buttons are shown first, above
   the manual fields ("Start from one of these, or set up your own
   attempt") — genuinely good ordering. A wall of manual inputs (amount,
   destination, elapsed time) exists, but it's secondary and below the
   presets, not competing for first attention.
3. **Touch it:** Clicking "Send it to my own address" returns: "**Blocked:
   a normal withdrawal can only pay the vault's one payout address,
   never anywhere else.**" The code reference (`require(tx.outputSpkHash...
   )`) is a visually separate, smaller secondary line, not mixed into the
   sentence — reasonable handling of necessary code evidence.
4. **Words not understood:** "covenant," "KIP-17," "KIP-20" appear in a
   status line but are links/footnotes, not required to understand a
   preset's outcome. "DAA score" appears as a manual-field label but is
   glossed in the same line ("DAA score, Kaspa's block counter") — good
   practice, followed correctly here.
5. **Numbers:** KAS amounts (clear unit), DAA score for elapsed time
   (glossed and given an approximate-minutes hint alongside it).
6. **Verdict: PASS.**

## 13. What a proof can and can't verify — build-on-kaspa.html — PASS

1. **First impression:** "KIP-16's proof check confirms a proof is
   valid. It says nothing about where its inputs came from." Sets up a
   clear contrast to come.
2. **What to touch:** One segmented control (three claim types) plus one
   button, "Generate proof" — the cleanest single-primary-action layout
   on the site.
3. **Touch it:** Proving "I know a number that, doubled, equals 84":
   "**Proof accepted.** Everything the claim needed was already inside
   the proof's own inputs." Proving "Today's real BTC price": "**Refused
   at the last step.** The proof correctly checked its own arithmetic.
   It has no way to check whether $61,240 is the real, current price."
   The contrast (self-contained math vs. a fact about the world) lands
   without the reader ever needing to know what a zero-knowledge proof
   technically is.
4. **Words not understood:** none load-bearing on the surface; the
   deep-dive (not required) is where "verifying key," "public inputs,"
   and "oracle" live.
5. **Numbers:** the "$61,240" price figure is a prop, clearly a stand-in
   inside a made-up claim, not presented as real data.
6. **Verdict: PASS.**

## 14. Confirmation risk — why-kaspa-matters.html — FAIL

1. **First impression:** A slider labeled "How much mining power the
   attacker controls," with a chart below. Reads as "how long until a
   payment is safe."
2. **What to touch:** One primary slider, one secondary risk-tolerance
   pill group (relaxed/normal/strict) — good hierarchy.
3. **Touch it:** Moving the slider from 10% to 49% updates the sentence
   correctly: "At 49% attacker strength, Kaspa becomes safe in 9 min,
   while Bitcoin needs 36 d." That sentence alone would pass. But the
   list directly above it, listing each chain's wait time, **does not
   update** — it still reads "Kaspa becomes safe 400 ms" at 10%'s value
   even after moving the slider to 49%. Two numbers for the same fact
   disagree on screen at the same time.
4. **Words not understood:** none serious in the primary sentence;
   "reorg," "finality," and the whitepaper formula live in the deep-dive,
   correctly hidden.
5. **Numbers:** wait time per chain — the sentence version is calculated
   and live; the list version is calculated and **stale**.
6. **Verdict: FAIL.** Same failure mode as the UTXO demo: a headline
   number the reader can see contradicts another number right next to
   it.
7. **Fix:** Wire the per-chain readout list to the same update call as
   the result sentence.

## 15. Argent → Silverscript → Kaspa Script pipeline — argent-explained.html — FAIL

1. **First impression:** Three buttons ("Ownership check," "Signature
   check," "Next coin") above three stacked code panels labeled "Argent
   · .ag," "Silverscript · .sil," and "Kaspa Script." Reads as a
   code-layer comparison tool for programmers, not a concept demo.
2. **What to touch:** The three buttons are the only real control, at
   least single and clear as an action.
3. **Touch it:** Selecting "Signature check" returns: "Nothing
   Argent-specific in this line either. It reads like ordinary
   Silverscript because it is ordinary Silverscript." This requires
   already knowing what Argent and Silverscript are and why the reader
   should care whether a line is "Argent-specific."
4. **Words not understood:** Argent, Silverscript, Kaspa Script (as
   distinct named languages), opcodes, "Ticket entry" (referenced with
   no on-widget explanation of what the running example even is).
5. **Numbers:** none.
6. **Verdict: FAIL.** This is a source-code diff viewer for three
   language layers. There is no version of "touch it, understand it in
   five seconds" available to someone who doesn't already know what a
   smart-contract language stack is.
7. **Fix:** Replace the line-by-line code comparison with one conceptual
   number or visual — e.g., "how much of this code did Argent actually
   have to invent, versus reuse" — and move the code itself into a
   developer-only disclosure.

## 16. Fair launch chart — kaspa-origin-story.html — PASS

1. **First impression:** "Every chain set a rule for who'd hold the
   first coins, at block zero. Drag the year marker to see who held
   what." Clear task.
2. **What to touch:** One slider, unambiguous.
3. **Touch it:** At genesis: "Kaspa's founders, company, and foundation
   held 0%. XRP's founders and backers already held 100% before a single
   block was mined." At year 14: "Kaspa's founders... still hold 0%.
   XRP's still hold 58%." Concrete, comparable, no math required of the
   reader.
4. **Words not understood:** none load-bearing; "premine" doesn't appear
   in the result sentence itself.
5. **Numbers:** percent held by founders/company (measured/sourced per
   chain), directly comparable across the two headline figures.
6. **Verdict: PASS.**

## 17. DAA score / date converter — kaspa-origin-story.html — FAIL

1. **First impression:** The entry point itself, "convert a DAA score to
   a date, and catch a lying timestamp," names two of the standard's own
   explicitly-banned terms before the reader has touched anything.
2. **What to touch:** A date slider, a "DAA score" number field, four
   jump-to presets, *and* a second, separate timestamp slider with an
   old/ok/future zone track — two distinct mechanisms sharing one widget,
   with no single lead.
3. **Touch it:** Moving the date slider to the far end produces a
   headline number of **521,685,565** — the raw DAA score, given no unit
   or context — with the actual human-readable answer, "→ August 24,
   2026, about 7 weeks after Toccata's mainnet activation," pushed into
   smaller secondary text below it. The one thing the reader can
   understand is subordinate to the one thing they can't.
4. **Words not understood:** DAA score, median time, Crescendo (used as
   a bare proper noun for a network upgrade), "132 seconds" tolerance
   with no explanation of what it's tolerance *for* until read against a
   paragraph of consensus-rule prose above the widget.
5. **Numbers:** the DAA score is real and measured, but shown as the
   primary, largest figure with no unit; the date conversion is
   calculated and correctly the more useful number, but demoted visually.
6. **Verdict: FAIL.**
7. **Fix:** Make the plain-English date the headline readout (swap the
   type hierarchy so the date, not the raw score, is the big number).
   Cut the timestamp-cheating sub-mechanic from the surface; it's a
   second lesson bolted onto the first and needs either its own simpler
   demo or no demo at all.

---

## Cross-cutting patterns

**Stale-number bug, seen twice, independently.** Demo 10 (utxo-vs-accounts)
and demo 14 (why-kaspa-matters) share the same failure shape: a summary
sentence updates correctly on interaction, while a nearby list or caption
does not, leaving two live-looking numbers on screen that disagree. Worth
a site-wide check for the same pattern elsewhere, since it appeared in two
unrelated demos built independently.

**Banned terms leak past their disclosures unevenly.** Some demos (GHOSTDAG,
covenant breaker) gloss a hard term at the exact point of use and it works
well. Others (node cost, mass calculator, DAA score converter) put the same
class of term — finality, pruning, mass, DAA score — directly on the
always-visible surface with no gloss at all. The site already has the
pattern that works; it just isn't applied consistently.

**Demos that bundle two lessons in one widget fail even when each half is
good.** The shared-state race (demo 11) and the DAA-score converter (demo
17) both pair one clear, passing mechanic with a second, denser one stapled
underneath. In both cases the fix is separation, not a caption.
