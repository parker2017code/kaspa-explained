# Making the Toccata application stack legible

Checked 2026-09-09 against primary project documentation and repositories.

## The product answer

Toccata, SilverScript, and Argent form three different layers of one developer story:

1. **Toccata supplies consensus capabilities.** Transaction introspection lets a script inspect inputs and outputs; covenant IDs give a state lineage a stable identity; authorization groups let one input authorize specific outputs; ZK verification and sequencing commitments add specialized verification surfaces. These are active KIP capabilities, not an application framework by themselves.
2. **SilverScript expresses one covenant's rules.** It turns typed, readable conditions and state-transition constraints into Kaspa Script. It reduces hand-written script work, but the current release is `v1-rc1` and still needs contract-specific review and testing.
3. **Argent expresses an application made of actors.** It describes actor state, routes, spawning, and closed or open inter-contract communication, then emits ordinary SilverScript plus a portable artifact used by its runtime. Argent has no release and explicitly remains pre-release.

Together they can support native UTXO applications where separate states progress in parallel and selected states change atomically in one transaction. Concrete patterns already present in the reviewed examples include owner-controlled state machines, bounded delegation, multi-party exchange, bonded delivery, and one app validating another app's state transition. They do not establish oracles, physical delivery, privacy, liquidity, audit quality, wallet support, or production readiness automatically.

## What other ecosystems teach well

| Product | What it makes legible | Weakness to avoid | Workbench implication |
| --- | --- | --- | --- |
| [Remix](https://github.com/remix-project-org/remix-project) and [RemixAI](https://remix-ide.readthedocs.io/en/latest/ai.html) | One browser surface connects source, compiler output, deploy/run, transaction log, debugger, static analysis, and contextual explanations. AI can explain contracts and compiler errors where they occur. | A full IDE exposes many panels before a beginner knows which evidence matters. AI generation can also make unsafe code feel finished. | Keep one guided path. Attach “explain this rule” and “explain this failure” to the exact source, artifact, or check. Never let generated prose replace compilation or VM evidence. |
| [Scaffold-ETH 2](https://docs.scaffoldeth.io/) | Contract hot reload updates a real frontend; burner wallet, local faucet, hooks, and local block explorer shorten the feedback loop. Its documentation exposes `/llms.txt`, `AGENTS.md`, and skills for coding agents. | The happy path spans a large framework stack, and local convenience can hide deployment and wallet assumptions. | Export a complete, small project contract: pinned compiler, source, artifact, builder, tests, UI bindings, and evidence manifest. Keep network and signer requirements explicit. |
| [SpeedRunEthereum](https://speedrunethereum.com/) | Ordered challenges turn abstract Solidity concepts into concrete products and visible completion. | Challenge completion can reward copying a pattern without understanding its trust boundary. | Each Kaspa example should begin with a human problem, show the unsafe transaction, then require the covenant-backed result and one adversarial failure. |
| [Solana Playground](https://github.com/solana-playground/solana-playground) | Browser-based edit, build, deploy, and test removes setup friction. | It is beta and supports a curated crate/version set, so the browser environment is not equivalent to every local project. | Offer a curated reviewed-example compiler first. Show exact pins and supported inputs; arbitrary user compilation should be a later, sandboxed feature. |
| [Anchor IDL](https://www.anchor-lang.com/docs/basics/idl) and [CLI](https://www.anchor-lang.com/docs/references/cli) | Generated IDL connects program instructions/accounts to clients; build, test, verify, debugger, and fuzz commands give distinct evidence stages. | Generated interfaces describe shape, not business correctness, and client generations can have SDK-version boundaries. | Treat the Argent artifact as a first-class interface view beside generated SilverScript. Export evidence types separately: compiled, VM-tested, node-accepted, and observed result. |
| [Solana app template](https://solana.com/developers/templates/nextjs-anchor) | A runnable full-stack vault connects wallet discovery, cluster selection, faucet, program, generated client, error parsing, tests, and explorer links. | A polished template can make a deployed example appear broadly secure or production-ready. | Every Kaspa starter should include visible wallet/network state, generated client/builder constraints, negative tests, and receipt inspection, with testnet status always present. |
| [Sui Move intro course](https://github.com/sui-foundation/sui-move-intro-course) and [Sui bootcamp](https://github.com/MystenLabs/sui-move-bootcamp) | Lessons organize concepts around owned objects, capabilities, resource rules, tests, and full-stack applications. The object model is taught through state ownership and transitions rather than opcode lists. | Some course material flags itself for updating; tutorials can drift from the current toolchain. | Teach Kaspa through state cells and authority: who owns this UTXO, which successor is allowed, and which other actors must participate. Date every toolchain snapshot. |
| [Sui CLI](https://github.com/MystenLabs/sui/blob/main/docs/content/references/cli/cheatsheet.mdx) | Build, test, lint, local network, traces, and debugger form a clear ladder from source to execution evidence. | A command passing at one rung does not prove the next rung. | Show an evidence ladder in the UI and export it verbatim for agents: source parsed → generated → compiled → VM cases → transaction built → node accepted → state observed. |

## Standards map: do not merge these labels

- **KIPs** are Kaspa Improvement Proposals for protocol, consensus, and client surfaces. The [official index](https://github.com/kaspanet/kips) currently lists Toccata-related KIP-16, KIP-17, KIP-20, and KIP-21 as `Active`. [KIP-20](https://github.com/kaspanet/kips/blob/master/kip-0020.md) separates consensus validation of covenant lineage from script validation of the state transition.
- **KCCs** are Kaspa Calls for Conventions. The [official KCC repository](https://github.com/kaspanet/kccs) says they coordinate ecosystem conventions and do not change consensus. KCC-0001, KCC-0002, and KCC-0020 are currently listed as `Draft`; KCC-0021 remains an open pull request. A KCC claim therefore needs the exact document and status, plus conformance evidence.
- **KAP** is not a verified Kaspa standards family. No KAP entry or repository appears in the checked official KIP or KCC sources. Search results for `KAP-*` led to an unrelated draft Kapnet/Bitcoin overlay repository. The workbench should not use “KAP” as a Kaspa label without a specific primary Kaspa source.
- **KRC** inscription protocols are independent application/indexer conventions. They are not KIPs, KCCs, or native covenant enforcement.

## Recommended interaction: explain → inspect → build → verify

**Explain.** Start with the human risk: “The seller could keep the payment,” “the delegate could overspend,” or “one party could back out.” Animate the unsafe outcome, then state the rule in one sentence.

**Inspect.** Place four synchronized views beside the example: actor/state diagram, Argent source, generated SilverScript, and artifact/route table. Selecting a line should highlight the state or transaction edge it constrains. Beginners may stay in the diagram; developers can open every byte-level layer.

**Build.** Compile only a reviewed example in the beta. Show the exact Argent and SilverScript pins, input file set, output hashes, warnings, and resource sizes. A successful build means only that the toolchain produced artifacts.

**Verify.** Present independent rows for static constraints, positive VM cases, adversarial VM cases, transaction construction, node submission, acceptance, and observed successor state. Each row carries `verified`, `failed`, `not run`, or `unavailable`; no aggregate green badge may erase a missing stage.

For LLM coding, export a deterministic project bundle or manifest containing:

- the user goal and trust assumptions;
- exact source files and compiler pins;
- the portable Argent artifact and generated SilverScript;
- transaction-builder input/output constraints;
- positive and adversarial test vectors;
- network, wallet, and signer requirements;
- evidence records with timestamps and explicit stage/status;
- unsupported claims, including audit, mainnet safety, external facts, and wallet interoperability.

An agent should be able to edit source and propose tests, but it should not turn prose into a verified status. Only the named compiler, VM, node, and observation checks can advance their respective evidence rows.

## First beta recommendation

Use the existing **ring** example as the developer centerpiece because three separate states make atomic participation visible. Pair it with **habitat** as the beginner example because one app observing another is easier to narrate. The first complete loop should be:

1. run the example and show the intended state change;
2. break one obligation and show the local/VM rejection beside the exact rule;
3. compile the allowlisted source and compare generated outputs;
4. export the artifact, constraints, test cases, and evidence manifest;
5. keep network submission disabled until the beta has a separately reviewed wallet and testnet flow.

This gives the workbench a genuine capability now: it explains and reproduces how multi-actor Kaspa covenant applications lower to inspectable contracts, while keeping production and network claims outside the evidence actually gathered.
