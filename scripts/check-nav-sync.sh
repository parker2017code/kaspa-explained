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
mapfile -t pages < <(python3 -c 'import json; print("\n".join(json.load(open("site-manifest.json"))["pages"] + ["404.html"]))')

for page in "${pages[@]}"; do
  extract_links "$page" > "$tmp_dir/$page.links"
  if ! diff -u "$tmp_dir/index.links" "$tmp_dir/$page.links" >"$tmp_dir/nav.diff"; then
    echo "Navigation link set differs in $page" >&2
    cat "$tmp_dir/nav.diff" >&2
    exit 1
  fi
done

echo "Navigation link sets match."
