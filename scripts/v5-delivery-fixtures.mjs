// Deterministic unfunded courier transactions from the canonical advanced artifact. No RPC.
// Rebuild first with: node scripts/build-v5-advanced.mjs
import {createRequire} from 'node:module';
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {webcrypto} from 'node:crypto';
import assert from 'node:assert/strict';
import {v5DeliveryInitialState, buildV5DeliveryOpen, buildV5DeliveryRelease, buildV5DeliveryRefund, v5DeliveryReceiptDigest, signV5DeliveryPlan, v5DeliveryUnlock, v5DeliveryMass, v5DeliveryWirePlan, deriveV5DeliveryPlan} from '../src/v5-delivery-protocol.mjs';
import {publicTransactionMass} from '../src/public-contracts.mjs';

const artifact = JSON.parse(await readFile('src/v5-advanced-templates.json')).delivery;
const sdk = createRequire(import.meta.url)('../.cache/upstream/kaspa-wasm32-sdk/nodejs/kaspa');
const keys = [31,32,33,34].map(n=>new sdk.PrivateKey(n.toString(16).padStart(2,'0').repeat(32)));
const owners = keys.map(k=>k.toPublicKey().toXOnlyPublicKey().toString());
const state = v5DeliveryInitialState({customer:owners[0],courier:owners[1],recipient:owners[2],world:'da'.repeat(32),deliveryId:'db'.repeat(32),paymentSompi:'25000000',bondSompi:'50000000'});
const fixtures = []; let tag = 100;
const funds = (owner,amount=1000000000n)=>new sdk.UtxoEntries([{outpoint:{transactionId:(tag++).toString(16).padStart(2,'0').repeat(32),index:0},amount,scriptPublicKey:sdk.payToAddressScript(keys[owner].toAddress('testnet-10')),blockDaaScore:0n,isCoinbase:false}]).items;
const open = ()=>buildV5DeliveryOpen(sdk,{artifact,state,customerUtxos:funds(0),courierUtxos:funds(1),fundingUtxos:funds(3)});
const cellOf = p=>({state,utxo:new sdk.UtxoEntries([{outpoint:{transactionId:p.transaction.id,index:0},amount:p.transaction.outputs[0].value,scriptPublicKey:p.transaction.outputs[0].scriptPublicKey,covenant_id:p.transaction.outputs[0].covenant.covenantId.toString(),blockDaaScore:0n,isCoinbase:false}]).items[0]});
const exportTx = tx=>({version:tx.version,payload:tx.payload,lockTime:String(tx.lockTime),storageMass:String(tx.storageMass),inputs:tx.inputs.map(i=>({transactionId:i.previousOutpoint.transactionId,index:i.previousOutpoint.index,sequence:String(i.sequence),computeBudget:i.computeBudget,signatureScript:i.signatureScript,amount:String(i.utxo.amount),scriptPublicKey:i.utxo.entry.scriptPublicKey.script,covenantId:i.utxo.entry.covenantId?.toString()||null})),outputs:tx.outputs.map(o=>({value:String(o.value),scriptPublicKey:o.scriptPublicKey.script,covenant:o.covenant?{authorizingInput:o.covenant.authorizingInput,covenantId:o.covenant.covenantId.toString()}:null}))});
async function record(name,p,{valid=true,mutate=null,wrongInput=-1}={}) {
 if(mutate)await mutate(p);
 p.transaction.storageMass=BigInt(v5DeliveryMass(p).storageMass);
 let signatures=[];
 if(valid){const wire=v5DeliveryWirePlan(p),rebuilt=deriveV5DeliveryPlan(sdk,{artifact,journal:wire,expectedState:state});assert.deepEqual(v5DeliveryWirePlan(rebuilt),wire);await signV5DeliveryPlan(p,(tx,i,{owner})=>sdk.createInputSignature(tx,i,keys[owners.indexOf(owner)]));signatures=p.signatures;}
 else {for(let i=0;i<p.transaction.inputs.length;i++){signatures[i]=p.signers[i].owners.map(owner=>sdk.createInputSignature(p.transaction,i,keys[i===wrongInput?2:owners.indexOf(owner)]).slice(2));p.transaction.inputs[i].signatureScript=v5DeliveryUnlock(p.calls[i],signatures[i]);}p.transaction.finalize();}
 fixtures.push({name,valid,transaction:exportTx(p.transaction),mass:publicTransactionMass(p.transaction),calls:p.calls.map((c,i)=>{let n=0;return c?{actor:'delivery',contractName:'Delivery',state:c.asset.state,fields:artifact.sil_abi.contracts.Delivery.runtime_state.fields.map(f=>f.name),entry:c.entry,args:c.args.map((v,j)=>c.asset.entries[c.entry].params[j].type.kind==='sig'?signatures[i][n++]:v)}:null;})});
 return p;
}
const opening = await record('delivery-open-payment-and-courier-bond',open()), cell=cellOf(opening);
const receiptFor = async args=>sdk.signScriptHash(await v5DeliveryReceiptDigest(args,webcrypto),keys[2]).slice(2,-2);
const receipt = await receiptFor({state,covenantId:cell.utxo.entry.covenantId.toString()});
const release = ()=>buildV5DeliveryRelease(sdk,{artifact,cell,receipt,fundingUtxos:funds(3)});
const refund = ()=>buildV5DeliveryRefund(sdk,{artifact,cell,fundingUtxos:funds(3)});
await record('delivery-release-signed-recipient-receipt',release());
await record('delivery-refund-minimum-sequence-boundary',refund());
await record('delivery-reject-customer-opening-without-signature',open(),{valid:false,wrongInput:0});
await record('delivery-reject-courier-bond-without-signature',open(),{valid:false,wrongInput:1});
await record('delivery-reject-release-without-courier-signature',release(),{valid:false,wrongInput:0});
await record('delivery-reject-refund-without-customer-signature',refund(),{valid:false,wrongInput:0});
await record('delivery-reject-release-without-fee-signature',release(),{valid:false,wrongInput:1});
await record('delivery-reject-wrong-recipient-receipt',release(),{valid:false,mutate:async p=>{p.calls[0].args[0]=sdk.signScriptHash(await v5DeliveryReceiptDigest({state,covenantId:cell.utxo.entry.covenantId.toString()},webcrypto),keys[3]).slice(2,-2);}});
await record('delivery-reject-receipt-from-other-covenant',release(),{valid:false,mutate:async p=>p.calls[0].args[0]=await receiptFor({state,covenantId:'dc'.repeat(32)})});
await record('delivery-reject-receipt-from-other-delivery',release(),{valid:false,mutate:async p=>p.calls[0].args[0]=await receiptFor({state:{...state,delivery_id:'dd'.repeat(32)},covenantId:cell.utxo.entry.covenantId.toString()})});
await record('delivery-reject-receipt-for-other-payment',release(),{valid:false,mutate:async p=>p.calls[0].args[0]=await receiptFor({state:{...state,payment:state.payment+1},covenantId:cell.utxo.entry.covenantId.toString()})});
await record('delivery-reject-receipt-for-other-world',release(),{valid:false,mutate:async p=>p.calls[0].args[0]=await receiptFor({state:{...state,world:'de'.repeat(32)},covenantId:cell.utxo.entry.covenantId.toString()})});
await record('delivery-reject-short-refund-sequence',refund(),{valid:false,mutate:p=>p.transaction.inputs[0].sequence=99n});
await record('delivery-reject-zero-refund-sequence',refund(),{valid:false,mutate:p=>p.transaction.inputs[0].sequence=0n});
await record('delivery-reject-courier-payout-shortfall',release(),{valid:false,mutate:p=>{p.transaction.outputs[0].value-=1n;p.transaction.outputs[1].value+=1n;}});
await record('delivery-reject-refund-bond-shortfall',refund(),{valid:false,mutate:p=>{p.transaction.outputs[0].value-=50000000n;p.transaction.outputs[1].value+=50000000n;}});
await record('delivery-reject-release-payout-redirection',release(),{valid:false,mutate:p=>p.transaction.outputs[0].scriptPublicKey=sdk.payToAddressScript(keys[0].toAddress('testnet-10'))});
await record('delivery-reject-refund-payout-redirection',refund(),{valid:false,mutate:p=>p.transaction.outputs[0].scriptPublicKey=sdk.payToAddressScript(keys[1].toAddress('testnet-10'))});
await record('delivery-reject-bad-receipt-bytes',release(),{valid:false,mutate:p=>p.calls[0].args[0]='00'.repeat(64)});
await mkdir('.cache/v5-delivery-fixtures',{recursive:true});
await writeFile('.cache/v5-delivery-fixtures/transactions.json',JSON.stringify({network:'testnet-10',unfunded:true,fixtures},null,2));
console.log(JSON.stringify({artifact:artifact.id,fixtures:fixtures.length,valid:fixtures.filter(f=>f.valid).length,releaseMass:fixtures[1].mass}));
if(process.argv.includes('--check-vm')){
 const upstream=resolve('.cache/upstream/silverscript');
 // Isolated test target; reuse the exact SDK/SilverScript ABI and mass harness.
 const harness=await readFile('tests/v5_argent_vm.rs','utf8') + `

#[test]
fn delivery_consensus_checks_real_utxo_age_and_late_receipt() {
 use kaspa_consensus::processes::transaction_validator::{TransactionValidator,tx_validation_in_utxo_context::TxValidationFlags};
 use kaspa_consensus_core::errors::tx::TxRuleError;
 use kaspa_consensus_core::config::params::ForkActivation;
 let data:Value=serde_json::from_str(&std::fs::read_to_string(std::env::var("KE_ARGENT_FIXTURES").unwrap()).unwrap()).unwrap();
 let fixtures=data["fixtures"].as_array().unwrap();
 let validator=TransactionValidator::new(10,4,100000,100000,100,0,18,std::sync::Arc::default(),MassCalculator::new_with_consensus_params(&TESTNET_PARAMS),ForkActivation::always(),TESTNET_PARAMS.mass_per_sig_op);
 let refund=fixtures.iter().find(|f|f["name"]=="delivery-refund-minimum-sequence-boundary").unwrap();
 let (tx,mut entries)=decode(&refund["transaction"]);entries[0].block_daa_score=500;
 let populated=PopulatedTransaction::new(&tx,entries);
 let before=validator.validate_populated_transaction_and_get_fee(&populated,599,599,TxValidationFlags::Full,None,None);
 assert!(matches!(before,Err(TxRuleError::SequenceLockConditionsAreNotMet)),"refund at age99 must reject: {before:?}");
 for daa in [600,601] {let result=validator.validate_populated_transaction_and_get_fee(&populated,daa,daa,TxValidationFlags::Full,None,None);assert!(result.is_ok(),"refund at age100+ must pass: {result:?}");}
 let release=fixtures.iter().find(|f|f["name"]=="delivery-release-signed-recipient-receipt").unwrap();
 let (tx,mut entries)=decode(&release["transaction"]);entries[0].block_daa_score=500;
 let populated=PopulatedTransaction::new(&tx,entries);
 for daa in [500,601] {let result=validator.validate_populated_transaction_and_get_fee(&populated,daa,daa,TxValidationFlags::Full,None,None);assert!(result.is_ok(),"receipt release remains valid before and after refund eligibility: {result:?}");}
}
`;
 await writeFile(resolve(upstream,'silverscript-lang/tests/kaspa_explained_v5_delivery.rs'),harness);
 execFileSync('cargo',['test','-p','silverscript-lang','--test','kaspa_explained_v5_delivery','--locked','--','--nocapture'],{cwd:upstream,stdio:'inherit',env:{...process.env,KE_ARGENT_FIXTURES:resolve('.cache/v5-delivery-fixtures/transactions.json'),KE_ARGENT_CONTRACT_DIR:resolve('contracts/public/argent-market/generated')}});
}
