# Browser-wallet V6 release candidate, 8 September 2026

Sprout Harbor now uses explicit browser-wallet transaction approvals, with six independently selectable lessons and persistent receipts. The public homepage begins with an immediately usable payment model. Its generated directory exposes all 17 public pages. The learning pages define their prerequisites, Search accepts ordinary question words, and the money model keeps its heading aligned with the selected topic. White/charcoal surfaces replace the page-wide green wash.

Coordinator review covered the changed source and rendered first views of every public page at desktop and phone widths. Important interactions received separate changed-state checks. The browser-wallet guide completed 22 actual Testnet-10 transactions locally; its hosted helper was still pending release at the time of this record. See `v6-browser-wallet-verification.json` for the public receipts and `v6-browser-wallet.md` for architecture and recovery behavior.

The synthetic browser suite completed 22 transactions in each of Chromium, Firefox and WebKit using the actual wallet/SDK and native VM. It checked reload without resubmission, pending navigation, edited proof settings, and narrow/dark layouts. Further coordinator checks verified the accepting-block pin after it leaves the displayed history, automatic dismissal of routine notices, and connecting/pausing/resuming real public blocks without creating a wallet or making any POST request. These are browser/viewport checks, not physical-device testing.

The release-tree checks passed 58 source tests, V1 compatibility checks, copy checks, three-engine journeys, and 370 render states with no automated findings. Those image checks supplement the named human visual review; they do not establish exhaustive visual or accessibility coverage.

## Proof-service image

- Source commit: `e20b75536730658f3a2f3eb4624b5ac39ad42ca2`.
- Successful GitHub build: https://github.com/parker2017code/kaspa-explained/actions/runs/34260975467.
- Verified Linux/amd64 runtime member: `sha256:037f4afca31c0c76baf6500b211838fb60ee404a9a355f5b648af3ad238923fb`.
- Copied and digest-checked Cloudflare image: `registry.cloudflare.com/12418158839e0c1880a7f3fa8678bcfd/kaspa-explained-v6@sha256:037f4afca31c0c76baf6500b211838fb60ee404a9a355f5b648af3ad238923fb`.

The image provides bounded proof assistance without holding browser keys. It retains the existing service for legacy saved sessions. Normal new-guide transactions go directly to the public node. Request/start limits remain enforced. The earlier transient budget failure has not been assigned a verified root cause; the new guide removes routine dependence on that service, and diagnostic error codes distinguish budget exhaustion, identity, storage and runtime failures.

This record establishes the reviewed candidate and verified image, not production acceptance. The combined deployment must still be followed by static-file comparisons and a fresh hosted browser journey, including the real hosted proof endpoint.

## Production acceptance, 18:38 UTC

The combined deployment completed as Worker version `aee7a6e7-d2a9-4bce-82cf-fa0be9321612`, serving application commit `5b4dd9815ac2bb1ace3ab4beb393ce2082509b2f` and the image above. After propagation, all 236 generated public files matched their local SHA-256 values. The live homepage changed a payment to 3 KAS and showed 9.499 KAS change; question search returned three relevant destinations for “what is a block.”

A fresh production browser wallet requested ten coins once, completed all 22 transactions, generated its proof through the real Cloudflare helper, redeemed the reward on Testnet-10, and retained all six completions after reload. No browser errors were recorded. The host received only its assistance start/proof calls; ordinary lesson transactions used direct public RPC. Public transaction IDs, accepting blocks, fees, timestamps and balances are retained in `v6-browser-hosted-verification.json`; private tab recovery material remains outside Git. The auto-mount response was instrumented only to expose QA state, as described in that report.

The enlarged-root-text check found and corrected narrow-header overflow before publication. Chromium, Firefox and WebKit passed at 390 and 1440 pixels with 200% root text; this supplements normal viewport testing and does not claim physical-device coverage.

The first GitHub Site checks run still expected V6’s retired server-action/event routes. The release test now requires the UI’s read-only legacy status endpoint, the browser engine’s bounded start/proof calls, and its shipped wallet/proof modules. Local public checks passed 25 tests plus signing checks; V5 passed 129 tests, and the guided education checks passed all walkthroughs and 120 layout states. This test/evidence correction changes no deployed application files.
