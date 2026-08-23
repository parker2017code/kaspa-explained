# Cold read: kaspaexplained.com

First-time-visitor pass, served locally on port 4210, own Chromium instance (`channel: 'chrome'`), 45 surfaces reached by clicking from the homepage (crawl started at `/`, followed only links found in the rendered DOM). Checked at 1280 and 390, light and dark. Today is August 23, 2026.

I do not use crypto/Kaspa background to fill gaps. If a page reads clearly to me only because I already knew the concept, I say so.

## The ten worst moments

1. **`/demos/ghostdag-playground`, on load, no scrolling.** The site's own top-ranked demo ("Ranked by how much each one matters, most first") opens with a breadcrumb reading "...ERACTIVE · BACK TO WHAT IS KASPA" and the page's own H1 "GHOSTDAG playground" rendering directly underneath the fixed site header, overlapping it. Both are legible only in fragments. This is the literal first thing a visitor who follows the site's own recommendation sees. Confirmed live, not a screenshot-stitching artifact (checked at natural viewport size, not full-page).
2. **`/kips`, clicking "DAGKnight."** The KIP/KCC tracker has a link with visible text "DAGKnight" pointing to an internal path `/dagknight`, which 404s to "Page Not Found." A visitor curious about the one research item everyone asks about hits a dead page.
3. **`/chain-comparer`, after expanding "Show all 17" and "What each chain claims" and scrolling.** A second full header (logo, nav, "Light" button) renders stacked on top of the page content at a specific scroll depth, overlapping row data: "Polkadot" bleeds into "Live now / Risks / Build / Demos," and "Group to run yourself" is cut off behind the duplicate bar. Confirmed by manual scroll, not full-page capture.
4. **`/status`, the whole page.** Full-page screenshot measures roughly 11,400px tall at 1280 wide, around 15 screens of stacked tables, legends, and FAQ with no visible jump nav until you're already deep in it. This is reached from the second nav item ("Live now"). I would not have read past the fourth table on a first visit.
5. **`/status`, table row "SUTTON'S NUMBERS, AND THE CLAIM THAT OVERSHOOTS THEM."** A person's surname, capitalized, dropped into a data table with zero introduction anywhere on the page or on any page a visitor would have seen first. Who Sutton is only surfaces on a completely different page (`/sources`), buried in a paragraph about a Discourse forum: "core developer Michael Sutton." A first-time reader hitting the status table has no idea who this is.
6. **`/what-is-kaspa`, the page literally labeled "BEGINNER ANSWER."** Within a few paragraphs it uses "blue set," "blue work," "selected parent," "mergeset," "anticone," "Crescendo-era," and "Silverscript" is used elsewhere on the same info architecture without ever being defined on this page. This is supposed to be the on-ramp; it reads like a protocol spec.
7. **`/demos/argent-pipeline` ("One line, three layers"), the demo's own punchline.** The premise is watching one line of code go from Argent source to Silverscript to Kaspa Script. The third and most interesting layer is labeled "not published" and described only in prose ("The .sil build's JSON artifact records the result as a byte array, not as readable opcode text"). The demo sets up a payoff it does not deliver — the compiled bytecode itself is never shown.
8. **`/model-picker` ("Compare AI models").** A full LLM cost/quality comparison tool (Claude Opus 5, GPT-5.6, Gemini 3.1, and so on) sits in the primary demo list and in the homepage's "TRY IT" section. Nothing on the page itself explains what this has to do with Kaspa. I read the whole page looking for the connection and never found one stated in view.
9. **`/chain-comparer`, default view.** The site's own comparison tool, under default weights ("Paying someone"), does not show Kaspa in the top 3 — you have to click "Show all 17" to find it at rank 12 of 17, score 46, with its own callout reading "0.9 TPS measured, 40 developers, no custody, no ETF, and no major wallet" and "100 ms shows up · 12.0 h settles." This is defensible editorially (the site says "Kaspa gets no special treatment") but it means the coin the site exists to explain is invisible in its own flagship comparison tool unless you dig.
10. **`/build-on-kaspa`, immediately after the nav click.** "Build" in the main nav goes straight into `docker pull kaspanet/rusty-kaspad:latest`, `cargo run --release --bin kaspad`, and curl commands with `x-api-key` headers, with no fork in the road for "I don't know what a node is yet." A non-developer clicking the fourth nav item lands in a terminal.

## Page by page, in the order I met them

**`/` (home).** Ten seconds: I know this is a Kaspa explainer with an editorial, not-hype stance ("Independent Kaspa explainer... Not investment advice"). What makes me want to leave: the tagline itself uses GHOSTDAG unexplained ("GHOSTDAG orders every honest block into one history the whole network agrees on"), and immediately below it "Toccata is active / Activated at DAA score 474,165,565: L1 covenants, ZK verification, sequencing commitments" stacks four unexplained terms in one line, above the fold, before I've read a single defined term. Nav is five items (What is Kaspa / Live now / Risks / Build / Demos) plus a theme toggle — clean. The inline collision-sim widget ("Watch a blockDAG keep what a chain would drop") is a nice touch and renders fine on mobile. Live API numbers at the bottom (circulating supply, mined %, blocks stored, DAA score) with "i" info affordances is a good pattern I wish the rest of the site used. I know where to go next (Start Here is offered) and would click it.

**`/what-is-kaspa`.** See worst-moment #6. Read twice: "The security parameter k caps how many blue blocks may sit in any blue block's anticone, derived from block rate and expected network delay" — this sentence uses three terms (blue blocks, anticone, k) in a row, two of which were only just introduced a paragraph earlier and one of which (anticone) is defined in the same breath it's used, which is backwards. The GHOSTDAG interactive coloring section is genuinely good once you slow down for it, but it demands slowing down. Terms used before explained here: "Crescendo-era" (never defined on this page), "vProgs" (link only, no gloss), "covenant IDs" (used in the live-vs-next table, defined only by clicking through to Toccata Explained).

**`/status`.** See worst moments #4 and #5. This is a reference page pretending to be a status page you'd read start to finish. The FAQ at the bottom ("Is DAGKnight live? Is Toccata live?") is genuinely the clearest writing on the page and probably deserves to be much higher up.

**`/skeptical-case`.** The best-written page I read. Seven risks in plain sentences ("Block rewards decline over time. Unless fees and demand replace that revenue, miner income falls and so does the cost of attacking the network"), each with a collapsible "what would settle it." No jargon dump, no wasted words. This is the page I'd actually forward to a skeptical friend. Ends with a working "price the security budget" demo teaser.

**`/build-on-kaspa`.** See worst moment #10. Once past the shell commands, "What to build" is a reasonable menu, but the page never signals up front that it's a developer reference, not a builder's pitch deck — the nav label "Build" undersells how technical this gets in the first screen.

**`/demos` (hub).** Ten seconds: "Seventeen demos to push on instead of read" is a clear pitch. One line I read twice: it says "Seventeen demos" and lists sixteen. Not a big deal, but a first-time visitor who counts will notice the mismatch.

**`/sources`.** A wall of repo links, branch names, and PR references. This is a reference page, fine for that purpose, but it's the only place that ever explains who "Sutton" and "Hashdag" are (Michael Sutton, core developer; hashd.ag, a blog), and a visitor who met those names on `/status` would never think to look here for the gloss.

**`/start-here`.** Did not read in full; scanned. Positioned as the actual beginner path per its own framing and the homepage's pointer to it. Reasonable structure.

**`/toccata-explained`.** "What Toccata turned on" leads with six cards labeled KIP-17, KIP-20, KIP-16, KIP-21, vProgs, Based apps — card titles are bare KIP numbers with no gloss of what a KIP even is on this page (that's on `/status`, a different page). Console shows three `403` errors from `api.github.com` (rate-limited, unauthenticated) — a live commit/release count widget on this page silently fails to load; a visitor sees whatever the unstyled failure state is, never told the data didn't come through.

**`/demos/confirmation-risk`.** Clean, no header bug. "How long until a payment is safe" with a mining-power slider and a Bitcoin/Litecoin/Kaspa comparison ("Kaspa becomes safe: 400 ms" vs "Bitcoin: 40 min") is intuitive without needing prior knowledge — good demo.

**`/demos/emission-schedule`, `/demos/mass-calculator`.** Not deeply tested for interaction; text-scanned. No console errors.

**`/chain-comparer`.** See worst moments #3 and #9. The claims-vs-measured table (previously broken per the brief) now renders correctly with real numbers and no console errors — that fix holds. The header-overlap bug is new territory, not the same bug that was fixed.

**`/model-picker`.** See worst moment #8. Genuinely well-built as a standalone tool (a value-frontier scatter plot, a 4,000-simulation win-rate bar), just orphaned from the site's stated subject.

**`/crypto-from-scratch`, `/why-kaspa-matters`, `/kaspa-mining`, `/kips`.** Skimmed. `/kips` carries worst-moment #2 (the dead DAGKnight link) and is otherwise a straightforward status tracker.

**`/search`.** Says "Type a concept, an audience, or a status" but the results panel underneath just reads "Showing all pages" — I never saw it actually filter anything in a static read of the page; this may be JS-driven and untested live by me here, worth a follow-up interaction pass.

**`/about`.** Clear editorial policy, plain language, no jargon. Good page. Links to "The Instrument, by Moose," a 279-page third-party PDF hosted on the site with no stated relevance beyond "guest work" — legitimate curiosity but a strange thing to find on a Kaspa protocol explainer, and it's disclaimed clearly enough ("Not part of this site's checked claim set") that I don't count it as a problem, just a surprise.

**`/demos/collision-sim`, `/kaspa-origin-story`, `/demos/parameterless`, `/demos/shared-state`, `/demos/attack-cost`, `/demos/fair-launch`.** Text-scanned, no console errors, no visible breakage.

**`/argent-explained`.** Console shows GitHub API `403`s here too (same rate-limit pattern as `/toccata-explained`).

**`/demos/ghostdag-playground`.** See worst moment #1. Once past the header collision, the demo itself works: an "Advance time" button, a live-updating DAG graph, and a "Linear order" strip that highlights blocks as counted or locked out. Understandable without prior GHOSTDAG knowledge if you can get past the garbled header first.

**`/demos/utxo-vs-accounts`, `/demos/argent-pipeline`, `/demos/dag-time`, `/demos/fee-market`, `/demos/covenant-breaker`, `/demos/zk-boundary`, `/demos/node-cost`, `/demos/live-network`.** All render with no console errors. `/demos/covenant-breaker` is a strong demo: "This vault holds 10,000 KAS behind four rules. Get any of it to an address you control without satisfying all four" is a clear, game-like framing that needs no prior knowledge. `/demos/argent-pipeline` is the letdown described in worst moment #7.

**`/utxo-vs-accounts`.** Clean top of page, no header overlap, clear framing ("An account balance is one slot two spenders can fight over. A UTXO coin isn't").

**`/the-instrument`.** A one-screen pointer to the 279-page PDF mentioned above. Reachable only via `/about` or `/search`, not the main nav — fine for a curio, matches its low-priority placement.

**`/404`.** Reached both directly and via the dead `/dagknight` link. Reasonable fallback copy ("That page isn't in the guide. Use search, status, sources, or the beginner path").

## Redirect stubs (per the brief: glossary, claims checker, monthly digest)

`/glossary` redirects to `/what-is-kaspa`; `/kaspa-claims-checker` redirects to `/status`. Both work and neither is linked from anywhere I crawled — no dangling internal links point at the old URLs, so this looks cleanly done. Could not find a monthly-digest URL at all (`/digest`, `/monthly-digest`, `/kaspa-monthly-digest` all 404); if it's meant to be a live redirect stub it isn't reachable under any guessable path.

## Terms used before being explained (or never explained)

- **GHOSTDAG** — used in the homepage hero line before any definition exists on that page.
- **Sutton** — used bare on `/status`; the full name and role appear only on `/sources`.
- **Hashdag** — used as a proper noun/source name on `/status` ("Hashdag's name for Kaspa's core trade"); never explained as a person's blog/handle on that page.
- **Crescendo-era** — used repeatedly across `/what-is-kaspa`, `/status`, `/build-on-kaspa`; never defined on any of the pages that use it in my reading.
- **Silverscript** — named on `/what-is-kaspa` and `/status` as something Toccata shipped; not explained until `/argent-explained` or `/toccata-explained`, pages a reader isn't guaranteed to have visited first.
- **anticone, mergeset, blue set, blue work, selected parent** — introduced in rapid succession on the page labeled for beginners (`/what-is-kaspa`), each defined in the same sentence it's first used, sometimes using another undefined term to do it.
- **vProgs** — used as a bare term on the homepage and `/what-is-kaspa` with only a link, no inline gloss, despite being central to multiple pages' "what's not live yet" framing.
- **KIP / KCC** — used as bare numbers ("KIP-17," "KCC-0020") on `/toccata-explained` and `/build-on-kaspa` before their one clear definition, which lives on `/status`.
- **DAA score** — used without inline explanation on the homepage hero stat block (mitigated by an "i" info icon there) but bare again later on `/status` and `/what-is-kaspa`.
- **TN10 / TN12** — used constantly on `/sources` and `/build-on-kaspa` as if self-evident (testnet generation numbers); never spelled out as "Testnet-10" / "Testnet-12" on first use in my reading.
- **kas-smiths.org, kaspa.social, KASmedia** — three separate community sites named on `/sources` with light explanation there, but never mentioned or connected to anywhere else, so if you meet them on `/status` first you get nothing.

## Interaction notes

No demo I tested threw a console error. The claims-vs-measured table on `/chain-comparer` (previously broken per the brief) now renders with real data. The header-overlap bugs on `/demos/ghostdag-playground` and `/chain-comparer` are new findings, confirmed live (not screenshot-stitching artifacts), reproducible on a fresh, uncontended browser tab.

## What I did not get to

`/kaspa-mining`, `/kaspa-origin-story`, `/why-kaspa-matters`, `/crypto-from-scratch`, and most of the remaining demo pages were text-read and checked for console errors but not interacted with live (sliders dragged, buttons clicked through every state). `/search`'s actual filtering behavior was not exercised live. Mobile (390) was spot-checked on the homepage only; dark/light was spot-checked on the homepage only. A second pass focused on mobile layout across the demo pages and a full interaction pass on every slider/button would be the natural next step.
