#!/usr/bin/env python3
"""Apply the em-dash and banned-word bans to the repo's own prose.

check-prose.py reads public HTML only. That is how 68 em dashes sat in
design/*.md for months while the site itself measured zero: the rule was
enforced on the pages and unenforced on every document that describes them.
This reads the files that gate never opened.

Skipped, with reasons: data/*.md are dated captures of what external
leaderboards displayed on a given day, so their wording is a record rather
than prose; experiment/sdk/ is vendored third-party code under its own
license; a line that names a banned token as banned is a rule, not a use.
"""
import re, subprocess, sys

BANNED = ["seamless", "robust", "cutting edge", "cutting-edge", "state-of-the-art",
          "delve", "tapestry", "testament", "elevate", "holistic", "empower"]
SKIP_PREFIX = ("data/", "experiment/sdk/", "_preview-site/", "exports/", "visual-audit/", "node_modules/")
EXTS = (".md", ".txt", ".py", ".mjs", ".js", ".sh", ".yml", ".css")

files = [f for f in subprocess.run(["git", "ls-files"], capture_output=True, text=True).stdout.split("\n")
         if f.endswith(EXTS) and not f.startswith(SKIP_PREFIX)]

fails = []
for f in files:
    try:
        lines = open(f, encoding="utf-8").read().split("\n")
    except (UnicodeDecodeError, FileNotFoundError):
        continue
    for i, line in enumerate(lines, 1):
        low = line.lower()
        stripped = re.sub(r"`[^`]*`|\"[^\"]*\"|'[^']*'", "", low)  # a quoted token is a mention
        hits = [w for w in BANNED if re.search(r"\b" + re.escape(w) + r"\b", stripped)]
        # Two or more banned tokens on one line is a ban list, not prose. A regex
        # literal or a bullet that names the rule is a mention too.
        # Three or more banned tokens, or a comma-heavy run, is a ban list. Two
        # hype words in a normal sentence is prose and must still fail.
        listish = len(hits) >= 3 or line.count(",") >= 4 or "pattern:" in low or "/\\b(" in line
        ruleish = any(k in low for k in ("ban", "forbidden", "do not use", "avoid", "never write",
                                          "delete on sight", "no em dash", "kill \"", "hype vocab",
                                          "brochure language", "corporate abstraction"))
        if "\u2014" in stripped and not ruleish:  # a quoted em dash is a mention
            fails.append((f, i, "em dash", line.strip()[:70]))
        if not listish and not ruleish:
            for w in hits:
                fails.append((f, i, w, line.strip()[:70]))

for f, i, what, txt in fails:
    print(f"  {f}:{i}  [{what}]  {txt}")
print(f"Docs prose check: {len(files)} files, {len(fails)} violation(s).")
sys.exit(1 if fails else 0)
