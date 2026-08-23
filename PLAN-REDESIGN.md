# Kaspa Explained: redesign plan

Read-only analysis of all 25 live pages in `sitemap.xml`, plus `llms.txt`, `agent-index.json`, `CONTENT_BRIEF.md`, and `CLAIMS.yml`. This file is the only artifact of that analysis; nothing else in the repo was touched.

Owner direction that shapes every decision below, taken as settled rather than open:

- **Audience:** newcomer and skeptic on the same page, same URL, different depth. Progressive disclosure (the collapsible pattern a design agent is building at `design/patterns.html`) is the mechanism: the newcomer reads the answer and plays with the interactive, the skeptic expands and finds the claim, the source, and what the claim does not establish. No separate tracks, no averaged middle.
- **Page count:** ruthless. Ten pages plus toys, if that serves both readers better than 25 walls of text. This plan lands at 11 core content pages, not 10, and says exactly why below.
- **Scope:** covenants, ZK, DAGKnight, and vProgs all get built as interactives, not just prose. These four are currently the most prose-heavy and least tangible things on the site, and none of the toys already in flight covers them.

---

## Part 1: per-page audit

Five questions per page: the question it exists to answer, who arrives and from where, the hook, what survives compression, and the merge/keep/kill call. Condensed to one row per page; the reasoning behind each call is in Part 2.

| Page | Exists to answer | Arrives from | Hook | Survives compression | Call |
|---|---|---|---|---|---|
| **index** | Where do I start, and what's actually live right now? | Search, social share, direct | Live network snapshot + Toccata activation record, already the strongest one-screen orientation on the site | The three-question framing (live/roadmap/research), the snapshot, the "next pages" router | Keep, tighten |
| **start-here** | What problem does crypto solve that a bank doesn't? | New to crypto entirely | None currently; all prose | Cash-has-a-location vs files-copy-for-free framing, the four-attacks table | Merge into Crypto Fundamentals |
| **crypto-from-scratch** | What is crypto actually good for, and what is it bad at? | Crypto-curious skeptic | None currently | Six-places-it-works / six-places-it-loses tables, the "crypto makes sense when at least three are true" checklist | Merge into Crypto Fundamentals |
| **what-is-kaspa** | How does Kaspa order parallel blocks into one history? | Someone who searched "what is Kaspa" | None currently; GHOSTDAG explained in prose only | The blue/red/anticone mechanism, the "ask TPS of what" table, the mass-accounting math | Keep, becomes the interactive-mechanics flagship |
| **why-kaspa-matters** | Where does Kaspa fit next to Bitcoin, Ethereum, Solana, and the rest? | Crypto-native comparison reader | None currently; six-families prose | The "every design pays for its wins somewhere" tradeoff framing, the inclusion-vs-confirmation distinction | Merge into How Kaspa Compares |
| **crypto-from-scratch** *(cross-linked, see above)* | | | | | |
| **chain-comparer** | Which chain actually fits my job, by the numbers? | Builder or researcher comparing chains | The dial-based live scorer itself, already a real hook | The re-measurement finding (Ethereum's throughput claim was 34% high) | Merge into How Kaspa Compares, tool becomes the page's spine |
| **model-picker** | Which LLM should I use for my work? | LLM users, not Kaspa readers | The scorer methodology is genuinely excellent | Nothing Kaspa-specific; it isn't about Kaspa at all | Kill from this site's sitemap (spin out) |
| **kaspa-origin-story** | Why did Kaspa launch with no premine, and was that the plan? | Someone checking the fair-launch claim | None currently; strong narrative prose only | The four-failed-paths structure, Black Tuesday, the DAGLabs/Polychain nuance | Keep, gets a new hook |
| **toccata-explained** | What did Toccata actually turn on? | Builder or technical reader | None currently | The four-KIP table, the "seven things between a rule and an app" table | Merge into Toccata |
| **argent-explained** | Is Argent proof that Kaspa smart contracts work? | Builder evaluating Argent | None currently | The worked covenant example, the README's-own-words quote | Merge into Toccata |
| **toccata-status** | Has Toccata activated, and what's checked since? | Someone fact-checking the activation | None currently | The status-by-area table, the operator checklist | Merge into Toccata |
| **toccata-essay** | What does Toccata mean, argued in one voice? | Someone sent the link by a friend | The voice itself: a named author, a real opinion, "elegant" stated and defended | The whole essay; it is already the site's best "send to a friend" artifact | Keep as-is, distinct voice |
| **build-on-kaspa** | What should I build, and how do I verify it's real? | Builder deciding what to ship | The "pick the route" decision table, close to a real hook already | The six-things-a-reviewer-checks table, the verification-ladder discipline | Merge into Toccata as a "Build" section |
| **status** | What runs on mainnet today? | Anyone checking a specific claim | None currently; a status table | The bucket definitions, the "what other chains' product history says" table | Merge into Status & Claims, becomes its spine |
| **skeptical-case** | What's the strongest argument against Kaspa? | Skeptic | None currently | The six-objection framing, the weak-answer/strong-answer table | Keep, gets three new hooks |
| **kaspa-mining** | Why do price and hash rate move on different clocks, and how do I mine? | Miner or hash-rate watcher | The four-phase cycle model is close to a hook already | The two-markets framing, the full solo-mining walkthrough | Keep, gets a new hook |
| **kaspa-developments** | What changed in Kaspa this month? | Repeat reader checking in | None currently; a changelog table | The KIP-vs-KCC distinction, the covenant-growth numbers | Merge into Status & Claims as a "This month" tab |
| **kips** | Which KIPs and KCCs are actually ratified? | Builder or standards-watcher | The live-fetch-from-repo mechanic is a real hook | The KCC-0020 supply-split story (issue #14), the borrowed-receive griefing vector | Merge into Status & Claims, keeps its live-fetch mechanic as a tab |
| **kaspa-claims-checker** | Is this specific claim I heard true? | Someone repeating a claim they read elsewhere | The claim-sorting table itself | Every row; this is the site's rigor made legible | Merge into Status & Claims as its FAQ face |
| **sources** | What backs this site's claims, and how much? | Researcher, skeptic, or contributor | None currently; a very long reference list | The four-tier hierarchy table, the claim-type-to-source-class table | Keep, cut by more than half |
| **glossary** | What does this term mean? | Anyone mid-read who hit a term | None currently, by design | Every definition; this is reference utility | Keep as-is |
| **about** | Who runs this, and what won't it cover? | Someone deciding whether to trust the site | None currently, by design | The labeling rules, the corrections process, the "what this site is not" list | Keep, trim the FAQ overlap with Claims |
| **the-instrument** | What is this guest book, and why is it here? | Reader following a specific link | The book itself | The one-paragraph framing | Keep as-is |
| **search** | Where's the page I'm looking for? | Lost reader, broken link | None; it duplicates the page map already in nav and sources | Nothing unique; it's a second sitemap | Kill as a content page, keep only a functional search widget |
| **404** | Where did the page I wanted go? | Broken link | None needed | The three-link recovery path | Keep as-is |

**Pages that could not state a one-sentence purpose distinct from a sibling page:** start-here and crypto-from-scratch both answer "why does crypto/Kaspa need to exist," from different angles that the site itself already treats as companions (each links to the other as "fill in what's fuzzy"). why-kaspa-matters and chain-comparer both answer "where does Kaspa rank against other chains," one in prose and one as a tool, with the prose repeatedly pointing at the tool as the real answer ("A paragraph can't rank them honestly. That's a tool's job"). toccata-explained, toccata-status, and argent-explained all answer some version of "is Toccata real and what can it do," from three separate documents that quote the same DAA score, the same Argent README caveat, and the same vProgs repo stats. status, kaspa-claims-checker, and kaspa-developments all answer "what's actually live," in three formats (dashboard, FAQ, changelog) that share the same underlying facts and, in status's case, literally restate kaspa-claims-checker's own bucket definitions.

**Every Toccata-basics overlap found**, because the brief asked for a named list: the DAA activation score 474,165,565 appears, narrated in full sentences, on index, kaspa-origin-story, toccata-explained, toccata-status, argent-explained, build-on-kaspa, status, about, kaspa-mining, toccata-essay, kaspa-claims-checker, kips, and sources, 13 of 25 pages. The Argent README's audit-gate quote ("main pieces are present... audit is the gate") is narrated separately on argent-explained, toccata-explained, toccata-status, and status. The vProgs repo stats (52 stars, zero releases, last push July 28) are narrated separately on toccata-explained, status, and sources. The KCC-0020 supply-split bug (issue #14) is narrated separately on kips, kaspa-claims-checker, and toccata-explained. The live/testnet/roadmap/research bucket definitions are narrated in full on index, status, kaspa-claims-checker, about, and kaspa-developments. This is the actual size of the duplication problem, and it is why Part 2 merges as hard as it does.

---

## Part 2: target sitemap

**11 core content pages, 5 reference pages, 1 thin utility redirect.** Down from 25 live pages (24 once model-picker, which isn't about Kaspa, is set aside). Not 10, because two things earned a page of their own even under a ruthless budget: the Toccata essay is a distinct authored voice that already works as shareable content and would be diluted folded into a reference hub, and DAGKnight/vProgs need their own destination so the two new toys the owner asked for have room to be the point of the page rather than a subsection fighting for attention inside an already-dense Toccata hub.

### Core content (11)

1. **Home** (`index`), unchanged in purpose, tightened in prose. The hub and the router.
2. **Crypto Fundamentals**, merges `start-here` + `crypto-from-scratch`. One page: why digital ownership is hard, what crypto is good for for and bad at, when it makes sense at all. Progressive disclosure handles the two audiences already built into these pages: newcomer reads the plain framing, skeptic expands into the six-places-it-loses table and the three-of-nine checklist.
3. **What Is Kaspa**, mechanics: PoW, blockDAG, GHOSTDAG, confirmations, TPS. Unchanged scope, now interactive-first instead of prose-first.
4. **How Kaspa Compares**, merges `why-kaspa-matters` + `chain-comparer`. The tool becomes the page's spine; the six-families prose becomes the collapsed framing above it.
5. **Origin Story**, unchanged scope (`kaspa-origin-story`), new hook.
6. **Toccata**, merges `toccata-explained` + `toccata-status` + `argent-explained` + `build-on-kaspa`. One reference hub for everything that has actually activated: what turned on, current status and evidence, the Argent/Silverscript language layer, and a "build" section carrying the route-picker and verification checklist. Four pages that each independently narrated the same DAA score and the same Argent caveat become one page that states each fact once.
7. **Toccata Essay**, unchanged (`toccata-essay`), kept distinct for its voice. Trimmed to stop re-deriving facts the Toccata hub now owns; links to it instead.
8. **Roadmap**, new page. Consolidates what is currently scattered thin across five different pages: DAGKnight (research, not live), vProgs (roadmap, not live), native DeFi, and the 2027 100-BPS proposal kaspa.org makes that this site does not treat as a reliable source. This is where the two new research-stage toys live, because burying DAGKnight and vProgs as a subsection of the already-dense Toccata page is exactly the treatment that made them intangible on the current site.
9. **Status & Claims**, merges `status` + `kaspa-claims-checker` + `kaspa-developments` + `kips`. One data-driven page with four tabs or sections: current snapshot, claim sorter, this month's changes, and the live KIP/KCC tracker. All four currently restate the same live/testnet/roadmap facts in different formats; this makes them four views onto one dataset instead of four hand-maintained restatements.
10. **Risks**, unchanged scope (`skeptical-case`), three new hooks make the six objections concrete instead of argued in prose.
11. **Kaspa Mining**, unchanged scope, new hook.

### Reference and utility (5, plus one thin shell)

- **Sources**, kept, cut by more than half. The four-tier hierarchy table and the claim-type table are unique and stay. The 40-item Kaspa.com learning-links paragraph index and the page-map section get cut: the first is a mirror of someone else's content with no added judgment, the second duplicates the sitemap, the nav, and (formerly) the search page.
- **Glossary**, kept as-is. It is reference utility with no redundancy to cut.
- **About**, kept, FAQ trimmed. Several of its questions ("Does low fee usage prove adoption," "Does a roadmap idea belong in the headline") are near-verbatim restatements of rows already in Status & Claims. About keeps the editorial-policy and disclosure content that belongs nowhere else; protocol FAQs move to Status & Claims exclusively.
- **The Instrument**, kept as-is. Already minimal, already distinct (guest content, not this site's claims).
- **404**, kept as-is.
- **Search**, killed as a content page. Its own content is a second page map, already present in nav and (formerly) in Sources. Replaced by a functional search widget reachable from nav everywhere, not a page whose content is a list of other pages. If a `/search` URL needs to keep resolving, it should render only the widget.

### Killed outright, not merged anywhere

- **model-picker**, an excellent LLM-scoring tool that has nothing to do with Kaspa. It dilutes what this site is for and belongs on its own domain, not in this sitemap.

### Redirect map (every URL that moves or dies needs one)

`start-here`, `crypto-from-scratch` → Crypto Fundamentals. `why-kaspa-matters`, `chain-comparer` → How Kaspa Compares. `toccata-explained`, `toccata-status`, `argent-explained`, `build-on-kaspa` → Toccata. `kaspa-developments`, `kaspa-claims-checker`, `kips` → Status & Claims. `model-picker`, `search` → whatever the owner decides (external link and a bare widget shell, respectively). `llms.txt` and `agent-index.json` both currently hard-code several of these exact paths (`ai-guidance` is already handled this way, as a redirect stub into `about`), the same pattern applies to every path on this list.

---

## Part 3: hook table

Ambitious, specific hooks. The five (really seven, see the finding below) toys already in flight are assigned to the pages they belong on. New hooks are proposed everywhere else, plus the four the owner named specifically: covenants, ZK, DAGKnight, and vProgs.

**Finding worth flagging:** the brief says "five toys are already being built" and then names seven, block collision simulator, GHOSTDAG coloring playground, confirmation risk curve, transaction mass calculator, KCC-0020 supply split demo, emission schedule scrubber, node cost visualizer. Whoever is tracking the in-flight list should reconcile that count before the build order below is scheduled against it.

| Page | Toy | What it does | Status |
|---|---|---|---|
| What Is Kaspa | Block collision simulator | Two miners solve a block seconds apart; show Bitcoin's single-chain rule discard one while Kaspa's blockDAG keeps both | In flight, assigned |
| What Is Kaspa | GHOSTDAG coloring playground | Reader adds blocks to a live DAG and watches blue/red coloring and the selected-parent spine update | In flight, assigned |
| What Is Kaspa | Confirmation risk curve | Reader sets a transaction value and watches reversal-risk odds fall as blue work stacks up; not a single confirmation count | In flight, assigned |
| Toccata (Build section) | Transaction mass calculator | Reader picks a transaction shape (payment, covenant, ZK settlement) and sees which of the three mass dimensions actually gets charged | In flight, assigned |
| Toccata | **Covenants: what a spend rule refuses** | Reader is handed a vault covenant and tries several spends against it: early withdrawal, skipping the recovery key, forging a lookalike without a covenant ID. Each attempt gets rejected with the exact rule that stopped it, in the same require/become terms the Argent example already uses | New, owner-specified |
| Toccata | **ZK: what a proof does and doesn't prove** | Reader builds a claim (reusing the site's own chess-cheater-detection example) and watches a proof succeed when it checks a computation over chosen inputs, then watches the same proof mechanism fail to establish an outside fact, a price, an event, another chain's state, without a named anchor | New, owner-specified |
| Status & Claims | KCC-0020 supply split demo | Reader issues a token, splits a rollout across holders, and watches the supply permanently fracture into groups that can never consolidate, the issue #14 bug made tangible | In flight, assigned |
| Status & Claims | Emission schedule scrubber | Reader drags a DAA-score slider and watches the block reward step down in real steps, replacing the static "next step" table with something that shows the schedule is DAA-triggered, not calendar-triggered | In flight, assigned |
| Roadmap | **DAGKnight: parameterless vs. parameterized** | Side-by-side sliders: GHOSTDAG's fixed k, tuned for worst-case latency, next to DAGKnight adapting its safety margin to observed network conditions in real time. Show GHOSTDAG wasting margin during calm periods and both systems degrading safely under a simulated latency spike | New, owner-specified |
| Roadmap | **vProgs: what shared mutable state means** | Two "apps" as separate lanes; show Toccata's Inter-Covenant Communication succeeding when each app keeps its own independent state, then show the same mechanism unable to let many users write to one shared object at once, the DEX order-book example already used in the Argent content, finally made visual | New, owner-specified |
| Risks | 51% attack cost, per chain, per hour | Calculator: pick a chain, read live-ish hash rate times hardware and power cost, get dollars per hour to rent or buy enough hash power to attack it, next to two or three other chains for scale | New |
| Risks | Censorship resistance you can attempt and fail at | A game: the reader is handed a transaction and tries to keep it out of the chain by bribing or controlling a rising share of hash power against a simulated network, watching how much collusion it actually takes and how fast the DAG heals once they stop | New |
| Risks | Node cost visualizer | Reader drags a BPS slider and watches bandwidth, CPU, and storage requirements rise, making "verification cost" (objection #1 on this page) a number instead of a sentence | In flight, assigned |
| Origin Story | Fair launch vs. premine, plotted | A supply-allocation timeline comparing Kaspa's mined-from-zero curve against several other major coins' initial distribution: premine percentage, presale percentage, insider allocation, mined percentage, plotted against each other rather than described | New |
| Kaspa Mining | What an ASIC does that a GPU can't | Side-by-side: the same hash operation run as general-purpose silicon versus a fixed ASIC circuit, cost-per-hash and flexibility tradeoff shown as a real curve instead of asserted | New |

Three strongest, and why: the covenant breaker turns the single most misunderstood word on the site (covenant) into something a reader tries to defeat and fails at, which is a stronger proof than any explanation. The DAGKnight adaptive-margin slider is the first thing anywhere in this space, on this site or elsewhere as far as this audit found, that makes "parameterless consensus" mean something instead of naming it. The fair-launch-vs-premine plot answers a question every reader of the origin story already has half-formed (was this actually fair, compared to what) and currently gets only in prose.

---

## Part 4: build order and dependencies

**Phase 0, data layer.** Every fact that gets narrated on more than one page today (the DAA score, KIP/KCC status, the emission table, the Argent README quote, the vProgs repo stats) needs one home in `CLAIMS.yml` before any page merge happens. Merging four pages that each independently restate the same fact produces one new page that still independently restates it, six months from now, wrong. This has to be the first phase or the redesign just relocates the maintenance burden instead of fixing it.

**Phase 1, toy inventory reconciliation.** Confirm the five-vs-seven discrepancy above, then scope the four new owner-specified toys (covenants, ZK, DAGKnight, vProgs) and the additional new hooks in Part 3 against it. Toys are load-bearing for the pages they're assigned to; several of the merges below don't make sense to ship without them (Roadmap in particular is close to content-free without the DAGKnight and vProgs toys).

**Phase 2, the three merges that depend on Phase 0:**
- Status & Claims (this page *is* the data layer's face; it cannot be built before Phase 0 lands)
- Toccata (needs the covenant, ZK, and mass-calculator toys ready, plus Phase 0 for the facts it's consolidating)
- Roadmap (net-new page; needs the DAGKnight and vProgs toys to justify existing at all)

**Phase 3, the two merges that don't depend on Phase 0, can start in parallel:**
- Crypto Fundamentals (pure prose consolidation, no data dependency)
- How Kaspa Compares (the chain-comparer tool already has its own live-fetch pipeline; low risk, good early win)

**Phase 4, standalone rewrites**, once their toys are ready: What Is Kaspa (block collision simulator, GHOSTDAG playground, confirmation risk curve), Origin Story (fair-launch-vs-premine plot), Kaspa Mining (ASIC-vs-GPU, node cost visualizer cross-link), Risks (51%-attack calculator, censorship game, node cost visualizer).

**Phase 5, reference layer cleanup**: trim Sources, trim About's FAQ, kill Search as a content page, confirm model-picker's removal or spin-out, leave Glossary, The Instrument, and 404 alone.

**Phase 6, machine-readable surfaces, regenerated last** (see Part 5), because they describe a page inventory and URL set that Phases 2 through 5 are actively changing. Redirects for every merged or killed URL ship in this phase too, since `llms.txt` and `agent-index.json` already hard-code several of the paths this plan retires.

---

## Part 5: machine-readable surfaces

`llms.txt`, `agent-index.json`, `CLAIMS.yml`, and `CONTENT_BRIEF.md` all currently describe a 25-page site with several pages (`toccata-explained`, `toccata-status`, `argent-explained`, `build-on-kaspa`, `status`, `kaspa-claims-checker`, `kips`, `kaspa-developments`) treated as separate retrieval units, each with its own path and its own restated facts. After this redesign:

- **Every status-sensitive fact gets exactly one entry in `CLAIMS.yml`**, not a parallel restatement of what the pages say. Status & Claims, Toccata, and Roadmap render from it rather than each carrying their own hand-written version. This is the fix Phase 0 exists to deliver, and it's the one that keeps the next redesign from facing the same duplication.
- **`agent-index.json`'s page list shrinks from 25 entries to roughly 16**, one per surviving URL, and needs new entries for Roadmap and the merged pages. Every entry for a killed or merged path needs to either disappear or point at its replacement, an agent reading a stale `agent-index.json` after the pages move will confidently cite a path that 404s or redirects, which is worse than the page never having existed in the index at all.
- **`llms.txt` needs its per-topic guidance re-anchored to the new page shape.** Right now it gives Toccata guidance assuming a reader might land on any of four separate Toccata pages; once there's one Toccata hub, that guidance simplifies to pointing at one path, and the DAGKnight/vProgs guidance (currently folded into Toccata-adjacent notes) needs to point at Roadmap specifically now that it has a real home.
- **`CONTENT_BRIEF.md`'s audience-path list stays accurate in substance** (it already describes the newcomer-through-protocol-expert spectrum this plan's progressive-disclosure approach serves) but its section describing how many pages exist and what each covers needs a full rewrite to match Part 2, not a patch.
- **`sitemap.xml` and every internal cross-link** that currently points at a killed or merged path needs updating in the same commit that ships the redirect map, not after. A dangling internal link to `/chain-comparer` after it becomes `/how-kaspa-compares` is a broken-link bug the site's own claims-checking standard would flag on someone else's page.

---

## Part 6: risks

**What this site actually has, that a bad redesign would destroy:** every claim carries a status label (live, testnet, targeted, roadmap, research, wrong) and a source that supports the exact sentence next to it, not just the general topic. That discipline is the entire reason this site is worth reading over the dozen other Kaspa explainers that exist, and it is also the single easiest thing to lose while chasing polish.

Specific ways this redesign could damage it:

- **Merging four pages into one is where citations get lost first.** When toccata-explained, toccata-status, argent-explained, and build-on-kaspa become one Toccata page, every fact that appears once, unchallenged, in the merge needs to keep the citation it had. The failure mode is an editor consolidating four paragraphs that made the same claim into one paragraph and, in the process of picking which citation to keep, silently dropping the other three that were actually independent corroboration.
- **A slick toy that doesn't carry a status label is worse than the prose it replaced.** The covenant breaker, the ZK boundary demo, the DAGKnight slider, and the vProgs demo all illustrate things at different maturity: covenants and ZK are live, DAGKnight and vProgs are not. An interactive that makes DAGKnight's adaptive-margin idea fun to play with, without making unmistakably clear that none of it runs on mainnet, would be a worse error than the current prose version, because a toy reads as more authoritative than a paragraph, not less.
- **Toys built against live data (hash rate, DAA score, KCC status) go stale exactly the way the old static prose did**, unless they're wired to the same live-fetch pattern the chain-comparer and KIP tracker already use. A 51%-attack-cost calculator quietly running on a hash-rate number from the day it launched is the same failure this site was built to catch on other sites.
- **Killing Search and the Kaspa.com link-index in Sources removes real (if redundant) discoverability surface.** Confirm nothing meaningfully unique lived only in those two before they're cut, the audit above found the Kaspa.com index to be a mirror with no independent judgment added, but that call is worth a second look before the content is gone rather than merged.
- **The redirect map is not optional infrastructure; it is part of the rigor claim.** This site's own standard would flag a competitor's dead internal link as a reliability problem. Shipping the page merges without the redirects in the same change is the same mistake, aimed at this site instead of someone else's.
- **Progressive disclosure must not become a way to soften a claim instead of layering it.** The owner's resolution is depth, not tone: the collapsed view must already be accurate on its own. It must never be a simplified-to-the-point-of-wrong version that only becomes correct once expanded. A newcomer who never clicks "expand" should still walk away with a claim that holds up, just with less evidence attached to it than the skeptic who does click.

What must not be lost, stated plainly: the source-per-claim discipline, the four-tier source hierarchy, the live/testnet/roadmap/research labeling on every status-sensitive sentence, the corrections process, and CLAIMS.yml as the actual mechanism (not just the stated intention) behind all of it.
