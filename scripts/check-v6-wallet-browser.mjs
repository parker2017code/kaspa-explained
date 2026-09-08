// Actual browser wallet/UI/world + real SDK signatures/native script VM.
// Every RPC call and proof API request stays in this unfunded local fixture.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {chromium,firefox,webkit} from 'playwright';
import {checkV6Script} from '../server/v6-vm.mjs';
import {V6Service} from '../server/v6-service.mjs';

const origin=new URL(process.env.V6_QA_URL||'http://127.0.0.1:8924/covenants/v6');
if(!['127.0.0.1','localhost','[::1]'].includes(origin.hostname))throw Error('This synthetic fixture requires loopback.');
const output=resolve(process.env.V6_WALLET_BROWSER_OUTPUT||'.cache/v6-wallet-browser');
await mkdir(output,{recursive:true});
const sdk=createRequire(import.meta.url)('../.cache/upstream/kaspa-wasm32-sdk/nodejs/kaspa');
const hash=value=>createHash('sha256').update(value).digest('hex');
const plain=value=>JSON.parse(JSON.stringify(value,(_,item)=>typeof item==='bigint'?String(item):item));
const requested=process.argv.includes('--engine')?process.argv[process.argv.indexOf('--engine')+1].split(','):['chromium','firefox','webkit'];
const report={scope:'Unfunded synthetic UTXO/RPC fixture; actual built browser SDK, wallet, engine, UI, Three.js world, native Kaspa TxScriptEngine and V6Service proof assistance. Not real Testnet acceptance.',
  signatureCounter:'Transaction input signatures through wallet.sign; preparation may construct off-chain script-hash authorization certificates or receipt witnesses.',
  instrumentation:'Only the v6-app.mjs response final auto-mount is replaced with deterministic fixture bootstrap. Transaction building/signing/UI/world modules are unmodified. Keys are public 11/22/33 fixture keys; synthetic 10 coins are seeded directly, not requested from a faucet.',
  startedAt:new Date().toISOString(),url:origin.href,engines:{},failures:[],buildFingerprints:Object.fromEntries(await Promise.all(['v6-app.mjs','v6-browser-wallet.mjs','v6-browser-engine.mjs','v6-browser-ui.mjs','v6-world.mjs','v6-browser.css'].map(async file=>[file,hash(await readFile(resolve('dist/assets',file)))])))};

function fixture(){
  let daa=100000n;
  const initial=hash('unfunded browser wallet initial sink'),seed=hash('unfunded synthetic ten coins');
  const entries=new Map(),accepted=[],attempts=[],vm=[],calls=[],proofCalls=[];
  const controls={hideAcceptance:false};
  const storageMap=new Map(),storage={async get(key){return plain(storageMap.get(key)||null);},async put(values){for(const[key,value]of Object.entries(values))storageMap.set(key,plain(value));}};
  const service=new V6Service({storage});
  const key=new sdk.PrivateKey('11'.repeat(32));
  function add(tx,index,amount,scriptPublicKey,covenantId=null){
    const raw={outpoint:{transactionId:tx,index},amount:String(amount),scriptPublicKey:{version:scriptPublicKey.version,script:scriptPublicKey.script},blockDaaScore:String(daa),isCoinbase:false,...(covenantId?{covenant_id:covenantId}:{})};entries.set(tx+':'+index,raw);
  }
  add(seed,0,1000000000n,sdk.payToAddressScript(key.toAddress('testnet-10')));
  function block(id){const index=accepted.findIndex(group=>group.acceptingBlockHash===id);return {header:{hash:id,parentsByLevel:[[index>0?accepted[index-1].acceptingBlockHash:initial]],daaScore:String(daa)}};}
  async function rpc(method,args){
    calls.push(method);
    if(method==='getServerInfo'){daa+=100n;return {networkId:'testnet-10',isSynced:true,hasUtxoIndex:true,virtualDaaScore:String(daa)};}
    if(method==='getBlockDagInfo')return {virtualDaaScore:String(daa),pastMedianTime:String(Date.now())};
    if(method==='getFeeEstimate')return {estimate:{priorityBucket:{feerate:100}}};
    if(method==='getSink')return {sink:accepted.at(-1)?.acceptingBlockHash||initial};
    if(method==='getBlock')return {block:block(args.hash)};
    if(method==='getUtxosByAddresses'){
      const scripts=new Set((Array.isArray(args)?args:args.addresses).map(address=>sdk.payToAddressScript(new sdk.Address(address)).script));
      return {entries:[...entries.values()].filter(entry=>scripts.has(entry.scriptPublicKey.script))};
    }
    if(method==='getVirtualChainFromBlock'){
      const index=args.startHash===initial?-1:accepted.findIndex(group=>group.acceptingBlockHash===args.startHash);
      assert(index>=0||args.startHash===initial,'Known synthetic checkpoint');
      const groups=controls.hideAcceptance?[]:accepted.slice(index+1);
      return {removedChainBlockHashes:[],addedChainBlockHashes:groups.map(group=>group.acceptingBlockHash),acceptedTransactionIds:groups};
    }
    if(method==='submitTransaction'){
      const transaction=sdk.Transaction.deserializeFromSafeJSON(args.transaction);transaction.finalize();
      attempts.push(transaction.id);
      assert(!accepted.some(group=>group.acceptedTransactionIds.includes(transaction.id)),'No duplicate submission in this journey');
      const result=await checkV6Script(transaction);vm.push({id:transaction.id,...result});assert.equal(result.valid,true,JSON.stringify(result));
      for(const input of transaction.inputs){const entry=entries.get(input.previousOutpoint.transactionId+':'+input.previousOutpoint.index);assert(entry,'Input remains unspent');assert.equal(entry.amount,String(input.utxo.amount));assert.equal(entry.scriptPublicKey.script,input.utxo.entry.scriptPublicKey.script);}
      transaction.inputs.forEach(input=>entries.delete(input.previousOutpoint.transactionId+':'+input.previousOutpoint.index));daa++;
      transaction.outputs.forEach((out,index)=>add(transaction.id,index,out.value,out.scriptPublicKey,out.covenant?.covenantId?.toString()));
      accepted.push({acceptingBlockHash:hash('accepted synthetic '+transaction.id),acceptedTransactionIds:[transaction.id]});
      return {transactionId:transaction.id};
    }
    throw Error('Unexpected fixture RPC '+method);
  }
  async function proof(request){
    const path=new URL(request.url()).pathname;
    assert(['/api/v6/start','/api/v6/proof'].includes(path),'Only proof-assistance APIs allowed');
    const body=request.postDataJSON();proofCalls.push({path,allocation:body.allocation,rate:body.rate});
    const response=await service.handle(new Request(request.url(),{method:request.method(),headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}));
    return {status:response.status,contentType:'application/json',body:await response.text()};
  }
  return {rpc,proof,controls,attempts,vm,calls,proofCalls,seed,initial};
}

// This function is serialized into the sole response-only bootstrap replacement.
async function bootstrap(){
  const wallet=new V6BrowserWallet();await wallet.loadSDK();
  const restored=await wallet.restore();
  if(!restored){
    wallet.keys=['11','22','33'].map(hex=>new wallet.sdk.PrivateKey(hex.repeat(32)));wallet.secret='ab'.repeat(32);
    sessionStorage.setItem('kaspa-v6-browser-wallet-v1-secret',wallet.secret);
    wallet.data.faucet={id:'FIXTURE_SEED',acceptingBlock:'FIXTURE_INITIAL'};
    await wallet.save();
  }
  const stats={signatures:0,acceptanceEvents:[]};window.__v6QAStats=stats;
  const originalSign=wallet.sign.bind(wallet);wallet.sign=(...args)=>{stats.signatures++;return originalSign(...args);};
  const listeners=new Set();
  const rpc={
    async getServerInfo(){const value=await window.__v6FixtureRPC('getServerInfo');return {...value,virtualDaaScore:BigInt(value.virtualDaaScore)};},
    async getBlockDagInfo(){const value=await window.__v6FixtureRPC('getBlockDagInfo');return {...value,virtualDaaScore:BigInt(value.virtualDaaScore),pastMedianTime:BigInt(value.pastMedianTime)};},
    getFeeEstimate:()=>window.__v6FixtureRPC('getFeeEstimate'),
    getSink:()=>window.__v6FixtureRPC('getSink'),
    getBlock:args=>window.__v6FixtureRPC('getBlock',args),
    getVirtualChainFromBlock:args=>window.__v6FixtureRPC('getVirtualChainFromBlock',args),
    async getUtxosByAddresses(addresses){const raw=await window.__v6FixtureRPC('getUtxosByAddresses',addresses);return {entries:new wallet.sdk.UtxoEntries(raw.entries.map(entry=>({...entry,amount:BigInt(entry.amount),blockDaaScore:BigInt(entry.blockDaaScore)}))).items};},
    async submitTransaction({transaction}){
      const wire=transaction.serializeToSafeJSON();
      const durable=new V6BrowserWallet({storage:sessionStorage});durable.sdk=wallet.sdk;await durable.restore();
      if(!durable.data.records.some(record=>record.id===transaction.id&&record.journal.transaction===wire))throw Error('Submission does not match an encrypted durable journal');
      const result=await window.__v6FixtureRPC('submitTransaction',{transaction:wire});
      const sink=await rpc.getSink(),event=await rpc.getBlock({hash:sink.sink});for(const listener of listeners)listener({block:event.block});return result;
    },
    addEventListener(name,listener){if(name==='block-added')listeners.add(listener);},
    removeEventListener(name,listener){listeners.delete(listener);},
    async subscribeBlockAdded(){},async unsubscribeBlockAdded(){},async disconnect(){},
  };
  wallet.rpc=rpc;wallet.network='Synthetic Testnet-10 fixture · no network funds';
  const engine=new V6BrowserEngine(wallet);
  const harbor=await mountBrowserHarbor(root,{wallet,engine});
  const onAccepted=engine.onAccepted;engine.onAccepted=record=>{stats.acceptanceEvents.push(record.id);onAccepted(record);};
  window.__v6QA=harbor;
}

async function testEngine(name,type){
  const f=fixture(),data={checks:[],screenshots:[],consoleErrors:[],pageErrors:[],blockedRequests:[],transactions:[],viewports:[]};report.engines[name]=data;
  const browser=await type.launch({headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  await context.exposeBinding('__v6FixtureRPC',(_,method,args)=>f.rpc(method,args));
  await context.route('**/*',async route=>{
    const request=route.request(),url=new URL(request.url());
    if(url.origin!==origin.origin){data.blockedRequests.push(url.origin+url.pathname);return route.abort('blockedbyclient');}
    if(url.pathname.startsWith('/api/'))return route.fulfill(await f.proof(request));
    if(url.pathname==='/assets/v6-app.mjs'){
      const response=await route.fetch(),body=await response.text(),target='if (root) void mountBrowserHarbor(root);';
      assert.equal(body.split(target).length,2,'One known auto-mount site');
      const code=bootstrap.toString().replace('FIXTURE_SEED',f.seed).replace('FIXTURE_INITIAL',f.initial);
      return route.fulfill({response,body:body.replace(target,`if(root) (${code})().catch(error=>{window.__v6QABootError=error.stack||String(error);});`)});
    }
    return route.continue();
  });
  const page=await context.newPage();page.setDefaultTimeout(15000);
  page.on('pageerror',error=>data.pageErrors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')data.consoleErrors.push(message.text());});
  async function wait(){await page.waitForFunction(()=>window.__v6QABootError||window.__v6QA&&!window.__v6QA.engine.busy&&!window.__v6QA.engine.checking);const boot=await page.evaluate(()=>window.__v6QABootError);assert(!boot,boot);const error=await page.evaluate(()=>window.__v6QA.engine.error);assert(!error,error);}
  async function screenshot(label){const path=resolve(output,`${name}-${label}.png`);await page.screenshot({path});data.screenshots.push(path);}
  const stats=()=>page.evaluate(()=>({signatures:window.__v6QAStats.signatures,events:window.__v6QAStats.acceptanceEvents.length,pending:window.__v6QA.engine.pending?.id,completed:window.__v6QA.engine.completed,world:window.__v6QA.inspectWorld()}));
  async function click(selector){await page.locator(selector).click();await wait();}
  async function select(index){await click(`[data-chapter="${index}"]`);assert.equal(await page.locator(`[data-chapter="${index}"]`).getAttribute('aria-current'),'step');}
  async function idleWorld(){await page.waitForFunction(()=>{const world=window.__v6QA?.inspectWorld();return world&&!world.activeMotion&&!world.activeTransfers;},{},{timeout:15000});}
  try{
    await page.goto(origin.href);await wait();await page.waitForFunction(()=>window.__v6QA.inspectWorld(),{},{timeout:20000});
    assert.equal(f.attempts.length,0,'Bootstrap does not send');assert.equal((await stats()).signatures,0);data.checks.push('bootstrap: no signatures or sends');
    await screenshot('desktop-initial');
    if(process.argv.includes('--proof-only')){
      await select(5);await click('[data-step="proof-open"]');assert.equal((await stats()).signatures,0);assert.equal(f.attempts.length,0);await click('[data-action="confirm"]');assert.equal(f.attempts.length,1);
      const before=await stats();
      await page.locator('[data-allocation]').fill('7');await page.locator('[data-rate]').fill('6');await page.locator('[data-action="proof"]').click();await page.waitForFunction(()=>!window.__v6QA.engine.busy,{},{timeout:70000});await wait();
      assert.equal(await page.locator('[data-allocation]').inputValue(),'7');assert.equal(await page.locator('[data-rate]').inputValue(),'6');assert.match(await page.locator('[data-proof-check]').innerText(),/first setting 7, second setting 6/);
      assert.equal((await stats()).signatures,before.signatures);assert.equal(f.attempts.length,1);
      await page.locator('.harbor-proof').scrollIntoViewIfNeeded();await screenshot('proof-7-6-preserved');
      await click('[data-step="proof-redeem"]');await click('[data-action="cancel"]');
      await page.locator('[data-allocation]').fill('6');await wait();assert.equal(await page.locator('[data-step="proof-redeem"]').isDisabled(),true);assert.equal(await page.evaluate(()=>window.__v6QA.engine.proofBundle),null);assert.equal((await stats()).signatures,before.signatures);assert.equal(f.attempts.length,1);
      await screenshot('edited-settings-disable-payout');await page.locator('[data-rate]').fill('7');await page.locator('[data-action="proof"]').click();await page.waitForFunction(()=>!window.__v6QA.engine.busy,{},{timeout:70000});await wait();assert.equal(await page.locator('[data-step="proof-redeem"]').isEnabled(),true);
      await click('[data-step="proof-redeem"]');assert.equal((await stats()).signatures,before.signatures);await click('[data-action="confirm"]');assert.equal(f.attempts.length,2);assert.deepEqual((await stats()).completed,[5]);
      data.checks.push('7/6 persists and generated proof describes 7/6; editing invalidates proof and disables payout; regenerated 6/7 permits one approved native-VM payout');data.proofCalls=f.proofCalls;data.vm=f.vm;assert.deepEqual(data.pageErrors,[]);assert.deepEqual(data.blockedRequests,[]);data.passed=true;return;
    }
    f.controls.hideAcceptance=true;
    const prepare='[data-step="purchase-buyer"]';await click(prepare);
    assert.equal((await stats()).signatures,0,'Review has no transaction signature');assert.equal(f.attempts.length,0,'Review sends nothing');
    assert.equal(await page.locator('[data-review]').evaluate(dialog=>dialog.open),true);
    data.modalFocus=[];
    for(let i=0;i<8;i++){
      await page.keyboard.press('Tab');
      const focus=await page.locator('[data-review]').evaluate(dialog=>({tag:document.activeElement.tagName,text:document.activeElement===document.body?'browser focus boundary':document.activeElement.textContent,inside:dialog.contains(document.activeElement),body:document.activeElement===document.body}));
      data.modalFocus.push(focus);assert(focus.inside||focus.body,'No underlying page control receives focus while modal is open');
    }
    await screenshot('desktop-review');
    for(const viewport of[{width:320,height:740},{width:390,height:844},{width:768,height:1024}]){
      await page.setViewportSize(viewport);await page.evaluate(()=>document.documentElement.dataset.theme='dark');await screenshot('review-dark-'+viewport.width);
      const bounds=await page.locator('[data-review]').boundingBox();assert(bounds.x>=0&&bounds.width<=viewport.width,'Review fits viewport');
      await page.locator('[data-action=cancel]').scrollIntoViewIfNeeded();assert(await page.locator('[data-action=cancel]').isVisible());
    }
    await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>document.documentElement.dataset.theme='light');await page.keyboard.press('Escape');await wait();assert.equal(await page.locator('[data-review]').evaluate(dialog=>dialog.open),false);assert.equal(f.attempts.length,0);data.checks.push('review/cancel: no signatures or sends; native modal prevents focus on underlying page controls (browser focus boundary recorded)');
    await click(prepare);await click('[data-action="confirm"]');assert.equal(f.attempts.length,1);assert((await stats()).pending);data.transactions.push('purchase-buyer');
    const pendingBefore=await stats();
    for(let i=0;i<6;i++)await select(i);
    assert.equal((await stats()).signatures,pendingBefore.signatures);assert.equal(f.attempts.length,1);assert((await stats()).pending);data.checks.push('all chapters remain navigable while first transaction acceptance is hidden');
    await screenshot('pending-independent-navigation');
    await page.reload();await wait();assert.equal(f.attempts.length,1,'Reload does not resend');assert.equal((await stats()).signatures,0,'Reload does not sign');
    await click('[data-action="check"]');assert.equal(f.attempts.length,1);assert.equal((await stats()).signatures,0);f.controls.hideAcceptance=false;
    await click('[data-action="check"]');assert(!(await stats()).pending);data.checks.push('pending survives reload; status observes without signing or sending');
    const steps=['purchase-seller','purchase-buy','pip-buyer','pip-seller','pip-permit','pip-pay','pip-revoke','ring-create','ring-settle','greenhouse-create','greenhouse-ready0','greenhouse-ready1','greenhouse-ready2','greenhouse-settle','courier-fund','courier-open','courier-deliver','refund-open','refund-claim','proof-open','proof-redeem'];
    for(const step of steps){
      const chapter=step.startsWith('purchase')?0:step.startsWith('pip')?1:step.startsWith('ring')?2:step.startsWith('greenhouse')?3:step.startsWith('proof')?5:4;
      await select(chapter);
      if(step.startsWith('refund')&&!await page.locator('.harbor-alternatives').evaluate(details=>details.open))await page.locator('.harbor-alternatives>summary').click();
      if(step==='proof-redeem'){
        const before=await stats(),calls=f.proofCalls.length;
        await page.locator('[data-allocation]').fill('5');await page.locator('[data-rate]').fill('8');
        await page.locator('[data-action="proof"]').click();await page.waitForFunction(()=>!window.__v6QA.engine.busy);assert.match(await page.locator('[data-error]').innerText(),/do not meet/);assert.equal(f.proofCalls.length,calls);assert.equal((await stats()).signatures,before.signatures);await click('[data-action="dismiss"]');
        await page.locator('[data-allocation]').fill('7');await page.locator('[data-rate]').fill('6');await page.locator('[data-action="proof"]').click();await page.waitForFunction(()=>!window.__v6QA.engine.busy,{},{timeout:70000});await wait();
        assert.equal((await stats()).signatures,before.signatures);assert.equal(f.attempts.length,21);assert.equal(f.proofCalls.length,calls+2);data.proofFormAfterGeneration={allocation:await page.locator('[data-allocation]').inputValue(),rate:await page.locator('[data-rate]').inputValue(),requested:{allocation:'7',rate:'6'}};
        assert.equal(data.proofFormAfterGeneration.allocation,'7','Generated proof keeps the requested first setting');assert.equal(data.proofFormAfterGeneration.rate,'6','Generated proof keeps the requested second setting');
        data.checks.push('invalid proof settings rejected locally; actual proof assistance validates 7/6 without transaction signing/sending');await screenshot('proof-generated');
      }
      const before=await stats(),sends=f.attempts.length;
      await click(`[data-step="${step}"]`);assert.equal((await stats()).signatures,before.signatures,step+' review does not sign');assert.equal(f.attempts.length,sends,step+' review does not send');
      await click('[data-action="confirm"]');assert.equal(f.attempts.length,sends+1,step+' one approval gives one submission');assert.equal(await page.evaluate(id=>!!window.__v6QA.engine.accepted(id),step),true,step+' accepted');data.transactions.push(step);
      const accepted=await stats();await click('[data-action="refresh"]');assert.equal(f.attempts.length,sends+1);assert.equal((await stats()).signatures,accepted.signatures);assert.equal((await stats()).events,accepted.events);
      console.log(`${name}: ${step} accepted in native VM`);
    }
    assert.deepEqual((await stats()).completed,[0,1,2,3,4,5]);assert.equal(f.vm.length,22);assert(f.vm.every(result=>result.valid));await idleWorld();
    const complete=await stats();await click('[data-action="refresh"]');assert.equal((await stats()).world.seenEvents,complete.world.seenEvents,'Repeated status does not repeat world consequences');
    data.checks.push('22 UI-approved transactions, including optional courier refund, accepted by native VM; all six chapters complete; reviews sign/send zero');
    data.beforeReload=await stats();const total=f.attempts.length;await page.reload();await wait();await idleWorld();const after=await stats();assert.equal(f.attempts.length,total);assert.equal(after.signatures,0);assert.deepEqual(after.completed,[0,1,2,3,4,5]);assert.equal(after.world.seenEvents,0,'Historical acceptances do not animate again after reload');assert(after.world.greenhouseBuilt);assert(after.world.machinePowered);data.afterReload=after;data.checks.push('completed reload: zero signatures/sends/event replays; greenhouse and machine stay changed');
    for(const viewport of[{width:320,height:740},{width:390,height:844},{width:768,height:1024},{width:1440,height:1000}]){
      await page.setViewportSize(viewport);await page.evaluate(()=>document.documentElement.dataset.theme='dark');await select(5);await page.evaluate(()=>scrollTo(0,0));await screenshot(`dark-${viewport.width}`);
      const overflow=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));data.viewports.push({...viewport,...overflow});assert(overflow.scroll<=overflow.width,'No page overflow at '+viewport.width);
    }
    data.signatures=complete.signatures;data.vm=f.vm;data.proofCalls=f.proofCalls;data.rpcCounts=Object.fromEntries([...new Set(f.calls)].map(method=>[method,f.calls.filter(call=>call===method).length]));
    assert.deepEqual(data.pageErrors,[]);assert.deepEqual(data.blockedRequests,[]);data.passed=true;
  }catch(error){data.passed=false;data.failure=error.stack;report.failures.push({engine:name,error:error.message});await screenshot('failure').catch(()=>{});data.ui=await page.locator('body').innerText().catch(()=>null);data.fixture={attempts:f.attempts.length,vm:f.vm,proofCalls:f.proofCalls};console.error(name+': '+error.stack);}
  finally{await context.close();await browser.close();await writeFile(resolve(output,'report.json'),JSON.stringify(report,null,2));}
}
for(const name of requested){if(!{chromium,firefox,webkit}[name])throw Error('Unknown browser '+name);await testEngine(name,{chromium,firefox,webkit}[name]);}
report.finishedAt=new Date().toISOString();await writeFile(resolve(output,'report.json'),JSON.stringify(report,null,2));
if(report.failures.length)process.exitCode=1;
console.log(JSON.stringify({report:resolve(output,'report.json'),failures:report.failures},null,2));
