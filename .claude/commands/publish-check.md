Run the kaspa-explained pre-publish content check.

1. Read `CLAIMS.yml` — list all claims and their sources
2. `grep -r "TN12_ACCEPTED\|TN12_REJECTED\|MAINNET_BLOCKED\|proven\|verified" *.html` — find all factual assertion language in HTML
3. For each factual assertion found in HTML, verify it has a corresponding entry in `CLAIMS.yml`
4. Check `AGENTS.md` line count — warn if over 80 lines
5. Read `CONTENT_BRIEF.md` — check that any new content matches the stated editorial scope

Report: a table of assertions found vs. verified in CLAIMS.yml. Flag any assertion not backed by a CLAIMS.yml entry as UNVERIFIED. Flag any claim about Toccata/TN12 covenants that hasn't been cross-referenced against `../tn12-covenant-vault-demo/artifacts/proof-evidence.json`.
