# Prose Standard

Version 1.0, 30 July 2026. Owner-authored. Supersedes the ban list copied from X,
and outranks the older word lists in `COPY_STYLE.md` wherever they disagree.

## What is actually being measured

Three dimensions, in order of how much they matter.

**Payload per sentence.** Does the sentence add a fact, a number, a name, a
mechanism, or a judgment the reader did not already have? If deleting it costs
the reader nothing, delete it. This one rule catches most of what people mean
when they say writing sounds like a machine wrote it.

**Length variance.** Machine-generated prose sits in a narrow band, roughly 14
to 22 words per sentence, with almost no spread, and paragraphs that all run
three to five lines. Human prose lurches. A four-word sentence next to a
thirty-five-word one is normal. Uniform bricks are the single most visible tell
and the easiest to fix.

**Word-choice unpredictability.** Whether the next word is the one probability
picked. Low unpredictability reads as smooth and dead.

A page can pass the first test and fail the other two, which is why the rules
below are split into what you never write and what you ration.

## Never write these

**Em dashes.** Use a comma, a colon, a full stop, or restructure. Removing one
without replacing the beat it carried leaves a flat sentence, so read the result
aloud.

**Significance inflation.** Any sentence whose job is to announce that the
subject matters. Kill "plays a vital role", "stands as a testament to",
"watershed", "marks a turning point", "lasting impact". Show the thing and let
the reader conclude it matters.

**Trailing -ing clauses that assert importance.** "…, underscoring the need for
faster screening." "…, reflecting a broader shift in the industry." Cut the
clause; keep the fact.

**Vague attribution.** "Studies show", "experts say", "many in the field
believe". Name the source or drop the claim. On kaspaexplained this is
disqualifying, since the whole value of the site is that claims are traceable.


**First person, on a site that is not a person.** kaspaexplained.com and its
posts are an independent explainer, not somebody's diary. Reference pages and
every X post speak in third person. "A post of mine", "I checked", "we
recommend" have nobody to refer to and read as a person hiding behind a brand.
The exception is narrow and explicit: the attributed personal essays keep their
author's first person, because a signed essay is a person talking. Enforced by
`check-prose.py` as `site-voice-first-person`.

**Formulaic transitions.** Moreover, furthermore, in addition. Start the next
sentence with its own subject.

**Closing paragraphs that restate.** If the section already said it, ending with
a compressed version wastes the reader's last attention. Stop when the content
stops.

**Throat-clearing openers.** "In today's rapidly evolving landscape of thin-film
deposition…" Open on the fact.

**Corporate verbs and filler intensifiers.** Leverage, underscore, reflect.
Genuinely, really, truly, actually.

**Stacked noun phrases and nominalisation.** "Composition-spread wafer library
screening capability enablement" is four nouns pretending to be a thought. Write
"we screen 342 compositions on one wafer."

**Performed enthusiasm.** Exclamation marks, "excited to share", adjectives doing
the work a number should do.

## Ration these

Each is a real tool. Each is allowed roughly once per page, and only if it passes
its test.

**Contrast ("not X, but Y").** Test: does the reader believe X right now? "The
barrier isn't cost, it's cycle time" works only if the reader arrived thinking
cost. If X is a strawman you built, you are performing insight.

**Rule of three.** Test: does the third item carry information, or complete a
pattern? If deleting it loses nothing, it was rhythm filler.

**A punchy closing sentence.** Test: do the neighboring sections end flat? One
kicker in a page lands. Five in a page and the reader writes your ending before
reaching it.

**Wh-cleft opener ("What changes here is…").** Test: has the reader just been
through a long build and needs a structural reset? Otherwise you spent eight
words delaying a two-word subject.

**Colon reveal.** Test: do the words before the colon carry weight? "Here's the
thing:" carries none.

## Structural targets

Put a very short sentence and a very long one inside the same paragraph, on
purpose, at least once per section.

Vary paragraph length so the page reads as a landscape rather than a wall. A
one-line paragraph between two long ones creates emphasis with no formatting
tricks.

Never end two consecutive sections with the same sentence shape.

## kaspaexplained.com

The site's asset is that a skeptical reader can check everything. Two rules
follow.

State confirmed facts without hedging. Toccata went live on mainnet on 30 June
2026. Write that. Softeners around a verified fact read as either ignorance or
cowardice, and both cost more credibility than being wrong once would.

Separate confidence levels explicitly and in plain words. Confirmed on-chain,
claimed by a party, unverified, contradicted by attempted verification. The KII
entries are the model: the finding is that a txid lookup returned nothing, stated
as that, with the endpoint named. Do not upgrade an unverified claim to a
neutral-sounding summary.

Where a claim is contested, name who contests it. Anonymous consensus ("the
community view is") is the vague-attribution ban wearing a hoodie.

## xemx-materials.com

Every technical noun and every capability phrase traces to one of two sources:
the RUB/ZGH published base, or the prospect's own vocabulary. No invented
capability language, no throughput or dose numbers that no paper supports. If
Ludwig, Schuhmann or Banko published it, especially with Banko named, the site
can claim it; absence from the customer one-pager is not absence of capability,
so check the papers before narrowing.

Numbers instead of adjectives. "342 compositions on a 100 mm wafer, 37 elements
available, seven cathodes in one run" outperforms any sentence containing the
word "advanced".

Say what a customer gets, in the order they care about. What goes in, what comes
out, how long, what it costs to find out. Keep the sentence structure plain
around the technical nouns; the audience expects the nouns and resents the
packaging.

## Check procedure

Read the last five section endings back to back. If you can predict the sixth,
the emphasis is dead.

Run `python3 scripts/check-prose.py` for the measurable half: ban-list hits,
sentence-length variance, uniform-paragraph runs, rationed-device counts, and
reading grade. Measure it; do not estimate it.

Search the draft for the ban list. Then read it aloud. The mouth catches what the
eye approves.

## The limit of all of this

These are detection features. Removing them makes empty prose cleaner, not
better. A paragraph with nothing in it just gets shorter. If a page passes every
rule above and still reads as thin, the problem is that you have not found the
fact yet.

---

# Version 2.0, 1 August 2026. The page as an object.

Owner brief, after two senior technical buyers read a page from this project and
could not tell what was being sold. One said it sounded like the wrong industry.
The other could not tell whether the thing on sale was equipment or a service.

Version 1.0 measured sentences. It had nothing to say about the page they sit on,
so a page could pass every sentence check and still fail its reader. These rules
outrank version 1.0 where they conflict, because a well-written paragraph in the
wrong place is still a defect.

## Reading grade, and the audience split

Measured with `python3 scripts/check-reading-grade.py`. Flesch-Kincaid on the
copy inside `<main>`, reported per page.

**Shared copy is held to grade 9.** Shared copy is anything a first-time visitor
meets: the hero, the lead, the explanation of what the thing is, the workflow,
the contact block. These get read by people who do not use the field's words.

**Specialist blocks keep their own vocabulary.** A section written for one
audience should use that audience's terms, because plain-languaging them makes
them wrong. Mark the block `data-audience="specialist"` and the gate measures it
separately instead of failing it.

Right now everything on a page usually sits at one grade, and that grade is set
by the hardest section. That is the defect. Split it.

**Sentence length is not the cause and shortening sentences is not the fix.**
The measured case had healthy variance already: mean 13.7 words, standard
deviation 6.2, range 3 to 36, and it still graded 12.2. The grade came from word
choice. Replace long Latinate words with short ones. `characterizing` becomes
`measuring`. `discrete syntheses` becomes `separate samples`. `utilize` becomes
`use`. Run the checker again and keep going until it passes. Do not chop
sentences; that damages the variance the standard already asks for.

`--worst FILE` prints the heaviest lines on a page, which is where to start.

## Never lead with the method

The first thing a reader meets is what they can do, not how it is done. A
heading that names the mechanism before the reader knows what is being sold
loses people who do not already recognize the mechanism, and those are exactly
the people the page exists for.

The failure is easy to spot once named: an H1 that would mean nothing to someone
who has not already been told what the page is about. `Screen a composition
space on one wafer` fails. `Rank a whole family of materials in one experiment`
passes. Same product.

A corollary: a reader must meet an application before they meet a diagram of the
method. One line of plain text naming where the thing is used is enough. It does
not need to be a section.

## One idea, stated once

Count how many times a page states its central claim. The measured case stated
one idea five times across five different sections while never once stating
price or lead time.

Keep it in two places at most: where the reader first needs it, and where they
act on it. Cut the rest. The space it frees goes to the question the page does
not answer at all, and there is always one.

## The page has a length budget

Any revision that deletes ten lines and adds a section is not a revision, it is
growth wearing an edit's clothes. Count words before and after. After must be
lower unless the brief explicitly asked for new content.

Eight sections is a normal ceiling for a page someone lands on cold. Nav is
capped at five items. A nav item and its section heading use the same word: if
the nav says `How it works` the heading is not `The workflow`.

## Card sets

**Six families, not fourteen items.** A long card set is a directory, and a
directory is a wall. Group the items into families, name the family on the card,
and let the specifics open on click. One line per card at rest. If a card needs
two lines to make sense, the family name is wrong.

**Vary the opening shape.** No more than two cards in a set may open the same
way. Read them back to back: when six of eight open on a noun phrase followed by
the same verb, the scaffolding is what the reader notices, not the content that
changed. Rotate between the property being traded, the constraint that blocks
the team, the thing being measured, and what the run rules out.

**Never end a card on its limit.** Naming what the method does not do is what
makes the rest credible, so keep it. But a limit in the last slot reads as an
apology. Put it where it reads as routing the work somewhere else.

## Claims

State only what the method supports. `Composition alone accounts for any
difference in performance` was false, because two other things also vary. `Every
position comes from the same run, so differences trace to the film rather than
to run-to-run variation` is true and says nearly as much.

Never tell a buyer that nobody has done this before in words that sound like a
warning. `Ahead of any published precedent` means `unproven` to the person
holding the budget. `No published screen exists yet, so the first one sets the
baseline` is the same fact, pointed forward.

## Ship numbers or ship nothing

A section of visible TODOs is worse than no section. If the figures are not
available, write the paragraph that describes the shape of the thing and leave
the numbers out entirely.

And check the gap: the measured page could not tell a reader whether the work
was a six-week job or a two-year program, or what it cost. Pages fill up with
restatements of the pitch and omit the two facts every reader wants.

## Vocabulary caps

Define a term once, in the place it is needed, then use plain words for it
everywhere else. Count the uses of every coined or field-specific term on the
page. A term used eight times that nobody outside the method says is a term the
reader is learning instead of reading.

## Before deleting a line, find out what it is

Text that reads like stray prose is often a caption, a carousel label, or a
component's own copy. Deleting it leaves a graphic with no label. Inspect the
component first. If the text belongs to a visual, rewrite it short rather than
removing it.

## Layout rules that outrank the copy

- Mobile first. Check what sits above the fold at 390px. On a landing page that
  is the headline, the subhead, the buttons, and the one visual. Nothing else.
- Alternate. No two consecutive sections should be text only. The page needs
  something to look at between the blocks.
- Expanding a card must not reflow the page. Overlay or expand in place.
- One primary call to action. It must not ask visitors to judge their own fit
  before the page has given them what they need to judge it.
- Contact details are plain text, not a form. People forward emails to
  colleagues. They cannot forward a form.

## Tools built by this project

Everything above applies to interactive tools too, and harder. A tool is judged
on whether someone who does not know the field can pick it up and play with it.

- Every control is labeled in plain words, not in the underlying metric name.
- Presets first. Give people a working starting point before an empty form.
- The output updates as the input moves. No submit button.
- Show the honest spread. If the top five options are two points apart, the
  display must say so rather than making the leader look dominant.
- Say what the score is not. A rank is not a rating.

## Verification, run every time

1. `python3 scripts/check-reading-grade.py` passes, shared copy at 9 or below.
2. `python3 scripts/check-prose.py` reports zero banned-item hits.
3. Word count after is lower than before, unless new content was requested.
4. Read the last five section endings back to back. If the sixth is predictable,
   rewrite one.
5. Read every card in a set back to back. No more than two share an opening.
6. Count the central claim. Twice, at most.
7. Sections counted. Nav items counted, five or fewer.
8. Render at 390px and confirm what is above the fold.
9. No two consecutive text-only sections.
10. Every number on the page traces to a source or is not there.

---

# Version 2.1, 22 August 2026. The defensive register.

Owner framing. The register to avoid is defensive: it hedges, pads, apologizes,
and over-structures because those moves protect the writer from being wrong or
disliked. Writing that stops being defensive stops sounding machine-generated.
Versions 1.0 and 2.0 above already ban most of its symptoms by name (em dashes,
throat-clearing openers, closing restatement, performed enthusiasm, hedged
facts). What follows is the rest of the standard, reconciled rather than
restated: it says which existing rule already covers a point, and adds only
what was genuinely missing.

**Answer first.** No restating the question, no announcing what the text will
do. This is the throat-clearing ban above, extended to the opening move itself,
not just its stock phrasing. Human read; a script cannot see the question a
piece of copy is answering.

**No unprompted offers to expand.** "Let me know if you'd like more detail,"
"happy to expand on this" (the closing-restatement ban above covers the
summary paragraph; this covers the offer that isn't a summary but is the same
defensive reflex). Checked by `check-prose.py` as `unprompted-expand-offer`.

**Commit, then qualify once.** State the position. If it needs a caveat, give
it once, after the claim, not folded into the same sentence as a hedge. Do not
narrate the epistemics of not knowing ("it's hard to say for certain, given
the many factors involved") when the honest answer is just "unknown." The
kaspaexplained.com section above already states the sharper version of this
for confirmed facts; this extends it to opinion and judgment calls. Human
read: telling a load-bearing qualifier from a defensive one is a judgment
call, not a pattern match.

**No tricolon reflex.** "Not X, but Y" is the `contrast` ration above. "It's
about A, B, and C" is its cousin, a claim collapsed into three abstract nouns
so it sounds complete without saying anything. Checked as
`tricolon-aboutness`, banned outright rather than rationed, because unlike a
real contrast this shape has no legitimate use once it exists.

**Specific nouns over category nouns.** Landscape, realm, space, framework,
approach, solution stand in for a real thing. Numbers over adjectives:
robust, seamless, comprehensive, crucial, essential, cutting-edge. Only part
of this is in the script. `space` and `framework` are used correctly and
often on this exact site (block space, design space, the vProgs execution
framework), and `landscape`, `approach`, `solution`, `essential` are ordinary
English words with real literal uses; banning any of the six would hit
correct sentences, so they stay human read, judged in context. `robust`,
`seamless`, `comprehensive`, `crucial`, `cutting-edge`, and `realm` tested at
zero genuine hits on the shipped site and have no plausible literal use in
this genre, so those six are hard-banned as `category-noun-filler`. If one of
them ever earns its place, narrow the pattern before reopening the list.

**No performed contrition.** Fix an error in one sentence and continue.
Checked as `performed-contrition` for the stock apology phrases; a genuine,
non-formulaic correction is not a pattern the script can tell from prose that
happens to contain the word "sorry," so read for tone past the phrase list.

**No narrating the process.** "Let me think through this" is filler for
something done silently. Applies to conversational replies about this repo,
not to page copy the script scans; human read only.

**Formatting only when the content is genuinely a list.** Three headers and
nine bullets over four ideas is a structural tell, not a formatting choice. No
regex distinguishes a real list from a padded one. Human read.

**No moralizing.** No ethical note or safety caveat on a request or a claim
that carries no such weight. Applies mainly to conversational replies; on the
site itself this is the same discipline as the existing status-hedging ban
above, not a separate rule. Human read.

## What the gate checks and what a reader must

Mechanical, in `check-prose.py`: every item in "Never write these" above, the
site-voice first-person check, the rationed-device counts, sentence-length
variance, reading grade, and the four additions in this section
(`category-noun-filler`, `tricolon-aboutness`, `unprompted-expand-offer`,
`performed-contrition`).

Human read, no script: payload per sentence, whether a qualifier is
load-bearing or defensive, whether a formatted list represents real list
content, whether an apology is formulaic or a genuine correction, everything
in "The page as an object" (version 2.0) past reading grade, and the six
category nouns and adjectives named above that this site cannot ban outright
without breaking correct sentences.
