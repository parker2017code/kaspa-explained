# Prose Standard

Version 1.0, 30 July 2026. Owner-authored. Supersedes the ban list copied from X,
and outranks the older word lists in `COPY_STYLE.md` wherever they disagree.

## What is actually being measured

Three dimensions, in order of how much they matter.

**Payload per sentence.** Does the sentence add a fact, a number, a name, a
mechanism, or a judgement the reader did not already have? If deleting it costs
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

**A punchy closing sentence.** Test: do the neighbouring sections end flat? One
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
