# Cross-read: contradictions visible only across pages

Method: grepped every `.html` page, `demos/*.html`, `llms.txt`, `agent-index.json`, and `nav.js` for name variants, repeated facts, and link graphs; diffed demo directory contents against the demo hub, `llms.txt`, and `agent-index.json`; pulled the exact conflicting strings below rather than paraphrasing. Local working tree only (this is a live, currently-being-edited checkout; a previous run of this file is being superseded per instructions to start fresh).

Ten worst, worst first, then full inventory.

## 1. Counts and lists that disagree — `llms.txt` demo list is missing five real, linked demos

`llms.txt` (`## Demos`, line 227) states: "These are real content, linked from the pages above and from the demos index. They are neither retired nor redirect stubs" — then enumerates 13 demos with one-line summaries. The actual `demos/` directory holds 18 demo pages (excluding `index.html`). Missing from `llms.txt` entirely: `demos/dag-time.html`, `demos/fee-market.html`, `demos/live-network.html`, `demos/supply-split.html`, `demos/utxo-vs-accounts.html`. All five are real, linked pages — `utxo-vs-accounts` and `dag-time` and `fee-market` are cards on `demos/index.html` itself, and `live-network` is the last card on that same grid. An LLM reading `llms.txt` to build a picture of the site's demos will not know a third of them exist.
**Fix:** add the five missing entries to `llms.txt`'s Demos section, or drop the file's implicit completeness claim.

## 2. Counts and lists that disagree — `agent-index.json`'s `demos` array is missing two real demos

`agent-index.json`'s `demos` array lists 17 entries (`demos/index.html` plus 16 demo pages). Missing: `demos/live-network.html` and `demos/supply-split.html`. `supply-split.html` is linked from `status.html`, `build-on-kaspa.html`, `toccata-explained.html`, `kips.html`, and `design/patterns.html` — a real, cross-linked page absent from the machine-facing index that's supposed to enumerate exactly this. `live-network.html` is the last card on `demos/index.html`'s own grid and is also missing.
**Fix:** add both paths to `agent-index.json`'s `demos` array.

## 3. One fact, two statements — Kaspa's own hashrate contradicts itself inside chain-comparer.html

Same file, same `as_of: "2026-08-22"` snapshot, two different Kaspa hashrate figures:
- The scored data row: `"n":"Kaspa", ... "hr":0.30269` (302.69 PH/s).
- The `hashrate_ehs` caveat prose, same file: "Bitcoin's 912.5 EH/s is roughly 2,900 times Kaspa's **0.312 EH/s**."

0.30269 vs 0.312 EH/s is a ~3% internal disagreement inside one document that otherwise goes out of its way to document exact measurement provenance for every other field. (For comparison, `kaspa-mining.html` says 312.1 PH/s and `skeptical-case.html` says 311.5 PH/s — those two are plausibly just different live-API read timestamps across different pages, which is defensible; the chain-comparer.html self-contradiction is not, since it's the same page, same date, same paragraph's neighbor.)
**Fix:** make the caveat prose read the `hr` field's actual value (0.303 EH/s) instead of a hand-typed 0.312.

## 4. One concept, two names — "Silverscript" vs "SilverScript"

Every page but two write "Silverscript" (lowercase second word): `status.html`, `argent-explained.html`, `about.html`, `toccata-status.html`, `kaspa-origin-story.html`, `what-is-kaspa.html`, `why-kaspa-matters.html`, `search.html`, `sources.html`, `design/patterns.html`, `demos/argent-pipeline.html`, `demos/covenant-breaker.html`, and most of `build-on-kaspa.html` and `toccata-explained.html` themselves.

Two pages mis-capitalize it as "SilverScript" in specific spots:
- `build-on-kaspa.html:336`: `"...so SilverScript covenant deployments through it fail with..."` (every other mention on the same page, e.g. lines 222, 424, 434, correctly reads "Silverscript").
- `toccata-explained.html:235`: `<td>Covenant scripts are compiler output. SilverScript produces them.</td>` and `toccata-explained.html:353`, in the protocol-references footer: `<a href="https://github.com/kaspanet/silverscript">SilverScript</a>` (the rest of the same page, lines 261-263, 361, reads "Silverscript").

**Fix:** the project name per its own repo (`kaspanet/silverscript`, lowercase in the URL) and per site-wide majority usage is "Silverscript" — fix the four stray "SilverScript" instances in `build-on-kaspa.html` and `toccata-explained.html`.

## 5. One fact, two statements — chain-comparer's supply-split-adjacent Kaspa fee/day figure not cross-checked against skeptical-case

Not a contradiction found, but worth flagging as a near-miss: `chain-comparer.html`'s `"fee":6.3e-05` (Kaspa median fee) and `skeptical-case.html`'s "$4.86 a day...at a median $0.000063" agree (6.3e-05 = $0.000063) — this one is consistent and does NOT need fixing. Listed here only because it was the most likely place for the "stale claim survived on three pages" pattern the brief warns about, and it checked out clean. No action needed.

## 6. Redirect-stub content matches destination anchors — verified clean

`glossary.html`, `kaspa-claims-checker.html`, and `kaspa-developments.html` are all genuine `noindex` + `meta refresh` stubs pointing at `/what-is-kaspa` and `/status` (the latter two at `/status` and `/status#claim-fact-check` respectively). `status.html` does contain a `#claim-fact-check` anchored section (`status.html:358`) and inbound links to it resolve correctly (`status.html:131`, `:483`, `:513`). No dead link here. Listed for completeness since the brief specifically named these three as recently changed.

## 7. Nav is confirmed at five items, consistent

`index.html`'s primary nav (`#primary-links`) has exactly five links: What is Kaspa, Live now (`/status`), Risks (`/skeptical-case`), Build (`/build-on-kaspa`), Demos (`/demos`). No stale sixth item found referencing a retired page.

## 8. "Keep reading" / "Read next" blocks form a real progression, not a cycle

Checked the five pages carrying `related-links` blocks: `kaspa-origin-story` → `toccata-explained` → `argent-explained` → `build-on-kaspa` → `status` → `skeptical-case` → `sources`. Each page's "Previous"/"Next" pair points one step forward and one step back along that same chain; none suggests where the reader just came from as a "next" step. Clean.

## 9. Demo count in prose matches the demo hub's own grid, but both undercount the directory

`demos/index.html`'s meta description and lead both say "Seventeen interactive demos" and the page's own markup shows exactly 17 (1 pinned "top demo" iframe = `collision-sim`, plus 16 grid cards). That count is internally consistent with what's rendered on the page — but the `demos/` directory has 18 files, because `demos/supply-split.html` exists, is linked from five other content pages (`status.html`, `build-on-kaspa.html`, `toccata-explained.html`, `kips.html`, `design/patterns.html`), and is never surfaced on the demo hub itself. A reader following any of those five pages' links reaches a demo that the hub page — the place explicitly designed to be the complete index — doesn't know about.
**Fix:** either add a `supply-split` card to `demos/index.html` and bump the copy to "Eighteen," or explain why it's intentionally excluded.

## 10. vProgs / blockDAG casing — no real issue, checked and cleared

`blockDAG` appears 96 times capitalized correctly; the 21 lowercase `blockdag` hits are all API path segments (`/info/blockdag`), an `id` attribute, a JS variable, or search-index keywords — not prose inconsistency. `vProgs` appears 73 times correctly cased; 51 lowercase `vprogs` hits are code identifiers/URLs (`github.com/kaspanet/vprogs`, JS ids); the 2 `Vprogs` hits are a JS element id (`modeVprogs`) and its selector, not visible copy — the visible button text next to it correctly reads "vProgs." "DAG KNIGHT" in `demos/parameterless.html` is a CSS-transformed UI label (all-caps by design), not a prose casing conflict with "DAGKnight" used everywhere else. No fix needed on any of these.

---

## Term inventory

| Term | Canonical form site-wide | Deviations found |
|---|---|---|
| GHOSTDAG | GHOSTDAG (all caps) | none found |
| blockDAG | blockDAG | lowercase only in API paths/ids/vars — not prose |
| UTXO | UTXO | none found |
| covenant | covenant (lowercase, generic term) | none found |
| Silverscript | Silverscript | **"SilverScript" in `build-on-kaspa.html:336` and `toccata-explained.html:235,353`** — see #4 |
| Argent | Argent | none found |
| Toccata | Toccata | none found |
| vProgs | vProgs | code identifiers only lowercase/mis-cased; visible copy consistent |
| DAGKnight | DAGKnight | "DAG KNIGHT" is a styled all-caps label in one demo, not a spelling variant |
| sequencing commitment | sequencing commitment | none found |
| blue score | blue score | none found |
| blue work | blue work | none found |
| mergeset | mergeset (one word) | "merge set" (two words) appears in `demos/parameterless.html` and `demos/dag-time.html` — worth a pass but reads as acceptable in prose position, not flagged as a hard contradiction |
| anticone | anticone | none found |
| pruning | (not separately audited this pass — time-boxed) | — |
| finality | finality | consistent; chain-comparer.html now correctly separates protocol `finality_depth` (432,000 blocks / 12h) from practical settlement convention (~10s), per its own caveat text — this used to be conflated per that same caveat's changelog note, now fixed |
| DAA score | DAA score | consistent; Toccata mainnet activation DAA 474,165,565 confirmed identical across `what-is-kaspa.html`, `status.html`, `toccata-explained.html`, `kaspa-mining.html`, `demos/utxo-vs-accounts.html`, `demos/dag-time.html`, `sources.html` — no drift found |
| mass / compute grams | "compute grams" | consistent fee-floor formula `100 sompi * max(compute grams, 2 * transaction bytes)` identical in `build-on-kaspa.html`, `toccata-status.html`, `toccata-explained.html` |
| Crescendo | Crescendo | DAA 110,165,000 / ~5 May 2025 activation consistent between `demos/dag-time.html`'s two citations |
| RTD | (not separately audited this pass — time-boxed; 6 hits, spot-checked context looked consistent) | — |
| TN10 / TN12 | TN10 and TN12 are genuinely two different testnets, used consistently as such | no confusion found between them anywhere |

## Not reached this pass

Given the six-category brief and time budget, the following were not exhaustively read line-by-line: `pruning` usage across all pages, `RTD` usage across all pages, full text of `AGENTS.md`/`COPY_STYLE.md`/`WORKING-STATE.md` (large internal working docs, not reader-facing), and a full manual read of every demo's embedded JS copy (spot-checked `demos/dag-time.html`, `demos/parameterless.html`, `demos/argent-pipeline.html`, `demos/attack-cost.html`, `demos/covenant-breaker.html` for prose only). Voice-mismatch comparison (category 4) was spot-checked via the argent-explained → argent-pipeline link and found consistent in tone (both use the site's flat, evidence-first register) but not exhaustively verified against every demo/guide pair.
