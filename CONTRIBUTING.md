# Contributing to Kaspa Explained

Kaspa Explained welcomes corrections that make the site clearer, more current, or better sourced.

## What to improve

- Wrong live / targeted / roadmap / research status.
- Broken source links or better primary sources.
- Unclear explanations, missing glossary terms, or confusing diagrams.
- Accessibility, mobile, metadata, or validation fixes.

## Source rules

Use the strongest source available for the claim:

1. Code, releases, KIPs, protocol documentation, activation records.
2. Research papers and direct technical contributor posts.
3. Long-form interviews, transcripts, and learning libraries for framing.
4. Social posts and aggregators only as discovery material.

Do not use market price, exchange rumors, or community excitement as proof of a technical claim.

## Status-sensitive claims

Before changing claims about Toccata, DAGKnight, vProgs, native DeFi, RTD-derived oracle flows, TangVM, or Proof of Useful Work, check current primary or near-primary sources. Keep public wording status-labeled.

Use `CLAIMS.yml` when a claim is sensitive enough that future contributors or LLMs might flatten it into hype.

## Local checks

Run before publishing:

```sh
bash scripts/check-site.sh
```

Run for external-link maintenance:

```sh
bash scripts/check-links.sh
```
