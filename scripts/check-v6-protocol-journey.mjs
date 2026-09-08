// Actual SDK plans and native script VM; the RPC/UTXO set is synthetic.
// No real addresses are funded and no network request is made by this harness.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {V5Service} from '../faucet/v5-service.mjs';
import {V6Service} from '../server/v6-service.mjs';
import {v6StageAction} from '../src/v6-progress.mjs';
import {checkV6Script} from '../server/v6-vm.mjs';

const sdk=createRequire(import.meta.url)('../.cache/upstream/kaspa-wasm32-sdk/nodejs/kaspa');
const read=async path=>JSON.parse(await readFile(new URL(path,import.meta.url),'utf8'));
const argentTemplates=await read('../src/v5-argent-templates.json'),advancedTemplates=await read('../src/v5-advanced-templates.json'),launchTemplate=(await read('../.cache/public-templates/templates.json')).templates.launch;
let proofTemplates;try{proofTemplates=await read('../src/v6-proof-templates.json');}catch(error){if(error.code!=='ENOENT')throw error;}
const digest=s=>createHash('sha256').update(s).digest('hex'),key=new sdk.PrivateKey('01'.repeat(32)),address=key.toAddress('testnet-10').toString();
const records=new Map(),utxos=new Map(),accepted=[],broadcasts=[],checks=[];
const storage={async get(k){return structuredClone(records.get(k));},async put(values){for(const[k,v]of Object.entries(JSON.parse(JSON.stringify(values))))records.set(k,v);}};
let daa=100000n;
const outpointId=o=>o.transactionId+':'+o.index;
function addOutput(transactionId,index,value,scriptPublicKey,covenantId=null){
  const entry=new sdk.UtxoEntries([{outpoint:{transactionId,index},amount:BigInt(value),scriptPublicKey,blockDaaScore:daa,isCoinbase:false,...(covenantId?{covenant_id:covenantId}:{})}]).items[0];
  utxos.set(outpointId(entry.outpoint),entry);
}
addOutput(digest('unfunded synthetic reserve'),0,100000000000n,sdk.payToAddressScript(new sdk.Address(address)));
const initialSink=digest('synthetic accepting chain anchor');
const rpc={
  async getServerInfo(){daa+=50n;return{networkId:'testnet-10',isSynced:true,hasUtxoIndex:true,virtualDaaScore:daa};},
  async getFeeEstimate(){return{estimate:{priorityBucket:{feerate:100}}};},
  async getSink(){return{sink:accepted.at(-1)?.acceptingBlockHash||initialSink};},
  async getUtxosByAddresses(addresses){
    assert(Array.isArray(addresses)&&addresses.every(a=>typeof a==='string'&&a.startsWith('kaspatest:')),'RPC addresses must be actual Testnet strings');
    const scripts=new Set(addresses.map(a=>sdk.payToAddressScript(new sdk.Address(a)).script));
    return{entries:[...utxos.values()].filter(e=>scripts.has(e.entry.scriptPublicKey.script))};
  },
  async getVirtualChainFromBlock({startHash}){
    const index=startHash===initialSink?-1:accepted.findIndex(a=>a.acceptingBlockHash===startHash);
    assert(index>=0||startHash===initialSink,'acceptance must start at a known checkpoint');
    const groups=accepted.slice(index+1);return{removedChainBlockHashes:[],addedChainBlockHashes:groups.map(g=>g.acceptingBlockHash),acceptedTransactionIds:groups};
  },
  async submitTransaction({transaction:tx}){
    tx.finalize();
    if(accepted.some(g=>g.acceptedTransactionIds.includes(tx.id)))return{transactionId:tx.id};
    const check=await checkV6Script(tx);assert.equal(check.valid,true,'broadcast must pass the actual Kaspa VM: '+JSON.stringify(check));
    for(const input of tx.inputs){const found=utxos.get(outpointId(input.previousOutpoint));assert(found,'input is currently unspent');assert.equal(found.amount,input.utxo.amount,'exact input value');assert.equal(found.entry.scriptPublicKey.script,input.utxo.entry.scriptPublicKey.script,'exact input script');assert.equal(found.entry.covenantId?.toString(),input.utxo.entry.covenantId?.toString(),'exact input lineage');}
    const total=tx.inputs.reduce((n,i)=>n+i.utxo.amount,0n),output=tx.outputs.reduce((n,o)=>n+o.value,0n);assert(total>output,'a positive actual fee is paid');
    tx.inputs.forEach(i=>utxos.delete(outpointId(i.previousOutpoint)));daa+=1n;
    tx.outputs.forEach((o,i)=>addOutput(tx.id,i,o.value,o.scriptPublicKey,o.covenant?.covenantId?.toString()));
    const block=digest('synthetic block for '+tx.id);accepted.push({acceptingBlockHash:block,acceptedTransactionIds:[tx.id]});broadcasts.push({transactionId:tx.id,feeSompi:String(total-output),acceptingBlock:block,checkedInputs:check.checkedInputs});
    return{transactionId:tx.id};
  },
};
const host=new V5Service({storage,env:{FAUCET_KEY:'01'.repeat(32)},sdk,rpc,key,address,entries:[],argentTemplates,advancedTemplates});
host.checkV6Script=async tx=>{const r=await checkV6Script(tx);checks.push({transactionId:tx.id,valid:r.valid,failedInput:r.failedInput,error:r.error});if(!r.valid)console.error(JSON.stringify({vmRejection:r}));return r;};
const service=new V6Service({host,storage,sdk,rpc,key,address,argentTemplates,advancedTemplates,launchTemplate,proofTemplates});
const identity={id:'10000000-0000-4000-8000-000000000006',capability:'ab'.repeat(32)};
let counter=0;
async function send(path,extra={}){
  const response=await service.handle(new Request('http://127.0.0.1:8915/api/v6/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...identity,...extra})}));
  const body=await response.json();if(!response.ok)throw Error(`${path}/${extra.action||''}: HTTP ${response.status} ${body.error}`);
  assert(body.session,'session snapshot required');return body.session;
}
let session=await send('start');
const seen=[];
for(let i=0;i<140&&session.stage!=='complete';i++){
  seen.push(session.stage);
  if(session.pending){const before=broadcasts.length;session=await send('status');assert.equal(broadcasts.length,before,'status must never sign or broadcast');continue;}
  let action;
  if(session.intent)action='resume';
  else if(session.stage==='purchase-ready'&&!session.attackEvidence.some(e=>e.action==='purchase_attack'))action='purchase_attack';
  else if(session.stage==='ring-ready'&&!session.attackEvidence.some(e=>e.action==='ring_attack'))action='ring_attack';
  else if(session.stage==='coord-ready'&&!session.attackEvidence.some(e=>e.action==='coord_attack'))action='coord_attack';
  else action=v6StageAction(session).action;
  if(action==='refresh'){session=await send('status');continue;}
  const requestId=session.intent?.id?`resume:${session.intent.id}:${session.intent.index}`:'fixture-'+(++counter),extra={action,requestId,...(session.intent?.id?{payload:{intentId:session.intent.id,intentIndex:session.intent.index}}:{})};
  session=await send('action',extra);const before=broadcasts.length;
  const replay=await send('action',extra);assert.equal(broadcasts.length,before,'an identical request cannot start another transaction');
  session=replay;
  console.log(JSON.stringify({step:i,action,stage:session.stage,pending:Boolean(session.pending),receipts:session.receipts.length}));
}
assert.equal(session.stage,'complete','all six protocol chapters must finish');assert.deepEqual(session.completed,[0,1,2,3,4,5]);
assert.equal(session.inventory.buyer.tools,1);assert.equal(session.inventory.buyer.wood,1);assert.equal(session.inventory.buyer.crops,2);
assert.equal(session.inventory.grower.ore,2);assert.equal(session.inventory.toolmaker.crops,3);assert.equal(session.inventory.miner.tools,1);
assert(session.attackEvidence.length>=5,'purchase, Pip, ring, coordination and proof rejections are observed');
assert(checks.some(c=>!c.valid),'adversarial proposals actually reach the VM');
assert.equal((await storage.get('state')).pending,null);assert(BigInt(session.spentSompi)<=800000000n);
await mkdir('.cache/v6-qa',{recursive:true});await writeFile('.cache/v6-qa/protocol-journey.json',JSON.stringify({scope:'Actual SDK and native Kaspa VM; synthetic RPC, UTXOs and accepting blocks; no funded accounts or network submissions',checkedAt:new Date().toISOString(),stages:seen,broadcasts,checks,session},null,2));
console.log(JSON.stringify({complete:true,receipts:broadcasts.length,vmChecks:checks.length,spentSompi:session.spentSompi}));
