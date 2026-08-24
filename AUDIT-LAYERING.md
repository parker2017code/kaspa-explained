# Layering audit: does the surface/depth split actually work

Scope and method, stated up front. Of 74 HTML files in the repo, 55 are
`noindex` redirect stubs (`<meta http-equiv="refresh">` to a merged page) with
no content to layer, plus `404.html` and `_tmp_measure.html` (a dev scratch
harness, not a page). `model-picker.html`, `chain-comparer.html`, and
`the-instrument.html` were excluded per instructions. That leaves **15 real
content pages**, all audited below. `kips.html`'s parameterless demo was
skipped as instructed; its other disclosures were checked.

Verification depth varies by page and is stated per row: `kaspa-mining.html`
and `status.html` got full interactive checks (rendered in Chrome at 390 and
1280, JS-populated `<details>` bodies read via `outerHTML` after live fetches
resolved, theme switch confirmed against computed `background-color`).
`argent-explained.html`, `kips.html`, `build-on-kaspa.html`,
`crypto-from-scratch.html`, `what-is-kaspa.html`, `why-kaspa-matters.html`,
`utxo-vs-accounts.html`, and `skeptical-case.html` were checked by reading
full source (surface text and static `<details>` bodies, which are plain
HTML on these pages, not JS-injected) rather than a full render at every
width. `index.html`, `start-here.html`, `search.html`, and `sources.html`
were read the same way; they carry lighter disclosure structure so a static
read is sufficient to judge the four questions.

Theme mechanism, confirmed directly: setting `data-theme="light"` plus
`localStorage["kaspa-explained-theme"]="light"` on `kaspa-mining.html` at
390px changed `getComputedStyle(document.body).backgroundColor` from
`rgb(16, 14, 12)` (dark) to `rgb(255, 255, 255)` (light). The site does not
key off `prefers-color-scheme`; the explicit-state mechanism is real and
works.

## Summary table

| Page | Surface satisfies? | Depth rewards a click? | Split in the right place? |
|---|---|---|---|
| index.html | Yes | N/A (nav hub, not a claim page) | Yes |
| start-here.html | Yes | Yes | Yes |
| what-is-kaspa.html | Yes | Mixed: strong in most panels, thin in one | Yes |
| kaspa-mining.html | Yes | Yes, verified live | Yes |
| kaspa-origin-story.html | Yes | Yes | Yes |
| why-kaspa-matters.html | Yes | Mixed: one panel is filler | Yes |
| skeptical-case.html | Yes | Yes, strong | Yes |
| utxo-vs-accounts.html | Yes | Yes | Yes |
| argent-explained.html | Yes | Yes, strong | Yes |
| crypto-from-scratch.html | Yes | Mixed: one panel is filler | Yes |
| build-on-kaspa.html | Yes | Yes, strong | Yes |
| kips.html | Yes | Yes, strong | Yes |
| status.html | Yes | Yes, strong | Mostly, but see mechanism note |
| sources.html | Yes, for what the page is | N/A, it's a link directory | No — the page itself shouldn't exist per the site's own stated rule |
| search.html | Yes, for what the page is | N/A, it's a utility | Yes |

## Detail

### index.html
Surface: "Kaspa, explained. The proof-of-work network where miners don't
race for one slot. They work in parallel, and GHOSTDAG orders every honest
block into one history the whole network agrees on." That is a real answer,
not a teaser, delivered in two sentences with `.term-def` reveals on
"proof-of-work" and "GHOSTDAG" for a reader who wants the word defined
without leaving the sentence. The page is a router (six route cards: What is
Kaspa, Live now, Check claims, Risks, Build, Sources), so "does the depth
reward a click" doesn't apply the way it does on an explainer; its one
`<details>` is a "What each label means" legend, appropriately collapsed
since a reader who already knows the four status labels doesn't need it
restated.

### start-here.html
Surface answers directly: "Every crypto design answers one question: what
breaks when you take away the trusted operator?" followed by a plain
four-part answer (keys, agreement rules, rewards, open markets) before any
disclosure. Two `<details>` panels checked ("What 'grows back' means" and
"What each option actually trades away") both carry real elaboration, not
restatement — the second one names the specific cost of each option (account
freezes, custody risk, "more moving parts and mistakes nobody can undo")
rather than repeating the surface sentence in longer words.

### what-is-kaspa.html
Surface: "Kaspa is a live proof-of-work blockDAG network. It keeps
Bitcoin-style mining and UTXO ownership, and GHOSTDAG orders parallel blocks
into one payment history." Direct answer, `.term-def` carries UTXO inline.
15 `<details>` panels checked by source read. Most reward the click: "How
this works, and the sources," "Show the mass formulas," "Watch the network:
a live read of Kaspa's own public API, not a simulation" all carry real
mechanism or a live demo, not padding. One genuine miss: "Why Bitcoin chose
the opposite trade-off" opens to a single sentence — "Bitcoin's answer is to
make blocks rare, roughly one every ten minutes, so collisions are rare too.
It works, and it is why a Bitcoin payment settles at the pace it does." That
is not derivation, it's the surface claim's mirror image restated once. An
expert who opens it gets nothing they couldn't have inferred from the
summary line itself. Low cost (one panel out of 15) but a real instance of
the failure mode question 2 asks about.

### kaspa-mining.html
Surface: "Price can fall while hash rate climbs. A coin market reprices in
minutes; a machine market... answers weeks or months later," backed
immediately by a dated snapshot (price, hash rate, supply, block reward) with
no click required. This is the strongest page on the site for the surface
test — the answer and the current numbers are both open by default.

Depth verified live: the "Assumptions, exact math, and sources" panel under
the attack-cost calculator is JS-populated at load. Rendered content
includes the exact API endpoints used (`mempool.space/api/v1/mining/hashrate/3d`,
`api.kraken.com/0/public/Ticker`), which figures are live versus dated and
why (CoinGecko's market-cap endpoint "returns intermittent 403s with no CORS
header... which a static page cannot recover from" — a specific, checkable
reason, not a hand-wave), and the attack-cost methodology (51% hash share,
$0.06/kWh, the amortization window for PoS). This is real derivation an
expert can audit, not restated prose. Note for future verification: `.innerText`
on a closed `<details>` reports empty even when `.outerHTML` carries the full
content (a Chromium rendering quirk, not a site bug) — read `outerHTML` when
checking JS-populated depth panels, `innerText` will false-negative.

The page mixes mechanisms well: `.info-affordance` on "500 TH/s milestone,"
`.view-switch` between "The two markets," "The cycle," "What to watch," and
13 `<details>` panels of varying depth (short caveats, a live calculator,
sourced tables). This is the page that best executes "ten ways to hide
something."

### kaspa-origin-story.html
Surface: the full lede paragraph states the thesis plainly — the fair launch
"was what was left after" several failed paths, and names what it did and
didn't prove, before any click. 11 `<details>` panels checked; the sampled
ones (DAGLabs founding-date dispute) cite specific conflicting primary
sources (an Investing.com article, a HackerNoon interview, Guy Corem's
testnet note) rather than restating the surface claim — this is sourced
historical detective work, genuine depth.

### why-kaspa-matters.html
Surface states the design bet plainly in one paragraph before any table or
disclosure. The five-job table is itself open (correctly — it's the page's
answer), with each row's detail collapsed behind a per-row summary. One thin
panel found: "Why 'evidence next'" opens to two sentences that mostly repeat
the row's own label ("Covenant rules run in consensus today. Wallets and
developer tooling have not caught up yet, so builder evidence is what to
watch next.") — a one-line restatement, not new information. Same failure
class as `what-is-kaspa.html`'s Bitcoin panel.

### skeptical-case.html
Surface for each of the seven risks states the mechanism and the failure
condition in plain language before any click — "Block rewards decline over
time. Unless fees and demand replace that revenue, miner income falls."
Depth is the best on the site for reward-per-click: "What would settle it,
and what pays for the hash rate today" opens to a full derivation — exact
block reward, daily subsidy in dollars, fee revenue as a fraction of it
(1/12,054th), the 12-step halving-equivalent compounding to a projected
figure a year out, and the transaction-per-second rate Kaspa would need to
close the gap on fees alone (about 10,771 tx/s sustained, cross-referenced
against Solana's and Kaspa's own measured rates). That is genuine
verifiable math with named sources for every number, correctly kept off the
surface (it would blow well past any word ceiling) and correctly present in
full once opened.

### utxo-vs-accounts.html
Surface: "An account balance is one slot two spenders can fight over. A UTXO
coin isn't. Two demos below show why," then the collision demo itself sits
open (correctly — it's the page's whole point, an interactive proof rather
than a claim to take on faith). Only 2 `<details>`, both checked and both
carry real tradeoff content ("Why UTXO parallelizes, and the honest
tradeoff") rather than restating the demo.

### argent-explained.html
Surface states the gap plainly: "A covenant is opcodes. An application is
several agreeing," then explains what Argent is in two sentences before any
disclosure. Depth is the strongest single panel found on the site: "Open the
language model and a worked example" contains an actual Silverscript code
block (a `TicketState`/`Ticket` actor with `require` checks and a `become`
transition), an explanation of what compiles to what, and a description of
the compiler's own inspection tooling (`argentc inspect` reporting opcode
counts and signature-script size estimates). This is not longer prose saying
the same thing — it's the only place on the page a reader sees the actual
mechanism, correctly gated behind a click since it needs real attention.

### crypto-from-scratch.html
Surface states the thesis directly: "Crypto earns its cost when strangers
need one shared record of who owns what, and no single firm, bank, or state
is trusted to keep it." Most of the 9 checked `<details>` carry real content;
one thin panel: "NIST's definition, and what's built on it" opens to two
sentences that mostly restate NIST's definition already implied by the
summary line, then a one-clause list of five things "built on it" with no
elaboration. Not empty, but the weakest of the panels sampled on this page.

### build-on-kaspa.html
Surface states the fit test plainly: "Toccata matters only when the product
needs a spend rule the user can read before funds move," with the
route-picker itself open. Depth checked: "Why there's no shared-state read,
and who's already hit it" names a specific builder who raised the gap in the
Kaspa Core R&D Telegram group on a specific date, with the actual outcome
("six reactions, no reply, and no KIP yet says whether the fix belongs at L1
or in a future vProg"). That is a live, unresolved fact a reader could not
get from the summary alone — real reward for opening it. This page also uses
all three named mechanisms (`.info-affordance`, `.term-def`, `.view-switch`)
plus 10 `<details>`, the widest mechanism variety on the site outside
`kaspa-mining.html`.

### kips.html
Surface (excluding the parameterless demo, skipped per instructions) states
what's live plainly in the KIP batch summaries: "KIP 9–15, consensus and
script-engine expansion (5 of 5 active)." Depth is exceptional: "What the
spec's own authors said about this" opens to direct, dated quotes from a
real GitHub issue (`kaspanet/kccs#14`) with two named KCC-0020 co-authors
disagreeing with each other on the record, one conceding a pattern is
"a wrong pattern" the standard doesn't yet handle. This is primary-source
journalism sitting behind a disclosure, not a summary of it — the single
best-sourced depth panel found in this audit.

### status.html
Surface: "Live on mainnet right now" states the answer in one paragraph
before any click, confirmed rendered at 1280px — the plain-language claim
sits open, "Exact numbers, checked August 22, 2026" sits closed directly
below it. Correct placement.

Depth, sampled ("Nine adoption signals"): a signal/what-it-would-show/what-
can-mislead table, genuinely distinct content per row, not restatement.

Mechanism note, the one real structural finding on this page: status.html
has 37 `<details>` elements and 19 `.term-def` spans, and **zero**
`.view-switch` or `.info-affordance` instances — the only mechanism in play
across the whole page is the disclosure triangle, applied at two different
scales (roughly 14 section-level panels stacked down the page, plus ~19
single-word "Why"/"Why not" cell-level panels inside the claim table). The
site's own `design/STANDARD.md` names exactly this failure mode: "not one
disclosure triangle swallowing a page." The per-row "Why" cells are
defensible — they sit directly beside the claim they explain in a table row,
so the one-word summary has context the reader can already see, and a
`.view-switch` wouldn't fit a single table cell. But the section-level stack
(14 top-level `<details>` in sequence, each wrapping a different kind of
content — sourced math, a claim table, a Telegram-sourced narrative, an
adoption-signal table) is a real candidate for the view-switch the owner
describes: e.g. "By category" vs. "By date" vs. "By confidence" as competing
framings of the same claim-fact-check data, instead of one more triangle in
the stack. This is the page the audit brief's "eight sections wrapped in the
identical component" warning is actually describing.

### sources.html
Surface states its own job plainly: "Every source, grouped by what it
proves," then a page-map of internal jump links (Check a claim, Open status,
Source hierarchy, Code tracking...) and one open "Source hierarchy" section
explaining the four-tier trust model directly, no click required for that
part. As a directory, it does what it says.

The real finding here is not about this page's internal layering, which is
fine — it's that the page's existence contradicts the site's own stated
design rule. `design/STANDARD.md` says plainly: "Sources are not something
anyone reads either. A source belongs attached to the claim it settles,
reachable from that claim... does a reader ever arrive here on purpose? If
the honest answer is no, the material belongs where it gets used, and the
page should not exist." Every other page on the site attaches its sources to
the claim inline (a link in the sentence, a source line inside a `<details>`
right next to the number it backs) — `kaspa-mining.html`'s attack-cost
sources sit inside that demo's own assumptions panel, not on a separate
sources page. `sources.html` is the one place the site keeps a standalone
reference page of exactly the kind it argues against elsewhere. It isn't
badly built; it shouldn't exist as a destination, by the site's own logic.

### search.html
A utility page (type a term, get matching pages), correctly out of scope for
"does the surface answer a question" — its job is routing, not explaining.
One `<details>`, "How this search works," correctly collapsed (implementation
detail a searching reader doesn't need) and genuinely informative once
opened (explains the title/description-first, background-indexed-body-text
matching order, which is real mechanism, not restatement).

## Cross-cutting findings

**No case found of primary content hidden behind a click.** Every surface
paragraph checked across all 15 pages states the page's actual answer in
plain language before any disclosure, and every `.view-switch` and open
table checked carries the reader's likely reason for being on the page. The
banned failure direction (teaser-only surface) does not appear anywhere in
this sample.

**Thin depth panels are real but rare and low-stakes.** Three found across
15 pages and roughly 130 checked `<details>`/panels: `what-is-kaspa.html`'s
"Why Bitcoin chose the opposite trade-off," `why-kaspa-matters.html`'s "Why
'evidence next,'" and `crypto-from-scratch.html`'s "NIST's definition." Each
is a one-or-two-sentence restatement rather than derivation, sourcing, or a
worked example — the exact failure question 2 asks about, just isolated
instances rather than a pattern. Worth trimming (fold the sentence into the
surface, or delete the disclosure) but not evidence the mechanism is broken.

**Summary lines are consistently specific.** Across every page sampled, the
overwhelming majority of `<summary>` text names what's inside rather than
teasing it: "The defect and the one production implementer," "What the
spec's own authors said about this," "Why one TPS number doesn't cover every
workload." The repeated single-word "Why"/"Why not" cells in `status.html`'s
claim table are the only recurring exception, and they're defensible given
the adjacent row context, not a violation of question 4's rule against
uninformative summaries.

**status.html is the one page that reads as a template.** 37 disclosure
triangles, one mechanism, applied at every scale from a single word to a
full sourced section. It's the page the "ten ways to hide something" rule
was written against, even though every individual panel checked earns its
click. A view-switch across the claim-fact-check table's framings (category,
date, confidence) would break the monotony better than another `<details>`.

**sources.html's standing as a destination page conflicts with the site's
own written design philosophy**, which explicitly argues sources shouldn't
be a page people arrive at, they should live attached to the claim. Every
other page in this audit does that correctly; this one page is the
exception, structurally.
