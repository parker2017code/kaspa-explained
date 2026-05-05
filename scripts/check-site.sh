#!/usr/bin/env bash
set -euo pipefail

domain="https://kaspaexplained.com"
expected_pages=(
  "index.html"
  "start-here.html"
  "crypto-from-zero.html"
  "why-crypto-has-value.html"
  "why-are-there-so-many-coins.html"
  "coin-atlas.html"
  "tradeoff-map.html"
  "analyze-any-coin.html"
  "crypto-history.html"
  "kaspa-in-one-screen.html"
  "adoption-metrics.html"
  "overview.html"
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
  "LICENSE.md"
  "CLAIMS.yml"
  "og-image.png"
  "og-image.svg"
  "llms.txt"
  "llms-full.txt"
  "robots.txt"
  "sitemap.xml"
  "CNAME"
  ".github/workflows/site-check.yml"
  ".github/workflows/link-check.yml"
  "scripts/check-links.sh"
  "scripts/check-nav-sync.sh"
  "nav.js"
)

for file in "${expected_pages[@]}" "${expected_files[@]}"; do
  [[ -f "$file" ]] || { echo "Missing $file" >&2; exit 1; }
done

bash scripts/check-nav-sync.sh

[[ "$(tr -d '\r\n' < CNAME)" == "kaspaexplained.com" ]] || {
  echo "CNAME must remain kaspaexplained.com" >&2
  exit 1
}

[[ -s og-image.png ]] || {
  echo "og-image.png must exist and be non-empty" >&2
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

  grep -q "class=\"skip-link\" href=\"#top\"" "$page" || {
    echo "$page missing skip link" >&2
    exit 1
  }

  grep -q "<main id=\"top\"" "$page" || {
    echo "$page missing main#top target" >&2
    exit 1
  }

  grep -q 'name="twitter:card" content="summary_large_image"' "$page" || {
    echo "$page missing Twitter card metadata" >&2
    exit 1
  }

  grep -q 'property="og:image" content="https://kaspaexplained.com/og-image.png"' "$page" || {
    echo "$page missing PNG OpenGraph image" >&2
    exit 1
  }

  grep -q '<script defer src="nav.js"></script>' "$page" || {
    echo "$page missing nav.js script tag" >&2
    exit 1
  }

  grep -q 'class="nav-menu-button"' "$page" || {
    echo "$page missing nav menu button" >&2
    exit 1
  }

  grep -q 'id="primary-links" class="nav-links"' "$page" || {
    echo "$page missing canonical nav-links container" >&2
    exit 1
  }
done

for page in "${expected_pages[@]}"; do
  grep -q "/status.html" "$page" || { echo "$page missing status nav/link" >&2; exit 1; }
  grep -q "/sources.html" "$page" || { echo "$page missing sources nav/link" >&2; exit 1; }
  grep -q "/about.html" "$page" || { echo "$page missing about nav/link" >&2; exit 1; }
done

mapfile -t forbidden_patterns < <(
  awk '
    /forbidden_copy:/ { in_forbidden = 1; next }
    in_forbidden && /^[[:space:]]+- / {
      sub(/^[[:space:]]+- /, "")
      print
      next
    }
    in_forbidden && /^[[:space:]]*[a-zA-Z0-9_]+:/ { in_forbidden = 0 }
  ' CLAIMS.yml
)

[[ "${#forbidden_patterns[@]}" -gt 0 ]] || {
  echo "CLAIMS.yml must define forbidden_copy phrases" >&2
  exit 1
}

for pattern in "${forbidden_patterns[@]}"; do
  if grep -RIn --include='*.html' "$pattern" . >/tmp/kaspa-forbidden-match.txt; then
    echo "Forbidden overclaim found: $pattern" >&2
    cat /tmp/kaspa-forbidden-match.txt >&2
    exit 1
  fi
done

echo "Site checks passed."
