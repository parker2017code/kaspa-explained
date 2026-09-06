import {attachRecovery} from './recovery-app.mjs';
import {formatKas} from './models.mjs';
const root=document.querySelector('[data-testnet]');
const q=selector=>root.querySelector(selector),esc=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const amount=value=>formatKas(value).replace(' KAS',' tKAS');
let capability,review,receipt,busy=false;
const say=message=>q('[data-test-message]').textContent=message;
async function api(action,body={}){
  if(!capability){const response=await fetch('/api/session');if(!response.ok)throw new Error('Open this site through its local preview.');capability=(await response.json()).capability;}
  const response=await fetch(`/api/testnet/${action}`,{method:'POST',headers:{'Content-Type':'application/json','X-Lab-Capability':capability},body:JSON.stringify(body),signal:AbortSignal.timeout(30000)});
  const result=await response.json();if(!response.ok)throw new Error(result.error||'Testnet unavailable.');return result;
}
async function run(action){if(busy)return;busy=true;root.setAttribute('aria-busy','true');const picker=q('[data-request-picker]');picker.disabled=true;try{await action();}catch(error){say(error.name==='TimeoutError'?'The request timed out. Do not resend. Refresh and check its receipt first.':error.message);}finally{busy=false;picker.disabled=false;root.removeAttribute('aria-busy');}}
function selectRequest(){review=null;q('[data-test-review-result]').innerHTML='<p>Review the exact transaction before signing.</p>';for(const key of ['review','receipt'])q(`[data-test-${key}]`).disabled=!q('[data-request-picker]').value;q('[data-test-receipt-result]').hidden=true;}
async function refresh(){
  say('Checking Testnet-10…');const result=await api('status');q('[data-test-account]').hidden=false;q('[data-test-tools]').hidden=!result.connected;q('[data-test-address]').value=result.address;q('[data-test-balance]').textContent=result.connected?amount(result.balance):'Unavailable';q('[data-test-connect]').textContent='Refresh balance';
  const picker=q('[data-request-picker]'),previous=picker.value;
  picker.innerHTML='<option value="">Choose a request</option>'+result.requests.map(request=>`<option value="${esc(request.id)}">${esc(amount(request.amount))} · ${esc(request.id.slice(0,8))}${Date.parse(request.expires)<Date.now()?' · expired':''}</option>`).join('');
  picker.value=result.requests.some(r=>r.id===previous)?previous:result.requests.at(-1)?.id||'';selectRequest();
  say(result.connected?`Testnet-10 connected. ${amount(result.spent)} of the total limit reserved or spent. ${result.transactions.some(t=>t.state!=='accepted')?'A previous submission still needs its receipt checked.':''}`:result.error);
}
q('[data-test-connect]').addEventListener('click',()=>run(refresh));
q('[data-copy-address]').addEventListener('click',()=>run(async()=>{try{await navigator.clipboard.writeText(q('[data-test-address]').value);say('Testnet address copied.');}catch{q('[data-test-address]').select();say('Select and copy the address above.');}}));
q('[data-request-picker]').addEventListener('change',selectRequest);
q('[data-request-form]').addEventListener('submit',event=>{event.preventDefault();run(async()=>{const request=await api('request',{amount:new FormData(event.target).get('amount')});await refresh();q('[data-request-picker]').value=request.id;selectRequest();say('Request created. Review a workshop payment to test its complete receipt.');});});
q('[data-test-review]').addEventListener('click',()=>run(async()=>{
  const requestId=q('[data-request-picker]').value;const result=await api('review',{requestId});if(q('[data-request-picker]').value!==requestId)return;review=result;
  q('[data-test-review-result]').innerHTML=`<h3>Review before signing</h3><p>Testnet-10 · disposable local wallet</p><dl class="record-fields">${[['Payment',amount(review.amount)],['Fee',amount(review.fee)],['Input',amount(review.input)],['Change',amount(review.change)],['To',review.destination]].map(([label,value])=>`<div><dt>${label}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl><p class="small">This review expires in 60 seconds. Approval signs and submits one real testnet transaction.</p><button class="primary-button" data-approve-payment>Approve and send ${esc(amount(review.amount))}</button><details class="detail"><summary>Inspect the unsigned transaction</summary><pre>${esc(JSON.stringify(review.transaction,null,2))}</pre></details>`;
  q('[data-approve-payment]').addEventListener('click',()=>run(async()=>{const token=review?.token;if(!token)return;review=null;q('[data-approve-payment]').disabled=true;const result=await api('submit',{token});q('[data-test-review-result]').innerHTML=`<h3>${result.state==='submitted'?'Submitted':'Submission uncertain'}</h3><p class="record-id">${esc(result.id)}</p><p>Check the receipt. Do not submit another payment to resolve an uncertain response.</p>`;say('Submission recorded. Its transaction ID is retained locally.');}));
  say('Check the amount, destination, and fee. Nothing has been signed.');
}));
q('[data-test-receipt]').addEventListener('click',()=>run(async()=>{
  receipt=await api('receipt',{requestId:q('[data-request-picker]').value});
  const result=q('[data-test-receipt-result]');result.hidden=false;
  result.innerHTML=`<h2>${esc(receipt.state)}</h2><dl class="record-fields">${[['Network',receipt.network],['Requested',amount(receipt.requested)],['Matching unspent amount',amount(receipt.received)],['Checked',receipt.checked],['Transaction ID',receipt.transaction?.id||'No locally submitted transaction'],['Accepting block',receipt.acceptingBlock||'Not verified']].map(([label,value])=>`<div><dt>${label}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl><p>${esc(receipt.limitation)}</p><button class="quiet-button" data-save-receipt>Download receipt</button><details class="detail"><summary>Inspect the receipt data</summary><pre>${esc(JSON.stringify(receipt,null,2))}</pre></details>`;
  q('[data-save-receipt]').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(receipt,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download=`testnet-10-receipt-${receipt.requestId}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  attachRecovery(result,receipt.transaction,{api,run,say});
  say(receipt.acceptingBlock?'Acceptance observed. This is not a finality guarantee.':'Receipt checked. No verified acceptance is being claimed.');
}));
