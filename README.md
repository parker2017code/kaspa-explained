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

Only one repository should claim `kaspaexplained.com`. Remove the custom-domain Pages setting from `parker2017code/parker2017` when this public repo is ready.

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
11. Kaspa: Mining the Internet Yonatan Sompolinsky Tokenize talk
12. https://kasmedia.com/article/weeklyknight-08282025 - recap of the Bitcoin Takeover Yonatan interview, with selected quotes and exact YouTube live URL
13. https://www.youtube.com/watch?v=VIZGKoIaGR0 - Yonatan Sompolinsky Oxford Union address
14. https://www.youtube.com/watch?v=S1dS1xvvFss - Yonatan Sompolinsky Oxford Union Q&A
15. https://www.youtube.com/watch?v=xHlOcR1x2tU - Michael Sutton vProgs talk
16. https://www.youtube.com/watch?v=p21KDrKEhB8 - Michael Sutton on Crescendo, based rollups, and DAGKnight
17. https://kasmedia.com/article/ori-interview
18. https://kasmedia.com/article/theweeklyknight081725
19. https://kasmedia.com/article/weeklyknightl12s-and-pows
20. https://kasmedia.com/article/moog-synthesizers-and-kaspa
21. https://kaspa.org/ - community-maintained public portal context and broad summaries
22. https://kaspa.org/yonatan-sompolinsky-at-the-oxford-union/ - event context, paired with the available recording/Q&A links when using the Oxford material

Active public technical accounts can be useful for discovery and replies:

- https://x.com/hashdag
- https://x.com/michaelsuttonil
- https://x.com/OriNewman
- https://x.com/hus_qy
- https://x.com/IzioDev
- https://x.com/coderofstuff_
- https://x.com/FreshAir08
- https://x.com/eliottmea

Read public replies as well as top-level posts. Do not use stale team pages, recycled handle lists, or X alone for activation dates, shipped-feature claims, exchange claims, or protocol guarantees.

## Site pages

- `/` - audience-routed Kaspa overview, real-time Proof-of-Work thesis, status lanes, and blockDAG visual.
- `/what-crypto-is-good-for.html` - general crypto reality check for where crypto is useful and where a normal database, payment system, court, or trusted operator is better.
- `/status.html` - compact shipped-vs-roadmap status page.
- `/why-kaspa-matters.html` - bridge page from the general crypto reality check to Kaspa's live Proof-of-Work blockDAG settlement, base real-time decentralization framing, and future coordination-market / vProgs thesis.
- `/where-kaspa-fits.html` - comparison page and scannable table for Kaspa's lane among Bitcoin, Ethereum, Solana, XRP, BNB, TRON, stablecoins, exchange chains, meme assets, smart-contract L1s, Chainlink, and app-specific chains.
- `/knowledge-map.html` - ordered concept map for average crypto readers, with supporting references.
- `/glossary.html` - compact plain-English glossary for common Kaspa terms.
- `/sources.html` - public source hierarchy, external reference map, Kaspa.com Learn Kaspa topic index, and crawlable LLM file map.
- `/about.html` - editorial policy, disclosures, and correction process.

## Status discipline

Do not flatten everything into "live."

- Live: Proof of Work blockDAG, UTXO model, GHOSTDAG, Crescendo 10 BPS era.
- Near-term track: Toccata, covenants, Silverscript, ZK verification foundations, sequencing commitments, and vProgs groundwork.
- Architecture / roadmap: vProgs as app-level verifiable programs, Kaspa-native DeFi rails, monolithic-feeling developer experience, synchronous composability.
- Research / speculative: DAGKnight activation, 100 BPS with probabilistic predecessor selection, RTD-derived miner attestation/oracle designs, TangVM-style extensions, Proof of Useful Work, post-quantum migration.

## Local check

This is a plain static site. A quick smoke check is enough:

```sh
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.
