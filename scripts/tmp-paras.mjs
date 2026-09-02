import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const base = process.argv[2];
const only = process.argv[3];
const pages = JSON.parse(readFileSync('site-manifest.json','utf8')).pages.filter(n=>!only||n===only);
const b = await chromium.launch();
const p = await (await b.newContext({viewport:{width:1280,height:900}})).newPage();
for (const n of pages) {
  await p.goto(`${base}/${n}?cb=${Date.now()}`, {waitUntil:'load'});
  await p.waitForTimeout(300);
  const r = await p.evaluate(() => {
    const main=document.querySelector('main'); if(!main) return [];
    const out=[];
    for (const el of main.querySelectorAll('p, li, h2, h3, summary, figcaption')) {
      if (el.closest('.term-def__panel, .info-affordance__panel')) continue;
      if (el.querySelector('p,li')) continue;
      const t=(el.textContent||'').replace(/\s+/g,' ').trim();
      if(!t) continue;
      let closed=false; for(let e=el;e;e=e.parentElement) if(e.tagName==='DETAILS'&&!e.open) closed=true;
      out.push((closed?'[C]':'[ ]')+' '+el.tagName+' '+t.split(' ').length+'w :: '+t);
    }
    return out;
  });
  console.log('\n########## '+n);
  for(const l of r) console.log(l);
}
await b.close();
