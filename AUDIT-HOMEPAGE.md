# Homepage audit

Method: served the local working tree at `http://localhost:4520` (python3 `http.server`, killed after the audit), not the live site, since the homepage has uncommitted changes today. Checked 390, 768, 1280, both themes, by setting `localStorage["kaspa-explained-theme"]` directly and reloading (confirmed `data-theme` and computed `body` background differed: dark `rgb(16,14,12)`, light `rgb(255,255,255)`). `location.href` confirmed before each reading.

## Verdict

The homepage serves reading two well and reading one only through the hero. One section down, at "Toccata is active," it drops four undefined technical terms on a reader who was fine two paragraphs earlier, so it does not serve both readers in the same screen; it serves the skeptic at the newcomer's expense past the fold.

## Reading one: non-crypto-native visitor

**First five seconds.** The eyebrow ("Independent explainer"), h1 ("Kaspa, explained."), and lead sentence are legible. "Proof-of-work" and "GHOSTDAG" both carry inline tooltip definitions (`term-def` spans), and both render inline with the text at every width tested, not on their own line. A reader gets: miners spend computation, work happens in parallel instead of racing, and one rule sorts it into one history. That is a real five-second read.

**One obvious next thing, or several competing?** Several, and it is a real problem. Before the fold ends the reader has already seen 6 cards in the hero grid, then 4 more cards in the "Toccata is active" section, then 3 demo cards plus 3 buttons, then a live-data panel, then 3 more "Keep reading" cards: 19 distinct link targets on one page. There is one soft signal toward a single path — "New to crypto? Start Here." — but it sits as one line of body text below a 6-card grid, easy to miss, competing with everything else already on screen.

**Every word a reader would not have understood.** In the hero itself: none flagged, both jargon terms are defined inline. Past the hero, undefined and untooltipped:
- "Toccata" (h2 "Toccata is active" — never says what Toccata is)
- "DAA score" (this instance, not the live-panel one below, has no tooltip)
- "L1 covenants," "ZK verification," "sequencing commitments" — three technical terms in one sentence, no definitions, no links that explain them before use
- "vProgs" (Build card blurb: "Payments, Toccata, vProgs.")
- Card blurb "PoW, blockDAG, GHOSTDAG, KAS." (Network overview card) is an acronym string with no expansion

This is a real drop-off point. A reader who survived the hero hits "Activated at DAA score 474,165,565: L1 covenants, ZK verification, sequencing commitments" as the very next thing on the page and has no foothold.

**After one click, learned something explicable?** Yes, if the click is the featured demo link ("Drive it on What is Kaspa" → `/what-is-kaspa#collision-demo`). The section framing just above the demo is plain language: "A block takes time to reach the rest of the world. When blocks outrun that propagation, miners build on stale information and produce competing blocks that a single chain can only keep one of... Kaspa takes the other road instead: keep the fast blocks and fix the ordering." A reader could restate that. The demo widget itself (Poisson process, λ, dead-time-counter formula) is dense, but it sits behind the plain-language framing and a collapsed "How this works" details block, so a reader isn't forced through the math to get the idea.

## Reading two: crypto-native skeptic

**Wastes time on what I already know?** No. The hero's two definitions are one sentence each via hover/tap tooltip, not paragraphs, and everything past the hero assumes the reader already knows the vocabulary — arguably too much so, per reading one above.

**Overclaims, unsupported numbers, cherry-picked comparisons?** None found on the homepage itself. No superlatives ("fastest," "best"), no comparison chart rigged to a Kaspa win — comparisons are deferred to other pages, not asserted here. Every number carries its basis:
- Toccata activation figure links to `/status` for "the activation record."
- Live panel figures (circulating supply, mined %, blocks stored, DAA score) are fetched live from `api.kaspa.org` and dated ("Last checked Aug 24, 2026, 12:17 PM. API reads are best-effort").
- The "Blocks stored by one node" tile's own tooltip volunteers a limitation against itself: "Not a network total: the API load-balances across nodes with different pruning states, so this is whichever backend answered." That is a site undercutting its own number rather than dressing it up — a genuine honesty signal, unprompted.

**One click to real substance?** Yes. The collision-demo destination is the strongest evidence on the page: it states a formula (p = 1 − e^(−λd)), derives a second one from a named identity (dead-time-counter), and explicitly labels the derived one "Inferred... matching this simulator's own discard rule rather than quoted from a source." It also states plainly that no published measurement of real Kaspa block propagation exists, rather than inventing or citing a number that isn't there. That is not typical coin-site copy.

**Reason to believe the site is honest?** Yes, on the strength of the two items above (the self-undercutting tooltip, the labeled-inferred formula with a stated gap in the evidence). A skeptic lands somewhere with real math, sourced code references (`NETWORK_DELAY_BOUND` in rusty-kaspa), and a site willing to say "no citation exists for this" instead of papering over it.

## Checklist (owner's prior findings, re-verified against today's state)

- **Every link gives a reason to click, not just a title.** True everywhere checked: hero-signal-grid, Toccata section, demo cards, "Keep reading" cards all pair a bold title with a one-line description (`<small>` or `<p>`). No bare demo titles found on the homepage.
- **No stale counts.** No demo count is stated anywhere on the homepage (no "13 demos" or similar string). The "All demos" button makes no claim to verify. `/demos` (first click from that button) also states no count. Not applicable as a defect today.
- **Info circles inline with their text, not on their own line.** Confirmed at 390/768/1280, both themes: each `info-affordance` button sits at the right edge of its metric's label row, same line, in the live-data panel screenshots.
- **No blue selection box over the whole hero on drag.** Tested a diagonal drag across the hero at 1280 (light theme): it triggered the GHOSTDAG tooltip (expected hover/focus behavior) and produced only normal per-line text selection, no oversized overlay box. No `user-select` or hero-covering absolutely-positioned overlay exists in `styles.css`; the old iframe-era overlay is gone along with the iframe. This defect reads as fixed.
- **No dead space around controls.** No excess padding observed around the live-panel metrics, demo cards, or hero grid at any tested width; grids reflow to single/double column at 390/768 without leftover gaps.
- **Footer carries real navigation, compressed by typography, not by deletion.** Confirmed: 4 link groups (Learn, Verify, Build, Tools), 16 links total, all present at 390 in a 2-column layout with small type; nothing removed relative to the full desktop footer.

## Files referenced

- `/Users/parkerschmidt/Documents/repos/kaspa-explained/index.html` (homepage, lines 96–241 for body content)
- `/Users/parkerschmidt/Documents/repos/kaspa-explained/what-is-kaspa.html` (first-click destination; framing text lines 121–130, demo markup from line 363)
- `/Users/parkerschmidt/Documents/repos/kaspa-explained/styles.css` (hero, info-affordance, footer rules checked; no `user-select` or selection-related rules found)
