// Local educational validation of exact signed transactions. No RPC or keys.
use std::io::{self, Read};
use serde_json::{Value, json};
use kaspa_consensus_core::{Hash, hashing::sighash::SigHashReusedValuesUnsync};
use kaspa_consensus_core::mass::units::Gram;
use kaspa_consensus_core::tx::{CovenantBinding, PopulatedTransaction, ScriptPublicKey, Transaction, TransactionId, TransactionInput, TransactionOutpoint, TransactionOutput, UtxoEntry, VerifiableTransaction};
use kaspa_txscript::{EngineCtx, EngineFlags, TxScriptEngine};
use kaspa_txscript::caches::Cache;
use kaspa_txscript::covenants::CovenantsContext;

fn bytes(s: &str) -> Vec<u8> { (0..s.len()).step_by(2).map(|i|u8::from_str_radix(&s[i..i+2],16).expect("hex")).collect() }
fn text(v: &Value) -> &str { v.as_str().expect("string") }
fn number(v: &Value) -> u64 { text(v).parse().expect("integer") }
fn hash(v: &Value) -> Hash { Hash::from_bytes(bytes(text(v)).try_into().expect("hash")) }
fn check(v: &Value) -> Value {
    let inputs: Vec<_> = v["inputs"].as_array().expect("inputs").iter().map(|i|TransactionInput::new_with_compute_budget(
        TransactionOutpoint{transaction_id:TransactionId::from_bytes(bytes(text(&i["transactionId"])).try_into().expect("id")),index:i["index"].as_u64().expect("index") as u32},
        bytes(text(&i["signatureScript"])), number(&i["sequence"]), i["computeBudget"].as_u64().expect("budget") as u16)).collect();
    let outputs = v["outputs"].as_array().expect("outputs").iter().map(|o|TransactionOutput{
        value:number(&o["value"]),script_public_key:ScriptPublicKey::new(0,bytes(text(&o["scriptPublicKey"])).into()),
        covenant:(!o["covenant"].is_null()).then(||CovenantBinding{authorizing_input:o["covenant"]["authorizingInput"].as_u64().expect("authorizer") as u16,covenant_id:hash(&o["covenant"]["covenantId"])})}).collect();
    let entries = v["inputs"].as_array().expect("inputs").iter().map(|i|UtxoEntry::new(number(&i["amount"]),ScriptPublicKey::new(0,bytes(text(&i["scriptPublicKey"])).into()),i["blockDaaScore"].as_str().and_then(|s|s.parse().ok()).unwrap_or(0),false,(!i["covenantId"].is_null()).then(||hash(&i["covenantId"])))).collect();
    let tx=Transaction::new(v["version"].as_u64().expect("version") as u16,inputs,outputs,number(&v["lockTime"]),Default::default(),0,bytes(v["payload"].as_str().unwrap_or("")));
    tx.set_storage_mass(number(&v["storageMass"]));
    let populated=PopulatedTransaction::new(&tx,entries);
    let ctx=match CovenantsContext::from_tx(&populated) {Ok(c)=>c,Err(e)=>return json!({"valid":false,"error":format!("{e:?}"),"checkedInputs":0})};
    let reused=SigHashReusedValuesUnsync::new();let cache=Cache::new(100);let mut units=vec![];
    for i in 0..tx.inputs.len() {
        let mut vm=TxScriptEngine::from_transaction_input_with_script_units_limit(&populated,&tx.inputs[i],i,populated.utxo(i).expect("utxo"),EngineCtx::new(&cache).with_reused(&reused).with_covenants_ctx(&ctx),EngineFlags{covenants_enabled:true,sigop_script_units:Gram(1000).into()},tx.inputs[i].compute_commit.allowed_script_units());
        if let Err(error)=vm.execute(){return json!({"valid":false,"error":format!("{error:?}"),"failedInput":i,"checkedInputs":i,"units":units});}
        units.push(vm.used_script_units().0);
    }
    json!({"valid":true,"checkedInputs":tx.inputs.len(),"units":units})
}
fn main(){
    let mut input=String::new();io::stdin().take(2_000_001).read_to_string(&mut input).expect("stdin");
    if input.len()>2_000_000 {eprintln!("Input too large");std::process::exit(2);}
    let request:Value=serde_json::from_str(&input).expect("transaction JSON");
    let mut result=check(&request);result["engine"]=json!("Kaspa TxScriptEngine");result["scope"]=json!("Local script execution; not network submission or consensus-age acceptance");
    println!("{}",result);
}
