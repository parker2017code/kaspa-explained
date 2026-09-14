// Size of every closed <details> on the live site, ranked, with the digit and
// link count of each. Those two numbers are the receipt test: a block dense with
// figures and sources is evidence and is not cuttable to hit a length target; a
// block with neither is prose that happens to be folded away.
// Usage: node scripts/count-disclosures.mjs [baseUrl]
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const base = process.argv[2] || 'https://kaspaexplained.com';
const pages = JSON.parse(readFileSync('site-manifest.json','utf8')).pages;
const b = await chromium.launch();
const p = await (await b.newContext({viewport:{width:1280,height:900}})).newPage();
let C=0,W=0; const rows=[];
for (const n of pages) {
  await p.goto(`${base}/${base.includes('127.0.0.1') ? n : n.replace('.html','')}?cb=${Date.now()}`,{waitUntil:'load'});
  await p.waitForTimeout(450);
  const r = await p.evaluate(() => {
    const drop=/block-card|ln-feed|block-time|block-sub|empty-word|content-word/;
    const main=document.querySelector('main'); if(!main) return {items:[]};
    const items=[];
    for (const d of main.querySelectorAll('details')) {
      if (d.open) continue;
      if (d.closest('details:not([open])') !== d) { /* nested inside another closed one */ }
      let t='';
      const w=document.createTreeWalker(d, NodeFilter.SHOW_TEXT, {acceptNode(nd){
        for(let e=nd.parentElement;e&&e!==d.parentElement;e=e.parentElement){
          const tg=e.tagName;
          if(tg==='SCRIPT'||tg==='STYLE'||tg==='TEMPLATE') return NodeFilter.FILTER_REJECT;
          if(tg==='SUMMARY') return NodeFilter.FILTER_REJECT;      // the label is visible
          if(typeof e.className==='string'&&drop.test(e.className)) return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }});
      while(w.nextNode()) t+=' '+w.currentNode.textContent;
      const norm=t.replace(/\s+/g,' ').trim();
      if(!norm) continue;
      // is this details nested inside another closed details? avoid double count
      const parentClosed = d.parentElement && d.parentElement.closest('details:not([open])');
      if (parentClosed) continue;
      const digits=(norm.match(/\d/g)||[]).length;
      const links=d.querySelectorAll('a[href]').length;
      items.push({label:(d.querySelector('summary')?.textContent||'').trim().slice(0,46),
        chars:norm.length, words:norm.split(' ').filter(Boolean).length, digits, links});
    }
    return {items};
  });
  for (const it of r.items){ C+=it.chars; W+=it.words; rows.push({page:n.replace('.html',''), ...it}); }
}
rows.sort((a,b)=>b.chars-a.chars);
console.log('largest closed disclosures:');
for (const r of rows.slice(0, Number(process.env.DISCLOSURE_ROWS || 16)))
  console.log(`${String(r.chars).padStart(5)}ch ${String(r.words).padStart(4)}w  digits=${String(r.digits).padStart(3)} links=${String(r.links).padStart(2)}  ${r.page.padEnd(20)} "${r.label}"`);
console.log(`\n${rows.length} closed disclosures. TOTAL ${W} words, ${C} characters.`);
console.log(`Against a 30,000-character ceiling: ${C>30000?('over by '+(C-30000)):'already under'}`);
await b.close();
