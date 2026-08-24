# Newcomer audit: kaspaexplained.com

Persona held for this whole audit: finished high school, knows crypto is digital
money that gets mined and involves a blockchain, knows nothing about UTXOs,
DAGs, blockDAGs, covenants, mergesets, finality, pruning, confirmations, or
consensus parameters. On a phone, mildly interested, leaves the moment a
sentence assumes something nobody told them. Tested primarily at 390px width.
Site theming confirmed directly: `data-theme="dark"` on `<html>` computes body
background `rgb(16, 14, 12)`; `data-theme="light"` computes `rgb(255, 255,
255)`. The two themes genuinely differ; dark is the default.

## The one question that matters

After the full journey (homepage, Start Here, What is Kaspa, and a cold
landing on the mining page), I can explain: Kaspa is a running
cryptocurrency, ticker KAS, that works like Bitcoin mining but does not throw
away blocks that get found close together in time — instead of one line of
blocks, many happen in parallel and a rule called GHOSTDAG sorts them into a
single agreed order, so a miner who loses the race for "first" doesn't waste
their work like they would on Bitcoin. Coins are tracked as discrete
spendable pieces (like cash notes) rather than an account balance. Supply is
capped and released on a fixed shrinking schedule, no premine, no sudden
cliff. It has features that got turned on recently (something called
Toccata) but I could not tell you what those features actually let a person
do.

That is roughly what Kaspa claims to be. I still cannot explain how any of it
actually works underneath the parallel-blocks headline, and I could not
explain a single thing about what Toccata, covenants, ZK verification, mass,
TPS, DAA score, or the mining/solo-mining machinery mean in practice. Those
sections read as a wall of unexplained names, not an explanation.

## The journey

### 1. Homepage (kaspaexplained.com), dark, 390px

What I learned, in my own words: this is an independent (not official)
explainer site about a cryptocurrency called Kaspa. The opening line said
miners "work in parallel" instead of racing for one slot, and something
called GHOSTDAG sorts it all into one history. I understood the shape of the
claim ("nobody's work is wasted") without understanding the mechanism.

Words that stopped me:
- "proof-of-work" — has a dotted-underline tooltip, tapped it: "Miners spend
  real computation to propose blocks." Fine on its own.
- "GHOSTDAG" — same hero sentence, also a tooltip: "Kaspa's live rule for
  ordering the blockDAG so parallel work counts." This definition uses
  "blockDAG," a second undefined term, to explain the first one. Tapping the
  one piece of help the page offers hands me a new unexplained word.
- "blockDAG" (teaser text under "Network overview": "PoW, blockDAG,
  GHOSTDAG, KAS.") — no tooltip on this occurrence, just a bare list of
  jargon labeling a card I have not opened yet.
- "DAA score" (in "Toccata is active: Activated at DAA score 474,165,565: L1
  covenants, ZK verification, sequencing commitments.") — no tooltip on the
  homepage. Neither is "L1," "covenants," "ZK verification," or "sequencing
  commitments." That single sentence is five unexplained terms in a row.
- "UTXO expressiveness" (card teaser) — UTXO not defined here (flagged as
  in-progress per the assignment; see note at the end).
- "mass" (Mass calculator demo) — no explanation of what "mass" means for a
  transaction.

Did I know what to do next: yes. "New to crypto? Start Here." is explicit
and I followed it. This is the one moment the page respects a true beginner.

Did I feel stupid: the Toccata sentence did — five dense terms back to back
with no help offered, right under a section literally labeled "WHAT'S LIVE
NOW," which is supposed to be for me.

### 2. Start Here (/start-here)

What I learned, in my own words: this page actually taught me something.
Taking the bank out of digital money doesn't make the problems disappear —
someone still has to guarantee a coin can't be copied or spent twice, and
Kaspa uses "keys" (a math password) and Proof of Work (real spent energy) to
do that instead of a bank's login desk. It also explained the difference
between an account balance (like a bank statement) and Kaspa's approach,
which tracks coins more like physical cash notes that get spent whole and
give change back. This was genuinely the clearest page in the whole site.

Words that stopped me:
- "hash" — actually explained well here ("a fingerprint for data, changing
  completely if one byte does"). No complaint.
- "UTXO" — named and given a plain-cash analogy, but the three-letter
  acronym itself is never spelled out or defined as a term (in progress,
  per the note).
- "DAGKnight" and "vProgs" — dropped into one sentence ("DAGKnight, vProgs,
  and native DeFi are still research or roadmap") with zero explanation and
  no link. I have no idea what either of these is, and the sentence gives me
  no way to find out.
- "GHOSTDAG" — reused again here without restating what it does beyond
  "orders them," which by this point is the fourth unexplained/undersold
  use of the word since the homepage headline.
- "10 blocks per second" is stated in plain English here, which is much
  better than the "BPS" abbreviation used elsewhere on the site.

Did I know what to do next: yes, clearly — four labeled next-step cards plus
a direct "Read what Kaspa is" button.

Did I feel stupid: no, until the DAGKnight/vProgs sentence, which felt like
being handed a shopping list of brand names I was suddenly supposed to
recognize.

### 3. What is Kaspa? (/what-is-kaspa) — the recommended next page

What I learned, in my own words: the "PLAIN MODEL" box at the top (Coin /
Security / Ownership, three short paragraphs) is genuinely readable and I
understood it: KAS is the coin, miners spend real energy to secure it,
wallets spend specific coin-pieces called UTXOs. That's a good page opening.

But then the page turns into something else entirely. Under "How this works,
and the sources," it derives block-collision odds using a Poisson process
formula (`p = 1 − e^(−λd)`), invokes a "non-paralyzable dead-time counter"
from what sounds like electronics or physics, names an "anticone size k,"
cites an academic eprint paper by author names, and compares itself to a
2013 IEEE peer-to-peer networking paper on Bitcoin fork rates — all in
running prose, all on the page a true beginner was just told to read next.
On a phone this is several unbroken screens of math and citations with no
signal that it's optional or advanced. I stopped actually reading here and
started skimming for something familiar.

Further down, a throughput table casually uses "TPS," "ZK proof," "vProg,"
"light client," "finality certificate," "oracle," and a "LIVE VS NEXT" table
that name-drops "DAGKnight" again, still with no definition anywhere on the
page.

Words that stopped me (page-specific, beyond repeats already listed):
- "Poisson process," "λ" (lambda), "propagation delay," "anticone,"
  "non-paralyzable dead-time counter," "blue work," "blue set," "mergeset,"
  "the k cap," "security parameter k" — a dense cluster in the "core move"
  and "ordering rule" sections.
- "TPS," "mass" / "block-mass limits," "covenant," "covenant IDs," "ZK proof
  or settlement transactions," "light client," "finality certificate,"
  "oracle" — throughput table.
- "DAA score," "Crescendo," "BPS" (used as an abbreviation here, unlike the
  plain "10 blocks a second" on Start Here) — LIVE VS NEXT table.
- "KIP-16," "KIP-17," "KIP-20," "KIP-21," "rusty-kaspa," "argent-lang" —
  Sources section, no context for what any of these repositories or
  proposal numbers are.

Did I know what to do next: yes, mechanically — clear "READ NEXT" cards at
the bottom. But I no longer felt equipped to pick one, because the page in
between had stopped explaining and started lecturing.

Was I ever made to feel stupid: yes, and this was the worst point in the
whole journey. The page opens at my level (Coin/Security/Ownership) and
within a few screens is deriving probability formulas and citing IEEE
papers with zero acknowledgment that it just changed altitude. Nothing
tells me "the rest of this section is for people who want the math"; it
reads as if I should already follow it.

### 4. Cold arrival: landing directly on /kaspa-mining (simulating a search
   result for "kaspa mining")

What I learned, in my own words: not much, cold. The page opens with price
and hash-rate numbers, then immediately: "Toccata activated at DAA score
474,165,565" as literally the second sentence on the page. I have never seen
this page before; nothing here tells me what a DAA score is. I inspected the
page source directly (not something a real reader can do) and found that
"DAA score" *does* have a glossary tooltip elsewhere further down the page
("Difficulty-Adjusted Age: a running block count Kaspa consensus uses
instead of wall-clock time") — but not on its first appearance, which is
the one a cold arrival actually reads first. By the time the defined
instance shows up, a real reader has already hit the term unexplained and
likely already decided it's not worth puzzling out.

Words that stopped me:
- "DAA score" — undefined on first use (see above); defined only on a later
  occurrence lower on the page.
- "PH/s" and "TH/s" (network hash rate: "312.1 PH/s, up from 282.4 PH/s...
  Kaspa wiki: 500 TH/s") — never spelled out anywhere on the page. I don't
  know what a petahash or terahash is, or why the units changed between the
  two numbers being compared.
- "BPS" ("10 BPS era") — abbreviation, no expansion on this page.
- "ASIC" — used repeatedly and never explicitly defined, though it's
  loosely inferable from context ("machine market: ASIC orders, shipping,
  hosting, wiring") as some kind of mining hardware.
- "Carnot-engine model" — a physics term, attributed to a Twitter/X handle
  ("@Themooseisloos5") as the source of a four-phase market cycle theory.
  This is confusing on two fronts: I don't know what a Carnot engine is, and
  I don't know why a social-media post is being treated as a citable model
  next to academic and protocol sources elsewhere on the site.
- "Stratum Bridge" and "RPC" — in the solo-mining walkthrough, both used as
  if already familiar.

Did I know what to do next: partially. The page has a table of contents
("The two markets / The cycle / What to watch / Solo mining setup /
Sources") so I could navigate within the page, but nothing pointed me back
to a beginner explainer for the terms I didn't know. A reader arriving cold
from a search engine has no visible path back to Start Here from this page's
top content.

Was I ever made to feel stupid: yes — a term getting defined once, deep in
the page, after being used undefined at the very top, is a specific and
avoidable version of that feeling: the site clearly knows this word needs
explaining, it just didn't explain it where I first needed it.

### Orphaned glossary page

The repository contains a full `/glossary` page (`glossary.html`) with
apparent definitions. I checked every one of the site's 73 HTML pages for a
link to it: zero pages link to `/glossary`, in the header, footer, or body
copy. It is unreachable by clicking anything on the live site. A newcomer
who wants a single place to look up "GHOSTDAG" or "DAA score" has no way to
find that such a page exists.

## Full list of words that stopped me, in order encountered

1. blockDAG — homepage card teaser ("PoW, blockDAG, GHOSTDAG, KAS."), no
   tooltip on that occurrence.
2. GHOSTDAG's tooltip defines itself using "blockDAG," an undefined term —
   homepage hero.
3. L1 — homepage, "Toccata is active" card.
4. covenants — homepage, same card.
5. ZK verification — homepage, same card.
6. sequencing commitments — homepage, same card.
7. DAA score — homepage ("Activated at DAA score 474,165,565"), no
   tooltip on the homepage.
8. mass — homepage, "Mass calculator" demo teaser, never defined there.
9. DAGKnight — Start Here, named with zero explanation, no link.
10. vProgs — Start Here, same sentence, zero explanation.
11. UTXO (as a spelled-out acronym) — Start Here and repeated on later
    pages; concept given a cash-note analogy but the acronym itself
    unexplained (in progress, see note below).
12. Poisson process / λ (lambda) — What is Kaspa?, collision-probability
    derivation.
13. propagation delay — What is Kaspa?, same section.
14. non-paralyzable dead-time counter — What is Kaspa?, same section, a
    term from an unrelated technical field (physics/electronics) used
    without translation.
15. anticone — What is Kaspa?, "ordering rule" section.
16. mergeset — What is Kaspa?, same area.
17. blue work / blue set — What is Kaspa?, "ordering rule" and
    confirmations sections.
18. security parameter k / anticone size k — What is Kaspa?.
19. TPS — What is Kaspa?, throughput table.
20. covenant / covenant IDs — What is Kaspa?, throughput table and
    "COVENANTS" section.
21. ZK proof / settlement transactions — What is Kaspa?, throughput table.
22. light client, finality certificate, oracle — What is Kaspa?, one
    sentence, three unexplained terms.
23. Crescendo — What is Kaspa? "LIVE VS NEXT" table.
24. BPS (as an abbreviation, distinct from the plain "10 blocks a second"
    phrasing used on Start Here) — What is Kaspa?.
25. KIP-16 / KIP-17 / KIP-20 / KIP-21 — What is Kaspa?, Sources section (KIP
    itself is in progress per the note below, but the specific numbered
    KIPs are never explained even where the base term is defined).
26. rusty-kaspa, argent-lang — What is Kaspa?, Sources section, named as
    if I should recognize these repositories.
27. DAA score again — /kaspa-mining, second sentence on the page, cold
    arrival, undefined on this occurrence (a tooltip exists lower on the
    same page, attached to a later occurrence of the same term).
28. PH/s, TH/s — /kaspa-mining, network hash rate figures, units never
    spelled out.
29. ASIC — /kaspa-mining, used repeatedly, loosely inferable from context
    but never stated outright.
30. Carnot-engine model — /kaspa-mining, physics term used to frame a
    market-cycle theory, attributed to a social-media handle.
31. Stratum Bridge, RPC — /kaspa-mining, solo-mining walkthrough section.

## Note on KIP, UTXO, and BPS

Per the assignment, another pass is wiring glossary definitions for these
three terms while this audit was in progress. Spot-checking the page source
directly: UTXO already has glossary tooltip spans on several pages
(start-here, what-is-kaspa, kaspa-mining, build-on-kaspa, crypto-from-
scratch, search, status, utxo-vs-accounts, why-kaspa-matters, argent-
explained, kaspa-origin-story) but not on every occurrence of the word — for
example the homepage's "UTXO expressiveness" card teaser has no tooltip.
KIP has tooltip spans on kaspa-mining, build-on-kaspa, kips, sources,
status, what-is-kaspa, argent-explained, and kaspa-origin-story, but the
Start Here and homepage occurrences of "KIP"-adjacent material are not
covered by a definition, and none of the numbered KIPs (KIP-16, KIP-17,
etc.) are ever explained individually. BPS has a tooltip only on `status`
and `what-is-kaspa`; the homepage and kaspa-mining occurrences of "BPS" are
plain text. These three terms stopped me at several points above; they are
marked here as in-progress rather than counted as unaddressed findings.
