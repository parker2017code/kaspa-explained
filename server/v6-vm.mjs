import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';

export const v6VmTransaction=tx=>({version:tx.version,payload:tx.payload,lockTime:String(tx.lockTime),storageMass:String(tx.storageMass),
  inputs:tx.inputs.map(i=>({transactionId:i.previousOutpoint.transactionId,index:i.previousOutpoint.index,sequence:String(i.sequence),computeBudget:i.computeBudget,signatureScript:i.signatureScript,amount:String(i.utxo.amount),scriptPublicKey:i.utxo.entry.scriptPublicKey.script,covenantId:i.utxo.entry.covenantId?.toString()||null,blockDaaScore:String(i.utxo.blockDaaScore||0)})),
  outputs:tx.outputs.map(o=>({value:String(o.value),scriptPublicKey:o.scriptPublicKey.script,covenant:o.covenant?{authorizingInput:o.covenant.authorizingInput,covenantId:o.covenant.covenantId.toString()}:null}))});

export async function checkV6Script(tx,{timeoutMs=10000}={}){
  const data=JSON.stringify(v6VmTransaction(tx));
  if(data.length>2_000_000)throw Error('The local script check is too large.');
  return new Promise((resolveResult,reject)=>{
    const child=spawn(resolve('.cache/upstream/silverscript/target/debug/ke-v6-vm'),[],{stdio:['pipe','pipe','pipe']});
    let output='',ended=false;
    const finish=(error,result)=>{if(ended)return;ended=true;clearTimeout(timer);error?reject(error):resolveResult(result);};
    const timer=setTimeout(()=>{child.kill('SIGTERM');finish(Error('The local contract check timed out. No transaction was sent.'));},timeoutMs);
    child.on('error',()=>finish(Error('The local Kaspa script checker is unavailable.')));
    child.stdout.on('data',chunk=>{output+=chunk;if(output.length>30000){child.kill('SIGTERM');finish(Error('Unexpected script checker output.'));}});
    child.stderr.resume();
    child.on('exit',code=>{if(code!==0)return finish(Error('The local contract check could not complete.'));try{
      const result=JSON.parse(output);if(typeof result.valid!=='boolean'||result.engine!=='Kaspa TxScriptEngine')throw Error();
      finish(null,{...result,transactionId:tx.id,transactionDigest:createHash('sha256').update(data).digest('hex'),checkedAt:Date.now()});
    }catch{finish(Error('The local contract checker returned an unreadable result.'));}});
    child.stdin.on('error',()=>{});child.stdin.end(data);
  });
}
