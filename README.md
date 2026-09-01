# Kaspa Explained

[kaspaexplained.com](https://kaspaexplained.com) is a plain-English guide to
Kaspa built around demos you can push on. Move a slider and watch a
blockDAG keep the blocks a single chain throws away. Price a 51% attack at
today's hash rate. Watch a covenant refuse a spend that breaks its own rule.

This is not an official Kaspa website and it is not investment advice.

## Why it looks like this

The first version was built to be read by language models. That was the wrong
call. Nobody used it, including the person who built it. The site is now built
for people, and the demos are the point: the "Try it" section in the nav is the
front door, and every topic page carries the demo that backs its claim.

The writing still matters, but it is there to support the thing you just did,
not the other way round.

## Contributing

Corrections are the most useful contribution, especially on status claims.
Kaspa moves, and a page that was right in June can be wrong in August. See
`CONTRIBUTING.md`.

Content is CC BY 4.0. Code, CSS, scripts, and workflows are MIT. See
`LICENSE.md`. The site belongs to the community more than to any one
maintainer; fork it, lift a demo, argue with a number.

## What is where

`site-manifest.json`, `sitemap.xml`, and `llms.txt` are the checked inventory.
Every other `.html` file in the root or under `/demos/` is a `noindex` redirect
stub pointing at one of the listed pages, usually to a specific anchor.

- `index.html` routes by audience, and carries the collision demo inline.
- `start-here.html` sends a true beginner to `crypto-from-scratch.html` first.
- `what-is-kaspa.html` is the core mechanism explainer: proof of work, UTXO
  ownership, blockDAG, GHOSTDAG, covenants. Carries four demos.
- `why-kaspa-matters.html` covers neutral money, self-custody, and the
  confirmation-risk curve.
- `kips.html` tracks KIPs and KCCs live from GitHub, and carries the DAGKnight
  demo comparing a fixed consensus margin against one that tracks real latency.
- `status.html` separates live mainnet from testnet, targeted, roadmap, and
  research, and fact-checks 16 claims.
- `skeptical-case.html` is the case against, in seven risks.
- `kaspa-mining.html` covers price and hash-rate cycles plus solo mining, with
  four demos including attack cost and node cost.
- `build-on-kaspa.html` takes a builder from an idea to a build path.
- `argent-explained.html` covers the actor-based language compiling to
  Silverscript covenants.
- `utxo-vs-accounts.html` runs five payments at once against a coin ledger and a
  balance ledger, then prices what the missing shared slot costs Kaspa apps.
- `kaspa-origin-story.html` is the sourced fair-launch history.
- `sources.html` ranks what settles a claim.
- `demos/index.html` maps every demo to the page it lives on.

## Source discipline

First-party sources first for anything status-sensitive: kaspanet GitHub
repositories, releases, KIPs, docs.kaspa.org, public API and node readings, and
research papers. Core technical posts explain rationale; they do not replace a
release tag, a merged KIP, or activation evidence.

The kaspa.org marketing pages are not used as a source. Twice, months apart,
they still described Toccata as pending on testnet long after it activated on
mainnet. `wiki.kaspa.org` and `docs.kaspa.org` are fine.

`CLAIMS.yml` is the checked registry: every status-sensitive claim, its source,
and the date it must be rechecked. `scripts/check-status-freshness.py` fails the
build when a recheck date passes, so claims cannot quietly rot.

## Checks

```sh
bash scripts/check-site.sh
```

That is the publish gate, and `Site checks passed.` is the only line that
counts. It runs about two dozen checks: HTML validity, claim consistency,
source bans, status freshness, nav synchronization, redirect stubs, reading
grade, prose rules, American English, rendered layout at three widths in both
themes, broken links and missing anchors, visible-word ceilings, page height,
and per-demo surface budgets.

Several of those exist because a specific defect shipped once. The demo-surface
check exists because a demo grew four blocks of specialist prose on its
opening screen and no gate could see it. The page-height check counts only
things a reader can look at or touch, because an earlier version counted
headings as landmarks and passed every page on a day when every page was too
long.

Local preview, with clean URLs so `/status` resolves:

```sh
python3 scripts/serve-local.py --port 4187
```

External links are audited separately and weekly, so a third-party outage does
not block a content fix:

```sh
bash scripts/check-links.sh
```

## For contributors and agents

`AGENTS.md` is the durable instruction file: voice, verification contract,
source rules, and the failure modes this repo has already hit.
`WORKING-STATE.md` carries what is true today. `design/STANDARD.md` and
`design/THE-BAR.md` carry the design and credibility bars, including the test
every demo has to pass: someone with a high school diploma and a rough idea of
what crypto is should know what the demo shows and what to touch, immediately,
with no help.

## Hosting

GitHub Pages from `main`, root folder, custom domain `kaspaexplained.com`. The
`CNAME` file must contain exactly that. Apex A records point at GitHub's four
Pages addresses; `www` is a CNAME to `parker2017code.github.io`, never to the
repository name.
