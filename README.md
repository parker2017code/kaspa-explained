# Kaspa Explained

An independent guide to Kaspa with interactive explanations and experimental
Testnet-10 applications. [Open the site](https://kaspaexplained.com), including public Testnet-10
applications. The standalone educational V1 build remains available from the same source.

The public build packages sixteen canonical pages and 87 compatibility routes. Its browser
application generates disposable test accounts, encrypts recovery in the browser,
and connects directly to Testnet-10. Visitors can try native payments, escrow,
threshold treasury, prediction payouts, a fixed proof, capped tokens and fully
backed native receipts. Application transactions need no public signing server or compiler endpoint.
The new guided source flow adds automatic disposable-session recovery and an
optional fixed-amount external testnet faucet; see [faucet operations](docs/faucet.md).
The earlier guided release `85414b4` matched all 138 expected live files.
The first online faucet claim delivered exactly 10 tKAS, and the dedicated
faucet reserve has received 9,000 tKAS in total. All six guided scenarios completed online: 13 application transactions were
accepted and independently checked against public history. See
[the guided verification report](design/GUIDED-APPS-REVIEW.md).
V3 revision `d1d69ec` is deployed; all 143 public files match the verified build.
It adds detailed SVG diagrams, phone rendering improvements and public names
recorded in token creation transactions. Names use application-specific metadata;
they do not assert KCC standard compliance. A fresh public visitor completed all
six V3 scenarios with 13 accepted transactions; 432 live education states passed
across three browser engines. See [V3 verification](docs/release-v3.md).

These examples are unaudited and are not intended for mainnet.

## Preview the education site

Use Node.js 22 or later:

```sh
npm ci
npm run build:v1
node scripts/static-preview.mjs dist-v1
```

Open http://127.0.0.1:8899/. `src/` is the maintained source; generated output
belongs in `dist-v1/` or `dist/`.

## Build and verify the public applications

On macOS or Linux arm64/x64, install Git, Rust/native build tools, `unzip` and
`tar`, then run:

```sh
npm ci
npm run setup:testnet
npm run check:contracts:vm
node scripts/build-public-templates.mjs --check-vm
node scripts/public-token-fixtures.mjs --check-vm
node scripts/public-receipt-fixtures.mjs --check-vm
npm run check:public
npx playwright install chromium firefox webkit
npm run check:public:browser
node scripts/static-preview.mjs dist
```

Setup verifies SDK/compiler SHA-256 checksums. `check:contracts:vm` also obtains
and verifies the pinned SilverScript source required by subsequent public VM
checks. The VM suites use unfunded fixtures and locked Rust dependencies.
The browser gate uses real Testnet-10 RPC to check SDK loading, zero-balance
accounts, encrypted recovery, errors and layout across three engines. It does
not fund accounts or submit transactions. Node unavailability fails the gate.
Windows setup is unverified.

[Public architecture](docs/public-architecture.md) maps the six contract sources,
transaction builders, signing adapters, recovery and deployment artifacts.
[Public browser evidence](design/PUBLIC-APPS-REVIEW.md) records the 24 accepted
application transactions and final visual coverage. Acceptance is a dated node
observation, not finality or a security audit. Physical devices and installed
external-wallet providers remain unverified.

For educational changes, run `npm run check:v1`, `npm run check:copy` and
`npm run check:posts`. `npm run check` additionally covers models and the local
workshop. [The release checklist](RELEASE-CHECKLIST.md),
[V1 notes](docs/release-v1.md) and [V2 notes](docs/release-v2.md) distinguish
local checks, published source and deployed behavior.

## Local workshop

`server/` is a separate capped testnet workshop, started with `npm run serve`
on http://127.0.0.1:8898/. It controls local disposable identities and is not
a public wallet service. Private state stays under ignored `.local/` and must
never be published. The public static build excludes this server and its signing
interfaces. Each workshop spend requires review; uncertain submissions block
new spends until reconciled.

## Reuse

Pages and models live in `src/`; public contracts in `contracts/public/`;
verification in `tests/` and `scripts/`; social posts in `content/`.
Code is MIT and educational content is CC BY 4.0, subject to the exceptions
and attributions in [LICENSE.md](LICENSE.md) and
[THIRD_PARTY.md](THIRD_PARTY.md). Preserve upstream notices and the separate
terms for Moose's books. Corrections should identify the exact claim or
behavior and supporting primary source.
