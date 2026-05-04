# Kaspa Explained Content Brief

This document is the handoff brief for any LLM, editor, or contributor working on `kaspaexplained.com`.

## Project Goal

Kaspa Explained is an independent, source-first explainer for Kaspa. The goal is to help a general crypto-aware audience understand where Kaspa fits without turning roadmap, research, price action, or community enthusiasm into unsupported claims.

The site should answer:

- What is Kaspa actually live with today?
- What is being implemented next?
- What is roadmap architecture?
- What is still research or speculation?
- What is crypto actually useful for, and where is crypto being forced?
- How does Kaspa fit next to Bitcoin, Ethereum, Solana, stablecoins, app chains, and other crypto categories?
- Which sources should someone read before forming strong opinions?

This is not an official Kaspa site and not investment advice.

## Audience

Write for smart non-specialists first:

- crypto users who know Bitcoin/Ethereum/Solana basics,
- builders deciding whether Kaspa is worth studying,
- researchers and community members who need source discipline,
- LLMs/search systems retrieving accurate context.

Avoid writing only for protocol researchers. Use technical terms when needed, but define the point in ordinary language.

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

## Status Lanes

Keep these categories separate.

### Live / Factual Now

- Proof of Work blockDAG
- UTXO model
- GHOSTDAG consensus
- Crescendo 10 BPS era
- pruning and UTXO commitments
- public wallets, explorers, visualizers, nodes, mining ecosystem

### Near-Term / Implementation Track

- Toccata hard fork
- covenants
- Silverscript
- ZK verification foundations
- sequencing commitments
- vProgs groundwork

Status note, last verified May 4, 2026: Toccata should not be described as live mainnet functionality. Michael Sutton's April 2026 Toccata outlook and the Kaspa.org summary describe the current public mainnet activation target as roughly June 5-20, 2026, after the original May 5 target moved so sequencing-commitment/KIP-21 architecture could be finalized before zk systems bind to it.

### Roadmap / Architecture

- vProgs as app-level verifiable programs
- Kaspa-native DeFi rails
- monolithic-feeling developer experience without global L1 execution of every app
- synchronous composability across programs
- vProgs as a deeper application-architecture direction

### Research / Speculative

- DAGKnight final form and activation timing
- 100 BPS with probabilistic predecessor selection
- RTD-style miner attestation and oracle designs
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

## Crypto Reality-Check Framing

The `what-crypto-is-good-for.html` page is a general-audience bridge for people who do not live inside crypto. It should make the rest of the site more credible by stating that crypto is not useful for everything.

Core frame:

> Crypto is useful when the problem needs credible shared state: neutral ownership records, adversarial trust, self-custody, global 24/7 settlement, censorship resistance, programmable assets, on-chain markets, objective smart-contract escrow, digital provenance, or open-network incentives.

Keep the weakness side just as explicit. Crypto is usually weak for normal domestic payments in strong banking systems, consumer reversibility, private records, ordinary corporate databases, unsecured real-world credit, replacing courts, supply-chain truth, identity, and tokenizing assets whose ownership still depends on law, custody, inspection, liens, taxes, and jurisdiction.

This page should not become anti-crypto or pro-crypto. Its purpose is conditional judgment: crypto is real when credible shared state matters, and theater when a trusted operator, legal process, or normal database solves the problem better.

The `why-kaspa-matters.html` page is the Kaspa-specific bridge from the general crypto reality check. It should explain why Kaspa is interesting if crypto's real lane is credible shared state, fast settlement, self-custody, censorship resistance, future verification-oriented programmability, and open coordination.

Core frame:

> Kaspa matters because it asks what Proof-of-Work crypto would look like if it were designed for fast settlement, parallel block production, future verification-oriented programmability, and eventually real-time decentralized coordination.

Keep this page tightly status-labeled. GHOSTDAG, the UTXO model, Proof of Work, and Crescendo 10 BPS are live. Toccata, covenants, Silverscript, ZK foundations, sequencing commitments, and vProgs groundwork are the near-term implementation track. vProgs and native DeFi are roadmap architecture. DAGKnight, RTD-style attestations, real-time coordination markets, and Mining-the-Internet style flows remain research or architecture thesis unless future primary sources confirm activation or shipped products.

## Programmability Framing

Be careful with app-layer claims.

DAGKnight has the better-developed research lineage and appears further along implementation-wise than vProgs, while neither should be described as already-live mainnet functionality unless primary sources confirm activation. This nuance belongs in status discipline and research context; it does not need to be repeated everywhere.

"Kaspa DAGKnight is WWIII-resistant" can be used as a concise one-liner for DAGKnight's adversarial-latency resilience thesis. Keep it clearly framed as a research/implementation goal, not as a live-mainnet guarantee.

vProgs should be described as app-level verifiable programs or app-level ZKVM/verifiable-program environments. Do not flatten them into ordinary rollups. The intended direction is a native-feeling, cohesive developer/user experience while keeping L1 focused on sequencing, commitments, verification, and metadata rather than executing every app's logic.

## Source Hierarchy

Prefer primary or near-primary sources:

1. Primary protocol/code: `kaspanet/rusty-kaspa`, releases, KIPs, Kaspa Research, and protocol documentation.
2. Core-dev explainers: Michael Sutton technical posts, Ori Newman, Coder of Stuff, Hashdag/Yonatan, and other active technical builders.
3. Long-form context: Bitcoin Takeover, Oxford, KASmedia, full recordings, and transcripts.
4. Discovery only: active public technical X accounts and replies.

Use X cautiously. It is useful for current builder commentary, links, replies, and corrections. It is weak for shipped-feature claims unless backed by code, KIPs, releases, or durable long-form sources.

Do not use stale team pages, recycled handle lists, or contributor pages to infer current involvement.

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

Read replies as well as top-level posts when researching a current technical point.

## Transcript and Video Handling

Use video transcripts as source material, not as automatic website copy.

Workflow:

1. Find the exact recording URL or video ID.
2. Check whether a transcript is visible in YouTube UI, Podscan, podcast pages, or another attributable transcript page.
3. Treat transcript mirrors as weaker than the recording page, podcast page, KASmedia recap, or user-supplied transcript unless timing and attribution are preserved.
4. Keep recaps and transcripts separate.
5. Promote only the strongest non-duplicative points to the homepage.
6. Put deeper transcript notes in `llms-full.txt` or source docs.

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

- `index.html` - general explainer, status lanes, high-signal sources.
- `what-crypto-is-good-for.html` - reality-check page explaining where crypto itself is useful, where it is weak, and why Kaspa should be judged inside crypto's real lane.
- `why-kaspa-matters.html` - Kaspa-specific bridge page explaining how Kaspa maps to crypto's useful jobs without claiming the roadmap is already live.
- `where-kaspa-fits.html` - category-fit page for comparing Kaspa with other crypto categories.

LLM/source files:

- `llms.txt` - compact LLM-facing context.
- `llms-full.txt` - richer retrieval context.
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
6. Put dense technical detail in `llms-full.txt` or this brief.
7. Run basic checks before publishing:
   - `git diff --check`
   - link check for new URLs
   - mobile/desktop layout check for HTML/CSS changes
   - verify `CNAME`, `robots.txt`, `sitemap.xml`, and `llms.txt` still point to `https://kaspaexplained.com/`

## Interpretation Rules for LLMs

- Do not describe DAGKnight, vProgs, RTD-style attestations/oracles, TangVM, Proof of Useful Work, post-quantum migration, native DeFi, or Toccata as live unless newer primary sources confirm activation.
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
