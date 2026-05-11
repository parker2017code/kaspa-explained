# Kaspa Explained improvement notes

This is an internal working note for editorial and UX cleanup. Do not turn it into a public page.

## Current grade

- Source-disciplined explainer: B+
- Polished public website: B-

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
- Reduce repeated caveat patterns. Say what works, what is targeted, what is missing, then move on.
- Avoid internal terms like lanes unless the page explicitly explains them.
- Preserve source discipline without making every page sound like it is defending itself.
- Let the status page carry most of the live / targeted / roadmap / research burden.
- On education pages, lead with concrete use and plain explanation before caveats.

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
