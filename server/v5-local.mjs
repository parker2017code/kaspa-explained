// Loopback-only V5 host. Isolated treasury/state; never included in dist.
import {createServer} from 'node:http';
import {createRequire} from 'node:module';
import {mkdir,readFile,writeFile,rename,open,unlink} from 'node:fs/promises';
import {randomBytes,randomUUID} from 'node:crypto';
import {resolve} from 'node:path';
import {createLocalServer} from './index.mjs';
import {V5Service} from '../faucet/v5-service.mjs';
import {V6NetworkFeed} from './v6-network.mjs';
const sdk=createRequire(import.meta.url)('../.cache/upstream/kaspa-wasm32-sdk/nodejs/kaspa');
const argentTemplates=JSON.parse(await readFile(new URL('../src/v5-argent-templates.json',import.meta.url),'utf8'));
const advancedTemplates=JSON.parse(await readFile(new URL('../src/v5-advanced-templates.json',import.meta.url),'utf8'));
const directory=resolve(process.env.V5_STATE_DIRECTORY||'.local/v5'),port=Number(process.env.V5_PORT||8913),origin=`http://127.0.0.1:${port}`;
await mkdir(directory,{recursive:true,mode:0o700});
const lock=await open(directory+'/owner.lock','wx',0o600);await lock.writeFile(String(process.pid));await lock.close();
let records,treasury,rpc;
const networkFeed=new V6NetworkFeed();
try{records=JSON.parse(await readFile(directory+'/state.json','utf8'));}catch(e){if(e.code!=='ENOENT')throw e;records={};}
try{treasury=JSON.parse(await readFile(directory+'/treasury.json','utf8'));}catch(e){if(e.code!=='ENOENT')throw e;treasury={network:'testnet-10',key:randomBytes(32).toString('hex'),requestId:randomUUID()};await writeFile(directory+'/treasury.json',JSON.stringify(treasury),{mode:0o600});}
if(treasury.network!=='testnet-10')throw Error('Wrong local network');
const key=new sdk.PrivateKey(treasury.key),address=key.toAddress('testnet-10').toString();
let poisoned=false;
const storage={get:async name=>structuredClone(records[name]),put:async values=>{
 if(poisoned)throw Error('Restart local host after storage failure');
 const next={...records,...structuredClone(values)},path=directory+'/'+randomUUID()+'.next';
 try{const file=await open(path,'wx',0o600);try{await file.writeFile(JSON.stringify(next));await file.sync();}finally{await file.close();}await rename(path,directory+'/state.json');records=next;}catch(e){poisoned=true;throw e;}
}};
const bounded=async (promise,timeoutMs=15000)=>{let timer;try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Test network timeout')),timeoutMs);})]);}finally{clearTimeout(timer);}};
const rpcOptions={url:'wss://muon-10.kaspa.blue/kaspa/testnet-10/wrpc/borsh',networkId:'testnet-10'};
const disposeRpc=async client=>{try{if(client?.disconnect)await bounded(client.disconnect(),2000);}catch{}};
let connectingInfo=null;
function readOnlyServerInfo(){
 if(!connectingInfo)connectingInfo=readOnlyServerInfoOnce().finally(()=>{connectingInfo=null;});
 return connectingInfo;
}
async function readOnlyServerInfoOnce(){
 let failure;
 for(let attempt=0;attempt<2;attempt++){
  let client=rpc;
  try{
   if(!client){client=new sdk.RpcClient(rpcOptions);rpc=client;await bounded(client.connect({blockAsyncConnect:true,timeoutDuration:6000}));}
   const info=await bounded(client.getServerInfo());if(info.networkId!=='testnet-10'||!info.isSynced||!info.hasUtxoIndex)throw Error('Synchronized Testnet-10 required');
   await networkFeed.attach(client);
   return info;
  }catch(error){failure=error;if(rpc===client)rpc=null;await disposeRpc(client);}
 }
 throw failure;
}
const staticServer=createLocalServer();let queue=Promise.resolve();
async function api(request){
 await readOnlyServerInfo();
 const {entries}=await bounded(rpc.getUtxosByAddresses([address]));
 const service=new V5Service({storage,env:{FAUCET_KEY:treasury.key,V5_ENABLED:'true',V5_PLAYER_DAILY_REWARD_SOMPI:'1000000000',V5_TOTAL_REWARD_SOMPI:'10000000000'},sdk,rpc,key,address,entries,call:bounded,argentTemplates,advancedTemplates});
 const state=await storage.get('state');if(state?.pending?.purpose==='v5-reward')await service.reconcileTreasury(state);if(state?.pending?.purpose==='v5-advanced'){const player=await storage.get('v5:player:'+state.pending.playerId);if(player)await service.advanced.reconcile(player);}
 // An earlier market receipt can hold the shared treasury lock. Observe and
 // apply that exact receipt without resubmission or starting its next quote.
 if(state?.pending?.purpose==='v5-market')await new V5Service({storage,env:{V5_ENABLED:'false'},sdk,rpc,key,address,entries,call:bounded,argentTemplates,advancedTemplates}).reconcileTreasury(state);
 if(new URL(request.url).pathname.startsWith('/api/v6/')||state?.pending?.purpose==='v6'){
  const {V6Service}=await import('./v6-service.mjs');
  const launchTemplate=JSON.parse(await readFile(new URL('../.cache/public-templates/templates.json',import.meta.url),'utf8')).templates.launch;
  let proofTemplates;try{proofTemplates=JSON.parse(await readFile(new URL('../src/v6-proof-templates.json',import.meta.url),'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
  const v6=new V6Service({host:service,storage,sdk,rpc,key,address,entries,call:bounded,argentTemplates,advancedTemplates,launchTemplate,proofTemplates});
  if(state?.pending?.purpose==='v6'){
   const saved=await storage.get('v6:session:'+state.pending.sessionId);
   if(!saved)throw Error('The shared treasury has a saved V6 operation whose session needs recovery.');
   await v6.reconcile(saved);
  }
  if(new URL(request.url).pathname.startsWith('/api/v6/'))return v6.handle(request);
 }
 return service.handle(request);
}
const server=createServer(async(req,res)=>{
 if(req.headers.host!==`127.0.0.1:${port}`&&req.headers.host!==`localhost:${port}`){res.writeHead(403);return res.end('Loopback host required');}
 if(req.headers['sec-fetch-site']==='cross-site'){res.writeHead(403);return res.end('Local browser requests required');}
 if(req.url==='/api/v6/events'){
  if(req.method!=='GET'||req.headers.origin&&!([origin,`http://localhost:${port}`].includes(req.headers.origin))){res.writeHead(403);return res.end('Local event stream required');}
  networkFeed.addClient(req,res);void readOnlyServerInfo().catch(()=>{networkFeed.status='disconnected';networkFeed.publish();});return;
 }
 if(!req.url.startsWith('/api/v5/')&&!req.url.startsWith('/api/v6/')&&req.url!=='/api/faucet')return staticServer.emit('request',req,res);
 try{
  if(req.method!=='POST'||req.headers.origin&&!([origin,`http://localhost:${port}`].includes(req.headers.origin)))throw Error('Local POST required');
  if(req.headers['content-type']?.split(';')[0]!=='application/json')throw Error('JSON required');
  const parts=[];let length=0;for await(const chunk of req){length+=chunk.length;if(length>400000)throw Error('Request too large');parts.push(chunk);}
  const body=Buffer.concat(parts).toString('utf8');JSON.parse(body);
  const work=async()=>req.url==='/api/faucet'?fetch('https://kaspa-demo-faucet.parker2017.workers.dev/api/faucet',{method:'POST',headers:{'Content-Type':'application/json',Origin:'http://127.0.0.1:8912'},body,signal:AbortSignal.timeout(20000)}):api(new Request(origin+req.url,{method:'POST',headers:{'Content-Type':'application/json'},body}));
  const pending=queue.then(work);queue=pending.catch(()=>{});const result=await pending;
  res.writeHead(result.status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(await result.text());
 }catch(e){res.writeHead(503,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({error:e.message}));}
});
server.on('error',async error=>{console.error(error.code||'Local server failed');await unlink(directory+'/owner.lock').catch(()=>{});process.exit(1);});
const networkHealth=setInterval(()=>{if(networkFeed.clients.size)void readOnlyServerInfo().catch(()=>{networkFeed.status='disconnected';networkFeed.publish();});},6000);
server.listen(port,'127.0.0.1',()=>console.log(JSON.stringify({local:origin+'/covenants-v6',treasuryAddress:address,network:'testnet-10'})));
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,async()=>{clearInterval(networkHealth);networkFeed.close();server.close();try{await rpc?.disconnect();}finally{await unlink(directory+'/owner.lock');process.exit(0);}});
