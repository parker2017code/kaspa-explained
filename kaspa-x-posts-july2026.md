# Kaspa X posts, July 10-31, 2026

Rebuilt from scratch this session (the old `kaspa-toccata-50-post-series.md` in the dated Codex folder predates Toccata's mainnet activation and is stale, not used here). No fixed daily curriculum: each post stands alone, no prior post required to make sense of it. Every claim traces to a specific page on kaspaexplained.com, which itself traces to a primary source. Voice matches the site: no em dashes, lead with the counterintuitive claim, name the mechanism, a number instead of an adjective, end when the point's made.

Sourcing note: numbers tied to live/testnet state (hash rate, DAA scores, TPS estimates) were current as of July 9, 2026. Recheck anything time-sensitive before posting if it's been more than a week or two.

---

## July 10: Two clocks

Kaspa's hash rate is up roughly 700x since November 2022. Price has spent whole stretches moving the opposite direction of that chart entirely.

Neither number is lying.

A proof-of-work coin runs two markets on two different clocks. The coin market reprices on sentiment before lunch. The machine market moves on hardware: order an ASIC, wait for it to ship, find power, plug it in. That takes months, not minutes.

Price can fall while hash rate keeps climbing, because machines ordered when price was high are still arriving on trucks. The chart isn't confused. It's running behind.

$KAS

*Source: kaspa-mining-cycle.html*

---

## July 11: GHOSTDAG

Most proof-of-work chains throw away the loser. Two miners solve a block seconds apart, one chain wins, the other block's work counts for nothing.

Kaspa doesn't discard it.

GHOSTDAG classifies every honest block into a blue set, then gives every node the same procedure for ordering the whole graph, including the blocks that "lost." At 10 blocks per second, that's the difference between wasting most of the network's work and using nearly all of it.

The losing block isn't wasted. It's ordered.

$KAS

*Source: ghostdag-explained.html*

---

## July 12: DAGKnight, precisely

DAGKnight doesn't have a testnet. It doesn't have an activation date. It doesn't run any part of Kaspa mainnet today.

What actually exists: a research-stage design for parameterless, adaptive block ordering, and a prototype branch with real commits, tie-breaking logic, conflict-zone handling, majority-coverage work.

Research and a prototype are genuine progress. Mainnet still runs GHOSTDAG.

Worth watching. Not worth repeating as if it's already live.

$KAS

*Source: status.html, kaspa-claims-checker.html, dagknight branch (kaspanet/rusty-kaspa)*

---

## July 13: Fast is not final

A Kaspa transaction can land in a block in under a second. That block landing is not the same as that transaction being irreversible.

Inclusion means a miner mined it in. Confirmation means enough proof-of-work has piled on top that reversing it gets expensive. Those are two different claims, and conflating them is how "10 BPS" quietly turns into "10x finality," which nobody actually measured.

10 BPS speeds up inclusion. It doesn't replace confirmation depth.

Wait for the depth that matches what's at stake, not just the sound of the block landing.

$KAS

*Source: kaspa-confirmations-finality.html*

---

## July 14: The presale that didn't happen

Kaspa almost had a presale.

Before mainnet existed, DAGLabs raised money from Polychain and Accomplice to commercialize the DAG research that became GHOSTDAG. There were hardware plans. There was a startup structure. None of it survived to launch day.

What actually launched had no premine, no insider allocation, no pre-sale. Not because that was the plan from day one, but because every version of the plan that had one collapsed first.

The fair launch wasn't a pitch. It was what was left.

$KAS

*Source: kaspa-origin-story.html*

---

## July 15: Not an EVM turn

Toccata did not turn Kaspa into an Ethereum clone. That's the part most explainers skip.

Ethereum runs on global account state: every contract reads and writes a shared ledger the whole network has to agree on before the next transaction can even be checked. Kaspa still spends specific outputs and creates new ones. A covenant just adds a rule to that output: this next spend must keep the cap, must include the controller's signature, must wait until the timeout.

Same primitive, more expressive rule. Not a new machine.

$KAS

*Source: toccata-explained.html*

---

## July 16: Proving a negative is expensive

Without KIP-21, a based app on Kaspa would have to prove a negative for every transaction that isn't its own: "this wasn't mine either, and neither was this one."

At Kaspa's transaction volume, proving what you're not responsible for becomes more expensive than proving what you are.

Sequencing commitments give each app its own lane. A prover follows that lane's activity, not the whole DAG's. Proving cost tracks what the app actually does, not what the network does around it.

$KAS

*Source: toccata-explained.html (KIP-21)*

---

## July 17: Four questions, not one

"What's Kaspa's TPS" is not one question. It's four.

Simple payments run roughly 2.5k to 3.4k TPS at 10 blocks per second, set by block-mass limits against transfer size. Covenant transactions run heavier: script work and state constraints eat into the same budget. A ZK proof transaction can settle thousands of off-chain actions in one heavier L1 transaction. Full vProg-style throughput is its own future number entirely.

Four workloads, four bottlenecks. Pick the one that matches what you're actually building.

$KAS

*Source: kaspa-tps-explained.html*

---

## July 18: Prototype, not vaporware

vProgs are not live on Kaspa. They're also not vaporware.

The public kaspanet/vprogs repo is a real, actively developed Rust framework, core types, storage, state, scheduling, a transaction runtime, ZK components. It's an early-stage prototype with real commits landing, not a slide deck.

Prototype and shipped are different claims. Toccata is shipped. Full vProgs are the roadmap architecture that builds on top of what Toccata already activated.

$KAS

*Source: kaspa-vprogs-explained.html*

---

## July 19: Coordination without a company

A coordination market solves a specific problem: getting strangers to commit to something before anyone knows if enough other people will commit too.

Kickstarter solves this with a company in the middle deciding what counts as "enough." Kaspa's version would do it with a covenant: funds move only if the threshold is met by the deadline, refund automatically otherwise. No platform holding the money, no company deciding the rule.

Nothing here ships yet. The L1 pieces to build it are live. The market itself is still a concept, not a product.

$KAS

*Source: kaspa-coordination-markets.html*

---

## July 20: Same money, different traffic rule

Bitcoin throws away roughly every block that isn't first. Two miners solve a block within seconds of each other, one becomes canonical, the other's work is gone.

Kaspa keeps both, then orders them. Same proof-of-work security model, same fixed supply, different rule for what happens when two blocks land close together. That single change is what lets Kaspa run at 10 blocks per second instead of one every ten minutes without the network drowning in orphaned work.

Same money. Different traffic rule.

$KAS

*Source: ghostdag-explained.html, where-kaspa-fits.html*

---

## July 21: Three papers before one mainnet

GHOSTDAG didn't start as a product. It started as a proof.

Yonatan Sompolinsky's research ran through SPECTRE first: a protocol that let transactions get ordered fast by pairwise vote, but couldn't produce one total order for anything that needed it, like smart contracts. PHANTOM came next, solving the total-order problem with a harder graph-theory approximation. GHOSTDAG is the version that actually shipped: a practical algorithm for PHANTOM's ordering guarantee.

Three research papers before one mainnet. That's normally where these ideas stay.

$KAS

*Source: kaspa-origin-story.html, ghostdag-explained.html*

---

## July 22: The security budget is a supply chain

You cannot mine Kaspa on a GPU anymore. That's not a limitation, it's the current state of the security budget.

ASICs turn hashing into a manufacturing and logistics problem: order the hardware, wait for the shipment, find the power, plug it in. That lag is exactly why hash rate and price can move in opposite directions for months. It's also why attacking the network isn't a software problem. An attacker needs to out-buy the actual physical hardware supply, not just write faster code.

$KAS

*Source: solo-mining-guide.html, kaspa-mining-cycle.html*

---

## July 23: A rule needs an identity

A covenant can enforce a rule. Without covenant IDs, it can't prove which covenant it actually is.

KIP-20 gives every covenant family a stable 32-byte identity that carries through every valid continuation of that covenant. A wallet or explorer can check the ID and know it's looking at the real vault, not a lookalike script that happens to enforce a similar-looking rule.

The rule and the identity are two different problems. Toccata ships both.

$KAS

*Source: toccata-explained.html (KIP-20)*

---

## July 24: Opposite starting assumptions

XRP and Kaspa both get called "fast payment" chains. The architectures don't share a single assumption.

XRP isn't proof-of-work, and it carries a company-adjacent, banking-integration story from day one. Kaspa is fair-launched proof-of-work with no premine and no institutional on-ramp built into the pitch. Both chains answer "how do I move value fast." They answer it from opposite starting assumptions about who you have to trust to get there.

$KAS

*Source: where-kaspa-fits.html*

---

## July 25: Verification is not truth

A ZK proof on Kaspa doesn't prove reality. It proves a statement about chosen inputs.

KIP-16 lets a script verify a proof, initially Groth16 and RISC0-Succinct paths, so an app can settle many off-chain actions in one L1 transaction instead of replaying every step on-chain. But the proof only knows what it was told. Whether a price feed, a bridge balance, or a game result is true still needs its own anchor: an oracle, a light client, a reporter set, something outside the proof itself.

Verification and truth are different jobs.

$KAS

*Source: toccata-explained.html (KIP-16)*

---

## July 26: Which problem is harder to retrofit

Most smart-contract chains start as a programmable platform and back into money and security later.

Kaspa started at the other end: proof-of-work issuance and blockDAG ordering first, with programmability layered on after, through Toccata's covenant surface. Neither order is wrong. They're different bets on which problem is harder to retrofit. Security and neutral issuance are much harder to bolt onto an existing platform than a rule engine is to bolt onto a secure base layer.

$KAS

*Source: where-kaspa-fits.html*

---

## July 27: Mass, not transaction count

Kaspa's block limit isn't measured in transactions. It's measured in mass.

Serialized bytes, script size, signature-operation cost, storage effects: every transaction eats a different slice of the same budget depending on its shape. A one-input payment costs roughly 1.6k mass. A covenant transaction with extra outputs and metadata costs several times that. Counting "transactions per block" hides which shapes are actually competing for the same space.

$KAS

*Source: kaspa-tps-explained.html*

---

## July 28: Moving the tradeoff line

Real-time decentralization is the actual bet Kaspa is making, and it's narrower than it sounds.

Not instant finality. Not proof-of-stake speed. The claim is Bitcoin-style mined security and censorship resistance, running at a pace where confirmations feel close to real-time under normal network conditions. Fast and decentralized are usually a tradeoff. Kaspa's whole architecture is the attempt to move that tradeoff line instead of picking a side of it.

$KAS

*Source: status.html (RTD framing, Hashdag)*

---

## July 29: The gap between an idea and a product

Covenants are Kaspa's low-level script primitive. Silverscript is what makes them buildable without hand-writing every opcode.

It's a higher-level language that compiles down to the actual covenant scripting Toccata activated. Silverscript still labels itself experimental and recommends its bytecode artifact only on testnet-10 until a first stable release: the underlying rule surface is live, the tooling built on top of it is still catching up.

A covenant idea and a shippable covenant product are separated by exactly this gap.

$KAS

*Source: toccata-status.html, toccata-explained.html*

---

## July 30: Name what's missing

The strongest Kaspa builder examples all do the same unglamorous thing: they name what's missing.

A covenant demo that shows the accepted path and the rejected path side by side, on testnet, with the actual rule spelled out, teaches more than one that just says "vault" and moves on. "Vault" is a word. The delay, the recovery key, the spend cap, and what happens if a signer disappears are the product.

Show the edge case before the pitch.

$KAS

*Source: builder-guide.html*

---

## July 31: The test

Every claim in this run traced back to a primary source: a release, a KIP, a live REST check, a paper. Not because Kaspa doesn't have a hype story. It has a specific one.

Losing blocks that still count toward security. A testnet that's been running for over a year before anyone calls it done. A covenant system built to remove trust from a spend, not to sound impressive in a pitch deck. The actual story survives being stated plainly. That's the whole test.

$KAS

*Source: this whole run*
