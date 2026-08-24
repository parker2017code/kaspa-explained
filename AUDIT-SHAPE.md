# Shape audit: the eight pages that absorbed inlined demos

Scope: the eight topic pages that received the eighteen demos moved out of
`demos/` in commit 3717fbc (`Put every demo inside the page it explains`).
Mapped by reading each demo's redirect stub for its landing anchor, then
confirmed against each page's markup:

- `what-is-kaspa.html` — collision-sim, ghostdag-playground, live-network, mass-calculator (4)
- `kaspa-mining.html` — attack-cost, emission-schedule, fee-market, node-cost (4)
- `build-on-kaspa.html` — covenant-breaker, zk-boundary (2)
- `kaspa-origin-story.html` — dag-time, fair-launch (2)
- `utxo-vs-accounts.html` — shared-state, plus the page's own utxo-vs-accounts demo (2)
- `kips.html` — supply-split, plus parameterless, which is out of scope per instruction (1 audited)
- `why-kaspa-matters.html` — confirmation-risk (1)
- `argent-explained.html` — argent-pipeline (1)

That's 17 of the 18 audited (parameterless skipped as instructed).

Method: read each page's raw HTML for heading order, `<details>` placement
and `open` state, and disclosure-component census (`grep -c`); loaded each
page from a local static server (`python3 -m http.server 4441`, killed at
the end) into the Browser pane and checked `location.href`, computed
layout, and `document.documentElement.scrollWidth` against
`window.innerWidth` at 390 and 1280 to catch horizontal overflow; screenshots
of `what-is-kaspa.html` rendered a blank/glitched frame after scroll, so
layout facts below come from `getBoundingClientRect` and
`getComputedStyle` instead, which is what the numeric widths and heights
are drawn from.

Pages ranked worst shape first.

---

## 1. what-is-kaspa.html (worst)

**1. Is the answer first?** Yes. At 1280 the H1 "What is Kaspa?" and the
one-sentence definition ("Kaspa is a live proof-of-work blockDAG
network...") are the largest, highest-contrast thing on the screen, above
three plain-language cards (Coin/Security/Ownership). This part is done
right.

**2. Scannable in ten seconds?** No, once the demos are counted. Two of
the four absorbed demos inject their own internal `<h2>` elements into the
page (`<h2>Single chain <span id="cs-chainStat">so far: 0 kept, 0 thrown
away</span></h2>` at line ~379, and a second `<h2>BlockDAG...</h2>` right
after it, both inside `#collision-demo`). A heading scan of this page
literally returns live simulator readouts as if they were page structure:
"H2: Single chain so far: 19 kept, 86 thrown away (82% discarded)" reads
as a claim, not a widget label. Reconstructing the page from headings
alone produces a false claim.

**3. Default-closed rule: correct or mechanical?** Applied
inconsistently, on the same page, with no visible principle
distinguishing the two treatments. `#mass-calculator` and `#live-network`
are `<details>`, closed by default (confirmed via `element.open === false`
in the rendered DOM). `#collision-demo` (collision-sim) and the GHOSTDAG
playground stage (inside `<section id="ghostdag">`, lines 891–987) are
bare `<div>`/`<section>` markup with no disclosure wrapper at all — always
rendered, always full weight. Measured at 1280: `#collision-demo` alone is
924px tall; the `#ghostdag` section (dominated by the always-open
playground) is 2286px. Combined, that's roughly a third of the page's
9459px total height rendered open, unconditionally, before the reader
chooses anything. Whether these two specifically deserve open treatment
because they illustrate the page's central claim is a defensible call,
but the same argument applies equally to mass-calculator and live-network
(TPS and the live check are just as central to "what is Kaspa"), and
those two are closed. This is the banned direction — primary explanatory
weight sitting open with no stated reason it's different from the
sibling demos that are gated — not a case of trivia left open.

**4. Disclosure mechanism: varied or the same triangle?** Same triangle,
almost exclusively. 15 `<details>` elements, 0 `info-affordance`
triggers, 0 `view-switch` tab groups. The only real variety is the
`term-def` tooltip reveal, used 13 times for inline glossary terms — a
second mechanism, but a narrow one (word-level, not section-level). Every
section-level disclosure on this page is a `<details>` triangle, just
under different class names (`deep-dive`, `advanced`, `panel`,
`cell-detail`). That reads as one component reskinned, not several
different ways of hiding information.

**Demo, page-reason:** Carries four demos, the most of any page. Two are
correctly treated as supporting evidence (mass-calculator, live-network,
closed); two (collision-sim, ghostdag-playground) function as the point
of the section they sit in but are shaped like open-ended exhibits rather
than the answer itself, which is why leaving them open reads as
inconsistent rather than intentional. Page has an obvious reason to
exist — it's the primary "what is Kaspa" explainer, linked from nav.

---

## 2. kips.html

**1. Is the answer first?** Yes. H1 "KIPs and KCCs" is followed
immediately by a definitional paragraph distinguishing the two processes,
then a second paragraph quoting the KCC README directly. No demo, no
setup, before the reader gets the distinction the page exists to make.

**2. Scannable in ten seconds?** Marginal. Only five H2-level headings
carry the entire page ("KIPs and KCCs" / "Kaspa Improvement Proposals" /
"Kaspa Calls for Conventions" / "Where these numbers come from" / "Next
pages") against 17 `<details>` elements nested underneath them — the
headings alone under-describe a page this dense. The closed-summary
lines partly rescue it: they carry real content ("KIP 1–6, the
foundational batch (2 of 6 active)", "Common question: what happens when
a token standard splits supply?"), so a reader who reads headings *and*
summaries, as the test specifies, gets a workable reconstruction. But the
headings on their own are too sparse to carry the structure, which is the
actual test given ("If the headings do not carry the structure, they are
decoration").

**3. Default-closed rule: correct or mechanical?** Correctly applied to
the one demo in scope. `#supply-split` is `<details class="deep-dive"
id="supply-split">`, confirmed `open === false` in the rendered DOM — the
supply-split consequence is a specific, disputed edge case (whether
KCC-0020 token splits are reversible), not something a reader needs to
understand the page. Closed is the right call.

**4. Disclosure mechanism: varied or the same triangle?** The most
monotone page in the set. 17 `<details>`, 2 `term-def`, 0
`info-affordance`, 0 `view-switch`. Every layer of nested detail — KIP
batches, the supply-split dispute, individual GitHub issue writeups — is
the same triangle stacked inside the same triangle. This is the page the
owner's "eight sections in the same disclosure component" warning
describes most literally.

**Demo, page-reason:** One demo in scope (supply-split), correctly
closed. The page has a clear reason to exist — it's the only place that
reads KIP/KCC status live from the repos rather than stating it once as
prose.

---

## 3. build-on-kaspa.html

**1. Is the answer first?** Yes. H1 "Build Kaspa apps" is followed
directly by the lead: "Toccata activated at DAA 474,165,565. Spend
limits, escrow paths, asset rules, and proof checks are now in L1 script,
readable before funds move." Concrete and load-bearing, first thing on
the page.

**2. Scannable in ten seconds?** Reasonable. 12 H2s ("Pick the route",
"Attack a covenant vault", "How much of this is actually running", "What
a proof can and can't verify", etc.) read as a coherent builder journey
in sequence.

**3. Default-closed rule: correct or mechanical?** Same failure as
what-is-kaspa, smaller scale. `#covenant-breaker-demo` and
`#zk-boundary-demo` are both bare `<section>` elements (not `<details>`),
confirmed always rendered — 486px and 513px tall respectively at 390.
Both sit under headings ("Attack a covenant vault", "What a proof can and
can't verify") that read as claims the demo is proving, i.e., supporting
evidence for an argument rather than the argument itself — the kind of
content the stated rule says should default closed. Neither is
individually heavy, but the page as a whole is the longest of the eight:
17,858px at 390. Two more always-open demo blocks add to a page that is
already the heaviest scroll in the set.

**4. Disclosure mechanism: varied or the same triangle?** Real variety,
the best in the set along with kaspa-mining and why-kaspa-matters. 10
`<details>`, 3 `info-affordance` triggers, 8 `term-def` reveals, and a
genuine `view-switch` tab group (`role="radiogroup"`, labeled tabs for
verify paths) plus a second `cvb-view-switch` (`role="tablist"`) specific
to the covenant-breaker demo. Four distinct mechanisms in active use.

**Demo, page-reason:** Two demos, both open when the rule argues for
closed. Clear reason to exist — the builder-facing counterpart to
what-is-kaspa, and the landing target for two demo redirects plus general
builder material moved here from the old Toccata pages.

---

## 4. kaspa-mining.html

**1. Is the answer first?** Yes, and well done. H1 "Kaspa mining", lead
sentence ("Price can fall while hash rate climbs...") stating the page's
actual thesis, then an immediate "Checked August 22, 2026" data snapshot
(price, hash rate, supply, block reward) and a five-link jump nav, all
before any demo or explanation. This is the strongest answer-first
opening of the eight.

**2. Scannable in ten seconds?** Yes. Section headings ("The two
markets", "ASICs buy security, with a bill attached", "One chart, several
stories", "Fees are the second revenue source", "What would prove
strength or weakness", "Point your own ASIC at your own node") map
cleanly onto the page's argument.

**3. Default-closed rule: correct or mechanical?** Correctly and
consistently applied. All four absorbed demos —
`#emission-schedule`, `#attack-cost`, `#fee-market`, `#node-cost` — are
`<details class="guide-detail">`, and the rendered DOM confirms all 30
`<details>` elements on the page default closed (`openByDefault: 0`).
No violation in either direction.

**4. Disclosure mechanism: varied or the same triangle?** Correct in
principle, heavy in practice. The page does use multiple real
mechanisms — 14 `info-affordance` triggers, a `view-switch` tab group,
`term-def` reveals — so it isn't monotone the way kips.html is. But 16 of
the page's 30 `<details>` share the single class `guide-detail`, used for
everything from the four demos to routine explanatory asides to every
step of the solo-mining walkthrough (`#windows`, `#mac-linux`, "If the
bridge should start its own node", "Pick the first port", "Check that
it's working", "If it doesn't connect" — eight solo-mining steps alone,
each its own guide-detail triangle). Functionally correct, but at 30
disclosures on one page, four of them demos indistinguishable in
treatment from an "If it doesn't connect" troubleshooting note, the
demos lose their weight as demos.

**Demo, page-reason:** Four demos, all correctly gated. Reason to exist
is obvious and the page carries its own "Checked [date]" snapshot, so
it's also doing double duty as a live-data page.

---

## 5. argent-explained.html

**1. Is the answer first?** Yes. H1 "Argent and Silverscript, explained",
lead: "Toccata made covenants enforceable. Argent, Michael Sutton's
compiler, turns a readable application description into the Silverscript
the network already checks." A status line ("unaudited, pre-release")
follows immediately, which is exactly the caveat a reader needs before
trusting anything else on the page — correctly left un-collapsed.

**2. Scannable in ten seconds?** Yes. Eight H2s in sequence ("A covenant
is opcodes. An application is several agreeing." → "Two Argent actors,
one atomic transaction" → "Four ideas, and a worked example" → "Watch the
Ticket example move from Argent to Kaspa Script" → "Partitioned state
works. Shared state is a design direction." → "What the three repos
show" → "What Argent's own README actually says") reads as a complete
argument on its own.

**3. Default-closed rule: correct or mechanical?** Correct. The one
absorbed demo, `#argent-pipeline`, is a bare `<section>` — open — but it
sits directly under its own heading, "Watch the Ticket example move from
Argent to Kaspa Script," which explicitly promises a worked example. The
demo is not supporting evidence bolted onto a claim; the section's whole
job is to show the pipeline, so open is the right call, not a violation.

**4. Disclosure mechanism: varied or the same triangle?** Light use, no
monotony problem simply because there isn't enough disclosure on this
page to read as a template: 4 `<details>`, 4 `term-def` reveals, no
`info-affordance` or `view-switch`. Not a lot of variety, but not enough
volume to read as one component repeated either.

**Demo, page-reason:** One demo, correctly open as the section's actual
content. Page has a clear reason to exist: the only place that explains
a named, attributed piece of tooling (Sutton's compiler) in depth.

---

## 6. why-kaspa-matters.html

**1. Is the answer first?** Yes, explicitly labeled. H1 "Kaspa's design
case" is followed by a `<div class="answer-block">` with its own eyebrow
literally reading "Answer," then one sentence: "Crypto earns its keep
when people need one shared record and no single operator running it.
Kaspa's bet is that Bitcoin-style Proof-of-Work security and censorship
resistance can run closer to real time without giving up either one."
This is the cleanest, most self-aware answer-first pattern of the eight —
the page names the thing it's doing.

**2. Scannable in ten seconds?** Yes. Nine H2s in a clear argument order
("Start with the job" → "What the other networks are already good at" →
"Every design pays for its wins somewhere" → "Kaspa focuses on latency"
→ "Inclusion and confirmation are separate claims" → "Programmability,
by status" → "Check any coin, including this one").

**3. Default-closed rule: correct or mechanical?** Correct. The one
absorbed demo, `#confirmation-risk-demo`, sits nested inside `<details
class="deep-dive"><summary>How Bitcoin, Kaspa, Ethereum, and Solana split
on this</summary>`, confirmed closed by default in the rendered DOM. It's
genuinely supporting evidence for a specific claim in that subsection
("Reversal odds fall as blue work stacks up") rather than something a
reader needs to understand the page, so closed is right.

**4. Disclosure mechanism: varied or the same triangle?** Reasonable
variety: 10 `<details>`, 9 `term-def` reveals, and a real `view-switch`
tab group. Not monotone.

**Demo, page-reason:** One demo, correctly gated as evidence inside a
deep-dive rather than presented as the page's point. Clear reason to
exist as the site's thesis/positioning page.

---

## 7. kaspa-origin-story.html

**1. Is the answer first?** Yes. H1 states the thesis directly: "Kaspa's
fair launch was the path left after the other paths failed." The lead
paragraph explains why in four sentences, ending with the actual claim
("It proved nothing about later adoption, price, or whether the tech
would work; it only took the premine, the pre-sale, and the insider
table off the starting line") — a page that argues rather than narrates,
and puts the argument first.

**2. Scannable in ten seconds?** Not independently checked heading-by-
heading in this pass, but the two absorbed demos sit inside `<details
class="deep-dive">` with descriptive summaries rather than as bare
sections, which keeps the top-level heading list from being interrupted
by demo internals — the failure mode found on what-is-kaspa doesn't
recur here.

**3. Default-closed rule: correct or mechanical?** Correct.
`#dag-time-demo` and `#fair-launch-demo` are both `<details
class="deep-dive">`; rendered DOM confirms 0 open `<details>` on page
load at 390. Both demos illustrate specific mechanics (DAG timing, the
fair-launch sequence) in support of the prose argument already made
above them, so closed is the right default.

**4. Disclosure mechanism: varied or the same triangle?** Mostly
triangle, some variety: 11 `<details>` (7 plain `deep-dive`, plus the two
demo ones), 4 `term-def`, 1 `info-affordance`. Lighter reliance on
`deep-dive` than what-is-kaspa or kips, and at least one non-details
mechanism present.

**Demo, page-reason:** Two demos, both correctly closed. Reason to
exist is clear — it's the narrative/history page, distinct in kind from
the explainer pages.

---

## 8. utxo-vs-accounts.html (best shape)

**1. Is the answer first?** Yes, and the page names its own method. H1
"Why parallel spends don't collide," lead: "An account balance is one
slot two spenders can fight over. A UTXO coin isn't. Two demos below
show why." The page tells the reader up front that the demos aren't
supporting decoration, they're the explanation itself.

**2. Scannable in ten seconds?** Yes, because the page is short and its
structure is only four sections: "Who wins the same slot" (demo one),
"Race for the exact same data" (demo two, `#shared-state`), "Read the
sources," "Next pages." Given the lead's own framing, that's exactly
right — nothing to scan past.

**3. Default-closed rule: correct or mechanical?** Correct, and the
clearest example in the set of open-by-design done right. Both demos
(`#shared-state` and the unlabeled first section, "Who wins the same
slot") are bare `<section>` elements, not gated — but the lead paragraph
says outright that the demos are the argument ("Two demos below show
why"), so there's nothing upstream they'd be duplicating or nothing a
reader needs gated from. This is the version of "open by design" that
what-is-kaspa and build-on-kaspa are missing: an explicit statement that
the demo is the point, not an inference a shape-auditor has to make.

**4. Disclosure mechanism: varied or the same triangle?** Barely used at
all: 2 `<details>`, 1 `term-def`. Not a variety story either way — the
page just doesn't need much disclosure, which is itself the right shape
for a two-demo page.

**Demo, page-reason:** Two demos, both correctly open because they are
the stated content of the page, not evidence for a claim made elsewhere.
Shortest page audited (4438px at 390, versus 17,858px for
build-on-kaspa). Clear reason to exist — it's the canonical UTXO vs.
account-model comparison, linked from multiple other pages.

---

## Cross-page pattern

Two failure directions, both present, on different pages:

- **Open when it should default closed** (the banned direction):
  what-is-kaspa.html (collision-sim, ghostdag-playground) and
  build-on-kaspa.html (covenant-breaker, zk-boundary). Both cases are
  demos illustrating or proving a claim made in surrounding prose, not
  demos that are the claim, and both sit as bare `<section>`/`<div>`
  markup with no disclosure wrapper at all — not even a mechanically
  wrong wrapper, no wrapper.
- **Correctly open, explicitly justified**: utxo-vs-accounts.html and
  argent-explained.html, where the demo is the page's stated content
  and the lead paragraph or the demo's own heading says so.
- **Correctly closed**: kaspa-mining.html (4/4), kaspa-origin-story.html
  (2/2), why-kaspa-matters.html (1/1), kips.html (1/1 in scope).

Mechanism variety splits the same way roughly by page age/rebuild depth:
kaspa-mining.html, build-on-kaspa.html, and why-kaspa-matters.html each
have a real `view-switch` tab group in addition to `<details>` and
`term-def`; what-is-kaspa.html, kaspa-origin-story.html, kips.html,
argent-explained.html, and utxo-vs-accounts.html have none — on those
five pages, every section-level disclosure is some flavor of the same
`<details>` triangle. kips.html (17 `<details>`, nothing else) and
what-is-kaspa.html (15 `<details>`, nothing else) are the two pages
where that reads as a template rather than a choice.

No horizontal overflow found on any of the eight pages at 390px
(`document.documentElement.scrollWidth` matched `window.innerWidth` on
every page checked), consistent with the "860 clipping failures ... to
zero" claim in the commit that did this work.
