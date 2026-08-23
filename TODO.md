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
