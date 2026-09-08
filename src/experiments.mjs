import {EXPERIMENTS,newExperiment,transitionExperiment} from './experiment-models.mjs';
const root=document.querySelector('[data-experiments]'),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
if(root){
  let selected=EXPERIMENTS.some(x=>x.id===location.hash.slice(1))?location.hash.slice(1):'delegation';
  const states=Object.fromEntries(EXPERIMENTS.map(x=>[x.id,newExperiment(x.id)]));
  const drafts={delegation:{amount:30,cap:20,service:'compute',spend:15,spendService:'compute'},completion:{minimum:8},execution:{a:6,b:6},correction:{witness:2},arena:{amount:5,recipient:'supplier',signer:'agent'}};
  const input=(name,label,value,type='number')=>`<label>${label}<input data-field="${name}" type="${type}" value="${esc(value)}"${type==='number'?' step="1"':''}></label>`;
  const select=(name,label,value,options)=>`<label>${label}<select data-field="${name}">${options.map(x=>`<option value="${x}"${value===x?' selected':''}>${x}</option>`).join('')}</select></label>`;
  const button=(action,label,data='')=>`<button type="button" data-action="${action}" ${data}>${label}</button>`;
  const box=(label,value,detail='')=>`<div class="experiment-account"><span>${esc(label)}</span><strong>${esc(value)}</strong><small>${esc(detail)}</small></div>`;
  function render(){
    const e=EXPERIMENTS.find(x=>x.id===selected),s=states[selected],d=drafts[selected];
    root.querySelector('nav').innerHTML=EXPERIMENTS.map((x,i)=>`<button type="button" data-select="${x.id}" aria-pressed="${x.id===selected}"><span>0${i+1}</span>${esc(x.title)}</button>`).join('');
    let accounts='',controls='',rule='';
    if(selected==='delegation'){
      accounts=box('Owner · available',s.available,'Original budget: 100')+box('Subcontract · reserved',s.reserved,s.child?.active?`${s.child.services.join(', ')} · cap ${s.child.cap}`:'No active authority')+box('Service providers · paid',s.spent,'Conserved across all three accounts');
      rule='The parent allows compute and storage, at most 30 per payment. Propose a child budget, cap, and service below. A child must stay within its parent’s permission.';
      controls='<fieldset><legend>Propose a subcontract</legend>'+input('amount','Budget to reserve',d.amount)+input('cap','Per-payment cap',d.cap)+select('service','Permitted service',d.service,['compute','storage','unrestricted'])+button('delegate','Check and reserve')+'</fieldset><fieldset><legend>Request a child payment</legend>'+input('spend','Amount',d.spend)+select('spendService','Service',d.spendService,['compute','storage','unrestricted'])+button('spend','Check and pay')+button('revoke','Recover the remainder')+'</fieldset>';
    }else if(selected==='completion'){
      accounts=Object.entries(s.stores).map(([name,v])=>box(name,`${v.coins} coins · ${v.tools} tool · ${v.credits} credits`,({buyer:'Requires one tool',maker:'Requires four compute credits',provider:`Requires ${s.offers[2].minimum} coins${s.offers[2].active?'':' · withdrawn'}`})[name])).join('');
      rule=`Buyer offers eight coins for one tool. Maker offers one tool for four compute credits. Provider offers four credits for at least ${s.offers[2].minimum} coins. The solver must satisfy every included offer.`;
      controls=input('minimum','Provider minimum coins',d.minimum)+button('edit','Update provider terms')+button('toggle',s.offers[2].active?'Withdraw provider offer':'Restore provider offer')+button('solve','Find compatible offers')+(s.proposal?'<div class="experiment-proposal"><strong>Proposed transfers</strong><ul>'+s.proposal.transfers.map(t=>`<li>${esc(t.from)} → ${esc(t.to)}: ${t.amount} ${esc(t.asset)}</li>`).join('')+'</ul>'+button('settle','Validate and settle together')+'</div>':'');
    }else if(selected==='execution'){
      accounts=box('Shared payment output',s.available,s.winner?'Consumed':'Available to either valid settlement')+box('North',s.winner==='North'?12:0,'Provider A')+box('South',s.winner==='South'?12:0,'Provider B');
      rule='One payment of 12 units requires two integers from 1–15 with product 42 and sum 13. Both offers reference the same output. A second settlement must fail after the first consumes it.';
      controls=input('a','First setting',d.a)+input('b','Second setting',d.b)+button('settle','North submits this result','data-provider="North"')+button('settle','South submits this result','data-provider="South"');
    }else if(selected==='correction'){
      accounts=box('Committed bounty',s.reward,'Claim: x² ≥ 2x for every integer 0–10')+box('Finder · paid',s.paid,s.witness===null?'No accepted counterexample':`Accepted witness: ${s.witness}`);
      rule='The verifier checks that the supplied integer belongs to the stated domain and makes x² < 2x. The claim owner does not decide whether to pay.';
      controls=input('witness','Counterexample x',d.witness)+button('claim','Verify and claim the bounty');
    }else{
      accounts=box('Protected balance',s.budget,s.revoked?'Authority revoked':'Fixed supplier · cap 5')+box('Supplier · paid',s.spent,'Attacker receives zero');
      rule='Every permitted payment needs spending authorization, the fixed supplier output, and an amount no greater than five. The owner can revoke the spending path.';
      controls=input('amount','Proposed amount',d.amount)+select('recipient','Proposed recipient',d.recipient,['supplier','attacker'])+select('signer','Claimed signer · model only',d.signer,['agent','owner','none'])+button('submit','Evaluate the proposed payment')+button('revoke','Owner revokes access');
    }
    root.querySelector('[data-experiment-panel]').innerHTML=`<section aria-labelledby="experiment-title"><div class="experiment-heading"><div><p class="experiment-kicker">${esc(selected)} · model</p><h2 id="experiment-title">${esc(e.question)}</h2></div>${button('reset','Reset this model')}</div><div class="experiment-accounts">${accounts}</div><div class="experiment-rule"><span>Enforced in this model</span><p>${esc(rule)}</p></div><div class="experiment-controls">${controls}</div><div class="experiment-result" data-ok="${s.last?.ok??''}" role="status" aria-live="polite">${s.last?`<strong>${s.last.ok?'Model accepted':'Model rejected'}</strong><p>${esc(s.last.message)}</p>`:'Choose an action. Nothing happens automatically.'}</div><details class="experiment-details"><summary>Why crypto, and what is actually built?</summary><p>${esc(e.why)}</p><p>${esc(e.boundary)}</p><p>A trusted service could coordinate this under its own custody. The proposed advantage is verifiable control across independent parties. This page does not establish a Kaspa-specific performance advantage.</p></details><details class="experiment-details"><summary>Local audit · ${s.history.length} actions</summary><ol>${s.history.map(x=>`<li><strong>${x.ok?'Accepted':'Rejected'}</strong> ${esc(x.message)}</li>`).join('')}</ol></details></section>`;
  }
  root.addEventListener('click',event=>{
    const tab=event.target.closest('[data-select]');if(tab){selected=tab.dataset.select;history.replaceState(null,'','#'+selected);render();root.querySelector(`[data-select="${selected}"]`).focus();return;}
    const b=event.target.closest('[data-action]');if(!b)return;const action=b.dataset.action;
    const d=drafts[selected];let payload={...d,provider:b.dataset.provider};let actual=action;
    if(selected==='delegation'&&action==='spend')payload={amount:d.spend,service:d.spendService};
    if(selected==='completion'&&action==='toggle'){actual='edit';payload={active:!states[selected].offers[2].active};}
    states[selected]=action==='reset'?newExperiment(selected):transitionExperiment(states[selected],actual,payload);
    render();root.querySelector(b.dataset.provider?`[data-provider="${b.dataset.provider}"]`:`[data-action="${action}"]`)?.focus();
  });root.addEventListener('input',event=>{if(event.target.dataset.field)drafts[selected][event.target.dataset.field]=event.target.value;});render();
}
