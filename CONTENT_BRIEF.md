# Kaspa Explained Content Brief

This document is the handoff brief for any LLM, editor, or contributor working on `kaspaexplained.com`.

## Project Goal

Kaspa Explained is an independent explainer for Kaspa. The purpose is to help a general crypto-aware audience understand where Kaspa fits without turning roadmap, research, price action, or community enthusiasm into unsupported claims.

The ideal voice is Yonatan-style first-principles explanation translated into everyday language: start from Bitcoin, money, ordering, latency, trust, and finance; make the intuition clear enough for the intended reader of the page; then preserve enough precision in the appropriate deeper paths for crypto-native readers, researchers, builders, and source-checking experts. Do not make the public site talk about internal editorial slogans. Just make the pages read that way.

Public pages should be shorter than the evidence stack. Put detailed source trails, implementation notes, and LLM guardrails in `CLAIMS.yml`, `sources.html`, and this brief. Human-facing pages should lead with the affirmative idea, then add a boundary only where a reader might confuse live, targeted, roadmap, and research claims.

Use `COPY_STYLE.md` as the repo-wide sentence standard. Keep a sentence when it adds an actor, action, evidence, status label, constraint, consequence, reader-relevant distinction, or judgment. Cut it when a competent stranger could have written it without knowing Kaspa.

### Attention Budget

Writing is cheap now. Reader evaluation is still expensive. Kaspa Explained should treat attention as the binding constraint on every public page.

Research basis: Pew Research Center reported in June 2026 that 49% of U.S. adults say they use AI chatbots. Noy and Zhang found ChatGPT reduced time on professional writing tasks by 40% in their experiment. Nielsen Norman Group estimates users often read about 20% of text on an average web page. Herbert Simon's information-rich-world work remains the right operating model: abundant information consumes attention.

The site rule is density. Shortness alone is insufficient. A long page can stay long when each section adds a fact, distinction, consequence, image, argument, decision, or source path. A short page still fails if it uses generic transitions, padded summaries, or claims the reader cannot verify.

Default editing question: what claim does this sentence make, what evidence or status supports it, and what would the reader lose if it disappeared? If the answer is "nothing," cut it. Compress until compression damages meaning.

First sentences should orient the reader or create pressure. The next sentence should pay it off with mechanism, evidence, boundary, or action.

### Concrete-First Translation

Reader and crawler explanations should use Concrete-First Translation: make the reader see the real object, action, or tradeoff before naming the abstraction. Give the reader a real picture first, then the technical name:

- "one shared record without one operator" before "credible shared state",
- "apps that prove their own rules" before "verification-oriented programmability",
- "funding rules strangers can rely on" before "coordination markets",
- "fast mined ordering" before "settlement layer" or "sequencing",
- "assets, vaults, markets, and commitments" before generic "programmability".

Do not remove the technical terms where they are needed for precision, search, or source matching. Put them after the plain idea so the page is easier to understand without becoming less accurate. This applies to public HTML, meta descriptions, search cards, `llms.txt`, and contributor-facing handoff files.

The deeper mental model: abstraction is a compression format. A reader should first know what moves, who controls it, what can go wrong, and what the mechanism changes. Then the compact term can help them remember and search for it.

Crypto translation rule: use the crypto term only when it helps precision, search, or source matching. Then immediately translate it into what someone is testing, buying, building, approving, measuring, or trying to avoid. "Decentralized coordination" means people can agree on one shared record without one company controlling it. "Infrastructure" means wallets, exchanges, custody, APIs, indexers, explorers, liquidity, accounting, support, and uptime. "Programmability" means a wallet, app, or script can show which rule allowed, refused, or recorded an action. The practical questions are speed, security, wallets, exchange support, liquidity, developer tools, and whether users have a reason to come back.

This sits beside source checks and current-status checks. Source checks ask whether a claim is true and sourced. Current-status checks ask whether it is mainnet, testnet, future upgrade work, research, unsupported, or outside L1 scope. Concrete-First Translation asks whether a normal reader can immediately picture what the claim means.

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
- crypto-native readers who also know XRP, BNB, TRON, stablecoin payment paths, and exchange-linked ecosystems,
- curious newcomers who need a beginner path before technical material,
- builders deciding whether Kaspa is worth studying,
- researchers and community members who need source discipline,
- LLMs/search systems retrieving accurate context.

Avoid writing only for protocol researchers. Use technical terms when needed, but define the point in ordinary language.

Audience paths should be distinct. The site should serve the whole spectrum:

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

A newcomer should have a slow path from `start-here.html` and `crypto-from-scratch.html` into the Kaspa-specific pages. Intermediate readers should have compact overview, value, and comparison paths. Advanced readers should be able to skip directly into the relevant deep page, whether that is PoW/Kaspa thesis, app architecture, adoption metrics, shipped-vs-roadmap status, source guides, `CLAIMS.yml`, or LLM/source context. Cross-link the paths clearly, but do not force every page to be equally beginner-friendly and expert-dense at the same time.

At the start of any substantive repo session, current-check status-sensitive Kaspa facts on the web before editing or publishing. Recheck Toccata activation, DAGKnight, vProgs, native DeFi, RTD-derived attestations/oracles, TangVM, Proof of Useful Work, and date windows against primary or near-primary sources. Keep that discipline internal and in the source trail. Do not add visible public verification boxes unless the task asks for them.

Use `.github/notes/COPY_CLEANUP_PLAN.md` for public wording cleanup. The standard is short: what someone can do, what evidence or source backs it, what is still missing, and what to read or try next. Avoid vague roadmap language, repeated disclaimers, grand claims before evidence, fake-official labels, internal notes on public pages, and jargon before concrete examples.

## Current Site Structure

The site has 25 live pages. `sitemap.xml` and `site-manifest.json` are the authority for the page inventory; check both before naming a page as live or retired.

The homepage should work as a router first. Its nav routes six clear jobs: what Kaspa is, what is live now, claim checking, risks, build paths, and sources (`what-is-kaspa.html`, `status.html`, `kaspa-claims-checker.html`, `skeptical-case.html`, `build-on-kaspa.html`, `sources.html`). Toccata status, the origin story, mining, KIP/KCC tracking, and the interactive comparison tools stay one click deeper instead of competing in the primary nav.

Keep these audience paths visible:

- Know literally nothing about crypto: start with `start-here.html`, then `crypto-from-scratch.html`.
- Ask "what is Kaspa?": use `what-is-kaspa.html`.
- Need the Kaspa design case in plain terms: use `why-kaspa-matters.html`.
- Need to check a public claim: use `kaspa-claims-checker.html`, then `status.html` or `toccata-status.html`.
- Need to know whether Toccata is live: use `toccata-status.html` for the activation record, `toccata-explained.html` for what it added, and `toccata-essay.html` for the argued case.
- Need Kaspa origin/fair-launch context: use `kaspa-origin-story.html`.
- Need current shipped-vs-roadmap status or common claim corrections: use `status.html`.
- Need to compare Kaspa against other layer ones on the same fields: use `chain-comparer.html`.
- Need the Argent/Silverscript language model and a worked covenant example: use `argent-explained.html`.
- Need mining mechanics, ASIC economics, or the price/hash-rate relationship: use `kaspa-mining.html`.
- Need what changed this month, including what did not change: use `kaspa-developments.html`.
- Need KIP and KCC status, including which conventions are merged drafts versus accepted standards: use `kips.html`.
- Need a builder path for an app idea: use `build-on-kaspa.html`. (The former founder/supporter survey and matching-board pages were retired; those URLs now redirect to `about.html`.)
- Need a fair skeptical page to link in debates: use `skeptical-case.html`.
- Want source-level verification: use `sources.html`, `status.html`, `kaspa-claims-checker.html`, `CLAIMS.yml`, `llms.txt`, and `CONTENT_BRIEF.md`.
- Need quick term definitions: use `glossary.html`.
- Need to find a concept or page quickly: use `search.html`.
- Want the long-form monetary-cost argument: use `the-instrument.html` (Moose's essay, hosted in full; his argument, not this site's claim set).
- General-purpose tool, not Kaspa-specific, still part of the crawlable site: `model-picker.html` scores language models against benchmark numbers.

The site does not currently have a dedicated FAQ page, a separate builder-tooling router, a separate application-layer/coordination-markets page, or a separate adoption-metrics page. Where earlier drafts of this brief described those as standalone pages (`faq.html`, `builder-guide.html`, `builder-evidence.html`, `application-layer.html`, `adoption-metrics.html`, `reality-check.html`, `where-kaspa-fits.html`, `ai-guidance.html`, `kaspa-vprogs-explained.html`, `kaspa-tps-explained.html`, `overview.html`, `command-line.html`, `kaspa-confirmations-finality.html`, `kaspa-status-check-may-2026.html`, `kaspa-app-ideas.html`, `kaspa-covenants-explained.html`, `kaspa-vs-ethereum-apps.html`, `kaspa-coordination-markets.html`, `why-crypto-has-value.html`, `why-are-there-so-many-coins.html`, `tradeoff-map.html`, `analyze-any-coin.html`, `crypto-history.html`, `what-crypto-is-good-for.html`, `crypto-from-zero.html`, `ghostdag-explained.html`), that content now lives inside `crypto-from-scratch.html`, `toccata-explained.html`, `build-on-kaspa.html`, or `kaspa-claims-checker.html`, or has not been rebuilt. Do not cite any of those filenames as live pages.

The homepage includes a Bitcoin-style chain vs Kaspa blockDAG visual. Keep that visual claim narrow: parallel honest blocks can be included and ordered by GHOSTDAG. Do not use it to imply unlimited throughput, instant finality, or that scaling is solved.

The "Kaspa does not wait" or "impatient" idea can be used only as restrained explanatory flavor when it points to the actual mechanism: honest work does not have to wait in a single-file chain before it can be included and ordered. Prefer concrete lines like "do not force honest work to wait in a single-file chain" over personality-heavy slogans. Do not turn this into a guarantee of instant finality, a product slogan repeated across the site, or a replacement for the concrete GHOSTDAG/blockDAG explanation.

The `chain-comparer.html` interactive is the scannable comparison surface: readers move dials for what their job needs and see which of twenty layer ones fits. Its job is to help crypto-native readers understand what Kaspa is and is not competing with.

The `status.html` page is the compact status reference. Keep it shorter than the source guide. Its job is to separate live, targeted, roadmap, and research claims quickly.

Use the status page to enforce source discipline. Public Kaspa summaries often mix live mainnet features, testnet work, app/project headlines, roadmap targets, and research claims; the site should separate those lanes before repeating a claim.

The common-misconceptions material should be distributed by reader intent. The homepage may name the risk and route the reader. The claims checker should be the main link for arguments. The FAQ should give short corrections. The status page can carry the more precise table. The one-screen page can include only the compact claim-boundary version. Do not repeat every correction on every page.

Volatile-data rule: do not add facts that can change in seconds, minutes, or hours unless they are free, source-backed, and read from a current API or live node/API script. If the fact is not important to Kaspa L1 status, omit it instead of creating a manual maintenance burden.

App/project catalogs should not be public status lanes on this site. Mention an app only when the L1 fact itself matters, such as transaction payload behavior, accepted-transaction evidence, or fees paid to miners. Otherwise, leave it out and keep Kaspa Explained focused on first-party L1 protocol status.

The status page may include a compact implementation-evidence section for current dev tracks. Keep it code-grounded and below activation evidence. As of June 30, 2026, public mainnet API checks showed `kaspa-mainnet` above DAA score 474,165,565 with continued block/header growth after the score. Rusty Kaspa v2.0.1 is the current Toccata release; Rusty Kaspa v2.0.0 is the Mainnet Toccata Release and set activation at DAA score 474,165,565, roughly June 30, 2026 at 16:15 UTC. The Rusty Kaspa Toccata node setup guide adds operator evidence for v2.0.1+ upgrades, one-way node database migration, standard-fee policy changes, storageMass/storage_mass and transaction version 1 integration changes, Stratum Bridge mining guidance, and Testnet-10 infrastructure testing. `tn10-toc2` scheduled the first Testnet-10 Toccata activation point at DAA score 467,579,632; `tn10-toc3` scheduled final Toccata ZK hardening at DAA score 476,232,000; Testnet-10 REST status showed virtual DAA 532,195,959 on August 1, 2026. Raw KIP files list KIP-16, KIP-17, KIP-20, and KIP-21 as `Status: Active`, promoted together in kips commit e4ae2332 on July 15, 2026, replacing their earlier TN10-scoped status. Rusty Kaspa PR #953 merged an `R0ScriptBuilder` helper for RISC Zero proof scripts; open KIP-24 covers transaction-v1 fields and hashing for compute budgets, covenant bindings, user lanes, and ZK-friendly txids; open KIP-22 covers P2MR quantum-resistance and MAST-style ScriptPublicKey work; kaspanet/vprogs is an early Rust framework for based computation with core, storage, state, scheduling, transaction-runtime, node, L1, and ZK workspace components plus the June 18 settlement-into-covenants merge; argent-lang/argent is an actor-based language and compiler above Silverscript whose README says the main pieces are present and names audit as the remaining gate, and whose old michaelsutton/argent path 301-redirects to it; rusty-kaspa/dagknight March 22 prototype/refinement activity remained a development signal. `toccata-explained.html` is the hub for this material. Do not let this section become a hype feed or imply app, wallet, SDK, liquidity, explorer, or user evidence from protocol activation alone.

`kips.html` is the KIP/KCC tracker and carries the KCC status this brief must stay aligned with. Kaspa Calls for Conventions are an ecosystem-standards process, distinct from KIPs, and never a consensus change. KCC-0001 (covenant definition/ABI), KCC-0002 (authority schemes), and KCC-0020 (fungible token covenant spec) merged into the `kaspanet/kccs` repo on 20-21 August 2026; each still reads `Status: Draft` in its own document body, so merged means checked in as a draft, not adopted as a standard. KCC-0021 (covenant token metadata) is open PR #6 and KCC-0402 (covenant payment channels) is open PR #4; neither is merged. Every proposal numbered KCC-0008 through KCC-0025 closed unmerged. KCC-0020 carries an open correctness issue, `kaspanet/kccs` issue #14, opened August 21, 2026: its transfer-consolidation rule and its extended-state update entrypoint can conflict, permanently splitting a token's supply into groups that cannot recombine. Both replying co-authors treat the underlying behavior as intended by design, though they characterize it differently; no spec change has merged. `CLAIMS.yml`'s `kcc_conventions` entry is the source of record for KCC status and its exact forbidden phrasings; follow it rather than restating the detail here.

`start-here.html` and `crypto-from-scratch.html` carry the compact first-reader route: what Kaspa is, what is live, what is not live, what the design changes, and what to read next. There is no separate 90-second-overview page; do not cite `overview.html`.

There is no dedicated adoption-metrics page. `kaspa-developments.html` and `kaspa-mining.html` carry the closest non-price adoption evidence the site currently has: node/mining health, fees, hash-rate/price decoupling, and month-over-month protocol change. Do not cite `adoption-metrics.html` as live.

`toccata-explained.html` is the app-opportunity page. It should explain why someone would build on Kaspa without pretending every app is live. The page should not read like "Kaspa gets L2s too," and it should not make generic merchant/POS payments the adoption thesis. It should explain the L1-first thesis in concrete product terms first: app receipts, vault rules, asset rules, escrow, coordination markets, attestations, public funding rules, proof checks, and apps that prove what they did. Then name the technical layer: Kaspa L1 supplies shared sequencing, ordering, commitments, verification hooks, settlement, and neutral primitives; apps and runtimes add semantics, incentives, proving, and user experience around those primitives. Map what other crypto networks enabled, then translate those patterns into Kaspa-native paths while preserving status discipline. Include the RTD internet-money flow as app-level research/architecture: a user defines a strategy around an external event, an application defines incentives for opt-in miners or rewarded reporters to attest, the system samples the PoW majority, and assets/logic on Kaspa can gain lower latency and closer atomicity. Do not imply this flow is shipped today or protocol-prescribed. Do not cite `application-layer.html`; it is not a live page.

When explaining coordination markets, start with the product shape: users make conditional commitments, the app groups compatible commitments, a solver checks whether the group satisfies the conditions, and settlement or refunds follow. The first buildable lane can be transparent and replay-backed. The harder research target adds private accumulation, capital multiplexing, solver incentives, censorship resistance, MEV resistance, and atomic execution.

When explaining app-to-app composition, make atomicity the boundary. Fast L1 ordering, proof-linked coordination, or two actions landing close together are weaker than one combined state transition where all touched apps succeed or fail together. Toccata can support covenant rules, ZK proof checks, sequencing commitments, and based-zk foundations. Full cross-app atomic composition remains later vProgs roadmap architecture.

There is no dedicated builder-programmability router; do not cite `builder-guide.html`. `build-on-kaspa.html` is the live builder-path page: it should help builders choose between covenants, based apps, inline ZK, and future full vProgs by asking about concurrency, state shape, and proof requirements. Credit Izio's progdoc material as builder guidance. Keep Python SDK, TxIndex, Silverscript, and open PRs in builder/tooling lanes, outside protocol-status lanes.

SilverScript/covenant examples should be judged by the state transition they
actually prove. A serious example shows continuation state, required output
rules, signature-script wiring, rejected paths, and a submit route that
preserves covenant fields. Funding a script output or wrapping P2PK logic is
not enough to call a feature script-enforced. Lead with the concrete job:
budget that cannot drain at once, step-by-step workflow, asset that needs its
controller, group release/refund, scheduled payout, or blocked withdrawal. Use
worker-routed workflow, controller-input authority, and challenge/timeout
language only when the specific artifact or source supports it.

For ZK builder wording, keep the external-anchor boundary explicit. ZK verification proves a statement about chosen public inputs; it does not by itself prove external-chain canonicality, prices, oracle events, or real-world facts. If a bridge, market, oracle, or attestation app depends on outside data, name the anchor: source-chain light client, finality certificate, accumulated-work view, oracle, reporter set, challenge process, or other trust model. Keep the anchor visible without burying the reader in bridge theory.

The current Kaspa.org Build page is a developer-resource index. Preserve links to official docs, Rusty Kaspa releases, WASM SDK docs/examples, community REST API docs, Public Node Network docs, Docker Hub, explorer/API DB dumps, testnet faucet, KIPs, Silverscript, vProgs, Simply Kaspa Indexer, DNS Seeder, kHost, kaspa-js, and the R&D Telegram. Keep hosted APIs/public nodes labeled as best-effort or demo-friendly, and community projects labeled as projects to inspect before production use.

The Kaspa Developer Platform at `docs.kas.fyi` is a hosted API source. Protocol activation authority comes from releases, KIPs, node/API readings, and activation evidence. Use KDP for builder references around API-key access, address history, transaction acceptance checks, block ranges by blue score or DAA score, node RPC proxy access, data types, pagination, rate limits, and beginner node-running guidance. Use it in `sources.html` and `build-on-kaspa.html` as a practical hosted read path. Keep the boundary explicit: API keys, rate limits, provider uptime, and pricing are product dependencies; production systems should plan their own node/indexer or provider redundancy when reliability, privacy, or scale matters.

For `build-on-kaspa.html` UX, use the new Kaspa.org BUIDL path as a practical runway: try live browser SDK examples, choose App SDK / Native Rust / Node, use REST or Public Node Network only for prototypes and light reads, then graduate to own-node or indexer infrastructure for production. This tells builders what to do first without implying that hosted APIs or testnet programmability are final production paths.

The builder path should also preserve practical testnet breadcrumbs learned from hands-on prototyping: use exact `kaspatest:` addresses; faucet use may require a browser; local balance checks need a synced testnet node with UTXO index; an unsynced node can return misleading zero balances; a generic stable mainnet binary may not support every active TN12 setting; and TN10/Toccata activation-test commands should start from the current Rusty Kaspa release notes. Old Crescendo examples are stale for this job. Put this in the builder lane and keep mainnet instructions separate from testnet-only covenant work.

Builder verification lessons should be concrete and reusable: a local txid is not accepted app state; fetch accepted transaction evidence after submit; record node version, SDK version, network id, endpoint, encoding, tx version, and input budget fields; compare failing contract spends against accepted sibling spends before claiming a protocol boundary; and label failures narrowly as bad config, stale tooling, submit mismatch, or confirmed consensus rejection. Keep private prototype txids out of public copy unless they independently support source evidence.

For the app page specifically, the Bitcoin Takeover interview changes the framing in these ways:

- Explain the app case as money plus finance without compromising the L1 monetary base.
- Avoid Ethereum-style rollup language unless contrasting it with Kaspa's intended shared-sequencer/cohesive-program model.
- Describe "Solana-like" only as cohesive developer/user experience and native-feeling composability. Avoid implying Solana execution imported into Kaspa.
- Keep "one app per VM" / app-level verifiable-program intuition available for advanced readers, while explaining it first as apps proving their own logic while sharing Kaspa ordering.
- Treat DeFi, stable assets, lending, swaps, social recovery, vaults, bridges, and tokenized assets as things builders can target through staged primitives. Live-product claims need shipped product evidence.
- Make clear that core should not own the product layer: wallets, explorers, apps, oracles, bridges, and UX should be plural and community-built where possible.

The `glossary.html` page is the compact term map. Keep definitions short and plain.

## Editorial Standard

Use plain, direct language. Preserve a serious point of view, but do not hype.

The voice should never sound clever for its own sake. Avoid dramatic authority, bold adjective piles, invented slogans, and sentences that mainly perform confidence. Let the facts, source links, and concrete examples carry the weight.

Apply this writing bar across public pages and LLM-facing files. Every touched page, repo guide, source note, generated summary, and context file should be direct, sourced or status-labeled, necessary, and free of defensive throat-clearing.

Good style:

- specific nouns,
- concrete tradeoffs,
- named actors and requirements,
- clear current-status wording,
- comparisons,
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
- corporate abstraction without a concrete actor and requirement, such as "institutional readiness," "ecosystem maturity," "enterprise adoption," "strategic unlock," "robust platform," or "seamless experience",
- market-cap or rank claims frozen into the explainer,
- avoid vague claims like "revolutionary" without explaining the mechanism.
- repeated contrast scaffolding on public pages,
- repeated contrast frames, vague transformation formulas, and synthetic thought-leadership cadence,
- overcorrected negative framing where every paragraph repeats a missing feature; use one status label and name the next dependency instead,
- over-polished LLM phrasing such as "delve", "tapestry", "seamless", "robust", "pivotal", "crucial", "unlock", "empower", "transform", "reimagine", "landscape", "journey", "at its core", "ultimately", or inflated adjectives that do not add a mechanism,
- brochure language such as "next-generation", "cutting-edge", "game-changing", "powerful platform", "accelerate innovation", "drive the future", or "pave the way",
- clever-authority phrasing that tries to sound definitive without adding evidence,
- dramatic adjective stacks where one plain noun would work,
- defensive caveat stacks where one status label or one source link would do the job.

Editing test: each public sentence should make a specific, necessary, defensible claim. If a sentence mainly adds polish, symmetry, or persuasion cadence, cut it or move the detail to the source/context stack.

Craft rule: text is product surface. UI labels, public copy, repo docs, fixtures, generated summaries, LLM context, and handoff notes need the same care as code. Keep every line necessary, accurate, scan-friendly, and clean. Prefer plain build language: live, near-term, roadmap, research, needs wallet, needs indexer, needs custody, needs source.

Reliability rule: `COPY_STYLE.md`'s Evidence Check is the canonical version of this rule; follow it rather than restating it here.

Implementation craft rule: a public edit is not complete just because the words or layout look better in one viewport. Treat each page as a small product surface with user intent, states, responsive behavior, accessibility, performance, source trail, and maintenance cost.

For Kaspa Explained this means:

- Pinpoint feedback is exact-defect input first. Rollback permission needs an explicit ask. If a reader or the user flags one malformed arrow, cramped label, weird glyph, typo, copy line, or spacing bug, identify and repair that element before changing unrelated parts. This does not mean hold back on quality: when the task is a broader cleanup or redesign, keep improving the surface after the defect is fixed.
- Every section should support a reader job: understand, compare, verify, build carefully, search, or correct a claim.
- Shared patterns should behave consistently: route cards, source cards, status chips, comparison tables, app-path ladders, search results, drawers, command blocks, and footer links.
- Status states stay distinct: live mainnet, targeted upgrade, testnet-only, roadmap, research, source-needed, stale-check-needed, wrong, unsupported, and unknown.
- Long source titles, URLs, page labels, protocol terms, and dates must wrap cleanly on mobile.
- Tables belong where comparison or source evidence is the job. Beginner-facing pages should explain the plain action before dense grids.
- Search and source-pack docs need direct routes back to source/status pages and must not become source authority.
- Use semantic HTML, real links for navigation, buttons for actions, visible focus, logical headings, and status text that does not depend on color alone.
- Keep the site dependency-light. Prefer crawlable HTML, shared CSS variables/classes, small SVGs, and vanilla JS over framework or animation additions.
- Public claims, metadata, sitemap entries, `llms.txt`, `CLAIMS.yml`, and source pages should not drift apart after a status-sensitive edit.

Actor rule: if a sentence says a vague group "needs readiness" or "needs maturity," rewrite it around the actual actor. A fund may need custody, audit trails, reporting, and legal review. An exchange may need node stability, wallet integration, liquidity, monitoring, and support. A payments company may need payment APIs, refunds, accounting, uptime, and support. A builder may need docs, SDKs, indexers, examples, and testnet paths. If the sentence cannot name who needs what, it is probably filler.

Tone and visual weight:

- Use medium authority. The site should sound clear and grounded. Avoid small, apologetic, manifesto, pitch-deck, and definitive-guide posture.
- Write like a knowledgeable person helping a rushed reader choose the right path.
- Use medium visual weight. Headings, cards, callouts, and diagrams should be clear and confident. Avoid oversized or theatrical scale. Use size to create hierarchy.
- Prefer humble guidance: "start here", "check this lane", "use this distinction", "current boundary", "what exists now", and "what may come later."
- Avoid turning every heading into a grand claim, final answer, or abstract thesis.
- Let interest come from concrete jobs. The site can be Kaspa-positive without sounding promotional.

## Status Lanes

Keep these categories separate.

### Live / Factual Now

- Proof of Work blockDAG
- UTXO model
- GHOSTDAG consensus
- Crescendo 10 BPS era
- real-time decentralization as the core fast-PoW value proposition and current Kaspa.org north-star framing: Bitcoin-style PoW security and censorship-resistance goals with seconds-scale confirmation feel under normal network conditions
- pruning and UTXO commitments
- public wallets, explorers, visualizers, nodes, mining ecosystem

### Near-Term / Implementation Track

- Toccata hard fork
- covenants
- Silverscript
- ZK verification foundations
- sequencing commitments
- vProgs groundwork

Status note: Toccata activated at DAA 474,165,565. Rusty Kaspa v2.0.1 is the current Toccata release; Rusty Kaspa v2.0.0 is the primary release source for the activation parameters, roughly June 30, 2026 at 16:15 UTC. Michael Sutton's April 2026 Toccata outlook remains implementation context for why the older May 5 target moved so sequencing-commitment/KIP-21 architecture could be finalized before zk systems bind to it. The Toccata node setup guide is operator-readiness evidence. Separate protocol activation from wallet, explorer, SDK, app, liquidity, and user evidence. Use the guide for node operation, fee-policy changes, transaction field changes, pools, miners, exchanges, wallets, explorers, indexers, and Testnet-10 checks. Rusty Kaspa's `tn10-toc2` and `tn10-toc3` pre-releases plus Testnet-10 REST status are current testnet evidence: the releases scheduled Testnet-10 activation and final Toccata ZK hardening at DAA scores 467,579,632 and 476,232,000, and the June 26 API check showed virtual DAA 501,408,970.

### Roadmap / Architecture

- vProgs as app-level verifiable programs
- Kaspa-native DeFi paths
- monolithic-feeling developer experience without global L1 execution of every app
- synchronous composability across programs
- vProgs as a deeper application-architecture direction

### Research / Speculative

- DAGKnight final form and activation timing
- Kaspa.org's proposed 2027 bucket for 100 BPS, 10 millisecond blocks, and partition-resilient local payment flows
- App-level miner attestation, oracle, TangVM, and coordination-market incentive designs
- RTD internet-money flows where miners or reporters attest to external events and apps react atomically
- TangVM-style reality-state ideas
- Proof of Useful Work via matrix multiplication
- long-term post-quantum migration paths

## Current Core Framing

Kaspa is best framed as:

> A Proof of Work blockDAG that generalizes Nakamoto consensus so parallel honest blocks can contribute to ordering instead of being discarded as ordinary orphans.

The stronger comparison is not "faster Bitcoin." It is:

> Keep Proof of Work and UTXO instincts, remove the single-file blockchain bottleneck with a blockDAG, and move toward bounded apps that can prove their rules.

Do not imply that Bitcoin has no latency parameter or network-timing assumption. Bitcoin's 10-minute block interval also assumes network latency is much smaller than the block interval; one shorthand is that Bitcoin behaves like the k=0 edge case in this family of Nakamoto/GHOSTDAG-style reasoning. The contrast is not "Bitcoin is unparameterized, Kaspa is parameterized." The contrast is how Kaspa exposes, raises, and eventually aims to adapt the block-rate/latency tradeoff while allowing parallel honest blocks to contribute to ordering.

## Fast Proof-of-Work Framing

Keep the fast-PoW argument focused and careful. Fast inclusion and fast confirmations are different:

- Fast inclusion: how quickly a transaction enters a block.
- Fast confirmations: how quickly the system gives strong confidence that the transaction will not be reversed.

Any high-rate block-producing system can improve inclusion. Kaspa's stronger argument is that fast Proof of Work changes the confirmation/decentralization tradeoff. PoW samples hash power through work done after the fact, without requiring the protocol to identify and collect explicit supermajority votes from miners before every confirmation. In PoS finality designs, confirmation speed is more directly tied to stake voting, validator coordination, stake distribution, committees, or related sampling assumptions.

Do not overclaim this. Do not state that Kaspa provides instant irreversible settlement, that all PoS systems are equivalent, or that the site has fully modeled Ethereum/Solana engineering details. The durable, site-appropriate claim is narrower: fast PoW blockDAGs make the inclusion/confirmation/decentralization tradeoff different, and that is one reason Kaspa is worth studying.

Crescendo-specific nuance: do not turn 10 BPS into "10x finality." Michael Sutton's public Crescendo explanation framed practical throughput as roughly 8-9x higher under the observed policy and confirmation-time improvement as closer to 30%, because confirmation remains dominated by block latency. Use this to correct summaries that imply unlimited throughput, instant finality, or a clean 10x confirmation improvement.

TPS and speed claims need measurement labels. Do not freeze one public TPS number as normal mainnet behavior unless current primary sources support that exact measurement and context. Distinguish block rate, block capacity, policy limits, test/lab throughput, sustained capacity estimates, organic demand, fees, and confirmation confidence. Current simple-payment capacity can be framed as a rough 2.5k-3.4k TPS range at 10 BPS under transaction-shape assumptions; covenant apps, ZK proof settlements, tokens, and future vProg-style app throughput need separate workload definitions.

## Crypto Reality-Check Framing

`crypto-from-scratch.html` is the general-audience bridge for people who do not live inside crypto, and it is also where the market and context layer now lives: why a coin has a price, market cap versus company value, initial-ownership/launch design, and a three-part test for when crypto makes sense at all. It should make the rest of the site more credible by stating plainly that crypto is not useful for everything, and it should explain valuation, token necessity, launch design, actors, incentives, and design constraints without becoming investment advice or price prediction. There is no separate `what-crypto-is-good-for.html`, `why-crypto-has-value.html`, `why-are-there-so-many-coins.html`, `tradeoff-map.html`, `analyze-any-coin.html`, or `crypto-history.html`; do not cite them as live pages.

`start-here.html` and `crypto-from-scratch.html` are the true zero-start path. They should not assume the reader knows decentralization, blocks, mining, tokens, market cap, keys, privacy tradeoffs, UTXO, or consensus. Teach the problem first, the mechanism second, the tradeoff third, and Kaspa fourth.

There is no dedicated crypto-native product-judgment page; do not cite `reality-check.html`. `kaspa-claims-checker.html` and `skeptical-case.html` are the closest live analogs: they help readers test claims and pitches against current-status labels, evidence, and failure modes rather than against hype.

Core frame:

> Crypto is useful when strangers need one shared record of ownership and rules without one company, bank, platform, or government controlling the database. The technical version is a neutral shared record: ownership records, adversarial trust, self-custody, global 24/7 settlement, censorship resistance, programmable assets, on-chain markets, objective smart-contract escrow, digital provenance, or open-network incentives.

Keep the weakness side just as explicit. Crypto is usually weak for normal domestic payments in strong banking systems, consumer reversibility, private records, ordinary corporate databases, unsecured real-world credit, replacing courts, supply-chain truth, identity, and tokenizing assets whose ownership still depends on law, custody, inspection, liens, taxes, and jurisdiction.

Keep this page conditional: crypto is real when a neutral shared record is worth the cost, and theater when a trusted operator, legal process, or normal database solves the problem better.

The `why-kaspa-matters.html` page is the Kaspa-specific bridge from the general crypto reality check. It should explain Kaspa's design case for neutral money, self-custody, censorship resistance, fast mined ordering, future apps that prove rules, and public group commitments.

Core frame:

> Kaspa keeps Proof-of-Work security culture while pushing the payment experience closer to real time: fast mined ordering today, app receipts around the live network, and future apps that prove their own rules.

Keep this page tightly status-labeled. GHOSTDAG, the UTXO model, Proof of Work, Crescendo 10 BPS, and the base RTD framing are live enough to describe as Kaspa's present value proposition: real-time Bitcoin-style PoW settlement, censorship-resistance goals, and a broader case than fast payments alone. The May 8, 2026 Kaspa Daily Yonatan Q&A makes this sharper: Base of Liquidity is positioning context, generic payments are not the whole adoption strategy, and product development plus visible on-chain activity matter. Toccata's covenant, ZK verification, and sequencing surfaces are activated on mainnet; Silverscript and the rest of the app tooling are the in-progress track. vProgs and native DeFi are roadmap architecture. DAGKnight, app-level miner attestation incentives, oracle/TangVM flows, and coordination-market applications remain research or architecture work unless future primary sources confirm activation or shipped software.

App/project nuance: do not turn app standards, wallets, frontends, or marketing into Kaspa L1 status copy. If the L1 fact matters, cite transaction payload docs, accepted-transaction docs, public node/API evidence, or miner fee/reward evidence. Otherwise, leave it out.

The `sources.html` page is the public source hierarchy and attribution page. Use it to centralize credits, Kaspa.com Learn Kaspa links, external references, and public crawl/LLM file links instead of adding distracting footnote walls to every human-facing page. The homepage should stay a human-first router: six route cards, three primary actions, one short Toccata boundary, a compact app-layer preview, and clear handoff links to status, risks, build paths, and sources.

Design for two human modes at once: a rushed reader who needs the right page in seconds, and an interested reader who wants depth after choosing a lane. Long pages should provide jump links near the top. Dense source lists, changelogs, and implementation evidence can use `<details>` so the core explanation stays scannable. Keep the main thesis, status boundary, and first answer outside toggles.

## Programmability Framing

Be careful with app-layer claims.

DAGKnight has the better-developed research lineage and a more visible implementation branch than vProgs. Both remain outside live-mainnet status until primary sources confirm activation. This nuance belongs in status discipline and research context; it does not need to be repeated everywhere.

Keep "Kaspa DAGKnight is WWIII-resistant" out of public headline copy. When it appears as community shorthand, frame it as an adversarial-latency resilience research/implementation goal. Live-mainnet guarantees need activation evidence.

Toccata and vProgs are related but distinct. Toccata/Covenants++ is the nearer L1 hard-fork track for concrete rules such as spend constraints, asset rules, covenant IDs, Silverscript, ZK-facing verification work, sequencing commitments, native-asset groundwork, and standalone based-app experiments. A based app anchors app-specific state to Kaspa L1 ordering, commitments, proofs, settlement, or exits; ZK is one verification path for based apps. vProgs are the longer app architecture for apps that prove richer logic while sharing Kaspa ordering, computational-DAG metadata, prover-backed execution, and eventual synchronous composability.

Kaspa programmability should be framed as concrete use first, neutral primitives second. Say what the user or app is trying to do: lock funds, enforce a vault rule, create an asset, route a payment, fund a public good, resolve a market, attest to an event, or prove app logic. Then explain that the protocol should expose durable L1 surfaces while apps define incentives, semantics, oracle sources, legal/risk constraints, and user-facing products. Apply that rule to attestations, prediction markets, DePIN freshness markets, portfolio automation, launch paths, AI-agent task boards, and DeFi.

Junny Ho's Web3 Festival HK 2026 talk, "Scaling Trustless Coordination" (`https://www.youtube.com/watch?v=b3wPZ04p410`), is a narrative source for the coordination-market thesis. It frames the problem as stag-hunt coordination, names credible commitments, conditional participation, and economic exposure as core market primitives, and connects Kaspa's real-time decentralized confirmation thesis to coordination markets that need fast observable signals without centralized sequencing. Use it for product framing. Keep live-status labels tied to activation evidence.

The Toccata/vProgs capability split should be precise. Toccata gives L1 covenant programming and based-app foundations: covenants, Silverscript, ZK verification opcodes, sequencing commitment access, partitioned sequencing commitments, native-asset groundwork, and bridge/settlement patterns. The `kaspanet/vprogs` repo is an early Rust framework for based computation on Kaspa with scheduler, resource access, batch execution, rollback, storage/state layers, node VM, L1 bridge, and ZK proving pipeline; it has several active committers, so do not attribute it to one author. The `argent-lang/argent` repo is an actor-based language and compiler for covenant state machines above Silverscript. Its README lists the main pieces as present, including compiler, generated Silverscript, portable artifacts, runtime transaction building, multi-actor routing, and closed and open ICC, and names the remaining gate as Silverscript's audit followed by Argent's own hardening. It is not audited, ABI-stable, or activation evidence, but do not describe it as an unfinished compiler. Its immediate role is compatible based computation/runtime work, while full vProgs synchronous composability is later architecture.

Builder tooling belongs in its own lane. The standalone `kaspanet/kaspa-python-sdk` repo and v2.0.0/v2.0.1 releases show Python integration, Toccata-aligned managed-wallet support, lane-proof RPC support, SMT sync progress events, and covenant-binding fixes. Rusty Kaspa PR #953 adds a merged ZK SDK helper, `R0ScriptBuilder`, for RISC Zero proof scripts. Protocol status still comes from node, release, KIP, and activation evidence. TxIndex PR #860 is builder/infrastructure evidence while open; Fast Trusted Relay PR #930 is an infrastructure experiment until merged and released. The redesigned Kaspa.org Build page also makes the infrastructure runway clearer: Rusty Kaspa, WASM SDK, public nodes, community REST APIs, database dumps, KIPs, Silverscript, vProgs, and public R&D channels are builder routes, while production systems still need explicit node, indexer, archival, API-key, rate-limit, and provider-redundancy decisions.

KIP alignment is now a status-sensitive subtopic. As of July 15, 2026, raw KIP files list KIP-16, KIP-17, KIP-20, and KIP-21 all as `Status: Active`, promoted together in kips commit e4ae2332, replacing their earlier TN10-scoped status. KIP-24 (transaction v1), KIP-25 (compute budget), and KIP-22 (P2MR) are open PRs. Note that transaction v1 and computeBudget already run on mainnet and are documented in the Toccata operator guide while their KIPs remain unmerged, so cite the guide or the node for those, not a KIP number. Mainnet activation needs activation artifacts and network behavior.

Frame Kaspa as L1-first and shared-sequencer-first: applications add programmability directly against Kaspa L1 primitives, while based-zk systems and future vProgs use Kaspa L1 for sequencing, commitments, settlement, and verification without separate sequencer empires.

Based apps are a real build lane. Direct L1 covenant examples such as vaults, escrow, and assurance can be explained without an L2. Based-app prototypes should be described as richer app state anchored to Kaspa ordering, commitments, proofs, settlement, or exits. Based-zk is the stronger proving path when replay alone is insufficient. Keep ecosystem L2 projects out of the site's assumptions unless a page is explicitly about ecosystem projects.

vProgs should be described first as apps that prove their own logic, then as app-level verifiable programs or app-level ZKVM/verifiable-program environments. Do not flatten them into ordinary rollups. The intended direction is a native-feeling, cohesive developer/user experience while keeping L1 focused on sequencing, commitments, verification, and metadata, while app runtimes execute their own logic.

For app-layer discussion, treat Michael Sutton's vProgs framing as a roadmap target for one-dimensional program space, shared Kaspa L1 sequencing, synchronous composability, computational DAG metadata, prover incentives, and sovereignty obligations. Covenant++ milestone notes can inform the staged path: inline zk covenants, based zk covenants, canonical bridges, native-asset bridge work, and efficient sequencing commitments. STARK-sized proof support and standard minimum fee changes are design questions unless future primary sources confirm mainnet activation.

## Long-Form Interview Model

Bitcoin Takeover S16 E41, the 2025 Yonatan Sompolinsky interview, should guide the shape of the explanation: Kaspa as a generalization of Nakamoto consensus, the blockDAG as a framework whose value depends on ordering, GHOSTDAG as current mainnet behavior, DAGKnight as future/adaptive consensus work, vProgs as native-feeling app architecture, and community context as part of decentralization.

For origin history, use the same interview to keep the fair-launch story candid: Yonatan described the launch as messy and reluctant, said the gamenet idea was overtaken by miners who kept mining, and framed the early second-genesis recovery as preserving the UTXO set. Pair that with Kaspa.org, Hashdag, Investing.com, Guy Corem's testnet note, HackerNoon, and the older Epicenter/Rethink Trust sources before making origin claims.

Use the interview as an editorial model. Pull from its patient first-principles reasoning, everyday examples, willingness to compare Bitcoin/Ethereum/Solana without tribal shortcuts, clear admission of uncertainty, and careful distinction between live protocol, roadmap, and aspiration.

Do not turn the interview's roadmap discussion, demos, or aspirations into live-status claims. In particular: native DeFi is not live, DAGKnight is not live, vProgs are not live, 100 BPS and partition-resilient payment flows are proposed future work, pruning is not privacy, and Solana-like means cohesive developer/user experience, with no imported Solana execution model on Kaspa L1.

## Source Hierarchy

Prefer primary or near-primary sources:

1. Primary protocol/code: `kaspanet/rusty-kaspa`, releases, KIPs, Kaspa Research, and protocol documentation.
2. Core-dev explainers: Michael Sutton technical posts, Ori Newman, Coder of Stuff, Hashdag/Yonatan, and other active technical builders.
3. Long-form framing source: Bitcoin Takeover S16 E41. It is high-signal for explanatory framing and status nuance. Activation claims still need primary protocol/code or direct implementation evidence.
4. Context and education sources: Oxford recordings, KASmedia, Kaspa.com Learn Kaspa, the current Kaspa.org site, full recordings, interviews, transcripts, and recaps. They provide orientation, links, and framing. Protocol activation needs primary evidence.
5. Learning references: Kaspa.com Learn Kaspa / Kaspa Facts for approachable intro/intermediate concept explanations. Credit this source when using its explanations, but treat it like community education and verify shipped-feature and activation claims against primary protocol/code sources.
6. Discovery only: active public technical X accounts and replies.

The current Kaspa.org site is the public Kaspa/KasMedia entry point for broad orientation, fair-launch/genesis-proof framing, wallet flow, builder routing, and links into stronger sources. It replaced the older article-style site, so old Kaspa.org article URLs should be treated as stale until checked. Status-sensitive claims should still come from code, releases, KIPs, research papers, protocol documentation, or direct implementation notes from core technical contributors.

Use X cautiously. It can surface current builder commentary, links, replies, and corrections. It is weak for shipped-feature claims unless backed by code, KIPs, releases, or durable long-form sources.

Do not use stale team pages, recycled handle lists, or contributor pages to infer current involvement.

External-source rule: credit outside sources by name and link near the relevant claim or through `sources.html`. Do not copy external articles into the site. Paraphrase, synthesize, and point readers to the original source.

Kaspa.com Learn Kaspa status: treat the article set as a learning library for BlockDAG, GHOSTDAG, DAG terminology, parents/mergesets, blue score/blue work, k-clusters, pruning, UTXO, MuHash, finality, transaction selection, mass, opcodes, KIPs, and node types. Recheck it before relying on it for newly changed concepts. Do not plaster this source across the main pages or use it as the primary authority for status claims.

The May 2026 Kaspa.com Smart Contracts article separates programmability into layers and includes a chess covenant walkthrough. Use that chess material as a concrete example of UTXO state-machine design: registration state, player state, game state, move-routing transactions, move-application transactions, and final settlement. Do not frame it as proof that a mature app ecosystem is live.

## Public Crawl Map

`sitemap.xml` and `site-manifest.json` are the authority for this list; check both before editing it. The sitemap includes the 25 live human pages plus LLM/crawler files and the one PDF:

- `/`
- `/start-here.html`
- `/what-is-kaspa.html`
- `/why-kaspa-matters.html`
- `/crypto-from-scratch.html`
- `/chain-comparer.html`
- `/model-picker.html`
- `/kaspa-origin-story.html`
- `/toccata-explained.html`
- `/argent-explained.html`
- `/toccata-status.html`
- `/toccata-essay.html`
- `/build-on-kaspa.html`
- `/status.html`
- `/skeptical-case.html`
- `/kaspa-mining.html`
- `/kaspa-developments.html`
- `/kips.html`
- `/kaspa-claims-checker.html`
- `/sources.html`
- `/glossary.html`
- `/about.html`
- `/the-instrument.html`
- `/search.html`
- `/404.html`
- `/llms.txt`
- `/agent-index.json`
- `/CONTENT_BRIEF.md`
- `/README.md`
- `/CLAIMS.yml`
- `/the-instrument.pdf`

The other 47 `.html` files in the repository are `noindex` redirect stubs, not content pages. Do not describe a stub with a content summary, and do not add a stub to this list. `argent-explained.html` was a redirect stub into `toccata-explained.html` until August 22, 2026, when it became its own live page; do not describe it as redirecting.

Do not advertise `AGENTS.md` in `sitemap.xml`. It can remain publicly reachable as a repository file, but it is local agent guidance outside the public content surface.

## Active Public Technical Accounts

Discovery and replies:

- https://x.com/hashdag
- https://x.com/michaelsuttonil
- https://x.com/OriNewman
- https://x.com/hus_qy
- https://x.com/IzioDev
- https://x.com/coderofstuff_
- https://x.com/FreshAir08
- https://kasmedia.com/article/eliot-mea-and-oracles (Eliott Mea; his X account no longer resolves)
- https://x.com/KasSigner

Read replies as well as top-level posts when researching a current technical point.

## Transcript and Video Handling

Use video transcripts as source material. Rewrite them into site copy after source and status checks.

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

Quantum answer frame:

- wallets,
- exchanges,
- exposed public keys,
- old UTXOs,
- new address formats,
- signature size,
- verification cost,
- user coordination.

## Site Structure

Primary public pages, matching `sitemap.xml` and `site-manifest.json` (25 pages total):

- `index.html` - audience-routed homepage, real-time Proof-of-Work case, interactive blockchain-vs-blockDAG teaching model, status labels, and routes into the six primary jobs.
- `start-here.html` - true beginner router for readers who know nothing about crypto or Kaspa.
- `what-is-kaspa.html` - what Kaspa is: KAS, Proof of Work, blockDAGs, GHOSTDAG, 10 BPS, and what is live on mainnet versus roadmap.
- `why-kaspa-matters.html` - Kaspa-specific bridge page explaining the design case without claiming the roadmap is already live.
- `crypto-from-scratch.html` - causal ladder from records, keys, transactions, blocks, consensus, incentives, and tokens through to why coins have value, market cap versus company value, launch design, and where crypto itself is useful or weak.
- `chain-comparer.html` - interactive comparison of twenty layer ones on the same fields, dial-adjustable by reader priority.
- `model-picker.html` - live scorer for language models against published benchmark numbers; general-purpose, not Kaspa-specific.
- `kaspa-origin-story.html` - sourced origin page for DAGLabs, Polychain/Accomplice-era VC funding context, PHANTOM/GHOSTDAG, the April 2021 testnet, failed hardware/presale paths, fair launch, the DAGLabs/Polychain-related early-miner estimate, Black Tuesday, dust-attack context, Rust rewrite, Crescendo, and the Toccata boundary.
- `toccata-explained.html` - Toccata hub explaining covenants, covenant IDs, ZK proof checks, sequencing commitments, based apps, Argent, coordination markets, and the vProgs boundary.
- `argent-explained.html` - Argent/Silverscript language model, a worked covenant example, what Argent's own README says, and the repository signals across the argent-lang org. Live page as of August 22, 2026; was a redirect stub into `toccata-explained.html` before that.
- `toccata-status.html` - Toccata's DAA activation score, the v2.0.1 release, covenant and ZK surfaces, and TN10/TN12 evidence.
- `toccata-essay.html` - Parker Schmidt's attributed first-person essay on the Toccata upgrade.
- `build-on-kaspa.html` - builder path that routes an app idea to Toccata status and the three build lanes. (The former short-recipes page, founder/supporter survey pages, and matching-board page were retired; those URLs redirect here or to `about.html`.)
- `status.html` - compact status page for live, targeted, roadmap, and research items.
- `skeptical-case.html` - the strongest case against Kaspa, argued properly, with what would show it going wrong.
- `kaspa-mining.html` - mining mechanics, ASIC economics, and why price and hash rate move on different clocks.
- `kaspa-developments.html` - what changed in Kaspa this month, naming what did not change too.
- `kips.html` - KIP and KCC tracker distinguishing consensus-changing proposals (KIPs) from ecosystem conventions (KCCs), with a live-fetched KCC pull-request table.
- `kaspa-claims-checker.html` - common Kaspa claims marked true, partly true, or wrong, with sources.
- `sources.html` - public source hierarchy, external reference map, Kaspa.com Learn Kaspa topic index, and public crawl map.
- `glossary.html` - compact plain-English glossary for common Kaspa terms.
- `about.html` - public editorial policy, disclosures, correction handling, and accountability page.
- `the-instrument.html` - Moose's essay on judging monetary systems by physical cost floor, hosted in full; his argument, not this site's claim set (also published as `the-instrument.pdf`).
- `search.html` - dependency-free static page-map search for concepts, audiences, status labels, and source terms.
- `404.html` - not-found page.
- `CLAIMS.yml` - reference file for status-sensitive claims and forbidden overclaims.

There is no live `overview.html`, `faq.html`, `where-kaspa-fits.html`, `ai-guidance.html`, `application-layer.html`, `adoption-metrics.html`, `reality-check.html`, `builder-guide.html`, `builder-evidence.html`, `kaspa-app-ideas.html`, `kaspa-covenants-explained.html`, `kaspa-vs-ethereum-apps.html`, `kaspa-coordination-markets.html`, `kaspa-vprogs-explained.html`, `kaspa-tps-explained.html`, `crypto-from-zero.html`, `why-crypto-has-value.html`, `why-are-there-so-many-coins.html`, `tradeoff-map.html`, `analyze-any-coin.html`, `crypto-history.html`, `what-crypto-is-good-for.html`, `command-line.html`, `kaspa-confirmations-finality.html`, `kaspa-status-check-may-2026.html`, or `ghostdag-explained.html`. Any of those filenames named elsewhere in this brief are stale references to retired or never-built pages, not live content; do not describe one as a page a reader can visit.

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

Additional consistency checks after the May 2026 human-first/tone pass:

- Public tone: scan changed public copy for medium authority and medium visual weight. Avoid grand titles, personal/internal shorthand, pitch-deck phrasing, and overlarge visual hierarchy.
- LLM/context boundary: keep dense source rules, maintenance notes, and retrieval guidance in `llms.txt`, `CLAIMS.yml`, `sources.html`, and this brief. Public pages should not expose internal editorial notes.
- Source freshness: use current `kaspa.org/developments/`, `docs.kaspa.org`, and `kaspa.org/build` for orientation and builder routing, then verify live/shipped protocol claims against KIPs, code, releases, research papers, or accepted artifacts before public copy changes. `kaspa.org/developments` and `kaspa.org/build` serve the same page, and both lag: on August 1, 2026, thirty-two days after mainnet activation, that page still read "Currently live on TN12 ahead of mainnet activation" and `kaspa.org/lore` still read "The next hardfork is Toccata." Never source a protocol status from those three URLs.
- Web basics: favicon, touch icon, manifest, Open Graph image, Twitter image, canonical links, sitemap, robots, and local screenshots are part of the product surface. Keep them updated when brand marks, route structure, or public framing changes.
- GitHub public framing: when homepage, README, or site voice changes, check GitHub About metadata (`gh repo view ... --json description,homepageUrl,repositoryTopics`) and keep the repo description aligned with the live site.
- Fast-PoW graph: verify the `why-kaspa-matters.html` comparison graphic does not imply instant finality, a simple "stronger confirmation" ranking, or a universal critique of all PoS systems. The visual should distinguish inclusion speed from explicit vote/stake coordination, and it must not overlap on mobile.
- Visual overlap: for any CSS, heading-size, diagram, table, or card change, screenshot the affected page on mobile and desktop. Check that axis labels, hero arcs, buttons, cards, and table labels do not cover nearby text.
- Live deployment: after push, verify GitHub Actions, Pages deployment, and direct live HTML for the exact changed phrases before saying the change is live.

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
