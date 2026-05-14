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
python3 - "$tmp_dir/index.links" <<'PY'
import json
import sys
from pathlib import Path

manifest = json.loads(Path("site-manifest.json").read_text(encoding="utf-8"))
allowed = {"/" if page == "index.html" else f"/{page.removesuffix('.html')}" for page in manifest["pages"]}
links = []
for line in Path(sys.argv[1]).read_text(encoding="utf-8").splitlines():
    href, _label = line.split("|", 1)
    links.append(href)
manifest_nav = [f"{item['href']}|{item['label']}" for item in manifest.get("nav", [])]
observed_nav = Path(sys.argv[1]).read_text(encoding="utf-8").splitlines()
if observed_nav != manifest_nav:
    print("Navigation links differ from site-manifest.json nav entries.", file=sys.stderr)
    print("expected:", manifest_nav, file=sys.stderr)
    print("observed:", observed_nav, file=sys.stderr)
    raise SystemExit(1)

unknown = sorted({href for href in links if (href == "/" or (href.startswith("/") and "." not in href.rsplit("/", 1)[-1])) and href not in allowed})
if unknown:
    print(f"Navigation links not listed in site-manifest.json: {', '.join(unknown)}", file=sys.stderr)
    raise SystemExit(1)
PY

for page in "${pages[@]}"; do
  extract_links "$page" > "$tmp_dir/$page.links"
  if ! diff -u "$tmp_dir/index.links" "$tmp_dir/$page.links" >"$tmp_dir/nav.diff"; then
    echo "Navigation link set differs in $page" >&2
    cat "$tmp_dir/nav.diff" >&2
    exit 1
  fi
done

echo "Navigation link sets match."
