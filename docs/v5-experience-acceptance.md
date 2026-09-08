# V5 experience acceptance

This change separates the guide's presentation from the wallet's actual state.
It does not change contract rules, transaction construction, or authorization.

The experience must show a concrete problem, the chosen action, a visible
transaction journey when applicable, the consequence, and an explicit result
acknowledgement. Server acceptance may be fast; it must not erase those beats.

## Required checks

- A fast accepted purchase stays in the Exchange until its network journey and
  goods movement finish and the player presses Continue on the result.
- A submitted transaction without an accepting block cannot release a result.
- Local farming actions have a visible consequence and no fabricated chain event.
- A signature review shows the wallet transfer, network fee, and total separately.
- Different transaction IDs queue; repeated observations update the existing trip.
- A result acknowledgement cannot create another purchase or agreement.
- Restoring an unfinished presentation uses current receipt evidence; an already
  accepted result does not replay a historical flight or send another transaction.
- Background transactions cannot interrupt the result currently being viewed.
- Mobile keeps the town visible while the task panel scrolls internally.
- Diagrams have readable actor names, identifiable goods and amounts, and clear
  directions. Detailed contract explanations are optional.
- Reduced motion retains the same factual states and explicit result pause.

## Evidence scope

The presentation tests use isolated, scripted service snapshots with the actual
town renderer. They do not submit real transactions. Existing chain evidence is
in `v5-live-verification.json`; a visual change does not establish a new network
execution or a public release.

## Local verification

- The initial complete V5 suite passed all 113 tests. The subsequent focused run
  passed 17 presentation/scenario tests, including a new long-identity diagram
  regression. These tests also cover preparatory
  transactions, exact quantities, and the named recipients of advanced transfers.
- The integrated presentation browser check passed at 1440px and 390px, plus
  reduced motion at 390px. It verified acceptance gating, a visible canvas after
  Continue, held rooms, explicit acknowledgement without resending, restoration
  without replay, and a local planting action without a transaction.
- The transaction-journey browser check passed desktop/mobile with and without
  motion. It covers queued IDs, duplicate updates and acceptance-block evidence.
- The loopback preview loaded at both widths without asset errors, browser
  errors, or page overflow. No wallet was created by this preview check.

Screenshots and the machine-readable presentation report are under the ignored
`.cache/v5-experience-review/` directory. These are browser-emulation checks;
physical-phone performance has not been measured.

The menu-action and quote-cancellation integration check passed: cancelling an
unsigned funding quote clears the presentation after the service confirms it,
does not replay preparatory genesis, and restores Continue. A free-play panel
action closes its setup dialog and requires a result acknowledgement.

## Direct browser walkthrough, 7 September 2026

The primary reviewer used a separate `localhost:8914` browser wallet and the
real local service. The user's `127.0.0.1:8914` wallet was not changed.

- Created a wallet with 10 free Testnet coins; bought the first growing plot.
- Planted, watered and harvested; enabled farming help from Pip. These local
  actions did not fabricate chain transactions.
- Delivered the first town order and received 0.25 tKAS; bought the water upgrade.
- Reloaded accepted results without another spend or historical flight.
- Cancelled funding quotes through both the funding dialog and inline review.
  Signed a fresh 0.25 tKAS funding quote after seeing the 0.018536 tKAS fee and
  0.268536 tKAS total. The wallet decreased from 9.644704 to 9.376168 tKAS.
- Bought three crops for 0.03 tKAS from Mira, then bartered one tool for one bread.
  Both results named the actual recipients and remained until acknowledged.
- A changing offer exposed a completed request without a transaction. Fixed the
  endless waiting state; recovery returned to a current offer, which settled.
- Fixed long player IDs collapsing wallet and business into one diagram actor.
  Reloaded the real funding result and verified the wallet-to-business arrow.
- Inspected wallet receipts, recovery export/import dialogs and cancellation,
  exchange, negotiations, greenhouse, orders, supply transfer and Pip's budget.
  Hid, restored, repositioned and reset the task panel.
- Inspected the guide, exchange and wallet at 390×844. No horizontal overflow;
  the world remains visible and the dialog/panel contents scroll. Restored the
  default viewport afterwards.

Accepted transactions observed directly in that browser:

| Action | Transaction ID |
| --- | --- |
| First plot | `b301ba1ea563d5848f37f579cc7f7617f7654019f0726995263e0b6480cd0765` |
| First order delivery | `058e437fac3e34e7bf73b96d9d7eed758db7ee57c05128c9b7d6bd7a1dca6423` |
| Water upgrade | `5dc4855cb4de1ed37c3aa53a439a0e3a70b68084ea8a72cb088545463f701bdb` |
| Business genesis | `c640fb8e6ce5ac1df889174c51da256b67123cb92d2ddc227e6948f8e19c5024` |
| Business funding | `326dc9bb928d574b601ed2b4b95446f4ab871d329791c755c266fcaee1f6f8a0` |
| Crop purchase | `7f89fd83f852a8d96f4340145f08a90d3a872e5f051d31dc272dd363053eee19` |
| Barter | `332fa66fc395ad56eb3e1b2f578fd4e7d880ac24116c0e21f3f846fa8727781e` |

### Remaining live gate

Habitat care is reserved as `trade-4646` but transaction construction reports
`V5 fee or mass limit`. A read-only reconstruction and synced Testnet RPC
confirmed one treasury output of 4,893,400 sompi (0.048934 tKAS). Its required
fee of 3,159,900 sompi fits, but the remaining 1,733,500-sompi change produces
storage mass 539,473, above the 500,000 limit. Increasing the treasury funding
to 5,030,000 sompi makes this exact trade valid (storage mass 497,401); the
remaining walkthrough requires additional fees and deposits too. No care
transaction was signed or accepted; the crops remain reserved.
The primary reviewer's fresh-wallet care/construction/ring/delivery/refund
walkthrough remains unfinished. Existing automated and earlier transaction
evidence does not substitute for this unfinished direct browser gate.

The initial request for additional faucet coins was rejected before execution.
On 8 September the user explicitly authorized transferring existing reserve
funds and specified a 1,000 tKAS top-up. Both transfers below were accepted and
their exact treasury outputs were observed; the treasury reached 1,000.048934
tKAS. Total transfer fees were 0.005296 tKAS. No application spending limits were
changed, and no public deployment, commit or push was performed.

| Reserve transfer | Transaction ID | Accepting block |
| --- | --- | --- |
| Initial 20 tKAS | `6ded154f41e69bdb32f18f264bdfa95ff41af150a8b12112e4ffccc6de8f4516` | `38760d145497e88c0223d3655151a9e66533636d363cc7d6558107ac2f712cf6` |
| Remaining 980 tKAS | `aaba1b7a9a5ffbe24d4af26f5a40eb64115dd970abfad768a49516e460a6998b` | `dd53f3e9c8326900118d7dd099de24dfb084d0de2a89360cd04d1fe7abf7adb1` |

## Continued direct walkthrough, 8 September 2026

The same separate localhost wallet continued against the real Testnet-10 service.
The local reserve received the user-requested 1,000 tKAS (see funding receipts
above). The wallet remained at 9.376168 tKAS through these business and demo
transactions; treasury-paid fees and business-held purchase coins are separate.

Verified directly in the browser:

- Supplied Sprout with three crops through an accepted material transfer.
- Recovered the missing workshop tool through a current, funded barter; built
  the workshop with two wood, one ore and one tool.
- Bought three wood for 0.045 tKAS, brought two produced parts into the business
  as tools, and delivered those materials to open a second growing plot.
- Authorized Pip for at most two crops and no coin spending; an accepted
  delegated barter is present in the service's verified receipt history.
- Revoked Pip's permission. A second previously prepared trade exposed an
  unsigned-reservation cleanup defect; the wallet refused to sign it without
  fresh consent. Cancelling that unsigned quote recovered the guide.
- Opened the three circular-trade stores and settled 3 crops, 1 tool and 2 ore
  together. The phone-width result and all three actor labels were inspected.
  Reload preserved the accepted result without replaying a historical flight.
- Free play: paused and resumed Pip's farm work, reopened the panel to confirm
  persistence, moved farm stock into the business, and returned to the guide.
  These local actions produced explicit results without fabricated transactions.
- At 390 by 844, the page had no horizontal overflow, the town stayed visible,
  and Continue remained reachable. The menu closed when returning to the guide.

The complete V5 suite passed 124 tests after the supply and workshop-room fixes.
Later funding-amount and revocation fixes require their own final checks below.
The bonded-delivery and refund walkthrough is still in progress at this point.


## Final local acceptance, 8 September 2026

The direct browser walkthrough completed the guide and returned to free play.
The delivery agreement locked 0.2 tKAS plus a 0.1 tKAS bond; the accepted receipt
release paid both to the courier. A second agreement reached its node-checked
refund age and paid the same two amounts to the customer. The completion page
survived reload and remained reachable at phone width.

The restored preparatory funding result was checked again after the service
fix: it showed exactly 0.5 tKAS to the customer and 0.2 tKAS to the courier.
These amounts come from its matching accepted transaction, separately from the
0.2/0.1 tKAS escrow amounts. Ring-store deposit metadata is covered by the same
operation-specific receipt tests; the earlier direct ring exchange passed.

The accepted-revocation cleanup has regression coverage for the actual revoke
path, per-player permission, and preservation of a saved submitted payment.
A fresh browser budget/trade/revoke cycle completed afterward. The final saved
state has no pending payment, no prepared player trade, and Pip trading disabled.
Legacy unmarked reservations are retained for explicit recovery rather than
being guessed to be automatic; the originally encountered unsigned quote was
cancelled through the UI.

Free-play checks also confirmed that a full parts store disables crafting with
an actionable explanation; moving two parts to market changed storage from eight
to six, and manual crafting increased it to seven. The built workshop was
visually present. Keyboard room navigation and the actual 3D exchange terminal
worked. Nearby-terminal hints clear after leaving their range. The exchange
lists supported business counterparties rather than offering trades with the
builder, habitat keeper, or unsupported player counterparties.

Final checks: **129 V5 tests passed**, **57 general site tests passed** (the two
loopback-server tests needed listener permission), and **11 focused navigation
and town-model tests passed**. Final syntax and diff-whitespace checks passed.
Desktop and 390-by-844 browser views were inspected; this does not establish
performance on a physical phone.

Accepted IDs, blocks, and the final state summary are recorded in
[v5-experience-browser-2026-09-08.json](v5-experience-browser-2026-09-08.json).
All work remains local and uncommitted. No push or deployment was performed.
