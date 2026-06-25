# Kaspa Explained

Plain-English guide to Kaspa, fast Proof of Work, current status, claim checking, sources, glossary, and crypto basics.

This is not an official Kaspa website and it is not investment advice. It is written for:

- readers who want a clear entry point,
- readers checking what is live, what is roadmap, and what is research,
- builders and researchers checking sources,
- search and retrieval systems,
- people trying to separate live Kaspa facts from roadmap, research, and speculation.
- people trying to separate real crypto use cases from forced blockchain/token use cases.

For contributor and editorial context, start with `CONTENT_BRIEF.md`.
Working cleanup notes live under `.github/notes/` so they do not become part of the public site surface.
If you are starting from a blank terminal, use `CLI_FROM_ZERO.md` for the split between Kaspa mainnet node/wallet verification, TN12 testnet practice, and future Toccata-era command paths.

## Domain

`kaspaexplained.com`

The root `CNAME` file must contain exactly:

```txt
kaspaexplained.com
```

## GitHub Pages setup

- Repository: `parker2017code/kaspa-explained`
- Visibility: public
- Pages source: deploy from branch
- Branch: `main`
- Folder: `/` root
- Custom domain: `kaspaexplained.com`
- Enforce HTTPS when GitHub makes it available

## DNS

For Namecheap or equivalent DNS:

- Apex `@` A records:
  - `185.199.108.153`
  - `185.199.109.153`
  - `185.199.110.153`
  - `185.199.111.153`
- `www` CNAME:
  - `parker2017code.github.io`

Do not point `www` to the repository name.

## Source discipline

Use first-party sources first for L1 and status-sensitive claims: kaspanet GitHub repositories, releases, KIPs, Kaspa.org, docs.kaspa.org, public Kaspa API/node readings, and research papers. Core technical posts can explain rationale, but they do not replace release, KIP, node, or activation evidence.

Use these files instead of turning the README into the source guide:

- `CLAIMS.yml` for status-sensitive claim boundaries and recheck dates.
- `claims-reference.html` for a browser-readable version of the status-label rules.
- `COPY_STYLE.md` for the repo-wide anti-filler sentence standard.
- `sources.html` for the public source hierarchy and external reference map.
- `llms.txt` for compact retrieval guidance.
- `agent-index.json` for a static, read-only agent gateway over page text and reference files.
- `CLI_FROM_ZERO.md` for local command-line setup and verification.
- `CONTENT_BRIEF.md` for editorial context and source-use rules.
- `.github/notes/` for internal cleanup queues and flow rules.

When Toccata becomes mainnet behavior, refresh `CLI_FROM_ZERO.md`,
`status.html`, `builder-guide.html`, `sources.html`, `CLAIMS.yml`, and
`llms.txt` from public activation evidence, Rusty Kaspa releases, official docs,
and working tool commands before changing public status language.

Use community portals, media sites, learning libraries, interviews, recaps, and public technical accounts for orientation, links, and framing. Use code, releases, KIPs, protocol docs, direct technical notes, or verifiable network evidence for activation dates, shipped-feature claims, exchange claims, and protocol guarantees.

## Site pages

Use the public site itself for the page map:

- `index.html` routes readers by audience and knowledge level.
- `what-is-kaspa.html` answers the highest-intent beginner search directly.
- `kaspa-claims-checker.html` is the shareable live / testnet / targeted / roadmap / research reference.
- `toccata-status.html` tracks Toccata status and safe wording.
- `status.html` separates live mainnet, testnet, targeted, roadmap, and research claims.
- `kaspa-status-updates.html` is the index for dated status updates.
- `kaspa-status-check-may-2026.html` is the current dated status snapshot.
- `toccata-explained.html` explains Toccata as the expressiveness upgrade: covenants, covenant IDs, ZK proof checks, sequencing lanes, based apps, and the vProgs boundary.
- `kaspa-vprogs-explained.html` explains resource-level scheduling, based computation, and the vProgs roadmap boundary.
- `kaspa-tps-explained.html` answers the max-TPS question by workload: simple payments, covenant transactions, ZK settlements, tokens, and future vProg-style app throughput.
- `build-this-now.html` turns the builder loop into short practical recipes.
- `build-on-kaspa.html` is the founder, builder, supporter, and matching-board funnel.
- `builder-fit-survey.html` is the local founder/app idea intake survey.
- `investor-supporter-survey.html` is the local supporter intake survey.
- `kaspa-for-fintech-founders.html`, `kaspa-app-ideas.html`,
  `kaspa-toccata-use-cases.html`, `kaspa-covenants-explained.html`,
  `kaspa-vs-solana-builders.html`, `kaspa-vs-ethereum-apps.html`,
  `kaspa-coordination-markets.html`, `kaspa-hackathon-challenges.html`, and
  `kaspa-founder-investor-matching.html` are the founder/search page cluster.
- `kaspa-origin-story.html` is the sourced fair-launch and origin-history page.
- `skeptical-case.html` is the risks and open-questions page.
- `sources.html` is the human source guide.
- `search.html` is the quickest concept/page finder.
- `ai-guidance.html` is the public prompt builder for source-checking AI questions.
- `claims-reference.html` is the human-readable companion to `CLAIMS.yml`.
- `CLAIMS.yml` is the reference file for status-sensitive claims.
- `site-manifest.json` is the checked page, nav, sitemap-extra, and support-file inventory.
- `agent-index.json` is the generated static retrieval index for AI agents.
- `CONTRIBUTING.md` explains correction and contribution rules.

## Maintenance checks

The `scripts/` folder contains the local and CI validation gates:

- `scripts/check-site.sh` checks the expected public pages and support files, custom domain, generated sitemap, canonical links, skip links, social metadata, `dateModified` metadata, nav wiring, search-result coverage, local anchors, sensitive claim markers, forbidden overclaim phrases, and nav synchronization.
- `scripts/build-agent-index.py` builds and checks the static agent index from public pages and reference files.
- `scripts/check-nav-sync.sh` compares the copied static nav links across every HTML page and checks the primary nav against `site-manifest.json`.
- `scripts/check-links.sh` audits external links for routine maintenance and runs separately from the push gate.
- `scripts/check-rendered-layout.sh` optionally opens key pages in Chromium at mobile and desktop sizes and verifies screenshots can be rendered.

Internal setup notes live under `.github/notes/`.

Run the static check before publishing:

```sh
bash scripts/check-site.sh
```

The check verifies the custom domain, sitemap/canonical links, public pages,
skip-link targets, social-card metadata, date metadata, local anchors, the PNG
OpenGraph image, search cards, sensitive-claim consistency markers, and
`CLAIMS.yml` forbidden-copy phrases. It also runs `scripts/check-nav-sync.sh`
so the duplicated static nav does not drift between pages or point at routes
outside `site-manifest.json`. The same check runs in GitHub Actions on push,
pull request, and a weekly schedule.

For public copy, layout, or framing changes, also check:

- mobile and desktop screenshots for affected pages,
- no text overlap in diagrams, tables, cards, axis labels, buttons, or hero areas,
- medium authority and medium visual weight in public copy,
- `llms.txt`, `CLAIMS.yml`, `sources.html`, and `CONTENT_BRIEF.md` when status/source boundaries change,
- GitHub About metadata when the public framing or README intro changes,
- live HTML after GitHub Pages deploys.

Rendered screenshot smoke check, when Chromium is available:

```sh
bash scripts/check-rendered-layout.sh
```

The fast-PoW comparison graphic on `why-kaspa-matters.html` needs special care: it should separate inclusion speed from explicit vote/stake coordination and should not imply instant finality or a simple "stronger confirmation" ranking.

External links are audited separately:

```sh
bash scripts/check-links.sh
```

That audit runs weekly and can be triggered manually in GitHub Actions. It is
separate from the normal push check so temporary third-party outages do not
block routine content fixes.

## License

Content is licensed under CC BY 4.0. Code, CSS, scripts, and workflow files are
licensed under MIT. See `LICENSE.md`.

## Current Status Rules

Do not flatten everything into "live."

- Live: Proof of Work blockDAG, UTXO model, GHOSTDAG, Crescendo 10 BPS era.
- Volatile facts: do not add values that can change in seconds, minutes, or hours unless they are free, source-backed, and read from a current API or live node/API script. If the fact is not important to Kaspa L1 status, omit it.
- App/project catalogs are out of scope for status updates unless the L1 fact itself matters, such as transaction payload behavior, accepted transaction evidence, or fees paid to miners.
- Near-term track: Toccata/Covenants++ as the L1 hard-fork path for concrete rules such as spend constraints, asset rules, covenant IDs, Silverscript, ZK-facing verification work, sequencing commitments, native-asset groundwork, and standalone based-app experiments. Rusty Kaspa v2.0.1 was published on June 15, 2026 as the current Toccata release. Rusty Kaspa v2.0.0 was published on June 5, 2026 as the Mainnet Toccata Release and schedules activation at DAA score 474,165,565, roughly June 30, 2026 at 16:15 UTC. Rusty Kaspa's `tn10-toc2` pre-release scheduled the first Testnet-10 activation point at DAA score 467,579,632; `tn10-toc3` scheduled final Toccata ZK hardening at DAA score 476,232,000; and a June 25, 2026 API check showed Testnet-10 virtual DAA 500,129,160. Treat this as released and scheduled until mainnet reaches the activation score and post-activation behavior is observable.
- Toccata operator note: the Rusty Kaspa Toccata node setup guide adds practical upgrade evidence for node operators, wallets, exchanges, pools, miners, explorers, and indexers. Keep it as operator readiness, not mainnet activation: v2.0.1+ upgrade before activation, one-way database migration, higher standard-fee policy for RPC submission, storageMass/storage_mass and transaction version 1 field handling, and Testnet-10 infrastructure testing.
- June 25 L1 snapshot: public REST checks at 11:45 UTC showed `kaspa-mainnet`, virtual DAA 469,680,863, 1,234,055 blocks, about 27.533 billion KAS from the supply endpoint, and 2.59565436 KAS per block. Recheck exact values before quoting.
- Builder tooling: Python SDK v2.0.0/v2.0.1 added Toccata-aligned wallet, lane-proof, SMT-sync, and covenant-binding support. Rusty Kaspa PR #953 merged an `R0ScriptBuilder` helper for RISC Zero proof scripts. Open KIP-24 covers transaction-v1 fields and hashing; open KIP-22 covers P2MR quantum-resistance and MAST-style ScriptPublicKey work. Treat these as tooling/design evidence until merged release and activation evidence changes the status.
- TPS/capacity: use `kaspa-tps-explained.html` when the answer depends on workload. Current simple-payment capacity is a rough 2.5k-3.4k TPS range at 10 BPS from block mass and transaction shape; covenant, proof, token, and vProg-style app capacity need actual workload specs.
- Emission: the official schedule steps down monthly: 27.5 KAS/sec from May 8, 2026; 25.9565436 KAS/sec from June 7; 24.49971475 KAS/sec from July 7. Do not call July a one-day emission cliff.
- Architecture / roadmap: vProgs as apps that prove richer logic while sharing Kaspa ordering, plus app-level verifiable programs, computational-DAG metadata, prover-backed execution, Kaspa-native DeFi rails, native-feeling developer experience, and eventual synchronous composability.
- Research / speculative: DAGKnight activation, 100 BPS with probabilistic predecessor selection, app-level miner attestation/oracle incentive designs, TangVM-style extensions, Proof of Useful Work, post-quantum migration.

Kaspa programmability should be framed as concrete use first, neutral primitives second. Say what the user or app is trying to do: lock funds, enforce a vault rule, create an asset, route a payment, fund a public good, resolve a market, attest to an event, or prove app logic. Then explain that the protocol should expose durable L1 surfaces while apps define incentives, semantics, oracle sources, legal/risk constraints, and user-facing products. Apply that rule to attestations, prediction markets, DePIN freshness markets, portfolio automation, launch rails, AI-agent task boards, and DeFi.

Narrative update from the May 8, 2026 Kaspa Daily Yonatan Q&A: treat "fast money," Base of Liquidity, and merchant/POS flows as rails, not the whole adoption strategy. The stronger public framing is products people repeat, visible on-chain activity, liquidity, coordination-market direction, and L1-first app architecture.

Narrative update from Junny Ho's Web3 Festival HK 2026 talk (`https://www.youtube.com/watch?v=b3wPZ04p410`): frame coordination markets around stag-hunt coordination, credible commitments, conditional participation, economic exposure, and real-time decentralized confirmation. Keep shipped-feature claims tied to activation evidence.

Toccata/vProgs split: Toccata enables L1 covenant programming and standalone based-app foundations. A based app anchors app-specific state to Kaspa L1 ordering, commitments, proofs, settlement, or exits; ZK is one verification path, not the definition of every based app. Hans Moog's `kaspanet/vprogs` repo is early compatible runtime work for based computation on Kaspa, with core, storage, state, scheduling, transaction-runtime, node, L1, and ZK workspace components. Michael Sutton's `michaelsutton/argent` repo is experimental actor-style Silverscript tooling research, not production readiness or activation evidence. Full synchronous vProgs need separate activation evidence. Frame Kaspa around L1-first shared sequencing, settlement, commitments, and verification.

Editorial voice: explain Kaspa in first-principles everyday language for the page's intended reader, then give deeper readers clear routes into technical, adoption, app-design, and source-checking material. Apply Concrete-First Translation: "one shared record without one operator" before "credible shared state," "apps that prove their rules" before "verification-oriented programmability," and "fast mined ordering" before "settlement layer." The target is not one page that serves every reader equally; it is a site with clear paths from absolute beginner through crypto-curious reader, crypto-native comparer, Bitcoin/PoW reader, adoption researcher, app designer, protocol expert, community educator, journalist, and source-checking reviewer.

Startup verification: before substantive edits, recheck current web/source state for drift-prone Kaspa facts such as Toccata activation, DAGKnight, vProgs, native DeFi, RTD-derived attestations/oracles, TangVM, Proof of Useful Work, and date windows. Keep public pages clean of visible verification boxes unless explicitly requested.

Builder verification rule: accepted app state starts after accepted transaction evidence. Builder pages should tell readers to record SDK, node, network, endpoint, tx shape, and acceptance evidence, then label failures narrowly as bad config, stale tooling, submit mismatch, or confirmed consensus rejection.

## Local check

This is a plain static site. Use the clean-URL server for local preview so links such as `/status` resolve to `status.html`:

```sh
python3 scripts/serve-local.py --port 8783
```

Then open `http://127.0.0.1:8783/`.
