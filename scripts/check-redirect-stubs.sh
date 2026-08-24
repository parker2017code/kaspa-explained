#!/usr/bin/env bash
set -euo pipefail

python3 - <<'PY'
import json
import re
import sys
from pathlib import Path

manifest = json.loads(Path("site-manifest.json").read_text(encoding="utf-8"))
domain = manifest["domain"]
# A 404 page is not a destination. It stays in the manifest because several
# checks walk that array, and it is filtered out of the sitemap by
# build-sitemap.py and out of the related-links chain by
# apply-related-links.py for the same reason. Filter it here too, or this
# check reports the two files disagreeing when they are both correct.
NOT_A_DESTINATION = {"404.html"}
live_pages = set(manifest["pages"]) - NOT_A_DESTINATION


def page_to_path(page):
    if page == "index.html":
        return "/"
    return "/" + page[:-len(".html")]


live_paths = {page_to_path(page) for page in live_pages}
# Demos are real pages registered through sitemapExtraFiles rather than the
# pages array, because they carry their own self-contained chrome and are not
# subject to the per-page shell gate. They belong in the sitemap all the same.
live_paths |= {
    "/demos/" if f == "demos/index.html" else "/" + f[:-len(".html")]
    for f in manifest.get("sitemapExtraFiles", [])
    if f.startswith("demos/")
}

sitemap_text = Path("sitemap.xml").read_text(encoding="utf-8")
sitemap_paths = set(re.findall(rf"<loc>{re.escape(domain)}(/[^<]*)</loc>", sitemap_text))
sitemap_page_paths = {p for p in sitemap_paths if "." not in p.rsplit("/", 1)[-1]}
if sitemap_page_paths != live_paths:
    print(
        "sitemap.xml page URLs disagree with site-manifest.json pages: "
        f"only in sitemap {sorted(sitemap_page_paths - live_paths)}, "
        f"only in manifest {sorted(live_paths - sitemap_page_paths)}",
        file=sys.stderr,
    )
    raise SystemExit(1)

refresh_re = re.compile(r'<meta http-equiv="refresh" content="0;\s*url=([^"]+)">')
canonical_re = re.compile(r'<link rel="canonical" href="([^"]+)">')

stubs = {}
errors = []

candidate_paths = sorted(Path(".").glob("*.html")) + sorted(Path("demos").glob("*.html"))

for path in candidate_paths:
    name = path.as_posix()
    if name in live_pages:
        continue
    text = path.read_text(encoding="utf-8")
    if 'http-equiv="refresh"' not in text:
        continue

    refresh_match = refresh_re.search(text)
    canonical_match = canonical_re.search(text)
    if not refresh_match:
        errors.append(f"{name} has a refresh meta tag in an unrecognized format")
        continue
    if not canonical_match:
        errors.append(f"{name} is a redirect stub with no canonical link")
        continue

    canonical_href = canonical_match.group(1)
    if not canonical_href.startswith(domain):
        errors.append(f"{name} canonical {canonical_href} is not on {domain}")
        continue

    refresh_target = refresh_match.group(1)
    canonical_path = canonical_href[len(domain):] or "/"
    stubs[name] = (refresh_target, canonical_path)


def target_file_for(path):
    return "index.html" if path == "/" else path.lstrip("/") + ".html"


def split_fragment(path):
    # A redirect target may point at an anchor on the destination page
    # (e.g. "/kaspa-mining#attack-cost"). The fragment identifies an element
    # id on that page, not a file, so it must be stripped before resolving
    # the target to a file on disk or checking sitemap membership.
    if "#" in path:
        base, fragment = path.split("#", 1)
        return base, fragment
    return path, None


anchor_id_re_cache = {}


def anchor_exists(target_file, anchor):
    if target_file not in anchor_id_re_cache:
        anchor_id_re_cache[target_file] = set(
            re.findall(r'\bid="([^"]+)"', Path(target_file).read_text(encoding="utf-8"))
        )
    return anchor in anchor_id_re_cache[target_file]


own_path = {name: page_to_path(name) for name in stubs}

for name, (refresh_target, canonical_path) in stubs.items():
    if refresh_target != canonical_path:
        errors.append(
            f"{name} refresh target {refresh_target} disagrees with its canonical {canonical_path}"
        )
        continue

    target_path, anchor = split_fragment(refresh_target)

    if target_path == own_path[name]:
        errors.append(f"{name} redirects to itself ({refresh_target})")
        continue

    target_file = target_file_for(target_path)
    if not Path(target_file).exists():
        errors.append(f"{name} redirects to {refresh_target}, which does not exist ({target_file})")
        continue

    if target_file in stubs:
        errors.append(
            f"{name} redirects to {refresh_target}, which is itself a redirect stub, not a live page"
        )
        continue

    if target_path not in live_paths:
        errors.append(
            f"{name} redirects to {refresh_target}, which is not a live page in sitemap.xml"
        )
        continue

    if anchor and not anchor_exists(target_file, anchor):
        errors.append(
            f"{name} redirects to {refresh_target}, but {target_file} has no element with id=\"{anchor}\""
        )
        continue

# Cycle check on the stub graph, independent of the single-hop checks above:
# catches a stub pointing at a stub that eventually points back at it.
resolved = set()
for start in stubs:
    if start in resolved:
        continue
    chain = []
    current = start
    while current in stubs:
        if current in chain:
            cycle = " -> ".join(chain[chain.index(current):] + [current])
            errors.append(f"{start} is part of a redirect cycle: {cycle}")
            break
        chain.append(current)
        current = target_file_for(split_fragment(stubs[current][0])[0])
    else:
        resolved.update(chain)

if errors:
    for message in sorted(set(errors)):
        print(message, file=sys.stderr)
    raise SystemExit(1)

print(f"Redirect stub check passed: {len(stubs)} stub(s) resolve to live pages.")
PY
