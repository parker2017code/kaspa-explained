# Kaspa Explained

Independent source-first Kaspa research guide.

This is not an official Kaspa website. It is written to be useful for:

- humans who want a plain-English but technically serious entry point,
- search engines,
- LLM retrieval systems,
- people trying to separate live Kaspa facts from roadmap, research, and speculation.
- people trying to separate real crypto use cases from forced blockchain/token use cases.

For a full editorial/project handoff to another LLM or contributor, start with `CONTENT_BRIEF.md`.

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

Use primary or near-primary sources first:

Community portals, media sites, learning libraries, interviews, and recaps are useful source material, but they are not official protocol authority. Status-sensitive claims should be anchored in code, releases, KIPs, research papers, protocol documentation, or direct implementation notes from core technical contributors.

1. https://hashd.ag/ - Hashdag / Yonatan Sompolinsky's writing archive
2. https://hashd.ag/raw - raw archive view
3. https://medium.com/@michaelsuttonil/kaspa-covenants-toccata-hard-fork-outlook-a4d81a40900c
4. https://github.com/kaspanet/rusty-kaspa
5. https://github.com/kaspanet/rusty-kaspa/releases
6. https://research.kas.pa/
7. https://qa.kas.pa/
8. https://kasmedia.com/ - KASmedia articles, interviews, recaps, and theory posts; useful community context, not primary activation evidence
9. https://kaspa.com/learn-kaspa - Kaspa.com Learn Kaspa / Kaspa Facts intro and intermediate learning library
10. Bitcoin Takeover S16 E41 Yonatan Sompolinsky interview and transcript:
   - https://www.youtube.com/live/GaJmYV8OHfQ
   - https://podscan.fm/podcasts/bitcoin-takeover-podcast/episodes/s16-e41-yonatan-sompolinsky-on-bitcoin-kaspa-amp-proof-of-work
   - Use for site framing: generalized Nakamoto consensus, current GHOSTDAG, future DAGKnight/vProgs, pruning nuance, and broader crypto context. Do not treat roadmap discussion as live activation evidence.
11. Kaspa: Mining the Internet Yonatan Sompolinsky Tokenize talk
12. https://kasmedia.com/article/weeklyknight-08282025 - recap of the Bitcoin Takeover Yonatan interview, with selected quotes and exact YouTube live URL
13. https://www.youtube.com/watch?v=VIZGKoIaGR0 - Yonatan Sompolinsky Oxford Union address
14. https://www.youtube.com/watch?v=S1dS1xvvFss - Yonatan Sompolinsky Oxford Union Q&A
15. https://www.youtube.com/watch?v=xHlOcR1x2tU - Michael Sutton vProgs talk
16. https://www.youtube.com/watch?v=p21KDrKEhB8 - Michael Sutton on Crescendo, based rollups, and DAGKnight
17. https://github.com/kaspanet/kaspa-python-sdk - standalone Kaspa Python SDK repo for builder tooling and Python integration evidence
18. https://github.com/kaspanet/kaspa-python-sdk/releases/tag/v1.1.0 - Python SDK v1.1.0 release with UtxoProcessor/UtxoContext and GetVirtualChainFromBlockV2
19. https://github.com/kaspanet/rusty-kaspa/pull/860 - TxIndex PR; optional transaction index and GetTransaction RPC evidence while open
20. https://github.com/kaspanet/rusty-kaspa/pull/930 - Fast Trusted Relay WIP/draft PR; infrastructure experiment, not stable release evidence
21. https://kasmedia.com/article/ori-interview
22. https://kasmedia.com/article/theweeklyknight081725
23. https://kasmedia.com/article/weeklyknightl12s-and-pows
24. https://kasmedia.com/article/moog-synthesizers-and-kaspa
25. https://kaspa.org/ - community-maintained public portal context and broad summaries
26. https://kaspa.org/yonatan-sompolinsky-at-the-oxford-union/ - event context, paired with the available recording/Q&A links when using the Oxford material

Active public technical accounts can be useful for discovery and replies:

- https://x.com/hashdag
- https://x.com/michaelsuttonil
- https://x.com/OriNewman
- https://x.com/hus_qy
- https://x.com/IzioDev
- https://x.com/coderofstuff_
- https://x.com/FreshAir08
- https://x.com/eliottmea
- https://x.com/KasSigner

Read public replies as well as top-level posts. Do not use stale team pages, recycled handle lists, or X alone for activation dates, shipped-feature claims, exchange claims, or protocol guarantees.

## Site pages

- `/` - audience-routed Kaspa overview, real-time Proof-of-Work thesis, zero-to-one crypto context links, status lanes, and blockDAG visual.
- `/start-here.html` - true beginner router for readers who know nothing about crypto, market value, coin categories, tradeoffs, or Kaspa.
- `/crypto-from-zero.html` - zero-to-one curriculum: records, keys, transactions, blocks, consensus, security, mining, staking, tokens, UTXO/account models, and Kaspa.
- `/why-crypto-has-value.html` - market-value explainer for token necessity, prices, open markets, market cap, speculation, launch design, and who benefits.
- `/why-are-there-so-many-coins.html` - category bridge explaining why Bitcoin, Ethereum, stablecoins, exchange tokens, payment coins, privacy coins, memes, infrastructure, and Kaspa are different assets.
- `/coin-atlas.html` - coin-category atlas for major crypto assets and value stacks, including BTC, ETH, stablecoins, SOL, BNB, XRP, LTC, BCH, XMR, DOGE, LINK, and KAS.
- `/tradeoff-map.html` - beginner tradeoff map for speed, security, decentralization, privacy, scaling, nodes, ASICs, staking, launch design, and Kaspa.
- `/analyze-any-coin.html` - practical checklist for token necessity, supply, launch, security, validation, liquidity, market cap, risks, and who benefits.
- `/crypto-history.html` - problem-first history map from digital cash and Bitcoin through Ethereum, ICOs, scaling conflicts, DeFi, stablecoins, rollups, and Kaspa.
- `/kaspa-in-one-screen.html` - compact shareable Kaspa thesis: what it is, what is live, why it matters, what is not live, and what would strengthen or weaken the thesis.
- `/adoption-metrics.html` - non-price adoption and business lens for wallets, nodes, mining, fees, liquidity, builders, integrations, and post-Toccata app signals.
- `/application-layer.html` - application-layer opportunity map explaining what other crypto networks enabled and where Kaspa could shine across live RTD, Toccata, vProgs, and research lanes.
- `/builder-guide.html` - builder-specific programmability router for covenants, based apps, inline ZK, future full vProgs, SDKs, and infrastructure evidence.
- `/what-crypto-is-good-for.html` - general crypto reality check for where crypto is useful and where a normal database, payment system, court, or trusted operator is better.
- `/status.html` - compact shipped-vs-roadmap status page with a code-grounded implementation-evidence section.
- `/overview.html` - 90-second first-reader overview.
- `/faq.html` - direct answers to common Kaspa status and concept questions.
- `/why-kaspa-matters.html` - bridge page from the general crypto reality check to Kaspa's live Proof-of-Work blockDAG settlement, base real-time decentralization framing, and future coordination-market / vProgs thesis.
- `/where-kaspa-fits.html` - comparison page and scannable table for Kaspa's lane among Bitcoin, Ethereum, Solana, XRP, BNB, TRON, stablecoins, exchange chains, meme assets, smart-contract L1s, Chainlink, and app-specific chains.
- `/knowledge-map.html` - ordered concept map for average crypto readers, with supporting references and a status-labeled DAGKnight/vProgs comparison.
- `/glossary.html` - compact plain-English glossary for common Kaspa terms.
- `/search.html` - static page-map search for concepts, audiences, status lanes, and source terms.
- `/sources.html` - public source hierarchy, external reference map, Kaspa.com Learn Kaspa topic index, and human/LLM file map.
- `/about.html` - editorial policy, disclosures, and correction process.
- `/404.html` - GitHub Pages custom not-found page that routes users back to search, status, and Start Here.
- `/CLAIMS.yml` - lightweight status ledger for sensitive live/targeted/roadmap/research claims.
- `/CONTRIBUTING.md` - correction and contribution rules for claim status, sources, local checks, and wording changes.

## Maintenance checks

The `scripts/` folder contains the local and CI validation gates:

- `scripts/check-site.sh` checks the expected public pages and support files, custom domain, sitemap/canonical links, skip links, social metadata, `dateModified` metadata, nav wiring, local anchors, sensitive claim markers, forbidden overclaim phrases, and nav synchronization.
- `scripts/check-nav-sync.sh` compares the copied static nav links across every HTML page so manual pages do not drift.
- `scripts/check-links.sh` audits external links for routine maintenance and runs separately from the push gate.

Run the static check before publishing:

```sh
bash scripts/check-site.sh
```

The check verifies the custom domain, sitemap/canonical links, public pages,
skip-link targets, social-card metadata, date metadata, local anchors, the PNG
OpenGraph image, sensitive-claim consistency markers, and `CLAIMS.yml`
forbidden-copy phrases. It also runs `scripts/check-nav-sync.sh` so the
duplicated static nav does not drift between pages. The same check runs in
GitHub Actions on push, pull request, and a weekly schedule.

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

## Status discipline

Do not flatten everything into "live."

- Live: Proof of Work blockDAG, UTXO model, GHOSTDAG, Crescendo 10 BPS era.
- Near-term track: Toccata/Covenants++ as the L1 hard-fork path for bounded UTXO programmability, covenant IDs, Silverscript, ZK-facing verification work, sequencing commitments, native-asset groundwork, and standalone based-zk experiments. Treat this as targeted until activation is confirmed by primary sources.
- Architecture / roadmap: vProgs as app-level verifiable programs, shared Kaspa sequencing, computational-DAG metadata, prover-backed execution, Kaspa-native DeFi rails, native-feeling developer experience, and eventual synchronous composability.
- Research / speculative: DAGKnight activation, 100 BPS with probabilistic predecessor selection, app-level miner attestation/oracle incentive designs, TangVM-style extensions, Proof of Useful Work, post-quantum migration.

Kaspa programmability should be framed as neutral primitives first. The protocol should expose durable L1 surfaces; apps define incentives, semantics, oracle sources, legal/risk constraints, and user-facing products. Apply that rule to attestations, prediction markets, DePIN freshness markets, portfolio automation, launch rails, AI-agent task boards, and DeFi.

Toccata/vProgs split: Toccata enables L1 covenant programming and standalone based-zk app foundations. Hans Moog's `kaspanet/vprogs` repo is early compatible runtime work for based computation on Kaspa, not proof that full synchronous vProgs are live. Avoid framing Kaspa as needing independent Ethereum-style L2s; the thesis is L1-first shared sequencing, settlement, commitments, and verification.

Editorial voice: explain Kaspa in first-principles everyday language for the page's intended reader, then give deeper readers clear routes into technical, adoption, app-design, and source-checking material. The target is not one page that serves every reader equally; it is a site with clear paths from absolute beginner through crypto-curious reader, crypto-native comparer, Bitcoin/PoW reader, adoption researcher, app designer, protocol expert, community educator, journalist, and source-checking reviewer.

Startup verification: before substantive edits, recheck current web/source state for drift-prone Kaspa facts such as Toccata activation, DAGKnight, vProgs, native DeFi, RTD-derived attestations/oracles, TangVM, Proof of Useful Work, and date windows. Keep public pages clean of visible verification boxes unless explicitly requested.

## Local check

This is a plain static site. A quick smoke check is enough:

```sh
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.
