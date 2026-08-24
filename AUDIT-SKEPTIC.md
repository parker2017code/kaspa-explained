# Skeptic audit, 2026-08-24

Read-only pass over the static HTML source (no server started, no port bound). Files inspected directly via grep/cat: index.html, status.html, kips.html, kaspa-mining.html, kaspa-origin-story.html, chain-comparer.html, utxo-vs-accounts.html, what-is-kaspa.html, why-kaspa-matters.html, skeptical-case.html, sources.html, crypto-from-scratch.html, and redirect targets for kaspa-vs-solana-builders.html, kaspa-vs-ethereum-apps.html, adoption-metrics.html, reality-check.html, demos/attack-cost.html, demos/fair-launch.html.

Note: three-page TPS inconsistency mentioned in the brief was not re-verified here (in hand elsewhere). A stray grep for `\d+ ?tps` outside chain-comparer.html and kaspa-tps-explained.html found nothing, so no additional instance of that shape turned up.

## Findings, ranked by how likely to make a knowledgeable reader stop trusting the site

None of the three disqualifying patterns the brief asked me to hunt for (over-claiming, status blurring on DAGKnight/Toccata/vProgs, buried weaknesses) turned up an instance worth flagging. What follows is what I found instead: things that are close to a problem but resolve on inspection, and the genuinely strong honesty signals, which the brief asked me to report too.

### 1. Minor: crypto-from-scratch.html states the fair-launch fact without the 2.5-3% caveat inline (low severity)

Page: `crypto-from-scratch.html`, line 216: "A fair launch removes the official allocation table, not the funding and early-miner questions a premine would have paid for. Kaspa mined its supply from zero," linking to `kaspa-origin-story.html#fair-launch-demo`.

An expert would note this sentence, read alone, doesn't carry the DAGLabs 2.5-3% figure itself. But the wording is already hedged ("not the funding and early-miner questions a premine would have paid for") rather than claiming zero insider mining outright, and the link target puts the 2.5-3% figure in the same paragraph as the 0% claim (see below). This is not the bury-two-clicks-down pattern described in the brief; it's a compressed teaser pointing at a page that already does it right. Low severity, arguably not a finding at all, but worth a name since it's adjacent to the pattern being hunted.

### 2. The specific instance flagged in the brief (0% founder share headline vs. 2.5-3% DAGLabs mining) is not buried on `kaspa-origin-story.html` as currently written

Page: `kaspa-origin-story.html`, `#fair-launch-demo`, lines 245-304.

The badge reads: "Kaspa: 0%. No founder, company, or foundation has ever held a share. DAGLabs, the founders' own company, mined an estimated 2.5-3% of supply after launch, the same way anyone with hardware could." Both sentences sit in the same paragraph, same viewport, no additional click. The table caption below it repeats the same pairing. If this is the page the brief's "two interface layers away" example pointed to, it reads as already fixed in the current working tree (note: this repo has uncommitted changes to this exact file per `git status`, so the fix may be mid-flight and not yet the version being graded). If the flagged instance is a different page or the old `demos/fair-launch.html` before its merge, I did not find it; that file is now only a redirect stub.

## What survived (the site is not just hedging everywhere; these are real disclosures in real places)

- **`kaspa-mining.html`, the fee-market demo (~line 1500):** section headline reads "Kaspa's blocks are nearly empty today. Load one with real traffic and watch what a full block does to fees and the subsidy gap." The actual numbers, sourced to `CLAIMS.yml`: $58,631/day subsidy vs. $4.86/day fee revenue, a ~12,054x gap. This is the exact weakness the brief said should be visible next to the strength being claimed (mining security), and it is — same section, same page, headline framing, not a footnote.

- **`chain-comparer.html`:** every one of the 20 chains, Kaspa included, carries an explicit `weak` field shown in the UI: Kaspa's reads "0.9 TPS measured, 40 developers, no custody, no ETF, and no major wallet." The dataset's `caveats` block is unusually self-critical: it documents and corrects its own prior errors (a Bitcoin/Polkadot block-time coincidence caught as a data-entry substitution and re-measured by hand), separates claimed vs. sustained vs. peak TPS for every chain including Kaspa, and states plainly that Kaspa's own 10 BPS is "a protocol constant, not a reading." It also refuses to score Kaspa's coded finality rule against other chains' informal confirmation conventions, and explicitly says an earlier version of the site made that exact mixing error and got corrected. This is the strongest anti-overclaiming evidence found in the audit.

- **`kaspa-mining.html`, attack-cost demo:** when a number can't be sourced, the page says so instead of guessing. `noRentNote`: "Not priceable because there is no verified rental market at attack scale... this page will not substitute a guessed number for it." Same pattern for the Litecoin buy-side ASIC price. No ROI/payback-period language anywhere on the mining page, which is the standard hype pattern this genre usually can't resist.

- **DAGKnight status labeling:** consistent across every page checked (chain-comparer.html, kips.html, status.html, what-is-kaspa.html, why-kaspa-matters.html, skeptical-case.html). Always "Status: Proposed," "research, no mainnet," or equivalent, never blurred into "coming soon" or implied-live language. `status.html` even runs a direct FAQ Q&A: "Is DAGKnight live? No."

- **vProgs status:** `utxo-vs-accounts.html` and `status.html` both state zero releases, zero tags, and note the repo's own README calls itself "early development / prototype phase." `status.html` line 477 goes further than most sites would bother to: it specifically flags that vProgs' tn10-flow example "runs the flow against a private testnet-10 fork node, separate from the public one" — the kind of nuance that's easy to let slide into "on testnet" and isn't here.

- **Toccata activation date:** consistently 30 June 2026 / DAA 474,165,565 across status.html, what-is-kaspa.html, kips.html — no drift found.

- **`status.html` line 395:** the site explicitly refuses to treat kaspa.org's own roadmap prose as a source "after it was caught describing Toccata as pre-mainnet eight weeks after mainnet activation." That's the site catching the project's own marketing site in an error and downgrading it as a source, the opposite direction most crypto explainer sites move in.

## Bottom line

On the specific three-part test (over-claiming, status blurring, buried weaknesses), this pass did not find a clean disqualifying hit. The closest candidate — the founder-share vs. DAGLabs-mining pairing — appears already resolved in the current file. The site's actual failure mode, if it has one, is not the genre-standard one: it under-claims and over-annotates to the point of listing its own past mistakes inline (the Bitcoin/Polkadot block-time bug, the finality-mixing error, the kaspa.org roadmap-prose distrust). A skeptic reader who came in expecting to be sold something instead finds a site more willing to say "we don't know" or "we got this wrong before" than most primary-source project pages are.
