# Kaspa Studio — local developer beta

A separate developer workbench for configuring real Kaspa contract transactions, inspecting their source and output structure, validating their rules, and exporting runnable application starters.

## Open the workbench

From the repository root:

```sh
npm run serve:studio
```

Open <http://127.0.0.1:8930>. The service binds to the local computer. This workbench is not included in the public website build. V5 and V6 remain withdrawn.

The initial beta requires the repository's existing pinned toolchain and compiled VM tools. The health endpoint reports missing prerequisites. See `research.md` for exact ecosystem versions and compatibility limits. An exported application's README describes its prerequisites separately.

## Build an application

1. Select a starter from the left sidebar.
2. Change its contract configuration.
3. Run checks. Inspect the generated transaction, fee and compiler/VM results.
4. Set a baseline, change a term, and run again to compare the outcome.
5. Inspect source and transaction data in the Source tab.
6. Export the application and run its included checks outside Studio.

Save project preserves example configurations on this browser. Download settings creates a portable JSON file; Import project restores it. Neither contains a real wallet. Restored settings require fresh validation before application export.

## Execution boundaries

- The five starters construct actual transactions against synthetic, unfunded UTXOs.
- Native VM checks use disposable fixture keys; these keys must never hold real funds.
- Compiler success, VM validation and network acceptance are separate facts.
- Studio does not broadcast transactions or create funded wallets.
- KRC payload checks concern syntax and operation structure; a protocol indexer determines KRC state. KRC assets are not interchangeable with native covenant tokens.
- Argent source and generated SilverScript must both be inspected. The compiler remains a development project.

## Verification

```sh
npm run check:studio
node developer-workbench/tests/browser.mjs
```

See `QA.md` for the tested browser, export and application paths, including any remaining limitations. Tests use fixture transactions; they do not establish live-node acceptance or mainnet readiness.
