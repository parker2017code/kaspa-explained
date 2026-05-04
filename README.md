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

1. https://hashd.ag/ - Hashdag / Yonatan Sompolinsky's writing archive
2. https://hashd.ag/raw - raw archive view
3. https://medium.com/@michaelsuttonil/kaspa-covenants-toccata-hard-fork-outlook-a4d81a40900c
4. https://github.com/kaspanet/rusty-kaspa
5. https://github.com/kaspanet/rusty-kaspa/releases
6. https://research.kas.pa/
7. https://qa.kas.pa/
8. https://kasmedia.com/
9. Bitcoin Takeover S16 E41 Yonatan Sompolinsky interview and transcript:
   - https://www.youtube.com/live/GaJmYV8OHfQ
   - https://podscan.fm/podcasts/bitcoin-takeover-podcast/episodes/s16-e41-yonatan-sompolinsky-on-bitcoin-kaspa-amp-proof-of-work
10. Kaspa: Mining the Internet Yonatan Sompolinsky Tokenize talk
11. https://kasmedia.com/article/weeklyknight-08282025 - recap of the Bitcoin Takeover Yonatan interview, with selected quotes and exact YouTube live URL
12. https://www.youtube.com/watch?v=VIZGKoIaGR0 - Yonatan Sompolinsky Oxford Union address
13. https://www.youtube.com/watch?v=S1dS1xvvFss - Yonatan Sompolinsky Oxford Union Q&A
14. https://www.youtube.com/watch?v=xHlOcR1x2tU - Michael Sutton vProgs masterclass
15. https://www.youtube.com/watch?v=p21KDrKEhB8 - Michael Sutton on Crescendo, based rollups, and DAGKnight
16. https://kasmedia.com/article/ori-interview
17. https://kasmedia.com/article/theweeklyknight081725
18. https://kasmedia.com/article/weeklyknightl12s-and-pows
19. https://kasmedia.com/article/moog-synthesizers-and-kaspa
20. https://kaspa.org/yonatan-sompolinsky-at-the-oxford-union/ - event context only; do not treat as transcript unless a recording/transcript is available

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

- `/` - Kaspa overview, status lanes, source stack, and high-signal interview notes.
- `/what-crypto-is-good-for.html` - general crypto reality check for where crypto is useful and where a normal database, payment system, court, or trusted operator is better.
- `/why-kaspa-matters.html` - bridge page from the general crypto reality check to Kaspa's live Proof-of-Work blockDAG settlement and future RTD / coordination-market / vProgs thesis.
- `/where-kaspa-fits.html` - comparison page for Kaspa's lane among Bitcoin, Ethereum, Solana, stablecoins, exchange chains, meme assets, smart-contract L1s, Chainlink, and app-specific chains.

## Status discipline

Do not flatten everything into "live."

- Live: Proof of Work blockDAG, UTXO model, GHOSTDAG, Crescendo 10 BPS era.
- Near-term track: Toccata, covenants, Silverscript, ZK verification foundations, sequencing commitments, and vProgs groundwork.
- Architecture / roadmap: vProgs as app-level verifiable programs, Kaspa-native DeFi rails, monolithic-feeling developer experience, synchronous composability.
- Research / speculative: DAGKnight activation, 100 BPS with probabilistic predecessor selection, RTD-style miner attestation/oracle designs, TangVM-style extensions, Proof of Useful Work, post-quantum migration.

## Local check

This is a plain static site. A quick smoke check is enough:

```sh
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.
