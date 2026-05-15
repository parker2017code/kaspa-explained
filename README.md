# Kaspa Explained

Plain-English guide to Kaspa, fast Proof of Work, current status, claim checking, sources, glossary, and crypto basics.

This is not an official Kaspa website and it is not investment advice. It is written to be useful for:

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

Use primary or near-primary sources first. Status-sensitive claims should be anchored in code, releases, KIPs, research papers, protocol documentation, or direct implementation notes from core technical contributors.

Use these files instead of turning the README into the source guide:

- `CLAIMS.yml` for status-sensitive claim boundaries and recheck dates.
- `sources.html` for the public source hierarchy and external reference map.
- `llms.txt` for compact retrieval guidance.
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
- `kaspa-claims-checker.html` is the shareable live / ecosystem / targeted / roadmap / research reference.
- `toccata-status.html` tracks Toccata status and safe wording.
- `status.html` separates live, ecosystem-live, targeted, roadmap, and research claims.
- `kaspa-status-updates.html` is the index for dated status updates.
- `kaspa-status-check-may-2026.html` is the current dated status snapshot.
- `build-this-now.html` turns the builder loop into short practical recipes.
- `skeptical-case.html` is the risks and open-questions page.
- `sources.html` is the human source guide.
- `search.html` is the quickest concept/page finder.
- `CLAIMS.yml` is the reference file for status-sensitive claims.
- `site-manifest.json` is the checked page, nav, sitemap-extra, and support-file inventory.
- `CONTRIBUTING.md` explains correction and contribution rules.

## Maintenance checks

The `scripts/` folder contains the local and CI validation gates:

- `scripts/check-site.sh` checks the expected public pages and support files, custom domain, generated sitemap, canonical links, skip links, social metadata, `dateModified` metadata, nav wiring, search-result coverage, local anchors, sensitive claim markers, forbidden overclaim phrases, and nav synchronization.
- `scripts/check-nav-sync.sh` compares the copied static nav links across every HTML page and checks the primary nav against `site-manifest.json`.
- `scripts/check-links.sh` audits external links for routine maintenance and runs separately from the push gate.
- `scripts/check-rendered-layout.sh` optionally opens key pages in Chromium at mobile and desktop sizes and verifies screenshots can be rendered.

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
- Ecosystem live: KRC20 tokens and KRC721-style NFTs through ecosystem tooling, wallets, indexers, metadata, and APIs. Required deploy/mint gas fees are miner fees, while wallets or frontends may charge separately. Useful for tokens, coupons, event credits, rewards, access passes, and collectibles, but not native Kaspa smart contracts or Toccata/vProgs activation.
- Near-term track: Toccata/Covenants++ as the L1 hard-fork path for concrete rules such as spend constraints, asset rules, covenant IDs, Silverscript, ZK-facing verification work, sequencing commitments, native-asset groundwork, and standalone based-app experiments. Treat this as targeted until activation is confirmed by primary sources.
- Architecture / roadmap: vProgs as apps that prove richer logic while sharing Kaspa ordering, plus app-level verifiable programs, computational-DAG metadata, prover-backed execution, Kaspa-native DeFi rails, native-feeling developer experience, and eventual synchronous composability.
- Research / speculative: DAGKnight activation, 100 BPS with probabilistic predecessor selection, app-level miner attestation/oracle incentive designs, TangVM-style extensions, Proof of Useful Work, post-quantum migration.

Kaspa programmability should be framed as concrete use first, neutral primitives second. Say what the user or app is trying to do: lock funds, enforce a vault rule, create an asset, route a payment, fund a public good, resolve a market, attest to an event, or prove app logic. Then explain that the protocol should expose durable L1 surfaces while apps define incentives, semantics, oracle sources, legal/risk constraints, and user-facing products. Apply that rule to attestations, prediction markets, DePIN freshness markets, portfolio automation, launch rails, AI-agent task boards, and DeFi.

Narrative update from the May 8, 2026 Kaspa Daily Yonatan Q&A: treat "fast money," Base of Liquidity, and merchant/POS flows as rails, not the whole adoption strategy. The stronger public framing is useful products, visible on-chain activity, liquidity, coordination-market direction, and L1-first app architecture.

Narrative update from Junny Ho's Web3 Festival HK 2026 talk (`https://www.youtube.com/watch?v=b3wPZ04p410`): frame coordination markets around stag-hunt coordination, credible commitments, conditional participation, economic exposure, and real-time decentralized confirmation. Keep shipped-feature claims tied to activation evidence.

Toccata/vProgs split: Toccata enables L1 covenant programming and standalone based-app foundations. A based app anchors app-specific state to Kaspa L1 ordering, commitments, proofs, settlement, or exits; ZK is one verification path, not the definition of every based app. Hans Moog's `kaspanet/vprogs` repo is early compatible runtime work for based computation on Kaspa. Full synchronous vProgs need separate activation evidence. Frame Kaspa around L1-first shared sequencing, settlement, commitments, and verification.

Editorial voice: explain Kaspa in first-principles everyday language for the page's intended reader, then give deeper readers clear routes into technical, adoption, app-design, and source-checking material. Apply Concrete-First Translation: "one shared record without one operator" before "credible shared state," "apps that prove their rules" before "verification-oriented programmability," and "fast mined ordering" before "settlement layer." The target is not one page that serves every reader equally; it is a site with clear paths from absolute beginner through crypto-curious reader, crypto-native comparer, Bitcoin/PoW reader, adoption researcher, app designer, protocol expert, community educator, journalist, and source-checking reviewer.

Startup verification: before substantive edits, recheck current web/source state for drift-prone Kaspa facts such as Toccata activation, DAGKnight, vProgs, native DeFi, RTD-derived attestations/oracles, TangVM, Proof of Useful Work, and date windows. Keep public pages clean of visible verification boxes unless explicitly requested.

Builder verification rule: accepted app state starts after accepted transaction evidence. Builder-facing pages should tell readers to record SDK, node, network, endpoint, tx shape, and acceptance evidence, then label failures narrowly as bad config, stale tooling, submit mismatch, or confirmed consensus rejection.

## Local check

This is a plain static site. A quick smoke check is enough:

```sh
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.
