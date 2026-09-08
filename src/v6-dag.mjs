// The geometry is a layout of observed hashes and parent links, not simulated mining.
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const HASH=/^[a-f0-9]{64}$/i;
export function mountV6Dag(root){
  root.classList.add('v6-dag');root.innerHTML='<div class="v6-dag-heading"><strong>Kaspa Testnet-10 · live blockDAG</strong><span data-dag-status>Connecting</span><button type="button" data-dag-zoom="out" aria-label="Zoom out of blockDAG">−</button><button type="button" data-dag-zoom="in" aria-label="Zoom in on blockDAG">+</button></div><svg viewBox="0 0 760 160" role="img" aria-label="Observed Kaspa blocks and their parent links"></svg><p class="v6-dag-note"></p>';
  const svg=root.querySelector('svg'),status=root.querySelector('[data-dag-status]'),note=root.querySelector('p'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let network={blocks:[]},transaction=null,presentation=null,zoom=1,frame=0,lastPaint=0,disposed=false;
  root.addEventListener('click',e=>{const b=e.target.closest('[data-dag-zoom]');if(!b)return;zoom=Math.max(.5,Math.min(2.5,zoom*(b.dataset.dagZoom==='in'?1.2:1/1.2)));paint();});
  function paint(now=performance.now()){
    if(disposed)return;if(now-lastPaint<45&&!reduced.matches){schedule();return;}lastPaint=now;
    const all=(network.blocks||[]).filter(b=>HASH.test(b.hash||'')),blocks=all.slice(-Math.round(36/zoom)),positions=new Map(),latest=blocks.at(-1),base=latest?.observedAt||Date.now();
    // Event arrival positions drift smoothly until the next real notification.
    const drift=reduced.matches?0:Math.min(18,Math.max(0,Date.now()-base)/1000*10),step=28*zoom;
    blocks.forEach((b,i)=>positions.set(b.hash,{x:710-(blocks.length-1-i)*step-drift,y:30+(parseInt(b.hash.slice(0,4),16)%4)*28}));
    let links='',nodes='';for(const b of blocks){const p=positions.get(b.hash);for(const parent of b.parents||[]){const q=positions.get(parent);if(q)links+=`<path d="M${p.x} ${p.y} L${q.x} ${q.y}"/>`;}
      const active=transaction?.acceptingBlock===b.hash;nodes+=`<g class="${active?'is-accepting':''}" transform="translate(${p.x},${p.y})"><title>${esc(b.hash)} · DAA ${esc(b.daaScore)}${active?' · accepted this transaction':''}</title><rect x="-9" y="-7" width="18" height="14" rx="4"/><text y="20" text-anchor="middle">${esc(b.hash.slice(0,4))}</text></g>`;}
    let packet='';const accepted=HASH.test(transaction?.acceptingBlock||''),id=transaction?.transactionId||transaction?.id,
      presenting=accepted&&presentation?.transactionId===id&&Number.isFinite(presentation.startedAt)&&Date.now()-presentation.startedAt<3000&&!document.hidden&&!reduced.matches;
    if(HASH.test(id||'')){
      let end=positions.get(transaction.acceptingBlock);if(presenting&&!end){end={x:650,y:60};nodes+=`<g class="is-accepting pinned" transform="translate(${end.x},${end.y})"><title>Observed accepting block ${esc(transaction.acceptingBlock)}</title><rect x="-14" y="-12" width="28" height="24" rx="5"/><text y="29" text-anchor="middle">${esc(transaction.acceptingBlock.slice(0,8))}</text></g>`;}
      if(!accepted){packet='<g class="v6-dag-transaction"><path d="M34 132 L150 132" style="stroke-width:2.5"/><circle cx="150" cy="132" r="7"/><text x="24" y="155" style="font:600 14px system-ui">Sender → submitted</text><text x="175" y="137" style="font:13px system-ui">Awaiting observed acceptance</text></g>';}
      else if(presenting){const u=Math.min(1,(Date.now()-presentation.startedAt)/1200),x=150+(end.x-150)*u,y=132+(end.y-132)*u;packet=`<g class="v6-dag-transaction"><path d="M34 132 L150 132 L${end.x} ${end.y}" style="stroke-width:2.5"/><circle cx="${x}" cy="${y}" r="7"/><text x="24" y="155" style="font:600 14px system-ui">Sender → submitted</text><text x="175" y="137" style="font:600 13px system-ui">Observed block → recipient consequence</text></g>`;}
    }
    svg.innerHTML=`<g class="v6-dag-links">${links}</g><g class="v6-dag-blocks">${nodes}</g>${packet}`;
    const stale=network.status!=='live'||Date.now()-(network.lastEventAt||0)>10000;status.textContent=stale?(network.status==='disconnected'?'Reconnecting':network.status==='stale'?'Waiting for fresh blocks':'Connecting'):'Live';status.dataset.live=String(!stale);
    note.innerHTML=accepted?`Accepted by block <code>${esc(transaction.acceptingBlock.slice(0,12))}…</code> · <a href="https://tn10.kaspa.stream/transactions/${esc(id)}" target="_blank" rel="noopener">Inspect this transaction ↗</a>`:'Real hashes and observed parent links. Positions illustrate arrival order; animation does not create blocks.';
    if(!document.hidden&&!reduced.matches&&((!stale&&Date.now()-base<2000)||presenting))schedule();
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(t=>{frame=0;paint(t);});}
  return {update(n,t,meta=null){network=n||network;transaction=t||null;presentation=meta?.freshAcceptance?meta:null;paint();},destroy(){disposed=true;cancelAnimationFrame(frame);root.replaceChildren();}};
}
