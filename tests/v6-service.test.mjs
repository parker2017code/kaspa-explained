import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {V6Service} from '../server/v6-service.mjs';

// Orchestration boundaries only. Actual signatures, contracts and all 26
// journal derivations are exercised by check-v6-protocol-journey.mjs.
const hash=value=>createHash('sha256').update(value).digest('hex');
const identity={id:'20000000-0000-4000-8000-000000000006',capability:'bc'.repeat(32)};
const status=code=>error=>error.status===code;
function memoryStore(initial={}){
  const records=structuredClone(initial);let writes=0;
  return {records,get writes(){return writes;},async get(key){return structuredClone(records[key]);},async put(values){const serialized=JSON.stringify(values);writes++;Object.assign(records,JSON.parse(serialized));}};
}
function makeSession(extra={}){
  return {id:identity.id,capHash:hash(identity.capability),stage:'purchase-ready',chapter:0,completed:[],actions:{},receipts:[],attackEvidence:[],inventory:{},cells:{},scene:{},spentSompi:'0',pending:null,intent:null,...extra};
}
const request=(path,extra={})=>new Request('http://127.0.0.1:8915/api/v6/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...identity,...extra})});

test('V6 requires a complete native VM result before accepting a signed plan',async()=>{
  const service=new V6Service(),plan={transaction:{inputs:[{},{}]}};
  for(const result of [undefined,{}, {valid:true}, {valid:true,engine:'substitute',checkedInputs:2}, {valid:true,engine:'Kaspa TxScriptEngine',checkedInputs:1}, {valid:true,engine:'Kaspa TxScriptEngine',checkedInputs:'2'}]){
    service.vmCheck=async()=>result;
    await assert.rejects(service.vm(plan),status(503));
  }
  service.vmCheck=async()=>({valid:false,engine:'Kaspa TxScriptEngine',checkedInputs:0});
  await assert.rejects(service.vm(plan),status(409));
  service.vmCheck=async()=>({valid:true,engine:'Kaspa TxScriptEngine',checkedInputs:2});
  assert.equal((await service.vm(plan)).valid,true);
  await assert.rejects(service.vm({...plan,skipVm:true}),status(503));
  await assert.rejects(service.vm({}),status(503));
});

test('V6 does not record substitute or incomplete verifier results as an attack rejection',async()=>{
  const storage=memoryStore(),service=new V6Service({storage}),session=makeSession();
  for(const result of [undefined,{valid:false,engine:'substitute'}, {valid:false,engine:'Kaspa TxScriptEngine',checkedInputs:2,failedInput:2}]){
    service.vmCheck=async()=>result;
    await assert.rejects(service.attack(session,'rejection','purchase_attack',{hostPlan:{transaction:{inputs:[{}]}},rule:'test'}),status(503));
    assert.equal(session.attackEvidence.length,0);assert.equal(storage.writes,0);
  }
});

test('A missing recovery journal prevents persistence and broadcast',async()=>{
  const storage=memoryStore();let broadcasts=0,vmCalls=0;
  const service=new V6Service({storage,rpc:{submitTransaction:async()=>{broadcasts++;}}});
  service.vmCheck=async()=>{vmCalls++;return {valid:true};};
  const transaction={id:hash('signed fixture'),inputs:[{}],serializeToSafeJSON:()=>'{"fixture":true}',finalize(){}};
  await assert.rejects(service.persistPending(makeSession(),{plan:{transaction}},'missing-journal','purchase'),/no recoverable journal/);
  assert.equal(storage.writes,0);assert.equal(broadcasts,0);assert.equal(vmCalls,0);
});

test('Recovery rejects missing, unsupported, relabeled and state-tampered journals',async()=>{
  const service=new V6Service({sdk:{Transaction:{}}}),session=makeSession();
  const pending={phase:'purchase-setup',transaction:'signed',transactionId:hash('signed')};
  await assert.rejects(service.verifyJournal(session,pending),/no recoverable journal/);
  const base={kind:'v5-argent',id:pending.transactionId,transaction:'signed',inputStates:[],states:[]};
  for(const patch of [{kind:'unsupported'},{kind:'v6-proof'},{id:hash('changed')},{transaction:'changed'}]){
    await assert.rejects(service.verifyJournal(session,{...pending,journal:{...base,...patch}}),status(503));
  }
  const issuer=hash('issuer'),buyer=hash('buyer'),world=hash(`Sprout Harbor V6 business\nundefined\n${session.id}`);
  service.allRoles=()=>({treasury:{owner:issuer},buyer:{owner:buyer}});
  const expected={issuer,owner:buyer,world,tools:0};
  const descriptor={...pending,meta:{cell:{name:'buyer',state:expected}},journal:{...base,states:[{...expected,tools:1}]}};
  await assert.rejects(service.verifyJournal(session,descriptor),/output state changed/);
  await assert.rejects(service.verifyJournal(session,{...descriptor,journal:{...base,states:[{...expected,world:hash('another session')}]}}),/different issuer or session/);
});

test('Saved continuation requires its exact intent and step; pending retry keeps its identity',()=>{
  const service=new V6Service(),id=hash('saved intent'),session=makeSession({intent:{id,kind:'purchase-setup',index:1}}),key=`resume:${id}:1`;
  for(const payload of [undefined,null,{intentId:id,intentIndex:0},{intentId:hash('other intent'),intentIndex:1}])assert.throws(()=>service.validateIntentResume(session,key,payload),status(409));
  assert.throws(()=>service.validateIntentResume(session,'different-key',{intentId:id,intentIndex:1}),status(409));
  assert.doesNotThrow(()=>service.validateIntentResume(session,key,{intentId:id,intentIndex:1}));
  assert.doesNotThrow(()=>service.validateIntentResume({...session,pending:{transactionId:hash('same saved tx')}},'retry:saved:1',undefined));
});

test('Start retries a failed preparation after restart, then remains idempotent',async()=>{
  const storage=memoryStore();let attempts=0;
  const first=new V6Service({storage});
  first.startOperation=async()=>{attempts++;throw Error('temporary preparation failure');};
  assert.equal((await first.handle(request('start'))).status,503);
  const saved=storage.records[first.sessionKey(identity.id)];
  assert.equal(saved.actions.__start.status,'failed');assert.equal(saved.pending,null);
  const restarted=new V6Service({storage});
  restarted.startOperation=async session=>{attempts++;session.stage='purchase-ready';await restarted.save(session);};
  assert.equal((await restarted.handle(request('start'))).ok,true);
  assert.equal((await restarted.handle(request('start'))).ok,true);
  assert.equal(attempts,2);
  const publicResult=await (await restarted.handle(request('status'))).json();
  assert.equal(publicResult.session.id,identity.id);assert(!('capHash' in publicResult.session));assert(!('actions' in publicResult.session));
});

test('An action retries the same failed preparation once and rejects a reused key with changed intent',async()=>{
  const storage=memoryStore(),service=new V6Service({storage});let attempts=0;
  await service.save(makeSession({stage:'purchase-complete'}));
  service.advance=async session=>{attempts++;if(attempts===1)throw Error('temporary preparation failure');session.stage='pip-ready';};
  const action={requestId:'same-action',action:'continue'};
  assert.equal((await service.handle(request('action',action))).status,503);
  assert.equal((await service.handle(request('action',action))).ok,true);
  assert.equal((await service.handle(request('action',action))).ok,true);
  assert.equal(attempts,2);
  assert.equal((await service.handle(request('action',{...action,action:'purchase'}))).status,409);
  assert.equal(attempts,2);
});

test('Session and global treasury limits reject before writing a reservation',async()=>{
  const storage=memoryStore({'v6:budget':{allocatedSompi:'9999999999',reservedSompi:'0',sessions:{}}}),service=new V6Service({storage});
  await assert.rejects(service.reserve(makeSession({spentSompi:'800000000'}),1n),/8 tKAS/);
  await assert.rejects(service.reserve(makeSession(),2n),/allocation is full/);
  await assert.rejects(service.reserve(makeSession(),-1n),/Invalid V6 treasury debit/);
  assert.equal(storage.writes,0);
  const allowed=await service.reserve(makeSession(),1n);assert.equal(allowed.debit,1n);assert.equal(allowed.budget.reservedSompi,'1');
});

test('Status never retries a pending submission; explicit retry preserves bytes and reservation',async()=>{
  const txid=hash('saved transaction'),bytes='saved signed transaction',pending={id:hash('operation'),sessionId:identity.id,transactionId:txid,transaction:bytes,signedHash:hash(bytes),attempts:1,attemptedAt:0,status:'submitted',journal:{}};
  const budget={allocatedSompi:'0',reservedSompi:'10',sessions:{[identity.id]:{reservedSompi:'10',spentSompi:'0'}}};
  const session=makeSession({pending}),storage=memoryStore({state:{pending},'v6:budget':budget,['v6:session:'+identity.id]:session}),submitted=[];
  const tx={id:txid,finalize(){}};
  const sdk={Transaction:{deserializeFromSafeJSON(value){assert.equal(value,bytes);return tx;}}};
  const service=new V6Service({storage,sdk,now:()=>20000,rpc:{async submitTransaction({transaction}){submitted.push(transaction);return {transactionId:transaction.id};}}});
  // This case isolates retry accounting. Separate journal tests and the
  // actual SDK/VM journey validate the transaction and protocol derivation.
  service.verifyJournal=async()=>{};service.acceptedEvidence=async()=>({});
  assert.equal((await service.handle(request('status'))).status,202);assert.equal(submitted.length,0);
  const retry={action:'resume',requestId:'retry:same:1'};
  assert.equal((await service.handle(request('action',retry))).status,202);assert.equal(submitted.length,1);assert.equal(submitted[0],tx);
  assert.equal((await service.handle(request('action',retry))).status,202);assert.equal(submitted.length,1);
  assert.deepEqual(storage.records['v6:budget'],budget);
  assert.equal(storage.records['v6:session:'+identity.id].pending.transaction,bytes);
  assert.equal(storage.records['v6:session:'+identity.id].pending.attempts,2);
});

test('Durable session data normalizes SDK integer amounts before JSON storage',async()=>{
  const storage=memoryStore(),service=new V6Service({storage}),session=makeSession({cells:{buyer:{amount:30000000n}},scene:{amount:30000000n}});
  await service.save(session);
  assert.equal(storage.records[service.sessionKey(identity.id)].cells.buyer.amount,'30000000');
  assert.equal(storage.records[service.sessionKey(identity.id)].scene.amount,'30000000');
  assert.doesNotThrow(()=>JSON.stringify(service.publicSnapshot(session)));
});
