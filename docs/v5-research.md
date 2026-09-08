# V5 implementation research

Review in progress. This records evidence and design questions; it does not claim the V5 economy is implemented or deployed.

## Purpose

Build a playable economy in which the player and autonomous businesses produce, negotiate, barter, buy, sell, and delegate work. Agents must consume actual inventories and budgets and respond to changed circumstances. Cryptographic rules belong at ownership, payment, exchange, and delegated-authority boundaries. Ordinary production simulation and animation remain ordinary software.

## Sources examined

- Argent: `d08e52dd1e18c9f7e9a2dc482048c2db31d25611`.
- SilverScript source used by Argent: `c7d17a15ac88610d013ec9ffffa9520aeb69929b`.
- Their Rust Kaspa dependency: `a41a333b08848f41bf737b72592e463a6011b8ac`.
- Existing browser integration uses the checksum-pinned Kaspa SDK 2.0.1 archive. API compatibility is being checked separately.

The Argent frontend, runtime/artifact crates, documentation, examples, fixtures, and tooling have been reviewed. The final compiler code-generation test review remains in progress. Detailed file hashes and coverage are retained in local review records.

Validation completed: 471 Argent workspace tests passed; all ten example applications rebuilt; every generated file matched its checked-in counterpart byte for byte; all eleven example artifacts, including the nested dependency artifact, passed the compiler's artifact inspection.

SilverScript review includes the full language tutorial and covenant-declaration specification, current KCC20 and controller examples, and the accompanying architectural documentation. Some book snippets use an older signature-array ABI. The current source uses local owner authorization in both the leader and delegate paths; implementation must follow current source and compiled artifacts.

## Useful mechanisms

### Independent businesses executing one exchange

Argent `observes` binds another covenant's inputs and outputs. A participant reads the authenticated incoming state and uses `require ... outputs become` to require the agreed successor. Each participating covenant executes its own policy in the same transaction. This supports an exchange that either updates every participant or fails as a whole.

Use separate business UTXOs so unrelated transactions do not all spend one global market output. A transaction coordinator finds agreements and assembles transactions; each contract checks its obligations.

### Compatible applications with different strategies

Open interaction uses `actor_type<State>` handles to authenticate a compatible external actor's template and state layout. The controller can enforce the shared transition while the external actor enforces its own private implementation rules. Expanded state stores a commitment with a checked preimage when used; that is not automatic confidentiality.

The open-cell example separates shared physics from an independently compiled forager strategy. For V5, the corresponding separation is shared trade terms versus a business's purchasing and production strategy. Moving every character on chain is unnecessary to use this mechanism.

### Delegated authority

Covenant-ID ownership requires the controlling covenant to be spent. The controlling covenant must constrain the actual transaction: recipient, quantity, price, continuation, and budget. Mere co-spending is not a complete purchasing policy. Owner signatures must authenticate the stored owner, rather than an arbitrary public key supplied with a valid signature.

### Separate agreements and asset rules

SilverScript's asset/controller example distinguishes asset conservation from issuance policy. The same composition pattern can separate a business inventory from a purchasing mandate or funded order. Bounded fan-in and fan-out can combine and split states; V5 must select practical bounds based on compiled mass and real node acceptance.

## Questions to resolve in the implementation

- Which inventories need independent cryptographic ownership, and which production counters are ordinary game state?
- How are production entitlements issued without implying that a contract observes physical production?
- How do offers reserve stock, expire, cancel, and settle without double selling?
- How does a three-party barter ensure each participant receives its stated consideration?
- How does a player's assistant demonstrate its spending authority, and how can the player revoke it?
- How do autonomous businesses change quotes and production when inventories, counterparties, or outstanding orders change?
- How does the service recover a submitted transaction before allowing another action against the same inputs?

## Acceptance evidence required

A full player journey must include an actual negotiated trade, a barter, a changed agent decision caused by changed inventory, delegated work under a limit, an accepted chain receipt, and recovery after interruption. Multi-party transactions need rejection cases for missing consideration, wrong ownership, changed destination, overspending, and duplicated inputs. The rendered world must show these effects on desktop and mobile before deployment is complete.
