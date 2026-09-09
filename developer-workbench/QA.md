# Local developer workbench acceptance

Verified September 9, 2026 against the separate local beta at `http://127.0.0.1:8930`. Browser requests were restricted to this origin. No wallet, faucet, transaction broadcast, or deployment was used.

## Results

| Check | Observed result |
|---|---|
| Core journeys | **30/30 passed:** allowance, escrow, treasury, receipt, and proof in Chromium, Firefox, and WebKit at 1440×1000 and 390×844. |
| Construction and execution | Each default and meaningful edited configuration returned an actual unsigned synthetic transaction, inputs and outputs, `stage: vm`, and `submitted: false`. |
| Invalid settings | Allowance overspend and receipt dust remainder rejected by the service. Principal bounds rejected by the browser before any validation request. Editing immediately removes the prior result’s current-status claim and disables export. |
| Contract rejection | A missing second treasury signature and corrupt proof each reached and failed native VM execution in all six combinations. Early escrow refund failed builder validation against the explicitly configured synthetic median time; this is a preflight rejection, not VM evidence. |
| Comparison | Edited values appeared beside the saved baseline in every journey. Actual transaction source remained inspectable. |
| Export | Ten browser ZIP downloads passed: all five edited examples in Chromium desktop, plus allowance in the other five combinations. Each ZIP’s `config.json` preserved the selected example and edited value; `validation.json` recorded the VM check and no submission. Independent extracted-project execution is tested separately by the engine owner. |
| Settings round trip | Chromium at 390px restored prior settings from History, downloaded changed settings, reset them, and imported the download with the edited value intact (`settings-report.json`). |
| Persistence | Each example’s edited values survived save/reload and a fresh successful run. Imported allowance settings survived reload in all six combinations. Reload disabled export until a new check completed. |
| Argent compiler | All five reviewed actor applications compiled through the UI in every browser/size combination (30 compilations); generated SilverScript was inspectable. Compilation is not VM execution or chain acceptance. |
| KRC payloads | The default payload passed; editing removed its stale success heading; malformed JSON produced a clear error. All six combinations passed. Indexer acceptance is outside this check. |
| Explain tab | All five explanations passed layout/contrast/control checks in all three engines at 1440px, 390px, and 320px (45 view checks). The proof explanation at mobile width was visually inspected. Evidence: `explain-report.json`. |
| Layout and enabled-text contrast | No page-level horizontal overflow, unnamed visible form controls, or calculated enabled-text contrast failures in the tested core, compiler, payload, and ecosystem views. Core views checked in light and dark themes. |
| Keyboard | Run by Ctrl+Enter, save by focused Enter, normal Tab traversal, and visible focus were checked. This is not a screen-reader certification. |
| Browser errors | No uncaught errors, unexpected console errors, external browser requests, or server errors. Expected HTTP 400 validation responses were recorded separately. |

## Reproduce and inspect

From the repository root with the local server running:

```sh
node developer-workbench/tests/browser.mjs
node developer-workbench/tests/browser.mjs --tools-only
```

The default runner includes ZIP inspection. `--skip-export` is an explicitly partial run; `--engine=chromium` (or comma-separated engine names) limits the browser selection. `WORKBENCH_URL` can select another loopback port.

Evidence is under `.cache/developer-workbench-browser/`: `report.json`, `tools-report.json`, full-page screenshots by browser/width/example, and downloaded ZIP files. These reports are generated artifacts and describe the exact local run, not a public deployment.

The browser matrix uses desktop browser engines at mobile viewport sizes. Real mobile hardware, touch ergonomics, screen-reader behavior, a wallet signing flow, live node/indexer acceptance, and production audit remain outside this evidence. The proof example is an experimental fixed arithmetic circuit with public setup, not an arbitrary-work verifier.

## Live escrow extension

The new browser wallet and live escrow path is a separate acceptance scope. The offline results above do not verify its signing, submission, recovery, or chain-acceptance behavior. The live browser QA below creates only an isolated, unfunded wallet; it does not request coins, approve spending, or send transactions. Funded end-to-end evidence is separate.


- **Fresh view and ownership: 6/6 passed.** Chromium, Firefox, and WebKit at 1440px and 390px blocked a second tab from wallet ownership. Closing the owner and reloading the second tab transferred ownership. No page errors, unexpected requests, page overflow, unnamed controls, or enabled-text contrast failures were observed.
- **Unfunded recovery: passed in isolated Chromium.** Created a fresh wallet with zero balance, verified deposit remained disabled, downloaded password-encrypted recovery, reloaded the wallet, removed only the isolated test wallet's local decryption secret, rejected a wrong password without switching records, and restored the valid recovery into a new namespace while preserving the old encrypted record. No faucet request or transaction was made.
- **Source review:** fixes now reset hydration scan cursors, revalidate saved transaction bytes and retained acceptance, show acceptance as unverified until checked, await cancellation persistence, use a stage-neutral storage error, hold a Web Lock across tabs, and stage recovery before switching its active record. The engine owner separately tests execution and rejection boundaries.

Reproduce unfunded checks with `node developer-workbench/tests/live-browser.mjs`. Evidence: `live-unfunded-report.json`, `live-recovery-report.json`, and `live-<browser>-<width>.png` under the same cache directory. The encrypted QA recovery is disposable and unfunded. These checks do not verify a funded deposit, payout, refund, arbiter resolution, or live signed-journal recovery.
