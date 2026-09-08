# Fixed three-party ring verification

The fixed Ring actor and its SDK transaction builder passed local native-VM checks on 7 September 2026. These checks used synthetic, unfunded UTXOs. They establish contract behavior, not Testnet acceptance. Live transaction evidence and the public deployment gate are tracked separately in [V5 local acceptance](v5-local-acceptance.md).

The subsequent local guided run also reached accepted Testnet-10 settlement: [the live verification record](v5-live-verification.json) independently rechecked the ring transaction, all three successor scripts, inventories and unchanged 0.3 tKAS deposits. That run used treasury-funded demo roles controlled by the local host. It does not establish public deployment.

The contract uses Argent `d08e52dd1e18c9f7e9a2dc482048c2db31d25611`, producing artifact `b0a99e69b69a03e8e263a29bc601af8e0a272a34de67faf344877ad0df8b126a` and a 2,025-byte Ring script. Each swap input names two distinct other Ring identities, verifies their world and issuer, validates all three issuer certificates, requires its own owner signature, and constrains all three next states. The three input scripts independently enforce their native deposits remaining unchanged.

| Role | Gives | Receives |
|---|---|---|
| Farmer (0) | 3 crops | 2 ore |
| Smith (1) | 1 tool | 3 crops |
| Miner (2) | 2 ore | 1 tool |

Each resource total is conserved and all three sequence numbers advance by one in the same transaction. The example represents digital inventory. The issuer certifies each covenant identity and its owner; it does not independently attest physical production or delivery. The local fixture uses three distinct owner keys. The implemented demo service controls all three role keys and discloses that arrangement. Distinct signatures do not imply three independent people.

`node scripts/v5-ring-fixtures.mjs --check-vm` passed 23 exact-SDK transaction fixtures. Four valid cases cover a three-identity genesis transaction, the first cycle, a second cycle and the maximum seven native fee inputs. Nineteen invalid cases cover every required owner/fee signature, each issuer certificate, missing/self/duplicate peer identities, overcredit of each received resource, changed sequence/role/owner/issuer/world, and a native-value drain. The test recompiles generated SilverScript, compares the SDK unlock with the native ABI, checks mass calculations and executes the actual covenant VM.

The normal cycle has estimated compute mass 40,839, transient mass 31,076 and storage mass 115,347. At the builder's fee rate of 100, the fee is 4,084,900 sompi (0.040849 tKAS). The fixture is within the SDK's block limits. Each covenant input consumed about 436,759 script units with a declared compute budget of 100. Values vary with the transaction and do not promise live-network admission or a future fee.

`node --test tests/v5-ring-protocol.test.mjs` passed four focused tests covering per-resource conservation, exhausted/overflowed inventories and sequence limits, distinct genesis identities and deposits, malformed peers and duplicate covenant identities. The fixture exporter additionally checks full wire reconstruction, issuer/world binding, dummy-signature rejection, changed output-state rejection, and partial signing/resume without replacing existing signatures.

The canonical artifact is `src/v5-advanced-templates.json`; `node scripts/build-v5-advanced.mjs --check` recompiles Ring and Delivery and checks that bundle and their generated SilverScript against the pinned artifact IDs. It does not rebuild Business.

Entry points are `buildV5RingGenesis`, `buildV5RingSwap`, `deriveV5RingPlan`, `signV5RingPlan`, `v5RingWirePlan` and `v5RingJournal` in `src/v5-ring-protocol.mjs`. Genesis states must be ordered roles 0, 1, 2; swap cells preserve that order. The builder allows one to seven native P2PK fee inputs from one fee payer and reconstructs the reviewed transaction before signing or resuming. The application must still wait for an accepting block before displaying settlement.
