#!/usr/bin/env bash
set -euo pipefail

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

extract_links() {
  local file="$1"
  sed -n '/<div id="primary-links" class="nav-links">/,/<\/div>/p' "$file" \
    | sed -n 's/.*<a href="\([^"]*\)"[^>]*>\([^<]*\)<\/a>.*/\1|\2/p'
}

extract_links index.html > "$tmp_dir/index.links"

for page in *.html; do
  extract_links "$page" > "$tmp_dir/$page.links"
  if ! diff -u "$tmp_dir/index.links" "$tmp_dir/$page.links" >/tmp/kaspa-nav-diff.txt; then
    echo "Navigation link set differs in $page" >&2
    cat /tmp/kaspa-nav-diff.txt >&2
    exit 1
  fi
done

echo "Navigation link sets match."
