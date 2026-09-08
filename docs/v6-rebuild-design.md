# Sprout Harbor: a Kaspa learning experience

Design brief, 8 September 2026. Implementation is in progress locally; the complete V6 browser journey has not been accepted. The intended review route is `http://127.0.0.1:8915/covenants-v6`.

## Diagnosis

The current guide follows implementation prerequisites rather than a learning sequence. Its first eight steps buy a plot, plant, water, harvest, accept an order, deliver, upgrade water and enable Pip. Payment acceptance is real, but game-side unlocks and resource movements often do not expose a meaningful trust problem. The stronger covenant examples arrive after substantial setup.

The initial 0.5 tKAS treasury payment purchases a backend-controlled plot; it does not establish trustless land ownership. Business funding moves coins into a contract-held balance. Reviewing and signing one prepared transfer are phases of that transfer, while contract creation, funding and purchases may require separate transactions. The current presentation inadequately distinguishes these phases and purposes.

V5 network snapshots are gated by 15 elapsed seconds inside a seven-second polling cycle. Rendering speed and receipt polling are separate. Historical claims of 50 ms network updates have not been verified. The working Pip scene explicitly uses sine/cosine orbital movement. Generic box meshes and repeated flight paths substitute for recognizable resource-specific actions.

## Product contract

The player should understand what another actor could do against their interests, which rule limits that behavior, what they authorize, what Kaspa checks, and what visibly changes. Every required interaction must introduce a decision, reveal a consequential rule, or demonstrate its outcome. Chores, empty setup ceremonies and redundant acknowledgements do not qualify.

Keep the harbor, characters, appealing agricultural motion, interiors and spatial navigation. Routine planting, watering and harvesting become paced background sequences. Do not put unnecessary transactions onchain to justify chores. Contract setup remains disclosed but is organized around the action it enables; preserve separate signatures where technically required.

## Guided chapter intent and implementation boundaries

Target six chapters and roughly 12–15 minutes, to be validated through playtesting. Display chapter names, progress and an honest estimated remaining time. Free exploration follows a definite ending.

1. **Buy without trusting the seller — Exchange.** A seller proposes keeping the payment without transferring the promised digital tool. Compare this unsafe proposal with an atomic exchange. The accepted Business transition debits the coins and changes its tool ledger quantity together. A modeled tool in the player’s cart illustrates that quantity; it does not establish independent asset authenticity.
2. **Give Pip useful power — Workshop.** Authorize the Business resource policy: spend at most 2 crops and receive at least 1 resource, with native spending disabled. The proposed barter receives 1 timber. The policy aggregates positive crops, wood, ore, tools and bread received; it does not require timber or restrict the recipient. Pip tries the allowed trade and a separate disallowed request. Show the successful receipt and any actually observed failed check separately. Revocation visibly closes the spending route; an idle Pip no longer wanders without a task.
3. **Trade when nobody can go first — Exchange.** Three businesses each hold what another needs. Preview why individual transfers expose someone. The fixed ring settles all three contract transitions together, with recognizable goods leaving and arriving at the correct stores. Its existing implementation supplies a foundation.
4. **Build only if we cooperate — Greenhouse.** Neighbors prefer a shared greenhouse but fear committing alone. The V4Launch SilverScript contract requires 3 distinct ready pledges to settle together. Show a withdrawal and a successful group settlement. This is a fixed ready-participant condition, not an arbitrary fundraising threshold or a relabeling of material purchases. Explain how binding commitments change the incentives without claiming to eliminate every coordination problem.
5. **Pay a courier who might disappear — Habitat.** Display the customer's 0.2 tKAS payment and courier's 0.1 tKAS bond separately. A valid recipient signature pays both to the courier. An eligible age-based refund pays both to the customer, including the courier's forfeited bond. Animate these actual destinations. Explicitly identify the game-operated witness: Kaspa checks its signature, not physical delivery. Chain age alone does not prove nondelivery. Existing release/refund contracts supply the foundation.
6. **Verify work without trusting the worker — Observatory.** A worker supplies a solution and proof for a precisely defined task. A verified result releases the reward and operates a visible machine. The custom R1CS task constrains allocation and rate to 1–15, their sum to 13 and product to public score 42, bound to a recipient x-only key and nonce. Acceptance requires the actual circuit/prover/verifier path and an adversarial invalid-proof check. No privacy guarantee is claimed.

The Exchange uses a tool ledger quantity within the Business covenant lineage. It is not a full KCC20 asset/controller implementation or a demonstration of authentic physical tool identity. A future counterfeit comparison requires the actual identity mechanism first. Additional original ideas—recovery vaults, auctions, channels, restricted loans, cooperative revenue, vouchers and private coordination—remain an extension inventory, not mandatory first-tour chores.

## Interaction and evidence

Use one persistent causal sequence: problem → proposed rule → authorization → submission → observed acceptance → practical consequence. Introduce technology in context: Argent supplies the Business, ring and courier paths; SilverScript compiles those rules and V4Launch; Kaspa validates submitted transactions; KIP-20 identifies covenant lineage. Describe the custom proof path on its own terms rather than attributing every chapter to Argent. Label local preflight rejection, VM rejection and actual node rejection accurately.

Keep the current transaction visible in the DAG, linked to its observed accepting block and explorer receipt. Use live node notifications where supported, with explicit reconnecting/stale states and a bounded rendered history. Smooth animation does not justify fabricated blocks, and network speed does not establish finality by itself. Separate illustration from observed parent links and acceptance evidence.

No chapter completes because a timer expired or a panel opened. Contract-backed consequences follow verified acceptance and persist across reload. Show before/after inventory and balances beside the affected object. Failed actions leave the relevant state unchanged and explain the violated rule.

## Visual and responsive design

Replace resource cubes with identifiable grain, timber, ore, tools, parcels and coins. Animate grasping, carrying, handing over, stocking shelves, unlocking machinery and construction. Motion has an origin, object, destination and persistent aftermath. Separate gentle ambient life from work and settlement signals.

Desktop uses a resizable, dockable explanation pane with remembered dimensions. Narrow screens use coordinated scene and information regions with an adjustable divider, avoiding overlays that require constant repositioning. Keep the current problem, action, consequence and progress visible; secondary details scroll independently. Correct the reported clipped disclosure and test keyboard navigation, text enlargement and reduced motion.

## Production and acceptance

Keep Three.js and use Blender, already installed locally, for modeled assets and authored animations exported as glTF. Use HTML/CSS for accessible controls. A new game engine is not a prerequisite.

Apply the responsibilities of product design, learning design, user research, art direction, 3D art, animation, creative development, frontend/accessibility engineering, protocol engineering and QA. Start with one complete Exchange chapter and judge its comprehension, truthful evidence and persistent visual outcome before extending the pattern.

The decisive playtest is whether a newcomer can explain what was at risk, what the contract prevented and what they received without reading source code. Passing transaction tests alone is insufficient. Verify phone/tablet/desktop, portrait/landscape, touch/keyboard, zoom, reduced motion, offline/reconnect and saved-transaction recovery across Chromium, Firefox and WebKit where available. Record unavailable checks and distinguish emulation from physical-device testing. All five buildings need distinct purposes; unsupported capabilities stay explicitly unfinished. Preserve local wallets and treasury state, including the existing funded `.local/v5-final` directory. Do not overwrite funded state to reset a test or expose the local signer publicly. The current request authorizes local completion and showing the result in Chrome, with no publication or deployment. Record outstanding journey evidence in [local acceptance](v6-local-acceptance.md).
