# Maintenance checklist

The owner should not have to catch things. This file is what an agent runs
through every session so nothing rots between visits. If something here turns
out to be wrong or missing, fix this file in the same commit.

---

## 1. Every session, before touching anything

Run these first. They take a few minutes and they decide what the session is
actually about.

```bash
git status --short
bash scripts/check-site.sh
```

Then re-read the sources that move, in this order:

| Source | What it settles | URL |
|---|---|---|
| rusty-kaspa releases | what consensus actually shipped | github.com/kaspanet/rusty-kaspa/releases |
| kips README table | proposal status words | github.com/kaspanet/kips |
| kccs open pull requests | convention drafts, none accepted yet | github.com/kaspanet/kccs |
| argent-lang org | the language layer, three repos | github.com/argent-lang |
| kaspanet/vprogs | app-layer roadmap work | github.com/kaspanet/vprogs |
| kaspanet/silverscript | the compile target, and its testnet advice | github.com/kaspanet/silverscript |
| kas-smiths.org | design arguments before they reach a repo | kas-smiths.org |
| mainnet REST | DAA score, supply, block reward | api.kaspa.org/info/blockdag |

People whose output is worth checking directly: Michael Sutton (Argent, KIP-20,
covenant IDs), Ori Newman (KIP-17), Hans Moog (vProgs, KIP-21), Yonatan
Sompolinsky (research direction, RTD), coderofstuff and IzioDev (wallet and ABI
conventions), Shai Wyborski (consensus papers).

**Do not cite `kaspa.org/developments`, `kaspa.org/build`, or `kaspa.org/lore`
for status.** All three have described Toccata as pre-activation for weeks after
it activated. Use `docs.kaspa.org`, the release tag, and the DAA score. When
they disagree, the tag wins.

---

## 2. Anything with a date or a number in it

Every one of these goes stale on its own. Check each, every session.

- `CLAIMS.yml` -> `last_checked`, and every `recheck_after`. Move a date only
  after re-reading the source. Never bump it to silence the gate.
- The dated baselines in the live trackers: `kips.html` (both tables),
  `kaspa-vprogs-explained.html` (repo pulse), `argent-explained.html` (repo
  table). Each renders a hand-verified baseline first and repaints from GitHub,
  so a stale baseline is invisible to a visitor and still wrong in the file.
- Emission: the next step-down DAA score and its estimated date. Steps fire on
  score, so the score is exact and the date is an estimate. Say it that way.
- Any mainnet snapshot: DAA score, supply, block reward, covenant counts.
  Label with the date read. Never present as a constant.
- `<meta name="dateModified">` on every page touched, plus the same date inside
  its JSON-LD if present.
- Commit counts, star counts, "N open pull requests", "N commits since". These
  age fastest and are the most quotable.
- Repository paths. `michaelsutton/argent` became `argent-lang/argent` and the
  old URL only redirects.

Command to find every dated claim quickly:

```bash
grep -rn "2026-0[0-9]-[0-9][0-9]\|July\|August" --include="*.html" . | grep -v node_modules
```

---

## 3. Before any commit that touches layout or CSS

A grep proves bytes. A DOM tree proves structure. Neither proves geometry, and
geometry is where the bad ones hide.

```bash
bash scripts/check-site.sh            # includes the two guards below
python3 scripts/check-grid-spans.py   # no !important on grid placement
node scripts/audit-rendered-layout.mjs --base http://127.0.0.1:4187
```

The rendered audit needs the local server running:

```bash
python3 scripts/serve-local.py --port 4187
```

What it catches, per page per width: sideways scroll, a card taller than
1200px, a grid leaving one card alone beside a fuller row, and anything
spilling past the viewport.

**The failure this exists to prevent.** On 2026-07-29 a single legacy rule,
`grid-column: auto !important` at `min-width: 900px`, stripped every generated
card span. The containers kept their 12 tracks, so seven cards landed in seven
single tracks and rendered 4,743px tall on the risks page. It was live and site
wide. The whole gate passed, because every check in it read bytes. `!important`
outranks any selector, so no amount of specificity in the new rules could win.

---

## 4. When to add a page, and when not to

Add one when **all** of these hold:

- A reader arrives with a question no existing page answers directly.
- The answer needs more than three paragraphs, or it needs its own table.
- It will not be a near-duplicate of an existing page's second half.

Do **not** add one when the material is a passing mention on five pages that
would be better as one section. Merge instead. `/argent-explained` was worth
adding because Argent appeared on fifteen pages and was explained on none.

Keeping two subjects on one page is right when the reader's actual confusion is
the distinction between them. `/kips` holds KIPs and KCCs together for exactly
that reason. Split when the smaller half stops being a contrast case and starts
being its own subject: for KCCs, when any convention is actually accepted, or
when its table passes roughly fifteen rows.

Every new page needs all of: `site-manifest.json` entry, a `search.html` card,
a `related-links:start` block, canonical URL, the full favicon and social set,
and a rebuild of the sitemap and agent index.

```bash
python3 scripts/build-sitemap.py && python3 scripts/build-agent-index.py
```

---

## 5. When to cut or compress

- A section restates a claim already made on the same page. Cut the weaker one.
- A page carries a status caveat more than once. One label, then move on.
- Stale updates and superseded notes. Remove them, do not annotate them.
- Generated CSS or markup that repeats a long selector list. The no-lone-card
  block once hit 18,890 lines this way; a shared `.grid-cards` class took it to
  8,313.
- Any "what changed this week" note older than the current cycle.

---

## 6. Never let these reach a public page

- Internal process language: review options, what changed in this article,
  local only, framing pass, polish pass.
- Anything from `exports/`, `visual-audit/`, or `_preview-site/`. These are
  gitignored working surfaces. Delete scratch files before committing.
- Invented Kaspa terms. Check against the field-native list in `COPY_STYLE.md`.
- Em dashes, anywhere, ever. Also the tics that travel with them: "it's not
  just X, it's Y", triplets of adjectives, rhetorical-question openers, and
  every section ending on a tidy aphorism.
- A testnet artifact, a roadmap item, or a research direction written as live.
- Fabricated txids, addresses, block hashes, or DAA scores. Ever.

Sweep for the copy tics with:

```bash
python3 scripts/check-copy-quality.py
node scripts/lint-copy.mjs
```

---

## 7. After pushing

Pushed and deployed are different states, and GitHub Pages rate-limits builds
at roughly ten per hour. When a push produces no deployment, that is usually the
limit, not a broken workflow, and waiting is the fix.

```bash
curl -s https://kaspaexplained.com/ | grep -o 'styles.css?v=[a-z0-9-]*'
curl -s https://kaspaexplained.com/<changed-page> | grep -c '<exact changed string>'
```

Confirm the exact changed string on the live page, not just a 200. Then open
the changed page in a browser at desktop and phone width and look at it.
