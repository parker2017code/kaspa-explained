// The geometry is a layout of observed hashes and parent links, not simulated mining.
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const HASH=/^[a-f0-9]{64}$/i;
export function mountV6Dag(root){
  root.classList.add('v6-dag');root.innerHTML='<div class="v6-dag-heading"><strong>Kaspa Testnet-10 · live blockDAG</strong><span data-dag-status>Connecting</span><button type="button" data-dag-zoom="out" aria-label="Zoom out of blockDAG">−</button><button type="button" data-dag-zoom="in" aria-label="Zoom in on blockDAG">+</button></div><svg viewBox="0 0 760 160" role="img" aria-label="Observed Kaspa blocks and their parent links"></svg><p class="v6-dag-note"></p>';
  const svg=root.querySelector('svg'),status=root.querySelector('[data-dag-status]'),note=root.querySelector('p'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let network={blocks:[]},transaction=null,zoom=1,frame=0,lastPaint=0,disposed=false,previousId=null,acceptedAt=0;
  root.addEventListener('click',e=>{const b=e.target.closest('[data-dag-zoom]');if(!b)return;zoom=Math.max(.5,Math.min(2.5,zoom*(b.dataset.dagZoom==='in'?1.2:1/1.2)));paint();});
  function paint(now=performance.now()){
    if(disposed)return;if(now-lastPaint<45&&!reduced.matches){schedule();return;}lastPaint=now;
    const all=(network.blocks||[]).filter(b=>HASH.test(b.hash||'')),blocks=all.slice(-Math.round(36/zoom)),positions=new Map(),latest=blocks.at(-1),base=latest?.observedAt||Date.now();
    // Event arrival positions drift smoothly until the next real notification.
    const drift=reduced.matches?0:Math.min(18,Math.max(0,Date.now()-base)/1000*10),step=28*zoom;
    blocks.forEach((b,i)=>positions.set(b.hash,{x:710-(blocks.length-1-i)*step-drift,y:30+(parseInt(b.hash.slice(0,4),16)%4)*28}));
    let links='',nodes='';for(const b of blocks){const p=positions.get(b.hash);for(const parent of b.parents||[]){const q=positions.get(parent);if(q)links+=`<path d="M${p.x} ${p.y} L${q.x} ${q.y}"/>`;}
      const active=transaction?.acceptingBlock===b.hash;nodes+=`<g class="${active?'is-accepting':''}" transform="translate(${p.x},${p.y})"><title>${esc(b.hash)} · DAA ${esc(b.daaScore)}${active?' · accepted this transaction':''}</title><rect x="-9" y="-7" width="18" height="14" rx="4"/><text y="20" text-anchor="middle">${esc(b.hash.slice(0,4))}</text></g>`;}
    let packet='';const accepted=HASH.test(transaction?.acceptingBlock||''),id=transaction?.transactionId||transaction?.id;
    if(HASH.test(id||'')){
      let end=positions.get(transaction.acceptingBlock);if(accepted&&!end){end={x:110,y:60};nodes+=`<g class="is-accepting pinned" transform="translate(110,60)"><title>Observed accepting block ${esc(transaction.acceptingBlock)}</title><rect x="-14" y="-12" width="28" height="24" rx="5"/><text y="29" text-anchor="middle">${esc(transaction.acceptingBlock.slice(0,8))}</text></g>`;}
      const u=accepted?(reduced.matches?1:Math.min(1,(Date.now()-acceptedAt)/1200)):0,x=accepted?34+(end.x-34)*u:34,y=accepted?132+(end.y-132)*u:132;
      packet=`<g class="v6-dag-transaction"><path d="M34 132 ${accepted?'L'+end.x+' '+end.y:'L130 132'}"/><circle cx="${x}" cy="${y}" r="5"/><text x="145" y="137">${accepted?'Transaction accepted':'Signed transaction · awaiting acceptance'}</text></g>`;
    }
    svg.innerHTML=`<g class="v6-dag-links">${links}</g><g class="v6-dag-blocks">${nodes}</g>${packet}`;
    const stale=network.status!=='live'||Date.now()-(network.lastEventAt||0)>10000;status.textContent=stale?(network.status==='disconnected'?'Reconnecting':network.status==='stale'?'Waiting for fresh blocks':'Connecting'):'Live';status.dataset.live=String(!stale);
    note.innerHTML=accepted?`Accepted by block <code>${esc(transaction.acceptingBlock.slice(0,12))}…</code> · <a href="https://tn10.kaspa.stream/transactions/${esc(id)}" target="_blank" rel="noopener">Inspect this transaction ↗</a>`:'Real hashes and observed parent links. Positions illustrate arrival order; animation does not create blocks.';
    if(!document.hidden&&!reduced.matches&&((!stale&&Date.now()-base<2000)||(accepted&&Date.now()-acceptedAt<1300)))schedule();
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(t=>{frame=0;paint(t);});}
  return {update(n,t){network=n||network;transaction=t||null;const id=transaction?.transactionId||transaction?.id;if(id!==previousId){previousId=id;acceptedAt=transaction?.acceptingBlock?Date.now():0;}else if(transaction?.acceptingBlock&&!acceptedAt)acceptedAt=Date.now();paint();},destroy(){disposed=true;cancelAnimationFrame(frame);root.replaceChildren();}};
}
