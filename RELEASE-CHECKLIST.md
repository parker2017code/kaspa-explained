# Release checklist

V1 is published at https://kaspaexplained.com. V2 remains a release candidate
until its source publication, deployment and live-domain checks are recorded.

## V1: standalone education

- [x] One page registry drives build, search, and sitemap.
- [x] Fresh offline tests replace the obsolete root-site CI entry point.
- [x] Timing model passes the exact 300/301 ms boundary in the browser.
- [x] Money models conserve reserves, debt inputs, and conditional collateral.
- [x] Complete the combined responsive/reduced-motion matrix after interview-driven edits and coordination integration: 150 states, zero findings; manual page-type review and keyboard/browser journeys are documented.
- [x] Verify current V1 claims and source links against dated evidence; see the review notes below.
- [x] Replace legacy implementation dependencies and obsolete guidance; the V1 quickstart uses its independent static build.
- [x] Validate generated page/asset destinations, all 78 compatibility targets, and supported historical-fragment behavior.
- [x] Separate public V1 from local-service-dependent V2 interfaces; fresh-artifact and route tests pass.
- [x] Complete the visual reference comparison and apply the findings across V1; see `design/BROWSER-REVIEW.md`.
- [x] Configure and verify the generated-output deployment.
- [x] Publish the cleaned V1 source; post-publication evidence is in `docs/release-v1.md`.

### V1 evidence and remaining publication steps

The September 6 V1 artifact checks pass for 15 pages, 78 compatibility routes,
required assets, historical-fragment mapping, and exclusion of local-wallet
interfaces. Educational model tests pass. The browser-review document records
manual page-type inspection and keyboard/journey coverage with its limits.

`CLAIMS.yml` records the dated primary-source claim review. The 14:23 UTC
external-link audit returned HTTP success for 39 of 41 URLs; the coordinating
reviewer directly checked the two Kaspa Explorer URLs that returned automated
HTTP 403. This is browser evidence, not a claim that the automated audit passed.

V1 Pages run `34041857828` succeeded for revision `6ef9f73`. Independent
live checks covered home at mobile/desktop widths in both appearances,
keyboard coordination, navigation, search, a legacy fragment and both PDFs.
See `docs/release-v1.md` and `design/live-v1/` for the bounded live review.

## V2: testnet applications

- [x] Native test payment accepted; matching amount verified.
- [x] Refundable transfer recipient claim accepted.
- [x] Sender refund accepted after node-derived eligibility.
- [x] Refund integration checks exact fee conservation and duplicate-spend refusal.
- [x] Signature encoding regression test.
- [x] Receipt pagination and reorganization regression tests.
- [x] Local API rejects unauthorized origins, hosts, and malformed requests.
- [x] Payment-split source compiles with the pinned compiler.
- [x] Payment split executes and verifies both recipients on Testnet-10.
- [x] Exact repository contracts pass pinned VM execution tests with explicit script-unit limits: signature roles, refund timing, split destinations, rounding, counts, fees, and invalid allocations.
- [x] Public escrow, treasury, prediction and fixed-proof browser transactions accepted on Testnet-10.
- [x] Public capped-token genesis, mint, move, split, merge, atomic exchange and burn accepted; exact IDs and accepting blocks are recorded.
- [x] Fully backed receipt creation, split, merge, move, partial redemption and full redemption accepted.
- [x] Proof verification executes with an explicit 0.2 tKAS fee cap and an honest fixed-fixture/privacy boundary.
- [x] Durable encrypted recovery, exact signed retries, concurrency/uncertainty guards and reorganization tests.
- [x] Reproducible dependency setup with checksums, pinned VM execution and upstream licenses.
- [x] Public static architecture: sixteen canonical pages, 87 compatibility routes, six templates; no public local signer.
- [x] Current `check:public`: 19 tests plus public signing checks pass.
- [x] Unfunded browser SDK/recovery gate: 48 states each in Chromium, Firefox and WebKit, using real RPC. Missing-file/wrong-password rejection, all three account identities, both themes and four widths pass.
- [ ] Record acceptance of the additional two-recipient native payment introduced after the original 23-transaction sequence.
- [ ] Finish the final funded-holdings visual review after the latest interface changes.
- [ ] Run final combined release checks on the final source revision.
- [ ] Publish V2 source, transaction evidence, limitations and release notes.
- [ ] Deploy V2 and verify the custom domain, static SDK/WASM/templates and public routes.

The original public-browser sequence contains 23 accepted transactions, with
0.312202 tKAS in fees. See `design/PUBLIC-APPS-REVIEW.md` for every action,
transaction ID, accepting block and reconciliation of the 1.2 tKAS allocation.
That evidence does not imply live coverage of every alternative signature pair,
oracle result or refund branch; the unfunded VM suites provide separate route
and rejection coverage. The older workshop transactions below are historical
evidence and are distinct from the public application sequence.

All applications are experimental, unaudited, Testnet-10 only, and never
intended for mainnet. Simulations are not counted as native implementations.

## Verified transaction evidence, September 6, 2026

Native payment: `31b07bf4002629ddb529b4f325fb32d78f913f4a3ad7e17659cc34fa59a08194`.

Recipient claim: `853dbf7b5cd820a1ad2450e40d965824001d4cfb4ab960de52f4238f8da7965c`.
Accepting block: `186493599e802f29d9020fc7870f4a7971859d75413a94530f008dc7371989eb`.

Sender refund: `a3b19f62b520839334d1ec60524d5581dca2921ef37dc920b379750ff443a27c`.
Accepting block: `7f20d1c60693c789d3f66d8a4687b26ffdbac6f25440bebff7f06ce4350a0b6e`.

These record a node observation at test time, not permanent finality or an audit.

Payment split: `77d1c8d1f2bae3a814dbcd71cef2d59a9523f57ab2fa065ebbc20a9edf080def`.
Accepting block: `e61de336628b472737ba40f4e3616b182ec8cf984949525eaa3d3258318d22ad`.
Outputs: 33,252,674 and 66,515,326 sompi; fee: 232,000 sompi.
The outputs plus fee equal 100,000,000 sompi. The additional VM tests execute
these exact source files, not the live transactions. They do not replace node
eligibility, mempool, reorganization, or public-service security testing.

Browser QA wallet funding: `5d3722fa9476455719e08cc75c7e818a4aebe5971f3ace93a2cd3deb8249c878`.
Accepting block: `878c4e58aa0e95e0a74167bc7073508b0b2e2ec9e567251bad7c1896dd66d391`.
At 2026-09-06 14:31 UTC, the node showed exactly 30,000,000 sompi at the
browser QA address. Fee: 264,800 sompi. Cumulative local-wallet test allocation
is now 641,310,100 sompi (6.413101 tKAS) against the 10 tKAS cap. Browser tests
spend from this allocated amount; this funding observation is not evidence
that an application contract has executed.


Additional split review status: a 0.01 + 0.01 tKAS proposal failed the real
storage-mass limit before signing (2,045,832 versus 500,000). No 24th transaction
was submitted. The UI reports the mass-limit reason; a feasible two-recipient
case and the final 80-state funded/read-only visual review remain pending.
