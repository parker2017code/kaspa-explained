// Presentation QA uses an isolated scripted service snapshot, never a real wallet.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const origin=process.env.V5_SOURCE_ORIGIN||'http://127.0.0.1:8977',folder='.cache/v5-experience-review';
await mkdir(folder,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
const results=[];
try{
 for(const options of [{width:1440,height:1000,reducedMotion:'no-preference'},{width:390,height:844,reducedMotion:'no-preference'},{width:390,height:844,reducedMotion:'reduce'}]){
  const context=await browser.newContext({viewport:{width:options.width,height:options.height},reducedMotion:options.reducedMotion,...(process.env.V5_RECORD_VIDEO==='1'&&options.width===1440?{recordVideo:{dir:folder+'/video',size:{width:1440,height:1000}}}:{})}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.goto(origin);
  await page.setContent('<link rel="stylesheet" href="/src/app.css"><link rel="stylesheet" href="/src/v4-game.css"><link rel="stylesheet" href="/src/v4-showcase.css"><link rel="stylesheet" href="/src/v5.css"><link rel="stylesheet" href="/src/v5-experience.css"><main class="main"><div id="app"></div></main>');
  await page.evaluate(async()=>{
   const {mountV5Town}=await import('/src/v5-town.mjs');
   window.calls=0;window.id='a'.repeat(64);window.block='b'.repeat(64);
   window.start={playerId:'presentation-qa',wallet:{connected:true,address:'qa-presentation-wallet',balanceSompi:'1000000000'},revision:1,state:{revision:1,upgrades:{plots:1},resources:{crops:0,water:3},statistics:{}},resources:[{id:'crops',amount:0},{id:'water',amount:3}],plots:{count:1},upgrades:[{id:'plots',level:1}],market:{playerId:'presentation-qa',actors:{'presentation-qa':{name:'You',inventory:{crops:0}},mira:{name:'Mira',inventory:{crops:12}}},cells:{'presentation-qa':{nativeSompi:'100000000'}},nativeQuotes:[{actorId:'mira',resource:'crops',available:12,unitPriceSompi:'2000000'}]},receipts:[],guide:{step:{id:'business-buy',title:'Buy crops',detail:'Mira has crops; your business has test coins.',action:{type:'market_buy',to:'mira',resource:'crops',amount:3,maxTotalSompi:'6000000'}}}};
   window.next=structuredClone(start);
   window.ui=mountV5Town(document.querySelector('#app'),{onAction:async()=>{calls++;next=structuredClone(start);next.revision=2;next.state.revision=2;next.payment={kind:'market',status:'submitted',transactionId:id,marketPlan:{operation:'trade'}};ui.render(next);ui.transaction({id,status:'submitted',kind:'market',operation:'trade'});},onRefresh:async()=>{}});ui.render(next);
   window.accept=()=>{next=structuredClone(next);next.payment={...next.payment,status:'accepted',acceptingBlock:block};next.market.actors['presentation-qa'].inventory.crops=3;next.market.cells['presentation-qa'].nativeSompi='94000000';next.receipts=[{id,transactionId:id,status:'accepted',acceptingBlock:block,kind:'market',operation:'trade',nativePurchaseSompi:'6000000',at:1}];next.guide.step={id:'feed_habitat',title:'Feed Sprout',action:{type:'market_use',purpose:'feed_habitat'}};next.revision=3;next.state.revision=3;ui.render(next);ui.transaction({...next.receipts[0]});};
  });
  await page.waitForFunction(()=>ui.game.getCameraState());await page.waitForTimeout(1900);
  assert.equal(await page.locator('[data-game-location]').innerText(),'Exchange');
  await page.screenshot({path:`${folder}/problem-${options.width}-${options.reducedMotion}.png`});
  await page.locator('[data-game-continue]').click();await page.waitForFunction(()=>calls===1 && ui.getPresentationState()?.transactions.length===1);
  assert.equal(await page.evaluate(()=>ui.game.getWorld().v5Town.inventory.market.crops),0);
  const canvasBounds=await page.locator('.v4-game-three canvas').first().boundingBox();
  assert(canvasBounds.y>=0 && canvasBounds.y<options.height && canvasBounds.height>200,'town remains visible after Continue');
  await page.evaluate(()=>accept());
  if(options.reducedMotion==='no-preference'){
   await page.waitForFunction(()=>ui.game.getTransactionJourneyState(id)?.phase==='into-block');
   await page.screenshot({path:`${folder}/network-${options.width}.png`});
  }
  await page.waitForFunction(()=>ui.getPresentationState()?.phase==='result',null,{timeout:25000}).catch(async error=>{console.log(JSON.stringify({debug:await page.evaluate(()=>({phase:ui.getPresentationState()?.phase,done:ui.getPresentationState()?.requestDone,released:ui.getPresentationState()?.worldReleased,transactions:ui.getPresentationState()?.transactions.map(t=>({id:t.id,status:t.status,journey:ui.game.getTransactionJourneyState?.(t.id)})),motion:ui.game.getSceneMotionState(),hidden:document.hidden,button:document.querySelector('[data-game-continue]').textContent})),errors}));await page.screenshot({path:folder+'/failure.png'});throw error;});
  assert.equal(await page.locator('[data-game-location]').innerText(),'Exchange','next room waits for acknowledgement');
  assert.equal(await page.evaluate(()=>ui.game.getWorld().v5Town.inventory.market.crops),3);
  assert.match(await page.locator('[data-game-line]').innerText(),/You received 3 crops\. Mira received 0\.06 tKAS/);
  await page.waitForTimeout(600);assert.equal(await page.evaluate(()=>ui.getPresentationState()?.phase),'result');assert.equal(await page.evaluate(()=>calls),1);
  await page.screenshot({path:`${folder}/result-${options.width}-${options.reducedMotion}.png`});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  if(options.width<=900)assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight>innerHeight),false,'mobile task scroll does not move the town offscreen');
  await page.evaluate(async()=>{ui.destroy();const {mountV5Town}=await import('/src/v5-town.mjs');ui=mountV5Town(document.querySelector('#app'),{onAction:async()=>{calls++;}});ui.render(next);});
  await page.waitForFunction(()=>ui.game.getCameraState());
  assert.equal(await page.evaluate(()=>ui.getPresentationState()?.phase),'result','saved accepted result restores without re-sending');
  assert.equal(await page.evaluate(()=>ui.game.getTransactionJourneyState?.(id)),null,'restoring an accepted result does not replay an old flight');
  await page.locator('[data-game-continue]').click();await page.waitForFunction(()=>!ui.getPresentationState());
  assert.equal(await page.evaluate(()=>calls),1,'acknowledgement does not send another transaction');
  assert.equal(await page.locator('[data-game-location]').innerText(),'Habitat');
  const caseResult={...options,roomHeldUntilAcknowledged:true,noOptimisticGoods:true,acknowledgementSendsNothing:true,restoredResultNoReplay:true,overflow:false,errors};results.push(caseResult);assert.equal(errors.length,0);
  await page.evaluate(async()=>{
   ui.destroy();sessionStorage.clear();
   const {mountV5Town}=await import('/src/v5-town.mjs');
   next=structuredClone(start);next.guide.step={id:'plant',title:'Plant the first crop',action:{type:'plant'}};next.state.production={planted:false,readyCrops:0};calls=0;
   ui=mountV5Town(document.querySelector('#app'),{onAction:async()=>{calls++;next=structuredClone(next);next.state.revision++;next.state.production.planted=true;next.plots.planted=true;next.state.actions={plant:{fingerprint:JSON.stringify({type:'plant'})}};next.guide.step={id:'water',title:'Water the new crop',action:{type:'water'}};ui.render(next);}});ui.render(next);
  });
  await page.waitForFunction(()=>ui.game.getCameraState());await page.waitForTimeout(1600);await page.locator('[data-game-continue]').click();
  await page.waitForFunction(()=>ui.getPresentationState()?.phase==='result',null,{timeout:15000});
  assert.equal(await page.evaluate(()=>ui.getPresentationState().transactions.length),0);
  assert.equal(await page.evaluate(()=>ui.game.getWorld().v5Town.production.planted),true);
  caseResult.localActionNoTransaction=true;
  await page.locator('[data-game-continue]').click();assert.equal(await page.evaluate(()=>calls),1);assert.equal(await page.evaluate(()=>ui.getPresentationState()),null);
  await page.evaluate(()=>ui.destroy());await context.close();
 }
 await writeFile(`${folder}/report.json`,JSON.stringify({scope:'Synthetic service snapshots with real 3D renderer; no transactions submitted',results},null,2));console.log(JSON.stringify(results));
}finally{await browser.close();}
