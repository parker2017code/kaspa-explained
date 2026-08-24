# Clarity audit: inlined demo joins

Scope: `kaspa-mining.html`, `what-is-kaspa.html`, `kips.html`, `utxo-vs-accounts.html`, `build-on-kaspa.html`, `why-kaspa-matters.html`, `argent-explained.html`, `kaspa-origin-story.html`. Read end to end, once, aloud-at-reading-speed. `model-picker.html`, `chain-comparer.html`, `the-instrument.html` skipped. The parameterless DAGKnight demo on `kips.html` skipped (being rebuilt). KIP, UTXO, and bps skipped as terms (separate agent adding definitions).

Ranked by how many readers would trip, not by severity.

---

## 1. `build-on-kaspa.html` — card label is missing its object

> "2 / Reason **Say why a server won't do**"

This is a step title next to "1 / Job: Name the action." A reader hits "won't do" and expects a continuation that never comes — "won't do" what? It reads like a dropped word, not a finished instruction, right at the top of the page's core routing table, which most builders read first.

**Rewrite:**
> Say why a server can't do it instead

---

## 2. `kaspa-origin-story.html` — opening paragraph, scope of "each fell apart" is ambiguous

> "It was what was left after research into faster proof-of-work ordering ran through DAGLabs, an April 2021 testnet, and a hardware plan, a presale, and a DeFi pitch that each fell apart."

This is the second sentence of the whole page. Five things get listed in a row — DAGLabs, a testnet, a hardware plan, a presale, a DeFi pitch — and "that each fell apart" lands only at the very end. On first pass a reader has already filed DAGLabs and the testnet as things that "fell apart" too, which is wrong (DAGLabs happened; the testnet shipped). Confirmed at 390px: the five-item list and the "fell apart" clause land on different visual lines, which makes the misreading more likely, not less, since the eye has fully committed to the first three items as one flat list before the qualifier appears.

**Rewrite:**
> It was what was left after research into faster proof-of-work ordering ran through DAGLabs and an April 2021 testnet, then through a hardware plan, a presale, and a DeFi pitch, each of which fell apart.

---

## 3. `kaspa-mining.html` — emission-schedule demo, sentence appears to contradict itself

> "Total supply issued before today is a measured figure, not a guess: it's read live from the network. Total supply issued at any point before today that this page's slider lets you visit, and every point after today, is this page's own model of the schedule above, scaled to land on that live reading at today's mark."

Read aloud, sentence one says "before today = measured." Sentence two says "before today = this page's own model." Same phrase, opposite claim, four words apart. The actual distinction — sentence one means *today's own total*, sentence two means *every other day the slider can visit* — never gets stated; the reader has to reverse-engineer it.

**Rewrite:**
> Today's own total supply is a measured figure, read live from the network. Every other point the slider can visit — a past date or a future one — is this page's own model of the schedule above, scaled to match that live reading. Treat past points as close estimates of the real historical curve and future points as pure projection, since nothing has mined those blocks yet.

---

## 4. `why-kaspa-matters.html` — pentagon diagram, one node breaks the labeling pattern

The five-node "pick your constraint" diagram pairs a bold word with a small second word:

> Speed / feedback · Security / cost · **Many verifiers / decentralization** · Privacy / hidden data · Usability / recovery

Four of the five follow one pattern: bold = the trait, small word = a one-word consequence of pushing on it. The third node breaks it: the bold word is a plain-English gloss ("Many verifiers") and the small word is just the term it's glossing ("decentralization") — not a consequence at all. A reader scanning the five nodes in order hits a pattern break exactly where the site is trying hardest to be plain-language, and has no consequence-word to read for that one axis.

**Rewrite:** give decentralization a real consequence word to match the other four, e.g. **Many verifiers / friction** (matching the cost this axis is shown to have in the table beneath: "Harder upgrades, worse UX, slower agreement, more on you").

---

## 5. `what-is-kaspa.html` — collision simulator, stacked descriptions of "500 ms"

> "No published measurement of real Kaspa block propagation exists to cite, so 500 ms is a representative estimate, the midpoint of this slider's own range, not a measured figure; real propagation varies with peer distance and network conditions."

Three noun phrases stack back to back with no connectors — "a representative estimate," "the midpoint of this slider's own range," "not a measured figure" — all standing in apposition to "500 ms." It parses on a second pass, not a first.

**Rewrite:**
> No published measurement of real Kaspa block propagation exists, so 500 ms is a stand-in: the midpoint of this slider's own range, not a measured figure. Real propagation varies with peer distance and network conditions.

---

## 6. `what-is-kaspa.html` — "virtual block" explainer, clause pile-up at the sentence end

> "Among those tips, the one with the most already-counted blocks behind it becomes the virtual selected parent, better known as the sink, the same rule an ordinary block uses to pick its own selected parent, just applied one level up, to the view itself rather than to a mined block."

Five clauses deep by the end of the sentence, with two of them ("the same rule...", "just applied one level up...") floating without a verb tying them back to the subject cleanly.

**Rewrite:**
> Among those tips, the one with the most already-counted blocks behind it becomes the virtual selected parent, better known as the sink. It's the same rule an ordinary block uses to pick its own selected parent, just applied one level up: to the node's whole view, not to a single mined block.

---

## 7. `kaspa-mining.html` — cycle section, garden-path opening clause

> "Kaspa compressed several discovery phases that took Bitcoin years into one short window: fair launch, fast emissions, GPU mining..."

First read: "discovery phases that took Bitcoin years into one short window" parses as one unit before the reader realizes "into one short window" actually attaches to "compressed," not to "took." That's a rereread on a plain declarative sentence.

**Rewrite:**
> Kaspa compressed into one short window several discovery phases that took Bitcoin years: fair launch, fast emissions, GPU mining, an ASIC transition, exchange discovery, and price discovery all landed close together, followed by a large mining buildout.

---

## 8. `kips.html` — KCC-0020 section, three defects folded into one subject

> "A token issued against KCC-0020 today inherits three known defects: a permanent supply-split consequence its co-authors partly defend and partly call a wrong pattern still needing a spec fix, one production deployment that admits partial conformance, and a launchpad already on its fourth incompatible template."

The sentence promises "three" and then buries them in one continuous run, the first item alone carrying its own internal clause ("its co-authors partly defend and partly call...") before the list continuation arrives. Reads as one long defect, not three.

**Rewrite:**
> A token issued against KCC-0020 today inherits three known defects. First, a permanent supply-split bug: co-authors defend part of it as intended and call the rest a wrong pattern that still needs a spec fix. Second, the one production deployment admits it's only partially conforming. Third, one launchpad is already on its fourth incompatible template.

---

## 9. `build-on-kaspa.html` — closing line of the "order of work" section, unclear trade

> "A validity proof big enough to be worth submitting trades block size against the standard-fee floor that keeps spam costly."

This is one of the last substantive sentences on the page. "Trades X against Y" with both X and Y as heavy noun phrases doesn't resolve into a clear claim even on a second read — it's unclear whether a bigger proof costs more, is blocked by the floor, or something else.

**Rewrite:**
> A validity proof only clears the standard-fee floor once it's large enough to matter — and that same size is what the fee floor exists to tax, since a floor priced in bytes and compute is what keeps spam costly.

(No em dash allowed elsewhere on the site; if that's a hard rule here too, use: "A validity proof only clears the standard-fee floor once it's large enough to matter. That same size is what the fee floor exists to tax, since a floor priced in bytes and compute is what keeps spam costly.")

---

## 10. `utxo-vs-accounts.html` — Toccata paragraph, run-on lead sentence

> "**What that permits between two apps, and the block versus transaction line.** Two apps built apart can still compose today, but only by both being spent and remade inside the same spend, built by whoever assembles it: Argent's Inter-Covenant Communication is just that pattern, one app's actor allowing or watching another's in one atomic spend, and it works because the two apps' state sits in the readable inputs and outputs of that one spend."

One 70-word sentence carrying the paragraph's whole claim, with a bolded lead-in that itself joins two different topics with "and." Needs a second pass to hold onto the subject through to the end.

**Rewrite:**
> **What composition permits, and why the block doesn't matter.** Two apps built apart can compose today, but only inside a single spend that remakes both of them at once. Argent's Inter-Covenant Communication works this way: one app's actor allows or watches another's, and it works because both apps' state sits in the readable inputs and outputs of that one spend.

---

## 11. `kaspa-mining.html` — snapshot section, backward-order clause

> "Hash rate can fall while the network sits far above where it stood a year prior."

"Where it stood a year prior" inverts the natural order (expect "compared to a year ago," not a spatial "where"). Minor but it's the second sentence under the page's main snapshot panel, so it's read by nearly everyone who opens the page.

**Rewrite:**
> Hash rate can fall and still sit far above where it was a year ago.

---

## 12. `kaspa-origin-story.html` — launch section, double-negative clause

> "Mining made the whole supply, though no premine did not mean equal access to early mining."

"No premine did not mean" doubles back on itself; grammatically legal, awkward aloud.

**Rewrite:**
> Mining made the whole supply. But a clean launch didn't mean equal access to early mining.

---

## Not flagged, checked and cleared

- The definition-reveal tooltips (e.g. "blue work," "selected parent," "mergeset," "covenant") on `what-is-kaspa.html`, `kaspa-mining.html`, and elsewhere extract as run-on text but render correctly as hover/tap panels; the surrounding sentence reads fine with the tooltip removed. Not a finding.
- `kips.html`'s "DAGKnight's two speeds" / "No visible attack" widget — confirmed this is the parameterless demo flagged for a rebuild; skipped per instructions.
- `argent-explained.html` read clean overall; one minor ambiguous pronoun ("the same page" in the Silverscript-recommendation paragraph) noted but below the bar for inclusion here.
