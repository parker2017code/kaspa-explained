#!/usr/bin/env python3
"""American English gate.

Owner instruction, 1 Aug 2026: American English on everything. Both sites are
written for a mostly US audience and the spelling had drifted British in patches,
mostly in copy written by agents.

This is an explicit word map, not an -ise/-ize regex. A blanket regex breaks
words that are correctly -ise in both dialects (advertise, comprise, surprise,
franchise, otherwise) and words that are correctly -our in both (four, hour,
your, pour, tour, contour, glamour). Add pairs here when new ones show up.

  python3 scripts/check-american-english.py            # scan, list every hit
  python3 scripts/check-american-english.py --fix      # rewrite in place
"""
import sys, re, pathlib, json

ROOT = pathlib.Path(__file__).resolve().parent.parent

# british -> american. Lowercase keys; matching is case-insensitive and the
# replacement preserves the original's capitalization pattern.
PAIRS = {
    # -our / -or
    "behaviour": "behavior", "behaviours": "behaviors", "behavioural": "behavioral",
    "colour": "color", "colours": "colors", "coloured": "colored", "colouring": "coloring",
    "favour": "favor", "favours": "favors", "favoured": "favored", "favourite": "favorite",
    "favourable": "favorable", "favourably": "favorably",
    "honour": "honor", "honours": "honors", "honoured": "honored",
    "labour": "labor", "labours": "labors", "laboured": "labored",
    "neighbour": "neighbor", "neighbours": "neighbors", "neighbouring": "neighboring",
    "rumour": "rumor", "rumours": "rumors",
    "endeavour": "endeavor", "endeavours": "endeavors",
    "vapour": "vapor", "vapours": "vapors",
    "armour": "armor", "harbour": "harbor", "savour": "savor", "flavour": "flavor",
    "rigour": "rigor", "vigour": "vigor", "odour": "odor",
    # -ise / -ize  (only words that are genuinely -ize in American English)
    "analyse": "analyze", "analysed": "analyzed", "analyses": "analyzes",
    "analysing": "analyzing", "analyser": "analyzer",
    "capitalise": "capitalize", "capitalised": "capitalized", "capitalising": "capitalizing",
    "categorise": "categorize", "categorised": "categorized", "categorising": "categorizing",
    "centralise": "centralize", "centralised": "centralized", "centralising": "centralizing",
    "characterise": "characterize", "characterised": "characterized",
    "characterising": "characterizing", "characterisation": "characterization",
    "criticise": "criticize", "criticised": "criticized", "criticising": "criticizing",
    "decentralise": "decentralize", "decentralised": "decentralized",
    "decentralising": "decentralizing", "decentralisation": "decentralization",
    "emphasise": "emphasize", "emphasised": "emphasized", "emphasising": "emphasizing",
    "formalise": "formalize", "formalised": "formalized", "formalising": "formalizing",
    "generalise": "generalize", "generalised": "generalized", "generalising": "generalizing",
    "initialise": "initialize", "initialised": "initialized", "initialising": "initializing",
    "maximise": "maximize", "maximised": "maximized", "maximising": "maximizing",
    "minimise": "minimize", "minimised": "minimized", "minimising": "minimizing",
    "modernise": "modernize", "modernised": "modernized",
    "normalise": "normalize", "normalised": "normalized", "normalising": "normalizing",
    "normalisation": "normalization",
    "optimise": "optimize", "optimised": "optimized", "optimising": "optimizing",
    "optimisation": "optimization",
    "organise": "organize", "organised": "organized", "organising": "organizing",
    "organisation": "organization", "organisations": "organizations",
    "organisational": "organizational",
    "prioritise": "prioritize", "prioritised": "prioritized", "prioritising": "prioritizing",
    "realise": "realize", "realised": "realized", "realising": "realizing",
    "recognise": "recognize", "recognised": "recognized", "recognising": "recognizing",
    "specialise": "specialize", "specialised": "specialized", "specialising": "specializing",
    "standardise": "standardize", "standardised": "standardized",
    "standardising": "standardizing", "standardisation": "standardization",
    "summarise": "summarize", "summarised": "summarized", "summarising": "summarizing",
    "synthesise": "synthesize", "synthesised": "synthesized", "synthesising": "synthesizing",
    "utilise": "utilize", "utilised": "utilized", "utilising": "utilizing",
    "visualise": "visualize", "visualised": "visualized", "visualising": "visualizing",
    "penalise": "penalize", "penalised": "penalized",
    "stabilise": "stabilize", "stabilised": "stabilized", "stabilising": "stabilizing",
    "crystallise": "crystallize", "crystallised": "crystallized",
    "metallisation": "metallization", "metallised": "metallized",
    "polarise": "polarize", "polarised": "polarized",
    "oxidise": "oxidize", "oxidised": "oxidized", "oxidising": "oxidizing",
    # -re / -er
    "centre": "center", "centres": "centers", "centred": "centered", "centring": "centering",
    "metre": "meter", "metres": "meters",
    "litre": "liter", "litres": "liters",
    "fibre": "fiber", "fibres": "fibers",
    "theatre": "theater", "calibre": "caliber",
    # doubled-l
    "cancelled": "canceled", "cancelling": "canceling",
    "labelled": "labeled", "labelling": "labeling",
    "modelled": "modeled", "modelling": "modeling",
    "signalled": "signaled", "signalling": "signaling",
    "travelled": "traveled", "travelling": "traveling",
    "fuelled": "fueled", "fuelling": "fueling",
    "levelled": "leveled", "levelling": "leveling",
    "marvellous": "marvelous",
    # -ence / -ense and friends
    "defence": "defense", "offence": "offense", "pretence": "pretense",
    "licence": "license", "licences": "licenses",
    "practise": "practice", "practised": "practiced", "practising": "practicing",
    # misc
    "grey": "gray", "greyed": "grayed",
    "programme": "program", "programmes": "programs",
    "catalogue": "catalog", "catalogues": "catalogs", "analogue": "analog",
    "cheque": "check", "cheques": "checks",
    "storey": "story", "storeys": "stories",
    "sceptical": "skeptical", "scepticism": "skepticism", "sceptic": "skeptic",
    "manoeuvre": "maneuver", "moustache": "mustache",
    "aluminium": "aluminum", "sulphur": "sulfur", "sulphide": "sulfide",
    "ageing": "aging", "judgement": "judgment", "judgements": "judgments",
    "acknowledgement": "acknowledgment", "enrolment": "enrollment",
    "fulfil": "fulfill", "fulfils": "fulfills", "fulfilment": "fulfillment",
    "instalment": "installment", "skilful": "skillful", "wilful": "willful",
    "whilst": "while", "amongst": "among", "towards": "toward",
    "learnt": "learned", "spelt": "spelled", "burnt": "burned",
    "artefact": "artefact_KEEP",  # both are used in software; leave alone
}
# Prefixed forms: \b anchors mean "recognised" never matches "unrecognised".
# Expand from the base map only, once, or the prefixes compound into each other.
_BASE = dict(PAIRS)
for _pre in ("un", "re", "mis", "pre", "over", "under", "non"):
    for _b, _a in _BASE.items():
        PAIRS.setdefault(_pre + _b, _pre + _a)
PAIRS = {k: v for k, v in PAIRS.items() if not v.endswith("_KEEP")}

WORD = re.compile(r"\b(" + "|".join(sorted(PAIRS, key=len, reverse=True)) + r")\b", re.I)

# URLs, file paths, code identifiers and HTML attributes are masked out before
# matching, rather than skipping the whole line. An earlier version skipped any
# line containing a URL, which silently exempted every sentence with a link in
# it, and those are exactly the sentences this repo is full of.
PROTECT = re.compile(
    r"""https?://\S+"""              # urls
    r"""|<[^>]+>"""                   # html tags, so attributes and classes are safe
    r"""|`[^`]*`"""                   # markdown code spans
    r"""|\b[\w./-]+\.(?:css|js|py|json|html|svg|png|yml|md)\b"""   # filenames
    r"""|\b(?:classList|querySelector|getElementById|dataset)\b"""
    # Verbatim quotations. This site's rule is that a quote is reproduced
    # exactly, so a British spelling inside quote marks is correct and
    # rewriting it silently makes the quote a paraphrase wearing quote marks.
    # That already happened once: a dk-wiki quote of "k-colouring" was
    # Americanized in place, which broke the verbatim claim on kips.html.
    # HTML tags are masked by the rule above, so attribute values never reach
    # this. Bounded length so an unbalanced quote cannot swallow a whole line.
)

# Verbatim quotations, applied to prose files only. This site's rule is that a
# quote is reproduced exactly, so a British spelling inside quote marks is
# correct and rewriting it silently turns the quote into a paraphrase wearing
# quote marks. That already happened once: a dk-wiki quote of "k-colouring" was
# Americanized in place, which broke the verbatim claim on kips.html.
#
# Scoped to .html and .md because in .json and .js every string literal is
# quoted, so applying this there would exempt the entire file. HTML tags are
# consumed by the rule above before their attribute quotes are reached.
# Bounded length so one unbalanced quote cannot swallow a document.
QUOTE_EXTS = {".html", ".md"}
PROTECT_QUOTED = re.compile(
    PROTECT.pattern + r'|"[^"]{0,400}"' + r'|\u201c[^\u201d]{0,400}\u201d',
    re.X,
)

EXTS = {".html", ".md", ".txt", ".yml", ".yaml", ".json", ".py", ".js", ".css"}
SKIP_DIRS = {".git", "node_modules", "_preview-site", "visual-audit", "exports",
             ".wrangler", ".cache", "dist", ".claude"}
# Files that quote outside sources verbatim, or are not our prose.
# check-prose.py deliberately matches BOTH spellings inside its detector regexes,
# so rewriting it would blind the detector to British input.
SKIP_FILES = {"check-american-english.py", "check-prose.py"}


def case_like(src: str, repl: str) -> str:
    if src.isupper():
        return repl.upper()
    if src[0].isupper():
        return repl[0].upper() + repl[1:]
    return repl


def scan(paths, fix=False):
    hits, changed = [], 0
    for p in paths:
        try:
            text = p.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        out_lines, touched = [], False
        # Blank out protected spans so they cannot match, but keep their length
        # so offsets stay aligned when rewriting. Masking the whole file rather
        # than each line is what lets a quotation spanning two lines count as
        # one protected span.
        pattern = PROTECT_QUOTED if p.suffix in QUOTE_EXTS else PROTECT
        # Newlines survive the mask so the masked text keeps the same line
        # count as the original; everything else in a protected span is blanked.
        masked_text = pattern.sub(
            lambda m: "".join("\n" if c == "\n" else "\x00" for c in m.group(0)), text)
        masked_lines = masked_text.split("\n")
        for i, line in enumerate(text.split("\n"), 1):
            masked = masked_lines[i - 1]
            found = WORD.findall(masked)
            if found:
                for f in found:
                    hits.append((p, i, f, PAIRS[f.lower()]))
                if fix:
                    out, last = [], 0
                    for m in WORD.finditer(masked):
                        out.append(line[last:m.start()])
                        out.append(case_like(line[m.start():m.end()],
                                             PAIRS[line[m.start():m.end()].lower()]))
                        last = m.end()
                    out.append(line[last:])
                    line = "".join(out)
                    touched = True
            out_lines.append(line)
        if fix and touched:
            p.write_text("\n".join(out_lines), encoding="utf-8")
            changed += 1
    return hits, changed


def main():
    fix = "--fix" in sys.argv
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if args:
        paths = [pathlib.Path(a) for a in args]
    else:
        paths = [p for p in ROOT.rglob("*")
                 if p.is_file() and p.suffix in EXTS
                 and not (set(p.parts) & SKIP_DIRS) and p.name not in SKIP_FILES]

    hits, changed = scan(paths, fix)
    if not hits:
        print("American English OK.")
        return 0

    by_file = {}
    for p, ln, found, repl in hits:
        by_file.setdefault(p, []).append((ln, found, repl))
    for p in sorted(by_file, key=lambda x: -len(by_file[x])):
        rel = p.relative_to(ROOT) if ROOT in p.parents or p.parent == ROOT else p
        words = sorted({f"{f} -> {r}" for _, f, r in by_file[p]})
        print(f"{str(rel)[:52]:52s} {len(by_file[p]):3d}  {', '.join(words[:5])}"
              + (" ..." if len(words) > 5 else ""))
    print(f"\n{len(hits)} British spellings in {len(by_file)} files.")
    if fix:
        print(f"Rewrote {changed} files. Run again to confirm clean.")
        return 0
    print("Run with --fix to rewrite.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
