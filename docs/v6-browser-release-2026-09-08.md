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
