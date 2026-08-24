# Running list

Everything outstanding. Updated as work lands. The owner should never be
the one to find an item for this list.

## Rules that apply to every item

- Verified at 390, 768, and 1280, in both light and dark themes.
- Committed AND pushed. Local passing is not evidence. Confirm on
  kaspaexplained.com after deploying.
- Every page has a purpose and is current. A page that cannot be kept
  current gets cut down until it can be.
- Less text. If a word can come out and the sentence still says the same
  thing, it comes out.

## Pages: keep, merge, or cut

Decision pending on each. Excluded from the audit: `model-picker.html`
(the owner values it, real work went into it) and `the-instrument.html`
(guest piece by Moose, never edited).

| Page | Status | Note |
|---|---|---|
| toccata-status.html | DONE | Deleted, folded into status.html, stub redirects to /status. |
| toccata-essay.html | DONE | Deleted, no unique content found to fold in. Stub redirects to /toccata-explained. |
| about.html | REVIEW | 1,730 words on an editorial policy page. Owner asked what there is to say. |
| sources.html | REVIEW | 3,451 words. A lookup table written as an essay. |
| kaspa-developments.html | FIX | Stale, and its Maturity table column renders as nonsense. |
| skeptical-case.html | REBUILD | Four table-shaped things and two essays on one page. Impenetrable. |
| kaspa-claims-checker.html | REBUILD | Same. Status should be scannable in ten seconds. |
| demos/index.html | REVIEW | May not need to exist once every demo lives on a real page. |

## The landing rule

Stated by the owner: if someone wants to get to this information they
should be able to, but they should not be bombarded with it on landing.
Every page opens with what a reader needs, and holds the rest one click
away. This is the reason the 300-word ceiling exists. Read the ceiling
as serving this rule, not the other way round.

## Defects the owner found, which the process should have caught

- Duplicate header and footer inside the homepage's embedded demo. FIXED.
- Info circles breaking onto their own line instead of sitting inline.
- Text cannot be selected on the homepage; a blue box appears on drag.
- Text overlapping and near-overlapping other elements.
- Spacing too tight above some sections, too loose below others.
- Dead space around the activation record and full developments controls.
- Homepage demo teaser carrying the full demo page's prose.
- Stale demo count on the homepage button, said 13, there are 16.
- `llms.txt` claimed demos were embedded in content pages. They were not.
- Footer compression removed navigation entirely. Search became
  unreachable. Compactness must come from typography, not from deleting
  links.
- Homepage demo links are bare titles with no reason to click.
- A blue horizontal glitch line on the build page near the word "job".
- `build-on-kaspa.html` opens by bombarding the reader.

## Work in flight

- Toccata removal and sitewide nav sweep.
- Footer compression. DONE: 1,152px to 193px at 390, 331px to 121px at 1280.
- Vertical rhythm and subtitle component.
- Render gate: overlap, near-overlap, clipping, spacing distribution.
- Homepage rebuild.
- Demo integration: each demo embedded as a short teaser on the page whose
  claim it backs, full version on its own page.
- Color identity across every semantic category.
- Voice pass on the long guides.
- Risks and claims checker rebuild.

## Decided: proposal-stage sources get no page

Telegram Core R&D and kas-smiths.org threads are proposal-stage by the
site's own rule: nothing is shipped until a merged KIP and a release tag.
A page reporting what is being argued about is how "KCC20" becomes "Kaspa
has a token standard." Use those sources as a tip-off for what to verify
in GitHub, never as content.

Consequence: `kaspa-developments.html` is stale by construction. It is a
hand-maintained monthly digest and was caught out of date twice in one
day. `kips.html` reads GitHub live and cannot go stale. The live tracker
is the correct pattern. The monthly digest should be retired into it.

## Process failures to not repeat

- Partial commits desynced the generated index and broke CI for months.
  Fixed: the hook now generates from the staged tree, and a pre-push clean
  clone reproduces CI locally.
- Agents committing concurrently collide on `.git/index.lock` and stall
  each other. Serialize on one committer.
- Telling every agent to read the design documents in full costs six
  figures of tokens before any work happens. Quote the relevant paragraphs
  into the brief instead.

## Copy lint: reverted to blocking, same day

Briefly made advisory on 23 August 2026 on a wrong diagnosis. The real
blocker was a source-ban violation in a corrupted file, not the cadence
backlog, and most of those rules were already advisory. The backlog was
113 hits in page copy, not the 571 first reported, which had counted
worktrees and design docs.

Cleared and reverted to blocking the same day.

## Demos hide their best part when embedded

`demos/shared-state.html` marks its race-track section `embed-hide`, so
every embed of it shows the app-composition panel instead of the
head-to-head race. `demos/utxo-vs-accounts.html` does the same with its
collision test.

Both hide the exact thing that makes them worth watching, on every page
that embeds them, which is now several. Pages have been written to
describe what actually renders, which is honest but backwards: the demo
should show its payoff, and the page should not have to work around it.

Fix the demos so the embedded view leads with the moment worth watching.

## Next: one information-architecture decision

The owner asked all of this in one breath, and it is one decision, not
five separate ones. Run it with authority to fold and delete, not to
come back with a list.

His questions, verbatim in substance:
- Is there anything on `about` that actually needs to stay, or is it
  there because an about page is standard?
- Why is the glossary important?
- Why is `sources` still there? The page is awful. Why is it in the nav?
- Have the nav and footer ever been audited for whether those links are
  all important?
- "Kaspa claims checker" is worth throwing up. Can that be folded into
  other pages, without saying it in a cringy way?
- What can be folded into each other, what is unnecessary, what is
  cringy, what is bad?

Note: glossary, kaspa-developments, and common-questions were retired
earlier today and an agent's `git reset` restored all three. Any retirement
has to be committed immediately, not left in the working tree.

The bar: no page a reader would never arrive at on purpose, and no nav or
footer link that does not earn its slot.

## Performance, measured

Localhost figures, so a floor rather than real-world:

  homepage       174ms   13 requests    341 KB
  demos index   1024ms   77 requests   3200 KB
  model-picker    73ms    7 requests    311 KB
  kaspa-mining    86ms    7 requests    209 KB   (18 images)

Every page is fine except the demos index, which loads 17 live demo
iframes, each pulling a full page and its scripts. They are lazy-loaded,
so the weight arrives on scroll rather than upfront, but it is still
seventeen full pages behind one index.

Not yet checked: whether the 18 images on kaspa-mining are sized and
compressed for the web, real-world load on a phone over mobile data,
render-blocking resources, and whether styles.css at roughly 9,000 lines
is worth splitting.

The large assets on disk are all under `_preview-site/`, which is
gitignored scratch from an unrelated project and never shipped.

## Stylesheet: still 9,105 lines

An agent reported it at 5,892 and refused to cut against what it called a
stale brief. It was measuring a different file, almost certainly inside a
git worktree rather than the repo root. Verified from the repo root:
9,105 lines. The target of under 6,000 stands.

Worth keeping as a caution: an agent checking its premises is right to do
so, and can still be wrong about which file it checked. Confirm the path.

## NEXT SESSION: start here. Eleven defect classes, owner-reported

The owner walked the site after the cb4ccdf deploy and found these. He is
right about all of them and has raised several more than once. Two are
measured and confirmed; the rest are his report, unmeasured.

MEASURED AND CONFIRMED:
1. Status pill text sits 6px ABOVE center, not centered. Measured on
   parameterless: pill 30px tall, text 13px, offset -6px from center.
   Affects "Live", "Research", every status pill sitewide. He has raised
   this multiple times and it was never actually fixed.
2. The "Back to What is Kaspa" link renders UNDER the fixed nav on every
   demo, at BOTH 390 and 1280. Link top 24px, nav bottom 61px.

HIS REPORT, NOT YET MEASURED:
3. The nav itself is not horizontally centered, slightly shifted right.
4. Space under the nav is inconsistent by page type. Demos have a lot,
   build/risks/status have less, what-is-kaspa similar to demos. Looks
   unintentional.
5. Mobile at 390: controls detach from what they control. On the block
   simulation the minus and plus separate from the block. He believes
   this affects every demo. Nothing was tested at mobile.
6. Term-def reveal panels extend out to the side on what-is-kaspa, on
   "blue work" and "selected parent". Panels are 260px absolute; not
   offscreen at 1280, mobile never checked.
7. A caveat/source line sits crammed against the text above it with a
   large empty gap below it.
8. The demos index is still not in importance order. Parameterless is
   last. He asked for importance ordering more than once.
9. Numbers are unattributed. "23 weeks under attack at 10 percent
   attacker share" does not say whether that is GHOSTDAG or DAGKnight.
10. Labels are unintuitive: "two speeds", "confirmed time", "no visible
    attack underway". Unclear what the demo does.
11. No visible feedback that a control did anything when moved.

PLAN AGREED, five agents, not yet launched:
  1. Chrome fixes in styles.css: pill centering, back link clearance, nav
     centering, top spacing. One agent so they cannot fight over the file.
  2. Mobile sweep of all 18 demos at 390, screenshot each, controls must
     stay with their subject.
  3. Parameterless rebuild: labels, attribution, caveat spacing, response.
  4. Demo index ordering by importance, plus caveat spacing rhythm.
  5. Cold verifier over all 18 afterward, no site knowledge, own browser.

THE METHODOLOGY HE ASKED FOR AND DID NOT GET, now mandatory in every
brief: every demo verified at 390 AND 1280 in BOTH themes, with a
screenshot, by an agent that did not build it, before anything deploys.
His words: "I'm just really disappointed that it wasn't followed."

## The sentence audits were rubber stamps

The owner walked crypto-from-scratch, start-here and kaspa-origin-story
and called them insanely long and dense. He is right, and the reason is
worse than the pages never being audited. They WERE audited, and the pass
reported:

  why-kaspa-matters   143 strings, 141 KEEP, 0 CUT, 2 REWRITE
  crypto-from-scratch 118 strings, 117 KEEP, 0 CUT, 1 edit
  kaspa-origin-story   96 strings,  95 KEEP, 0 CUT, 1 REWRITE

An agent read every sentence, judged almost all of them worth keeping,
and changed nothing. The coverage numbers looked rigorous, which is why
the report was accepted. A per-sentence verdict where the verdict is
almost always KEEP is a rubber stamp, not an audit.

Current measured lengths:
  crypto-from-scratch  2,366 words
  kaspa-origin-story   2,060
  start-here           1,674
  sources              3,443

Any future cutting pass must state a target reduction before it starts
and be judged against it, not against a coverage count. A pass that cuts
nothing has failed and should say so rather than reporting completion.

## Sources: numbers overlap, and the model is wrong

Two defects, the second more important.

The numbers in the source list visually overlap. Layout bug, unmeasured.

The deeper problem, in his words: "Why are all the sources here? Why does
it seem to matter? Why is it just not next to and inside of? This is a
disaster."

A source belongs attached to the claim it settles, inline, reachable at
the moment a reader doubts the sentence. A 3,443 word page listing every
source the site uses is a bibliography, and nobody arrives at a
bibliography on purpose. This was half-addressed by rebuilding it as a
lookup; the remaining move is to attach sources to claims and let the
page shrink to whatever genuinely needs browsing.

## Demos should not be their own pages

His words: "Some demos have their own page. That shouldn't be the case.
It should be a page with a demo."

Today every demo exists twice: as a standalone page under `demos/`, and
embedded on a topic page. `utxo-vs-accounts` is both a demo page and a
topic page containing that demo.

What he wants is one thing: a page about the concept, with the demo in
it. No separate demo URL. `demos/` becomes a component library rather
than a set of destinations. That collapses 18 demo pages plus their
hosts into 18 topic pages and makes "every page has a demo" true by
construction.

This is a larger restructure than anything currently running and would
invalidate the demo-ordering work. Asked him whether to run it after the
current five agents land or stop them and do the architecture first. No
answer yet.

## MASTER LIST, written 23 Aug 2026 before compaction

Agent cap raised to 10. Deploy as slots free. Everything below is
outstanding unless marked done.

### Owner's standing verdict
"There's something wrong with every page." Treat that as the scope. No
page is signed off. Every page and every demo needs a real audit against
the Apple/Google/Tesla/Meta test, not a coverage count.

### Blocking disappointments he has named more than once
- sources.html is still 3,443 words. He asked for it cut repeatedly. It
  was restructured as a lookup and never actually shortened. Most of it
  should be stashed behind disclosure or attached to the claims it
  settles. Nobody arrives at a bibliography on purpose.
- about.html still exists at ~1,676 words. An agent argued it earns its
  place because it carries the KAS conflict disclosure, the corrections
  process, and the claim-status definitions. That was the agent's call.
  He believes he asked for it gone. Confirm with him or cut it to those
  three answers and nothing else.
- Sentence audits that cut nothing. See the rubber-stamp section above.
  Any cutting pass states a target reduction first and is judged on it.

### The eleven chrome and demo defects
See the earlier section. Five agents were launched on them: chrome fixes,
mobile sweep of all 18 demos, parameterless rebuild, demo ordering, and
the term-def stacking bug plus theme toggle plus build page tabs.

### Three more found while auditing
- crypto-from-scratch 2,366 words, start-here 1,674, kaspa-origin-story
  2,060. All dense. All previously "audited" with zero cuts.
- Numbers visually overlap in the sources list.
- The Argent pipeline demo is live and listed, but a reader cannot tell
  what it does on arrival. It needs a one-line frame.

### Architecture question, unanswered
Demos should not be their own pages. One page about the concept with the
demo in it, no separate demo URL, `demos/` as a component library. This
collapses 18 demo pages plus hosts into 18 topic pages. Larger than
anything currently running and would invalidate the ordering work. He was
asked whether to run it after the current five land or stop and restructure
first, and has not answered.

### What is actually done and live
Nav at five. Glossary, claims checker, monthly digest, questions page all
folded into the pages that needed them. Glass gone including the tokens
that hid it from four audits. Model picker restored after an agent broke
it. Footer at a third its height with full navigation. Chain comparer's
fatal script error and its claims-versus-measured table that never
rendered. Argent pipeline demo. 18 demo cards live and ordered. Node cost
given a guess-first moment. Noscript everywhere. Eight jargon terms and
twelve glossary terms defined inline. llms.txt completed.

### Standing rules for every brief
No git commit, push, reset, stash or checkout by any agent; one committer.
Never bind port 4187. Verify at 390 and 1280 in both themes with a
screenshot, by an agent that did not build the thing, before deploy.
Report measured before and after numbers, never "looks right".

## Targets set, and the sequencing decision

Coordinator's judgment, 23 Aug, since the owner asked for it to be set
rather than debated:

  crypto-from-scratch  2,366 -> under 900
  kaspa-origin-story   2,060 -> under 900
  start-here           1,674 -> under 600
  sources              3,443 -> under 700, all 188 URLs kept

Each agent is judged on the number and told to report a miss plainly
rather than claiming completion. This exists because the previous pass
reported near-total KEEP verdicts and changed nothing.

Sequencing: cut first, restructure second. Collapsing demo pages into
topic pages is cleaner on pages that are already short, and stopping
seven agents mid-work would repeat the resets that destroyed work three
times today.

## Owner audit, second pass, 23 Aug

DESIGN RULE, now in STANDARD.md: default collapsed. Every section closed
unless it must be seen. Demos too. Let the reader choose.

Pages he judged:
- kips.html: "otherwise this page looks okay." Wants the KIP list
  compactable, grouped, maybe 1 to 5, 5 to 10.
- kaspa-mining.html: "way too long, needs to be compressible."
- why-kaspa-matters.html, the design case: "already way too long."
- toccata-explained.html: "also very long."
- skeptical-case.html: "seems reasonable." No action.

CI is failing again. He has raised this several times. Fix the cause, not
the run.

## toccata-status.html came back from the dead

Recorded here because it is the third time a retirement has been undone
by a concurrent `git reset` and nobody noticed until an audit found it.

TODO's own page table says: "DONE. Deleted, folded into status.html, stub
redirects to /status." It is not a stub. It is a 20KB `index,follow` page
with no `http-equiv=refresh`, missing from `site-manifest.json` and from
`sitemap.xml`, so it is invisible to the site's own gates and to the
sitemap while remaining crawlable.

What is actually duplicated: `status.html` carries the activation record
and the DAA score. `toccata-status.html` carries the same plus more
detail on v2.0.0 against v2.0.1.

What makes this non-trivial to retire, and why it was not done inline:
- `index.html` links to it, so it is reachable and not strictly orphaned.
- `scripts/audit-content-flow.mjs` and `scripts/check-label-colors.py`
  both reference it by name. Retiring it without updating them breaks the
  gate, which is how a wrong rule blocks a right change on this repo.
- `scripts/apply-related-links.py`'s fallback list still references
  `kaspa-claims-checker.html`, itself retired, so running that script
  errors. Adding toccata-status to the manifest would cascade into a
  regeneration that hits pages other agents hold.

Decide: fold the v2.0.0 against v2.0.1 detail into `status.html` and make
this a stub, or keep it and put it in the manifest and sitemap so it stops
being invisible to the gates. The one thing that cannot stand is the
current state, which is a live indexed page the site's own tooling does
not know exists.

Related, found in the same audit: `CONTENT_BRIEF.md` claimed 25 live
pages against an actual 20, and described five retired stubs as live
separate pages. It is embedded verbatim into `agent-index.json`, so every
agent reading the index was being told the site had pages it does not.
Fixed.

## Retire toccata-explained, and lead with what is not built yet

Owner's decision, 23 Aug: "get rid of toccata explained, it's all a part
of kas. Put more emphasis on future stuff re DK, vProgs etc."

The reasoning is the same one that retired `toccata-status`. Toccata
activated on mainnet on 30 June 2026 at DAA 474,165,565. A page named
after an upgrade is a page organized around a release, and a release
stops being a subject the moment it ships. Covenants are just how Kaspa
works now, and they belong in the pages about how Kaspa works.

Where the material goes, to be settled by the retirement pass:
- Covenants, in plain language, into `what-is-kaspa.html`.
- The builder-facing covenant material into `build-on-kaspa.html`, which
  already absorbs the covenant-breaker demo.
- The zk-boundary demo needs a new home. It was going to land on
  toccata-explained. Decide between `what-is-kaspa.html` and a
  forward-looking surface.

The second half of the instruction is the more interesting one. The site
currently gives most of its weight to what shipped and treats what has
not shipped as a footnote. He wants that inverted: DAGKnight and vProgs
are the live questions, and they are what a reader who already knows
Kaspa is here to find out about.

Facts that must stay exactly right when this is written:
- DAGKnight is KIP-2, Status: Proposed. Not on mainnet.
- vProgs have not reached testnet. Argent's Inter-Covenant Communication
  covers the joined-transaction case on Toccata today, in unaudited
  offline demos only. What vProgs add is shared mutable state.
- Nothing ships on this site until a merged KIP and a release tag. A page
  about what is coming is exactly where that rule gets broken, so every
  forward-looking claim carries its status label and its primary source.

Sequencing note: this was decided while eight agents were mid-flight,
including one inlining a demo into the page now being retired. That agent
was told to drop the file and leave its edits in place rather than revert
them, since a revert is how work has been destroyed four times today.

## ICC is used bare and defined nowhere

`Inter-Covenant Communication` appears on argent-explained (4 times),
status (3), build-on-kaspa (1), and toccata-explained (1). `status.html`
uses the bare acronym `ICC` twice with no expansion anywhere on the page.
No term-definition reveal is wired for it on any page.

This is the same class as the eight terms found earlier: Crescendo,
TangVM, Hashdag, RTD, netsplit-resilient, TN10, TN12, the KCC codes. The
site's own rule is that jargon appears with its meaning in the same
label, or does not appear.

The definition, checked: separately compiled covenant apps joined into
one all-or-nothing transaction, so either every part lands or none does.
It works on Toccata today, in unaudited offline demos only. What vProgs
would add on top is shared mutable state, which ICC does not provide.

Do this as ONE pass across every page rather than per page, because the
rule that matters here is one phrasing for one concept everywhere, and
four agents writing four definitions is how that gets broken. Every page
listed above is currently held by another agent, so it queues.

Caught because the coordinator used the acronym to the owner without
expanding it, and he asked what it meant. If it fails in conversation it
fails on the page.

## Jargon still used bare, found while wiring ICC

ICC is now defined once, in identical wording, on argent-explained,
status, and build-on-kaspa. The same sweep found a much larger list that
was never caught because nobody had grepped for it:

  KIP    135 occurrences, never expanded anywhere on the site
  UTXO   undefined, including on the page named after it
  bps    core to the whole pitch, never expanded
  ZK     moderate
  ASIC   moderate
  BFT    moderate
  RPC    builder pages only
  DEX    builder pages only

By the site's own rule this is a defect class, not a nicety: jargon
appears with its meaning in the same label, or it does not appear. KIP
and UTXO are the two that matter most, because a reader meets both in the
first minute and neither is guessable.

Do it as ONE pass, not one agent per page. The rule that breaks under
parallel work is one phrasing per concept, and four agents produce four
definitions. Write each definition once and reuse the exact text.

`design/patterns.html` also carries bare ICC twice, quoted verbatim from
status.html. It is an internal noindex page, so it is lower priority, but
it is the same defect.

Note on why this was missed for so long: every one of these reads as
ordinary vocabulary to anyone who already knows the subject. That is
exactly the population writing and reviewing the site, which is why a
cold reader with no Kaspa knowledge has to be the one who checks.

## The adversarial pass, still never run to completion

Recorded here as well as in HANDOFF.md because it keeps getting deferred
and then forgotten. It is the last thing before the site can be called
done, and it runs only after everything else is green, by agents that
built none of what they are attacking.

Four jobs, and no agent gets its own work:

- Break it. Drag every control to both limits and past them. Empty input,
  absurd input, rapid clicking, double submit, back button mid
  interaction, reload mid state, deep link into a fragment, disable
  JavaScript, kill the network mid fetch. A wrong number, a stuck state,
  or a blank panel is a defect.
- Misunderstand it. Read every page as a newcomer with no Kaspa
  vocabulary, then again as a hostile skeptic hunting for a claim to
  catch out. Every place the two readers disagree is a defect, as is
  every sentence either has to read twice. A page that can be honestly
  misread is a defect even when every sentence is true.
- Check it. Every number, date, quotation and claim against its primary
  source, never against another page of this site. Every quotation
  verbatim. Every invented example labeled as invented. Every live figure
  read live by browser fetch on this origin, never curl.
- Cross-read it. One concept, one name, one phrasing, everywhere. Two
  pages teaching the same mechanism in different words is a defect, and
  so is a demo whose voice does not match the guide that links to it.

Every finding gets fixed and re-checked by a different agent than the one
that found it.

Two previous attempts produced false reports of sitewide breakage, both
caused by browser contention between agents sharing one browser, and both
disproven by measurement. Any finding must carry `location.href` captured
in the same evaluation as the measurement.

This pass matters more after the demo merge than before it, because
eighteen demos just moved into pages they were never written for, and the
voice mismatch between a demo and its host page is exactly what
cross-reading is for.

## For the owner to decide, not for an agent to act on

Two findings from the layering audit are judgment calls about what the
site is, not defects with an obvious fix. Both are recorded rather than
acted on.

### sources.html contradicts the site's own written rule

`design/STANDARD.md` says plainly that sources are not something anyone
reads, that a source belongs attached to the claim it settles, and that
if nobody arrives at a page on purpose the page should not exist. By that
rule `sources.html` should not be a page.

It was cut from 3,443 words to 697 with all 188 URLs kept, and its
internal layering is now fine. So the question is not whether it is good.
It is whether it should exist at all, or whether those 188 URLs belong
attached inline to the claims they settle, with no bibliography page.

Doing it properly means every claim on every page carries its own source
at the point a reader would doubt the sentence. That is a real piece of
work and it changes how every page reads. It is also exactly what the
standard describes. The owner should decide before anyone starts.

### status.html reads as a template

37 disclosures, zero use of the info affordance or the view switch. The
owner has explicitly rejected uniformity: "There are probably literally
ten different ways to hide the information in interesting ways." On a
reference surface, uniform may genuinely be right for scanning, and an
agent has been asked to argue it either way rather than assume.

The suggested alternative is a view switch across the claim table's
framings instead of another triangle. Worth a look once it lands.

### Three thin disclosure panels

Low stakes, listed so they are not lost: `what-is-kaspa.html`'s "Why
Bitcoin chose the opposite trade-off", `why-kaspa-matters.html`'s "Why
evidence next", and `crypto-from-scratch.html`'s "NIST's definition" are
one-sentence restatements rather than depth. A disclosure that opens onto
a restatement teaches a reader not to open the next one, so they should
either carry real depth or be inlined.
