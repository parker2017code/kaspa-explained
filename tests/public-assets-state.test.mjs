import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {instantiatePublicToken,buildTokenGenesis} from '../src/public-token.mjs';
import {signPublicAssetPlan} from '../src/public-asset-signing.mjs';
import {publicAssetJournal} from '../src/public-asset-recovery.mjs';
import {validatePublicAssetsState} from '../src/public-assets-ui.mjs';
const sdk=createRequire(import.meta.url)('../.cache/upstream/kaspa-wasm32-sdk/nodejs/kaspa');
const templates=JSON.parse(await readFile('.cache/public-templates/templates.json','utf8')).templates;
const key=new sdk.PrivateKey('01'.repeat(32)),owner=key.toPublicKey().toXOnlyPublicKey().toString(),address=key.toAddress('testnet-10').toString();
async function fixture(){
 const token=instantiatePublicToken(sdk,templates.token,{issuer:owner,cap:1000,state:{owner,quantity:1000,isMinter:true}});
 const utxo=new sdk.UtxoEntries([{outpoint:{transactionId:'aa'.repeat(32),index:0},amount:500000000000n,scriptPublicKey:sdk.payToAddressScript(new sdk.Address(address)),blockDaaScore:0n,isCoinbase:false}]).items[0];
 const plan=buildTokenGenesis(sdk,{fundingUtxos:[utxo],token,cellAmount:50000000n,changeAddress:address});
 await signPublicAssetPlan(plan,(tx,index)=>sdk.createInputSignature(tx,index,key));
 return {version:1,collections:[{kind:'token',covenantId:plan.covenantId,identity:{issuer:owner,cap:1000},cells:[{state:token.state,script:token.script,address:token.address,transactionId:plan.transaction.id,index:0,amount:String(plan.transaction.outputs[0].value)}]}],activity:[{journal:publicAssetJournal(plan),attempted:true,submitted:true,observed:true,applied:true}]};
}
test('restored holdings require their exact signed journal output and recheck observations',async()=>{
 const state=await fixture();assert.equal(validatePublicAssetsState(sdk,templates,state,[owner]),state);assert.equal(state.activity[0].observed,false);
});
test('restored holdings reject forged lineage, outpoints, values and duplicate records',async()=>{
 const original=await fixture();
 for(const mutate of [s=>s.collections[0].covenantId='bb'.repeat(32),s=>s.collections[0].cells[0].transactionId='cc'.repeat(32),s=>s.collections[0].cells[0].index=1,s=>s.collections[0].cells[0].amount='40000000',s=>s.activity=[],s=>s.collections.push(structuredClone(s.collections[0])),s=>s.collections[0].cells.push(structuredClone(s.collections[0].cells[0])),s=>s.activity.push(structuredClone(s.activity[0]))]){
  const changed=structuredClone(original);mutate(changed);assert.throws(()=>validatePublicAssetsState(sdk,templates,changed,[owner]),/signed journal|Duplicate/);
 }
});
