# Redundancy audit

Read-only pass over the live page set (`sitemap.xml`'s 19 content/reference
pages plus `llms.txt`, `agent-index.json`, `README.md`), the three pages
retired to redirect stubs on 2026-08-23 (`toccata-explained`,
`toccata-status`, `about`), and their fold-in destinations
(`what-is-kaspa#covenants`, `build-on-kaspa`, `status`). `model-picker.html`,
`chain-comparer.html`, `the-instrument.html`, and the parameterless demo on
`kips.html` were excluded per instruction. Findings below are ranked by how
much text the fix removes or how much drift risk it closes, not by where it
sits on the page.

---

## 1. The coinbase-share stat is duplicated within `what-is-kaspa.html`, and the duplicate is wrong

**Where:** `what-is-kaspa.html`, live-network demo section.

- Line 2446, inside the demo's own stat tile: *"Kaspa's own measured baseline runs the same way: about 0.9 transactions per second, and 89.5% of its raw transaction count is coinbase, one per block (site data, read from api.kaspa.org, 2026-08-22)."*
- Line 2465, one paragraph of prose later, under the heading "What's inside: mostly nothing yet": *"The same figure appears sitewide: about 0.9 transactions per second sustained, and 89.5% of the raw transaction count is the one-per-block coinbase payout, not economic activity (`data/l1-chains.json`, cross-checked against live API reads)."*

The second sentence exists only to restate what the stat tile immediately above it already displays — exactly the "prose restating what its own demo shows" pattern flagged for this pass. It should go; the demo's own tile already carries the number.

**It's also the wrong number.** `data/l1-chains.json`, the file both sentences cite, gives Kaspa's actual figure as **88.3 percent**, twice: `"tx_note": "88.3% of the raw count is coinbase, one per block at up to 10 blocks per second"` (line 633) and again in the `daily_transactions` caveat block (line 21), both dated 2026-08-22 — the same date `what-is-kaspa.html` cites. `82023` clean transactions over `702164` raw gives `1 - 82023/702164 = 88.3%`, confirming the JSON is the correct figure and 89.5% is drift, not a different snapshot.

`skeptical-case.html` line 115 cites the same underlying figure a third way: "roughly 12,000 times Kaspa's own measured 0.895 TPS" — consistent with the JSON's `tps: 0.949` at the rounding level this page uses it at, not itself wrong, but a third distinct phrasing of one fact.

**Fix:** `data/l1-chains.json` owns this number. Delete the line-2465 sentence entirely (the tile above it already shows the figure). Correct the stat tile at line 2446 to 88.3%. Nothing else needs to change; `skeptical-case.html`'s 0.895 rounds consistently with the corrected figure and doesn't need touching.

---

## 2. The covenant-count stat is duplicated across `build-on-kaspa.html` and `what-is-kaspa.html`, with conflicting sourcing

**Where:**

- `build-on-kaspa.html` line 653, in the "Covenant counts, and use cases by status" deep-dive: *"A third-party indexer, [kascov](https://kascov.io), counted 28,107 covenants ever created on mainnet by August 22, 2026, with 517 still active holding about 1,750,093 KAS across roughly 86 real markets."* Sourced, precise, dated, cites the indexer by name, and sits next to the KIP-17/KIP-20 primary sources and a use-case status table.
- `what-is-kaspa.html` line 2468, in the live-network demo's "Covenants" explainer: *"the site's own August 2026 reads found roughly 28,000 ever created and about 500 still active."*

Same underlying fact, rounded down from build-on-kaspa's precise figures, but attributed differently: build-on-kaspa says a **third-party indexer** (kascov.io) counted them; what-is-kaspa says **this site's own reads** found them. Only one of those is true, and nothing on either page explains the discrepancy — it reads as the number having been copied and re-attributed rather than re-measured.

**Fix:** `build-on-kaspa.html#covenant-adoption` owns this fact — it has the precise numbers, the named source, the date, and the use-case table. Rewrite the what-is-kaspa sentence to point there instead of restating a rounded, misattributed copy:

> "Toccata-era Kaspa enforces covenants and covenant IDs in consensus; see [build-on-kaspa#covenant-adoption](/build-on-kaspa#covenant-adoption) for how many are actually running. They are uncommon in the ordinary block feed; expect long stretches with none."

---

## 3. GHOSTDAG's blue/red coloring mechanism is explained twice, once with no link between the two

**Where:**

- `what-is-kaspa.html#ghostdag` (from line 678): a four-step mechanistic breakdown — Parents, Coloring (the k cap, blue set vs. red), Spine (selected parent by blue work), One order (mergeset walk) — backed by the live GHOSTDAG playground demo where a reader adds blocks by hand and watches blue/red resolve.
- `why-kaspa-matters.html`, "How GHOSTDAG and real-time decentralization work" deep-dive (from line 232): re-explains the same blue/red coloring with its own static SVG diagram ("GHOSTDAG does not make every block equal. It gives nodes a rule for ordering the graph"), plus a `blue-work` tooltip definition that duplicates `what-is-kaspa`'s own `blue-work-def-wik` tooltip almost word for word.

The two pages are doing different jobs — what-is-kaspa explains the mechanism, why-kaspa-matters explains the motivation (RTD, Hashdag's framing, why Kaspa chases it) — and that split is legitimate. What isn't: why-kaspa-matters re-derives the blue/red coloring rule itself, with a second, weaker (static, non-interactive) diagram, instead of pointing at the page that already has the interactive version. There is no link from why-kaspa-matters to `what-is-kaspa#ghostdag` anywhere in or near that section.

**Fix:** Keep why-kaspa-matters' RTD/Hashdag framing paragraph (that content is unique to this page). Cut the diagram and the "GHOSTDAG does not make every block equal" mechanism paragraph; replace with a one-line pointer:

> "See [what-is-kaspa#ghostdag](/what-is-kaspa#ghostdag) for how blue/red coloring and the selected-parent spine actually work; try it live there."

---

## 4. `README.md` is stale against yesterday's retirements — describes five redirect stubs as live content pages

**Where:** `README.md`, "Site pages" section, header dated 2026-08-23, claiming "23 live, indexable pages."

Checked against the actual files, five of the pages README describes as live content are `noindex` redirect stubs:

| README claims | Actual state |
|---|---|
| `toccata-explained.html` "explains Toccata as the expressiveness upgrade: covenants, covenant IDs, ZK proof checks, sequencing lanes, based apps, and the vProgs boundary." | Stub, `refresh` to `/build-on-kaspa#covenant-breaker-demo` |
| `about.html` "is the editorial policy page." | Stub, `refresh` to `/status` |
| `glossary.html` "is the plain-English term glossary." | Stub, `refresh` to `/what-is-kaspa` |
| `kaspa-developments.html` "is the monthly what-changed page." | Stub, `refresh` to `/status` |
| `kaspa-claims-checker.html` "is the human-readable companion to `CLAIMS.yml`." | Stub, `refresh` to `/status#claim-fact-check` |

`sitemap.xml` (19 `<loc>` content/reference entries), `llms.txt` ("The 19 pages below... are every indexable page on this site"), and `agent-index.json` (`pages` array, 19 entries) all agree with each other and are current — they correctly describe all five of the above as retired. `README.md` is the one file that drifted; it still describes the pre-2026-08-23 page count and inventory.

**Fix:** Update `README.md`'s "Site pages" section to 19 live pages, matching `llms.txt`'s inventory, and move the five rows above into the retired-stub list the way `llms.txt` already does (e.g. its `/about` entry: "The `/about` page is retired and is now a redirect stub into `/status`. Its disclosure... now runs in the site footer on every page..."). `agent-index.json` is generated — flagged here as drift, not proposed for a manual edit.

---

## 5. `skeptical-case.html` links the same demo twice, once through a dead-URL stub

**Where:** `skeptical-case.html`.

- Line 117: *"The [attack cost calculator](/demos/attack-cost) prices what it costs to outrun this hash rate for an hour."* — links the pre-merge standalone demo URL, which is now a `noindex` redirect stub.
- Line 178, in the page's own inlined attack-cost section: *"[Run the attack-cost calculator on the mining page](/kaspa-mining#attack-cost) and set your own time window to see that cost priced live."* — links the correct, current anchor.

Two references to the same resource in one page, one of them stale. Not high word count, but exactly the kind of stray leftover the demo-merge (`PLAN-DEMO-MERGE.md`) was supposed to sweep, and it slipped through on this page.

**Fix:** Point line 117 at `/kaspa-mining#attack-cost` to match line 178.

---

## Checked and clean — no finding

- **Pruning mechanics vs. pruning-and-privacy caveat.** `kaspa-mining.html` owns the full mechanism (first/second-order pruning, archival mode, the node-cost demo, sourced to rusty-kaspa's pruning-processor code and KIP-15). `what-is-kaspa.html`'s "Does pruning make Kaspa private?" is a different claim entirely (pruning is not a privacy guarantee) — this is the FAQ item `llms.txt` says was folded in from the retired `/about` page, and it doesn't overlap with kaspa-mining's mechanism writeup. No action needed.
- **UTXO model.** `utxo-vs-accounts.html` is the sole owner of the mechanism explanation (first-spend-wins, parallel validation, the coin-vs-account contrast) and is explicitly the site's word-count-constrained model page per `HANDOFF.md`. `crypto-from-scratch.html`, `status.html`, and `start-here.html` only reference it or link out; none re-explain it.
- **Footer disclosure.** Identical `footer-disclosure` paragraph is shared chrome across every page (20 occurrences checked) — this is the intended baseline per the brief, not a finding. No page restates the disclosure in body prose; `status.html`'s absorption of the retired `/about` page's editorial-policy content stays in the claim-status table and doesn't duplicate the footer line.
- **Covenant-breaker and ZK-boundary demo sections on `build-on-kaspa.html`.** Surrounding prose ("Before writing spend-rule code, see what a covenant actually blocks...") sets up the demo without restating its mechanics or its verdicts; the demo's own UI carries the play-by-play. Clean.
- **`llms.txt` and `agent-index.json` against the live page set.** Both correctly reflect all three 2026-08-23 retirements (`toccata-explained`, `toccata-status`, `about`) and the 18-demo inlining, including exact anchor IDs (`#covenant-breaker-demo`, `#zk-boundary-demo`, `#ghostdag`, `#collision-demo`, `#live-network`, `#mass-calculator`, etc. all verified present on their claimed target pages). Only `README.md` (finding 4) has drifted.
