# The bar

Four standards, each with named references. Cite this file in agent
briefs rather than restating it, and quote the relevant paragraphs into
the brief rather than telling an agent to read the whole thing.

The governing test sits above all four: if Apple, Google, Tesla, or Meta
would not write it that way, design it that way, keep it that length,
hide it that way, put that information there, or leave that page stale,
it does not ship.

---

## 1. Voice: friendly, useful, never cringe

### What we are aiming at

**Bartosz Ciechanowski** is the closest thing to a model for this site.
His pieces on gears, the internal combustion engine, and GPS explain hard
mechanisms to strangers with no condescension and no hype. He never
writes a sentence about how exciting the topic is. He shows the thing,
lets the reader move it, and trusts them.

**Matt Levine** is the tone reference for handling a subject full of
nonsense without becoming cynical or credulous. He is funny without
performing, skeptical without sneering, and he explains the mechanism
before he judges it.

**Stripe's documentation** is the reference for respecting a reader's
time. It answers the question first and offers depth after. It never
opens with a paragraph explaining what the page is about.

**Our World in Data** is the reference for letting numbers carry an
argument without dressing them up, including when the numbers are
inconvenient.

**Apple's product pages** are the reference for confident plain
description of a technical thing. They say what a chip does. They do not
say the chip is revolutionary and then decline to explain it.

**Dieter Rams** applies to prose as much as objects: good design is as
little design as possible. A sentence is finished when nothing can come
out.

### What cringe actually is, specifically

Cringe is not a vague feeling. It is a short list of identifiable moves,
and every one of them is banned here:

- Telling the reader how to feel about a fact instead of giving them the
  fact. "Remarkably," "incredibly," "game-changing," "revolutionary."
- Announcing what you are about to do. "Let's dive in." "Here's why this
  matters." "In this section we'll explore."
- Rhetorical questions used as headings.
- The "it's not just X, it's Y" construction, and its cousin, "this isn't
  about X, it's about Y."
- Fake intimacy. "You might be wondering." "Trust me on this one."
- Hype vocabulary borrowed from crypto marketing: seamless, unlock,
  empower, leverage, utilize, robust, ecosystem as a synonym for nothing.
- Performed enthusiasm. Exclamation marks. "Pretty cool, right?"
- Hedging that protects the writer rather than informing the reader.
  Caveat-stacking past the one place a status label needs to appear.
- Explaining the joke. If a line is funny, it is funny once and without
  a follow-up sentence pointing at it.
- Em dashes. Banned outright on this site, in every file, for any reason.

### What friendly actually means here

Friendly is not warmth vocabulary. It is these behaviors:

- Answering the question that was asked, first, in the first sentence.
- Defining a term at the moment it appears, not in a glossary nobody
  opens.
- Admitting what is not known, plainly, without apologizing for it.
- Never making a reader feel stupid, in either direction: unexplained
  jargon and over-explanation both do it.
- Second person only in genuinely procedural content, a walkthrough
  someone will follow. Everywhere else, subject first, no narrator.

### The read-aloud test

If a sentence would sound strange read aloud to a smart stranger, it is
wrong. That single test catches more than any rule list, and it is the
one to apply when the rules disagree.

---

## 2. Design: macOS and iOS

### What we are aiming at

**Apple's Human Interface Guidelines**, and macOS and iOS themselves, set
the bar. Not "modern," not "clean," Apple specifically.

**Linear** is the reference for restraint at density: a lot of
information, no decoration, everything legible.

**Stripe** for typography and for hierarchy that survives at any width.

**Things by Cultured Code** and **Panic's** apps for how much space a
confident interface leaves empty.

**Tesla and SpaceX** for letting one object carry a screen.

**Edward Tufte** for the underlying principle: maximize the share of ink
that carries information, and delete the rest. Every border, divider,
shadow and gradient must justify itself against that.

**Dieter Rams' ten principles**, particularly that good design is
unobtrusive and as little design as possible.

### The rules that follow

- **Space is the primary tool.** Separate with distance, not lines.
  Delete borders first, add a background step second, draw a line last
  and rarely. Cramped is the tell.
- **Type carries hierarchy, weight does not.** Real size steps, tight
  tracking on large text, generous line height on body. One weight jump,
  not three. Three sizes of bold is no hierarchy.
- **Content leads, chrome recedes.** The thing the reader came for is
  largest, first, highest contrast. Controls and navigation sit quieter
  than what they serve.
- **Response is immediate and physical.** Change in the same frame.
  Easing that decelerates, never linear. Values animate to a new state
  rather than snapping. Nothing waits for an apply button. Honor
  prefers-reduced-motion with a static equivalent that still responds.
- **One obvious thing to do.** A demo with six equal controls gets no
  engagement. Secondary controls are visibly secondary or they are cut.
- **No decoration.** No gradient as ornament, no shadow not conveying
  elevation, no emoji as iconography, no color that is not carrying
  meaning. Glass is banned sitewide, including tinted sheens, flat
  translucent fills, and rgba-white borders.
- **Color carries meaning or it does not appear.** Status colors come
  from the token system, never hardcoded, so one concept keeps one color
  everywhere.
- **Numbers a person can hold.** Rounded on screen, human units, full
  precision behind a disclosure.
- **44px minimum touch target.** Non-negotiable at every width.
- **Both themes, always.** Light theme is not an afterthought and gets
  checked as carefully as dark.

---

## 3. Demos: the thing the site actually is

### What we are aiming at

**Bartosz Ciechanowski** again, and he is the single best reference. His
diagrams are draggable, they respond instantly, and the reader learns by
moving the thing rather than by reading about it.

**Nicky Case**, particularly The Evolution of Trust and Parable of the
Polygons: play first, explanation second, and the reader discovers the
result rather than being told it.

**Bret Victor**, Explorable Explanations and Up and Down the Ladder of
Abstraction, for the underlying argument that a reader should be able to
manipulate a system rather than receive conclusions about it.

**Distill.pub** for interactive figures that are rigorous and still
legible.

**3Blue1Brown** for building intuition before formalism.

### The rules

- **Every page carries a demo.** If none fits, build one. The exceptions
  are pages that already are interactive.
- **The high school test.** Anyone with a high school diploma and a rough
  idea of what crypto is must know what the demo shows and what to touch,
  immediately, with no help and nothing read outside the demo. A longer
  caption does not rescue a failing demo. Correctness does not rescue it
  either.
- **Show, do not assert.** If the surrounding prose describes what the
  demo already displays, the prose goes.
- **Every number says what it is a number of**, its unit, and whether it
  is measured, modeled, or a protocol constant.
- **A control must produce visible change.** If moving it changes
  nothing legible, that is a defect, not a subtlety.
- **No non-answers.** "Too long" and "past any wait worth naming" are the
  demo refusing to answer its own question.
- **A demo that flatters Kaspa is worth less than one that does not.**
  The reader can tell, and the argument only survives if the numbers were
  allowed to fall where they fell.
- **One screen.** A demo that needs scrolling to be understood has not
  been designed yet.

---

## 4. Credibility, accuracy, accountability

### What we are aiming at

**Our World in Data** for showing the data and the method together, and
for publishing the inconvenient series alongside the convenient one.

**ProPublica** and the **Financial Times** for correction culture: when
something is wrong, it is fixed visibly and the record says it was fixed.

**Wikipedia's sourcing norms** for the discipline that a claim without a
source is not a claim, and that a source has to actually support the
sentence attached to it.

**Ben Goldacre** for the habit of checking the primary source rather than
the summary of it, and for treating a confident secondary account as
worth less than a boring primary one.

**Distill.pub's** review standard: a figure has to be reproducible from
what is published.

### The rules, each of which exists because this site broke it once

- **Every claim needs a primary source.** Marketing pages are banned and
  the ban is enforced by a gate. Third-party explainers are not sources.
- **Never present a protocol constant as a measurement.** Bitcoin at
  exactly 600.0 seconds and Polkadot at exactly 6.0 both shipped here as
  observations. Round numbers are the tell.
- **Never present a model as an observation.** Say which it is, on
  screen, next to the number.
- **A live figure is only live if it was read live**, tested by browser
  fetch on the real origin, never by curl. The original bug shipped
  because curl succeeded where the browser was CORS-blocked.
- **A failure path must be visible.** If a live read fails and the page
  falls back to a baseline, the page says so. A silent fallback showing
  stale numbers as current is worse than an error.
- **Quotations are verbatim.** Three silently smoothed quotes were found
  here. Ninety-five percent right is wrong.
- **Invented examples say they are invented.**
- **Status labels are load-bearing.** Live, targeted, roadmap, research.
  Nothing counts as shipped without a merged proposal and a release tag.
  The same thing carries the same label everywhere it appears.
- **One fact, one home.** A fact repeated on three pages goes stale on
  two. Duplication is how this site produced a real error: the same
  statistic appeared twice on one page and the copies drifted apart.
- **Weaknesses appear where the strength is claimed**, not one page over
  and two clicks down. A demo headlining a flattering number with the
  qualifying fact hidden behind two clicks is the site arguing rather
  than teaching.
- **Conflicts are disclosed.** The maintainer may hold KAS. It sits in
  the footer of every page.
- **Rules leak unless mechanized.** Every rule fixed by hand came back.
  When a class of defect is fixed, add a gate for it, and watch the gate
  fail before trusting it to pass.
- **A gate can be wrong.** On this repo a blocked commit is as likely to
  be a stale rule as a bad change. Fix the rule in the open, with the
  reason stated, and never by loosening it for everything else.
