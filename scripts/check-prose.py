#!/usr/bin/env python3
"""Measure the measurable half of PROSE_STANDARD.md.

Three dimensions, per the standard: payload per sentence (not machine-checkable,
left to the reader), length variance (checkable), and word-choice predictability
(approximated by the ban list and the rationed devices).

Usage:
  python3 scripts/check-prose.py            # report every page, worst first
  python3 scripts/check-prose.py --strict   # exit 1 if any banned item is found
  python3 scripts/check-prose.py <paths>    # limit to given files
"""
import glob
import subprocess
import html
import json
import os
import re
import statistics
import sys

# Never write these. Each is a hard failure.
BANNED = {
    "em-dash": r"—",
    "significance-inflation": r"\b(plays? an? (vital|key|crucial|important) role|stands? as a testament|a testament to|watershed|marks? a turning point|lasting impact|cannot be overstated|game[- ]chang(er|ing))\b",
    "trailing-ing-clause": r",\s+(underscoring|reflecting|highlighting|showcasing|demonstrating|underlining|signaling|signalling|emphasizing|emphasising)\b",
    "vague-attribution": r"\b(studies show|research shows|experts say|many (in the field )?believe|it is widely (believed|held)|the community view is|some argue|critics say)\b",
    "formulaic-transition": r"(^|[.!?]\s+|<p>)\s*(Moreover|Furthermore|In addition|Additionally|Notably|Importantly)\b",
    "throat-clearing": r"\b(in today'?s (rapidly )?(evolving|changing|dynamic)|in the (world|landscape|realm) of|when it comes to)\b",
    # "leverage" as a bare noun is financial margin and legitimate here. Only
    # the prestige-verb forms are banned.
    "corporate-verb": r"\b(leveraging|leveraged|leverages|utiliz(e|es|ed|ing)|underscor(e|es|ed)|empower(s|ed|ing))\b",
    # "actually" earns its place when it marks claimed against verified, which
    # is this site's core distinction. Flag it only where no such contrast is
    # nearby.
    # filler-intensifier was removed on 22 August 2026, by the owner, and the
    # reasoning is worth keeping because this file will tempt someone to add it
    # back. It banned genuinely, truly, very, quite and somewhat outright. That
    # is a blunt instrument aimed at a real problem: those words usually pad a
    # sentence that would land harder without them. Usually is not always. It
    # blocked two commits in one day over "the very top of its own interval"
    # and "genuinely unsettled", where the word was carrying the meaning rather
    # than padding it, and the rewrite in both cases was worse.
    #
    # A word list cannot tell padding from emphasis. A reader can. The rules
    # that survive here are the ones a machine can actually judge: em dashes are
    # a formatting choice with a yes or no answer, reading grade is arithmetic,
    # and a repeated device is countable. Taste is not on that list.
    "performed-enthusiasm": r"(!|\bexcited to (share|announce)\b|\bthrilled\b|\bincredible\b|\bamazing\b)",
    # Owner standard, 22 August 2026: category nouns and filler adjectives as
    # placeholders where a real thing belongs. Most of the owner's list
    # (landscape, space, framework, approach, solution, essential) is NOT
    # here: this site uses "space" and "framework" correctly and often
    # (block space, design space, the vProgs execution framework, "a 279 page
    # framework for judging monetary systems"), and "approach"/"solution"/
    # "essential"/"landscape" are ordinary English words with legitimate
    # literal use. Banning them would have hit real, correct sentences. Only
    # the words below tested at zero genuine hits on the shipped site and
    # have no plausible literal use in this genre: they are hype filler
    # almost every time. If one ever earns its place, narrow the pattern
    # rather than reopening the whole owner list.
    "category-noun-filler": r"\b(robust|seamless|comprehensive|crucial|cutting-edge|realm)\b",
    # "It's about X, Y, and Z" summarizing a claim into three abstract nouns.
    # The narrower cousin of the already-banned "not X, but Y" contrast: this
    # is the other shape the owner named as an overused tricolon reflex.
    "tricolon-aboutness": r"\bit(?:'s| is) (?:all )?about\s+[a-z][\w-]*,\s*[a-z][\w-]*,?\s+and\s+[a-z][\w-]*\b",
    # An unprompted offer to keep going. The site never asks the reader
    # whether to continue; a page states what it states and stops.
    "unprompted-expand-offer": r"\b(let me know if you'?d like|happy to (elaborate|expand|dive deeper)|would you like me to (expand|elaborate)|feel free to ask (for more|if you))\b",
    # Performed contrition. Fix an error in one sentence and continue; do not
    # perform the apology first.
    "performed-contrition": r"\b(i apologi[sz]e|sorry for (the|any)|my apologies)\b",
}

# Ration these. Roughly one per page each.
RATIONED = {
    "contrast": r"\b(not (just |merely |simply )?[a-z][\w ]{2,30}, (but|it'?s)\b|isn'?t [a-z][\w ]{2,30}, it'?s\b)",
    # An adjective triplet is rhythm filler. A list of named things is content.
    "adjective-triplet": r"\b(\w+ly|\w+ing|\w+ed|fast|clean|simple|clear|strong|real)\b, \b\w+\b, and \b\w+\b",
    "wh-cleft": r"(^|[.!?]\s+|<p>)\s*What (changes|matters|makes|follows|the)\b",
    # Only the weightless kind. A labelled colon ("Source:", "Status:") is
    # structure, not a reveal.
    "empty-colon-reveal": r"\b(here'?s the thing|the point|the reality|the truth|bottom line|the catch|the problem)\s*:",
}
RATION_LIMIT = 1

def _ignored(path):
    """True when git ignores the path, so it is a draft rather than site copy."""
    try:
        r = subprocess.run(["git", "check-ignore", "-q", path],
                           capture_output=True, timeout=10)
        return r.returncode == 0
    except Exception:
        return False


SKIP_FILES = {
    "PROSE_STANDARD.md", "COPY_STYLE.md", "AGENTS.md", "CLAUDE.md",
    "MAINTENANCE.md", "CONTENT_BRIEF.md", "README.md", "CLAIMS.yml",
    "PLAN-REDESIGN.md", "PLAN-2026-08-22.md", "PLAN-DEMO-MERGE.md", "RESEARCH-2026-08-22.md",
    # Internal working documents: findings, decisions, and red-team reports.
    # Several quote the exact patterns they exist to report, so linting them
    # as reader-facing copy is circular and blocks commits over the wording
    # of a defect report.
    "COLD-READ.md", "REVIEW.md", "TODO.md", "HANDOFF.md", "AUDIT.md",
    "BREAK.md", "FACTS.md", "CROSS-READ.md", "CONTRIBUTING.md",
    "CLI_FROM_ZERO.md", "PROGRESS.md", "STANDARD.md", "house-style.md",
    "handoff-checklist.md", "model-picker-methodology.md", "THE-BAR.md",
    # The two governing spec documents, added 2026-08-29. Same reason as the
    # block above, one step further: SITE-STANDARD.md quotes the owner in his
    # own first person ("I don't care if it fucks up every page"), which is
    # three site-voice-first-person hits, so --strict exited 1 and the publish
    # gate failed on the file that defines the standard. Rewriting a quotation
    # to satisfy a linter would destroy the thing being quoted.
    "SITE-STANDARD.md", "PRINCIPLES.md",
}


def visible_text(path):
    raw = open(path, encoding="utf-8", errors="ignore").read()
    if path.endswith(".html"):
        raw = re.sub(r"<(script|style|code|pre)\b.*?</\1>", " ", raw, flags=re.S | re.I)
        raw = re.sub(r"<head\b.*?</head>", " ", raw, flags=re.S | re.I)
        raw = re.sub(r"<[^>]+>", " ", raw)
        raw = html.unescape(raw)
    return re.sub(r"[ \t]+", " ", raw)


def strip_quoted(path):
    # SITE_VOICE checks for the site's own first person. A <blockquote> is
    # someone else's attributed words (a spec co-author, a forum post), always
    # paired with a <cite>, and never the site talking about itself, so its
    # text cannot trip this specific check. Added 2026-08-23 after inlining
    # demos/supply-split.html's KCC-0020 GitHub quotes into kips.html flagged
    # "My view is that..." (Sivan Helfer) and "I had one conceptual
    # exception..." (Michael Sutton) as if the site had written them. Scoped
    # narrowly to this one check; other bans (em dashes, etc.) still see
    # blockquote text, since a banned pattern inside a real quote is still
    # worth a human look.
    raw = open(path, encoding="utf-8", errors="ignore").read()
    if path.endswith(".html"):
        raw = re.sub(r"<blockquote\b.*?</blockquote>", " ", raw, flags=re.S | re.I)
        raw = re.sub(r"<(script|style|code|pre)\b.*?</\1>", " ", raw, flags=re.S | re.I)
        raw = re.sub(r"<head\b.*?</head>", " ", raw, flags=re.S | re.I)
        raw = re.sub(r"<[^>]+>", " ", raw)
        raw = html.unescape(raw)
    return re.sub(r"[ \t]+", " ", raw)


def sentences(text):
    parts = re.split(r"(?<=[.!?])\s+", text)
    return [p.strip() for p in parts if len(p.split()) >= 3]


def syllables(word):
    word = word.lower().strip(".,;:!?\"'()")
    if not word:
        return 0
    groups = re.findall(r"[aeiouy]+", word)
    n = len(groups)
    if word.endswith("e") and n > 1:
        n -= 1
    return max(1, n)


def flesch_kincaid(sents):
    words = [w for s in sents for w in s.split()]
    if not sents or not words:
        return None
    syl = sum(syllables(w) for w in words)
    return round(0.39 * (len(words) / len(sents)) + 11.8 * (syl / len(words)) - 15.59, 1)


# An attributed personal essay is identified by its byline, not by its filename.
# This used to be re.compile(r"toccata-expressiveness-upgrade"), and merging the
# three-part essay into toccata-essay.html silently un-exempted it: 10 correct,
# intended first-person hits on a page whose bytes had not changed. The byline
# element travels with the essay through any rename or merge, and it appears on
# no other page on the site. Changed 2026-08-01.
ESSAY = re.compile(r"<strong>By [A-Z][a-z]+ [A-Z][a-z]+</strong>")

# The account is an independent explainer, not a person. Reference pages and X
# posts speak in third person; only the attributed personal essays carry an "I".
# Added 2026-07-30 after a correction post shipped saying "a post of mine" and
# "I used the wrong one", which the site has no first person to claim.
SITE_VOICE = re.compile(
    r"\b(I (think|believe|found|checked|verified|wrote|said|should|would|used|described|"
    r"called|noticed|assume|expect|suspect|argue)|"
    r"we (think|believe|found|checked|verified|wrote|built|made|decided|chose|recommend|"
    r"argue|assume|expect|cover|explain|show)|"
    r"in my (view|opinion|read)|my (view|opinion|take|read|guess|sense)|"
    r"our (view|opinion|take|read|site|guide|goal|aim)|"
    r"(a|an earlier) post of mine|I'm |I've |I'd |I'll )", re.I)



# Reference indexes are supposed to be uniform. sources.html is 181 link
# annotations in a deliberate "link, then what it proves" shape, and search.html
# is a card map. Scanability is the right goal there, not prose rhythm, so the
# variance rule does not apply. The ban list still does.
INDEX_PAGE = re.compile(r"(sources|search|glossary)\.html$")


def analyse(path):
    text = visible_text(path)
    essay = bool(ESSAY.search(open(path, encoding="utf-8", errors="ignore").read()))
    sents = sentences(text)
    if len(sents) < 8:
        return None
    lengths = [len(s.split()) for s in sents]
    band = sum(1 for n in lengths if 14 <= n <= 22) / len(lengths)

    banned = {}
    if not essay:
        n = len(SITE_VOICE.findall(strip_quoted(path)))
        if n:
            banned["site-voice-first-person"] = n

    for name, pat in BANNED.items():
        # Essay pages were exempt until the owner said on 2026-07-30 that much
        # of that prose was LLM-assisted anyway. The standard applies to every
        # line now.
        hits = re.findall(pat, text, re.I)
        if hits:
            banned[name] = len(hits)

    rationed = {}
    for name, pat in RATIONED.items():
        n = len(re.findall(pat, text, re.I))
        if n > RATION_LIMIT:
            rationed[name] = n

    return {
        "file": path,
        "sentences": len(sents),
        "mean": round(statistics.mean(lengths), 1),
        "stdev": round(statistics.pstdev(lengths), 1),
        "in_band": round(band, 2),
        "shortest": min(lengths),
        "longest": max(lengths),
        "grade": flesch_kincaid(sents),
        "index_page": bool(INDEX_PAGE.search(path)),
        "banned": banned,
        "rationed": rationed,
    }


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    strict = "--strict" in sys.argv
    if args:
        paths = args
    else:
        paths = sorted(glob.glob("*.html")) + sorted(glob.glob("*.md"))
        # Only judge what ships. Gitignored drafts and scratch files are not
        # site copy, and scanning them fails the gate on content no reader
        # will ever see. check-links.sh hit this same class of bug.
        paths = [p for p in paths if not _ignored(p)]
    # Audit and adversarial reports quote the defects they exist to name,
    # including the banned patterns themselves, so linting them as reader
    # copy is circular. Matched by prefix because each review pass creates
    # new ones and an explicit list goes stale as soon as a lens is added.
    _REPORT_PREFIXES = ("AUDIT-", "BREAK-", "CHECK-", "MISREAD", "CROSS-READ-", "PLAN-", "LIVE-SWEEP")
    paths = [
        p for p in paths
        if os.path.basename(p) not in SKIP_FILES
        and not os.path.basename(p).startswith(_REPORT_PREFIXES)
    ]

    rows = [r for r in (analyse(p) for p in paths) if r]
    # worst first: banned hits, then how uniform the sentence lengths are
    rows.sort(key=lambda r: (-sum(r["banned"].values()), -r["in_band"]))

    total_banned = sum(sum(r["banned"].values()) for r in rows)
    print(f"Pages analysed: {len(rows)}   banned-item hits: {total_banned}")
    print(f"{'file':44} {'sents':>5} {'mean':>5} {'sd':>5} {'band':>5} {'gr':>5}  issues")
    for r in rows:
        issues = []
        if r["banned"]:
            issues.append("BAN " + ",".join(f"{k}x{v}" for k, v in r["banned"].items()))
        if r["stdev"] < 7 and not r["index_page"]:
            issues.append(f"uniform(sd={r['stdev']})")
        if r["in_band"] > 0.55 and not r["index_page"]:
            issues.append(f"band={r['in_band']}")
        if r["rationed"]:
            issues.append("over " + ",".join(f"{k}x{v}" for k, v in r["rationed"].items()))
        if issues:
            print(f"{r['file'][:44]:44} {r['sentences']:5} {r['mean']:5} {r['stdev']:5} "
                  f"{r['in_band']:5} {str(r['grade']):>5}  {'; '.join(issues)}")

    json.dump(rows, open("/tmp/prose-report.json", "w"), indent=1)
    print("\nFull report: /tmp/prose-report.json")
    if strict and total_banned:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
