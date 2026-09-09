# Crypto product visual references for Kaspa Studio

Reviewed September 9, 2026. This is the complementary product half of a curated ten-project design reference set, not an objective ranking, a market-cap list, or a claim that these are the ten best designs. Selection covers yield trading, lending, a multi-product trading app, a consumer wallet, and a currently active developer ecosystem. Uniswap was also attempted, with Pendle substituted after its access failure. The existing Kaspa Explained website was not used as a visual reference.

## Evidence and scope

Actual Chromium screenshots were captured and opened with the image-viewing tool. Desktop viewport: 1440 × 1000. Jupiter mobile: 390 × 844, emulated touch viewport. These are rendered observations, not conclusions from HTML alone. Product text was used to verify official destinations and help locate relevant sections. Public logged-out states only; no wallet connections, signed messages, transactions, installations, or authentication bypasses.

All screenshot paths below are relative to the repository root under `.cache/studio-design-research/`. They are local research evidence, not app assets. The capture logs are `product-capture-log.json` and `product-capture-followup.json` in that folder. Images and logs remain local cache files.

## Why these products are relevant now

- **Uniswap:** [DefiLlama's protocol page](https://defillama.com/protocol/uniswap) reported $63.058 billion in 30-day DEX volume during this review. The [official homepage](https://uniswap.org/) redirected to [the app](https://app.uniswap.org/). It was selected for a widely used swap workflow, but its product UI could not be visually reviewed here.
- **Pendle:** [DefiLlama](https://defillama.com/protocol/pendle) reported $1.253 billion TVL. The [official homepage](https://www.pendle.finance/) linked directly to [its V2 app](https://app.pendle.finance/), which rendered the markets page. It supplies an active specialist financial-tool reference.
- **Aave:** [DefiLlama](https://defillama.com/protocol/aave) reported $18.352 billion TVL. The [official homepage](https://aave.com/) linked to [Aave Pro](https://pro.aave.com/) and prominently presented its savings app. Both the current linked app and [the older app](https://app.aave.com/) were rendered.
- **Jupiter:** [DefiLlama](https://defillama.com/protocol/jupiter) reported $14.709 billion in 30-day DEX aggregator volume. [Jupiter](https://jup.ag/) now presents several trading, earning, and portfolio products within one application. It adds a concrete task-heavy app reference.
- **Phantom:** [The official site](https://phantom.com/) states a community of over 20 million users and presents wallet, trading, payment, and prediction products. That user figure is a first-party claim, not independently audited here. It adds consumer-facing wallet presentation absent from a chain-only list.
- **Monad:** [The official homepage](https://www.monad.xyz/) displayed an active September–October 2026 developer hackathon and linked to [its developer hub](https://www.monad.xyz/developers). Current developer activity and an accessible builder journey justify inclusion; its ecosystem metrics are first-party claims, not a comparative ranking.

The monetary figures are dated retrieval snapshots used to establish relevance, not investment analysis. Their definitions differ and should not be compared as a single score.

## Rendered findings

### Aave: separate brand presentation from operating density

Viewed: `aave-home-desktop.png`, `aave-app-desktop.png`, `aave-pro-desktop.png`.

The homepage has a very large centered heading, a light lavender field, two clear rounded actions, and overlapping phone screens that make the product tangible. The older app uses a dark summary band over a spacious white asset table. Current Aave Pro instead has a restrained near-black shell, a left navigation rail, prominent section headings, pill filters, hairline separators, and a compact table. Cards have modest curvature; nothing needs a heavy outline to read as a tool. A cookie panel obscures part of the lower table in the captured logged-out view.

**Adopt:** stable navigation, a broad working area, aligned table information, restrained surface contrast, and a visible next action. **Avoid:** copying the homepage's marketing-scale hero into the editor, or inheriting the app's dim secondary text. Visible chart cards imply inspectable data, but chart interaction was not tested.

### Jupiter: one dominant task within a broad tool suite

Viewed: `jupiter-desktop.png`, `jupiter-limit-desktop.png`, `jupiter-mobile.png`.

The dark interface groups its left navigation into Trade, Earn, and Manage. A roughly 510-pixel central form owns the main action; filled input wells, token pills, and a bright lime full-width button distinguish controls without thick strokes. Clicking Limit changed the form in place: a short explanation appeared above the amount and target-price controls, with expiry choices below. The wallet remained disconnected. On mobile, the same form expands to the available width, the sidebar becomes a menu, and primary destinations appear in bottom navigation.

**Adopt:** in-place mode changes, explanations beside the affected controls, a dominant action, and mobile recomposition. **Avoid:** small muted supporting text, distracting promotional panels, pervasive market tickers, and number precision that exceeds the immediate decision. The dotted background is decorative, not a required workbench convention.

### Phantom: readable scale and tangible action outcomes

Viewed: `phantom-desktop.png`, `phantom-product-desktop.png`, `phantom-wallet-imagery-desktop.png`.

The homepage uses a pale lavender canvas, dark purple text, a broad floating pill navigation, and a large rounded media hero. Its heading is expansive and centered, with one large download action. Further down, large feature illustrations show a phone amount, a purchase confirmation, and a claimed payout. The feature panels have distinct colors and oversized content rather than identical small card summaries. These are promotional product images, not evidence of a live wallet transaction. The intermediate section screenshot shows unusually generous empty space around its large heading.

**Adopt:** a clearly legible amount/result, unmistakable completed-action feedback, and meaningful visual demonstration. **Avoid:** copying the mascot, brand colors, decorative trading graphics, or marketing-page vertical space into an active Studio session. A real run receipt should express actual state, never illustrative success.

### Monad: a builder page with useful technical anchors

Viewed: `monad-desktop.png`, `monad-build-desktop.png`, `monad-build-quickstart-desktop.png`.

The homepage uses fine structural lines, a lightly gridded white canvas, an asymmetric text-and-feature split, and purple accent controls. The developer hub has a large simple title, a short explanation, and direct start/documentation actions. A later quickstart puts network specifications beside deployment guides, including a visible testnet/mainnet switch and named tool rows. The screenshot's cookie overlay partly obscures network values, so only unobscured structure is accepted as visual evidence. The interface mixes rectangular technical rows with softly rounded media and buttons.

**Adopt:** explicit network context, named deployment paths, paired configuration and next steps, and a clear typographic hierarchy. **Avoid:** turning grid decoration into dominant borders, copying uppercase tiny navigation, or placing event promotion above the working surface in Studio. No network switch, wallet-add action, or deployment was executed.

### Pendle: a dense tool can retain clear rows and hierarchy

Viewed: `pendle-home-desktop.png`, `pendle-app-desktop.png`.

The homepage resolved to `https://www.pendle.finance/`; the linked app resolved to `https://app.pendle.finance/trade/markets`. The homepage has a sparse black composition, large central type, outlined app-entry buttons, and a continuous wireframe sphere visual. The app uses a navy canvas, a compact top navigation, a substantial page title, filter controls, and spacious horizontally aligned market rows. Teal numbers emphasize selected financial values. Rows have modest rounding, clear gaps, and consistent column alignment. A yellow onboarding tooltip calls attention to column customization, but competes with the data. The screenshot shows expandable row chevrons; expansion was not exercised.

**Adopt:** strong row rhythm, clear column alignment, compact global navigation, and restrained emphasis inside a dark workspace. **Avoid:** ambient edge gradients, excessive bright metrics, unsolicited floating tips, decorative network imagery inside the operating area, or the horizontally crowded promotional carousel.

### Uniswap: access failure, not a visual design finding

Viewed: `uniswap-desktop.png`, `uniswap-retry-desktop.png`, `uniswap-final-desktop.png`.

The official homepage redirected to the app, but the first screenshot was blank. A direct request to `https://app.uniswap.org/swap` and a fresh request to `https://app.uniswap.org/` both rendered JSON saying `client packet length exceeds 255 buffer`. This is an observed access/rendering failure in this environment, with root cause unknown. It does not establish that ordinary users see a broken site. No layout, typography, interaction, or quality conclusions about Uniswap are justified. It must not count as a successfully visually reviewed product in the final ten.

## Proposed translation into Studio

These are design judgments inferred from the observations, not claims proven by user testing:

1. Make the application itself the composition. Use one stable navigation region, a calm header with project/network state, a broad central workspace, and a clearly associated result area. Avoid a hero followed by many equally weighted cards.
2. Keep curvature selective. A restrained 12–20-pixel radius on major working surfaces and pill-like mode controls can feel precise when alignment is strong and borders are quiet. These dimensions are proposed Studio values, not measured competitor CSS.
3. Let typography do more work. Use a clear 32–40-pixel page title, 18–22-pixel section titles, and readable 16-pixel form/body text. Reserve small text for genuinely secondary metadata. These are proposed values, not extracted measurements.
4. Show the active operation, its inputs, and its outcome as one intelligible unit. The Jupiter mode change and Phantom's depicted receipts both support giving outcomes visual weight, while Studio must preserve verified transaction versus local/simulated boundaries.
5. Use green for the active control, successful verified state, or one primary action. Avoid filling every container with a tinted background. Keep ordinary surfaces neutral and technical content readable.
6. Recompose mobile around the task. Let the operating panel fill the width, move navigation out of the content column, and keep the result reachable without horizontal scrolling. Jupiter demonstrates this structural adaptation, but Studio's own mobile workflow still needs direct verification.

## Review status and limits

Self-approved for the evidence actually inspected: all 17 listed screenshots were opened and reviewed; the Jupiter Market-to-Limit visual change was reviewed; the six relevance checks used current official destinations and dated source data. Five projects yielded usable product design evidence: Pendle, Aave, Jupiter, Phantom, and Monad. Uniswap yielded only failure evidence. Pendle replaced it for the successful reference set. The written observations were checked against the screenshots before handoff.

This review does not establish authenticated flows, wallet safety, accessibility compliance, animation behavior, physical-device behavior, or Firefox/WebKit compatibility. Chromium viewport emulation is not real hardware testing. Cookie panels occlude some captured areas. The web text-retrieval tool rejected Pendle’s initial URL, but ordinary browser navigation to the official homepage and linked app succeeded without bypasses. No competitor assets were copied into Studio, no application files were changed, and nothing was published. The coordinator must independently review the selected screenshots and the finished Studio design.
