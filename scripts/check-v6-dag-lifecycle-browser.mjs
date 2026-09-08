import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {extname, join, resolve} from 'node:path';
import {chromium} from 'playwright';

// Rendered presentation fixtures only. All V6 endpoints are intercepted and no
// transaction reaches a host or chain.
const dist=resolve('dist'),types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'};
const server=createServer(async(req,res)=>{try{const pathname=new URL(req.url,'http://fixture').pathname;if(pathname==='/dag-fixture'){res.writeHead(200,{'Content-Type':'text/html'});res.end('<main id="dag"></main>');return;}const relative=pathname==='/covenants-v6'?'covenants-v6.html':pathname.slice(1)||'index.html',file=join(dist,relative);if(!file.startsWith(dist))throw Error();const body=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(body);}catch{res.writeHead(404);res.end();}});
await new Promise(done=>server.listen(0,'127.0.0.1',done));const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
const output=resolve('.cache/cloudflare-qa/v6-dag');await mkdir(output,{recursive:true});
const tx='a'.repeat(64),block='b'.repeat(64),parent='c'.repeat(64),KEY='kaspa-v6-local-session-v1',id='12345678-1234-1234-9234-123456789012',capability='d'.repeat(64);
const network={network:'testnet-10',status:'live',lastEventAt:Date.now(),blocks:[{hash:parent,parents:[],observedAt:Date.now()-100,daaScore:1},{hash:block,parents:[parent],observedAt:Date.now(),daaScore:2}]};
const checks=[];const check=(condition,label)=>{assert.ok(condition,label);checks.push(label);};

try{
  {
    const context=await browser.newContext();await context.addInitScript(()=>Object.defineProperty(document,'hidden',{configurable:true,get:()=>Boolean(window.__qaHidden)}));const page=await context.newPage();await page.goto(base+'/dag-fixture');
    await page.evaluate(async({network,tx,block})=>{const {mountV6Dag}=await import('/assets/v6-dag.mjs');window.dag=mountV6Dag(document.querySelector('#dag'));window.dag.update(network,{transactionId:tx,phase:'submitted'});},{network,tx,block});
    await page.locator('.v6-dag-transaction').getByText('Sender → submitted',{exact:true}).waitFor();check(true,'Pending transaction renders sender to submitted without claiming acceptance');
    await page.evaluate(({network,tx,block})=>window.dag.update(network,{transactionId:tx,acceptingBlock:block,phase:'accepted'},{freshAcceptance:true,transactionId:tx,startedAt:Date.now(),arrivesAt:Date.now()+1200}),{network,tx,block});
    await page.locator('.v6-dag-transaction').getByText(/Observed block → recipient consequence/).waitFor();check(true,'Fresh acceptance renders the causal DAG-to-recipient path');
    check(await page.locator('.v6-dag-blocks .is-accepting:not(.pinned)').count()===1&&await page.locator('.v6-dag-blocks .pinned').count()===0,'Observed accepting hash uses its actual live DAG node when present');
    await page.waitForTimeout(3200);
    check(await page.locator('.v6-dag-transaction').count()===0,'Accepted transaction packet clears after the bounded presentation');
    check(await page.locator('.v6-dag-note a').getAttribute('href')===`https://tn10.kaspa.stream/transactions/${tx}`,'Receipt inspection link remains after animation cleanup');
    await page.evaluate(({network,tx,block})=>{window.dag.destroy();const root=document.querySelector('#dag');window.dag=(window.__mount||null);return import('/assets/v6-dag.mjs').then(({mountV6Dag})=>{window.dag=mountV6Dag(root);window.dag.update(network,{transactionId:tx,acceptingBlock:block,phase:'accepted'});});},{network,tx,block});
    check(await page.locator('.v6-dag-transaction').count()===0&&await page.locator('.v6-dag-blocks .pinned').count()===0,'Historical accepted snapshot renders receipt evidence without replaying motion');
    await page.evaluate(({network,tx})=>window.dag.update(network,{transactionId:tx,acceptingBlock:'e'.repeat(64),phase:'accepted'},{freshAcceptance:true,transactionId:tx,startedAt:Date.now(),arrivesAt:Date.now()+1200}),{network,tx});
    await page.locator('.v6-dag-blocks .pinned').waitFor();check(true,'Fresh acceptance can temporarily place its real hash when the live window lacks that block');
    await page.waitForTimeout(3200);
    check(await page.locator('.v6-dag-blocks .pinned').count()===0,'Temporary accepting block clears with the packet');
    await page.evaluate(({network,tx})=>{window.__qaHidden=true;window.dag.update(network,{transactionId:tx,acceptingBlock:'f'.repeat(64),phase:'accepted'},{freshAcceptance:true,transactionId:tx,startedAt:Date.now(),arrivesAt:Date.now()+1200});},{network,tx});
    check(await page.locator('.v6-dag-transaction').count()===0&&await page.locator('.v6-dag-blocks .pinned').count()===0,'Hidden presentation shows no packet or temporary accepting block');
    await context.close();
  }
  {
    const context=await browser.newContext({reducedMotion:'reduce'});const page=await context.newPage();await page.goto(base+'/dag-fixture');
    await page.evaluate(async({network,tx,block})=>{const {mountV6Dag}=await import('/assets/v6-dag.mjs');mountV6Dag(document.querySelector('#dag')).update(network,{transactionId:tx,acceptingBlock:block,phase:'accepted'},{freshAcceptance:true,transactionId:tx,startedAt:Date.now(),arrivesAt:Date.now()});},{network,tx,block});
    check(await page.locator('.v6-dag-transaction').count()===0&&await page.locator('.v6-dag-note a').isVisible(),'Reduced motion shows durable receipt evidence without animated packet');
    await context.close();
  }
  {
    const pending={id,revision:1,chapter:0,stage:'purchase-ready',pending:{kind:'purchase',transactionId:tx},operation:{operation:'purchase',phase:'submitted',transactionId:tx},receipts:[],completed:[],scene:{result:{}},inventory:{buyer:{tools:0,coinSompi:'20000000'},seller:{tools:1,coinSompi:'0'}}};
    const accepted={...pending,revision:2,stage:'purchase-complete',pending:null,operation:{operation:'purchase',phase:'accepted',transactionId:tx,acceptingBlock:block},receipts:[{operation:'purchase',transactionId:tx,acceptingBlock:block}],inventory:{buyer:{tools:1,coinSompi:'14000000'},seller:{tools:0,coinSompi:'6000000'}}};
    const context=await browser.newContext();await context.addInitScript(({KEY,value})=>{if(!localStorage.getItem(KEY))localStorage.setItem(KEY,JSON.stringify(value));},{KEY,value:{id,capability,inflight:null,snapshot:pending}});
    await context.route('**/assets/v6-world.mjs',route=>route.fulfill({contentType:'text/javascript',body:`export async function mountV6World(){let state={};const value={update(next){state=structuredClone(next||{});},inspect(){return {toolInCart:Boolean(state.result?.toolReceived)};},select(){},destroy(){}};window.__dagQaWorld=value;return value;}`}));
    const calls=[];await context.route('**/api/v6/**',route=>{const path=new URL(route.request().url()).pathname.split('/').at(-1);calls.push(path);if(path==='events')return route.fulfill({status:200,contentType:'text/event-stream',body:`data: ${JSON.stringify(network)}\n\n`});return route.fulfill({json:{session:accepted}});});
    const page=await context.newPage();await page.goto(base+'/covenants-v6');await page.waitForFunction(KEY=>Boolean(JSON.parse(localStorage.getItem(KEY))?.snapshot?.operation?.acceptingBlock),KEY);await page.waitForFunction(()=>window.__dagQaWorld);
    check((await page.locator('[data-v6-info]').textContent()).includes('Accepted by the node'),'Observed acceptance status and accepting-block evidence render immediately');
    check((await page.evaluate(()=>window.__dagQaWorld.inspect())).toolInCart===false,'Recipient consequence stays held when acceptance is first observed');
    check(await page.locator('.v6-dag-transaction').count()===1,'App passes fresh acceptance metadata to the DAG presentation');
    await page.screenshot({path:join(output,'01-observed-acceptance-in-flight.png')});
    await page.waitForTimeout(1400);
    check((await page.evaluate(()=>window.__dagQaWorld.inspect())).toolInCart===true,'Recipient consequence appears only after the DAG packet arrives');
    await page.waitForTimeout(1800);check(await page.locator('.v6-dag-transaction').count()===0,'Integrated acceptance packet cleans up after about three seconds');await page.screenshot({path:join(output,'02-accepted-cleanup.png')});
    const actions=calls.filter(path=>path==='action').length;await page.reload();await page.waitForFunction(()=>window.__dagQaWorld);await page.waitForTimeout(300);
    const restoredWorld=await page.evaluate(()=>({world:window.__dagQaWorld.inspect(),saved:JSON.parse(localStorage.getItem('kaspa-v6-local-session-v1'))?.snapshot}));
    check(restoredWorld.world.toolInCart===true,'Reload keeps the accepted recipient consequence');
    check(await page.locator('.v6-dag-transaction').count()===0,'Reload never replays the accepted packet');
    check(calls.filter(path=>path==='action').length===actions,'DAG presentation and reload authorize no action request');
    await context.close();
  }
  const report={status:'complete',scope:'Rendered Chromium fixtures with intercepted V6 endpoints; no hosted or chain requests',completedAt:new Date().toISOString(),screenshots:['01-observed-acceptance-in-flight.png','02-accepted-cleanup.png'],checks};await writeFile(join(output,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{await browser.close();await new Promise(done=>server.close(done));}
