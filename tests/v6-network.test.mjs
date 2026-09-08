import test from 'node:test';
import assert from 'node:assert/strict';
import {V6NetworkFeed} from '../server/v6-network.mjs';
const hash=n=>n.toString(16).padStart(64,'0');
const block=n=>({header:{hash:hash(n),parentsByLevel:[[hash(n-1)]],timestamp:1788857500000+n*100,daaScore:BigInt(n)}});
test('the live feed preserves only observed hashes and supplied parent links in bounded history',()=>{
  const feed=new V6NetworkFeed();try{
    feed.observe({header:{hash:'invented'}});assert.equal(feed.snapshot().blocks.length,0);
    for(let i=1;i<=200;i++)feed.observe(block(i));
    feed.observe(block(200));const result=feed.snapshot();
    assert.equal(result.sequence,200);assert.equal(result.blocks.length,96);
    assert.deepEqual(result.blocks.at(-1).parents,[hash(199)]);assert.equal(result.blocks.at(-1).daaScore,'200');
    feed.lastEventAt=Date.now()-11000;assert.equal(feed.snapshot().status,'stale');
  }finally{feed.close();}
});
test('reconnecting subscribes once and restores live state from the new node',async()=>{
  const client=()=>{const handlers=new Map();return{handlers,count:0,addEventListener:(name,fn)=>handlers.set(name,fn),removeEventListener:(name,fn)=>{if(handlers.get(name)===fn)handlers.delete(name);},async subscribeBlockAdded(){this.count++;},async getSink(){return{sink:hash(1)};},async getBlock(){return{block:block(1)};}};};
  const a=client(),b=client(),feed=new V6NetworkFeed();try{
    await feed.attach(a);await feed.attach(a);assert.equal(a.count,1);assert.equal(feed.snapshot().status,'live');
    a.handlers.get('disconnect')();assert.equal(feed.snapshot().status,'disconnected');
    await feed.attach(b);assert.equal(a.handlers.size,0);assert.equal(b.count,1);
    b.handlers.get('block-added')({data:{block:block(2)}});assert.equal(feed.snapshot().status,'live');assert.equal(feed.snapshot().blocks.at(-1).hash,hash(2));
  }finally{feed.close();}
});
