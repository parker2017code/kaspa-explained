#!/usr/bin/env bash
set -euo pipefail

domain="$(python3 -c 'import json; print(json.load(open("site-manifest.json"))["domain"])')"
mapfile -t expected_pages < <(python3 -c 'import json; print("\n".join(json.load(open("site-manifest.json"))["pages"]))')
mapfile -t expected_files < <(python3 -c 'import json; print("\n".join(json.load(open("site-manifest.json"))["requiredFiles"]))')

for file in "${expected_pages[@]}" "${expected_files[@]}"; do
  [[ -f "$file" ]] || { echo "Missing $file" >&2; exit 1; }
done

bash scripts/check-nav-sync.sh
python3 scripts/check-claims.py
python3 scripts/build-sitemap.py --check
python3 scripts/check-html.py
python3 scripts/check-search-map.py
python3 scripts/check-copy-quality.py

[[ "$(tr -d '\r\n' < CNAME)" == "kaspaexplained.com" ]] || {
  echo "CNAME must remain kaspaexplained.com" >&2
  exit 1
}

[[ -s og-kaspa-explained.png ]] || {
  echo "og-kaspa-explained.png must exist and be non-empty" >&2
  exit 1
}

grep -q "${domain}/sitemap.xml" robots.txt || {
  echo "robots.txt must point at sitemap.xml" >&2
  exit 1
}

for page in "${expected_pages[@]}"; do
  forbidden_public_notes=(
    "What should be clickable"
    "Source map"
    "reviewer:"
    "Technical:"
    "What Claude"
    "Active build plan"
    "Artifact work order"
  )

  for phrase in "${forbidden_public_notes[@]}"; do
    if grep -qi "$phrase" "$page"; then
      echo "$page exposes internal note language: $phrase" >&2
      exit 1
    fi
  done

  if [[ "$page" == "index.html" ]]; then
    url="${domain}/"
  else
    url="${domain}/${page%.html}"
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

  grep -Eq '<link rel="icon" href="favicon\.svg(\?[^"]*)?" type="image/svg\+xml">' "$page" || {
    echo "$page missing SVG favicon metadata" >&2
    exit 1
  }

  grep -q '<link rel="icon" href="favicon.ico" sizes="any">' "$page" || {
    echo "$page missing ICO favicon metadata" >&2
    exit 1
  }

  grep -q '<link rel="icon" href="favicon.png" type="image/png">' "$page" || {
    echo "$page missing PNG favicon metadata" >&2
    exit 1
  }

  grep -q '<link rel="apple-touch-icon" href="apple-touch-icon.png">' "$page" || {
    echo "$page missing Apple touch icon metadata" >&2
    exit 1
  }

  grep -q '<link rel="manifest" href="site.webmanifest">' "$page" || {
    echo "$page missing web app manifest metadata" >&2
    exit 1
  }

  grep -q '<meta name="apple-mobile-web-app-title" content="Kaspa Explained">' "$page" || {
    echo "$page missing Apple web app title" >&2
    exit 1
  }

  grep -q '<meta name="theme-color" content="#09090b">' "$page" || {
    echo "$page missing theme-color metadata" >&2
    exit 1
  }

  grep -Eq 'property="og:image" content="https://kaspaexplained.com/og-kaspa-explained(-[0-9]{8})?\.png(\?[^"]*)?"' "$page" || {
    echo "$page missing PNG OpenGraph image" >&2
    exit 1
  }

  grep -Eq '<script defer src="nav\.js(\?[^"]*)?"></script>' "$page" || {
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

if grep -q 'Ask AI\|llm-widget\|llm-launch' nav.js styles.css; then
  echo "Retired Ask AI widget code should not ship in nav.js/styles.css" >&2
  exit 1
fi

for page in "${expected_pages[@]}"; do
  grep -q '<meta name="description" content="[^"]' "$page" || {
    echo "$page missing meta description" >&2
    exit 1
  }

  grep -q '<meta name="dateModified" content="[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]">' "$page" || {
    echo "$page missing ISO dateModified metadata" >&2
    exit 1
  }
done

for page in "${expected_pages[@]}"; do
  grep -q "/status" "$page" || { echo "$page missing status nav/link" >&2; exit 1; }
  grep -q "/sources" "$page" || { echo "$page missing sources nav/link" >&2; exit 1; }
  grep -q "/about" "$page" || { echo "$page missing about nav/link" >&2; exit 1; }
done

check_anchor() {
  local file="$1"
  local anchor="$2"

  grep -Eq "id=\"${anchor}\"|name=\"${anchor}\"" "$file"
}

for page in "${expected_pages[@]}"; do
  while IFS= read -r anchor; do
    [[ -n "$anchor" ]] || continue
    if ! check_anchor "$page" "$anchor"; then
      echo "$page links to missing local anchor #$anchor" >&2
      exit 1
    fi
  done < <(
    grep -oE 'href="#[^"]+"' "$page" \
      | sed 's/^href="#//; s/"$//' \
      | sort -u
  )
done

while IFS='|' read -r from_page target_file anchor; do
  [[ -n "$from_page" && -n "$target_file" && -n "$anchor" ]] || continue
  if [[ ! -f "$target_file" ]]; then
    echo "$from_page links to missing file $target_file#$anchor" >&2
    exit 1
  fi
  if ! check_anchor "$target_file" "$anchor"; then
    echo "$from_page links to missing anchor $target_file#$anchor" >&2
    exit 1
  fi
done < <(
  for page in "${expected_pages[@]}"; do
    grep -oE 'href="/[^"]+#[^"]+"' "$page" \
      | sed 's/^href="//; s/"$//' \
      | while IFS= read -r ref; do
          target_path="${ref%%#*}"
          anchor="${ref##*#}"
          target_file="${target_path#/}"
          if [[ "$target_file" != *.html ]]; then
            target_file="${target_file}.html"
          fi
          printf '%s|%s|%s\n' "$page" "$target_file" "$anchor"
        done
  done
)

claim_checks=(
  "status.html|Toccata|target"
  "llms.txt|Near-term: Toccata"
  "CONTENT_BRIEF.md|Toccata should not be described as live"
  "status.html|DAGKnight|research"
  "status.html|vProgs|roadmap"
)

for check in "${claim_checks[@]}"; do
  IFS='|' read -r file first second <<< "$check"
  if [[ -n "${second:-}" ]]; then
    grep -qi "$first" "$file" && grep -qi "$second" "$file" || {
      echo "$file missing expected claims consistency markers: $first / $second" >&2
      exit 1
    }
  else
    grep -q "$first" "$file" || {
      echo "$file missing expected claims consistency marker: $first" >&2
      exit 1
    }
  fi
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
