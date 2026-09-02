import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const base = process.argv[2];
const pages = JSON.parse(readFileSync('site-manifest.json','utf8')).pages;
const b = await chromium.launch();
const p = await (await b.newContext({viewport:{width:1280,height:900}})).newPage();
for (const n of pages) {
  await p.goto(`${base}/${n}?cb=${Date.now()}`, {waitUntil:'load'});
  await p.waitForTimeout(300);
  const r = await p.evaluate(() => {
    const drop=/block-card|ln-feed|block-time|block-sub|empty-word|content-word/;
    const main=document.querySelector('main'); if(!main) return [];
    const out=[];
    const w=document.createTreeWalker(main,NodeFilter.SHOW_TEXT,{acceptNode(nd){
      for(let e=nd.parentElement;e&&e!==main.parentElement;e=e.parentElement){
        const t=e.tagName;
        if(t==='SCRIPT'||t==='STYLE'||t==='TEMPLATE'||t==='NOSCRIPT')return NodeFilter.FILTER_REJECT;
        if(e.hidden||getComputedStyle(e).display==='none')return NodeFilter.FILTER_REJECT;
        if(typeof e.className==='string'&&drop.test(e.className))return NodeFilter.FILTER_REJECT;
      } return NodeFilter.FILTER_ACCEPT;}});
    while(w.nextNode()){
      const nd=w.currentNode;
      const txt=nd.textContent.replace(/\s+/g,' ').trim();
      if(!txt) continue;
      const wc=txt.split(' ').length;
      // classify
      let cat='other', closed=false, sec='';
      for(let e=nd.parentElement;e&&e!==main.parentElement;e=e.parentElement){
        if(e.tagName==='DETAILS'&&!e.open) closed=true;
        if(typeof e.className==='string'&&/term-def__panel|info-affordance__panel/.test(e.className)) cat='tooltip';
      }
      if(cat!=='tooltip'){
        const el=nd.parentElement;
        const anc=(t)=>{for(let e=el;e&&e!==main.parentElement;e=e.parentElement) if(e.tagName===t) return true; return false;};
        if(anc('TD')||anc('TH')) cat='table';
        else if(anc('SUMMARY')) cat='summary';
        else if(/^H[1-6]$/.test(el.tagName)) cat='heading';
        else if(anc('P')) cat='p';
        else if(anc('LI')) cat='li';
        else if(anc('LABEL')||anc('BUTTON')||anc('OUTPUT')) cat='control';
      }
      out.push({cat,closed,wc});
    }
    return out;
  });
  const agg={};
  let tot=0;
  for(const x of r){const k=x.cat+(x.closed?'-closed':''); agg[k]=(agg[k]||0)+x.wc; tot+=x.wc;}
  console.log(n.replace('.html',''), tot, JSON.stringify(agg));
}
await b.close();
