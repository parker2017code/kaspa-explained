#!/usr/bin/env bash
set -euo pipefail

tmp_urls="$(mktemp)"
trap 'rm -f "$tmp_urls"' EXIT

grep -RhoE 'https?://[^"'"'"')<[:space:]]+' \
  --include='*.html' \
  --include='*.md' \
  --include='*.txt' \
  --include='*.yml' \
  . \
  | sed 's/[`.,;]*$//' \
  | grep -Ev '^https?://(127\.0\.0\.1|localhost)(:|/|$)' \
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
    else
      local_file="${local_path#/}"
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
