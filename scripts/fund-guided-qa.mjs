// Local-only, at most two 10 tKAS QA allocations for the guided-interface release.
import {mkdir,readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {TestnetLab} from '../server/testnet.mjs';
import {buildFaucetPayment,validateFaucetPayment,publicAddress} from '../faucet/policy.mjs';
const destination=process.argv[2],submit=process.argv.includes('--submit'),lab=new TestnetLab();
try{
 await lab.load();publicAddress(lab.sdk,destination);
 if(lab.address!=='kaspatest:qqup3k4ru5uhj9swa05afa3zqcwkyhtv9vz9dme68cglza73mc5yk4r7an5cj')throw new Error('Unexpected demo wallet.');
 await mkdir('.local/guided-qa',{recursive:true,mode:0o700});
 const file=`.local/guided-qa/${createHash('sha256').update(destination).digest('hex').slice(0,24)}.json`;
 let prior;try{prior=JSON.parse(await readFile(file,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
 if(prior){console.log(JSON.stringify({alreadyJournaled:true,transactionId:prior.transactionId,destination:prior.destination}));}
 else{
  if((await readdir('.local/guided-qa')).filter(n=>n.endsWith('.json')).length>=2)throw new Error('The two-wallet guided QA allocation is used.');
  const rpc=new lab.sdk.RpcClient({url:'wss://muon-10.kaspa.blue/kaspa/testnet-10/wrpc/borsh',networkId:'testnet-10'});
  try{
   await rpc.connect({blockAsyncConnect:true,timeoutDuration:6000});const info=await rpc.getServerInfo();
   if(info.networkId!=='testnet-10'||!info.isSynced||!info.hasUtxoIndex)throw new Error('Wrong or unsynchronized node.');
   const {entries}=await rpc.getUtxosByAddresses([lab.address]),estimate=await rpc.getFeeEstimate(),feeRate=Math.max(100,Math.ceil(estimate.estimate.priorityBucket.feerate));
   const plan=buildFaucetPayment(lab.sdk,{entries,destination,changeAddress:lab.address,feeRate}),tx=plan.transaction;
   console.log(JSON.stringify({network:'testnet-10',source:lab.address,destination,amount:'1000000000',fee:String(plan.fee),mode:submit?'submit':'review'}));
   if(submit){
    for(let index=0;index<tx.inputs.length;index++)tx.inputs[index].signatureScript=lab.sdk.createInputSignature(tx,index,lab.key);
    validateFaucetPayment(lab.sdk,tx,{destination,changeAddress:lab.address,feeRate});tx.finalize();
    await writeFile(file,JSON.stringify({destination,transactionId:tx.id,transaction:tx.serializeToSafeJSON(),createdAt:new Date().toISOString()}),{mode:0o600,flag:'wx'});
    const result=await rpc.submitTransaction({transaction:tx,allowOrphan:false});if(result.transactionId!==tx.id)throw new Error('Submission uncertain; inspect the saved journal before doing anything else.');
    console.log(JSON.stringify({submitted:true,transactionId:tx.id}));
   }
  }finally{await rpc.disconnect();}
 }
}finally{lab.release?.();}
