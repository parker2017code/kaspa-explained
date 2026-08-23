# Cold read: kaspaexplained.com

First-time-visitor pass. Local copy served at localhost:4196. Chrome, desktop
(1280) and mobile (375, close enough to 390), light and dark. Read as someone
who has never seen Kaspa, GHOSTDAG, a UTXO, or a covenant before, flagging
every place prior training knowledge would have silently filled a gap the
page left open. Coverage is partial given the size of the site (100+ HTML
files, 16 demos): homepage, Start Here, What Is Kaspa, Status, Glossary,
Demos index, the Confirmation Risk demo, and the Claims Checker. Everything
else in the nav (Toccata, Origin, Mining, Build on Kaspa, Compare Chains,
Compare AI Models, About, Sources, KIPs, Skeptical Case, and 14 of the 16
demos) was not opened. Say so plainly rather than implying full coverage.

## The five worst moments

1. **The homepage's own headline sentence gatekeeps instead of welcomes.**
   The first thing anyone reads, in the hero, above the fold: "The
   proof-of-work network where miners don't race for one slot. They work in
   parallel, and GHOSTDAG orders every honest block into one history the
   whole network agrees on." GHOSTDAG is a hyperlink, which helps, but the
   sentence itself treats the term as already known. This is the single most
   prominent claim on the entire site and it spends its first ten seconds
   asking for trust instead of earning it.

2. **The Glossary is broken: it silently redirects to a different page.**
   Navigating to `/glossary.html` or `/glossary` does not load a glossary.
   `location.href` after the navigation reads `/what-is-kaspa`, and the page
   content is the What Is Kaspa article, not a term list. Confirmed twice,
   from a fresh reload each time. The Glossary is exactly where a reader
   goes after hitting an unexplained term like "covenant" or "mergeset," and
   it does not work. For a site whose whole pitch is precision, this is close
   to disqualifying.

3. **The page literally labeled "BEGINNER ANSWER" fails its own label in
   its first two sentences.** What Is Kaspa opens: "Kaspa is a live
   proof-of-work blockDAG network. It keeps Bitcoin-style mining and UTXO
   ownership, and GHOSTDAG orders parallel blocks into one payment history."
   Three unexplained terms (blockDAG, UTXO, GHOSTDAG) in the very sentence
   tagged as the beginner-safe answer. A beginner reading only this sentence
   learns nothing they didn't already have to bring with them.

4. **The homepage's own "Live now" card leads to the most jargon-dense page
   on the site.** Status is one of six featured homepage cards, worded as
   an entry point ("Mainnet facts, dated checks"). It contains, without a
   single word of explanation anywhere on the page: "Silverscript," "TangVM,"
   "Hashdag," "RTD framing," and "parameterless consensus." A reader who
   trusted the homepage's framing and clicked the second card on the page
   lands in what reads like an internal engineering changelog.

5. **The homepage's "Check claims" card leads to a wall of bare proposal
   codes.** The Claims Checker is pitched as clarity ("Most bad Kaspa claims
   blend testnet work, roadmap design, and live mainnet behavior into one
   sentence. The table below pulls them apart.") Its own rows then read:
   "TN10 Toccata test," "TN12 proves mainnet covenants," "KCC-0020 is a
   ratified fungible-token standard," "KCC-0021 and KCC-0402 are adopted
   standards." None of TN10, TN12, KCC-0020, KCC-0021, or KCC-0402 is ever
   expanded or glossed on this page. The page promises to resolve
   confusion and instead adds a new alphabet of undefined codes.

## Page by page

### Homepage (/)
- 10-second test: fails for a true newcomer. The hero sentence leans on
  GHOSTDAG immediately (see worst moment #1). Below the fold the page
  recovers a little: six labeled cards (What is Kaspa, Live now, Check
  claims, Risks, Build, Sources) give a legible menu, and "New to crypto?
  Start Here" is a genuine, well-placed escape hatch.
- Sentences read twice: "GHOSTDAG orders every honest block into one
  history the whole network agrees on," reread trying to figure out
  whether "honest" is doing technical work here or is just flavor text.
  It's never resolved on this page.
- Terms used before explained: GHOSTDAG, blockDAG (in "PoW, blockDAG,
  GHOSTDAG, KAS."), covenants ("Toccata is active... L1 covenants"), ZK
  verification, sequencing commitments, UTXO ("UTXO expressiveness" card),
  DAA score (used in "Activated at DAA score 474,165,565" before the info
  tooltip further down even exists).
- The DAA score info-icon tooltip explains DAA score using "block height,"
  itself never explained anywhere on this page: one undefined term
  defining another.
- The live-data block (circulating supply, mined %, blocks stored by one
  node, DAA score) is a nice touch: it's honestly labeled "best-effort"
  and dated. Genuinely interesting: it feels like a live instrument, not
  marketing copy.
- The "single chain throws away 83% of blocks" demo teaser is the most
  visually effective thing on the page: a number plus a live animated
  scatter of kept/discarded dots. This is the one moment on the homepage
  that would pull a reader forward out of curiosity rather than duty.
- Visual bug: in light theme (confirmed at both 375 and 1280 width), the
  "INDEPENDENT EXPLAINER" eyebrow label has a colored background pill that
  covers only the word "INDEPENDENT," leaving "EXPLAINER" as plain text
  right next to it on the same line. Reads as a broken two-tone label. Not
  present in dark theme, where both words are plain teal text.
- Theme default: the site opens in dark mode regardless of the OS-level
  light preference passed to the browser. Not necessarily wrong, but worth
  knowing it doesn't respect `prefers-color-scheme`.
- Does the next step read clearly? Yes: the card grid is legible and the
  "Start Here" CTA is well placed for someone lost.

### Start Here (/start-here.html)
- The best-explained page of the ones visited. It defines private key,
  public key, signature, hash, account model, and UTXO model each in one
  short paragraph, bottom-up, before using them. This is the one page that
  behaves like it was written for a stranger.
- Still: GHOSTDAG is named ("order them with GHOSTDAG") without mechanism,
  deferred to the next page by design, but the page doesn't say so, so a
  reader doesn't know whether to expect an explanation here or not.
- New unexplained terms introduced without gloss: pruning-oriented nodes,
  Crescendo-era network (proper noun, no definition), DAGKnight (proper
  noun, no definition), RTD-derived app systems (RTD never expanded here),
  premine (used, never defined even briefly).
- Long and text-dense: a wall of paragraphs with headers as the only
  visual break until the UTXO diagram appears roughly two-thirds down. A
  first-time reader would likely stop well before that diagram.
- 10-second test: fails as an entry point on its own (too much text, no
  visual anchor near the top) but succeeds as a "next step" once a reader
  has already committed via the homepage CTA.

### What Is Kaspa? (/what-is-kaspa.html)
- Opens badly (worst moment #3). Recovers partially: the "Parents / Coloring
  / Spine / One order" breakdown of GHOSTDAG is a genuine, structured
  attempt at mechanism, and it does define anticone, mergeset, blue work,
  selected parent, and k cap in place, each with a one-line gloss. This is
  the site doing the hard thing correctly, in contrast to most other pages.
- But the density is extreme: multiple new terms per sentence, sustained
  for several screens. A first-time reader would need to re-read most of
  the "ordering rule" section, possibly more than once.
- Terms still dropped with zero gloss on this page: premine, orphan rate,
  "light client, finality certificate, reporter set, oracle, or challenge
  process" (five jargon terms in one clause, none explained), Silverscript
  is not here but covenant IDs and vProgs are used without definition.
- The interactive "add blocks by hand" GHOSTDAG coloring demo and the
  confirmation-curve widget are present (confirmed via page text: "Advance
  time," "Force a count instead," "Mine this many," "Reset," plus two
  collapsed "Advanced" disclosures). No clean screenshot of the canvas
  itself came through: the Browser pane's screenshot capture repeatedly
  returned solid black at this scroll position, on a freshly reloaded page,
  with no corresponding DOM element or console error at that point
  (checked via `elementsFromPoint`, which returned normal text nodes, and
  console, which was empty). That reads as an artifact of a heavily
  shared/contended browser session rather than a real page defect, but it
  means this specific demo did not get driven, which the task requires.
  Flagging the gap rather than guessing at what it looks like.
- "TPS of what?" section is a good instinct (payment TPS vs. covenant TPS
  vs. ZK/settlement TPS vs. app-level throughput, kept as four separate
  rows) but ZK is never once spelled out as zero-knowledge anywhere on this
  page or the homepage.
- "LIVE VS NEXT" true/false table is the clearest writing on the page:
  short, concrete, mostly jargon-free per row. This is a model for what the
  rest of the site could read like.

### Status (/status.html)
- This is the homepage's second-billed card ("Live now") and the densest
  page visited (worst moment #4). "Silverscript," "TangVM," "Hashdag,"
  "netsplit-resilient," and "parameterless consensus" all appear with no
  definition, several only once, in passing, inside a status table meant to
  be scannable.
- "Base RTD framing... Real-time decentralization is Hashdag's name for
  Kaspa's core trade" explains RTD but not Hashdag: is it a person, a
  project, a website? The only clue is the source link `hashd.ag/raw`,
  which is not itself explanatory.
- The misconceptions section ("Common Misconceptions") is well written and
  genuinely useful: short claim/correction pairs in plain English. Good
  contrast with the table above it.
- 10-second test: fails. This does not read like a page for someone new to
  the network; it reads like release notes for someone already fluent in
  Kaspa's internal vocabulary.

### Demos index (/demos/)
- Sparse: a ranked list of 16 demo titles with almost no supporting text.
  Titles like "The shared-state gap" and "Parameterless consensus" give a
  first-time visitor no idea what they'll see before clicking. This page
  could use one line per demo the way the homepage cards do.

### Confirmation Risk demo (/demos/confirmation-risk.html)
- The best-designed thing checked on the site. Comparing three real chains
  side by side (Bitcoin, Litecoin, Kaspa) against one slider (attacker
  strength) makes the payoff immediately legible without requiring the
  reader to already understand GHOSTDAG: drag right, watch Kaspa's "safe"
  time barely move while Bitcoin's balloons. Confirmed the slider is
  functional (dragged it, the attacker-percentage number and the safe-time
  read jumped live).
  This is a demo worth showing someone; it demonstrates the point
  ("waiting matters more than a block-count") without requiring jargon
  first.
- Minor: "reorg" is used and only loosely glossed ("If the block carrying
  your payment gets replaced..."); acceptable but still an assumed term.
- Could not screenshot the numeric result table after scrolling: same
  black-screenshot pattern seen on What Is Kaspa, most likely the shared
  browser pane rather than the page.

### Kaspa Claims Checker (/kaspa-claims-checker.html)
- Good concept, bad execution for a first-timer (worst moment #5). Rows are
  grouped sensibly (Core protocol / Toccata and smart contracts / Tokenomics
  and standards / Roadmap and app layer) but several rows are unreadable
  without prior knowledge: "TN10 Toccata test means mainnet activation,"
  "TN12 proves mainnet covenants," "KCC-0020 is a ratified fungible-token
  standard," "KCC-0021 and KCC-0402 are adopted standards already running in
  production." None of TN10, TN12, or the KCC numbers is expanded anywhere
  on the page.
- The status labels themselves (LIVE, TESTNET ONLY, WRONG, MISLEADING,
  ROADMAP, RESEARCH, NOT YET) are a genuinely good idea: a real taxonomy a
  reader could learn once and reuse, but the page never states the
  taxonomy up front before using it row by row.

## Every term the site uses without ever explaining it

(Across the pages actually visited: homepage, Start Here, What Is Kaspa,
Status, Demos index, Confirmation Risk, Claims Checker. A term counts here
if it appeared unglossed on at least one of these pages, even if some other
unvisited page might define it.)

- GHOSTDAG (named repeatedly, mechanism only partly explained on What Is
  Kaspa, and even there assumes DAG/graph fluency)
- blockDAG (used before it's ever defined; eventually glossed mid-page on
  What Is Kaspa, after several prior uses)
- DAA score (tooltip defines it using "block height," which is itself never
  defined)
- block height
- Toccata (never plainly defined as "the name of a specific hard fork /
  protocol upgrade" anywhere visited, used as if the reader already knows)
- covenant / covenants (used repeatedly, never defined in plain language;
  "UTXO expressiveness... what covenants let a transaction enforce on
  itself" is circular, not a definition)
- ZK verification / ZK proof (never once spelled out as zero-knowledge)
- sequencing commitments
- vProgs (recurring proper noun, never defined)
- mass / "block-mass limits" / "mass dimension" (overloaded technical term,
  never given a plain-language definition despite a whole demo, "Mass
  calculator," being built around it)
- Silverscript
- TangVM
- Hashdag / hashd.ag (unclear if person, project, or site)
- RTD framing (RTD itself is glossed as "real-time decentralization," but
  only once, in passing, inside a dense status-table cell)
- netsplit-resilient
- parameterless consensus (used as a demo title with no on-page gloss;
  loosely explained elsewhere as "adapts instead of being tuned by hand")
- premine (assumed known throughout; "no premine" appears with no
  definition of what a premine is)
- orphan rate
- KIP / KIPs (never expanded: "Kaspa Improvement Proposal" is never spelled
  out on any page visited)
- KCC (never expanded; bare codes like KCC-0020, KCC-0021, KCC-0402 used as
  if self-explanatory)
- TN10, TN12 (bare testnet codenames)
- DAGKnight (named as a research project multiple times, loosely glossed
  once as "a parameterless consensus direction," itself jargon)
- light client, finality certificate, reporter set, challenge process
  (five-term jargon list dropped in one clause on What Is Kaspa, none
  individually explained)
- Crescendo (era name used repeatedly as if known: "Crescendo-era network")
- selected parent, blue work, anticone, mergeset, k cap: worth noting these
  ARE explained, in place, on What Is Kaspa. Listed here only to contrast
  with the much longer list above of terms that get the same jargon
  treatment with no such effort.

## Not covered

Toccata Explained, Kaspa Origin Story, Mining Kaspa, Build on Kaspa, KIPs
and KCCs, Compare Chains, Compare AI Models, About, Sources, Skeptical
Case, Risks, and 14 of the 16 demos (only Confirmation Risk was driven; the
GHOSTDAG playground on What Is Kaspa was located but not successfully
screenshotted/driven). A full pass would need another session focused on
those, plus a second look at the two black-screenshot spots to confirm
they're tooling artifacts and not real rendering bugs.
