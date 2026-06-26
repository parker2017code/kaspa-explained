# Kaspa Explained Design Audit Matrix

Reviewed locally: 2026-05-13

Use this before broad UI or copy changes. Kaspa Explained is a protocol field guide. Avoid startup landing-page, price-site, and generic crypto-brochure patterns.

## Product Stance

| Area | Choice | Current check | Next action |
|---|---|---|---|
| Purpose | Source-first field guide: what Kaspa is, what is live, what is targeted, what is roadmap, what is research. | Strong source/status discipline already exists. | Keep every page tied to one reader job. |
| Primary user | New crypto learner, crypto-native comparer, builder, researcher, journalist, LLM/source-checker. | Content brief defines these paths. | Do not make every page serve all audiences equally. |
| User goal | Understand, compare, verify, build carefully, or correct a claim. | Navigation supports Start, One Screen, Apps, Builders, Status, Sources, Search. | Keep home as route map; avoid dense source logic on first screen. |
| De-emphasized | Internal editorial process, repeated caveats, roadmap fog, unexplained jargon, generic Web3 design. | Better than before but still too much term density on some app/build pages. | Continue concrete-first copy cleanup. |

## Information Architecture

| Area | Choice | Current check | Next action |
|---|---|---|---|
| Navigation | Few top-level routes; source/status routes always reachable. | Current nav is coherent. | Keep AI/source-pack material in docs. |
| Page hierarchy | Beginner path, compact thesis, apps/builders, status, sources, search. | Strong. | Add cross-links where cards read like dead text. |
| Search | Static site search is useful. | Search page exists. | Keep labels human-readable and avoid internal-only terms in result cards. |
| Footer | Simple source/trust links. | Fine. | Avoid deep commercial footer. |

## Layout And Density

| Area | Choice | Current check | Next action |
|---|---|---|---|
| Layout system | Static HTML field guide with workbench panels where technical. | App layer and builder guide now have mechanics/workbench visuals. | Apply the same grammar selectively to key pages. |
| Above fold | Page job, plain summary, one visual where it clarifies mechanics. | Start/application/builder improved. | Avoid huge H1 plus long caveats on mobile. |
| Tables | Status/source/detail only. | Many tables remain, but many are behind drawers. | Move encyclopedic tables lower or behind details where possible. |
| Mobile | Hamburger, stacked sections, compact sections. | Screenshots should show no overflow. | Keep checking dense cards, command blocks, and diagrams after every layout edit. |

## Visual System

| Area | Choice | Current check | Next action |
|---|---|---|---|
| Style | Protocol field guide: graphite/off-white, restrained Kaspa teal, dense but calm. | Current dark theme mostly fits. | Avoid generic SaaS hero/cards and decorative crypto visuals. |
| Branding | Kaspa mark, serious technical voice. | Top nav and favicon set carry the brand. | Keep logo sizing and top nav consistent across pages. |
| Color | Teal for source/action, muted text for context, amber only for warnings/highlights. | Generally consistent. | Audit any color-only status labels. |
| Typography | Human-readable first, monospace only for code/hashes. | Good. | Avoid long technical headings on public pages. |
| Spacing | Moderate-density field guide. | New builder console is dense but readable. | Keep cards 8px radius or less. |
| Motion | Light CSS/SVG motion only where it explains mechanics. | BlockDAG map pulse is acceptable. | Add reduced-motion guard if animation expands. |

## Components

| Area | Choice | Current check | Next action |
|---|---|---|---|
| Buttons / CTAs | Route to status, sources, start, and builder paths. | Current CTAs are mostly informational. | Avoid "book demo / join / launch" style language. |
| Forms / inputs | Search is the main sitewide input; diagrams use local controls. | Search exists. | Ensure search has useful empty/error states. |
| Cards | Use for reader paths, source groups, comparison items. | Heavy but manageable. | Make cards clickable when they look actionable. |
| Tables | Use for status, comparisons, source hierarchy. | Strong but dense. | Keep beginner pages less table-heavy. |
| Drawers | Use to hide tool lists, source detail, long tables. | Good pattern. | Avoid hiding the main aha point in drawers. |
| Source pack | AI/source-pack material belongs in `llms.txt`, sources, claims, and evidence pages. | Floating widget retired. | Keep source-pack docs useful without adding a distracting global widget. |

## Implementation Engineering Rules

Use this section before coding visual or copy changes. Kaspa Explained is a static protocol field guide, so implementation quality means clarity, source discipline, accessibility, and low maintenance cost.

| Area | Kaspa Explained rule | Required check |
|---|---|---|
| User intent | Code follows the reader jobs: understand, compare, verify, build carefully, search, or correct a claim. | Every new section should have one reader action and one next link. |
| Components | Treat route cards, source cards, status chips, app-path ladders, search results, tables, drawers, and command blocks as reusable patterns. | Each pattern needs default, hover/focus, empty, error/unavailable, and long-content behavior where applicable. |
| State management | Keep live, testnet-only, targeted, roadmap, research, source-needed, stale-check-needed, wrong, and unsupported distinct. | Do not flatten status lanes into generic "coming soon" or "available" language. |
| Content variability | Long source names, dates, protocol terms, URLs, and examples must wrap without breaking cards or mobile layout. | Test with long headings, long links, and 390px mobile width. |
| Responsive behavior | Mobile pages need a clear reader path. Tables need mobile-specific treatment when width becomes a problem. | Tables need cards, wrappers, or drawers when they are too wide. |
| Accessibility | Use semantic HTML, logical headings, real labels, visible focus, source links with clear text, and status wording beyond color. | Search, nav, theme toggle, diagrams, and drawers must remain keyboard-usable. |
| Performance | Stay static and dependency-light. SVG/CSS visuals are preferred over JS-heavy interaction. | No framework or animation library for decoration. |
| Security and privacy | Avoid surprise tracking, wallet-like UI, private data, or unverifiable assistant claims. | Search and source-pack docs must route back to source/status pages instead of becoming authority. |
| SEO and source trail | Important explanations should remain crawlable HTML with metadata, canonical URLs, sitemap coverage, and llms context alignment. | Run site checks after public copy or route changes. |
| Analytics, if added | Track useful learning paths and broken searches. | Keep consent/privacy clear and avoid broad behavioral surveillance. |
| Maintainability | Keep repeated layout/copy patterns disciplined until a build step becomes clearly worth it. | Prefer shared CSS tokens/classes over page-specific styling. |

## Engineering Discipline Rules

| Principle | Kaspa Explained application | Required behavior |
|---|---|---|
| Problem before solution | Start from the reader question, claim status, source dependency, or route job. | Do not add copy, pages, or visuals until the user action and status boundary are clear. |
| Correctness before cleverness | Plain sourced wording beats clever protocol slogans. | Keep live, targeted, roadmap, research, and testnet evidence distinct. |
| Security and trust default | Source-sensitive claims and wallet/custody implications carry risk. | Verify drift-prone facts and avoid implying product support that does not exist. |
| Tests as specs | Site checks encode the public contract. | Update checks when metadata, navigation, source/status wording, search, route structure, or layout behavior changes. |
| Failure design | No-results, unavailable, broken link, stale status, and mobile overflow are real states. | Give the reader a clear next action instead of an empty or broken surface. |
| Observability | The site should be easy to audit. | Keep canonical URLs, sitemap, source links, claim files, and visible copy aligned. |
| Data integrity | Status labels and source trails are part of the product. | Do not let public HTML, `CLAIMS.yml`, `llms.txt`, and source docs drift apart. |
| Simplicity | Static, readable, source-linked pages are the default. | Add dependencies or new components only when they reduce confusion or verification burden. |
| AI discipline | AI output is untrusted until checked. | Reduce generated prose to concrete claims, verify sources, and run local gates before commit. |

## Content Design

| Area | Choice | Current check | Next action |
|---|---|---|---|
| Copy order | Human picture first, technical label second, status third. | Encoded in README/AGENTS/CONTENT_BRIEF and increasingly in HTML. | Continue term sweeps for mechanism-first or status-blurring language. |
| Crypto translation | Use crypto terms only when they help precision, search, or source matching. | Encoded in `AGENTS.md` and `CONTENT_BRIEF.md`. | Translate each term into what someone tests, buys, builds, approves, measures, or avoids. |
| Tone | Plain, direct, source-disciplined. | Good baseline. | Remove company-deck words and repeated "do not bundle" style copy. |
| Evidence | Claims need source hierarchy or status label. | Very strong. | Keep `CLAIMS.yml`, `llms.txt`, status, and public HTML synchronized. |
| Value in normal use | Explain Kaspa's normal-use case: self-custody, fast mined ordering, rules users can inspect. | App pages improved. | Make more examples problem-first before protocol-first. |
| Error / empty states | 404 exists; search empty state exists. | Good enough. | Audit search messages and broken-link states after JS or source changes. |

## Trust, Accessibility, And Quality

| Area | Choice | Current check | Next action |
|---|---|---|---|
| Trust | Source links, status lanes, no price/investment framing. | Strong. | Continue checking drift-prone facts before status edits. |
| Accessibility | Skip link, semantic HTML, nav, color contrast, keyboard basics. | Checks pass. | Add/maintain focus states and reduced-motion support. |
| SEO / social | Canonicals, sitemap, metadata, Open Graph, llms.txt. | Strong checked surface. | Run `bash scripts/check-site.sh` and rendered layout check after broad edits. |
| Performance | Plain static HTML/CSS/JS; no build system. | Good. | Do not add frameworks for decoration. |
| Privacy | No heavy analytics by default. | Good. | If analytics are added, disclose and keep lightweight. |

## Page-Level Verdict

| Page | Role | Status | Local backlog |
|---|---|---|---|
| `index.html` | Human router and thesis. | Good but can still repeat caveats. | Shorten repeated status-policing language. |
| `start-here.html` | Beginner entry. | Improved with blockDAG visual. | Keep jargon low and links obvious. |
| `application-layer.html` | App opportunity map. | Improved with mechanics/workbench and app-path ladder. | Keep non-obvious app implications front-facing; move mechanical tables lower. |
| `builder-guide.html` | Builder decision path. | Improved with verification console. | Reduce table intimidation over time. |
| `status.html` | Compact status truth table. | Strong. | Compress repeated lane-separation language. |
| `sources.html` | Deep source hierarchy. | Dense by design. | Keep it navigable; avoid making it the first public path. |
| `ai-guidance.html` | LLM/source discipline. | Useful but inherently meta. | Keep reachable and secondary. |
| `search.html` | Static concept search. | Useful. | Add result copy in plain terms where needed. |

## Local Rule

Do not push from this checklist pass unless explicitly asked. Use it to guide local edits, screenshots, and gates first.
