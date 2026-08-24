# The standard: macOS and iOS

The bar for every page, every demo, every control on this site is Apple's own
software. Not "modern startup." Not "clean." macOS and iOS specifically.

Owner's words: "UI UX should be superb. Modern. Feel like a modern startup,
crypto, Tesla, Apple. Apple is the vibe. It should feel awesome and cool and fun."
And the failure he named: "the clunky AI LLM square interface that someone just
told them their AI made half assed and then stuck out to them."

## What this changes

**Space is the primary tool.** Apple separates things with distance, not lines.
Delete borders and dividers first, add a background step second, draw a line last
and rarely. Padding is generous and consistent. Cramped is the tell.

**Type carries hierarchy, weight does not.** Real size steps, tight tracking on
large text, generous line height on body. One weight jump, not three. A page with
three sizes of bold has no hierarchy.

**Content leads, chrome recedes.** The thing the reader came for is the largest,
first, and highest-contrast element. Controls, labels and navigation sit quieter
than the content they serve. A title that shouts over its own page is wrong.

**Response is immediate and physical.** Touch produces change in the same frame.
Motion uses easing that decelerates, never linear. Values animate to their new
state rather than snapping. Nothing waits for an apply button. Honor
prefers-reduced-motion with a static equivalent that still responds instantly.

**One obvious thing to do.** Apple screens have a single primary action. A demo
with six controls gets no engagement; one with a slider you cannot miss gets used.
Secondary controls are visibly secondary or they are cut.

**Restraint over decoration.** No gradients as ornament. No drop shadows that are
not conveying elevation. No emoji as iconography. No color that is not carrying
meaning. If removing it costs nothing, remove it.

**Plain words at the point of use.** Apple never makes you learn a term to use a
control. Jargon appears with its meaning in the same label, or does not appear.

**Numbers a person can hold.** Round on screen. Human units: days and weeks, not
raw seconds. "Halves in a year," not an exponent. Full precision belongs in the
collapsible.

## The test

Load it cold. If it reads as something generated and never re-read, it fails,
regardless of whether the content is correct. Correct and unusable is still a
failure on this site.

## What this site is for

The job is to represent concepts visually, so a reader sees a thing happen
instead of reading a claim that it happens. Every page here is a learning
resource first and an argument second. The bar for how it looks and feels is
macOS and iOS, stated above; the bar for what it does is that a reader leaves
able to explain something they could not explain before.

## Weaknesses are the material, not the risk

Where Kaspa is weak, show the weakness plainly and let the reader see it for
themselves. Kaspa's blocks are nearly empty today, fee revenue runs far below
the block subsidy, and the chain loses on several of the jobs the comparer
scores. None of that is a thing to soften or bury. Shown honestly, it reads as
an accurate account of where the work is, which is the only reason a skeptic
has to trust anything else on the site.

A demo that flatters Kaspa is worth less than one that does not, because the
reader can tell the difference and the argument only survives if the numbers
were allowed to fall where they fell.

## The 300-word surface

No page shows more than 300 visible words. Not a target, a ceiling.

Longer content is fine and often necessary. It does not sit on the
surface. Move it behind a mechanism, and vary the mechanism: an info
affordance at the point of use, a disclosure whose summary line says
what is inside, a tooltip on a term, a secondary view the reader
switches to, a panel that appears only once the reader has done the
thing it explains. Reaching for the same collapsible on every page is
the failure this rule exists to prevent, not the fix.

Two errors to avoid, both already committed on this site once:

Hiding the primary content. If what the reader came for is behind a
click, the disclosure is inverted. Cut long primary content instead of
burying it.

Chrome that states the obvious. A line telling the reader which site
they are on is noise. If removing a sentence costs the reader nothing,
it was never earning its place.

## The page-length ceiling

The owner, immediately after saying this has to be a site Meta, Apple, or
Tesla would publish: "no page should be more than 3 page lengths on
normal screen, maybe 5 or equiv on smartphone." That was tried as a flat
rule, applied to every page, and it failed its own justifying test: Apple's
product pages and Tesla's own site run well past ten screens, so a rule
that would fail Apple's and Tesla's pages cannot be the rule a site like
theirs follows. Total height was never the actual defect. When a rule and
a good page disagree, the page wins and the rule gets fixed, in the open,
with the reason stated. This is that fix.

What actually makes a page feel long is undifferentiated scroll:
paragraph after paragraph with no landmark and no sense of progress. What
keeps a long page from feeling long is the opposite: every screen carries
one idea and one thing to look at or touch. That is the thing to measure,
and it splits the rule into three parts.

**1. A hard open-height ceiling, but only for pages whose job is to route
or answer.** `index.html`, `start-here.html`, `status.html`,
`search.html`, `404.html`. These have no business being long at all, and
the owner's original number is exactly right for this class: total
document scroll height stays at or under 3 viewport heights at desktop
and at or under 5 at phone width, measured with nothing expanded.

**2. Sitewide, a cap on consecutive undifferentiated content.** No page,
including long-form guides, runs more than roughly one viewport height of
continuous prose without hitting a landmark: a demo, an interactive
control, an image, an svg, a canvas, a diagram, a chart, or a table.
Headings do NOT count. A heading tells a reader what is coming; it does
not give them anything to look at or touch, which is the actual reason
Apple's ten-screen pages do not read as long. The first version of this
rule counted headings as landmarks and passed every page on the site the
same day the owner was pointing at those same pages as too long -- a wall
of text with a heading dropped in every few paragraphs is still a wall of
text, and a rule that cannot see that is not measuring the thing it
exists to catch. A closed disclosure does not count as a landmark on its
own either, since a closed summary line is a heading wearing different
clothes; it counts only if what a reader can see without opening it
already contains one of the above. This is the measurement that predicts
whether a page reads as long, and it lets a guide be long while forcing
it to earn its length rather than banning length outright. It is the same
shape as the 300-word surface becoming a per-section rule on long-form
pages, for the same reason.

**3. Everything past the page's answer stays closed on arrival.** Already
stated above for the 300-word surface; what changes here is that it now
gets measured instead of only asserted, since part 1's open-height figure
is exactly the number that reveals whether a route/answer page is
following it.

The failure mode to watch for is the same one banned above, and it
applies to all three parts: hitting a ceiling by collapsing primary
content instead of cutting or moving it. The page's answer, what the
reader came for, stays open on arrival. Depth closes. A page that meets a
number by folding its lead answer into a disclosure has not met the rule,
it has broken a different one to get there.

Enforced by `scripts/check-page-height.mjs`, wired into
`scripts/check-site.sh` as advisory behind `PAGE_HEIGHT_BLOCKING`, same
pattern as `VISIBLE_WORDS_BLOCKING` and `RENDER_GATE_BLOCKING`. It flips
to blocking once every page is under both the hard ceiling and the
undifferentiated-run cap.

## Reference points

macOS and iOS set the bar, and they are not the only reference. Google
gets some things right, Tesla's sites read well, and Meta's products
have genuinely good interface work in them. Borrow from whichever
solves the problem in front of you.

What carries across all of them is the same short list: space doing the
work instead of lines, type carrying hierarchy instead of weight,
content leading while chrome recedes, immediate physical response to
input, and one obvious thing to do. A change that improves readability,
legibility, or how the thing feels under a hand is welcome at any size.
A change that is merely different is not.

## How every sentence gets written

Write about Kaspa the way Apple writes about a chip, Google writes about
a model, or Tesla writes about a drivetrain. Confident, plain, specific.
The reader is smart and busy. Nothing is being sold to them, and nothing
is being hedged at them either.

Every word is accounted for. If a word can come out and the sentence
still says the same thing, it comes out. If a sentence can come out and
the section still teaches the same thing, it comes out.

Eliminate weird. Weird is anything that makes a reader stop and reread:
a clause that unpacks backward, a term nobody defined, chrome that
states the obvious, a caption arguing with the thing it captions, two
pages describing the same mechanism in different words. If a sentence
would sound strange read aloud to a smart stranger, it is wrong.

Consistency is part of the voice. One name per concept across the whole
site. One phrasing for a fact that appears twice. A reader who moves
from a demo to a guide should not feel handed to a different writer.

### On the rules in this document

A rule here exists to make the page good. When a rule and a good page
disagree, the page wins and the rule gets fixed. The 300-word ceiling
became a per-section rule on guides for exactly this reason: applied
literally it would have buried a mining guide behind a disclosure
triangle, which is the failure the ceiling was written to prevent.

This is not license to ignore the rules. It is a requirement to know
what each one is for. Break one deliberately, in the open, with the
reason stated. Never break one by forgetting it.

## Verification that actually counts

Every change is checked at three widths, 390, 768, and 1280, in BOTH
themes, before it is called done. Not a spot check. Not one width and an
assumption about the rest.

Local passing is not evidence the live site works. Check kaspaexplained.com
after deploying. A fix that exists only on disk has not shipped, and the
owner has repeatedly been shown defects that were already fixed locally
and never pushed.

The owner does not find defects. If he finds one, the process failed. He
reviews judgment calls, not bugs.

## Reference points, expanded

Apple, iOS, and macOS set the bar for restraint and for color used to
mean something rather than to decorate. Also worth borrowing from:
Google for information density that stays scannable, Tesla and SpaceX
for confident sparse pages that let one object carry the screen, Meta
for interface consistency across surfaces.

The common thread is that none of them explain what the reader can see.
They show the thing and get out of the way.

## Ten ways to hide something

The owner's framing: "There are probably literally ten different ways to
hide the information in interesting ways, so that if I need to find it I
will, but if I don't need to find it I won't, and I can still stay
engaged with the page."

That is the target. Not one disclosure triangle swallowing a page, and
not a wall of everything. A reader moves through the page and pulls in
only what they need, and the pulling is itself interesting.

The site has three components so far: the info affordance, the term
definition reveal, and the view switch. Three is not ten. Build more when
material calls for something that does not exist yet, and document each
one in `design/house-style.md` so the next page can use it.

The failure mode to avoid is uniformity. The same mechanism on every page
reads as a template. Vary it.

## Shape

A page is a thing a reader moves through, not a document they receive.
When a page is described as "an awful shape," length is usually the
symptom and structure is the cause: everything sitting at one level, in
one column, at one weight, with no sense of what matters most.

Before cutting words, ask what the page's primary content actually is.
Usually it is one or two things. Everything else is depth. Depth stays,
one move away, and never in the reader's face on arrival.

## The test

Before anything ships, ask whether Apple, Google, Tesla, or Meta would
do it. Write it that way, design it that way, keep it that long, hide it
that way, put that information there, or leave that page stale.

If they would not, it does not ship. That is the whole standard. Every
other rule in this document is an attempt to describe some part of it,
and where a rule and this test disagree, this test wins.

Applied honestly it is demanding. None of those companies ship a page
nobody reads. None of them leave a page stale and still linked. None of
them put a directory of two hundred links in front of a reader. None of
them write a heading like "Kaspa claims checker."

## Reference pages are usually not pages

A glossary is not something anyone reads. It is definitions a reader
needs at the moment they hit an unfamiliar word, which is what the term
definition reveal is for.

Sources are not something anyone reads either. A source belongs attached
to the claim it settles, reachable from that claim.

The same question applies to any page whose job is to hold reference
material: does a reader ever arrive here on purpose? If the honest answer
is no, the material belongs where it gets used, and the page should not
exist.

This is not a license to delete the material. It is a requirement to put
it where someone will actually meet it.

## Every page carries a demo

Not a nice-to-have. If a page has no demo, either an existing one belongs
on it or a new one gets built. The owner: "Every single page should have
at least one demo on it. If an existing demo doesn't fit, you should make
one and let me know. There are interesting demos to be made here for all."

The exceptions are the pages that already ARE interactive: the chain
comparer and the model picker.

His own reads on where the gaps are:
- argent-explained: how does Argent compile to Silverscript, and
  Silverscript to Kaspa script? How do the three relate? "Definitely
  worth it." That page is currently prose about a compiler with nothing
  to watch.
- crypto-from-scratch: existing demos may fit, or build simpler ones that
  are fun to use.
- kaspa-origin-story and why-kaspa-matters: existing demos fit.
- kaspa-mining: probably needs a new one.
- kips: closer to reference than demo material.

A demo earns its place by showing a thing happen. A page that only tells
the reader something happened is the weaker version of itself.

## If nobody reads it, delete it

The owner, plainly: "People aren't going to read a word or a sentence or
a page or use it. It should get eliminated, period."

That applies at every scale. A word nobody needs, a sentence nobody
finishes, a page nobody arrives at on purpose. The test is not whether
the material is true or well written. It is whether anyone meets it.

## The machine-facing files count too

`llms.txt`, `agent-index.json`, and the markdown documents are read more
often than most pages, by models answering questions about Kaspa. They go
stale the same way and they are held to the same bar. Update them in the
same pass as the pages they describe, never afterward.

## Default collapsed. Let people be adults.

The owner's rule, and it inverts the default: "Every section, unless it
has to be seen, should basically allow people to be adults and choose the
things that they want to see. Demo, information, etcetera."

So a section opens closed unless a reader must see it to understand the
page at all. That includes demos. A demo inside a page can be expandable;
a reader who wants to play with it opens it, and a reader who does not
scrolls past a line instead of a screenful.

This is not the same as hiding content to hit a word count, which is
banned. The difference is who decides. Collapsing to game a number moves
words away from a reader who wanted them. Collapsing by default hands the
reader the choice and makes the page scannable.

What must stay open: the page's answer, the one sentence a reader came
for, and anything that makes the rest incomprehensible if missed.

What closes by default: methodology, sources, caveats, worked examples,
command blocks, reference tables, and demos on pages where the demo is
supporting evidence rather than the point.

## The high school test

The owner's standard for demos, set 23 August 2026: "Every demo should be
so simple that anyone with a high school diploma and basic understanding
of crypto knows how they work. Nothing more."

That is a pass or fail bar with a real subject, not a style preference.
The subject has finished high school and knows roughly what a
cryptocurrency is. They do not know what a UTXO, a DAG, a covenant, a
mergeset, or a confirmation depth is. They have not read the rest of this
site and will not.

The test: put that person in front of the demo with no help. Within a few
seconds they must be able to say what it shows and what to touch first.
After touching it they must be able to say what changed and why. If they
cannot, the demo fails.

Three things that do NOT rescue a failing demo:

A longer caption. If the demo needs a paragraph to be understandable, the
demo is wrong. Fix the thing, not the label on it.

Correctness. A demo can be perfectly accurate, properly sourced, and
still fail this test. Correct and unusable is a failure on this site.

Familiarity. Anyone who has read the surrounding page, or who already
knows the subject, is not a valid judge. They cannot unsee what they
know. Grading has to be done by someone reading it cold, and they have to
be willing to fail it.

What passing looks like: one obvious thing to do, every number saying
what it is a number of, every label readable correctly on the first pass,
and a change the reader can see the moment they act.
