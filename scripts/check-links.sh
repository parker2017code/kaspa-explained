#!/usr/bin/env bash
set -euo pipefail

# Exclusions below, each proven not to be a page link on 2026-10-06:
#  - api.github.com/repos/argent-lang/ and api.kaspa.org/blocks/ are URL prefixes
#    that build-on-kaspa.html and what-is-kaspa.html extend in script (repo name,
#    block hash); the full endpoints return 200.
#  - status.kaspa.example is a reserved .example placeholder in design/patterns.html.
tmp_urls="$(mktemp)"
trap 'rm -f "$tmp_urls"' EXIT

grep -RhoE 'https?://[^"'"'"')<[:space:]]+' \
  --include='*.html' \
  --include='*.md' \
  --include='*.txt' \
  --include='*.yml' \
  --exclude-dir=.git \
  --exclude-dir=.claude \
  --exclude-dir=node_modules \
  --exclude-dir=_preview-site \
  --exclude-dir=visual-audit \
  --exclude-dir=exports \
  --exclude-dir=.freebuff \
  --exclude='kaspa-x-posts-*.md' \
  . \
  | sed 's/[`.,;]*$//' \
  | grep -Ev '(\{|\}|&lt;|&gt;|<|>)' \
  | grep -Ev '^https?://(127\.0\.0\.1|localhost)(:|/|$)' \
  | grep -Ev '^https://api\.kas\.fyi/v1/transactions/acceptance$' \
  | grep -Ev '^https://api\.kas\.fyi/v1/addresses/?$' \
  | grep -Ev '^https://api\.github\.com/repos/argent-lang/$' \
  | grep -Ev '^https://api\.kaspa\.org/blocks/$' \
  | grep -Ev '^https://status\.kaspa\.example/?$' \
  | sort -u > "$tmp_urls"

failures=0
while IFS= read -r url; do
  [[ -n "$url" ]] || continue

  if [[ "$url" == https://kaspaexplained.com* ]]; then
    local_path="${url#https://kaspaexplained.com}"
    local_path="${local_path%%\#*}"
    local_path="${local_path%%\?*}"
    if [[ -z "$local_path" || "$local_path" == "/" ]]; then
      local_file="index.html"
    elif [[ "$local_path" == */ ]]; then
      # Directory-style URL (e.g. "/demos/"): clean-URL convention on this
      # site resolves to that directory's own index.html, same as
      # scripts/serve-local.py and GitHub Pages actually serve it. Used to
      # append ".html" straight onto the trailing slash and fail every
      # such link ("demos/" + ".html" = "demos/.html", which never exists).
      local_file="${local_path#/}index.html"
    else
      local_file="${local_path#/}"
      if [[ "$local_file" != *.* ]]; then
        if [[ -f "${local_file}/index.html" ]]; then
          local_file="${local_file}/index.html"
        else
          local_file="${local_file}.html"
        fi
      fi
    fi

    if [[ -f "$local_file" ]]; then
      printf 'OK   local %s\n' "$url"
    else
      printf 'FAIL local %s\n' "$url" >&2
      failures=$((failures + 1))
    fi
    continue
  fi

  code="$(
    curl -L -sS \
      --retry 3 --retry-all-errors --retry-delay 2 \
      --connect-timeout 12 \
      --max-time 25 \
      -o /dev/null \
      -w '%{http_code}' \
      -A 'kaspaexplained-link-check/1.0' \
      "$url" || true
  )"

  case "$code" in
    2*|3*|401|403|405|429)
      printf 'OK   %s %s\n' "$code" "$url"
      ;;
    *)
      printf 'FAIL %s %s\n' "${code:-000}" "$url" >&2
      failures=$((failures + 1))
      ;;
  esac
done < "$tmp_urls"

if [[ "$failures" -gt 0 ]]; then
  echo "External link check failed: $failures URL(s)" >&2
  exit 1
fi

echo "External link check passed."
