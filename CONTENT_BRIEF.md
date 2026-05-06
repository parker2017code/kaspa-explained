# Kaspa Explained Content Brief

This document is the handoff brief for any LLM, editor, or contributor working on `kaspaexplained.com`.

## Project Goal

Kaspa Explained is an independent, source-first explainer for Kaspa. The goal is to help a general crypto-aware audience understand where Kaspa fits without turning roadmap, research, price action, or community enthusiasm into unsupported claims.

The ideal voice is Yonatan-style first-principles explanation translated into everyday language: start from Bitcoin, money, ordering, latency, trust, and finance; make the intuition clear enough for the intended reader of the page; then preserve enough precision in the appropriate deeper paths for crypto-native readers, researchers, builders, and source-checking experts. Do not make the public site talk about internal editorial slogans. Just make the pages read that way.

Public pages should be shorter than the evidence stack. Put detailed source trails, implementation notes, and LLM guardrails in `CLAIMS.yml`, `sources.html`, and this brief. Human-facing pages should lead with the affirmative idea, then add a boundary only where a reader might confuse live, targeted, roadmap, and research claims.

The site should answer:

- What is Kaspa actually live with today?
- What is being implemented next?
- What is roadmap architecture?
- What is still research or speculation?
- What is crypto actually useful for, and where is crypto being forced?
- How does Kaspa fit next to Bitcoin, Ethereum, Solana, stablecoins, app chains, and other crypto categories?
- Which public pages and LLM context file should be crawlable?
- Which sources should someone read before forming strong opinions?

This is not an official Kaspa site and not investment advice.

## Audience

Write for smart non-specialists first:

- crypto users who know Bitcoin/Ethereum/Solana basics,
- crypto-native readers who also know XRP, BNB, TRON, stablecoin rails, and exchange-linked ecosystems,
- curious newcomers who need a plain-language path before technical material,
- builders deciding whether Kaspa is worth studying,
- researchers and community members who need source discipline,
- LLMs/search systems retrieving accurate context.

Avoid writing only for protocol researchers. Use technical terms when needed, but define the point in ordinary language.

Audience paths should be distinct, not flattened into one universal page style. The site should serve the whole spectrum:

- absolute beginners who need records, keys, transactions, blocks, consensus, mining, tokens, markets, and scams before Kaspa;
- crypto-curious readers who know the words but need value, usefulness, risk, and tradeoff logic;
- crypto-native comparison readers who know BTC/ETH/SOL/stablecoins and want to place Kaspa correctly;
- Bitcoin/PoW readers who need the Nakamoto-consensus generalization, fair-launch, mining, UTXO, and sound-money framing;
- adoption and market-structure researchers who care about wallets, nodes, mining, fees, liquidity, integrations, builders, and durable usage;
- app/product designers who want to know what Kaspa-native applications should exist and what should not be copied from other chains;
- protocol engineers and researchers who care about GHOSTDAG, DAGKnight, pruning, ordering, latency assumptions, covenants, ZK verification, and vProgs;
- community educators who need careful, repeatable language without hype;
- journalists/analysts/source-checkers who need shipped-vs-roadmap status and primary references;
- LLMs/search systems retrieving accurate context.

A newcomer should have a slow path from `start-here.html` and `crypto-from-zero.html` into the Kaspa-specific pages. Intermediate readers should have compact overview, value, and comparison paths. Advanced readers should be able to skip directly into the relevant deep page, whether that is PoW/Kaspa thesis, app architecture, adoption metrics, shipped-vs-roadmap status, source maps, `CLAIMS.yml`, or LLM/source context. Cross-link the paths clearly, but do not force every page to be equally beginner-friendly and expert-dense at the same time.

At the start of any substantive repo session, current-check status-sensitive Kaspa facts on the web before editing or publishing. Recheck Toccata activation, DAGKnight, vProgs, native DeFi, RTD-derived attestations/oracles, TangVM, Proof of Useful Work, and date windows against primary or near-primary sources. Keep that discipline internal and in the source trail rather than as visible public verification boxes.

## Current Site Structure

The homepage should work as a router before it works as a deep article. The site now has two educational layers before the Kaspa-specific pages: a true zero-start path for readers who do not know basic crypto concepts, and a crypto-aware reality-check path for readers who understand crypto basics but need sharper judgment.

Keep these audience paths visible:

- Know literally nothing about crypto: start with `start-here.html`, then `crypto-from-zero.html`.
- Need the fast non-technical answer: use `overview.html` or `kaspa-in-one-screen.html`.
- Need to understand why coins have value or why there are so many coins: use `why-crypto-has-value.html`, `why-are-there-so-many-coins.html`, and `coin-atlas.html`.
- Need design constraints: use `tradeoff-map.html`.
- Need a coin-evaluation checklist: use `analyze-any-coin.html`.
- Need problem-first crypto history: use `crypto-history.html`.
- Need a compact shareable Kaspa artifact: use `kaspa-in-one-screen.html`.
- Need a business/adoption lens without price prediction: use `adoption-metrics.html`.
- New to crypto but already understands basic records/keys/blocks: use `what-crypto-is-good-for.html`.
- Need current shipped-vs-roadmap status: use `status.html`.
- Need a compact first-reader path: use `overview.html`.
- Know BTC/ETH/SOL/XRP/BNB/TRON but not Kaspa: start with `where-kaspa-fits.html`.
- Want mechanics: use `knowledge-map.html`.
- Want the app/design thesis: use `application-layer.html`.
- Want builder-specific programmability choices: use `builder-guide.html`.
- Want source-level verification: use `sources.html`, `status.html`, `CLAIMS.yml`, `llms.txt`, and `CONTENT_BRIEF.md`.
- Need quick term definitions: use `glossary.html`.
- Need to find a concept or page quickly: use `search.html`.

The homepage includes a Bitcoin-style chain vs Kaspa blockDAG visual. Keep that visual claim narrow: parallel honest blocks can be included and ordered by GHOSTDAG. Do not use it to imply unlimited throughput, instant finality, or that scaling is solved.

The `where-kaspa-fits.html` page should include a scannable comparison table near the top. The page's job is to help crypto-native readers understand what Kaspa is and is not competing with.

The `knowledge-map.html` page should start as an ordered learning path and then move into supporting source context.

The `status.html` page is the compact status reference. Keep it shorter than the source map. Its job is to separate live, targeted, roadmap, and research claims quickly.

Use the status page to show why source discipline matters. Public Kaspa summaries often mix live mainnet features, testnet work, third-party ecosystem projects, roadmap targets, and research claims; the site should separate those lanes before repeating a claim.

The status page may include a compact implementation-evidence section for current dev tracks. Keep it code-grounded and below the shipped-status line. As of 2026-05-06, the useful public evidence is: Silverscript/TN12 activity as Toccata polishing and field testing; kaspanet/vprogs April 15 ZK framework progress; and rusty-kaspa/dagknight March 22 prototype/refinement activity. Do not let this section become a hype feed or imply activation.

The `overview.html` page is the 90-second first-reader route. Keep it compact: what Kaspa is, what is live, what is not live, why it matters, and what to read next.

The `kaspa-in-one-screen.html` page is the shareable compression artifact. It should say what Kaspa is, what is live, why it matters if the thesis works, what is not live, and what signals would strengthen or weaken the thesis. Keep it status-labeled and non-promotional.

The `adoption-metrics.html` page is the business/adoption lens. It should avoid price prediction and instead explain wallets, node health, mining distribution, fees/block demand, liquidity, developer activity, integrations, and post-Toccata app signals as evidence categories.

The `application-layer.html` page is the app-opportunity and builder-imagination page. It should explain why someone would build on Kaspa without pretending every app is live. The page should not read like "Kaspa gets L2s too." It should explain the L1-first thesis: Kaspa L1 supplies shared sequencing, ordering, commitments, verification hooks, settlement, and neutral primitives; apps and runtimes add semantics, incentives, proving, and user experience around those primitives. Map what other crypto networks enabled, then translate those patterns into Kaspa-native lanes while preserving status discipline. Include the RTD internet-money flow as app-level research/architecture: a user defines a strategy around an external event, an application defines incentives for opt-in miners or rewarded reporters to attest, the system samples the PoW majority, and assets/logic on Kaspa can gain lower latency and closer atomicity. Do not imply this flow is shipped today or protocol-prescribed.

The `builder-guide.html` page is the builder-specific programmability router. It should help builders choose between covenants, based apps, inline ZK, and future full vProgs by asking about concurrency, state shape, and proof requirements. Keep Izio's progdoc material credited as builder guidance, not activation evidence. Keep Python SDK, TxIndex, Silverscript, and open PRs in builder/tooling lanes rather than protocol-status lanes.

For the app page specifically, the Bitcoin Takeover interview changes the framing in these ways:

- Explain the app thesis as money plus finance without compromising the L1 monetary base.
- Avoid Ethereum-style rollup language unless contrasting it with Kaspa's intended shared-sequencer/cohesive-program model.
- Describe "Solana-like" only as cohesive developer/user experience and native-feeling composability, not as Solana execution imported into Kaspa.
- Keep "one app per VM" / app-level verifiable-program intuition available for advanced readers, while explaining it first as apps proving their own logic while sharing Kaspa ordering.
- Treat DeFi, stable assets, lending, swaps, social recovery, vaults, bridges, and tokenized assets as things builders can target through staged primitives, not as live products.
- Make clear that core should not own the product layer: wallets, explorers, apps, oracles, bridges, and UX should be plural and community-built where possible.

The `glossary.html` page is the compact term map. Keep definitions short and plain.

## Editorial Standard

Use plain, direct language. Preserve a serious point of view, but do not hype.

Good style:

- specific nouns,
- concrete tradeoffs,
- clear status labels,
- useful comparisons,
- short explanations before jargon,
- links to source material.

Avoid:

- "crypto fixes everything",
- "Kaspa solved the trilemma",
- "Bitcoin but faster",
- "native DeFi is live",
- "DAGKnight is active",
- "Toccata is live" unless future primary sources confirm it,
- price targets,
- exchange rumors,
- market-cap or rank claims frozen into the explainer,
- vague claims like "revolutionary" without explaining the mechanism.
- repeated "not X but Y" framing on public pages,
- repeated contrast frames such as "not just", "not only", "more than just", "from X to Y", "whether you are X or Y", "this is not merely", "redefining", or "changing the way we think",
- over-polished LLM phrasing such as "delve", "tapestry", "seamless", "robust", "pivotal", "crucial", "unlock", "empower", "transform", "reimagine", "landscape", "journey", "at its core", "ultimately", or inflated adjectives that do not add a mechanism,
- brochure language such as "next-generation", "cutting-edge", "game-changing", "powerful platform", "accelerate innovation", "drive the future", or "pave the way",
- defensive caveat stacks where one status label or one source link would do the job.

Editing test: each public sentence should make a specific, necessary, defensible claim. If a sentence mainly adds polish, symmetry, or persuasion cadence, cut it or move the detail to the source/context stack.

Tone and visual weight:

- Use medium authority. The site should not sound small, apologetic, or unsure, but it should also avoid manifesto, pitch-deck, or definitive-guide posture.
- Write like a knowledgeable person helping a rushed reader choose the right path.
- Use medium visual weight. Headings, cards, callouts, and diagrams should be clear and confident, not oversized or theatrical. Use size to create hierarchy, not drama.
- Prefer humble guidance: "start here", "check this lane", "use this distinction", "current boundary", "what exists now", and "what may come later."
- Avoid turning every heading into a grand claim, final answer, or abstract thesis.
- Let interest come from concrete usefulness. The site can be Kaspa-positive without sounding promotional.

## Status Lanes

Keep these categories separate.

### Live / Factual Now

- Proof of Work blockDAG
- UTXO model
- GHOSTDAG consensus
- Crescendo 10 BPS era
- real-time decentralization as the core fast-PoW value proposition: Bitcoin-style PoW security and censorship-resistance goals with seconds-scale confirmation feel under normal network conditions
- pruning and UTXO commitments
- public wallets, explorers, visualizers, nodes, mining ecosystem

### Near-Term / Implementation Track

- Toccata hard fork
- covenants
- Silverscript
- ZK verification foundations
- sequencing commitments
- vProgs groundwork

Status note: Toccata should not be described as live mainnet functionality unless current primary sources confirm activation. Michael Sutton's April 2026 Toccata outlook is the clearest implementation-context source for the public mainnet activation target of roughly June 5-20, 2026, after the original May 5 target moved so sequencing-commitment/KIP-21 architecture could be finalized before zk systems bind to it.

### Roadmap / Architecture

- vProgs as app-level verifiable programs
- Kaspa-native DeFi rails
- monolithic-feeling developer experience without global L1 execution of every app
- synchronous composability across programs
- vProgs as a deeper application-architecture direction

### Research / Speculative

- DAGKnight final form and activation timing
- 100 BPS with probabilistic predecessor selection
- App-level miner attestation, oracle, TangVM, and coordination-market incentive designs
- RTD internet-money flows where miners or reporters attest to external events and apps react atomically
- TangVM-style reality-state ideas
- Proof of Useful Work via matrix multiplication
- long-term post-quantum migration paths

## Current Core Framing

Kaspa is best framed as:

> A Proof of Work blockDAG that generalizes Nakamoto consensus so parallel honest blocks can contribute to ordering instead of being discarded as ordinary orphans.

The stronger comparison is not "faster Bitcoin." It is:

> Keep Proof of Work and UTXO instincts, remove the single-file blockchain bottleneck with a blockDAG, and move toward bounded, verification-oriented programmability.

Do not imply that Bitcoin has no latency parameter or network-timing assumption. Bitcoin's 10-minute block interval also assumes network latency is much smaller than the block interval; one useful shorthand is that Bitcoin behaves like the k=0 edge case in this family of Nakamoto/GHOSTDAG-style reasoning. The useful contrast is not "Bitcoin is unparameterized, Kaspa is parameterized." The useful contrast is how Kaspa exposes, raises, and eventually aims to adapt the block-rate/latency tradeoff while allowing parallel honest blocks to contribute to ordering.

## Fast Proof-of-Work Framing

Keep the fast-PoW argument focused and careful. Fast inclusion and fast confirmations are different:

- Fast inclusion: how quickly a transaction enters a block.
- Fast confirmations: how quickly the system gives strong confidence that the transaction will not be reversed.

Any high-rate block-producing system can improve inclusion. Kaspa's stronger argument is that fast Proof of Work changes the confirmation/decentralization tradeoff. PoW samples hash power through work done after the fact, without requiring the protocol to identify and collect explicit supermajority votes from miners before every confirmation. In PoS finality designs, confirmation speed is more directly tied to stake voting, validator coordination, stake distribution, committees, or related sampling assumptions.

Do not overclaim this. Do not state that Kaspa has instant finality, that all PoS systems are equivalent, or that the site has fully modeled Ethereum/Solana engineering details. The durable, site-appropriate claim is narrower: fast PoW blockDAGs make the inclusion/confirmation/decentralization tradeoff different, and that is one reason Kaspa is worth studying.

Crescendo-specific nuance: do not turn 10 BPS into "10x finality." Michael Sutton's public Crescendo explanation framed practical throughput as roughly 8-9x higher under the observed policy and confirmation-time improvement as closer to 30%, because confirmation remains dominated by block latency. Use this to correct summaries that imply unlimited throughput, instant finality, or a clean 10x confirmation improvement.

## Crypto Reality-Check Framing

The `what-crypto-is-good-for.html` page is a general-audience bridge for people who do not live inside crypto. It should make the rest of the site more credible by stating that crypto is not useful for everything.

The `start-here.html` and `crypto-from-zero.html` pages are the true zero-start path. They should not assume the reader knows decentralization, blocks, mining, tokens, market cap, keys, privacy tradeoffs, UTXO, or consensus. Teach the problem first, the mechanism second, the tradeoff third, and Kaspa fourth.

The `why-crypto-has-value.html`, `why-are-there-so-many-coins.html`, `coin-atlas.html`, `tradeoff-map.html`, `analyze-any-coin.html`, and `crypto-history.html` pages are the market and context layer. They should explain valuation, categories, token necessity, launch design, actors, incentives, scams, and design constraints without becoming investment advice or price prediction.

Core frame:

> Crypto is useful when the problem needs credible shared state: neutral ownership records, adversarial trust, self-custody, global 24/7 settlement, censorship resistance, programmable assets, on-chain markets, objective smart-contract escrow, digital provenance, or open-network incentives.

Keep the weakness side just as explicit. Crypto is usually weak for normal domestic payments in strong banking systems, consumer reversibility, private records, ordinary corporate databases, unsecured real-world credit, replacing courts, supply-chain truth, identity, and tokenizing assets whose ownership still depends on law, custody, inspection, liens, taxes, and jurisdiction.

This page should not become anti-crypto or pro-crypto. Its purpose is conditional judgment: crypto is real when credible shared state matters, and theater when a trusted operator, legal process, or normal database solves the problem better.

The `why-kaspa-matters.html` page is the Kaspa-specific bridge from the general crypto reality check. It should explain why Kaspa matters when credible shared state, fast settlement, self-custody, censorship resistance, future verification-oriented programmability, and open coordination matter.

Core frame:

> Kaspa asks whether Proof-of-Work can keep its security model while feeling closer to real time, using fast settlement, parallel block production, and future verification-oriented programmability.

Keep this page tightly status-labeled. GHOSTDAG, the UTXO model, Proof of Work, Crescendo 10 BPS, and the base RTD framing are live enough to describe as Kaspa's present value proposition: real-time Bitcoin-style PoW settlement and censorship-resistance goals, rather than faster payments alone. Toccata, covenants, Silverscript, ZK foundations, sequencing commitments, and vProgs groundwork are the near-term implementation track. vProgs and native DeFi are roadmap architecture. DAGKnight, app-level miner attestation incentives, oracle/TangVM flows, and coordination-market applications remain research or architecture thesis unless future primary sources confirm activation or shipped software.

The `sources.html` page is the public source hierarchy and attribution page. Use it to centralize credits, Kaspa.com Learn Kaspa links, external references, and public crawl/LLM file links instead of adding distracting footnote walls to every human-facing page. The homepage should stay a human-first router: three primary actions, four main reader paths, one short status boundary, a compact app-layer preview, and a clear handoff to the source/context stack.

Design for two human modes at once: a rushed reader who needs the right page in seconds, and an interested reader who wants depth after choosing a lane. Long pages should provide jump links near the top. Dense source lists, changelogs, and implementation evidence can use `<details>` so the core explanation stays scannable. Do not hide the main thesis, status boundary, or first useful answer behind a toggle.

## Programmability Framing

Be careful with app-layer claims.

DAGKnight has the better-developed research lineage and appears further along implementation-wise than vProgs, while neither should be described as already-live mainnet functionality unless primary sources confirm activation. This nuance belongs in status discipline and research context; it does not need to be repeated everywhere.

Avoid using "Kaspa DAGKnight is WWIII-resistant" as public headline copy. If it appears as community shorthand, keep it clearly framed as an adversarial-latency resilience research/implementation goal, not as a live-mainnet guarantee.

Toccata and vProgs are related but distinct. Toccata/Covenants++ is the nearer L1 hard-fork track for bounded UTXO programmability, covenant IDs, Silverscript, ZK-facing verification work, sequencing commitments, native-asset groundwork, and standalone based-zk experiments. vProgs are the longer app architecture built around shared Kaspa sequencing, computational-DAG metadata, prover-backed execution, and eventual synchronous composability. Do not describe them as competing chains, rival clients, or both already-live app rails.

Kaspa programmability should be framed as neutral primitives first. The protocol should expose durable L1 surfaces; apps define incentives, semantics, oracle sources, legal/risk constraints, and user-facing products. Apply that rule to attestations, prediction markets, DePIN freshness markets, portfolio automation, launch rails, AI-agent task boards, and DeFi.

The Toccata/vProgs capability split should be precise. Toccata gives L1 covenant programming and standalone based-zk application foundations: covenants, Silverscript, ZK verification opcodes, sequencing commitment access, partitioned sequencing commitments, native-asset groundwork, and bridge/settlement patterns. Hans Moog's `kaspanet/vprogs` repo is an early Rust framework for based computation on Kaspa with scheduler, resource access, batch execution, rollback, storage/state layers, node VM, L1 bridge, and ZK proving pipeline. Its immediate role is compatible based computation/runtime work, while full vProgs synchronous composability is later architecture.

Builder tooling belongs in its own lane. The standalone `kaspanet/kaspa-python-sdk` repo and v1.1.0 release are useful evidence for Python integration, virtual-chain access, and UTXO tracking through UtxoProcessor/UtxoContext, but they do not change protocol status. TxIndex PR #860 is builder/infrastructure evidence while open; Fast Trusted Relay PR #930 is an infrastructure experiment and should not be presented as stable release evidence while it remains WIP/draft.

Avoid saying Kaspa needs independent L2s in the Ethereum-rollup sense. The stronger thesis is L1-first and shared-sequencer-first: applications add programmability directly against Kaspa L1 primitives, while based-zk systems and future vProgs use Kaspa L1 for sequencing, commitments, settlement, and verification rather than creating separate sequencer empires.

vProgs should be described as app-level verifiable programs or app-level ZKVM/verifiable-program environments. Do not flatten them into ordinary rollups. The intended direction is a native-feeling, cohesive developer/user experience while keeping L1 focused on sequencing, commitments, verification, and metadata rather than executing every app's logic.

For application-layer discussion, treat Michael Sutton's vProgs framing as a roadmap target for one-dimensional program space, shared Kaspa L1 sequencing, synchronous composability, computational DAG metadata, prover incentives, and sovereignty obligations. Covenant++ milestone notes can inform the staged path: inline zk covenants, based zk covenants, canonical bridges, native-asset bridge work, and efficient sequencing commitments. STARK-sized proof support and standard minimum fee changes are design questions unless future primary sources confirm mainnet activation.

## Long-Form Interview Model

Bitcoin Takeover S16 E41, the 2025 Yonatan Sompolinsky interview, should guide the shape of the explanation: Kaspa as a generalization of Nakamoto consensus, the blockDAG as a framework whose value depends on ordering, GHOSTDAG as current mainnet behavior, DAGKnight as future/adaptive consensus work, vProgs as native-feeling app architecture, and community context as part of decentralization.

Use the interview as an editorial model, not as a public slogan. It shows the target feel for the site: patient first-principles reasoning, everyday examples, willingness to compare Bitcoin/Ethereum/Solana without tribal shortcuts, clear admission of uncertainty, and careful distinction between live protocol, roadmap, and aspiration.

Do not turn the interview's roadmap discussion, demos, or aspirations into live-status claims. In particular: native DeFi is not live, DAGKnight is not live, vProgs are not live, 100 BPS is aspirational, pruning is not privacy, and Solana-like means cohesive developer/user experience rather than importing Solana execution into Kaspa L1.

## Source Hierarchy

Prefer primary or near-primary sources:

1. Primary protocol/code: `kaspanet/rusty-kaspa`, releases, KIPs, Kaspa Research, and protocol documentation.
2. Core-dev explainers: Michael Sutton technical posts, Ori Newman, Coder of Stuff, Hashdag/Yonatan, and other active technical builders.
3. Long-form framing source: Bitcoin Takeover S16 E41. It is high-signal for explanatory framing and status nuance, but activation claims still need primary protocol/code or direct implementation evidence.
4. Community/context sources: Oxford, KASmedia, Kaspa.com Learn Kaspa, Kaspa.org, full recordings, interviews, transcripts, recaps, and public portals. They are useful contributions, not protocol authority.
5. Learning references: Kaspa.com Learn Kaspa / Kaspa Facts for approachable intro/intermediate concept explanations. Credit this source when using its explanations, but treat it like community education and verify shipped-feature and activation claims against primary protocol/code sources.
6. Discovery only: active public technical X accounts and replies.

Kaspa.org, KASmedia, Kaspa.com Learn Kaspa, and similar public/community resources are not official or authoritative protocol sources. They can orient readers and point into stronger material, but status-sensitive claims should come from code, releases, KIPs, research papers, protocol documentation, or direct implementation notes from core technical contributors.

Use X cautiously. It is useful for current builder commentary, links, replies, and corrections. It is weak for shipped-feature claims unless backed by code, KIPs, releases, or durable long-form sources.

Do not use stale team pages, recycled handle lists, or contributor pages to infer current involvement.

External-source rule: credit outside sources by name and link near the relevant claim or through `sources.html`. Do not copy external articles into the site. Paraphrase, synthesize, and point readers to the original source.

Kaspa.com Learn Kaspa status: treat the article set as a useful third-party learning library for BlockDAG, GHOSTDAG, DAG terminology, parents/mergesets, blue score/blue work, k-clusters, pruning, UTXO, MuHash, finality, transaction selection, mass, opcodes, KIPs, and node types. Recheck it before relying on it for newly changed concepts. Do not plaster this source across the main pages or use it as the primary authority for status claims.

The May 2026 Kaspa.com Smart Contracts article is useful because it separates programmability into layers and includes a chess covenant walkthrough. Use that chess material as a concrete example of UTXO state-machine design: registration state, player state, game state, move-routing transactions, move-application transactions, and final settlement. Do not frame it as proof that a mature app ecosystem is live.

## Public Crawl Map

The sitemap should include public human pages and LLM/crawler files:

- `/`
- `/start-here.html`
- `/crypto-from-zero.html`
- `/why-crypto-has-value.html`
- `/why-are-there-so-many-coins.html`
- `/coin-atlas.html`
- `/tradeoff-map.html`
- `/analyze-any-coin.html`
- `/crypto-history.html`
- `/kaspa-in-one-screen.html`
- `/adoption-metrics.html`
- `/application-layer.html`
- `/overview.html`
- `/what-crypto-is-good-for.html`
- `/status.html`
- `/faq.html`
- `/why-kaspa-matters.html`
- `/where-kaspa-fits.html`
- `/knowledge-map.html`
- `/glossary.html`
- `/search.html`
- `/sources.html`
- `/about.html`
- `/llms.txt`
- `/CONTENT_BRIEF.md`
- `/README.md`
- `/CLAIMS.yml`

Do not advertise `AGENTS.md` in `sitemap.xml`. It can remain publicly reachable as a repository file, but it is local agent guidance rather than a public content surface.

## Active Public Technical Accounts

Useful for discovery and replies:

- https://x.com/hashdag
- https://x.com/michaelsuttonil
- https://x.com/OriNewman
- https://x.com/hus_qy
- https://x.com/IzioDev
- https://x.com/coderofstuff_
- https://x.com/FreshAir08
- https://x.com/eliottmea
- https://x.com/KasSigner

Read replies as well as top-level posts when researching a current technical point.

## Transcript and Video Handling

Use video transcripts as source material, not as automatic website copy.

Workflow:

1. Find the exact recording URL or video ID.
2. Check whether a transcript is visible in YouTube UI, Podscan, podcast pages, or another attributable transcript page.
3. Treat transcript mirrors as weaker than the recording page, podcast page, KASmedia recap, or user-supplied transcript unless timing and attribution are preserved.
4. Keep recaps and transcripts separate.
5. Promote only the strongest non-duplicative points to the homepage.
6. Put deeper transcript notes in `CONTENT_BRIEF.md`, `llms.txt`, `CLAIMS.yml`, or source docs.

Important transcript-backed sources currently used:

- https://www.youtube.com/live/GaJmYV8OHfQ
- https://podscan.fm/podcasts/bitcoin-takeover-podcast/episodes/s16-e41-yonatan-sompolinsky-on-bitcoin-kaspa-amp-proof-of-work
- https://kasmedia.com/article/weeklyknight-08282025
- https://www.youtube.com/watch?v=VIZGKoIaGR0
- https://www.youtube.com/watch?v=S1dS1xvvFss
- https://www.youtube.com/watch?v=xHlOcR1x2tU
- https://www.youtube.com/watch?v=p21KDrKEhB8

## Quantum Framing

Do not describe Kaspa as quantum-safe today.

Do not conflate mining hashes with transaction signatures. Proof of Work and wallet authorization face different quantum questions.

Do not describe Toccata as the quantum upgrade. Treat post-quantum readiness as a separate migration topic unless primary builders publish a concrete plan.

Useful quantum-answer frame:

- wallets,
- exchanges,
- exposed public keys,
- old UTXOs,
- new address formats,
- signature size,
- verification cost,
- user coordination.

## Site Structure

Primary public pages:

- `index.html` - audience-routed homepage, real-time Proof-of-Work thesis, status lanes, zero-start links, and compact Kaspa/adoption routes.
- `start-here.html` - true beginner router for readers who know nothing about crypto or Kaspa.
- `crypto-from-zero.html` - causal ladder from records, keys, transactions, blocks, consensus, incentives, tokens, and tradeoffs to Kaspa.
- `why-crypto-has-value.html` - market-value explainer for token need, prices, market cap, open markets, speculation, launch design, and who benefits.
- `why-are-there-so-many-coins.html` - category bridge explaining why major crypto assets are not all trying to do the same job.
- `coin-atlas.html` - coin-category atlas and value-stack map for BTC, ETH, stablecoins, SOL, BNB, XRP, LTC, BCH, XMR, DOGE, LINK, and KAS.
- `tradeoff-map.html` - beginner tradeoff map for speed, security, decentralization, privacy, scaling, nodes, ASICs, staking, launch design, and Kaspa.
- `analyze-any-coin.html` - practical checklist for evaluating token necessity, supply, launch, validation, liquidity, market cap, risks, and beneficiaries.
- `crypto-history.html` - problem-first history map from digital cash and Bitcoin through Ethereum, ICOs, DeFi, stablecoins, rollups, and Kaspa.
- `kaspa-in-one-screen.html` - compact shareable Kaspa thesis with live/not-live/status-labeled framing.
- `adoption-metrics.html` - non-price adoption and business lens for wallets, nodes, mining, fees, liquidity, builders, integrations, and post-Toccata app signals.
- `application-layer.html` - status-labeled application-layer opportunity map for what builders can use now and what Toccata, vProgs, RTD, and coordination-market research may enable later.
- `builder-guide.html` - builder-specific programmability router for covenants, based apps, inline ZK, future full vProgs, SDKs, and infrastructure evidence.
- `overview.html` - 90-second overview for first-time readers.
- `what-crypto-is-good-for.html` - reality-check page explaining where crypto itself is useful, where it is weak, and why Kaspa should be judged where credible shared state matters.
- `status.html` - compact status page for live, targeted, roadmap, and research items.
- `faq.html` - direct search-friendly answers for common Kaspa status and concept questions.
- `why-kaspa-matters.html` - Kaspa-specific bridge page explaining how Kaspa maps to crypto's useful jobs without claiming the roadmap is already live.
- `where-kaspa-fits.html` - category-fit page for comparing Kaspa with other crypto categories.
- `knowledge-map.html` - ordered concept map for average crypto readers, with supporting source context.
- `glossary.html` - compact plain-English glossary for common Kaspa terms.
- `search.html` - dependency-free static page-map search for concepts, audiences, status lanes, and source terms.
- `sources.html` - public source hierarchy, external reference map, Kaspa.com Learn Kaspa topic index, and public crawl map.
- `about.html` - public editorial policy, disclosures, correction handling, and accountability page.
- `CLAIMS.yml` - lightweight status ledger for sensitive live/targeted/roadmap/research claims and forbidden overclaims.

LLM/source files:

- `llms.txt` - compact LLM-facing context.
- `CONTENT_BRIEF.md` - editorial/project handoff.
- `README.md` - repo setup, source discipline, and deployment notes.
- `AGENTS.md` - local coding-agent instructions.

## Update Workflow

Before changing claims:

1. Identify whether the claim is live, near-term, roadmap, or research.
2. Check primary or near-primary sources.
3. Prefer exact links over paraphrased rumors.
4. Do not use current X posts alone for activation or shipped-feature status.
5. Keep homepage copy general-audience friendly.
6. Put dense technical detail in `llms.txt`, `CLAIMS.yml`, source docs, or this brief.
7. Run basic checks before publishing:
   - `bash scripts/check-site.sh`
   - `bash scripts/check-links.sh` when source/reference URLs change
   - `git diff --check`
   - link check for new URLs
   - mobile/desktop layout check for HTML/CSS changes
   - verify `CNAME`, `robots.txt`, `sitemap.xml`, and `llms.txt` still point to `https://kaspaexplained.com/`

## Interpretation Rules for LLMs

- Do not describe DAGKnight, vProgs, app-level attestations/oracles, TangVM, Proof of Useful Work, post-quantum migration, native DeFi, or Toccata as live unless newer primary sources confirm activation. Do not flatten RTD itself into only future oracle work; Hashdag frames base RTD as Kaspa's real-time Bitcoin-style PoW value proposition, with downstream app-level oracle/TangVM/coordination-market systems as extensions.
- Prefer primary sources, code, KIPs, releases, and core-developer posts over X summaries, market articles, or AI-generated market pages.
- Distinguish fast inclusion from finality, live payment/settlement functionality from app-layer programmability, and roadmap architecture from shipped mainnet features.
- Do not reduce Kaspa's speed argument to block rate alone. The stronger fast-PoW argument is about inclusion, confirmation confidence, and decentralization tradeoffs.
- Do not import price targets, exchange rumors, whale-accumulation narratives, or investment advice into Kaspa Explained.

## Publishing Notes

This is a static GitHub Pages site. The domain is `kaspaexplained.com`.

Preserve:

- `CNAME` exactly as `kaspaexplained.com`
- `robots.txt` sitemap URL
- `sitemap.xml` canonical URLs
- clear live/near-term/roadmap/research separation

After pushing, verify the live site before claiming a change is live. GitHub Pages can serve cached pages for a short period after push.
