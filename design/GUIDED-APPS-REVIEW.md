# Guided application review — September 6, 2026

## Flow

Create a fresh disposable wallet, click **Get 10 test coins**, and choose an example. Each clearly labeled main action signs, saves the exact transaction in the tab, and submits it within the displayed principal and fee limits. No wallet extension, backup download, or second signing button is required. Optional wallet details, backup, transaction details, and ordinary-transaction confirmation remain available.

The sequence is escrow → shared treasury → prediction → proof payout → token → backed receipt. Each example includes a forbidden action to try, an explanation of the missing condition, and a valid action. Next-example buttons follow completed steps. Example selection responds during network work and retains separate contract state. Pending transactions keep spending blocked while automatic checks look for node acceptance; they do not lock navigation.

## Actual Testnet-10 transactions from the local static UI

All six guided scenarios completed through **13 single-click transactions**, each subsequently found in the connected node's accepted-chain history. No manual observation click or recovery download was needed. The funding source for this run was a direct owner-authorized **10 tKAS** allocation, transaction `0a7f5b9fd79d08867bb69b5d9067a9fce221e0b7700a3c3267f95d940da10d3c`, exact output 0 verified at the browser wallet. Its separate funding fee was **0.002648 tKAS**. This run did **not** test the deployed faucet claim.

Application fees were **0.230499 tKAS**. Final native balances were Main **9.083607**, Second **0.19719**, and Third **0 tKAS**. Token contracts retain **0.488704 tKAS**, with **900 unissued units and 100 holder units**. Receipts were fully redeemed. Native balances, retained token value, and application fees reconcile exactly to the 10 tKAS allocation.

The four original forbidden-action checks were evaluated locally against the actual route's timing, required signers, or proof argument. Token inflation and receipt-claim reduction were rejected by their actual transaction builders. No invalid transaction was signed or broadcast, and no node rejection is claimed for those checks.

The independent read-only accepted-chain audit completed at 2026-09-06T17:06:17.077Z using `wss://muon-10.kaspa.blue/kaspa/testnet-10/wrpc/borsh`, starting from each transaction's recorded pre-submission checkpoint. No transaction was missing. These are node observations, not finality guarantees.

| Scenario / action | Transaction ID | Fee (tKAS) | Accepting block |
| --- | --- | ---: | --- |
| escrow / fund | `557f3111de4727eee2fc9d849c76582d721d578e43570cd761e96fb52cac5c58` | 0.002659 | `676763e756a1d65365d77901e10ab195da868e3f6ec6a85902d584e7a965418d` |
| escrow / release | `10308c4480d9ba6cde90b011235eeb6bf0e9e40a0bdbd1c20693bccda0d2bca8` | 0.002810 | `9d4ef2a2f1e784715037b584521e19adc7fe13d41d7d3badd0164b1f105e4a36` |
| treasury / fund | `9c306d7eb278ff17dccffb6de66b7a7a603e5a8ce7f9f43ed40fdc962faa1088` | 0.002659 | `31354cf42fcdc9a42e26c783f0623a19662acf64626e42d7e1f6fd80ae13c49d` |
| treasury / spend | `4b7cdbb2fa37f93447e1864b7c1c9ac708a3b951e347cb5cdf342fd322f06420` | 0.003462 | `b0feaa8b1c56a1f5c1f6ecebfd97892d56fa059487576a3ca18e7f03bd10fce4` |
| prediction / fund | `c8a4a1647a50af876181534adbc1ed8ffb3a8d087e43217795ed62687d3198dc` | 0.004379 | `2b2fd520a223a5a1fdf8583ce582869666d604157baa62bdaae38cecaa230953` |
| prediction / settle | `fddd559519f498533167b256a84b33e8e4c2196247a3d8b710d9e601811018cb` | 0.003527 | `4df2127715bc82fd3a80ee3b3562b804f58884ba9aa56b7afb3a3610b2542923` |
| proof / fund | `365de9cef2f163bea71adf5e0b2f99b885bc528f55877d87f7e3ab308abb3948` | 0.004379 | `2fda8dfad0c365a690a374ac710fc0928b6fa6ebc16c34419a0fa16f336cc9da` |
| proof / verify | `56cf22695c0702cd4f1ede8b8dca8c7895a6822caad73270d67ab6a54b10c635` | 0.181539 | `23e1bc3e72bde6cda56aee48667b05e12c3be9fca50efb6dba126ea92e6a2829` |
| token / create | `f4057ad2909973a4692b541d3b4913db4aeda2a948a45a00d57d50d83777346f` | 0.004413 | `7c951f2ce29d1a7bb31d8997a4f2dcc0f421f78dac466c925fe8337b557330d7` |
| token / mint | `ba8b93c7e9f0176d30fb1fc092697c1ef93f5b6376bc1b19f9541472b1850510` | 0.005816 | `4617f3d28bc2ce93422616272d5bfaeb169489223aa4085d9b3c5c8d66be9b66` |
| token / move | `492132acb660c42c861535e06955e5f12f84d2114de4ea76dc632115eef1a09e` | 0.005480 | `c6e2dc2ac966fba7502519523706eefc89d7e21b7c1ed1017f4da8ad8ab3dc46` |
| receipt / create | `3cc6fe6f561599ce114f413e5c6c502333312001d4827407210ae93b4be731c1` | 0.002693 | `a45f649436badc75b29265083d0dfdc4277182ff2a7180fa8b8b9ddedef8a6f5` |
| receipt / redeem-full | `098fac9810bf173fe658d40b71b05741f4b2219bf4b8ddc38b5f871c90f8cae2` | 0.006683 | `079f6785767afce4486d0ae423efd4f09b132de089ab1e8c58ff91c5cc1add6d` |

Evidence: `.cache/guided-public-transaction-evidence.json`, `.cache/guided-public-acceptance-evidence.json`, and screenshots of the token/receipt rejected-rule states. Encrypted recovery archives remain private local QA artifacts.

## Browser and recovery checks

Fresh-wallet checks passed 60 responsive states each in Chromium and WebKit, including automatic tab-session restoration, preservation of two prepared scenario slots, and selecting another example during a node operation. The permanent browser gate separately passed **168 unfunded states** across Chromium, Firefox and WebKit, including optional file backup and legacy restore compatibility. There were no mandatory downloads, browser exceptions, or page overflow in those checks.

The funded run exposed stale “Checking…” messages after completed balance/observation operations and queued navigation. Those feedback paths were corrected. Faucet handling now accepts a pending transaction response, verifies exact output 0, repeats only the same request ID, rejects a changed transaction ID, and permits one timed retry of that same request.

Final current-build, read-only responsive checks are recorded in `.cache/visual-review/guided-final/report.json`. Production-origin faucet funding and the complete online user journey require a separate post-deployment run; local node success does not establish them.

The final read-only pass covered **60 states**: all six completed scenarios at 320, 390, 768, 1024 and 1440 pixels in both themes. It restored the actual encrypted QA session, rechecked accepted-chain history, and made no faucet request or transaction. No exception, download or horizontal overflow occurred. Visual review found that older token observation flags had not been rechecked after restoring a session whose latest transaction was a receipt. Asset history refresh now rechecks those saved records; the completed-token guide survived restoration in the repeated 60-state pass. Narrow token, phone escrow and tablet receipt views were visually inspected. Source is frozen for deployment and the separate online journey.
