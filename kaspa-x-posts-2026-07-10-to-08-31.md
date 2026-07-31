# Kaspa X posts, July 10 - August 31, 2026

July 10-31 below is the corrected set (the old `kaspa-toccata-50-post-series.md` in the dated Codex folder predates Toccata's mainnet activation and is stale, not used). August 1-31 is new, added in the same voice, each sourced from a specific kaspaexplained.com page. No fixed daily curriculum: each post stands alone, no prior post required to make sense of it. Voice matches the site: no em dashes, lead with the counterintuitive claim, name the mechanism, a number instead of an adjective, end when the point's made.

Sourcing note: numbers tied to live/testnet state (hash rate, DAA scores, TPS estimates) were current as of July 9-11, 2026. Recheck anything time-sensitive before posting if it's been more than a week or two. August posts drawing on pages not re-verified line by line in this pass (covenants-explained, app-ideas, builder-evidence, tradeoff-map, skeptical-case, reality-check, analyze-any-coin, the three Toccata expressiveness-upgrade essays, ai-guidance, claims-checker, sources, command-line, and the crypto-fundamentals pages) should get a fact-check pass against the live page before posting, the claims here are directionally right but weren't cross-checked sentence by sentence the way the July set was.

Two things fixed in the July set during this pass, both about repetition across the run, not any single post: the "[X] isn't Y. It's Z." closer showed up three times in 22 posts (July 10, 11, 14), kept the strongest one (July 14, where the reveal earns it) and rewrote the other two so the device doesn't read as a tic. "Not minutes" got cut from July 10 since the contrast was already made by "before lunch" one sentence earlier.

Addendum below (added 2026-07-12, after a source check against `kaspa.org/build`, the `kaspanet` GitHub org, Kas Smiths, and the public Telegram Core R&D group): no existing claim in this doc needed correcting, v2.0.1 is still the current mainnet release. Three items surfaced worth adding, each grounded in a specific real source, not a rumor. Kas Smiths and Telegram Core R&D are now standing sources in `AGENTS.md`'s verification routine going forward.

---

## July 10: Two clocks

Kaspa's hash rate is up roughly 700x since November 2022. Price has spent whole stretches moving the opposite direction of that chart entirely.

A proof-of-work coin runs two markets on two different clocks. The coin market reprices on sentiment before lunch. The machine market moves on hardware: order an ASIC, wait for it to ship, find power, plug it in. That takes months.

Price can fall while hash rate keeps climbing, because machines ordered when price was high are still arriving on trucks. The chart isn't confused, just late.

$KAS

*Source: kaspa-mining-cycle.html*

---

## July 11: GHOSTDAG

Most proof-of-work chains throw away the loser. Two miners solve a block seconds apart, one chain wins, the other block's work counts for nothing.

Kaspa doesn't discard it.

GHOSTDAG classifies every honest block into a blue set, then gives every node the same procedure for ordering the whole graph, including the blocks that "lost." At 10 blocks per second, GHOSTDAG orders it anyway instead of throwing it away.

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

A Kaspa claim is worth exactly what its source is worth. A release tag, a merged KIP, a REST call you can run yourself, a paper.

That sounds like a constraint. It's the opposite, because the real story survives it. Blocks that lose the race still count toward security. A testnet ran for over a year before anyone called the upgrade done. A covenant removes trust from a spend rather than sounding impressive in a pitch deck.

None of that needs a superlative to land. Anything that does need one is telling on itself.

$KAS

*Source: kaspanet/rusty-kaspa releases, kaspanet/kips*

---

## August 1: Three tiers, not one build path

"Build on Kaspa" isn't one instruction. It's a choice between three tiers with different tools and different maturity.

Payments, receipts, wallet UX, exchange flows, and node/API reads run on current mainnet today, no covenant required. Vaults, escrow, spend caps, and asset rules need the Toccata rule surface plus a wallet and explorer that support it. Based-ZK apps and richer shared state are waiting on vProgs and a first cohort of users.

Most builders only need the first tier. Check which tier a pitch is actually describing before judging it.

$KAS

*Source: application-layer.html*

---

## August 2: What counts as a receipt

A demo screenshot is not evidence. A live transaction someone else can look up is.

The bar for a real Kaspa builder claim: a mainnet or testnet transaction ID, an address a stranger can check on an explorer, and behavior that matches what the pitch said it would do. A GitHub repo with commits clears a lower bar than a shipped product, but it still clears a higher bar than a roadmap slide.

Ask for the txid before the valuation.

$KAS

*Source: builder-evidence.html*

---

## August 3: Ideas are cheap until the rule shows up

Every Kaspa app idea sounds buildable until someone asks what happens if a signer disappears.

A vault idea needs a timeout. An escrow idea needs a dispute path. An asset idea needs to name who can mint, who can burn, and under what condition. The idea is the easy 10%. The rule that survives the bad case is the other 90%.

Score the idea by its worst case, not its pitch.

$KAS

*Source: kaspa-app-ideas.html*

---

## August 4: Three words, three objects

"Ecosystem," "infrastructure," and "programmability" are the three words that let a claim about Kaspa mean nothing.

Ecosystem: which wallets, which exchanges, which indexers, named. Infrastructure: which node software, which API, which SDK, named. Programmability: which primitive, covenant or vProg, and what evidence it shipped.

Any sentence using one of these words should survive having the word deleted and a specific noun put in its place.

$KAS

*Source: glossary.html*

---

## August 5: A vault is a state machine, not a lock

Calling a covenant a "smart contract" undersells what actually has to be specified.

A Kaspa covenant tracks its own state across a sequence of transactions: a DECL output declares the rule, a continuation output carries it forward, and a challenge or timeout path decides what happens when something goes wrong. The interesting design work isn't the happy path. It's naming every way the sequence can be interrupted.

$KAS

*Source: kaspa-covenants-explained.html*

---

## August 6: The metric nobody's screenshotting

Real adoption doesn't look like a headline. It looks like the same transaction shape repeating on-chain without anyone announcing it.

Daily accepted transaction count, covenant spends specifically, wallet integrations that ship instead of getting teased, indexers that add support quietly because users asked. None of that makes a good screenshot. All of it is checkable right now, by anyone, on a public ledger.

$KAS

*Source: adoption-metrics.html*

---

## August 7: The GUI is not the network

A Kaspa wallet app is a UI choice sitting on top of a node. It is not the protocol.

`kaspad` plus the CLI tools expose the actual primitives: raw transaction construction, UTXO inspection, mempool state, direct RPC calls. Most marketing screenshots never show this layer, because it's not supposed to be user-facing. But it's the layer that proves a claim rather than illustrating one.

If a claim can't survive a CLI check, it wasn't really about the protocol.

$KAS

*Source: command-line.html*

---

## August 8: Not every coin is answering the same question

"Which coin is better" assumes every coin is competing for the same job. Most aren't.

A store-of-value asset, a fee-generating platform token, a stablecoin, and an attention-market meme coin all get quoted in the same price chart, but they're solving different problems for different people. Ranking them on one axis, usually price, erases the actual question: what does this specific asset let you do that you couldn't do without it.

$KAS

*Source: why-are-there-so-many-coins.html*

---

## August 9: Value needs a mechanism, not a vibe

An asset isn't valuable because people believe in it. It's valuable because some mechanism makes it scarce, useful, or both, and belief tracks that mechanism.

Bitcoin's scarcity comes from a fixed, verifiable issuance schedule nobody controls. A platform token's demand comes from needing it to pay for blockspace. A stablecoin's peg comes from a redemption promise backed by something specific. Name the mechanism before asking whether the price makes sense.

$KAS

*Source: why-crypto-has-value.html*

---

## August 10: Narrow the claim to the actual job

"Crypto is useful" is too broad a claim to check. "Crypto is useful for X" is checkable.

Self-custodied money, censorship-resistant payments, programmable asset rules, and public verifiable records are real, specific jobs crypto does better than the alternative in some cases. Most everyday purchases, most databases, and most corporate platforms are jobs it does worse. The useful version of the claim always names the job.

$KAS

*Source: what-crypto-is-good-for.html*

---

## August 11: Pick two, or change what you're optimizing

Fast, decentralized, and cheap to secure don't arrive together by default. Every chain design picks where it gives ground.

Bitcoin gives up speed to keep decentralization and security cheap to verify. Proof-of-stake chains give up some of proof-of-work's external cost to get speed and cheaper finality. Kaspa's bet is narrower: push the block-rate side of that tradeoff without changing which corner it's optimizing.

Ask which corner a pitch is quietly giving up before asking what it's promising.

$KAS

*Source: tradeoff-map.html*

---

## August 12: Steelman the bear case first

The strongest case against Kaspa isn't "it's a scam." It's a list of things that haven't happened yet.

No major exchange has made it a top listing priority. Node resource requirements at higher block rates are still mostly modeled, not stress-tested at scale. Emission is declining on schedule while fee demand to replace it is still unproven. None of these are refuted by pointing at GHOSTDAG. They get refuted, if they do, by evidence that shows up later.

$KAS

*Source: skeptical-case.html*

---

## August 13: Run the check yourself

A claim about Kaspa is either checkable or it isn't. Most of the interesting ones are.

Live, testnet, roadmap, research, or wrong: that's the whole label set. What's the actual source. Can someone verify it without trusting the poster. What's the strongest limitation the claim leaves out. The tool that runs these questions against a specific sentence is more useful than any single verdict it produces once.

$KAS

*Source: reality-check.html*

---

## August 14: Point the same six questions at something else

Take any other coin's next big announcement and run it through the same checklist used here for Kaspa.

Find the actual release. Find the exact activation condition. Check mainnet versus testnet. Separate the protocol's claim from the app layer built on top of it. Separate the tooling from whether anyone's using it. Most announcements get noticeably weaker the first time someone actually does this.

$KAS

*Source: analyze-any-coin.html*

---

## August 15: The gap isn't the architecture

Kaspa's covenant model can express most of what an Ethereum app does at the primitive level. The gap that actually matters is somewhere else.

Ethereum has years of deployed liquidity, audited contract libraries, and developers who already know the tooling. A UTXO-based covenant on Kaspa is a different mental model to write against, even when the underlying capability lines up. Betting on Kaspa apps means betting developers will make that switch, not that the architecture can't support them.

$KAS

*Source: kaspa-vs-ethereum-apps.html*

---

## August 16: A vault that actually rejects a bad case

A vault covenant is only worth something if it has a receipt showing it refusing an invalid spend, not just accepting a valid one.

The TN10 vault demo did both: a pay-to-unlock path that succeeded under the stated rule, and a rejection path that failed when the rule wasn't met. Testnet-10 has since been reset, so neither is inspectable any more, which is its own lesson about what testnet evidence is worth. That pairing, accepted case and rejected case, side by side, is the actual bar for "this covenant works," not a screenshot of one successful transaction.

$KAS

*Source: experiment/vault.html*

---

## August 17: The smallest possible based app

A tip jar is a boring app on purpose.

No custody, no server, no database: a covenant enforces the spend rule and the ledger is the record. It's small enough that a stranger can read the whole mechanism in one sitting and confirm it matches what it claims to do. Boring and verifiable beats impressive and opaque, especially for the first example anyone shows you.

$KAS

*Source: experiment/tipjar.html*

---

## August 18: Coordination, not just custody

Most Kaspa app demos are about who holds money. A task board is about who agrees on state.

Assigning, claiming, and completing a task on-chain needs shared state multiple parties can read and update under a rule, not just a balance one party controls. It's a smaller problem than a full coordination market, but it's the same category of problem: getting strangers to agree on a changing state without a company in the middle deciding who's right.

$KAS

*Source: experiment/board.html*

---

## August 19: A poll is a coordination primitive too

Counting votes sounds trivial until the votes have to be tamper-proof and the tally has to be public without a server anyone has to trust.

An on-chain poll turns each vote into a transaction and the tally into whatever anyone can compute by reading the DAG. No admin panel, no database an operator could quietly edit. The interesting part isn't the UI. It's that the count is exactly as trustworthy as the chain underneath it.

$KAS

*Source: experiment/polls.html*

---

## August 20: What Kaspa isn't trying to rebuild

The based-apps page on this site has a section for what it deliberately skips: streaming, file storage, video, things other live protocols already do well.

Kaspa's job is ordering and enforcing rules on a shared transaction record, not replacing every internet-scale system that already works. Naming the systems a chain isn't trying to rebuild is more honest than implying it eventually replaces all of them.

$KAS

*Source: experiment/discover.html*

---

## August 21: Two months in, the same two lists

Two months past activation, the honest scorecard still splits the same way it did at day one.

Changed by the fork itself: transaction structure, the covenant path, based-ZK support, the app design surface. Still exactly where it was: wallet-native covenant support, exchange integration, and fee demand replacing declining emission. A hard fork moves the first list on schedule. It doesn't touch the second list at all.

$KAS

*Source: status.html*

---

## August 22: The bet, restated without the marketing

Strip the branding and Kaspa's actual bet is one sentence: can Bitcoin-style proof-of-work security run closer to real time without becoming something else.

Real-time decentralization means the confirmation feel scales with actual network conditions, fast when the network's clean, slower when it's under stress, instead of a fixed number chosen for a press release. It's a narrower and more falsifiable claim than "fast blockchain," which is exactly why it's worth stating precisely.

$KAS

*Source: why-kaspa-matters.html*

---

## August 23: The paper that didn't get built until later

GHOSTDAG existed as a research result years before Kaspa's genesis block did.

The gap between "the ordering rule is proven" and "a live network runs on it" was the actual engineering: turning a graph-theory approximation into deployable node software mining real blocks with real hardware. A correct algorithm and a maintained mainnet client are different achievements, and Kaspa needed both before day one counted.

$KAS

*Source: kaspa-origin-story.html*

---

## August 24: Expressiveness is not a new virtual machine

Toccata widened what a Kaspa transaction can require before it's valid. It did not add a general-purpose execution environment.

The expressiveness upgrade lets a covenant check more about its own inputs and outputs at once: amounts, controllers, timing, prior state, combined instead of checked one at a time. That's a wider door for what a single rule can enforce, not a new kind of door.

$KAS

*Source: toccata-expressiveness-upgrade.html*

---

## August 25: The constraint that made the upgrade hard

The interesting engineering problem in Toccata's expressiveness work wasn't adding checks. It was keeping every added check cheap enough to verify at 10 blocks per second.

A rule that's expressive but slow to check doesn't ship on a chain that depends on fast block production staying fast. Every added expressiveness had to clear a performance bar first, not just a "can this be expressed" bar.

$KAS

*Source: toccata-expressiveness-upgrade-part-2.html*

---

## August 26: What the upgrade still leaves for builders to do

Toccata's expressiveness work widened what a covenant can check. It didn't write any specific covenant for anyone.

A vault, an escrow, an asset rule: each one still has to be designed, specifying exactly which combination of checks applies and what happens at every failure path. The upgrade removed a ceiling. It didn't remove the design work underneath it.

$KAS

*Source: toccata-expressiveness-upgrade-part-3.html*

---

## August 27: Start with the job, not the primitive

The builder guide on this site doesn't open with covenants. It opens with a question: what does the user actually need to happen.

Payments, receipts, and better wallet UX need nothing beyond current mainnet. Only once a product needs a rule the user has to trust before funds move does Toccata's covenant surface become the relevant tool. Picking the primitive before naming the job is how simple products end up over-engineered.

$KAS

*Source: builder-guide.html*

---

## August 28: Citing Kaspa correctly is itself a claim

An AI answer about Kaspa is only as good as whether it separates mainnet fact from roadmap hope.

The guidance this site gives crawlers and assistants is specific: label every claim live, testnet, roadmap, research, or wrong, and cite the primary source behind the label, not just a confident-sounding sentence. A tool that can't produce that structure hasn't actually checked the claim, whatever its answer sounds like.

$KAS

*Source: ai-guidance.html*

---

## August 29: Same six questions, different claims this time

Run the claims-checker against a fresh batch: "Kaspa needs gas fees like Ethereum," "mining requires a data center," "Toccata added smart contracts from scratch."

Each one is a garbled version of something true wearing an unrelated system's vocabulary. Kaspa has fees, not a separate gas token. Mining scales down to a single ASIC, not just a warehouse. Toccata added a covenant rule surface to an existing UTXO model, not a new contract language bolted onto nothing.

$KAS

*Source: kaspa-claims-checker.html*

---

## August 30: A source hierarchy is a discipline, not a formality

Not every source that mentions Kaspa deserves the same weight.

A release note or a KIP outranks a core contributor's post, which outranks a community explainer, which outranks a price-chart account's caption. The hierarchy isn't about gatekeeping who's allowed to talk about Kaspa. It's about which claim survives being traced back to where it actually came from.

$KAS

*Source: sources.html*

---

## August 31: Two months on from Toccata

Toccata activated at DAA score 474,165,565 in June. Two months later the covenant rule surface has shipped and stayed shipped, and almost everything above it is still being built.

Testnet-10 was reset somewhere in there and took a set of demo receipts with it. Nobody scheduled that lesson. It is the cleanest argument going for why a testnet artifact and a mainnet record are different classes of evidence, and why one should never be quoted as the other.

The rule that survives all of it is boring. Label the claim, link the source, check it yourself.

$KAS

*Source: kaspanet/rusty-kaspa releases, api-tn10.kaspa.org*

---

## Addendum, July 12: Post 1: ZK doesn't mean private

"ZK does not automatically mean private" is a sentence from a builder actually shipping on Toccata's proof opcodes, not a caveat from this site.

A ZK proof verifies a statement about chosen inputs. Whatever gets exposed as a public input to that statement is, by definition, observable by anyone reading the transaction, proof included. Adding a proof to a covenant doesn't decide what stays hidden. Choosing which values are public versus private inputs does, and that choice is the builder's, not the opcode's.

RGK, a third-party asset protocol built on Toccata's covenant and ZK primitives, flagged this explicitly in its own downstream engineering notes, alongside asks for named descriptors on proof-system/encoding boundaries and structured errors that separate a bad proof from a bad stack from a blown budget.

$KAS

*Source: kaspanet/rusty-kaspa PR #1067, kaspanet/silverscript PR #137, and RGK Protocol's downstream notes (github.com/RGK-Protocol/RGK), via public Telegram Core R&D discussion, July 2026.*

---

## Addendum, July 12: Post 2: The verifier shipped. The button to press it is still landing.

KIP-16 activated on mainnet with Toccata in June. Silverscript's actual `g16.verify()` builtin, the function a contract writer calls to use it, is still an open pull request. It was opened on June 29 and has not merged. RISC0 support and the precompile exposure are two more open pull requests beside it.

That gap isn't a bug. A KIP defines the opcode; a compiler builtin is separate work that turns the opcode into something a contract author can call without hand-writing stack operations. The rule surface has been live on L1 for a month while the tooling that makes it callable is still sitting in review.

Enforcement and legibility keep being different jobs, at every layer, not just the explorer layer this site has already named.

$KAS

*Source: kaspanet/silverscript PR #137, PR #138, via public Telegram Core R&D discussion, July 2026.*

---

## Addendum, July 12: Post 3: A standard being tested out loud

KCC20 is not a KIP. It's a name for a fungible-token covenant design that core contributors are still arguing out in public, in real time, across two open forums.

The open question this week: how do you stop someone from pointing two borrowed inputs at the same output. One proposal uses a witness parameter instead of a signature check. The counter is that witnesses alone don't force a one-to-one mapping between borrowed inputs and outputs, so a matching output-index-to-input-index rule gets added on top. Watching that exchange happen is watching a standard actually get made, before it has a number.

Worth reading if you want to see the process. Not yet worth repeating as a shipped token standard, because it isn't one.

$KAS

*Source: kas-smiths.org (Fungible Token Covenant Specification, KCC20 thread) and public Telegram Core R&D discussion, July 2026.*
