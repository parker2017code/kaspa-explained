import test from 'node:test';
import{request}from'node:http';
const fetch=(url,options={})=>new Promise((resolve,reject)=>{const req=request(url,options,res=>{res.resume();res.on('end',()=>resolve({status:res.statusCode,headers:{get:name=>res.headers[name]}}));});req.on('error',reject);req.end(options.body);});
import assert from 'node:assert/strict';
import {createWorkbenchServer} from '../server.mjs';

test('public runtime requires exact configured Host and Origin, disables faucet, and serves favicon',async()=>{
 for(const publicOrigin of ['http://example.com','https://evil.invalid','https://kaspaexplained.com/'])assert.throws(()=>createWorkbenchServer({publicOrigin}),/exact HTTPS/);
 const server=createWorkbenchServer({publicOrigin:'https://kaspaexplained.com',allowFaucet:false});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const url='http://127.0.0.1:'+server.address().port,headers={Host:'kaspaexplained.com'};
 try{
  assert.equal((await fetch(url+'/api/catalog')).status,403);
  assert.equal((await fetch(url+'/api/catalog',{headers})).status,200);
  assert.equal((await fetch(url+'/favicon.svg',{headers})).headers.get('content-type'),'image/svg+xml');
  const post={method:'POST',headers:{...headers,'Content-Type':'application/json',Origin:'https://evil.invalid'},body:'{}'};
  assert.equal((await fetch(url+'/api/validate',post)).status,403);
  post.headers.Origin='https://kaspaexplained.com';
  assert.equal((await fetch(url+'/api/faucet',post)).status,404);
  post.body=JSON.stringify({example:'unknown'});
  assert.equal((await fetch(url+'/api/validate',post)).status,400);
 }finally{await new Promise(r=>server.close(r));}
});


test('public server refuses new work after its immutable prepaid deadline',async()=>{
 const before=process.env.WORKBENCH_LEASE_EXPIRES_AT;
 process.env.WORKBENCH_LEASE_EXPIRES_AT=String(Date.now()-1);
 const server=createWorkbenchServer({publicOrigin:'https://kaspaexplained.com'});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try{
  const url='http://127.0.0.1:'+server.address().port;
  assert.equal((await fetch(url+'/api/catalog',{headers:{Host:'kaspaexplained.com'}})).status,503);
 }finally{
  await new Promise(r=>server.close(r));
  if(before===undefined)delete process.env.WORKBENCH_LEASE_EXPIRES_AT;else process.env.WORKBENCH_LEASE_EXPIRES_AT=before;
 }
});
