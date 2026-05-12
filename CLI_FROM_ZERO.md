# Kaspa Explained CLI From Zero

This guide is for someone starting with a terminal and no repo context.

Kaspa Explained is a static public explainer site. It does not create wallets, sign transactions, submit testnet transactions, or run a Kaspa node. Its command-line path is for reading, editing, and verifying the website locally.

## What You Need

- A terminal.
- Git.
- Python 3 for local preview.
- Bash for the site checks.

Check the basics:

```sh
git --version
python3 --version
bash --version
```

## Get The Repo

```sh
git clone <repo-url>
cd kaspa-explained
```

What happened:

- `git clone` copied the site files.
- `cd` moved your terminal into the site repo.

There is no `npm ci` step here because this repo is a plain static site.

## Run The Site Locally

```sh
python3 -m http.server 4173
```

Open:

```txt
http://127.0.0.1:4173/
```

Stop the server with `Ctrl+C` in the terminal that started it.

## Run The Local Gate

In another terminal:

```sh
bash scripts/check-site.sh
```

What it checks:

- expected public pages and support files;
- canonical links and sitemap entries;
- local anchors;
- duplicated nav wiring;
- search-result coverage;
- social metadata;
- source/status guardrails;
- forbidden overclaim phrases.

If this passes, the static site is internally consistent. It does not prove that every live Kaspa fact is current forever.

## Mainnet, Testnet, Roadmap, Research

Use the site to separate claim types:

- Mainnet live: current Kaspa network behavior such as proof of work, UTXO accounting, GHOSTDAG, and the current blockDAG era.
- Ecosystem live: wallets, tools, KRC-style tokens/NFTs, explorers, and indexers that exist around Kaspa.
- Testnet only: TN12 covenant/proof experiments and other non-mainnet validation work.
- Targeted or roadmap: planned protocol/application work that is not yet live mainnet behavior.
- Research: ideas, papers, prototypes, or architecture directions that should not be described as shipped.

For command-line TN12 experiments, use the TN12 repo. This site can link to that evidence, but it does not execute it.

## Edit Safely

Before editing a status-sensitive claim:

1. Check the relevant page.
2. Check `CLAIMS.yml`.
3. Check `sources.html`.
4. Check `CONTENT_BRIEF.md` for editorial boundaries.
5. Update `llms.txt` only when machine-readable guidance changes.
6. Run `bash scripts/check-site.sh`.

Keep public wording concrete:

- Say what a person or app can do.
- Then say whether it is live, testnet-only, targeted, roadmap, or research.
- Do not repeat the full status taxonomy on every page.

## What This Repo Does Not Do

- It does not install or run a Kaspa node.
- It does not create wallets.
- It does not submit transactions.
- It does not prove TN12 artifacts.
- It does not make roadmap features live.

For self-sovereign transaction work, use wallet/node/indexer documentation and test carefully on testnet before touching mainnet funds.
