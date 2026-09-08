# Experiments and contract lab — September 8, 2026

The release adds two unlisted pages and updates Sprout Harbor V6. The public education pages keep their existing design.

- `/experiments`: five editable, local design models for inherited budgets, atomic offer completion, competing execution, verifiable corrections, and permission attacks. These models do not sign, submit, run the Kaspa VM, or prove uniqueness to Kaspa. Delegation currently models one parent and one child; the offer solver searches active subsets and validates settlement independently.
- `/testnet-workspace`: a browser-key contract lab for existing Testnet-10 allowance, composed bundle purchase, group pledge, schedule verifier, and delayed vault covenants. All three keys belong to the same browser. This does not implement the five proposed mechanisms as new deployed contracts.
- `/covenants/v6`: retained Sprout Harbor identity, simpler explanation, disclosed technical detail, bounded DAG acceptance markers and a delivery pause long enough for the real world animation. Accepted results are not replayed on reload. The GLB is fetched explicitly before parsing, avoiding canceled-transfer reports from the previous loading wrapper in Chromium.

## Verification

- `npm run check`: 57 passing checks. V6, public V4 and public release tests: 52 passing checks. The five design model suites and V6 presentation tests also pass.
- Five editable model journeys: Chromium, Firefox and WebKit, including changed terms, invalid proposals, keyboard selection and phone layout. No chain requests.
- Contract lab synthetic-node journeys: 21 unfunded transactions per browser engine, using the real SDK signing and recovery code. Checks cover stale inputs, invalid caps and schedules, immature withdrawal, uncertain submission locks, identical retry without a new signature, and the distinction between observed outputs and acceptance.
- Real-node contract lab: 19 transactions cover all five primitive journeys and close every deposit, followed by two transactions for reload verification. Public IDs and accepting blocks are in [the evidence record](release-evidence/contract-lab-2026-09-08.json). The original reload harness incorrectly reseeded an old snapshot; it now seeds only absent storage and keeps timestamped private recovery snapshots. Two new accepted records then survived actual reload without submission. The first 19 public receipts remain recorded; the current QA recovery session contains the latter two.
- Actual Three.js V6 fixture: Chromium 53 checks, Firefox 52, WebKit 52; no findings. Includes observed acceptance before motion, DAG arrival before delivery, disabled continuation during delivery, persistent final state, no replay, phone/tablet/landscape, enlarged text, reduced motion and failure recovery. API data in this fixture is synthetic.
- Existing public application regression: 56 Chromium states using the real RPC, without funding or submitting.
- New pages: 36 appearance cases across three engines, light/dark themes and 320/768/1440px widths. Dark-theme contrast was subsequently corrected and inspected again. These are browser/viewport tests, not physical-device certification.

The contract lab shares the existing wallet and encrypted journal host through a gated controller. It has a separate browser storage namespace. Every new transaction requires a review, a fresh fee and exact-input check, and saving signed bytes before submission. Checking status never signs or resubmits. An unresolved transaction prevents new spending; its exact bytes can only be retried explicitly. Accepted balances require an observed accepting block.

## Review and hosted recovery

The coordinator reviewed the changed source and the rendered artifacts above and accepts this release within the stated scope. The separate external review is incomplete: its earlier model findings were addressed, but it did not independently approve the final V6 and contract-lab delta.

The earlier canonical V5 full journey recorded 29 accepted transactions and completed its journey/reload/mobile assertions, but the harness reported one canceled status request. That original report remains a failed report. A subsequent read-only recovery check loaded the saved completed journey twice with no failed requests and no action or payment requests; only existing-wallet authentication and status requests occurred. This follow-up does not establish the cause of the historical cancellation.

## Hosting

Cloudflare is the public host. The three former GitHub Pages workflows retain verification and downloadable build artifacts but no longer have Pages deployment steps or permissions. The reviewed V6 container image remains pinned by digest; this release changes static client assets rather than replacing the signer runtime.

The September 8 Cloudflare publication was checked against all 227 generated public files with matching SHA-256 content. The saved canonical V6 tour still showed all six chapters complete and its accepted receipt, without an API request. GitHub Pages was retired through the repository API (204; subsequent configuration lookup 404). Final presentation corrections label intentionally stopped live updates as paused and provide 44px chapter, dock, and disclosure targets.
