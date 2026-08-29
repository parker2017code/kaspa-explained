# The bar, stated so it can fail

## How this file relates to design/THE-BAR.md

`design/THE-BAR.md` came first and is the richer document. It carries the voice
references (Ciechanowski, Levine, Stripe, Our World in Data, Rams), the design
references (Apple HIG, Linear, Tufte), the demo references (Ciechanowski, Nicky Case,
Bret Victor, Distill), and the credibility rules, each traced to a failure this site
actually had. It already states the governing test: if Apple, Google, Tesla or Meta
would not write it that way, design it that way, keep it that length, hide it that
way, put that information there, or leave that page stale, it does not ship.

**Read THE-BAR for what good looks like. Read this file for what is newly measured,
what authority you have, and which defects this site is shipping right now.**

Where they overlap, THE-BAR wins on voice, design and demo craft. This file adds seven
things THE-BAR does not have:

1. The authority grant below: permission to rewrite, redesign, delete and build.
2. **Authority over demos that already exist**, not only over new ones. An existing
   demo carries no more weight than an existing paragraph, and clarity to a newcomer
   outranks correctness, cleverness, and what it cost to build.
3. **The deletion test**, which is how you tell improvement from reproduction. Before
   rewriting a section, say what breaks if it is simply removed. If you cannot say, you
   have not recovered why it exists, and what follows will be a copy wearing new words.
4. **The requirement that a rewrite criterion be external.** Taste judged against taste
   converges on approval. Name what the page was optimizing for, and why that is wrong
   for the reader arriving today.
5. Density measured in numbers, including the 6,661-word panel no gate can see.
6. The stale hand-written counts found on this site on 29 Aug 2026, with ground truth.
7. The method section: watch gates fail, verifiers can be wrong, "blocked" is often a
   threshold someone chose.

Items 2, 3 and 4 were added late on 29 Aug 2026. A brief that summarizes this file's
contents may predate them. This list is the authority on what is in here, not the
summary in whatever brief sent you.

Two THE-BAR rules deserve restating because they are the root of defects found today:

- **"One fact, one home. A fact repeated on three pages goes stale on two."** That is
  precisely why the site says "21 models" in two places and "Twenty demos" in four
  while contradicting itself with "Eighteen" on the demos index. The fix is not to
  update the copies. It is to stop having copies.
- **"Show, do not assert. If the surrounding prose describes what the demo already
  displays, the prose goes."** That is the do-not-narrate rule below, and THE-BAR
  stated it first.

## Authority, granted 29 Aug 2026

The owner's words, and they are the frame for everything below: "I don't care if it
fucks up every page. I don't care what it changes about design. I don't care if it
changes every single word on the damn website. I care about the consistency,
coherency, that everything is written to spec."

So the mandate is not minimal-diff. It is:

- **Rewrite any word on the site.** Every page's prose is yours to change.
- **Change the design.** Layout, type, spacing, color, structure.
- **Add pages. Delete pages.** If a page does not earn its place, cut it. If
  something is missing, write it.
- **Build new demos and new visualizations** where you see the opportunity. This is
  a site whose whole argument is that you should play with the thing rather than
  read about it. A page making a claim with no way to test it is a candidate.
- **Rebuild or replace any demo that already exists.** The same authority that
  covers prose and design covers every demo on this site. An existing demo carries
  no more weight than an existing paragraph. If a newcomer cannot tell what they
  are looking at, what to touch, what just happened, or why it matters, the demo
  has failed, and being correct does not save it. Redesign its controls, change
  what it displays, throw it out and build a different one, or cut it and leave
  the page without one. Clarity to a newcomer outranks every other property a
  demo has, including how much it took to build and how clever it is. The one
  thing you may not do is quietly make it wrong.
- **Cut anything overbearing or unnecessary.** Too much of something, too little of
  something, both are defects.

The demo grant above was added partway through the 29 August rebuild. Any page
finished before it landed was worked under weaker wording that granted the right to
build new demos but never said an existing one could be torn out. `index.html`,
`start-here.html`, `crypto-from-scratch.html`, `what-is-kaspa.html` and
`why-kaspa-matters.html` are those pages. A demo left standing on them is unexamined,
not approved.

**That re-look belongs to the integrating agent, and to no one else.** A page gets one
owner. A rebuild agent that reaches outside its assigned pages produces two conflicting
plans applied to one page, which is worse than either plan applied whole, and it is the
defect this run is already at risk of. So: rebuild agents, stay on your own pages even
when you can see a weak demo on someone else's. Report it instead. The integrating agent
judges those five pages against the newcomer test, fixes what is small and clear, and
reports any demo needing a real rebuild as unreached rather than rushing it at the end of
a long run. Unreached and named beats rebuilt and unverified.

What is being optimized, in the owner's order: consistency, coherency, written to
spec. Then: more beautiful, cooler, new features earned rather than bolted on.

### Rewrite or iterate is YOUR decision, per page

The owner, explicitly: "I'm not saying you have to. I'm not saying you should. I'm
not saying you shouldn't. I'm saying that it should decide."

So do not ask, and do not default. For each page, decide whether it is repaired or
rewritten from nothing, and state which and why in your report. A page that needs
its structure changed, its argument reordered, or half its prose cut is usually
faster and better rewritten than patched. A page that is sound and carries three
defects is patched.

**The existing prose carries no authority.** It was written by a weaker model. It is
inherited, not binding, in exactly the sense PRINCIPLES.md means: yours to break with
a reason. Do not preserve a sentence because it is there. Do not preserve a structure
because it is there. The only things that survive on their own merit are the facts,
the sources, and anything measured.

Design is inherited too. If the layout, type scale, spacing or color is working
against the page, change it. If it is fine, leave it and say you judged it fine.

### The test, in both directions

"Would Apple, Meta, Tesla, SpaceX or Google publish this, like this? Would they leave
this much information here? This little?"

Both halves matter and the second is the one that gets missed. Overwhelming and
underwhelming are both defects:

- **Too much:** a 6,661-word panel behind a toggle. A caption restating the graphic.
  Three sentences where one carries the idea. A methodology note next to a control.
- **Too little:** a claim with no way to test it on a site whose whole argument is
  that you should test things. A number with no unit. A demo with no statement of
  why it matters. A page that asserts something and offers the reader nothing to do
  with it.

Ask both questions on every page and answer both in the report. A page can fail one
and pass the other.

### Meticulous means line by line, element by element

Not a skim for obvious breakage. Every line of visible text, every control, every
label, every caption, every axis, every legend, every heading, every empty state.
Each one either earns its place against the bars below or it goes.

### Scope is every line in the repo, not only what a reader sees

The owner, 29 Aug 2026: it goes over every single line of code in the repo. So this
standard is not a copy standard that happens to mention code. `styles.css`, everything
under `scripts/`, the gate scripts themselves, the data files, and the JavaScript inside
every demo are all in scope and all held to the bars below.

The deletion test bites hardest here, because code hides its dead parts better than
prose does. Each of these is a defect, not clutter:

- A CSS rule that matches nothing, or that is overridden everywhere it applies. This
  file's stylesheet has real cascade debt: the same selector is redefined at several
  points, so a rule can look load-bearing and be inert.
- A script nobody runs. `scripts/refresh-model-data.py` is dead and must never be run;
  the live path is `build-picker-data.py` into `emit-picker-blob.py`. A dead script beside
  a live one is a trap for the next reader, not neutral.
- A constant left behind when the shape of the data moved. This repo's recurring bug,
  documented in `WORKING-STATE.md`, and the reason two `MIN_METRICS` with different values
  exist at different pipeline stages.
- A check that cannot fail. Watch it fail on a deliberate violation, or delete it. A gate
  reporting success it cannot distinguish from silence is worse than no gate, because it
  buys confidence without earning it.
- A comment describing behavior the code no longer has.

Do not refactor for taste. Deletion and correction need the same external criterion as a
page rewrite: say what breaks if it goes, and if nothing breaks, it goes.

### A judge holding only a description will rubber-stamp

Separate judging from building structurally, not by intention. A judge holding reference
images and measured targets cannot rubber-stamp; a judge holding a description of what
someone says they did will. Whoever verifies this rebuild is verifying reports written by
the same kind of process that wrote the pages, and a fluent, specific, confident account
of broken work is the characteristic output of that process.

So the measured baseline is in the repo rather than in a brief:
**`data/ground-truth-2026-08-29.json`**, counted from repo data and not from prose. It
carries the real counts, the per-page density measurements taken before any rewriting,
every inconsistency found sitewide, the stale numbers already fixed, and what the counting
pass could not reach.

Verify against that file, not against what an agent reported. Where a page's claim and
that file disagree, the file wins until someone recounts from the data and says so. Four
numbers worth knowing before reading any page: 23 models across 9 labs, 6 dials, 18
distinct demos with 19 instances, and 20 chains. The site has said 21, 10 and 20 demos in
various places, and each of those was wrong.

If you cannot check a claim against a measurement, say so and mark it unverified. An
unverified claim named is worth more than a verified-sounding one that was only read.

### The one exclusion

**Do not touch The Instrument** (the-instrument.html and anything under it). It is a
279-page work by Moose, hosted here in full as guest content. Editing another
person's writing is not within this grant, whatever else is. Fix the page's
containing chrome if it is broken; leave his text alone.

### What this authority does not license

It is not permission to churn. A rewrite must be better on a stated criterion, named
before you start and measured after. "I rewrote it and prefer this" is not a reason.
Deleting a page needs an argument for why the site is stronger without it, and a
check that nothing links to it.

The criterion has to be external, because taste evaluated against taste converges on
approval every time. Without an outside measure, "made it better" reduces to "made it
mine." So: name what the existing page was optimizing for, say why that is the wrong
thing to optimize for the reader arriving today, and measure the rewrite against that.

Two failure modes look identical to a rewrite that works. The first is averaging: the
page comes out competent, well organized and interchangeable with what any model would
produce for this topic. Fluency does not rescue it; a confident, specific centroid is
still a centroid. The second is copying a particular source, which beats the average but
produces a derivative carrying constraints that belonged to someone else's problem. Only
improvement survives, and improvement requires knowing why each part of the existing page
exists before replacing it.

**Deletion is the test, and it is the one you can run on yourself.** Before rewriting a
section, say what breaks if it is simply removed. If you cannot say, you have not
recovered the reason it was there, and what follows will be reproduction rather than
improvement. Anything genuinely understood can be stripped to what this page needs now.
Apply the same test to a demo before rebuilding it, and to your own new prose before
shipping it. See PRINCIPLES.md for why this check binds harder on a model than a person.

And it does not license fabrication. Every claim on a rewritten page still needs a
source, every number still needs to be recomputed or cited, and a demo you build is
held to exactly the comprehension and density bars below. Freedom over form; none
over truth.

Written 29 Aug 2026. The owner's phrasing: "Apple, Tesla, Meta vibes. If they
wouldn't deploy it, neither should we." That is an adjective. Below is what it
means in numbers, so the work can fail rather than be approved by taste.

Anything here that cannot be measured is marked as a judgment call and named as
such. Do not treat a judgment call as a gate, and do not treat a gate as taste.

## The comprehension bar, which outranks everything below it

The owner's words: any normal person should be able to understand it, use the demo,
and understand what it does and why it matters. A page can pass every rendering
gate in this file and still fail here, and failing here is worse.

The site's own existing bar, in design/THE-BAR.md, is someone with a high school
diploma and a rough idea of what crypto is, given no help. This is that, stated as
four things a reader must get without assistance:

1. **What am I looking at.** Within seconds of landing, before touching anything,
   a reader can say in their own words what the demo is showing. Not the mechanism.
   The thing.
2. **What do I touch.** The primary control is obvious without instruction. If a
   reader has to read a paragraph to know where to start, the demo has failed.
3. **What just happened.** After moving one control, the change is visible and the
   readout says what changed in plain words, with units. Not a symbol. Not a bare
   number. "4.3 minutes" not "t = 258".
4. **Why does this matter.** The page states why the reader should care, in one
   sentence, near the demo. Not implied by context, not left to the surrounding
   prose, not a "why this matters" heading. Stated plainly and once.

### How to test it, rather than assume it

Drive each demo as someone who has never seen this site and does not know what a
blockDAG is. Then answer the four questions above out loud. If you cannot answer
one of them from what is on screen, that is the defect, and the fix is on the page,
not in your report.

Specific failures this bar catches, all of which have shipped here:

- A bare symbol in a readout with no gloss. `D =`, `k =`, `margin (k)`. A reader
  who does not already know cannot learn it from the page.
- An abbreviation on first use with no expansion. "TPS" before "transactions per
  second (TPS)".
- A number with no unit or condition. "307" instead of "307 transactions fit in one
  block".
- A demo that is correct and pointless to a newcomer because nothing says why the
  thing it demonstrates is worth knowing.
- Prose that explains the mechanism before saying what the mechanism is for.

### Do not narrate what the interaction already shows

The mirror of the bar above, and just as important. State what a reader cannot
discover by using the thing. Cut what they can.

A reader learns by moving a control and watching the result. Text that announces
what they are about to observe is noise, and it quietly implies the demo is not
trusted to speak for itself.

**The example the owner gave, on model-picker.html.** Each dial carries a label
reading "separates", "barely separates" or "cannot separate" the leaders. But a
dial that cannot separate the leaders produces no movement in the ranking when a
reader moves it. They see that directly. The label explains the thing the
interaction already demonstrates, so it should not be there. The reasoning behind
it belongs in the methodology, once, for the reader who goes looking.

Apply the test to every piece of text next to a control:

- Would the reader learn this by moving the control? If yes, cut it.
- Would the reader learn this only by being told? If yes, keep it, once.

What survives that test is usually: what the thing is, what the units are, where
the number came from, and why it is worth caring about. What usually dies: a
restatement of the effect the reader is about to see, a status label that duplicates
what the display already makes obvious, and any sentence explaining that the tool
works the way it visibly works.

This is not the same as cutting explanation. A demo can need a sentence saying why
it matters and simultaneously need a status label removed. Judge each piece of text
on whether the interaction already carries it.

### The line between this and taste

This bar is not about beauty. A plain page that a newcomer understands passes. A
polished page that leaves them guessing fails. Where you believe a page only looks
wrong, that is taste and belongs in your report, not in a rewrite. Where a reader
cannot answer one of the four questions, that is a defect and you fix it.

## Density: ideas per scroll, and depth that is still readable

Closed depth is not free. A disclosure hides text from the first screen; it does not
excuse the text. The reader who opens it is the reader who most wanted an answer,
and handing them an essay fails them specifically.

**The measured case, on model-picker.html as of 29 Aug 2026.** Opening "How the
score works" yields **64 bullets, 6,661 words, averaging 104 words each, longest
214, with 55 of 64 running over 60 words.** The site's visible-word ceiling is 300
per page. This shipped because `check-visible-words` does not look inside closed
disclosures, which is the same blind spot as every other defect in this file: the
gate covers what it was written for and is silent on the thing beside it.

### The rules, with numbers

1. **One idea per screen.** A reader scrolling should meet one new idea per
   scroll-length, not five. Where two ideas are adjacent and independent, they need
   separation a reader can see: a heading, a rule, whitespace, a different shape.
2. **A paragraph is under 60 words.** Over that, it is two paragraphs or it is
   cuttable. Applies inside disclosures exactly as outside them.
3. **A disclosure that opens into more than roughly 800 words is a page, not a
   panel.** Move it to its own reference page and link to it. A panel is for the
   answer to one question. An argument with sixty parts is a document.
4. **Methodology is reference material.** It belongs somewhere a reader can arrive
   at deliberately, structured with headings they can scan and skip. Inline behind a
   toggle it is unreadable and it makes the tool look like it is hiding something.
5. **Nothing on a page repeats.** If a claim appears in a caption, a readout and a
   methodology note, two of those are noise.

### How to fix, in order of preference

Cut it. Most of these bullets exist because something was learned and written down,
which is a reason to keep a record, not a reason to put it on a page a stranger
reads. The record belongs in the repo.

Then: move it. A reference page carries depth better than a panel and can be
structured, scanned and linked to a specific section.

Then, only for what genuinely must sit beside the tool: compress it to one sentence
that a newcomer can act on, and link the rest.

### Apply this to every page, not just the picker

Every disclosure, every long panel, every stack of prose. Count the words inside
closed elements, because no gate on this site does. Report the count per page before
and after.

## Hand-written counts: found stale, on this site, right now

Every number written into prose by hand goes stale silently. It reads exactly like a
true one. Measured on 29 Aug 2026, against the actual data:

| claim in prose | places | ground truth |
|---|---|---|
| "21 models" | 2 | **23 models in the picker blob** |
| "Twenty demos" | 4, including README | unverified |
| "Eighteen interactive demos" | 1, on demos/index.html | unverified |
| "Twenty L1s" | 1 | 20 in data/l1-chains.json, correct |

The site contradicts itself on its own demo count: four places say twenty, the demos
index says eighteen, and nobody has counted. The model count is two roster changes
behind.

### The rule

Every count stated in prose either derives from the data at render time, or it has
been verified against the data in this session and the verification is stated. There
is no third option. A count you cannot verify gets removed, not carried forward.

### What to do in the sweep

1. Establish ground truth first, by counting from the data: models in the picker
   blob, chains in `data/l1-chains.json`, demos actually present on pages, pages in
   `site-manifest.json`.
2. Grep every page, the README, nav cards, page-map entries, meta descriptions and
   `demos/index.html` for numbers stated in words or digits.
3. Fix each against ground truth, or delete the number where the sentence works
   without it. "Eighteen interactive demos" is usually better as "every demo".
4. Report the before and after for each, with the ground truth you counted.

Prefer deleting the count. A number that must be maintained by hand will be wrong
again within a month, and a sentence that survives without it is stronger.

## Binding, non-negotiable

- `bash scripts/check-site.sh` ends in `Site checks passed.` Nothing ships otherwise.
- Reading grade under 9.0 sitewide. Enforced.
- No fabricated number, ever. Every figure recomputed from data in this repo, or
  cited to a board with column and read date. If it cannot be recomputed and
  cannot be cited, it is cut.
- Accessibility holds: keyboard reachable, focus visible, contrast passes,
  aria-live on anything that updates.
- No claim on a page that no one has checked.

## Measurable, per page

1. **Nothing renders blank or broken.** Zero blank readouts, zero NaN, zero
   Infinity, zero undefined, zero bare "-" placeholders, in the default state and
   at every control's minimum and maximum. Zero console errors at 390px and
   1280px in both themes.
2. **Every demo opens showing the thing it teaches.** Not a degenerate state, not
   a zero, not an empty set. A first-time visitor sees the phenomenon before
   touching anything.
3. **Every control does something on first touch.** A control that produces no
   visible change at the default state is a defect.
4. **Real-world anchors are real.** Where a demo models something with a true
   current value, the default is that value, labeled as measured, with its date.
   A stale figure is reported, never guessed fresh.
5. **No horizontal scroll at 390px.** Tables, diagrams and code blocks scroll
   inside their own container, never the page body.
6. **Every rendered number is traceable.** A reader can find, on the page, where
   it came from and when it was read.

## The Apple/Tesla/Meta test, made concrete

Those companies do not ship: placeholder text, a control whose effect is
invisible, a caption that contradicts the graphic beside it, a number with no
provenance, a page that reflows on a phone, or a claim the team has not checked.
Every one of those is measurable and each is a gate above.

What is left after that is genuinely taste, and taste is the owner's call, not an
agent's. Where an agent believes a page falls short on taste alone, it says so in
its report with a specific alternative, and does not rewrite on that basis.

## The trap this repo keeps falling into

Every defect that mattered this session passed every automated gate:

- A caption reading "to scale" over a grid capped at 71 dots.
- A bar drawing 100% full beside text saying 0.39%.
- A demo about a parameter, opening in the state where the parameter does nothing.
- A click handler falling through to "on the main chain, so it always counts" on a
  block the diagram showed locked out.
- In a reference tool elsewhere: points positioned on the active axis while the
  labels beside them used a stale one, with a passing assertion that "no points
  fall off-frame."

The shape is always the same. The check covers the thing it was written for and is
silent on the thing beside it. So: for every check, ask where it could pass while
the artifact is wrong, and say so if it can.

## Method, learned the hard way

- Watch every gate fail on a planted violation before trusting it to pass.
- Look at the artifact, never the report about it. Screenshot and read it.
- A verifier can be less reliable than the thing it verifies. When a check fires,
  confirm the check is right before changing anything to satisfy it.
- "Blocked" is often a threshold someone chose. Distinguish a real absence of data
  from a cutoff you or your brief set.
- Depth before breadth. Get one page right, prove it, then replicate.
- Report what was not done. Silence reads as completion.
