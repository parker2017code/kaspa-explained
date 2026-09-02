@AGENTS.md

# Claude Code Compatibility

Codex is the primary agent for this repo. If Claude Code is used later, use
`AGENTS.md` as the durable repo instruction file, use plan mode before broad edits, and run
the same verification commands before finalizing.

## Claude Code operational notes (learned 2026-07-04)

- **Local preview:** run `python3 scripts/serve-local.py --port 4187` and open `http://127.0.0.1:4187/` directly in a real browser. The script now works from any cwd (it `chdir`s to its own parent's parent).
- **The Claude Preview panel tool (`mcp__Claude_Preview__*`) does not work reliably in this environment.** Its `preview_start` spawns a hardcoded seed server bound to a directory from an old, now-deleted session path, and killing that process invalidates the whole tracked "server" session (it won't let you swap in the real repo and keep using `preview_screenshot`/`preview_eval`). Don't fight it. Use the standalone `serve-local.py` server plus the `claude-in-chrome` MCP tools (`navigate`, `computer` with `action: screenshot`, `browser_batch`, `javascript_tool`, `resize_window`) to actually drive and inspect the site.
- **Browser caching will lie to you.** `styles.css` is loaded with a version query string (`styles.css?v=...`) in every HTML file's `<link>` tag. Chrome will happily keep serving a stale cached copy across `navigate()` calls even after you edit the file on disk, with no error. For quick iteration mid-session, cache-bust via `javascript_tool`: `document.querySelector('link[href*="styles.css"]').href = '/styles.css?bust=' + Date.now()` (note: this reverts on the next full `navigate()` call). For anything you actually want to ship, bump the real version string across all files: `sed -i '' 's/styles\.css?v=OLD/styles.css?v=NEW/g' *.html`.
- **`styles.css` is ~8500 lines with real cascade debt.** The same selector (e.g. `.site-header`, `.hero-signal-grid a`, `.status-pill`) is frequently redefined multiple times at different points in the file, sometimes inside giant multi-selector shared blocks, sometimes as small standalone overrides near the bottom (search comments like "Final global nav layer" / "Final phone-width repair" for the actual load-bearing final overrides). If a CSS edit doesn't visually take effect, don't assume you did it wrong: `grep -n` the selector for every occurrence in the file and check which one wins (specificity, then source order), and verify live with `getComputedStyle()` via `javascript_tool` rather than trusting a static read of the file.
- **A real pre-existing bug, fixed this session:** the floating pill `.site-header` (`position: fixed`, rounded, with margin around it) leaves a gap above/around itself where nothing renders. Scrolled page content can become visible in that gap at any breakpoint. Fixed with a `body::after` fixed-position solid backdrop strip (`z-index: 999`, just under the header's `z-index: 1000`) covering the full clearance zone. If you touch header positioning/sizing again, re-verify this by scrolling on `/status` (or any long page) at desktop, tablet (768px), and mobile (390px) widths and watching for text peeking in above the pill.
- **`AGENTS.md`'s Content Rules > Voice section is the current source of truth for tone.** It supersedes the older "sober newsroom" framing further down in that same section where they conflict. Key points if you're skimming: no em dashes ever, lead with the counterintuitive fact before the setup, numbers over adjectives, name the mechanism not the outcome, and cut hedging/caveat-stacking past the one place a status label needs to appear. The calibration is "a working scientist explaining a system to a smart stranger" (Sagan/Dawkins/Sapolsky energy), not a legal disclaimer generator.
- **Parallel agent batches for site-wide sweeps work well here**, but two things to watch: (1) a top-level agent given >~10 files will sometimes spawn its own sub-agents per file rather than working through them itself, which is fine, just don't assume "1 report back" means "1 unit of work happened." (2) Always verify a batch's real diff depth (`git diff --numstat`, but note this file's HTML is written with long single-line paragraphs, so a "small" line-count diff can still be a full paragraph rewrite; check actual diff content, not just line counts) rather than trusting the agent's self-reported "done."
- Repo verification scripts that work without `node`/`npm` installed: `python3 scripts/check-html.py` and `python3 scripts/check-copy-quality.py`. Run both after any content sweep. The `npm run lint:copy` / `audit:copy` / `audit:terms` / `audit:visual` scripts need Node, which was not installed on the machine this session ran on; check before assuming they're runnable.
- **`bash scripts/check-site.sh` now runs end-to-end without Node** (fixed 2026-07-08): the three `node audit-*.mjs` calls used to abort the `set -e` script on machines without Node, silently skipping everything below them, including claim-consistency markers, anchor integrity, and the forbidden-copy grep. That dead zone is how "Toccata is live" pages coexisted for a week with a CLAIMS.yml that still banned the phrase. The gate now skips the Node audits loudly and runs the rest. "Site checks passed." is the only success line that counts.
- **`python3 scripts/check-status-freshness.py`** (in the gate) makes CLAIMS.yml executable: it fails when any `recheck_after` date has passed (recheck the claim against primary sources, update the entry, then move the date; never just bump the date) and when any `forbidden_copy` phrase appears in a page's visible text. After a status flips in the world, update the claim's `forbidden_copy` list too: pre-activation bans like "Toccata is live" become true and must be replaced with the new wrong wordings ("Toccata is still pending").
- **The whole look now lives in the "APPLE DESIGN LAYER" appended at the end of `styles.css`** (2026-07-08 redesign, owner-approved). It wins by cascade order over the 8,600 lines of legacy glass-era CSS above it. Edit the layer, not the legacy blocks. Tokens: bare `:root` and `[data-theme="dark"]` carry the dark Apple palette (site is dark-by-default; `nav.js` also defaults to dark), `[data-theme="light"]` carries light. If you add tokens, define them in all three places.
- **Mobile verification when the user's Chrome window won't resize** (tiled/managed windows ignore `resize_window`, and page zoom can make `window.innerWidth` disagree with the window size): write a scratchpad HTML harness with 390px-wide iframes pointing at the local server, serve the scratchpad dir on another port, and screenshot that. Media queries respond to iframe viewport width, so it's a faithful mobile render.
- **After any CSS change, rerun the two audit harnesses in `_preview-site/measure.html`** (gitignored, served by serve-local.py, same-origin so iframes are inspectable): the alignment measurer checks every direct child of every centered hero for horizontal skew, and the glass hunter checks every element's computed styles for sheen gradients and in-page backdrop blur. Both were built because eyeballing and h1-only probes missed a whole class of bugs three times (off-center search bar, the Risks page's 2/3-width hero, sheened classless article cards). Verify with the harness until it prints CLEAN/zero, not with screenshots of two pages. Gotchas: iframe URLs need a cache-buster per load or you re-measure stale CSS, and `text-align: center` does not center width-capped block children or flex rows; boxes need `margin-inline: auto` and flex rows need `justify-content: center`.
- **"Glass" is more than white sheens and blur.** The first de-glass pass certified "clean" using a scanner that only matched white linear-gradients and backdrop-filter, and the owner immediately found survivors (the Beginner reading order list): cyan-tinted sheens, flat translucent-white fills (`rgba(255,255,255,.04)` backgrounds), and rgba-white borders are all glass too, and legacy `:nth-child` accent variants can outrank a flat override by specificity. The current inventory scanner in `_preview-site/measure.html` checks every element's computed backgroundImage (any gradient), backgroundColor (grayscale translucency), and border color (grayscale translucency) in BOTH themes; the one sanctioned exception is solid brand-gradient accents (green-to-cyan badges/buttons). When the owner says "I found one, there are probably more," enumerate the whole class from the CSS (grep the signature across every rule) rather than fixing the reported instance, and do not report clean until the inventory prints only sanctioned items.
- **`AGENTS.md`'s Content Rules > Voice section (no em dashes ever, no AI-tell phrasing) applies to `experiment/` too**, not just the main public pages it was written for. Confirmed 2026-07-09: the owner explicitly asked for this after finding em dashes in `experiment/index.html` and `experiment/tipjar.html`, both in prose and in `—` used as an empty-value placeholder in `<code>`/`<strong>` elements (fixed by using `loading…` instead, since JS always replaces it on load). Before merging any new page under `experiment/` (including agent-built ones), grep it for `—` and the other tells this file's voice section names (seamless, robust, unlock, empower, leverage, utilize, "it's not just X, it's Y," rhetorical questions, "why this matters" bridges) and fix any hits before it ships.

## The reading contract, 2 September 2026

The owner's governing idea for the site, in his words: scrolling a page should
never feel like being force-fed. Anything a reader might not want on screen goes
under a disclosure, so they can click for more or scroll on to something more
interesting.

The default question for any block is not "can this be deleted" but "does a
scrolling reader need this on screen". If the answer is no, fold it rather than
delete it. The visible path carries the claim, the number that proves it, and its
status label. Caveats, formulas, per-chain notes, worked examples and source
trails belong behind a `<summary>`.

Folded content is not a cost. A page carrying 3,000 characters of depth behind
good summaries is better than one carrying 1,500 a reader must scroll past. This
outranks any word or character target, including the ones in this file.

A `<summary>` is the entire contract with a reader deciding whether to click, so
name what is inside it: "Assumptions, exact math, and sources", never "Learn more".

**Fold prose and reference detail. Do not fold a table that answers its own
section.** Learned 2 September 2026 by doing it wrong on six pages at once.
`scripts/check-page-height.mjs` caps an undifferentiated vertical run at 800px and
counts only what a reader can look at or touch: a demo, a control, an image, a
table. A closed summary is a heading wearing different clothes and counts for
nothing, so folding a table deletes a landmark and the run past it grows. Nine
tables were folded and unfolded again for that reason. Leaving them as
always-open disclosures is worse than not folding at all, because the summary
line costs height and buys nothing; unwrap them back to plain tables. The test
before folding anything: if the section's heading states a claim and this block
is the evidence for that claim, it stays open. If the block is a caveat, a
formula, a per-item note, a worked example or a source trail, it folds.

## Prose rules

Added 2 September 2026. These bind every file written or edited in this repo:
docs, public copy, code comments, commit messages, READMEs. They are consistent
with `PROSE_STANDARD.md` and `COPY_STYLE.md` and do not replace either. Where
they overlap, follow whichever is stricter.

**Rule 0, which governs the rest: cut unnecessary prose, always, in everything.**
Not as a task someone assigns when a page grows too long, and not only on the
public pages. It applies to every artifact: page copy, this file, agent briefs,
commit messages, code comments, handoff notes, and replies to the owner. The
default action on a sentence that carries no number, mechanism, status, source
or instruction is to delete it. Length is never the goal and never the defense:
a shorter version that keeps every load-bearing fact is always the better one,
and the burden is on a sentence to earn its place rather than on the editor to
justify removing it. The owner has asked for this repeatedly and unprompted,
which is the signal `PRINCIPLES.md` says to weight highest.

The one thing that outranks it: never cut a number, a status label, a source, or
an evidence boundary to make something shorter. Brevity that costs a receipt is
not brevity, it is a different and worse document.

1. **Say it literally.** If a literal phrase exists, use it. No metaphor standing
   in for a statement ("a dial worth turning" for "a parameter worth varying",
   "earns its keep" for "still matters"). Metaphor drags in connotations nobody
   chose.
2. **Plain verbs.** Increases, decreases, depends on, is measured, forms,
   becomes. Not climbs, unlocks, tips, collapses, gives out. Not leveraged,
   decoupled, enabled, empowers, transforms. If the verb would look wrong in a
   lab notebook, it is wrong.
3. **No rhetorical structure.** No "not X, but Y". No "the question is not
   whether, but how far". No inverted openings. No triads built for rhythm. One
   fact per sentence, subject first, then stop.
4. **No em dashes.** American spelling and American date and number conventions
   throughout.
5. **Delete on sight, do not soften:** unique, cutting edge, dramatically,
   state-of-the-art, seamless, robust, powerful, comprehensive, crucial,
   leverage, delve, landscape, realm, journey, testament, elevate, unlock.
6. **Twelve-word test.** Any sentence over twelve words carrying no technical
   term (a named mechanism, a number with units, a named phase, a real process
   noun) is filler. Delete it. Do not rewrite it.
7. **No hedging or permission-asking:** "I'd love to", "feel free to", "it's
   worth noting", "it's important to note", "as we can see".
8. **No paragraph restating what was just said.** No closing line promising
   future work.
9. **Never gloss a term the reader uses daily.** The absence of explanation is
   the credential.
10. **Read each sentence as the recipient.** If it could sit on a random SaaS
    homepage with the nouns swapped, cut it. If it could sit in a run log, keep
    it.

Deletion beats rewriting. Deletion never introduces a new error. Once something
is cut it stays cut; do not reintroduce its content in flatter wording.

One exclusion: the attributed personal essays keep their author's voice.
Fragments, blunt sentences, jokes, profanity and parenthetical asides in that
prose are the author's and are not normalized. `AGENTS.md` states this already.
