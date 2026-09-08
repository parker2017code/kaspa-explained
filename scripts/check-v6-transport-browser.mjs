import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {extname, join, resolve} from 'node:path';
import {chromium} from 'playwright';

// Controller transport regression only. Every V6 endpoint is intercepted;
// this script cannot create a hosted session or submit a chain transaction.
const root=resolve('dist');
const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'};
const server=createServer(async(req,res)=>{
  try{
    const pathname=new URL(req.url,'http://fixture').pathname;
    const relative=pathname==='/'?'index.html':pathname==='/covenants-v6'?'covenants-v6.html':pathname.slice(1);
    const file=join(root,relative);
    if(!file.startsWith(root))throw Error('bad path');
    const body=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(body);
  }catch{res.writeHead(404);res.end('Not found');}
});
await new Promise(resolveReady=>server.listen(0,'127.0.0.1',resolveReady));
const origin=`http://127.0.0.1:${server.address().port}/covenants-v6`;
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
const output=resolve('.cache/cloudflare-qa/v6-transport');
const id='12345678-1234-1234-9234-123456789012',capability='a'.repeat(64),KEY='kaspa-v6-local-session-v1';
const base=(stage='purchase-ready',extra={})=>({id,revision:1,chapter:0,stage,pending:null,intent:null,operation:null,receipts:[],completed:[],scene:{result:{}},inventory:{buyer:{tools:0,coinSompi:'20000000'},seller:{tools:1,coinSompi:'0'}},...extra});
const saved=snapshot=>({id,capability,inflight:null,snapshot});
const results=[];
const check=(condition,label)=>{assert.ok(condition,label);results.push(label);};

async function contextWith(snapshot=null,handler=null){
  const context=await browser.newContext({reducedMotion:'reduce'});
  if(snapshot)await context.addInitScript(({KEY,value})=>localStorage.setItem(KEY,JSON.stringify(value)),{KEY,value:saved(snapshot)});
  const calls=[];
  await context.route('**/api/v6/**',async route=>{
    const request=route.request(),path=new URL(request.url()).pathname.split('/').at(-1),body=request.method()==='POST'?request.postDataJSON():null;
    calls.push({path,body});
    if(handler)return handler({route,path,body,calls});
    return route.fulfill({status:503,json:{error:'fixture endpoint is closed'}});
  });
  return {context,calls};
}

try{
  {
    const {context,calls}=await contextWith();const page=await context.newPage();
    await page.goto(origin);await page.waitForSelector('.v6-shell');await page.waitForTimeout(2500);
    check(calls.length===0,'Welcome renders without API or EventSource requests');
    await context.close();
  }
  {
    const complete=base('complete',{chapter:5,completed:[0,1,2,3,4,5]});
    const {context,calls}=await contextWith(complete);await context.addInitScript(()=>Object.defineProperty(document,'hidden',{configurable:true,get:()=>Boolean(window.__qaHidden)}));const page=await context.newPage();
    await page.goto(origin);await page.getByRole('button',{name:'Explore the harbor',exact:true}).waitFor();await page.waitForTimeout(2500);
    await page.reload();await page.getByRole('button',{name:'Explore the harbor',exact:true}).waitFor();
    await page.evaluate(()=>{window.__qaHidden=true;document.dispatchEvent(new Event('visibilitychange'));});await page.waitForTimeout(500);
    await page.evaluate(()=>{window.__qaHidden=false;document.dispatchEvent(new Event('visibilitychange'));});await page.waitForTimeout(500);
    check(calls.length===0,'Cached completion, reload and emulated visibility changes stay entirely local');
    await context.close();
  }
  {
    let session=base();
    const {context,calls}=await contextWith(session,({route,path,body})=>{
      if(path==='events')return route.fulfill({status:503,json:{error:'synthetic SSE failure'}});
      if(path==='status')return route.fulfill({json:{session}});
      if(path==='action'){
        session={...session,revision:session.revision+1,pending:{kind:'purchase',transactionId:'b'.repeat(64)},operation:{operation:'purchase',phase:'submitted',transactionId:'b'.repeat(64)}};
        return route.fulfill({json:{session}});
      }
      return route.fulfill({status:400,json:{error:'unexpected fixture request'}});
    });
    await context.addInitScript(()=>Object.defineProperty(document,'hidden',{configurable:true,get:()=>Boolean(window.__qaHidden)}));
    const page=await context.newPage();await page.goto(origin);await page.getByRole('button',{name:'Buy the tool atomically',exact:true}).waitFor();
    await page.waitForTimeout(6500);
    const eventCalls=calls.filter(call=>call.path==='events').length;
    check(eventCalls>=2&&eventCalls<=3,'SSE failures retry only through the controlled 2s/4s backoff');
    await page.getByRole('button',{name:'Buy the tool atomically',exact:true}).click();
    await page.getByRole('button',{name:'Check the saved transaction',exact:true}).waitFor();
    check(calls.some(call=>call.path==='action'&&call.body?.action==='purchase'),'Active Continue still submits its rendered stage action');
    const actionCount=calls.filter(call=>call.path==='action').length,statusBefore=calls.filter(call=>call.path==='status').length;
    await page.reload();await page.getByRole('button',{name:'Check the saved transaction',exact:true}).waitFor();await page.waitForTimeout(1800);
    check(calls.filter(call=>call.path==='action').length===actionCount&&calls.filter(call=>call.path==='status').length>statusBefore,'Pending reload reconciles by status without a new action');
    await page.evaluate(()=>{window.__qaHidden=true;document.dispatchEvent(new Event('visibilitychange'));});
    const hidden=await page.evaluate(()=>document.hidden);await page.waitForTimeout(500);const hiddenCount=calls.length;await page.waitForTimeout(3000);
    check(hidden&&calls.length===hiddenCount,'Hidden incomplete tabs stop polling and SSE retries');
    await page.evaluate(()=>{window.__qaHidden=false;document.dispatchEvent(new Event('visibilitychange'));});
    await page.waitForTimeout(500);
    check(calls.length>hiddenCount,'Returning visible resumes incomplete status and SSE transport');
    await context.close();
  }
  {
    let session=base('purchase-ready',{intent:{id:'finite-setup',index:1,total:2}});
    const {context,calls}=await contextWith(session,({route,path,body})=>{
      if(path==='events')return route.fulfill({status:200,contentType:'text/event-stream',body:'data: {"network":"testnet-10","status":"live","blocks":[]}\n\n'});
      if(path==='status')return route.fulfill({json:{session}});
      if(path==='action'){
        session={...session,revision:2,intent:null};return route.fulfill({json:{session}});
      }
      return route.fulfill({status:400,json:{error:'unexpected fixture request'}});
    });
    const page=await context.newPage();await page.goto(origin);
    await page.waitForFunction(()=>JSON.parse(localStorage.getItem('kaspa-v6-local-session-v1'))?.snapshot?.intent===null);
    const actions=calls.filter(call=>call.path==='action');
    check(actions.length===1&&actions[0].body?.action==='resume'&&actions[0].body?.requestId==='resume:finite-setup:1','Finite saved intent resumes exactly its identified queue step');
    await context.close();
  }
  {
    const session=base('purchase-ready',{pending:{kind:'purchase',transactionId:'c'.repeat(64)}});
    const {context,calls}=await contextWith(session,({route,path})=>path==='events'
      ? route.fulfill({status:503,json:{error:'synthetic SSE failure'}})
      : route.fulfill({json:{session}}));
    const page=await context.newPage();await page.clock.install({time:new Date()});await page.goto(origin);await page.waitForSelector('.v6-shell');
    await page.clock.fastForward(301000);await page.waitForTimeout(100);
    const afterBound=calls.length;await page.clock.fastForward(60000);await page.waitForTimeout(100);
    check(calls.length===afterBound,'Five-minute visible inactivity bound stops pending polling and SSE retries');
    await page.getByRole('button',{name:'Check the saved transaction',exact:true}).click();await page.waitForTimeout(100);
    check(calls.length>afterBound,'Rendered pending control resumes reconciliation after inactivity');
    await context.close();
  }
  const report={status:'complete',scope:'Intercepted Chromium transport fixtures; no hosted or chain requests. Visibility transitions are deterministically emulated by overriding document.hidden and dispatching visibilitychange.',completedAt:new Date().toISOString(),checks:results};
  await mkdir(output,{recursive:true});await writeFile(join(output,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
}finally{await browser.close();await new Promise(resolveClose=>server.close(resolveClose));}
