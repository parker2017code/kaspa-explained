# Density budget

Proposed limits for the rewrite, keyed to the measured problem: 48,104 words
across 25 live pages, 121 paragraphs over 60 words, 18 of 25 pages with zero
collapsible sections.

## Hard limits (enforce in a gate, fail the build)

**Visible words before first interaction: 150.**
Everything above the fold's first `<details>` or interactive element, on the
rendered page, not the source. This covers the answer block and one visual
or table; it does not cover a full page. A gate counts text nodes outside
any `<details>:not([open])` and outside any element with
`data-collapsed="true"`, down to the first such element in document order.
Enforced hard because this number directly measures whether the rewrite's
central claim, "the answer is visible, the rest is a click away," actually
holds on a given page. A page that passes review but fails this count has
regressed to the old shape without anyone noticing in a text diff.

**Paragraph length: 60 words.**
121 existing paragraphs already exceed this; it is not an aspirational
number, it is the line the owner's three impenetrable pages sit on the
wrong side of. Enforced hard, with one carve-out: a paragraph inside an
already-collapsed `<details>` is exempt, since a reader who opened it has
already opted into more text. The exemption is why this can be hard
without also being punitive toward legitimate depth.

**Table cell length: 30 words.**
status.html's worst cell runs 129 words. A cell over 30 words is a
paragraph pretending to be a grid, which defeats scanning, the entire
reason a table was chosen over prose. Enforced hard, same collapsed-detail
exemption: a cell's visible text counts, a `<details>` nested inside it
does not.

## Page-type scope (added 2026-08-22)

The 150-word pre-interaction limit was written for one page shape: a reader
who wants an answer before a wall, on a status page or a reference page. On
2026-08-22 it was applied to every page, including two where continuous
prose is not a defect but the entire point. The result: `toccata-essay.html`
was collapsed from 3,758 pre-interaction words to 102 by hiding 86 percent of
the essay behind nine "Keep reading" toggles, a reader red team called it
burial, and it was rightly reverted to a flowing 3,901-word essay, which the
gate then reported as a violation. `skeptical-case.html` went through the
same cycle: its seven objections were collapsed, a reader nearly left
thinking the short answer was the whole page, and it was restored to 1,437
visible words, also flagged. A gate that reports the correction as the
failure teaches the next agent to re-break the page to turn the number
green. The fix is to scope the limit to what kind of page it is, the same
way `scripts/audit-content-flow.mjs` already scopes its word-count ceiling
with a `personalEssayFiles` list instead of one number for every page,
rather than inventing a second mechanism for the same problem.

Three categories: essays, reference pages, and everything else (the default
answer/status category). Reference pages are defined in
`scripts/check-density.sh` as an explicit `REFERENCE_FILES` list, auditable
by reading the script.

Essays are defined once, in `scripts/essay-pages.json`, not in either gate's
source. That file is the single list both `scripts/check-density.sh` (via
embedded Python, `Path("scripts/essay-pages.json")`) and
`scripts/audit-content-flow.mjs` (via `fs.readFileSync`, same path) read.
Before 2026-08-22 each gate hand-maintained its own essay list and they
disagreed the same day both were written: `audit-content-flow.mjs`'s
`personalEssayFiles` list held `toccata-essay.html` plus three redirect
stubs; `check-density.sh`'s `ESSAY_FILES` held those same four plus
`skeptical-case.html` and `the-instrument.html`, so those two pages were
essays to one gate and not the other. A single JSON file both gates read
removes the possibility of that drift; there is nothing left to keep in
sync by discipline.

**What qualifies a page for `scripts/essay-pages.json`.** Continuous prose
is the product, not an intermediate draft of a widget: the page argues a
case, or is deliberately voiced, or is a hosted piece the site does not
edit. Every entry is exempt from this gate's pre-interaction and 60-word
paragraph limits; interrupting a real essay's prose with a toggle or
splitting its sentences is the defect the exemption exists to prevent. The
30-word cell limit still applies to every entry; a cell is a scanning tool
regardless of what kind of page it sits on.

Each entry also carries an `extended_word_limit` flag read only by
`audit-content-flow.mjs`, which is a separate question: whether the page's
own visible word count actually needs the 4,000-word ceiling instead of the
site's normal 2,400. Being an essay does not by itself justify a bigger
budget; the flag is set `true` only when the page's measured word count
requires it.

- `toccata-essay.html`: authored personal essay, deliberately voiced, 3,901
  visible words. `extended_word_limit: true`, since 3,901 exceeds 2,400.
- `skeptical-case.html`: argues a case in continuous prose; reverted
  2026-08-22 from a collapsed version because burying its argument was the
  worst defect found in that rewrite. 1,555 visible words, under 2,400, so
  `extended_word_limit: false`. It is an essay for this gate's density rules
  without needing a bigger content-flow budget nobody asked for.
- `the-instrument.html`: hosted guest piece by Moose, explicitly outside the
  site's checked claim set; the owner confirmed it stays untouched. 191
  visible words. `extended_word_limit: false`, for the same reason.

The three `toccata-expressiveness-upgrade*.html` files are redirect stubs
(a `<meta http-equiv="refresh">` and one sentence pointing at
`/toccata-essay`, no prose) and are not in `site-manifest.json`'s 25 live
pages. They do not belong on this list, or on any list either gate reads,
and are not.

**Reference and lookup pages.** A reader arrives at these already knowing
what they want, an argument spelling, a KIP's current status, a term's
definition, so a 150-word answer requirement is solving a problem this kind
of page doesn't have. The pre-interaction limit does not apply. The
paragraph and cell limits are not relaxed: a reference page can still bury a
lookup table's cell in a paragraph-length wall, and that failure mode is
exactly what those two limits exist to catch regardless of page type. Pages:
`sources.html`, `glossary.html`, `kips.html` (a KIP/KCC status tracker a
reader consults for one entry, not a piece to read start to finish).

**Answer and status pages.** Everything not listed above. This is where the
rule was right on day one and stays right: `status.html`,
`toccata-status.html`, `kaspa-claims-checker.html`, `chain-comparer.html`,
`build-on-kaspa.html`, `toccata-explained.html`, `index.html`,
`start-here.html`, `what-is-kaspa.html`, `why-kaspa-matters.html`,
`crypto-from-scratch.html`, `model-picker.html`, `kaspa-origin-story.html`,
`argent-explained.html`, `kaspa-mining.html`, `kaspa-developments.html`,
`about.html`, `search.html`, `404.html`. All three hard limits apply here in
full, unrelaxed, per the owner's instruction: these are the ones actually
doing work, and a status page that buries its answer behind 2,000 words of
prose before the first `<details>` is the exact failure this gate exists to
catch.

**Result of the rescope.** 46 hard violations before, 12 after. The 34
removed were `toccata-essay.html` and `skeptical-case.html`'s
pre-interaction and paragraph counts, plus `kips.html`'s pre-interaction
count, all now correctly out of scope. The 12 that remain are default-
category pages with a genuinely long pre-interaction run or an over-length
paragraph or cell, which is what the gate is supposed to catch:
`toccata-explained.html` (2,214 pre-interaction words and one 91-word
paragraph), `status.html` (311), `build-on-kaspa.html` (262),
`kaspa-claims-checker.html` (193), `toccata-status.html` (184),
`chain-comparer.html` (157 pre-interaction, plus one 61-word paragraph),
`index.html` (two paragraphs at 74 and 63 words), `kips.html` (one 63-word
paragraph, since the reference category doesn't relax the paragraph limit),
and `skeptical-case.html` (one 39-word table cell, since the essay category
doesn't relax the cell limit either). None of these are the rule being wrong
for the page; each is a page that has not yet had its answer moved above the
fold or its long paragraph or cell split, the actual next work this gate
exists to surface.

## Advisory (flag, do not fail)

**Total page word count.**
No single ceiling fits the range of pages on this site: a status page and
a protocol explainer carry legitimately different amounts of material.
Total length is a symptom, not a cause, of the actual problem, which is
how much of that length is forced onto the reader before they can act.
Fixing the three hard limits above compresses total length as a side
effect; gating on it directly would pressure someone to cut content that
is fine sitting behind a `<details>`, which is the opposite of what this
system is for.

**Number of `<details>` elements per page.**
More collapsible sections is not automatically better. A page that wraps
every paragraph in its own toggle to satisfy a count is worse to read than
one with three well-chosen ones. This stays a design-review question, not
a machine-checkable one: does each collapsed section hide something a
reader can skip, or something they came for.

**Reading time / Flesch-style readability scores.**
Directionally useful, frequently wrong on this content specifically:
technical terms (GHOSTDAG, DAA score, KIP numbers) and code identifiers
depress readability scores without making the sentence harder to parse
for the actual audience. Track it, do not gate on it.

## What stays out of the gate entirely

Voice, tone, and whether an answer block's claim is *correct*. Word counts
are checkable by a script; correctness is a claims-review problem this
gate is not built to catch, and conflating the two would let a
short-but-wrong answer block pass while a long-but-accurate one fails.
