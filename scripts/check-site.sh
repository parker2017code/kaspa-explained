#!/usr/bin/env bash
set -euo pipefail

domain="https://kaspaexplained.com"
expected_pages=(
  "index.html"
  "what-crypto-is-good-for.html"
  "status.html"
  "faq.html"
  "why-kaspa-matters.html"
  "where-kaspa-fits.html"
  "knowledge-map.html"
  "glossary.html"
  "sources.html"
  "about.html"
)
expected_files=(
  "AGENTS.md"
  "CONTENT_BRIEF.md"
  "README.md"
  "CLAIMS.yml"
  "llms.txt"
  "llms-full.txt"
  "robots.txt"
  "sitemap.xml"
  "CNAME"
)

for file in "${expected_pages[@]}" "${expected_files[@]}"; do
  [[ -f "$file" ]] || { echo "Missing $file" >&2; exit 1; }
done

[[ "$(tr -d '\r\n' < CNAME)" == "kaspaexplained.com" ]] || {
  echo "CNAME must remain kaspaexplained.com" >&2
  exit 1
}

grep -q "${domain}/sitemap.xml" robots.txt || {
  echo "robots.txt must point at sitemap.xml" >&2
  exit 1
}

for page in "${expected_pages[@]}"; do
  if [[ "$page" == "index.html" ]]; then
    url="${domain}/"
  else
    url="${domain}/${page}"
  fi

  grep -q "<loc>${url}</loc>" sitemap.xml || {
    echo "sitemap.xml missing ${url}" >&2
    exit 1
  }

  grep -q "rel=\"canonical\" href=\"${url}\"" "$page" || {
    echo "$page missing canonical ${url}" >&2
    exit 1
  }
done

for page in "${expected_pages[@]}"; do
  grep -q "/status.html" "$page" || { echo "$page missing status nav/link" >&2; exit 1; }
  grep -q "/sources.html" "$page" || { echo "$page missing sources nav/link" >&2; exit 1; }
  grep -q "/about.html" "$page" || { echo "$page missing about nav/link" >&2; exit 1; }
done

forbidden_patterns=(
  "Toccata is live"
  "DAGKnight is live"
  "vProgs are live"
  "Native DeFi is live"
  "Kaspa has instant finality"
  "TangVM is live"
  "Kaspa oracle flows are live"
)

for pattern in "${forbidden_patterns[@]}"; do
  if grep -RIn --include='*.html' "$pattern" . >/tmp/kaspa-forbidden-match.txt; then
    echo "Forbidden overclaim found: $pattern" >&2
    cat /tmp/kaspa-forbidden-match.txt >&2
    exit 1
  fi
done

echo "Site checks passed."
