# Kaspa Explained improvement notes

This is an internal working note for editorial and UX cleanup. Do not turn it into a public page.

## Current grade

- Source-disciplined explainer: B+
- Polished public website: B-

## Active Todo

Work in this order unless a visible regression appears:

1. Homepage route compression: keep the first screen to the plain thesis, the beginner route, the status/source route, and one builder/app route.
2. Long-page pruning: shorten `sources.html`, `knowledge-map.html`, `status.html`, and any remaining card-wall sections by collapsing reference material behind details.
3. Clickable-affordance audit: every card, chip, status label, or route-looking object must either link somewhere useful or look like passive text.
4. Copy pass: remove remaining defensive loops such as repeated "not live", "check status", "claims need context", and "status discipline" where the page already links to Status or Sources.
5. Visual pass: keep light/dark mode small, check mobile/desktop rendered pages, and fix contrast or spacing before changing content.
6. Manifest pass: move more nav/search/page inventory toward `site-manifest.json` generation instead of manual sync.
7. Source sync: when public wording changes, keep visible HTML, `CLAIMS.yml`, `llms.txt`, README, and notes aligned.
8. Publish verification: after push, verify Actions/Pages and fetch exact live HTML before saying it is live.

## Next Defined Work

1. Skeptical-case page.
   - What it is: one public page that gives the strongest fair objections to Kaspa before answering them.
   - It should cover node-operation pressure, fee/security budget, liquidity and developer mindshare, mining concentration, ecosystem/indexer fragility, and whether app-layer ambition muddies the money/payments story.
   - Done when it is linked from the homepage or One Screen page, listed in search, and source/status language stays conservative.
2. Command-line guide hardening.
   - What it is: keep `/command-line.html` as the public guide for independent verification from terminal.
   - Done when current Rusty Kaspa/node/wallet/RPC/testnet commands are source-backed, and Toccata command wording is refreshed only after public mainnet activation evidence changes.
3. Beginner route compression.
   - What it is: make the first-reader route "What problem is Kaspa trying to solve?", "What is live?", and "What could go wrong?"
   - Done when a nontechnical reader can follow those three pages without reading Sources or Builder Guide first.

## Main problems to fix

- The site is credible but slightly over-disciplined. It repeats live / targeted / roadmap / research too often.
- Some pages sound like they are preventing misunderstandings instead of simply teaching.
- The next quality jump is hierarchy and pruning, not more content.
- Cards that look clickable must either be links or become clearly informational.
- Static checks are strong, but they do not replace rendered mobile/desktop review.
- The homepage is polished and the blockDAG visual helps, but first-time users still see a lot of navigation and status language.
- Mobile header is cramped; the small Light toggle can compete with the menu.
- The floating Ask AI control is useful but heavy on mobile and can cover lower-right content.
- Application Layer is too long on mobile and needs stronger top-level segmentation.
- Card grids are consistent, but some pages become cards all the way down.
- The status page is one of the clearest dense pages and should be used as the model for future dense sections.

## Editorial direction

- Lead with the useful explanation first, then status/source discipline where it helps.
- Keep one clear status table instead of repeating the full status taxonomy everywhere.
- Use page-specific jobs: beginner pages teach, builder pages route, status pages audit, source pages cite.
- Treat one reported issue as a class until proven otherwise. One confusing status chip means check all status chips; one fake-clickable card means check every similar card; one cramped mobile control means check the header/footer/floating controls across breakpoints.
- Treat cringey language as a product bug: vague roadmap fog, fake-official labels, repeated defensive disclaimers, unexplained jargon, internal planning language, and claims bigger than the evidence.
- Write like the site should read. No vague process labels. Say the job plainly: shorten the page, link the card, remove the fake button, move the detail to docs, explain the command prereq, or show what the app does.
- For broad cleanup, use read-only parallel agents to search faster: clickable-looking elements, cringey copy, mobile layout, source/reference issues, and strong-site patterns. The main agent owns edits and checks.
- Reduce repeated caveat patterns. Say what works, what is targeted, what is missing, then move on.
- Avoid internal terms like lanes unless the page explicitly explains them.
- Preserve source discipline without making every page sound like it is defending itself.
- Let the status page carry most of the live / targeted / roadmap / research burden.
- On education pages, lead with concrete use and plain explanation before caveats.
- For valuation questions, avoid price targets and stale numbers by default. Teach unit price versus market cap, then explain Bitcoin certainty versus Kaspa adoption/execution risk.

## Near-term UX cleanup

- Make homepage status summary cards link into the status page or make them visually static.
- Review the longest pages for collapsible detail and stronger section hierarchy.
- Spot-check mobile layout and light mode visually, not only with static gates.
- Move duplicated manual structures toward manifest-driven generation where drift risk is high.

## Reader groups

- Beginner: wants the plain answer to what Kaspa is.
- Crypto-aware reader: wants where Kaspa fits compared with Bitcoin, Ethereum, Solana, stablecoins, and app chains.
- Skeptic/source-checker: wants to know whether claims are overextended.
- Builder: wants what can actually be built and what is not live yet.
- Community writer: wants careful wording that is usable publicly without repeating the whole caution system.

## Classic LLM smells to remove

- Coverage inflation: too many pages, cards, and labels instead of one decisive path.
- Matrix addiction: status tables are useful, but they should not replace teaching.
- Defensive copy loops: repeating not live, check status, not the same as, and do not confuse too often.
- Label churn: live, targeted, roadmap, research, status-labeled, evidence, and sources repeated until they become texture.
- Big-file/manual-inventory drift: navigation, search, and page inventory should become more manifest-driven over time.

## Improvement order

1. Reduce repeated status caveats on pages where the status page already carries the burden.
2. Do a mobile-first pass on header, floating Ask AI button, and long app-layer pages.
3. Review the longest pages for collapsible detail and stronger section hierarchy.
4. Replace more proof/status text with clearer user journeys and concrete examples.

## Next work

1. Put money rails first, covenants second, based apps third, vProgs later.
2. Make every card, chip, and label either do something or look like plain text.
3. Shorten Application Layer, Builder Guide, Sources, and Knowledge Map.
4. Keep live/targeted/roadmap/research mostly on the Status page.
5. Steal structure from strong sites: simple hero, few routes, docs carry depth, no matrix homepage.
6. Recheck Vite, Astro, Docusaurus/Starlight, docs.page, and Kaspa.org source.
7. Generate nav/search/page lists from one source.
8. Keep public HTML, `CLAIMS.yml`, `llms.txt`, README, and notes in sync.
9. Make the beginner route clearer.
10. Make the builder route answer: what can I build now?
11. Verify live pages after each pushed public change.
12. Keep the Kaspa-vs-Bitcoin valuation answer short: market cap, liquidity, access, adoption, certainty, and execution risk before roadmap taxonomy.

## Priority queue

1. Fix visible layout defects first: mobile nav overlap, desktop horizontal overflow, light-mode contrast, clipped buttons, and lower-right floating-control collisions.
2. Make every clickable-looking card, chip, or status label either a real link/control or visually static text.
3. Keep the homepage simple: plain thesis, one primary route, one beginner route, one status/source route.
4. Move repeated live/targeted/roadmap/research language to the status page and use shorter page-specific links elsewhere.
5. Run the public framing pass: money-first, covenants as constrained spend rules, based apps as app state anchored to Kaspa evidence, and vProgs as later architecture.
6. Shorten the longest public pages, especially Application Layer, by using stronger top-level segmentation and optional detail.
7. Then reduce maintenance risk: manifest-driven nav/search/page inventory, fewer repeated card structures, and smaller CSS sections.

## Current UI Rule

- Keep light/dark controls small and out of the main reading path. The theme toggle belongs as a bottom-corner utility, not as another nav item.
- Keep Ask AI and theme controls on opposite corners when both are present.
- Heavy tables, source lists, and reference grids should default to collapsed details unless the page's main job requires them visible.
- If a page already links to Status or Sources, do not repeat the full caveat taxonomy in the body.

## Lessons from strong open-source websites

- Homepage should explain the shape quickly; source/status pages prove the details.
- Use one plain thesis, one primary route, one secondary route, and one technical/source route.
- Vite-style lesson: a memorable sentence plus a direct start action is stronger than a broad content grid.
- Astro-style lesson: lead with the product promise, then use visuals and proof points after the reader understands the frame.
- Docusaurus/Starlight lesson: dense docs can be excellent if navigation, search, headings, and side routes are obvious.
- docs.page lesson: blunt open-source value props work when they say exactly what is generated, from where, and with how much setup.
- Kaspa.org lesson: public network pages can sound normal and confident without repeating every caveat on the homepage.
- For Kaspa Explained, the status page should carry most live/targeted/roadmap/research taxonomy.
- Other pages should teach first and link to status/source pages when the reader needs proof.
- Visual system: warm editorial paper in light mode, clean dark mode, one Kaspa green accent, restrained secondary accent.
- Copy system: fewer defensive loops. Say what works, what is coming, what is missing, then move on.
