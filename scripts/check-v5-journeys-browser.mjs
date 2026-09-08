// Browser regression for tracked transaction journeys. All transactions are
// synthetic fixtures; this script never creates a wallet or submits to a node.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,readFile} from 'node:fs/promises';
import {staticPreview} from './static-preview.mjs';

const output='.cache/visual-review/v5-journeys';
const server=staticPreview('dist');
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch();
const reports=[];
const hash=character=>character.repeat(64);

try {
  await mkdir(output,{recursive:true});
  for(const width of [1440,390]) for(const reduced of [false,true]) {
    const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:reduced?'reduce':'no-preference'});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.routeWebSocket('**',socket=>socket.close());
    await context.route('**/api/**',route=>route.abort());
    await context.route('**/assets/**',async route=>{
      const name=new URL(route.request().url()).pathname.split('/').pop();
      if(name==='public-v4-ui.mjs') {
        const source=await readFile('src/public-v4-ui.mjs','utf8');
        assert(source.includes('const game=mountV4Game('));
        return route.fulfill({body:source.replace('const game=mountV4Game(','const game=window.__flightGame=mountV4Game('),contentType:'text/javascript'});
      }
      if(!name?.match(/\.(?:mjs|css)$/))return route.continue();
      try {
        return route.fulfill({body:await readFile('src/'+name),contentType:name.endsWith('.css')?'text/css':'text/javascript'});
      } catch { return route.continue(); }
    });

    await page.goto(origin+'/covenants');
    await page.waitForFunction(()=>window.__flightGame&&document.querySelector('.v4-transaction-flight'));
    await page.waitForTimeout(250);
    const state=id=>page.evaluate(value=>window.__flightGame.getTransactionJourneyState(value),id);
    const waitForPhase=async(id,phases,timeout=5000)=>{
      const wanted=[].concat(phases);
      await page.waitForFunction(({id,wanted})=>wanted.includes(window.__flightGame.getTransactionJourneyState(id)?.phase),{id,wanted},{timeout});
      return state(id);
    };
    const fixture={guided:true,title:'Synthetic journey check',chapter:'Browser fixture · no network transactions',status:'Synthetic events only.',label:'Read-only fixture',pending:true};
    const first={id:hash('a'),kind:'agent',presentation:'v5',originLabel:'Moss',recipientLabel:'Pip',status:'pending',inputCount:1,covenantCount:1,outputCount:2};
    const second={id:hash('b'),kind:'market',presentation:'v5',originLabel:'Supply shop',recipientLabel:'Pip',status:'pending',inputCount:1,covenantCount:1,outputCount:3};
    const firstBlock=hash('1'),secondBlock=hash('2');

    // The visible outbound trip starts when the first transaction is queued.
    // The acceptance update can arrive later, especially while the mobile
    // fixture is still settling its layout, so do not measure travel from the
    // host-side acceptance call.
    const journeyStartedAt=Date.now();
    await page.evaluate(({fixture,first,second,firstBlock,secondBlock})=>{
      const game=window.__flightGame;
      game.setLive(fixture);
      game.updateDag({hash:firstBlock,parents:[secondBlock],source:'fixture'});
      game.transaction(first);
      game.transaction(first);
      game.transaction(second);
      game.transaction({...second,status:'accepted'});
    },{fixture,first,second,firstBlock,secondBlock});
    assert.equal(await state(hash('z')),null,'Unknown journey IDs return null');
    const initialFirst=await waitForPhase(first.id,['to-node','waiting']);
    const queuedSecond=await state(second.id);
    assert.equal(queuedSecond.active,false,'A second transaction waits in the queue');
    assert.equal(queuedSecond.accepted,false,'An accepted status without a block hash stays pending');
    assert.equal(queuedSecond.acceptingBlock,null);

    if(reduced) {
      assert.equal(initialFirst.phase,'waiting','Reduced motion settles pending journeys at the node wait');
    } else {
      assert.equal(initialFirst.phase,'to-node');
      assert.equal(await page.locator('.v4-transaction-flight').getAttribute('data-accepting-block'),'');
    }
    if(width===390)assert.equal(await page.locator('.v4-dag-panel').getAttribute('data-compact'),'false','A journey temporarily reveals the mobile DAG');

    const hiddenForVisibility=!reduced&&width===390;
    if(hiddenForVisibility) {
      await page.evaluate(()=>{const canvas=document.querySelector('.v4-game-three canvas');canvas.style.transform='translateY(2500px)';});
      await page.waitForTimeout(150);
    }
    await page.evaluate(({first,firstBlock})=>window.__flightGame.transaction({...first,status:'accepted',acceptingBlock:firstBlock}),{first,firstBlock});
    if(!reduced) {
      await waitForPhase(first.id,'into-block',7000);
      assert.equal(await page.locator('.v4-transaction-flight').getAttribute('data-accepting-block'),firstBlock);
      assert.match(await page.locator('[data-flight-caption]').textContent(),/Accepted by block/);
      assert(new URL(await page.locator('[data-flight-caption]').getAttribute('href')).pathname.endsWith('/'+first.id));
    }
    await page.evaluate(({second,secondBlock})=>window.__flightGame.transaction({...second,status:'accepted',acceptingBlock:secondBlock}),{second,secondBlock});

    const seen=new Map([[first.id,[{phase:initialFirst.phase,time:Date.now(),active:initialFirst.active}]],[second.id,[{phase:queuedSecond.phase,time:Date.now(),active:queuedSecond.active}]]]);
    const started=Date.now();
    while(Date.now()-started<16000) {
      for(const id of seen.keys()) {
        const current=await state(id),history=seen.get(id);
        if(current&&history.at(-1)?.phase!==current.phase)history.push({phase:current.phase,time:Date.now(),active:current.active});
      }
      if(seen.get(first.id).some(item=>item.phase==='settled')&&seen.get(second.id).some(item=>item.phase==='settled'))break;
      await page.waitForTimeout(70);
    }
    for(const [id,history] of seen)assert(history.some(item=>item.phase==='settled'),`Journey ${id.slice(0,6)} must settle`);
    const phases=id=>seen.get(id).map(item=>item.phase).filter((phase,index,list)=>index===0||phase!==list[index-1]);
    if(!reduced) {
      assert.deepEqual(phases(first.id),['to-node','into-block','returning','settled']);
      assert.deepEqual(phases(second.id),['to-node','into-block','returning','settled']);
      const firstTimes=seen.get(first.id),toBlock=firstTimes.find(item=>item.phase==='into-block').time;
      assert(toBlock-journeyStartedAt>=1500,'V5 node travel keeps the visible 1.8 second pacing');
      assert.match(await page.locator('[data-flight-caption]').textContent(),/returned to Pip|town state updated/);
    } else {
      assert.deepEqual(phases(first.id),['waiting','settled']);
      assert.deepEqual(phases(second.id),['to-node','settled']);
      assert.equal((await state(first.id)).active,false);
      assert.equal((await state(second.id)).active,false);
    }
    if(width===390)assert.equal(await page.locator('.v4-dag-panel').getAttribute('data-compact'),'true','Mobile DAG preference returns after the journey');
    if(hiddenForVisibility)await page.evaluate(()=>document.querySelector('.v4-game-three canvas').style.removeProperty('transform'));

    const restored={id:hash('d'),kind:'coordination',presentation:'v5',originLabel:'Greenhouse',recipientLabel:'Backers',status:'accepted',acceptingBlock:firstBlock,restored:true,replay:true};
    await page.evaluate(value=>window.__flightGame.transaction(value),restored);
    await page.waitForTimeout(120);
    assert.deepEqual(await state(restored.id),{id:restored.id,phase:'settled',active:false,accepted:true,acceptingBlock:firstBlock,progress:1},'Restored accepted journeys remain settled without replay');

    const pending={id:hash('c'),kind:'terrarium',presentation:'v5',originLabel:'Sprout',recipientLabel:'Habitat',status:'pending'};
    await page.evaluate(value=>window.__flightGame.transaction(value),pending);
    const waiting=await waitForPhase(pending.id,'waiting');
    assert.equal(waiting.accepted,false);
    assert.equal(waiting.acceptingBlock,null);
    assert.equal(waiting.active,true,'A pending journey remains active while it waits for node acceptance');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Journey overlays do not create horizontal overflow');
    await page.screenshot({path:`${output}/${width}-${reduced?'reduced':'motion'}.png`,fullPage:true});
    assert.deepEqual(errors,[]);
    reports.push({width,reduced,initialPendingPhase:initialFirst.phase,queuedSecondInactive:true,invalidAcceptancePending:true,phaseOrder:phases(first.id),secondPhaseOrder:phases(second.id),pacedV5:!reduced,mobileCanvasOffscreenJourneyAdvanced:hiddenForVisibility,mobileDagTemporarilyRevealed:width===390,mobileDagPreferenceRestored:width===390,reducedSettled:reduced,restoredNoReplay:true,pendingState:waiting,pageErrors:errors});
    await context.close();
    console.log('PASS',width,reduced?'reduced':'motion');
  }
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
console.log(JSON.stringify(reports));
