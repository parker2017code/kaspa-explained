# kaspa-explained — Claude Rules

## Non-negotiable constraints
- `CLAIMS.yml` is the source of truth for all factual claims on the site. Never introduce a new factual assertion in HTML without a corresponding entry there.
- Never fabricate txids, addresses, block hashes, DAA scores, or any on-chain proof evidence.
- This is a static site — no server-side code, no build step, no node_modules. Every `.html` file is standalone.

## Key files
- `CLAIMS.yml` — all factual claims; update it whenever HTML introduces new assertions
- `CONTENT_BRIEF.md` — editorial tone and scope guidelines
- `CONTRIBUTING.md` — contribution rules
- `AGENTS.md` — AI agent rules for this repo (keep under 80 lines; trim before adding)

## Conventions
- `CNAME` sets the domain — never edit it
- Toccata/TN12 covenant claims must match the TN12 lab evidence in `../tn12-covenant-vault-demo/artifacts/`; cross-reference before stating anything as proven
- Status vocabulary: use the same labels as the TN12 lab (`TN12_ACCEPTED`, `MAINNET_BLOCKED`, etc.) when describing protocol states
- No corporate abstraction in public copy or handoff notes. If a term like institutional readiness, ecosystem maturity, enterprise adoption, robust, seamless, unlock, or enable appears, replace it or define the actor, the job, and the concrete requirement.

## Publish check
Run `/publish-check` before any content changes go live.
