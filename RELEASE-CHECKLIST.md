# Release checklist

The rebuilt site is local. Nothing in this checklist means it has shipped.

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
- [ ] Configure and verify the generated-output deployment.
- [ ] Publish the cleaned source and V1 release notes (`docs/release-v1.md` prepared).

### V1 evidence and remaining publication steps

The September 6 V1 artifact checks pass for 15 pages, 78 compatibility routes,
required assets, historical-fragment mapping, and exclusion of local-wallet
interfaces. Educational model tests pass. The browser-review document records
manual page-type inspection and keyboard/journey coverage with its limits.

`CLAIMS.yml` records the dated primary-source claim review. The 14:23 UTC
external-link audit returned HTTP success for 39 of 41 URLs; the coordinating
reviewer directly checked the two Kaspa Explorer URLs that returned automated
HTTP 403. This is browser evidence, not a claim that the automated audit passed.

Authenticated Pages inspection by the coordinator confirmed legacy publishing
from `main` at `/`, with custom domain `kaspaexplained.com`. Switch Pages to
Actions before pushing root-page deletions. The prepared workflow uploads
`dist-v1`; configuration, remote execution, and live route/asset/domain/PDF
verification remain publication requirements. V2 completion is not required
for the isolated V1 artifact.

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
- [ ] Escrow and additional native-use-case investigation and implementation.
- [ ] Token lifecycle and atomic exchange tests.
  - The new capped-token source compiles and passes local VM fixtures for mint,
    holder split, issuer-and-holder burn, exhausted issuance allowance, and
    selected invalid transitions. This is not funded genesis, relay acceptance,
    a public token app, or atomic exchange. Its explicit fixture script budget
    still needs reconciliation with version-1 transaction compute limits.
- [ ] Proof-verification feasibility and honest privacy boundaries.
- [ ] Durable wallet recovery, concurrency, and uncertainty test suite.
- [ ] Reproducible dependency setup with checksums and upstream licenses.
- [ ] Public-use architecture without exposing the local custodial signer.
- [ ] Browser review of every V2 action and error state.
- [ ] Publish source, transaction evidence, limitations, and V2 release notes.

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
