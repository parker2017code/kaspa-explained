// Real Testnet-10 browser journey. Private tab storage is never overwritten.
import {chromium} from 'playwright';
import {mkdir,readFile,writeFile,chmod} from 'node:fs/promises';
import {V6Service} from '../server/v6-service.mjs';
const origin = process.env.V6_WALLET_LIVE_URL || 'http://127.0.0.1:8912/covenants/v6';
if (!['127.0.0.1','localhost'].includes(new URL(origin).hostname)) throw Error('This harness is restricted to local previews.');
const directory = '.local/v6-browser-live-sept8', key = 'kaspa-v6-browser-wallet-v1';
await mkdir(directory,{recursive:true,mode:0o700});await chmod(directory,0o700);
let seed = null;try {seed = JSON.parse(await readFile(directory + '/latest-tab.json','utf8'));} catch (e) {if(e.code!=='ENOENT')throw e;}
const helperState = new Map();const helper = new V6Service({storage:{get:async k=>helperState.get(k),put:async values=>{for(const [k,v]of Object.entries(values))helperState.set(k,v)}}});
const context = await chromium.launchPersistentContext(directory + '/profile',{headless:true,viewport:{width:1440,height:1000},acceptDownloads:true});
const page = context.pages()[0] || await context.newPage();
const errors = [], posts = [], started = new Date().toISOString();
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.method()==='POST')posts.push({url:r.url(),at:new Date().toISOString()});});
if(seed) await context.addInitScript(({seed,key,origin})=>{if(location.origin===origin&&!sessionStorage.getItem(key)){for(const [name,value]of Object.entries(seed))sessionStorage.setItem(name,value);}},{seed,key,origin:new URL(origin).origin});
await context.route('**/assets/v6-app.mjs',async route=>{const response=await route.fetch();const source=await response.text();const needle='if (root) void mountBrowserHarbor(root);';if(!source.includes(needle))throw Error('App bootstrap changed; inspect the harness.');await route.fulfill({response,body:source.replace(needle,'if (root) void mountBrowserHarbor(root).then(value => {window.__v6LiveQA=value;});')});});
await context.route('**/api/v6/*',async route=>{const request=route.request();if(!['start','proof'].includes(new URL(request.url()).pathname.split('/').at(-1)))throw Error('Unexpected legacy API call in new wallet journey.');const response=await helper.handle(new Request(request.url(),{method:'POST',headers:{'Content-Type':'application/json'},body:request.postData()}));await route.fulfill({status:response.status,contentType:'application/json',body:await response.text()});});
// Response.status is a native Response property; route uses it as a number.
async function snapshot(label){if(page.isClosed())return;const stored=await page.evaluate(key=>Object.fromEntries([key,key+'-secret'].filter(k=>sessionStorage.getItem(k)).map(k=>[k,sessionStorage.getItem(k)])),key);if(!stored[key])return;const text=JSON.stringify(stored);await writeFile(directory+'/latest-tab.json',text,{mode:0o600});await writeFile(directory+'/'+Date.now()+'-'+label+'.json',text,{mode:0o600});}
async function waitIdle(){await page.waitForFunction(()=>window.__v6LiveQA&&!window.__v6LiveQA.engine.busy,{timeout:45000});}
async function error(){return page.evaluate(()=>window.__v6LiveQA.engine.error);}
async function accepted(step){return page.evaluate(id=>!!window.__v6LiveQA.engine.accepted(id),step);}
async function settled(step){const until=Date.now()+180000;while(Date.now()<until){if(await accepted(step))return;const message=await error();if(message)console.log('Observation:',message);await snapshot('observing');await page.waitForTimeout(3000);}throw Error('Acceptance not observed within3minutes for '+step);}
async function chapter(n){await page.locator('[data-chapter="'+n+'"]').click();await waitIdle();}
const through=process.argv.includes('--through')?process.argv[process.argv.indexOf('--through')+1]:null;
try {
 await page.goto(origin);await waitIdle();
 const ready=await page.evaluate(()=>window.__v6LiveQA.wallet.ready);
 if(!ready){await page.locator('[data-action=create]').click();await waitIdle();if(await error())throw Error(await error());await snapshot('created-before-faucet');}
 const faucet=await page.evaluate(()=>window.__v6LiveQA.wallet.data.faucet);
 if(!faucet?.acceptingBlock){await page.locator('[data-action=faucet]').click();await waitIdle();await snapshot('faucet-request');if(await error())throw Error(await error());await page.waitForFunction(()=>window.__v6LiveQA.wallet.data.faucet?.acceptingBlock,{timeout:120000});}
 console.log('Real faucet accepted; wallet retained privately.');await snapshot('funded');
 const steps=['purchase-buyer','purchase-seller','purchase-buy','pip-buyer','pip-seller','pip-permit','pip-pay','pip-revoke','ring-create','ring-settle','greenhouse-create','greenhouse-ready0','greenhouse-ready1','greenhouse-ready2','greenhouse-settle','courier-fund','courier-open','courier-deliver','refund-open','refund-claim','proof-open','proof-redeem'];
 for(const step of steps){
  const n=step.startsWith('purchase')?0:step.startsWith('pip')?1:step.startsWith('ring')?2:step.startsWith('greenhouse')?3:step.startsWith('proof')?5:4;
  await chapter(n);
  if(!await accepted(step)){
   const pending=await page.evaluate(()=>window.__v6LiveQA.engine.pending?.step);
   if(pending){if(pending!==step)throw Error('An earlier transaction remains pending: '+pending);await settled(step);}
   else {
    if(step.startsWith('refund'))await page.locator('.harbor-alternatives').evaluate(d=>d.open=true);
    if(step==='proof-redeem'){await page.locator('[data-action=proof]').click();await waitIdle();if(await error())throw Error(await error());}
    await page.locator('[data-step="'+step+'"]').click();await waitIdle();if(await error())throw Error(await error());
    if(!await page.locator('[data-review]').evaluate(d=>d.open))throw Error('Review did not open for '+step);
    await page.screenshot({path:directory+'/review-'+step+'.png'});
    await page.locator('[data-action=confirm]').click();await waitIdle();await snapshot('submitted-'+step);
    if(await error())console.log('Submission observation:',await error());
    await settled(step);
   }
  }
  await snapshot('accepted-'+step);console.log('Accepted:',step);
  if(through===step)break;
 }
 await page.screenshot({path:directory+'/latest-view.png',fullPage:true});
 const before=await page.evaluate(()=>window.__v6LiveQA.engine.records.map(r=>r.id));await page.reload();await waitIdle();const after=await page.evaluate(()=>window.__v6LiveQA.engine.records.map(r=>r.id));if(JSON.stringify(before)!==JSON.stringify(after))throw Error('Reload changed saved transaction IDs.');
 const publicState=await page.evaluate(()=>({completed:window.__v6LiveQA.engine.completed,balances:window.__v6LiveQA.wallet.balances.map(String),records:window.__v6LiveQA.engine.records.map(r=>({step:r.step,id:r.id,acceptingBlock:r.acceptingBlock,fee:r.fee}))}));
 await writeFile('.cache/v6-wallet-live-report.json',JSON.stringify({scope:'Real Testnet-10 faucet, browser signing, direct public RPC and accepted transactions on loopback preview; actual local proof assistance routed through current V6Service. Not hosted-runtime acceptance.',started,finished:new Date().toISOString(),errors,posts,...publicState},null,2));console.log('Saved journey verified after reload:',JSON.stringify({completed:publicState.completed,transactions:publicState.records.length,errors}));
} finally {await snapshot('closing').catch(()=>{});await context.close();}
