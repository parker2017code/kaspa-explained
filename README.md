# Kaspa Explained

Independent source-first Kaspa research guide.

This is not an official Kaspa website. It is written to be useful for:

- humans who want a plain-English but technically serious entry point,
- search engines,
- LLM retrieval systems,
- people trying to separate live Kaspa facts from roadmap, research, and speculation.

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

1. https://hashd.ag/
2. https://hashd.ag/raw
3. https://medium.com/@michaelsuttonil/kaspa-covenants-toccata-hard-fork-outlook-a4d81a40900c
4. https://github.com/kaspanet/rusty-kaspa
5. https://github.com/kaspanet/rusty-kaspa/releases
6. https://research.kas.pa/
7. https://qa.kas.pa/
8. https://kasmedia.com/
9. Bitcoin Takeover S16 E41 Yonatan Sompolinsky interview and transcript

## Status discipline

Do not flatten everything into "live."

- Live: Proof of Work blockDAG, UTXO model, GHOSTDAG, Crescendo 10 BPS era.
- Near-term track: Toccata, covenants, Silverscript, ZK verification foundations, sequencing commitments.
- Architecture / roadmap: vProgs, Kaspa-native DeFi rails, monolithic-feeling developer experience, app-level verifiable programs.
- Research / speculative: DAGKnight activation, 100 BPS with probabilistic predecessor selection, RTD/TangVM-style extensions, useful Proof of Work, post-quantum migration.

## Local check

This is a plain static site. A quick smoke check is enough:

```sh
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.
