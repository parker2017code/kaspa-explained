# sources.html retirement mapping

`design/STANDARD.md` (Reference pages are usually not pages) names sources.html
directly: "Sources are not something anyone reads either. A source belongs
attached to the claim it settles, reachable from that claim." That is the
correct reading of the standard. `sources.html` should retire once every URL
below is attached inline, at the claim it settles, on the page named as its
destination.

This file is the prep work for that retirement. It does not execute it: doing
so means editing `what-is-kaspa.html`, `build-on-kaspa.html`, `status.html`,
`kaspa-origin-story.html`, `kaspa-mining.html`, `kips.html`,
`argent-explained.html`, and `why-kaspa-matters.html`, all of which other
agents hold today. Until each row below lands as an inline citation on its
destination page, `sources.html` stays live as the only route to some of these
188 URLs, and retiring the page first would delete sourcing, not relocate it.

Each destination page already carries some inline sourcing (5-15 raw
GitHub/docs.kaspa.org links measured in this pass); this is the remainder.
Where a URL already appears inline on its destination page, mark it done and
drop it from `sources.html` in the same commit as everything else in that
group, not before, so the group empties from `sources.html` in one move
instead of leaving a half-emptied section between passes.

Grouping follows `sources.html`'s own structure (its `<article>` and `<li>`
groups already cluster by claim); each group gets one destination rather than
each URL getting its own row, because a group is what a reader is trying to
verify. Sub-claims within a group that need a sharper anchor than the page
root are called out.

## Claim-type table (`#claim-source`)

This table is methodology (which source *type* settles which claim *type*),
not a set of claims itself. It has no per-claim destination; it is the kind of
material `sources.html` can keep as an index even after every URL below moves,
since it explains how to weigh a source rather than asserting a fact. Leave it
on `sources.html`.

## code-tracking groups

| Group | URLs | Destination |
|---|---|---|
| Toccata / Silverscript branch, releases, guide, bridge/config, opcode test, KIP-16/17/20/21 raw text | rusty-kaspa `tree/toccata`, `v2.0.1`, `v2.0.0`, `toccata-guide.md`, `bridge/docs/README.md`, `bridge/config.yaml`, `tn10-toc3`, `tn10-toc2`, `tree/tn12`, `kaspanet/silverscript`, `issues/983`, kip-0016/17/20/21 raw | `build-on-kaspa.html` (builder/covenant detail); release tags (`v2.0.1`, `v2.0.0`) belong on `status.html`'s activation record instead |
| KIP-24 PR, KIP-22 PR | kips PR #41, #37 | `kips.html` (the live tracker already reads these repos; these two are the ungenerated fallback citation) |
| argent-lang/argent, argent README | github.com/argent-lang/argent, raw README | `argent-explained.html` |
| Capacity / mass: params, mass code, wallet mass, payload docs | rusty-kaspa `params.rs`, `mass/mod.rs`, `wallet/core/src/tx/mass.rs`, docs.kaspa.org payload | `what-is-kaspa.html` (mass-calculator demo, capacity claim) |
| TN12 builder utilities: faucet, explorer, RPC ports, tn12 branch | faucet-tn12, tn12.kaspa.stream, aspectron RPC ports, `tree/tn12` | `build-on-kaspa.html` |
| vProgs / ZK framework: vprogs repo, argent repo, RISC0 commit, settlement-merge PR, SDK PR, sequencing-lane PR | kaspanet/vprogs, argent-lang/argent, vprogs commit `57039db`, vprogs PR #36, rusty-kaspa PR #953, PR #961 | `build-on-kaspa.html` (`#zk-boundary-demo`); argent repo link only -> `argent-explained.html` |
| DAGKnight: branch, encoding-test commit, placeholder commit | rusty-kaspa `tree/dagknight`, commits `ae94cfe`, `b75ef94` | `kips.html` or `status.html`'s research-label row (DAGKnight is research-stage; put it wherever that status label already lives) |
| Builder tooling: docs.kaspa.org pages, aspectron WASM SDK docs, wasm examples, python-sdk repo/releases/changelog/PyPI, KasSigner, KasSee | 19 links, all docs/SDK reference | `build-on-kaspa.html` |
| Infrastructure experiments: TxIndex PR, Relay draft | rusty-kaspa PR #860, #930 | `kips.html` (roadmap/research tracker) |
| Network access: REST API, kas.fyi Dev Platform + 5 sub-pages, aspectron node-network page, explorer, DAG visualizer, db dumps, testnet faucet | 13 links | `status.html` (L1 snapshot sourcing); the kas.fyi sub-pages specifically -> `build-on-kaspa.html` if a builder-facing API walkthrough exists there, else `status.html` |
| Node and community infra: Docker Hub, DeepWiki, kaspa-indexer, dnsseeder, kHost, kaspa-js, R&D Telegram | 7 links | `build-on-kaspa.html` |

## learn-kaspa (Kaspa.com glossary index, 50 links)

This is a third-party term-by-term mechanics glossary, not 50 distinct site
claims. `what-is-kaspa.html` already carries the inline hover/tap term
definitions these articles back up. Do not explode this into 50 inline
citations; keep it as one linked "further reading" cluster attached to
`what-is-kaspa.html`'s glossary section (the page that absorbed the retired
`glossary.html`), which satisfies "attached to the claim it settles" without
manufacturing 50 separate attachment points for what is one claim (the
mechanics vocabulary is accurately described here).

## external-references groups (`#external-references`, 31 `<li>` groups, 62 links)

| Group | Destination |
|---|---|
| hashd.ag, hashd.ag/raw | `kaspa-origin-story.html` (already used for the RTD/Hashdag term-def; add the raw link where Hashdag is first named as a source) |
| Kaspa launch plan, Black Tuesday (Sompolinsky Medium posts) | `kaspa-origin-story.html` |
| Polychain Capital | `kaspa-origin-story.html` (funding history) |
| Hackernoon interview | `kaspa-origin-story.html` |
| Wiki prehistory | `kaspa-origin-story.html` |
| Investing.com 2021 launch coverage | `kaspa-origin-story.html` |
| Corem testnet post | `kaspa-origin-story.html` |
| Epicenter ep. 192, Rethink Trust 2018 | `kaspa-origin-story.html` |
| KASmedia/Hiesboeck recap | `why-kaspa-matters.html` |
| Uphold X Space transcript | `why-kaspa-matters.html` |
| PHANTOM (DBLP) | `what-is-kaspa.html` (GHOSTDAG mechanism, academic citation) |
| Dust-attack post-mortem, KIP-9 | `kaspa-origin-story.html` |
| Sutton/Toccata Medium post | `build-on-kaspa.html` or `what-is-kaspa.html#covenants` |
| rusty-kaspa repo, releases index | `status.html` |
| blockDAG/coinsupply/blockreward API | `status.html` (L1 snapshot) |
| Wiki tokenomics | `kaspa-mining.html` (emission/supply) |
| v2.0.1, v2.0.0, Toccata guide | `status.html` (activation record) |
| tn10-toc3, tn10-toc2, TN10 status API | `status.html` |
| Toccata branch, TN12 branch | `build-on-kaspa.html` |
| vprogs repo, argent-lang repo | `build-on-kaspa.html` / `argent-explained.html` |
| Kaspa KIPs repo + PR #31/32/35/36/41/37 (KIP-16/17/20/21/24/22) | `kips.html` |
| Based ZK rollups (research.kas.pa) | `build-on-kaspa.html` research/ZK section |
| Kaspa Research, Q&A | `status.html` or `kips.html` |
| Kaspa.org (Lore/Build/HODL), marked excluded | Not a claim citation; this is the source-discipline exclusion note. It belongs in `CONTENT_BRIEF.md` or `status.html`'s source-discipline paragraph, not attached to any single claim |
| KASmedia, Learn Kaspa (kaspa.com) | `what-is-kaspa.html` further reading |
| S16 E41 podcast transcript, recording | `kaspa-origin-story.html` or `why-kaspa-matters.html` |
| Mining the Internet, Oxford address, Oxford Q&A | `why-kaspa-matters.html` |
| Daily Q&A (X post) | `why-kaspa-matters.html` (this is the May 8 2026 Kaspa Daily Q&A already cited by name in `README.md`'s Current Status Rules) |
| Sutton vProgs talk, covenant++ gist, STARK blocks gist | `build-on-kaspa.html` |
| Izio programmability guide, fast-PoW recap | `build-on-kaspa.html`; fast-PoW recap specifically -> `kaspa-mining.html` or `why-kaspa-matters.html`'s fast-PoW comparison graphic |
| Bitcoin whitepaper, Ethereum scaling | `why-kaspa-matters.html` (comparison claims) |

## Execution order

1. Take one destination page at a time (start with `build-on-kaspa.html`,
   the largest recipient), attach every URL in its groups above to the
   specific sentence it backs, verify the link still resolves.
2. Delete that page's rows from `sources.html` in the same commit.
3. Repeat per page. `sources.html` shrinks to just the claim-type table
   (`#claim-source`) and the Kaspa.org exclusion note (which moves to
   `CONTENT_BRIEF.md`'s source-discipline section either way).
4. When the last group is gone, retire `sources.html` itself: point its
   footer nav entry and `/sources` URL at whichever page inherits the
   claim-type table (`status.html` is the natural home), and add a redirect
   stub, `sitemap.xml`, `agent-index.json`, `llms.txt`, and `README.md`
   entries in that same commit.

Until step 4, `sources.html` stays live, out of primary nav, footer-linked,
and is the accurate route to any URL not yet moved.
