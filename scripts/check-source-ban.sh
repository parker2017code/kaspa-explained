#!/usr/bin/env bash
set -euo pipefail

# Kaspa.org marketing-site source ban (AGENTS.md, Sourcing Discipline section,
# clarified 2026-08-22). Banned: kaspa.org root, /lore, /build, /developments,
# /hodl, /assets, and their /es equivalents. wiki.kaspa.org, docs.kaspa.org,
# api.kaspa.org, and api-tn10.kaspa.org are separate subdomains and stay
# permitted. This rule leaked four times in one day before this gate existed:
# into CLAIMS.yml source fields, a sources.html reference list, and table/prose
# call-outs across several pages. A different agent caught each leak by luck;
# this script replaces the luck.
#
# Call-out mechanism: an explicit opt-in marker, `kaspa-org-callout`, on the
# same line as the banned URL or on the line immediately above it (as an HTML
# comment in .html files, a YAML comment in CLAIMS.yml). This project already
# cites kaspa.org's stale Toccata text on purpose, to show it is stale
# (kaspa-developments.html, status.html, kaspa-claims-checker.html), and that
# must keep working. A marker was chosen over a required nearby phrase because
# a phrase is paraphrasable and would either miss real call-outs or false-fail
# on close wording; it was chosen over a file+line allowlist because a
# separate list rots the moment a line shifts and does not travel with the
# text it excuses. A one-line marker sits right next to the citation it
# covers, survives edits and moves, and is greppable.

python3 - <<'PY'
import re
import sys
from pathlib import Path

# Specific marketing subpages: banned wherever the page/path is named, even as
# bare text with no "https://" scheme, because naming the specific page is
# already presenting its content as a source (this is exactly how the leaks
# read in kaspa-developments.html's call-outs: "kaspa.org/lore still says...").
BANNED_PREFIXES = (
    "/lore", "/build", "/developments", "/hodl", "/assets",
    "/es/lore", "/es/build", "/es/developments", "/es/hodl", "/es/assets",
)
# Bare root/homepage: only a source citation when it appears as an actual URL
# (has an http(s):// scheme). A schemeless mention like "Kaspa.org's Lore and
# Build marketing pages are not used as sources here" is naming the brand
# while describing the ban, not citing the homepage as evidence, and must not
# be flagged.
BANNED_EXACT_NEEDS_SCHEME = ("", "/", "/es")

URL_RE = re.compile(r"(?<![\w.-])(?:www\.)?kaspa\.org(/[a-zA-Z0-9_\-/%]*)?", re.I)
SCHEME_RE = re.compile(r"https?://(?:www\.)?$", re.I)
CALLOUT_RE = re.compile(r"kaspa-org-callout", re.I)

CLAIMS_FIELD_RE = re.compile(r"^\s*(source|supporting_source):\s*(.+?)\s*$")


def path_is_banned(path, has_scheme):
    path = (path or "").rstrip("/")
    lower = path.lower()
    for prefix in BANNED_PREFIXES:
        if lower == prefix or lower.startswith(prefix + "/"):
            return True
    if lower in BANNED_EXACT_NEEDS_SCHEME and has_scheme:
        return True
    return False


def has_callout(lines, idx):
    if CALLOUT_RE.search(lines[idx]):
        return True
    j = idx - 1
    while j >= 0 and not lines[j].strip():
        j -= 1
    return j >= 0 and bool(CALLOUT_RE.search(lines[j]))


def scan_html(path):
    violations = []
    lines = path.read_text(encoding="utf-8", errors="ignore").splitlines()
    for i, line in enumerate(lines):
        for m in URL_RE.finditer(line):
            has_scheme = bool(SCHEME_RE.search(line[max(0, m.start() - 12):m.start()]))
            if not path_is_banned(m.group(1), has_scheme):
                continue
            if has_callout(lines, i):
                continue
            violations.append(
                f"{path}:{i + 1}: banned kaspa.org marketing URL '{m.group(0)}'. "
                f"Mark it with a `kaspa-org-callout` HTML comment on this line or "
                f"the line above if this is a deliberate call-out, e.g. "
                f"<!-- kaspa-org-callout: quoting kaspa.org to show it is stale -->"
            )
    return violations


def scan_claims(path):
    violations = []
    lines = path.read_text(encoding="utf-8", errors="ignore").splitlines()
    for i, line in enumerate(lines):
        m = CLAIMS_FIELD_RE.match(line)
        if not m:
            continue
        field, value = m.group(1), m.group(2)
        for um in URL_RE.finditer(value):
            has_scheme = bool(SCHEME_RE.search(value[max(0, um.start() - 12):um.start()]))
            if not path_is_banned(um.group(1), has_scheme):
                continue
            if has_callout(lines, i):
                continue
            violations.append(
                f"{path}:{i + 1}: banned kaspa.org marketing URL in `{field}` field "
                f"'{um.group(0)}'. Mark it with a `# kaspa-org-callout: ...` YAML "
                f"comment on this line or the line above if this entry is "
                f"deliberately citing kaspa.org to document it as stale/unreliable, "
                f"otherwise cite wiki.kaspa.org, docs.kaspa.org, a KIP, a release "
                f"tag, or the repo instead."
            )
    return violations


def html_files():
    root = Path(".")
    skip_dirs = {".git", ".claude", "node_modules"}
    for path in sorted(root.rglob("*.html")):
        if any(part in skip_dirs for part in path.parts):
            continue
        yield path


violations = []
for path in html_files():
    violations.extend(scan_html(path))

claims_path = Path("CLAIMS.yml")
if claims_path.exists():
    violations.extend(scan_claims(claims_path))

if violations:
    for v in violations:
        print(v, file=sys.stderr)
    print(f"\n{len(violations)} banned kaspa.org marketing-site reference(s) found.", file=sys.stderr)
    sys.exit(1)

print("Source ban check passed: no unmarked kaspa.org marketing-site references found.")
PY
