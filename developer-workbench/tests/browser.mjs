// Local-only browser acceptance. Never connects a wallet or broadcasts a transaction.
import {chromium, firefox, webkit} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir, writeFile, readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

const origin = process.env.WORKBENCH_URL || 'http://127.0.0.1:8930';
const output = resolve('.cache/developer-workbench-browser');
if (!['127.0.0.1','localhost','[::1]'].includes(new URL(origin).hostname)) throw Error('Browser acceptance requires a loopback origin');
const reports = [];
const examples = ['allowance','escrow','treasury','receipt','proof'];

async function auditPage(page) {
 return page.evaluate(() => {
  const visible = el => { const r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width>2&&r.height>6&&s.visibility!=='hidden'&&s.display!=='none'; };
  const parse = value => { const n=value.match(/[\d.]+/g)?.map(Number);return n?.length>=3?[n[0],n[1],n[2],n[3]??1]:null; };
  const blend = (fg,bg) => fg.slice(0,3).map((n,i)=>n*fg[3]+bg[i]*(1-fg[3])).concat(1);
  const luminance = c => c.slice(0,3).map(n=>n/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
  const contrast = [];
  for(const el of document.querySelectorAll('body *')) {
   if(!visible(el)||!Array.from(el.childNodes).some(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim())||el.closest('[disabled],[aria-disabled="true"]'))continue;
   const style=getComputedStyle(el),fg=parse(style.color);if(!fg)continue;
   const ancestors=[];let n=el;while(n){ancestors.unshift(n);n=n.parentElement;}
   if(ancestors.some(a=>getComputedStyle(a).backgroundImage!=='none'))continue;
   let bg=[255,255,255,1];for(const ancestor of ancestors){const c=parse(getComputedStyle(ancestor).backgroundColor);if(c)bg=blend(c,bg);}
   const actual=blend(fg,bg),a=luminance(actual),b=luminance(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05),size=parseFloat(style.fontSize),bold=Number(style.fontWeight)>=700,minimum=size>=24||bold&&size>=18.66?3:4.5;
   if(ratio+.03<minimum)contrast.push({text:el.textContent.trim().slice(0,90),ratio:Number(ratio.toFixed(2)),minimum,color:style.color,background:bg.slice(0,3).map(Math.round)});
  }
  const unnamed=Array.from(document.querySelectorAll('button,input:not([type="hidden"]),select,textarea')).filter(visible).filter(el=>!el.textContent.trim()&&!el.getAttribute('aria-label')&&!el.getAttribute('aria-labelledby')&&!el.labels?.length&&!el.getAttribute('title')).map(el=>({tag:el.tagName,id:el.id,type:el.type}));
  return {viewport:innerWidth,pageWidth:document.documentElement.scrollWidth,horizontalOverflow:document.documentElement.scrollWidth>innerWidth+1,unnamed,contrast};
 });
}

async function keyboardAudit(page) {
 const focus=[];
 await page.locator('body').click({position:{x:1,y:1}});
 for(let i=0;i<14;i++) {
  await page.keyboard.press('Tab');
  focus.push(await page.evaluate(()=>{const el=document.activeElement,s=getComputedStyle(el),r=el.getBoundingClientRect();return{tag:el.tagName,label:(el.getAttribute('aria-label')||el.textContent||el.id).trim().slice(0,70),visible:r.width>0&&r.height>0,outline:s.outlineStyle,outlineWidth:s.outlineWidth,shadow:s.boxShadow};}));
 }
 return focus;
}

async function createContext(browser, viewport) {
 const context=await browser.newContext({viewport,acceptDownloads:true,reducedMotion:'reduce'}),errors=[],network=[];
 await context.route('**/*',async route=>{const url=new URL(route.request().url());if(url.protocol.startsWith('http')&&url.origin!==new URL(origin).origin){network.push({url:url.href,external:true});return route.abort();}return route.continue();});
 const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()!=='error')return;const expectedRejection=/\/api\/(validate|krc)$/.test(m.location().url||'')&&/status of 400|400 \(Bad Request\)/.test(m.text());if(!expectedRejection)errors.push(m.text());});
 page.on('response',r=>{if(r.status()>=400)network.push({url:r.url(),status:r.status()});});
 return{context,page,errors,network};
}

const variants = {
 allowance:{key:'spend',value:'5',invalidKey:'spend',invalid:'11',serverRejected:true},
 escrow:{key:'action',value:'refund',select:true,invalidKey:'principal',invalid:'19999999'},
 treasury:{key:'pair',value:'1',select:true,invalidKey:'principal',invalid:'19999999'},
 receipt:{key:'redeem',value:'40000000',invalidKey:'redeem',invalid:'50000000',serverRejected:true},
 proof:{key:'principal',value:'60000000',invalidKey:'principal',invalid:'29999999'},
};
async function selectExample(page,id) {
 const item=page.locator(`[data-example="${id}"]`);
 if(!await item.isVisible())await page.getByRole('button',{name:'Toggle examples',exact:true}).click();
 await item.click();await page.getByRole('tab',{name:'Overview',exact:true}).click();
 await page.getByRole('button',{name:'Reset example',exact:true}).click();
}
async function runChecks(page,{keyboard=false,expectPass=true}={}) {
 const response=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/validate'&&r.request().method()==='POST',{timeout:120000});
 if(keyboard)await page.keyboard.press('Control+Enter');else await page.getByRole('button',{name:/^Run checks/}).click();
 const result=await(await response).json();
 await page.getByRole('heading',{name:result.ok?'Checks passed':'A rule needs attention',exact:true}).waitFor({timeout:10000});
 assert.equal(result.ok,expectPass,JSON.stringify({stage:result.stage,error:result.error,checks:result.checks}));
 if(expectPass){assert.equal(result.stage,'vm');assert.equal(result.synthetic,true);assert.equal(result.submitted,false);assert(result.transaction,'Actual unsigned transaction must be present');assert(result.inputs?.length&&result.outputs?.length,'Transaction diagram requires actual inputs and outputs');}
 return result;
}
async function edit(page,key,value,select=false) {
 const field=page.locator(`[data-field="${key}"]`);
 if(select)await field.selectOption(value);else await field.fill(value);
 await page.getByRole('heading',{name:/^(Settings changed|Build with evidence)$/}).waitFor();
 assert(await page.locator('[data-action="export"]').first().isDisabled(),'Edited values must disable stale export');
 await field.press('Tab');
}
async function runCase(page,id,{name,width,skipExport}) {
 const variant=variants[id];await selectExample(page,id);
 const initial=await runChecks(page,{keyboard:id==='allowance'});
 await page.getByRole('button',{name:'Set baseline',exact:true}).click();
 await edit(page,variant.key,variant.value,variant.select);
 const changed=await runChecks(page);
 assert(await page.locator('.compare').isVisible(),'Comparison must be visible');
 assert((await page.locator('.compare').innerText()).includes(variant.value),'Comparison must show edited value');
 await page.getByRole('tab',{name:'Source',exact:true}).click();
 await page.locator('[data-source-tab="transaction"]').click();
 assert((await page.locator('#source-content').innerText()).length>80,'Transaction source must be inspectable');
 await page.getByRole('tab',{name:'Overview',exact:true}).click();
 let exported=null;
 if(!skipExport&&(name==='chromium'&&width===1440||id==='allowance')){
  const download=page.waitForEvent('download',{timeout:120000});await page.locator('[data-action="export"]').first().click();const file=await download;exported=resolve(output,'downloads',`${name}-${width}-${id}-${file.suggestedFilename()}`);await file.saveAs(exported);assert.equal(await file.failure(),null);assert((await readFile(exported)).length>100,'Export cannot be empty');const config=JSON.parse(execFileSync('/usr/bin/unzip',['-p',exported,'config.json'],{encoding:'utf8'}));assert.equal(config.example,id);assert.equal(String(config.values[variant.key]),variant.value,'Export must preserve edited configuration');const evidence=JSON.parse(execFileSync('/usr/bin/unzip',['-p',exported,'validation.json'],{encoding:'utf8'}));assert.equal(evidence.stage,'vm');assert.equal(evidence.submitted,false);
  await page.getByRole('button',{name:/^Run checks/}).waitFor();
 }
 await page.getByRole('button',{name:'Save project',exact:true}).focus();await page.keyboard.press('Enter');
 await page.reload();await page.locator(`[data-field="${variant.key}"]`).waitFor();
 assert.equal(await page.locator(`[data-field="${variant.key}"]`).inputValue(),variant.value,'Saved settings must survive reload');
 assert(await page.locator('[data-action="export"]').first().isDisabled(),'Reload requires a fresh check before export');
 await runChecks(page,{keyboard:true});
 await edit(page,variant.invalidKey,variant.invalid);
 let rejection;
 if(variant.serverRejected)rejection=await runChecks(page,{expectPass:false});
 else {assert.equal(await page.locator(`[data-field="${variant.invalidKey}"]`).evaluate(e=>e.checkValidity()),false);let requests=0;const count=r=>{if(new URL(r.url()).pathname==='/api/validate')requests++;};page.on('request',count);await page.getByRole('button',{name:/^Run checks/}).click();await page.waitForTimeout(100);page.off('request',count);assert.equal(requests,0,'Invalid field bounds must not run a stale valid transaction');rejection={stage:'browser-validation',ok:false};}
 const vmNegative=[];
 if(id==='treasury'||id==='proof'||id==='escrow'){await selectExample(page,id);const key=id==='treasury'?'authorization':id==='proof'?'proofVariant':'action';await edit(page,key,id==='treasury'?'missing-second':id==='proof'?'corrupt':'refund',true);if(id==='escrow')await edit(page,'currentMedianTime','1800000000000');const denied=await runChecks(page,{expectPass:false});assert.equal(denied.stage,id==='escrow'?'validation':'vm','Negative path must report its actual rejection stage');vmNegative.push({key,stage:denied.stage});}
 const audit=await auditPage(page);assert.equal(audit.horizontalOverflow,false,JSON.stringify(audit));assert.deepEqual(audit.unnamed,[]);
 await page.screenshot({path:resolve(output,`${name}-${width}-${id}.png`),fullPage:true});
 return{id,vmNegative,initial:{stage:initial.stage,fee:initial.fee},changed:{stage:changed.stage,fee:changed.fee},rejection:{stage:rejection.stage,ok:rejection.ok},exported,audit};
}
async function toolsAcceptance() {
const reports=[];
for(const [name,type]of Object.entries({chromium,firefox,webkit})){const browser=await type.launch();for(const width of [1440,390]){const {context,page,errors,network}=await createContext(browser,{width,height:width===390?844:1000});const r={name,width,argent:[],errors,network};reports.push(r);try{await page.goto(origin);await page.locator('[data-example=allowance]').waitFor({state:'attached'});const nav=async action=>{if(!await page.locator(`[data-action=${action}]`).isVisible())await page.locator('[data-action=menu]').click();await page.locator(`[data-action=${action}]`).click();};await nav('argent');await page.locator('#argent-example option').first().waitFor({state:'attached'});for(const id of ['habitat','business','observer','ring','delivery']){await page.locator('#argent-example').selectOption(id);const resp=page.waitForResponse(x=>new URL(x.url()).pathname==='/api/argent',{timeout:120000});await page.locator('[data-action=compile-argent]').click();const result=await(await resp).json();assert.equal(result.ok,true);await page.locator('[data-action=compile-argent]:not([disabled])').waitFor();await page.locator('[data-argent-tab=generated]').click();assert((await page.locator('.source-panel pre').innerText()).length>100);r.argent.push(id);}r.argentAudit=await auditPage(page);await nav('krc');await page.locator('[data-action=check-krc]').click();await page.getByRole('heading',{name:'Payload structure passed'}).waitFor();await page.locator('#krc-payload').fill('{bad');assert.equal(await page.getByRole('heading',{name:'Payload structure passed'}).count(),0);await page.locator('[data-action=check-krc]').click();await page.getByRole('alert').filter({hasText:'Payload must be valid JSON.'}).waitFor();r.krcAudit=await auditPage(page);await page.locator('#import-file').setInputFiles({name:'restore.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({version:1,selected:'allowance',values:{allowance:{spend:7}}}))});if(!await page.locator('[data-example=allowance]').isVisible())await page.locator('[data-action=menu]').click();await page.locator('[data-example=allowance]').click();await page.locator('[data-field=spend]').waitFor();assert.equal(await page.locator('[data-field=spend]').inputValue(),'7');assert(await page.locator('[data-action=export]').first().isDisabled());await page.reload();assert.equal(await page.locator('[data-field=spend]').inputValue(),'7');r.importReload=true;await nav('ecosystem');r.ecosystemAudit=await auditPage(page);await page.screenshot({path:resolve(output,`${name}-${width}-ecosystem.png`),fullPage:true});console.log(name,width,'tools passed');}catch(e){r.error=e.message;console.log(name,width,'FAILED',e.message)}finally{await context.close();}}await browser.close();}
await writeFile(resolve(output,'tools-report.json'),JSON.stringify(reports,null,2));

if(reports.some(r=>r.error||r.errors.length||Object.entries(r).some(([k,v])=>k.endsWith('Audit')&&(v.horizontalOverflow||v.unnamed.length||v.contrast.length))))process.exitCode=1;
}
async function main() {
 if(process.argv.includes('--tools-only')){await mkdir(output,{recursive:true});return toolsAcceptance();}
 const skipExport=process.argv.includes('--skip-export'),onlyEngine=process.argv.find(a=>a.startsWith('--engine='))?.split('=')[1];
 await mkdir(resolve(output,'downloads'),{recursive:true});
 for(const[name,type]of Object.entries({chromium,firefox,webkit})){
  if(onlyEngine&&!onlyEngine.split(',').includes(name))continue;
  const browser=await type.launch();
  try{for(const width of [1440,390]){
   const{context,page,errors,network}=await createContext(browser,{width,height:width===390?844:1000}),report={name,width,scope:skipExport?'real engine; export pending':'full local browser acceptance',cases:[],errors,network};reports.push(report);page.setDefaultTimeout(10000);
   try{await page.goto(origin);await page.locator('[data-example="allowance"]').waitFor({state:'attached'});
    for(const id of examples){try{report.cases.push(await runCase(page,id,{name,width,skipExport}));console.log(`${name} ${width} ${id}: passed`);}catch(error){report.cases.push({id,error:error.message});await page.screenshot({path:resolve(output,`${name}-${width}-${id}-failure.png`),fullPage:true});console.log(`${name} ${width} ${id}: FAILED ${error.message}`);}}
    report.keyboard=await keyboardAudit(page);report.light=await auditPage(page);await page.getByRole('button',{name:'Toggle color theme',exact:true}).click();report.dark=await auditPage(page);await page.screenshot({path:resolve(output,`${name}-${width}-dark.png`),fullPage:true});
   }catch(error){report.error=error.message;}finally{await context.close();}
   await writeFile(resolve(output,'report.json'),JSON.stringify({origin,generatedAt:new Date().toISOString(),skipExport,reports},null,2));
  }}finally{await browser.close();}
 }
 const failures=reports.flatMap(r=>[...(r.error?[`${r.name}:${r.error}`]:[]),...r.cases.filter(c=>c.error).map(c=>`${r.name}/${r.width}/${c.id}: ${c.error}`),...r.errors,...[r.light,r.dark,...r.cases.map(c=>c.audit)].filter(Boolean).flatMap(a=>a.horizontalOverflow||a.unnamed.length||a.contrast.length?[`${r.name}/${r.width}: accessibility/layout audit failed ${JSON.stringify(a)}`]:[]),...r.keyboard?.filter(f=>f.tag!=='BODY'&&(!f.visible||f.outline==='none'&&f.shadow==='none')).map(f=>`${r.name}/${r.width}: missing visible keyboard focus ${JSON.stringify(f)}`)||[],...r.network.filter(n=>n.external||n.status>=500).map(n=>JSON.stringify(n))]);
 console.log(JSON.stringify({combinations:reports.length,cases:reports.reduce((n,r)=>n+r.cases.length,0),failures:failures.length,report:resolve(output,'report.json')}));
 if(failures.length)process.exitCode=1;
}
export {auditPage, keyboardAudit, createContext};
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await main();
