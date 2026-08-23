#!/usr/bin/env bash
set -euo pipefail

domain="$(python3 -c 'import json; print(json.load(open("site-manifest.json"))["domain"])')"
expected_pages=()
while IFS= read -r page; do
  expected_pages+=("$page")
done < <(python3 -c 'import json; print("\n".join(json.load(open("site-manifest.json"))["pages"]))')

expected_files=()
while IFS= read -r file; do
  expected_files+=("$file")
done < <(python3 -c 'import json; print("\n".join(json.load(open("site-manifest.json"))["requiredFiles"]))')

for file in "${expected_pages[@]}" "${expected_files[@]}"; do
  [[ -f "$file" ]] || { echo "Missing $file" >&2; exit 1; }
done

bash scripts/check-nav-sync.sh
python3 scripts/check-claims.py

# Kaspa.org marketing-site source ban (AGENTS.md, clarified 2026-08-22). This
# leaked into CLAIMS.yml source fields and public pages four times in one day
# before this gate existed; see scripts/check-source-ban.sh for the exact rule
# and the kaspa-org-callout marker that keeps legitimate stale-source citations
# working.
bash scripts/check-source-ban.sh
python3 scripts/check-status-freshness.py
python3 scripts/build-sitemap.py --check
bash scripts/check-redirect-stubs.sh
python3 scripts/build-agent-index.py --check
python3 scripts/check-grid-spans.py
python3 scripts/check-label-colors.py
python3 scripts/check-model-picker.py
python3 scripts/check-benchmark-agreement.py --check >/dev/null || {
  python3 scripts/check-benchmark-agreement.py --check >&2
  echo "benchmark agreement claims in model-picker.html no longer match the data" >&2
  exit 1
}
python3 scripts/check-prose.py --strict >/dev/null || { python3 scripts/check-prose.py >&2; echo "prose standard violations, see PROSE_STANDARD.md" >&2; exit 1; }

# Reading grade, PROSE_STANDARD.md v2.0. Shared copy is held to grade 9; blocks
# marked data-audience="specialist" are measured separately and do not fail.
if python3 -c "import textstat" 2>/dev/null; then
  python3 scripts/check-reading-grade.py >/dev/null || { python3 scripts/check-reading-grade.py >&2; exit 1; }
else
  echo "SKIPPED reading-grade check: textstat not installed (python3 -m pip install textstat)" >&2
fi

# American English, owner instruction 1 Aug 2026. Explicit word map, not a regex
# over -ise/-ize, so words that are -ise in both dialects are safe.
python3 scripts/check-american-english.py >/dev/null || {
  python3 scripts/check-american-english.py >&2
  echo "British spellings found. Fix with: python3 scripts/check-american-english.py --fix" >&2
  exit 1
}
python3 scripts/check-html.py
python3 scripts/check-search-map.py
python3 scripts/check-copy-quality.py

# Density budget (design/density-budget.md, 2026-08-22): 150 words before first
# interaction, 60-word paragraph cap, 30-word table-cell cap, collapsed
# <details> content exempt. ADVISORY for now, on purpose, since the current
# site heavily violates it and the rebuild has not landed; see the
# DENSITY_GATE_BLOCKING switch at the top of scripts/check-density.sh to make
# it fail the build once it has.
bash scripts/check-density.sh

# The node audits are per-machine optional, but they must not kill the gate:
# with set -e, a missing node binary used to abort right here and silently
# skip every check below this line (claim consistency, anchors, forbidden
# copy). That dead zone is how status drift survived the enforcement layer.
# Node is often absent from PATH here but present in the bundled Codex
# runtime. Look there too, otherwise 1,295 lines of audit logic sit dark
# and the gate reports a pass it did not actually earn.
NODE_BIN=""
if command -v node >/dev/null 2>&1; then
  NODE_BIN="node"
elif [[ -x "$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node" ]]; then
  NODE_BIN="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
fi

if [[ -n "$NODE_BIN" ]]; then
  "$NODE_BIN" scripts/lint-copy.mjs
  "$NODE_BIN" scripts/audit-domain-terms.mjs
  "$NODE_BIN" scripts/audit-content-flow.mjs
  "$NODE_BIN" scripts/audit-visual-guardrails.mjs
  # Heading-as-link color gate (2026-08-22): card/section titles that happen
  # to be links rendered in inline-link blue instead of heading color, twice.
  # A grep can't catch it reliably because the real failure is a specificity
  # fight in styles.css, not a literal token; see the script for the exact
  # rule and its data-heading-link-ok opt-out.
  "$NODE_BIN" scripts/check-heading-link-color.mjs
  # Glass/gradient gate (2026-08-23): the owner reported glossy, blue-tinted
  # "glass" surfaces four times, and each time a prior audit had already
  # certified the site clean. The failures were narrow matching (white
  # sheens only), source-only scanning (inline <style> blocks never
  # checked), and treating the brand green-to-cyan gradient as a sanctioned
  # exception. This renders every page in both themes and reads getComputedStyle
  # on every element and ::before/::after, so it catches glass hidden behind
  # a CSS custom property indirection (e.g. `background: var(--glass-surface)`)
  # that a source grep for "gradient(" or an rgba() literal cannot see.
  # demos/ is owned by a different concurrent pass and is reported but not
  # blocking; see the script for the exact split.
  "$NODE_BIN" scripts/check-glass-gate.mjs
  # 300-word visible-surface gate (design/STANDARD.md, "The 300-word
  # surface", 2026-08-23): no page shows more than 300 visible words,
  # essays exempted on their own budget via scripts/essay-pages.json.
  # Rendered-DOM check for the same reason check-heading-link-color.mjs is:
  # a source-text count can't tell an open <details> from a closed one.
  # Advisory until the site complies, same pattern as check-density.sh. Twenty
  # three pages were over the 300-word ceiling the day the rule landed; the
  # check reports them without blocking so the reduction can ship in pieces.
  # Flip VISIBLE_WORDS_BLOCKING to true once the list is empty.
  VISIBLE_WORDS_BLOCKING="${VISIBLE_WORDS_BLOCKING:-false}" \
    "$NODE_BIN" scripts/check-visible-words.mjs || \
    [ "${VISIBLE_WORDS_BLOCKING:-false}" != "true" ]
  # Per-section prose gate for long-form/reference pages (design/STANDARD.md,
  # "The 300-word surface", decision recorded in HANDOFF.md 2026-08-23): the
  # whole-page 300-word ceiling above fits a demo, the homepage, or a routing
  # page. It does not fit a long-form guide or a reference page, where the
  # 300-word cap applies per unbroken run of prose between structural breaks
  # instead of to the whole page. Pages get this rule only if they are listed
  # in scripts/essay-pages.json's per_section_pages, and check-visible-words.mjs
  # already skips those same pages so the two gates never grade the same page
  # twice. Same VISIBLE_WORDS_BLOCKING switch: advisory until the site's
  # per-section pages comply, then flips with the whole-page gate above.
  VISIBLE_WORDS_BLOCKING="${VISIBLE_WORDS_BLOCKING:-false}" \
    "$NODE_BIN" scripts/check-visible-sections.mjs || \
    [ "${VISIBLE_WORDS_BLOCKING:-false}" != "true" ]
  # Render-matrix gate (HANDOFF.md "Finish standard" item 4, 2026-08-23):
  # every sitemap page plus every demos/ file, at 390/768/1280 in both
  # themes, checked for horizontal overflow, sub-16px body text, sub-44px
  # touch targets, console errors, numeric WCAG contrast, and in-page anchor
  # resolution. Advisory until the real violation list is empty, same
  # pattern as check-visible-words.mjs. Flip RENDER_GATE_BLOCKING to true
  # once it is.
  RENDER_GATE_BLOCKING="${RENDER_GATE_BLOCKING:-false}" \
    "$NODE_BIN" scripts/check-render.mjs || \
    [ "${RENDER_GATE_BLOCKING:-false}" != "true" ]
else
  echo "SKIPPED (no node found on PATH or in the bundled runtime): lint-copy, audit-domain-terms, audit-content-flow, audit-visual-guardrails, check-heading-link-color, check-glass-gate, check-visible-words, check-visible-sections, check-render" >&2
fi

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

  grep -q '<meta name="theme-color" content="#000000">' "$page" || {
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

  related_count="$(grep -c '<!-- related-links:start -->' "$page")"
  [[ "$related_count" == "1" ]] || {
    echo "$page must contain exactly one generated related-links block" >&2
    exit 1
  }

  grep -q 'class="section site-related"' "$page" || {
    echo "$page missing site-related section" >&2
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
  "status.html|Toccata|live"
  "llms.txt|Live: Toccata activated"
  "CONTENT_BRIEF.md|Toccata activated at DAA 474,165,565"
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

forbidden_patterns=()
while IFS= read -r pattern; do
  forbidden_patterns+=("$pattern")
done < <(
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

# Scan only publishable pages. This used to walk the whole tree, so a stale
# agent worktree left under .claude/ carried an old copy of every page and a
# phrase retired from the live site still failed the gate from a directory
# that never ships. Agent scratch must not decide whether the site publishes.
for pattern in "${forbidden_patterns[@]}"; do
  if grep -RIn --include='*.html' \
      --exclude-dir=.claude --exclude-dir=.git --exclude-dir=node_modules \
      "$pattern" . >/tmp/kaspa-forbidden-match.txt; then
    echo "Forbidden overclaim found: $pattern" >&2
    cat /tmp/kaspa-forbidden-match.txt >&2
    exit 1
  fi
done

echo "Site checks passed."
