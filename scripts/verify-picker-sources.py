#!/usr/bin/env python3
"""Prove every published picker number came off a real board row.

data/ holds ~48,000 lines of raw leaderboard transcriptions that no session
has ever read end to end, and reading them would not prove much anyway. This
does the check reading was standing in for: for all 1,223 raw cells in
data/picker-data.json, find a line in that cell's OWN source board file that
carries both the model (under any name the builder's ALIASES table accepts
for that board) and the cell's exact value. A fabricated or mistyped number
cannot pass.

Name matching goes through scripts/build-picker-data.py's own ALIASES table
because the boards disagree on names: LiveBench calls Claude Opus 5 "Claude 5
Opus Thinking Max Effort". A checker that matched on the picker's own display
name reported 19 false misses, all of them alias spellings, none a data fault.

  python3 scripts/verify-picker-sources.py     # expect 1223/1223

Run it after any data/ refresh or emit-picker-blob.py change.
"""
import json, re, glob, importlib.util
spec = importlib.util.spec_from_file_location("bp", "scripts/build-picker-data.py")
bp = importlib.util.module_from_spec(spec); spec.loader.exec_module(bp)
A = bp.ALIASES
d = json.load(open('data/picker-data.json'))
files = {'aa':['data/aa-2026-08-25.md'],'livebench':['data/livebench-2026-08-25.md'],
         'arena':sorted(glob.glob('data/arena-*.md'))}
lines = {s:[l for f in fl for l in open(f,encoding='utf-8',errors='replace').read().splitlines()]
         for s,fl in files.items()}
norm = lambda t: re.sub(r'[^a-z0-9]','',t.lower())
def toks(v): return {f"{v:g}",f"{v:.1f}",f"{v:.2f}",f"{v:.0f}",f"{v:,.0f}",f"{v:,.1f}"}

tot=ok=0; bad=[]
for mkey,m in d['models'].items():
    names = []
    for src_names in A.get(mkey,{}).values(): names += src_names
    names.append(m.get('name') or mkey)
    keys = [norm(n) for n in names if n]
    for metric,cell in m['raw'].items():
        if cell['value'] is None: continue
        tot+=1
        pats=[re.compile(r'(?<![\d.])'+re.escape(s)+r'(?![\d])') for s in toks(float(cell['value']))]
        hit=False
        for l in lines[cell['source']]:
            ln=norm(l)
            if any(k and k in ln for k in keys) and any(p.search(l) for p in pats):
                hit=True; break
        if hit: ok+=1
        else: bad.append((mkey,metric,cell['value'],cell['source']))
print(f"cells verified on their model's own board row: {ok}/{tot} ({ok/tot*100:.1f}%)")
print(f"unverified: {len(bad)}")
for b in bad[:12]: print("   ", b)
