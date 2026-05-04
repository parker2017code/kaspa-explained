#!/usr/bin/env bash
set -euo pipefail

domain="https://kaspaexplained.com"
expected_pages=(
  "index.html"
  "what-crypto-is-good-for.html"
  "status.html"
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

echo "Site checks passed."
