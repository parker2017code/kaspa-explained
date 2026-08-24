# Misread report

Adversarial read of kaspaexplained.com after the eighteen-demo merge. Read live at kaspaexplained.com (confirmed `location.href` before each capture) and against the checked-out files, at 1280 and 390, light and dark where relevant. Two readings held simultaneously per page: READER ONE, a newcomer with zero crypto vocabulary who does not get to use outside knowledge to fill a gap; READER TWO, a hostile skeptic hunting for an unlabeled model, a cherry-picked number, or a claim that outruns its source.

Pages read closely: `status.html`, `crypto-from-scratch.html`, `kaspa-origin-story.html`, `start-here.html`, `what-is-kaspa.html`, `why-kaspa-matters.html`, `kaspa-mining.html`, `utxo-vs-accounts.html`, `kips.html` (skipped the parameterless/DAGKnight demo per the coordinator's note that it's mid-rebuild), `build-on-kaspa.html`, `argent-explained.html`. Confirmed but not closely read: `sources.html`, `toccata-explained.html` (see finding 1), `skeptical-case.html`, `demos/index.html`. Did not reach: `kaspa-covenants-explained.html`, `kaspa-vprogs-explained.html`, `kaspa-tps-explained.html`, `overview.html`, `where-kaspa-fits.html`, `analyze-any-coin.html`, and the remaining single-topic pages outside the demo-merge target list.

Findings are ranked by how badly the misreading matters, not by page order.

---

## 1. `toccata-explained.html` no longer explains Toccata; it redirects instantly into a developer demo, with no on-ramp

The URL a reader is most likely to guess or follow for "what is Toccata" now serves a bare stub with a zero-second meta refresh (`<meta http-equiv="refresh" content="0;url=/build-on-kaspa#covenant-breaker-demo">`). Its entire visible body:

> "Toccata is not a separate upgrade to explain anymore, it's just how Kaspa works now. Covenants, proof checks, and what's still ahead now live on Build on Kaspa and What is Kaspa."

**READER ONE** never sees this sentence render before the redirect fires, and even if they did, "it's just how Kaspa works now" presumes they already know what Toccata is — the one thing the old page's job was to establish. They land mid-scroll in `build-on-kaspa#covenant-breaker-demo`, a builder-audience vault-attack game, with no beginner framing before it and no path back to a plain "Toccata is the June 2026 hard fork that added X" sentence anywhere in the handoff.

**READER TWO** reads "it's not a separate upgrade to explain anymore" as the site quietly dropping a topic it used to give a full page to, right as that page disappears behind an instant redirect — exactly the kind of retitle-and-bury move a skeptic is primed to catch. This is also a status-language risk in its own right: collapsing "Toccata" into "just how Kaspa works now" blurs the live/roadmap line the rest of the site is careful to keep (Toccata is live; DAGKnight and vProgs, named two sentences later on `build-on-kaspa`, are not), and this stub is the one place that distinction gets no room to be made.

---

## 2. The fair-launch demo's headline stat quietly defines away the founders' own company

On `kaspa-origin-story.html`, the fair-launch chart's bold callout reads:

> "Kaspa: 0%. No founder, company, or foundation has ever held a share."

That line sits directly under the chart as the takeaway. The caveat that actually qualifies it is two UI layers away, inside the "i" info panel on the fade-speed control:

> "Tracks founders, company, and foundation shares only. DAGLabs itself mined an estimated 2.5–3% of supply after launch, the same way anyone with hardware could: full story below."

**READER TWO**: DAGLabs is not an unrelated third party — it is the company Kaspa's own co-founders started and ran through the pre-mainnet period, per the same page's earlier text ("DAGLabs was co-founded by Yonatan Sompolinsky and Guy Corem"). A stat headlined "no founder, company, or foundation has ever held a share" that turns out to depend on a technical definition of "company" narrow enough to exclude the founders' own company's post-launch mining is precisely the cherry-pick a hostile reader is trained to look for. The 2.5–3% figure is disclosed on the same page, sourced, and not hidden — but it is not attached to the bold claim it qualifies; a reader who reads the callout and moves on gets the flattering version.

---

## 3. `crypto-from-scratch.html` hands off to Kaspa with four undefined terms in one sentence, right at the seam

The page's last paragraph before the "Bridge to Kaspa" section, and its last sentence overall:

> "Its blockDAG, UTXO model, mass rules, and covenants are its answers to ordering, double-spends, state cost, and finality."

**READER ONE**: this page's entire job, per its own framing, is to build up crypto concepts "from scratch." `blockDAG` gets one earlier mention with a one-clause gloss; `UTXO`, `mass rules`, and `covenants` get none on this page at all — no tooltip, no link text that previews the definition, nothing. This is the exact sentence a beginner reads last before clicking through to a Kaspa-specific page, and it's the densest, least-explained sentence on the page. It reads as a checklist of vocabulary the next page will assume already lives in the reader's head.

---

## 4. `what-is-kaspa.html`'s "BEGINNER ANSWER" still needs two reads on the core sentence, unchanged from before the merge

> "The security parameter k caps how many blue blocks may sit in any blue block's anticone, derived from block rate and expected network delay, so a faster network needs a larger k for the same safety margin."

**READER ONE**: `blue blocks` and `anticone` are both used here, and both are only defined through `term-def` tooltip spans (`role="button" tabindex="0"`) that render nothing inline — a linear read, or a mobile reader who never discovers the tap affordance, sees a sentence defining "anticone" using "blue," a term from two paragraphs earlier that itself required a tap to unpack. This is the identical failure mode the pre-merge cold read logged against this same page ("uses 'blue set,' 'blue work,' 'selected parent,' 'mergeset,' 'anticone'... each defined in the same sentence it's first used, sometimes using another undefined term to do it"). The merge added demos to this page; it did not touch this paragraph, and the underlying problem is still live on the page carrying the site's beginner label.

---

## 5. `why-kaspa-matters.html`: a claim favorable to Kaspa's own security model is stated before it's hedged

> "It likely understates Kaspa's real security, since a naive fast chain would waste a lot of honest work to collisions that GHOSTDAG does not waste. It may also understate how GHOSTDAG's bounded tolerance for parallel blocks affects very recent ordering. Net effect not established with confidence either way."

**READER TWO**: the concrete, directional claim ("likely understates Kaspa's real security") comes first and reads as the finding; "net effect not established with confidence either way" comes last and reads as the disclaimer. A skeptical reader remembers the first sentence, not the walk-back — especially because the first sentence is the one that flatters the subject and the last is the one that retracts it. The order argues the site's case before it declines to argue it.

---

## 6. `why-kaspa-matters.html`'s "neutral checklist" reaches a confident, uncited verdict about its own subject

The page frames a ten-question checklist as something to "check any coin, including this one," then immediately delivers:

> "KAS clears the token-necessity question more easily than most app tokens do: it is the asset a PoW UTXO blockDAG network tracks, charges fees in, and pays out as the mining reward."

**READER TWO**: "more easily than most app tokens do" is a comparative claim against an unnamed, unsourced set of other tokens, delivered in the same declarative voice as the page's sourced protocol facts, inside a section whose entire pitch is "apply this neutrally, including to us." A hostile reader will note that the neutral framework is not actually applied neutrally here — the site grades its own answer before the reader gets to.

---

## 7. `kaspa-mining.html` gives an anonymous X account the same evidentiary weight as sourced protocol data, using unexplained jargon to do it

> "@Themooseisloos5 has framed the coin-and-ASIC cycle as a Carnot-engine model, four phases."

**READER ONE**: "Carnot-engine" (a thermodynamics term) is never explained, and the four-phase cycle that follows is presented with the same confident, structured, sourced tone as the DAA-score and consensus-code figures elsewhere on the same page. Nothing on the page distinguishes "a named developer's number, verified against `rusty-kaspa` source" from "a social-media handle's market framework" in how it's introduced — both get a name, a claim, and a table. **READER TWO** separately flags this as source-authority blur: an X handle's speculative framing sits one heading below Michael Sutton's sourced, named technical commentary, with no visual or textual cue that one is primary-source verification and the other is an outside opinion this site has chosen to feature.

---

## 8. `kaspa-mining.html`: unglossed hardware jargon on the solo-mining path

> "They need specialized KHeavyHash machines, electricity, facilities, cooling, firmware, logistics, and a pool or solo-mining path."

**READER ONE**: `KHeavyHash` is never defined anywhere on this page. A reader with no mining background has no way to know it's Kaspa's proof-of-work hash function rather than, say, a brand name or a typo.

---

## 9. `kaspa-mining.html` carries two differently-titled "attack cost" sections back to back, a visible seam from the merge

A prose subsection headed "Attack cost / Why the same friction concentrates ordinary mining too" (an essay about ASIC-market friction) is followed, after an unrelated "Judging the charts" block, by the actual embedded demo, titled "What an attack would cost." Both are about the same underlying idea (what it costs to attack the network) but read as two separate features on a skim, since one is essay framing under a bare "Attack cost" label and the other is the interactive demo under a different, longer title. This is exactly the kind of duplication the merge plan flagged as a risk elsewhere and is worth a pass to confirm it isn't leftover from the two `attack-cost` embed sites (`kaspa-mining`, `skeptical-case`) not fully reconciled.

---

## 10. `kaspa-mining.html` snapshot pairs current price against an all-time high right under a disclaimer that doesn't cover it

> "Checked August 22, 2026: Toccata activated at DAA score 474,165,565; Rusty Kaspa v2.0.1 is the release. Not a price call." — immediately followed by the Snapshot panel: "CoinGecko: $0.02926 per KAS on August 22, 2026, up from $0.0269 on August 8. Coinbase all-time high: $0.2075."

**READER TWO**: "Not a price call" is textually attached to the Toccata-activation sentence above it, not to the price-and-ATH pairing that follows. Putting the current price next to the all-time high (an implicit ~86% drawdown) is the single most price-suggestive juxtaposition on the page, and it sits just past the one sentence that disclaims price commentary, inviting a reader to assume the disclaimer covers it when it doesn't.

---

## Notes on what held up well

Several places the brief specifically warned about were checked and found already handled correctly, so they are not findings: the `10 BPS` figure is consistently labeled Live and attributed to Sutton's estimate rather than presented as an exact measurement (`status.html`); the fair-launch, DAA-converter, and supply-split demos all carry explicit "modeled, not measured" / "made-up token, the standard is real" language at the point of use; the covenant-breaker demo on `build-on-kaspa.html` explicitly separates Argent's illustrative (research, unreleased) notation from the live KIP-17/KIP-20 enforcement it describes; and DAGKnight, vProgs, and Toccata are consistently kept in their correct status lanes everywhere except finding 1 above. No page checked contained price-expectation or investment-advice-adjacent language beyond the ATH juxtaposition in finding 10. No page-level horizontal overflow was found at 390px on `what-is-kaspa.html` (the widest demo page checked); internal demo elements that exceed viewport width are contained in their own scroll regions.
