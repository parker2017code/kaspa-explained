# Kaspa Explained

An independent guide to Kaspa, built around mechanisms you can inspect and change.
The educational site and experimental Testnet-10 workshop share this repository.
Neither is an official Kaspa product or investment advice.

## Run locally

Requires Node.js 22 or later.

```sh
npm ci
npm run build:v1
node scripts/static-preview.mjs
```

Open http://127.0.0.1:8899/. This serves standalone education from `dist-v1/`
on loopback. Old root HTML is not the new source.

For the separate V2 preview, complete the dependency setup below, run
`node scripts/build-public-templates.mjs`, then `npm run build` and
`npm run serve`. The local workshop uses http://127.0.0.1:8898/.

## Structure

- `src/`: pages, shared interface, deterministic educational models.
- `src/page-registry.mjs`: pages used by build, search, and sitemap.
- `server/`: local transaction lookup and capped testnet workshop.
- `contracts/`: experimental Silverscript contracts.
- `tests/`: offline model, encoding, receipt-history, and API tests.
- `scripts/build.mjs`: generate the website and compatibility routes.
- `content/`: social posts, maintained separately from the site.

## Verification

For the standalone educational artifact:

```sh
npm run check:v1
```

For the V2 build and offline application tests, complete the SDK/compiler and
public-template setup described above before running `npm run check`.
Neither check certifies
visual quality, real network acceptance, or production readiness. Browser
journeys and opt-in testnet integration tests are separate release requirements.
The previous root-site render checks do not certify this rebuilt application.

## Testnet workshop

**Testnet-10 only. Experimental, unaudited, never intended for mainnet.**

The local workshop owns disposable test identities. It is not a self-custody
wallet for visitors. Each spend requires review and approval. Amounts, fees,
and cumulative spending are capped. Uncertain submissions block further spends
until reconciled. Private state lives under ignored `.local/` and must never be
published. The server is not safe to expose as a public signing service.

Install the pinned official SDK and compiler on macOS or Linux (arm64/x64):

```sh
npm run setup:testnet
npm run check:contracts
npm run check:contracts:vm
```

Setup verifies SHA-256 checksums before extracting SDK v2.0.1 and SilverScript
v1-rc1 into `.cache/upstream/`. It does not create a wallet or send funds.
It requires `unzip` and `tar`. Windows setup and public V2 packaging remain
unfinished. Compilation alone does not prove a contract. See `THIRD_PARTY.md`.
The VM tests additionally require Rust and native build tools. They load the exact
repository contracts into the pinned SilverScript v1-rc1 execution harness, using
unfunded fixtures and explicit execution budgets. They do not contact a node or
spend coins.

## Releases

V1 is the standalone educational site. V2 adds verified testnet applications.
Both require usable interfaces, accurate labels, tested failure paths, and
release-specific evidence. The local rebuild has not yet been published.
Existing GitHub Pages hosting still serves the older repository-root site;
the new generated output must be configured before release.

## Reuse and corrections

Code is MIT and educational content is CC BY 4.0, subject to exceptions and
attributions in `LICENSE.md`. Preserve upstream notices when reusing examples.
Moose’s books and author links remain available. Corrections should identify
the exact claim, implementation behavior, and primary source.
