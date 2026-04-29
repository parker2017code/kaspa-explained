# Kaspa Explained Content Brief

This document is the handoff brief for any LLM, editor, or contributor working on `kaspaexplained.com`.

## Project Goal

Kaspa Explained is an independent, source-first explainer for Kaspa. The goal is to help a general crypto-aware audience understand where Kaspa fits without turning roadmap, research, price action, or community enthusiasm into unsupported claims.

The site should answer:

- What is Kaspa actually live with today?
- What is being implemented next?
- What is roadmap architecture?
- What is still research or speculation?
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

## Programmability Framing

Be careful with app-layer claims.

DAGKnight has the better-developed research lineage and appears further along implementation-wise than vProgs, while neither should be described as already-live mainnet functionality unless primary sources confirm activation. This nuance belongs in status discipline and research context; it does not need to be repeated everywhere.

"Kaspa DAGKnight is WWIII-resistant" can be used as a concise one-liner for DAGKnight's adversarial-latency resilience thesis. Keep it clearly framed as a research/implementation goal, not as a live-mainnet guarantee.

vProgs should be described as app-level verifiable programs or app-level ZKVM/verifiable-program environments. Do not flatten them into ordinary rollups. The intended direction is a native-feeling, cohesive developer/user experience while keeping L1 focused on sequencing, commitments, verification, and metadata rather than executing every app's logic.

## Source Hierarchy

Prefer primary or near-primary sources:

1. `hashd.ag` and `hashd.ag/raw`
2. Michael Sutton technical posts
3. `kaspanet/rusty-kaspa` code and releases
4. Kaspa Research and KIPs
5. Kaspa Q&A
6. KASmedia interviews and recaps
7. full podcast/video recordings and transcripts
8. active public technical X accounts and replies, used for discovery and clarification

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

## Publishing Notes

This is a static GitHub Pages site. The domain is `kaspaexplained.com`.

Preserve:

- `CNAME` exactly as `kaspaexplained.com`
- `robots.txt` sitemap URL
- `sitemap.xml` canonical URLs
- clear live/near-term/roadmap/research separation

After pushing, verify the live site before claiming a change is live. GitHub Pages can serve cached pages for a short period after push.
