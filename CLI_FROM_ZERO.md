# Kaspa Explained CLI From Zero

This guide is for someone starting with a terminal and trying to verify Kaspa
without trusting one explorer, one wallet UI, or one hosted dashboard.

Kaspa Explained does not create wallets, sign transactions, submit transactions,
or run a Kaspa node. This file is a source-backed map to the public command-line
paths that do those jobs.

## What You Need

- A terminal.
- Git.
- Docker, or Rust/Cargo if building Rusty Kaspa from source.
- Separate wallet/key hygiene before touching real funds.

Check the basics:

```sh
git --version
docker --version
cargo --version
```

## Mainnet, Testnet, Roadmap, Research

Use the site to separate claim types:

- Mainnet live: current Kaspa network behavior such as proof of work, UTXO accounting, GHOSTDAG, and the current blockDAG era.
- Mainnet tools: wallets, explorers, indexers, APIs, and receipt workflows that exist around live Kaspa transactions.
- Testnet only: TN12 covenant/proof experiments and other non-mainnet validation work.
- Targeted or roadmap: planned protocol/application work that is not yet live mainnet behavior.
- Research: ideas, papers, prototypes, or architecture directions that should not be described as shipped.

For command-line TN12 experiments, use the TN12 repo. This site can link to that evidence. Command execution lives in the TN12 repo.

## Mainnet Terminal Path

This repo should help a reader know where to go. Private mainnet commands need primary-source support. A real mainnet terminal path usually has this shape:

```txt
install official node or wallet tooling
sync or connect to a mainnet node/RPC source
query an address, transaction, or UTXO
build or review a transaction with production wallet software
sign only after checking network, inputs, outputs, amount, fee, and intent
broadcast through the intended mainnet route
verify the accepted transaction in an explorer or node/indexer query
```

The reason to learn this path is resilience. A trustless base layer is weaker
in practice if nearly everyone depends on one hosted explorer, one wallet UI, or
one dashboard to know what happened. A normal user does not need to become a
node operator on day one, but the public education path should show how to move
from a website, to an explorer, to a wallet, to a node/RPC query when more
assurance is needed.

Use public Kaspa resources for the exact commands and versions:

- Kaspa.org Build and official documentation for current builder entry points.
- Rusty Kaspa releases and docs for node/RPC behavior.
- WASM/SDK examples for supported application code paths.
- Public explorers for accepted transaction checks.
- Wallet documentation for key handling, signing, and broadcast behavior.

Useful source URLs:

- `https://kaspa.org/build`
- `https://docs.kaspa.org/`
- `https://github.com/kaspanet/rusty-kaspa`
- `https://github.com/kaspanet/rusty-kaspa/releases`
- `https://explorer.kaspa.org/`
- `https://faucet-testnet.kaspanet.io/`

Do not copy TN12 commands into mainnet. Testnet faucet wallets, covenant proof
drafts, and local `.local/` keys are learning tools. Production wallets need separate security review.

## Mainnet Commands

These are the current source-backed entry points. Treat them as the path to
learn and verify from the terminal. Before using real funds, check the linked
sources for current versions, flags, and wallet behavior.

### Run a mainnet node

Fastest Docker route:

```sh
docker run -d --name kaspad -p 16110:16110 kaspanet/rusty-kaspad:latest
```

What it does:

- downloads and starts the latest Rusty Kaspa node image;
- exposes local gRPC on port `16110`;
- gives your machine a local node process to query;
- does not create a wallet or sign transactions.

Source-build route:

```sh
git clone https://github.com/kaspanet/rusty-kaspa
cd rusty-kaspa
cargo run --release --bin kaspad
```

Mainnet node with UTXO indexing:

```sh
cargo run --release --bin kaspad -- --utxoindex
```

Use `--utxoindex` when wallet or UTXO queries need indexed UTXO state. Let the
node sync before relying on its answers.

### Open the terminal wallet/RPC interface

From a Rusty Kaspa checkout:

```sh
cd cli
cargo run --release
```

What it does:

- opens the Rusty Kaspa command-line interface;
- gives a terminal route into RPC and wallet runtime behavior;
- should be used only after reading its help output and confirming which network
  it is connected to.

Before signing anything:

- confirm mainnet versus testnet;
- confirm where wallet files are stored;
- back up keys according to wallet documentation;
- send a tiny test amount first;
- verify the accepted transaction through independent sources when possible.

### Start a generic testnet node

Generic Rusty Kaspa testnet route:

```sh
cargo run --release --bin kaspad -- --testnet
```

Older Kaspa hard-fork testnet guides use explicit testnet suffixes, for example:

```sh
kaspad --testnet --netsuffix=10 --utxoindex
cargo run --bin kaspad --release -- --testnet --netsuffix=10 --utxoindex
```

For TN12 or Toccata-era testing, confirm the current release, netsuffix, and
flags from the active public Toccata/TN12 docs before running. Do not assume a
TN10 command is the right TN12 command.

As of June 25, 2026, Rusty Kaspa v2.0.1 is the current Toccata release, and
v2.0.0 still provides the mainnet activation target. Rusty Kaspa's
`tn10-toc2` pre-release scheduled Testnet-10 Toccata activation at DAA score
467,579,632, and `tn10-toc3` scheduled final Toccata ZK hardening at DAA score
476,232,000. A June 25 API check showed Testnet-10 virtual DAA 500,129,160,
above both scores. Treat those releases and REST status as testnet evidence and
check their current notes before reusing historical TN10/Crescendo commands.

### Enable wRPC on a node

For app/RPC work, enable the JSON WebSocket RPC listener:

```sh
--rpclisten-json=<interface:port>
--rpclisten-json=default
```

Use this as a flag on the node command, for example:

```sh
cargo run --release --bin kaspad -- --utxoindex --rpclisten-json=default
```

What it does:

- exposes a wRPC JSON endpoint;
- lets SDKs/scripts query node state over WebSocket;
- is required by some app and payload workflows;
- should be bound carefully if the machine is reachable from the public
  internet.

### Query without running your own node

Kaspa.org Build points to public docs, public explorers, a community API, and
the public node network. Use those for learning and quick reads, but remember
that hosted services are convenience layers. For higher assurance, compare
against your own node or another independent source.

Basic verification ladder:

```txt
explorer says tx accepted
another explorer or API agrees
your wallet balance matches
your own node/RPC query agrees
your app/indexer replay matches the accepted txid and payload/output rules
```

That is the point of the command-line path: not everyone needs to run every
layer all the time, but the route away from a single hosted view should exist.

## From Reading To Running

Use this route if you are starting from zero:

1. Read `start-here.html` and `status.html` to separate live, targeted, roadmap,
   and research claims.
2. Use `builder-guide.html` and `sources.html` to find the public docs behind a
   command path.
3. Run a mainnet node only from current Rusty Kaspa release/source docs.
4. Use `kaspa-cli` or wallet docs only after checking network, key storage, and
   signing behavior.
5. For TN12 experiments, switch repos and follow that repo's
   `docs/CLI_FROM_ZERO.md`.
6. For mainnet funds, stop and use official wallet/node documentation instead
   of copying testnet commands.

## Public Sources For Mainnet Work

This site does not invent mainnet command guidance. It points readers back to
public Kaspa resources:

- `sources.html` lists the source hierarchy and reference map.
- `builder-guide.html` links to Kaspa.org Build, official Kaspa docs, Rusty
  Kaspa releases, WASM examples, accepted-transaction docs, payload docs, node
  docs, explorers, and testnet resources.
- `status.html` says which claims are live, testnet-only, targeted, roadmap,
  or research.
- Official mainnet work should start from public Kaspa wallet, node, SDK, and
  explorer documentation. TN12 covenant commands are testnet practice.
- TN10/Toccata activation-test releases are also testnet evidence. Do not turn
  a Testnet-10 schedule into mainnet command guidance.
- When Toccata or later mainnet tooling changes what can be done from a
  terminal, update this site from public activation, release, and tool docs
  first. Do not promote testnet commands as mainnet instructions.

## Maintainer Reminder

When Toccata becomes mainnet behavior, update this file, `status.html`,
`builder-guide.html`, `sources.html`, `CLAIMS.yml`, and `llms.txt` from public
activation evidence, Rusty Kaspa releases, official docs, and working tool
commands. Until that evidence exists, keep Toccata/TN12 command examples in the
testnet or targeted lane.

## What This Repo Does Not Do

- It does not install or run a Kaspa node.
- It does not create wallets.
- It does not submit transactions.
- It does not prove TN12 artifacts.
- It does not make roadmap features live.

For self-sovereign transaction work, use wallet/node/indexer documentation and test carefully on testnet before touching mainnet funds.
