import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {webcrypto} from 'node:crypto';
import {v5DeliveryInitialState, instantiateV5Delivery, buildV5DeliveryOpen, buildV5DeliveryRelease, buildV5DeliveryRefund, v5DeliveryReceiptDigest, signV5DeliveryPlan, v5DeliveryWirePlan, v5DeliveryJournal, deriveV5DeliveryPlan} from '../src/v5-delivery-protocol.mjs';

const sdk = createRequire(import.meta.url)('../.cache/upstream/kaspa-wasm32-sdk/nodejs/kaspa');
const artifact = JSON.parse(readFileSync(new URL('../src/v5-advanced-templates.json', import.meta.url))).delivery;
const keys = [31,32,33,34].map(n => new sdk.PrivateKey(n.toString(16).padStart(2,'0').repeat(32)));
const owners = keys.map(k => k.toPublicKey().toXOnlyPublicKey().toString());
const state = v5DeliveryInitialState({customer:owners[0],courier:owners[1],recipient:owners[2],world:'da'.repeat(32),deliveryId:'db'.repeat(32),paymentSompi:'25000000',bondSompi:'50000000'});
let tag = 100;
const funds = (owner, amount = 1000000000n) => new sdk.UtxoEntries([{outpoint:{transactionId:(tag++).toString(16).padStart(2,'0').repeat(32),index:0},amount,scriptPublicKey:sdk.payToAddressScript(keys[owner].toAddress('testnet-10')),blockDaaScore:0n,isCoinbase:false}]).items;
const open = () => buildV5DeliveryOpen(sdk,{artifact,state,customerUtxos:funds(0),courierUtxos:funds(1),fundingUtxos:funds(3)});
const cellOf = p => ({state,utxo:new sdk.UtxoEntries([{outpoint:{transactionId:p.transaction.id,index:0},amount:p.transaction.outputs[0].value,scriptPublicKey:p.transaction.outputs[0].scriptPublicKey,covenant_id:p.transaction.outputs[0].covenant.covenantId.toString(),blockDaaScore:0n,isCoinbase:false}]).items[0]});
const sign = p => signV5DeliveryPlan(p,(tx,i,{owner}) => sdk.createInputSignature(tx,i,keys[owners.indexOf(owner)]));

test('customer payment and courier collateral are separately signed and fully locked', async () => {
 const p = open();
 assert.equal(p.transaction.outputs[0].value,75000000n);
 assert.equal(p.transaction.outputs[1].value,975000000n);
 assert.equal(p.transaction.outputs[2].value,950000000n);
 assert.deepEqual(p.signers.map(s=>s.owners[0]),owners.filter((_,i)=>i!==2));
 assert.equal(p.transaction.outputs[0].scriptPublicKey.script,sdk.payToScriptHashScript(instantiateV5Delivery(sdk,artifact,state).script).script);
 assert.throws(()=>v5DeliveryJournal(p),/complete/);
 await sign(p);
 const j=v5DeliveryJournal(p);
 assert.equal(deriveV5DeliveryPlan(sdk,{artifact,journal:j,expectedState:state}).transaction.serializeToSafeJSON(),p.transaction.serializeToSafeJSON());
});

test('receipt is bound to covenant, delivery, participants and economic terms', async () => {
 const c=cellOf(open()), args={state,covenantId:c.utxo.entry.covenantId.toString()}, baseline=await v5DeliveryReceiptDigest(args,webcrypto);
 for(const change of [{covenantId:'dc'.repeat(32)},{state:{...state,delivery_id:'dd'.repeat(32)}},{state:{...state,world:'de'.repeat(32)}},{state:{...state,payment:state.payment+1}},{state:{...state,bond:state.bond+1}},{state:{...state,refund_age:state.refund_age+1}},{state:{...state,recipient:owners[3]}}])assert.notEqual(await v5DeliveryReceiptDigest({...args,...change},webcrypto),baseline);
});

test('release pays full payment and bond to courier; refund forfeits both to customer', async () => {
 const cell=cellOf(open()),digest=await v5DeliveryReceiptDigest({state,covenantId:cell.utxo.entry.covenantId.toString()},webcrypto),receipt=sdk.signScriptHash(digest,keys[2]).slice(2,-2);
 const release=buildV5DeliveryRelease(sdk,{artifact,cell,receipt,fundingUtxos:funds(3)}),refund=buildV5DeliveryRefund(sdk,{artifact,cell,fundingUtxos:funds(3)});
 for(const [p,owner,sequence] of [[release,1,0n],[refund,0,100n]]){
  assert.equal(p.transaction.outputs[0].value,75000000n);
  assert.equal(p.transaction.outputs[0].scriptPublicKey.script,sdk.payToAddressScript(keys[owner].toAddress('testnet-10')).script);
  assert.equal(p.transaction.inputs[0].sequence,sequence);
  assert.equal(p.transaction.outputs[0].covenant,undefined);
  await sign(p);assert.deepEqual(v5DeliveryWirePlan(deriveV5DeliveryPlan(sdk,{artifact,journal:v5DeliveryJournal(p),expectedState:state})),v5DeliveryJournal(p));
 }
});

test('wallet reconstruction rejects changed payout, role, input groups and placeholders', () => {
 const p=open(),j=v5DeliveryWirePlan(p);
 assert.throws(()=>deriveV5DeliveryPlan(sdk,{artifact,journal:j}),/expected state/);
 assert.throws(()=>deriveV5DeliveryPlan(sdk,{artifact,journal:j,expectedState:{...state,recipient:owners[3]}}),/state/);
 const altered=structuredClone(j),tx=sdk.Transaction.deserializeFromSafeJSON(j.transaction);tx.outputs[0].value-=1n;tx.outputs[1].value+=1n;altered.transaction=tx.serializeToSafeJSON();assert.throws(()=>deriveV5DeliveryPlan(sdk,{artifact,journal:altered,expectedState:state}),/rebuilt policy/);
 const groups=structuredClone(j);groups.openingCounts=[2,1];assert.throws(()=>deriveV5DeliveryPlan(sdk,{artifact,journal:groups,expectedState:state}),/owner|group/);
 const dummy=structuredClone(j);dummy.signatures[0][0]='00'.repeat(64)+'01';assert.throws(()=>deriveV5DeliveryPlan(sdk,{artifact,journal:dummy,expectedState:state}),/placeholder/);
});

test('state and contribution bounds fail before signing', () => {
 assert.throws(()=>v5DeliveryInitialState({customer:owners[0],courier:owners[0],recipient:owners[2],world:state.world,deliveryId:state.delivery_id,paymentSompi:1,bondSompi:1}),/differ/);
 assert.throws(()=>buildV5DeliveryOpen(sdk,{artifact,state,customerUtxos:funds(0,1n),courierUtxos:funds(1),fundingUtxos:funds(3)}),/Insufficient/);
 const duplicate=funds(0);assert.throws(()=>buildV5DeliveryOpen(sdk,{artifact,state,customerUtxos:duplicate,courierUtxos:funds(1),fundingUtxos:duplicate}),/shape/);
 assert.throws(()=>buildV5DeliveryRefund(sdk,{artifact,cell:{...cellOf(open()),state:{...state,bond:1}},fundingUtxos:funds(3)}),/template or value/);
});
