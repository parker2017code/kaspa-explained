import {networkDiagram} from './network-diagram.mjs';
import {mountCoordination} from './coordination.mjs';
document.querySelectorAll('[data-coordination]').forEach(mountCoordination);
import {networkState, spendState, miningState, vaultState, transactionState, formatKas} from './models.mjs';

const all = (selector, root=document) => [...root.querySelectorAll(selector)];
const one = (selector, root=document) => root.querySelector(selector);
const set = (root, selector, text) => { const element=one(selector,root); if(element&&element.textContent!==String(text)) element.textContent=text; };
const escaped = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const pressed = (buttons, chosen) => buttons.forEach(button=>button.setAttribute('aria-pressed',String(button===chosen)));
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
// Preserve useful older links without preserving the old page structure.
const oldFragments={'collision-sim':'parallel-blocks','ghostdag':'parallel-blocks','utxo':'conflicts','confirmation-risk':'confirmation','supply-split-demo':'readiness'};
if(oldFragments[location.hash.slice(1)])document.getElementById(oldFragments[location.hash.slice(1)])?.scrollIntoView();

for(const lab of all('[data-lab]')) {
  const q=selector=>one(selector,lab), text=(selector,value)=>set(lab,selector,value);
  if(lab.dataset.lab==='payment') {
    const stages=[
      ['Sent','Waiting for inclusion','A signature permits a spend','The sender broadcasts a signed transaction. Sending it does not establish that the network has accepted it.'],
      ['Included','Inside a block','Its place in accepted history is unresolved','A miner included the payment in a block. Block inclusion alone does not establish transaction acceptance.'],
      ['Accepted','A spendable output','In the currently accepted history','The payment is accepted in the current history. The recipient may still wait before treating it as settled.'],
      ['Later work','More evidence','No universal waiting time','Later work can increase confidence in the accepted history. The amount at risk and security assumptions still matter.'],
    ];
    for(const button of all('button[data-stage]',lab)) button.addEventListener('click',()=>{
      lab.dataset.stage=button.dataset.stage; pressed(all('button[data-stage]',lab),button);
      ['badge','headline','small','answer'].forEach((key,i)=>text(`[data-payment-${key}]`,stages[Number(button.dataset.stage)][i]));
    });
  }
  if(lab.dataset.lab==='network') {
    let delay=500,time=400,frame=0,view='connections',selected=null,interacted=false,diagramKey='';
    lab.addEventListener('pointerdown',event=>{interacted=true;if(!event.target.closest('[data-network-replay]'))stop();});lab.addEventListener('keydown',event=>{interacted=true;if(!event.target.closest('[data-network-replay]'))stop();});
    lab.addEventListener('focusin',event=>{interacted=true;if(!event.target.closest('[data-network-replay]'))stop();});
    const stop=()=>{cancelAnimationFrame(frame);frame=0;text('[data-network-replay]',reduced.matches?'Show final state':'Watch it happen');};
    const inspect=()=>{q('.block-inspection').hidden=!selected;const s=networkState(delay,time);const description={A:'The starting block. Both miners already know it.',B:'Found by miner 1 at 100 ms. References A.',C:s.parallel?'Found by miner 2 at 400 ms, before B arrived. References A.':'Found by miner 2 at 400 ms, after B arrived. References B.',D:s.parallel?'A possible later block references B and C, joining the two branches.':'A possible later block references C, extending the chain.'};text('[data-block-title]',selected?`Block ${selected}`:'Inspect a block');text('[data-block-detail]',description[selected]||'Select A, B, C, or D in the scene to see its references.');};
    const render=()=>{
      const s=networkState(delay,time);
      if((selected==='B'&&!s.foundB)||(selected==='C'&&!s.foundC)||(selected==='D'&&time<1200))selected=null;
      text('[data-network-clock]',`${Math.round(time)} ms`);text('[data-network-delay]',`${delay} ms`);text('[data-network-time]',`${Math.round(time)} ms`);
      q('[data-delay]').value=delay;q('[data-delay-number]').value=delay;q('[data-time]').value=time;
      for(const button of all('[data-delay-preset]',lab))button.setAttribute('aria-pressed',String(Number(button.dataset.delayPreset)===delay));
      for(const [selector,blocks] of [['[data-miner-one]',s.firstKnows],['[data-miner-two]',s.secondKnows]]) q(selector).innerHTML=blocks.map(b=>`<span>${b}</span>`).join('');
      text('[data-miner-one-note]',!s.foundB?'Working from A.':time>=s.receivedC?'Now knows B and C.':'Found B at 100 ms.');
      text('[data-miner-two-note]',!s.foundC?(time>=s.receivedB?'B has arrived. Working from B.':'Working from A.'):(s.parallel?'Found C without knowing B.':'Found C after receiving B.'));
      text('[data-network-decision]',s.foundC?`C references ${s.parent}.`:'C has not been found yet.');
      text('[data-network-reason]',!s.foundC?'Move through time to see which information arrives first.':s.parallel?'B had not arrived when C was found. Neither block references the other.':'B arrived before C was found. C can build on B.');
      const nextDiagramKey=[s.parallel,s.foundB,s.foundC,time>=s.receivedB,time>=1200].join(':');
      if(nextDiagramKey!==diagramKey){q('[data-dag-result]').innerHTML=networkDiagram(s,{interactive:true,selected,id:'diagram-'+all('[data-lab=network]').indexOf(lab)});diagramKey=nextDiagramKey;}
      for(const block of all('[data-block]',q('[data-dag-result]'))){const value=String(block.dataset.block===selected);if(block.getAttribute('aria-pressed')!==value)block.setAttribute('aria-pressed',value);}
      q('[data-dag-result]').hidden=view!=='connections';q('[data-message-view]').hidden=view!=='messages';
      inspect();
      for(const [selector,progress,visible] of [['[data-message-b]',s.progressB,s.foundB],['[data-message-c]',1-s.progressC,s.foundC]]) {q(selector).style.setProperty('--position',progress);q(selector).style.visibility=visible?'visible':'hidden';}
      q('[data-network-messages]').setAttribute('aria-label',`B ${time>=s.receivedB?'received by miner 2':s.foundB?'in transit':'not found'}. C ${time>=s.receivedC?'received by miner 1':s.foundC?'in transit':'not found'}.`);
      q('[data-network-events]').innerHTML=s.events.map(e=>`<tr${e.time>time?' class="future-event"':''}><td>${e.time} ms</td><td>${e.event}</td></tr>`).join('');
    };
    q('[data-dag-result]').addEventListener('click',event=>{const block=event.target.closest('[data-block]');if(!block)return;interacted=true;stop();selected=block.dataset.block;inspect();for(const other of all('[data-block]',lab))other.setAttribute('aria-pressed',String(other.dataset.block===selected));});
    q('[data-dag-result]').addEventListener('keydown',event=>{const block=event.target.closest('[data-block]');if(block&&['Enter',' '].includes(event.key)){event.preventDefault();block.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
    const changeDelay=event=>{if(event.target.value===''||!event.target.validity.valid)return;delay=Number(event.target.value);stop();time=400;render();text('[data-network-announcement]',`${q('[data-network-decision]').textContent} ${q('[data-network-reason]').textContent}`);};
    q('[data-delay]').addEventListener('input',changeDelay);q('[data-delay-number]').addEventListener('input',changeDelay);
    for(const button of all('[data-delay-preset]',lab))button.addEventListener('click',()=>{stop();delay=Number(button.dataset.delayPreset);time=1200;render();text('[data-network-announcement]',`${q('[data-network-decision]').textContent} ${q('[data-network-reason]').textContent}`);});
    for(const button of all('[data-network-view]',lab))button.addEventListener('click',()=>{interacted=true;stop();view=button.dataset.networkView;pressed(all('[data-network-view]',lab),button);render();});
    for(const button of all('[data-event-time]',lab))button.addEventListener('click',()=>{stop();time=Number(button.dataset.eventTime);render();});
    q('[data-time]').addEventListener('input',event=>{time=Number(event.target.value);stop();render();});
    q('[data-network-reset]').addEventListener('click',()=>{interacted=true;stop();selected=null;delay=500;time=400;view='connections';pressed(all('[data-network-view]',lab),q('[data-network-view="connections"]'));render();});
    q('[data-network-replay]').addEventListener('click',()=>{
      if(frame){stop();return;}
      if(reduced.matches){time=1200;render();return;}
      time=0;const start=performance.now();text('[data-network-replay]','Pause');
      const tick=now=>{time=Math.min(1200,(now-start)/5);render();if(time<1200)frame=requestAnimationFrame(tick);else stop();};
      frame=requestAnimationFrame(tick);
    });
    const playAutomatically=()=>{
      if(frame||reduced.matches||interacted||document.hidden)return;
      const start=performance.now();text('[data-network-replay]','Pause');let last=0;
      const tick=now=>{if(now-last>60){last=now;time=Math.min(1200,(now-start)/5);render();}if(time<1200)frame=requestAnimationFrame(tick);else{interacted=true;stop();}};frame=requestAnimationFrame(tick);
    };
    new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)stop();else playAutomatically();},{threshold:.15}).observe(lab);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
    reduced.addEventListener('change',stop);stop();render();
  }
  if(lab.dataset.lab==='spend') for(const button of all('[data-first]',lab)) button.addEventListener('click',()=>{
    const s=spendState(button.dataset.first);pressed(all('[data-first]',lab),button);
    for(const name of ['alice','bob']){q(`[data-attempt="${name}"]`).dataset.valid=String(s.accepted===name);text(`[data-spend-outcome="${name}"]`,s.accepted===name?'Accepted':'Already spent');}
    const name=s.accepted==='alice'?'Alice':'Bob',other=s.accepted==='alice'?'Bob':'Alice';
    text('[data-spend-answer]',`${name}’s payment consumes the output. ${other}’s attempt cannot spend it again. Keeping both blocks does not make both payments valid.`);
  });
  if(lab.dataset.lab==='mining') {
    let share=1,seed=42;
    const render=()=>{
      const s=miningState(share,seed);all('i',q('[data-mining-grid]')).forEach((el,i)=>el.dataset.yours=String(s.blocks[i].yours));
      q('[data-mining-grid]').setAttribute('aria-label',`${s.found} of 600 discoveries belong to this miner. Seed ${seed}.`);
      text('[data-mining-expected]',s.expected.toFixed(1));text('[data-mining-found]',s.found);text('[data-mining-share]',`${share}%`);
      text('[data-mining-answer]',`${share}% of the hash rate means ${s.expected.toFixed(1)} discoveries on average across 600 opportunities. This sample produced ${s.found}. Seed ${seed}.`);
      q('[data-share]').value=share;
    };
    q('[data-share]').addEventListener('input',event=>{share=Number(event.target.value);render();});
    q('[data-mining-sample]').addEventListener('click',()=>{seed=(seed+1)>>>0;render();});
    q('[data-mining-reset]').addEventListener('click',()=>{share=1;seed=42;render();});render();
  }
  if(lab.dataset.lab==='vault') q('[data-vault-action]').addEventListener('change',event=>{
    const s=vaultState(event.target.value);text('[data-vault-balance]',`${s.balance.toLocaleString('en-US')} KAS`);
    s.checks.forEach((pass,i)=>{q(`[data-check="${i}"]`).dataset.pass=String(pass);text(`[data-check="${i}"] [data-check-mark]`,pass?'✓':'×');});
    text('[data-vault-answer]',s.accepted?'All three conditions pass. The example releases 2,000 KAS and retains 8,000 KAS.':'At least one condition fails. The example releases nothing. Its balance stays at 10,000 KAS.');
  });
  if(lab.dataset.lab==='transaction') q('[data-payment-amount]').addEventListener('input',event=>{
    const s=transactionState(event.target.value);text('[data-tx-amount]',formatKas(s.paid));text('[data-tx-payment]',formatKas(s.paid));text('[data-tx-change]',s.valid?formatKas(s.change):'Insufficient input');
    text('[data-tx-answer]',s.valid?'Payment, change, and fee use the entire input. Change creates another spendable output for the sender.':'The requested payment leaves nothing for the fee. This transaction cannot be constructed from this input.');
    lab.dataset.valid=String(s.valid);
  });
}

for(const root of all('[data-playground]')) {
  const choose=id=>{const button=all('[data-workspace]',root).find(button=>button.dataset.workspace===id);if(!button)return;pressed(all('[data-workspace]',root),button);all('[data-workspace-panel]',root).forEach(panel=>panel.hidden=panel.dataset.workspacePanel!==id);};
  all('[data-workspace]',root).forEach(button=>button.addEventListener('click',()=>{history.replaceState(null,'',`#${button.dataset.workspace}`);choose(button.dataset.workspace);}));
  window.addEventListener('hashchange',()=>choose(location.hash.slice(1)));choose(location.hash.slice(1));
}
for(const group of all('.step-control,.playground-nav,.scene-tabs')) group.addEventListener('keydown',event=>{
  const buttons=all('button',group),index=buttons.indexOf(document.activeElement);if(index<0)return;
  const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:['ArrowRight','ArrowDown'].includes(event.key)?(index+1)%buttons.length:['ArrowLeft','ArrowUp'].includes(event.key)?(index+buttons.length-1)%buttons.length:-1;
  if(next>=0){event.preventDefault();buttons[next].focus();buttons[next].click();}
});

const theme=one('[data-theme-toggle]');
theme?.setAttribute('aria-pressed',String(document.documentElement.dataset.theme==='dark'));
theme?.addEventListener('click',()=>{const dark=document.documentElement.dataset.theme!=='dark';document.documentElement.dataset.theme=dark?'dark':'light';theme.setAttribute('aria-pressed',String(dark));try{localStorage.setItem('kaspa-theme',dark?'dark':'light');}catch{}});
const menu=one('[data-menu]');
const closeMenu=()=>{one('.site-header').dataset.open='false';menu?.setAttribute('aria-expanded','false');};
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';one('.site-header').dataset.open=String(open);menu.setAttribute('aria-expanded',String(open));});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});

const search=one('[data-search]');
search?.addEventListener('input',()=>{const query=search.value.trim().toLowerCase();let count=0;for(const item of all('[data-search-item]')){item.hidden=!`${item.textContent} ${item.dataset.terms}`.toLowerCase().includes(query);if(!item.hidden)count++;}set(document,'[data-search-status]',`${count} ${count===1?'place':'places'} to explore`);one('[data-search-empty]').hidden=count!==0;});

for(const inspector of all('[data-inspector]')) one('form',inspector).addEventListener('submit',async event=>{
  event.preventDefault();const button=one('button',inspector),input=one('input',inspector),id=input.value.trim().toLowerCase();
  if(!/^[a-f0-9]{64}$/.test(id)){set(inspector,'[data-lookup-message]','Enter a 64-character transaction ID.');return;}
  button.disabled=true;set(inspector,'[data-lookup-message]','Looking up this mainnet transaction…');
  try{
    const {lookupTransaction}=await import('./public-transaction.mjs');const response=await lookupTransaction(id),record=response.body;if(response.status!==200)throw new Error(record.error||'Lookup unavailable.');
    const amounts=[['Inputs',record.inputSompi],['Outputs',record.outputSompi],['Fee',record.feeSompi]];
    one('[data-lookup-result]',inspector).innerHTML=`<div class="record-header"><p>Kaspa mainnet · read-only</p><strong>${escaped(record.id)}</strong></div><dl class="record-fields"><div><dt>Provider acceptance</dt><dd>${record.accepted===true?'Accepted':record.accepted===false?'Not accepted':'Unavailable'}</dd></div>${amounts.map(([label,value])=>`<div><dt>${label}</dt><dd>${escaped(formatKas(value))}</dd></div>`).join('')}<div><dt>Checked</dt><dd>${escaped(record.checked)}</dd></div></dl><p>Output addresses are not verified identities. Payment and change cannot be inferred from their position.</p>${record.outputs.map(output=>`<div class="record-output">${escaped(formatKas(output.sompi))}<span>${escaped(output.address||'Address unavailable')}</span></div>`).join('')}<details class="detail"><summary>Inspect normalized provider data</summary><pre>${escaped(JSON.stringify(record,null,2))}</pre></details><p><a href="https://explorer.kaspa.org/transactions/${id}">Check in an independent explorer ↗</a></p>`;
    set(inspector,'[data-lookup-message]','Loaded. This is one provider’s observation, not a settlement guarantee.');
  }catch(error){set(inspector,'[data-lookup-message]',`${error.name==='TimeoutError'?'The lookup timed out.':error.message} Any previous result remains below.`);}
  finally{button.disabled=false;}
});

for(const lesson of all('[data-lesson]')){
  const steps=all('[data-lesson-step]',lesson);
  const choose=index=>{steps.forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.lessonStep)===index)));all('[data-lesson-panel]',lesson).forEach(panel=>panel.hidden=Number(panel.dataset.lessonPanel)!==index);};
  steps.forEach(button=>button.addEventListener('click',()=>choose(Number(button.dataset.lessonStep))));
  all('[data-lesson-next]',lesson).forEach(button=>button.addEventListener('click',()=>{const index=Number(button.dataset.lessonNext);choose(index);steps[index].focus({preventScroll:true});}));
  lesson.querySelector('.lesson-steps').addEventListener('keydown',event=>{const index=steps.indexOf(document.activeElement);if(index<0)return;const next=event.key==='Home'?0:event.key==='End'?steps.length-1:event.key==='ArrowRight'?(index+1)%steps.length:event.key==='ArrowLeft'?(index+steps.length-1)%steps.length:-1;if(next>=0){event.preventDefault();choose(next);steps[next].focus();}});
}
