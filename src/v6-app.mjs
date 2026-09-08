import {mountV6UI} from './v6-ui.mjs';
import {mountV6World} from './v6-world.mjs';
import {mountV6Dag} from './v6-dag.mjs';
import {v6PublicView,v6StageAction} from './v6-progress.mjs';

const root=document.querySelector('[data-v6-app]');
if(root){
  document.body.classList.add('v6-page');
  const KEY='kaspa-v6-local-session-v1', reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let credentials=null,session=null,network={status:'connecting',blocks:[]},busy=false,refreshing=false,intentPaused=false,error=null,disposed=false,world=null,dag=null,ui=null,events=null,pollTimer=null,intentTimer=null,eventRetryTimer=null,idleTimer=null,inspectChapter=null,consequenceUntil=0,renderTimer=null,arrivalTimer=null,acceptancePresentation=null,worldError=null,lastActivity=Date.now(),eventRetryMs=2000;
  const TRANSPORT_IDLE_MS=5*60*1000;
  try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved&&/^[a-f0-9-]{36}$/i.test(saved.id)&&/^[a-f0-9]{64}$/.test(saved.capability)){credentials=saved;if(saved.snapshot?.id===saved.id)session=saved.snapshot;}}catch{error='This browser could not read the saved local session.';}
  function save(){localStorage.setItem(KEY,JSON.stringify(credentials));}
  function newCredentials(){const bytes=crypto.getRandomValues(new Uint8Array(32));credentials={id:crypto.randomUUID(),capability:[...bytes].map(b=>b.toString(16).padStart(2,'0')).join(''),inflight:null};save();}
  const resolving=()=>Boolean(credentials?.inflight||session?.pending||session?.intent?.id);
  const incomplete=()=>Boolean(credentials&&(session?.stage!=='complete'||resolving()));
  const transportActive=()=>!disposed&&!document.hidden&&incomplete()&&Date.now()-lastActivity<TRANSPORT_IDLE_MS;
  function stopEvents(){clearTimeout(eventRetryTimer);eventRetryTimer=null;if(events){events.close();events=null;}}
  function stopBackground(){clearTimeout(pollTimer);pollTimer=null;clearTimeout(idleTimer);idleTimer=null;stopEvents();}
  function scheduleIdle(){clearTimeout(idleTimer);idleTimer=null;if(!transportActive())return;idleTimer=setTimeout(()=>{idleTimer=null;stopBackground();render();},Math.max(1,TRANSPORT_IDLE_MS-(Date.now()-lastActivity)));}
  function connectEvents(){
    if(typeof EventSource==='undefined'||events||eventRetryTimer||!transportActive())return;
    events=new EventSource('/api/v6/events');
    events.onopen=()=>{eventRetryMs=2000;};
    events.onmessage=event=>{try{const next=JSON.parse(event.data);if(next.network!=='testnet-10'||!Array.isArray(next.blocks))return;network=next;dag?.update(network,session?.operation,acceptancePresentation);const status=root.querySelector('[data-v6-network-status]');if(status)status.textContent=next.status==='live'?'Testnet-10 · live blocks':'Testnet-10 · '+next.status;}catch{}};
    events.onerror=()=>{network={...network,status:'disconnected'};dag?.update(network,session?.operation,acceptancePresentation);stopEvents();if(!transportActive())return;const delay=eventRetryMs;eventRetryMs=Math.min(60000,eventRetryMs*2);eventRetryTimer=setTimeout(()=>{eventRetryTimer=null;connectEvents();},delay);};
  }
  function resumeBackground(){if(!transportActive()){stopBackground();return;}connectEvents();schedulePoll();scheduleIdle();}
  function userActivity(){lastActivity=Date.now();eventRetryMs=2000;resumeBackground();}
  function render(){
    if(disposed||!ui)return;
    const pausing=Date.now()<consequenceUntil,view=v6PublicView(session,{busy:busy||pausing,error:error||worldError,network,inspectChapter});
    if(pausing&&!busy)view.actionLabel='Watch what changed…';
    const holding=acceptancePresentation&&Date.now()<acceptancePresentation.arrivesAt&&!document.hidden&&!reduced.matches;
    ui.render(view);world?.update({... (holding?acceptancePresentation.beforeScene:view.scene),paused:document.hidden});dag?.update(network,view.operation,acceptancePresentation);
  }
  async function request(path,body){
    const response=await fetch('/api/v6/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(90000)});
    let data;try{data=await response.json();}catch{throw Error('The workshop service did not return a session. Retry in a moment.');}
    if(!response.ok){const failure=Error(data.error||'The workshop operation could not complete.');failure.status=response.status;throw failure;}
    if(!data.session)throw Error('The workshop service returned no saved session.');
    return data.session;
  }
  function receive(next){
    if(session&&Number.isSafeInteger(next.revision)&&Number.isSafeInteger(session.revision)&&next.revision<session.revision)return;
    const oldId=session?.operation?.transactionId,oldAccepted=session?.operation?.acceptingBlock;
    if(next.operation?.phase==='accepted'&&next.operation.acceptingBlock&&(next.operation.transactionId!==oldId||!oldAccepted)&&session&&!reduced.matches&&!document.hidden){
      const startedAt=Date.now();
      acceptancePresentation={freshAcceptance:true,transactionId:next.operation.transactionId,acceptingBlock:next.operation.acceptingBlock,startedAt,arrivesAt:startedAt+1200,beforeScene:v6PublicView(session,{network}).scene};
      // Leave time for DAG arrival (1.2s), then the longest world transfer (3s).
      consequenceUntil=startedAt+4400;clearTimeout(arrivalTimer);arrivalTimer=setTimeout(render,1250);clearTimeout(renderTimer);renderTimer=setTimeout(render,4450);
    }
    session=next;
    if(credentials){credentials.snapshot=next;try{save();}catch{error='The current result is visible, but this browser could not save its local recovery view.';}}
    if(!incomplete())stopBackground();else resumeBackground();
    render();
  }
  async function act(type,payload={}){
    if(busy||Date.now()<consequenceUntil)return;
    if(type!=='resume_intent')userActivity();
    if(type!=='resume_intent')intentPaused=false;
    if(type==='freeplay'){inspectChapter=session?.chapter??5;render();return;}
    if(type==='replay'){inspectChapter=Number(payload.chapter??session?.chapter??0);render();return;}
    if(inspectChapter!==null&&type==='primary'){inspectChapter=null;render();return;}
    if(type==='refresh'||(type==='primary'&&session?.pending)){await refresh();return;}
    busy=true;error=null;render();
    try{
      if(!credentials)newCredentials();
      let operation=credentials.inflight;
      if(!operation){
        const action=type==='retry_submission'?'resume':type==='try_attack'?payload.action:type==='continue'?'continue':v6StageAction(session).action;
        if(action==='refresh'){busy=false;await refresh();return;}
        const intent=session?.intent;
        const savedQueue=intent?.id&&!session?.pending;
        const retry=type==='retry_submission'&&session?.pending?.retryable;
        operation=session?{path:'action',body:{id:credentials.id,capability:credentials.capability,
          requestId:savedQueue?`resume:${intent.id}:${intent.index}`:retry?`retry:${session.pending.transactionId}:${session.pending.attempts}`:crypto.randomUUID(),
          action:savedQueue||retry?'resume':action,
          ...(savedQueue?{payload:{intentId:intent.id,intentIndex:intent.index}}:{})}}:{path:'start',body:{id:credentials.id,capability:credentials.capability}};
        credentials.inflight=operation;save();
      }
      const next=await request(operation.path,operation.body);
      credentials.inflight=null;save();receive(next);
    }catch(failure){
      // Preserve the identical request across uncertain responses. Never turn a
      // retry into a second authorization with a new request ID.
      error=failure.name==='TimeoutError'?'The response timed out. The saved transaction may still be pending. Retry resumes the same request.':failure.message;
      intentPaused=true;
      if(failure.status&&failure.status<500){credentials.inflight=null;save();}
    }finally{busy=false;render();resumeBackground();scheduleIntent();}
  }
  function scheduleIntent(){
    clearTimeout(intentTimer);
    if(disposed||busy||intentPaused||!session?.intent?.id||session.pending)return;
    // Start/Continue saved this finite setup queue on the host. Resume only
    // its identified next step; never advance a lesson action automatically.
    intentTimer=setTimeout(()=>void act('resume_intent'),Math.max(50,consequenceUntil-Date.now()+50));
  }
  async function refresh(){
    if(!credentials||busy||refreshing||disposed)return;
    refreshing=true;
    try{const next=await request('status',{id:credentials.id,capability:credentials.capability});if(!intentPaused)error=null;receive(next);}catch(failure){if(failure.status!==404)error=failure.message;render();}
    finally{refreshing=false;resumeBackground();scheduleIntent();}
  }
  function schedulePoll(){clearTimeout(pollTimer);pollTimer=null;if(!transportActive())return;pollTimer=setTimeout(refresh,session?.pending||session?.stage==='courier-wait'?1500:6000);}
  ui=mountV6UI(root,{onAction:act,onChapter:chapter=>{userActivity();inspectChapter=chapter===session?.chapter?null:chapter;render();world?.select(chapter);},onDagReady:node=>{dag=mountV6Dag(node);dag.update(network,session?.operation,acceptancePresentation);},onSceneReady:node=>{
    node.querySelector('[data-v6-scene-placeholder]')?.remove();
    void mountV6World(node,{onSelect:district=>{userActivity();const map={market:0,agent:1,terrarium:3,coordination:4,computation:5};const chapter=map[district];if(chapter!==undefined){inspectChapter=chapter===session?.chapter?null:chapter;render();}},onInspect:()=>{}}).then(value=>{if(disposed){value.destroy();return;}world=value;render();}).catch(()=>{worldError='The 3D harbor could not load. The guide and transaction receipts remain available.';render();});
  }});
  render();
  if(credentials&&incomplete()){resumeBackground();void refresh();}
  const onVisible=()=>{if(document.hidden){acceptancePresentation=null;consequenceUntil=0;clearTimeout(arrivalTimer);clearTimeout(renderTimer);render();stopBackground();return;}render();if(incomplete()){userActivity();void refresh();}};
  document.addEventListener('visibilitychange',onVisible);
  window.addEventListener('pagehide',()=>{disposed=true;stopBackground();clearTimeout(intentTimer);clearTimeout(arrivalTimer);clearTimeout(renderTimer);world?.destroy();dag?.destroy();ui?.destroy();document.removeEventListener('visibilitychange',onVisible);},{once:true});
}
