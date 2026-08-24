# Demo copy audit

Scope: every visible word inside the inline demos on kaspa-mining.html (4), what-is-kaspa.html (4), kips.html (1 of 2 — parameterless is excluded, being rebuilt), utxo-vs-accounts.html (2), build-on-kaspa.html (2), why-kaspa-matters.html (1), argent-explained.html (1), kaspa-origin-story.html (2). 16 demos read in full from source. Method: full source read of every demo's markup and script-generated readout strings for all 16; live verification in a local browser (`python3 -m http.server 4430`, port confirmed unbound before use) for the four findings below, at both 390 and 1280 width and both themes where noted, with `data-theme` and `localStorage["kaspa-explained-theme"]` set directly and `getComputedStyle(document.body).backgroundColor` confirmed to change (`rgb(16,14,12)` dark vs `rgb(255,255,255)` light) and `location.href` confirmed before each read.

**Overall finding: this body of copy is not the unaudited backlog the brief expected.** Every demo already carries dated, sourced, "measured vs. modeled vs. protocol constant" labeling as a matter of house style, and the specific stranger-misread examples the owner has flagged before ("two speeds," "no visible attack underway") were searched for directly — both live only inside the parameterless demo on kips.html, which is out of scope because it's mid-rebuild. Four real defects survived the pass, below. No em dashes found in any demo copy.

---

## 1. Mass-calculator numbers never say their unit

**Demo:** what-is-kaspa.html, `#masscalc-demo` (inside the "Build a transaction and see which mass dimension gets charged" details block)

**Current text:** The intro reads "Kaspa doesn't charge by byte count alone. Every transaction is measured on three limits, compute, storage, and transient (proof data), and charged by whichever is largest, never the sum." The three readouts render as bare numbers against bare numbers, e.g. (verified live, covenant preset, dark, 390px): `5,660 / 500,000`, `30 / 500,000`, `1,200 / 1,000,000`. Nothing on the page — not the intro, not the row labels ("Compute mass," "Storage mass," "Transient mass"), not the numbers themselves — ever states what unit "mass" is in. A stranger sees "5,660 / 500,000" and cannot tell if that's bytes, grams, gas, or dollars. This is the exact "23 weeks with no stated whose" failure the brief opens with, just for a different unit.

**Why it matters:** this site already has the fix elsewhere. The fee-market demo on kaspa-mining.html defines it in one clause: "mass (Kaspa's measure of block space)." The mass-calculator demo is the one page whose entire subject is mass, and it's the one place that never says what mass is.

**Replacement text:**
- Intro paragraph, insert a defining clause: "Kaspa doesn't charge transactions by byte count. Every transaction earns a score on three limits, in the protocol's own mass units (not bytes, not KAS) — compute, storage, and transient (proof data) — and the block charges only the largest of the three, never their sum. Build one below and see which dimension binds."
- Each readout, append the unit so the number reads standalone: `5,660 mass units / 500,000 limit`, `30 mass units / 500,000 limit`, `1,200 mass units / 1,000,000 limit`. (Minimal version if space-constrained: add "mass units" once, after the row label, e.g. "Compute mass (units)".)

---

## 2. GHOSTDAG playground's "k = 3" control label is a bare symbol

**Demo:** what-is-kaspa.html, `#ghostdag-demo`, "Advanced: how forgiving the network is"

**Current text (verified live):** the slider's entire visible label is `k = 3`. The preceding paragraph explains the concept in plain language ("Every block can have some other blocks beside it that it never saw. This caps how many of those are still allowed to count.") but the control itself, which is what a skimming reader's eye actually lands on, carries only the bare protocol letter and a number. A reader who opens this collapsed section straight to the slider — which is exactly what "advanced" sections invite — has no plain-English anchor at the point of interaction.

**Replacement text:** `Uncounted neighbors allowed (k): 3` — keeps the protocol symbol for continuity with the site's other GHOSTDAG references, but puts the plain-English meaning first so the number is never read cold.

---

## 3. Collision-sim propagation-delay label drops its colon and reads as a run-on

**Demo:** what-is-kaspa.html, `#collision-demo`, secondary control

**Current text (verified live):** `How long a block takes to reach other miners 500 ms` — no colon or separator between the label and the value, unlike the primary control immediately above it ("How fast blocks are found: 10 a second"), which does have one. The two sibling controls should read as a matched pair; instead one reads as a clean label-then-value and the other reads as a single run-on sentence that happens to end in a number.

**Replacement text:** `How long a block takes to reach other miners: <b id="cs-delayVal">500 ms</b>` — add the colon to match the rate control directly above it.

---

## 4. Confirmation-risk's "too long" readout is a non-answer, and (as built) unreachable

**Demo:** why-kaspa-matters.html, `#confirmation-risk-demo`

**Current text (source):**
```
row.msg.textContent = 'would take an impractically long wait.';
row.wait.textContent = 'too long';
```
This is the exact non-answer pattern the brief calls out by name — a readout that refuses to answer the demo's own question ("how long do I need to wait for this to be safe") with a real number.

**Live verification:** driven at every reachable attacker-share value (slider is integer percent, 1–60) and all three risk-tolerance settings. This branch never fires through the UI: at 49% share / strict tolerance the wait is finite (Bitcoin 14 days, Kaspa 3 minutes); at 50%+ the code takes the separate "never becomes safe" branch instead (verified: setting the slider past 49 snaps to 50 and returns "never becomes safe at this attacker strength" / "waiting never helps" for all three chains). So today no visitor can actually see "too long" — it's dead code, not a live defect. But it is exactly the wording the owner has flagged twice before, it sits directly on this demo's own question, and it would become a live non-answer the moment anyone tightens `zMax` (currently 20,000,000 blocks) or exposes finer slider granularity. Fix now rather than wait for it to resurface.

**Replacement:** answer with the actual number the model already has at hand — the wait time at the `zMax` cutoff — instead of dismissing the question. Compute `zMax * c.blockTime` (available at the call site alongside `z`) and use it:
```
row.msg.textContent = 'would take longer than this model checks, over ' + fmtTime(zMax * c.blockTime) + '.';
row.wait.textContent = 'beyond ' + fmtTime(zMax * c.blockTime);
```
For example, if this branch were reachable for Bitcoin, it would read "would take longer than this model checks, over 380 years" instead of "would take an impractically long wait" / "too long."

---

## Not flagged: the owner's cited examples

`grep -n 'too long\|two speeds\|no visible attack\|confirm time'` across all eight host pages found "DAGKnight's two speeds" and "no visible attack" only inside `#parameterless-demo` on kips.html (lines 398, 420), which the brief explicitly excludes as mid-rebuild. Not reported here; worth re-running this same grep against the rebuilt version once it ships, since these are the owner's own recurring examples.

## Verification coverage note

Live-driven and theme/width-checked: the mass-calculator, ghostdag-playground, and collision-sim findings above (what-is-kaspa.html, 390px dark for the mass numbers, live label reads for the other two), and the confirmation-risk demo (why-kaspa-matters.html, share slider swept 1–60 at all three tolerances, both 390px/light and desktop/dark backgrounds confirmed distinct). The remaining twelve demos (kaspa-mining's emission-schedule/attack-cost/fee-market/node-cost; what-is-kaspa's live-network; kips's supply-split; utxo-vs-accounts's two; build-on-kaspa's two; argent-explained's one; kaspa-origin-story's two) were read in full from source, including every JS-generated readout string, but not separately driven through all four viewport/theme combinations in-browser — source reading found no defects matching this brief's categories in any of them, but a full interactive sweep of those twelve was not completed within this pass and could still surface something a static read misses, particularly in animated or multi-step states.
