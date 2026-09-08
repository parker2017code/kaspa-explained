# V5 local acceptance

Verified on 7 September 2026. The local advanced guide at `http://127.0.0.1:8914/covenants-v5` completed both examples using real Testnet-10 transactions. This is local acceptance, not a public deployment record.

The [live verification record](v5-live-verification.json) contains seven accepted transactions, accepting blocks, recovered public transaction bytes, recomputed fees, source hashes and observed final UTXOs. An independent read-only RPC check confirmed their accepted-chain inclusion. The recorded advanced browser run completed 16 guided steps with no errors or failed requests and displayed each accepted result before continuing. Total network fees were **0.088171 tKAS**. Acceptance is not a promise of permanent finality.

## The two advanced scenes

| Scene | Contract effect | Accepted evidence |
|---|---|---|
| Fixed three-party ring | Grower gives 3 crops and receives 2 ore; toolmaker gives 1 tool and receives 3 crops; miner gives 2 ore and receives 1 tool. All three signatures and exact successor states are checked in one transaction. Each 0.3 tKAS contract deposit remains unchanged. | [Ring settlement](https://tn10.kaspa.stream/transactions/1207a4999c52093627445b634613b8885e42d90e2b367f6cb4d02fe583931e8c) |
| Bonded courier | A 0.2 tKAS payment and 0.1 tKAS courier bond are locked together. A signed recipient receipt releases 0.3 tKAS to the courier. A second agreement demonstrates an aged refund: the customer receives the payment and forfeited bond, totaling 0.3 tKAS. | [Receipt release](https://tn10.kaspa.stream/transactions/218a8117d3b2ad8e4350f5d73fe69690b002a4a1ccb218cc7f7abd0794178b9e), [matured refund](https://tn10.kaspa.stream/transactions/9cc40bdc429b8aead3047e3c81ddd9e0d07f4a15e1f2fbf83b8e291ea78aedd6) |

The resources are game-issued digital inventory. The local host controls all demonstration owner keys and the recipient key; the roles do not represent independent human counterparties. The recipient receipt is a trusted game attestation, not independent proof of physical delivery. Its signature binds the world, covenant, delivery ID, participants, amounts and refund age.

The refund threshold is **100 DAA units**, not a fixed wall-clock deadline. Reaching it permits a submitted refund; it neither executes automatically nor disables an otherwise valid receipt release. The first accepted spend consumes the agreement.

## Reproducible checks

- `node scripts/build-v5-advanced.mjs --check` reproduced the canonical [advanced artifact bundle](../src/v5-advanced-templates.json) and generated Ring/Delivery SilverScript exactly, matching both pinned artifact IDs. It leaves the separate Business build alone.
- [Ring verification](v5-ring-verification.md): 23 exact SDK/native-VM fixtures and four protocol tests passed.
- `node scripts/v5-delivery-fixtures.mjs --check-vm`: 20 exact SDK/native-VM fixtures passed. The consensus UTXO-context test rejected actual age 99 and accepted ages 100/101; receipt release remained valid before and after refund eligibility. No deliberately invalid early refund was broadcast live.
- `node --test tests/v5-delivery-protocol.test.mjs`: five tests passed using the canonical bundle, covering funding, payout/replay binding, reconstruction and invalid contributions.
- The site build exported both Argent sources and generated SilverScript for the contract viewer.

The live record predates the later change that retains future accepted advanced journals. Historical public transactions were recovered from the node; the record identifies that evidence boundary rather than claiming the new retention path was live-tested.

## Browser and host integration

The [browser verification record](v5-browser-verification.json) distinguishes synthetic scene checks from the restored live QA wallet. Desktop and 390px mobile emulation verified free play, all six contract sources, no horizontal overflow, and no extra actions after reload. Receipt-history tests prevent replaying old flights while preserving new pending and accepted flights. Mobile defaults to a compact DAG bar; explicit expansion remains available.

Nine faucet integration tests passed, including shared advanced-lock isolation and the correct claimant payout after acceptance. Eight advanced lifecycle tests passed, including atomic retention of accepted signed journals. The worker dry-run bundle passed; it was not deployed.

## Remaining public release gate

Public deployment, CI and public-route verification are **not** established by this local run. Before calling the public release complete, validate the release revision in CI, deploy it, and verify the public guide, contract source, accepted transaction links and result animations against the deployed assets. The other eight designs in the [feasibility review](v5-advanced-feasibility.md) remain proposals.
