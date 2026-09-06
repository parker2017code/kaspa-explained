import {formatKas} from './models.mjs';
const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const money=value=>formatKas(value).replace(' KAS',' tKAS');

// An absent receipt never authorizes a replacement payment. Recovery submits
// only the journaled signed bytes, with a fresh, single-use review token.
export function attachRecovery(target,transaction,{api,run,say}){
  if(!transaction||transaction.state==='accepted')return;
  const panel=document.createElement('section');panel.className='recovery-panel';
  panel.innerHTML=transaction.recovery==='unavailable'
    ? '<h3>Keep this transaction under review</h3><p>This older record has no saved signed transaction. Its spending reservation remains in place. Investigate the transaction locally before making another payment.</p>'
    : '<h3>If the submission response was lost</h3><p>Check acceptance first. If it is still unresolved, you can review a resend of the identical signed transaction. This does not create a second payment or change its fee.</p><button class="quiet-button" data-recovery-review>Review the saved transaction</button><div data-recovery-result></div>';
  target.append(panel);
  panel.querySelector('[data-recovery-review]')?.addEventListener('click',()=>run(async()=>{
    const review=await api('recovery-review',{transactionId:transaction.id});
    const result=panel.querySelector('[data-recovery-result]');
    result.innerHTML=`<h3>Resend the same transaction</h3><p class="record-id">${esc(review.id)}</p><dl class="record-fields"><div><dt>Amount</dt><dd>${money(review.amount)}</dd></div><div><dt>Fee</dt><dd>${money(review.fee)}</dd></div></dl><p>${esc(review.message)}</p><details class="detail"><summary>Inspect the saved signed transaction</summary><pre>${esc(JSON.stringify(review.transaction,null,2))}</pre></details><button class="primary-button" data-recovery-approve>Approve identical resend</button>`;
    result.querySelector('[data-recovery-approve]').addEventListener('click',()=>run(async()=>{
      result.querySelector('[data-recovery-approve]').disabled=true;
      const submitted=await api('recovery-submit',{token:review.token});
      result.innerHTML=`<p>${submitted.state==='submitted'?'The node received the saved transaction.':'The response remains uncertain.'} Check its receipt again. The original spending reservation is unchanged.</p>`;
      say('Recovery attempt saved. Check acceptance before any new payment.');
    }));
    say('Review the saved transaction. It has not been resent.');
  }));
}
