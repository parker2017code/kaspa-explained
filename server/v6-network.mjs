// Public observed block notifications. No wallet/session data crosses this feed.
const HASH=/^[a-f0-9]{64}$/i;
export class V6NetworkFeed {
  constructor(){this.rpc=null;this.blocks=[];this.clients=new Set();this.status='connecting';this.lastEventAt=0;this.pendingAttach=null;this.sequence=0;}
  snapshot(){return {network:'testnet-10',status:this.status==='live'&&Date.now()-this.lastEventAt>10000?'stale':this.status,lastEventAt:this.lastEventAt,sequence:this.sequence,blocks:this.blocks.slice(-96)};}
  publish(){const data='data: '+JSON.stringify(this.snapshot())+'\n\n';for(const res of this.clients){if(res.destroyed||res.writableLength>300000){res.destroy();this.clients.delete(res);}else res.write(data);}}
  observe(block){const header=block?.header,hash=header?.hash||block?.verboseData?.hash;if(!HASH.test(hash||''))return;
    const entry={hash:hash.toLowerCase(),parents:(header.parentsByLevel?.[0]||[]).filter(x=>HASH.test(String(x))).map(String),timestamp:Number(header.timestamp),daaScore:String(header.daaScore),observedAt:Date.now()};
    if(this.blocks.some(b=>b.hash===entry.hash))return;
    this.blocks.push(entry);if(this.blocks.length>160)this.blocks.shift();this.lastEventAt=entry.observedAt;this.status='live';this.sequence++;
    if(!this.flush)this.flush=setTimeout(()=>{this.flush=null;this.publish();},100);
  }
  async attach(rpc){if(this.rpc===rpc&&this.status!=='disconnected')return;if(this.pendingAttach)return this.pendingAttach;
    this.pendingAttach=(async()=>{if(this.rpc){this.rpc.removeEventListener?.('block-added',this.onBlock);this.rpc.removeEventListener?.('disconnect',this.onDisconnect);}
      this.rpc=rpc;this.status='connecting';this.onBlock=e=>this.observe(e?.data?.block||e?.block);this.onDisconnect=()=>{this.status='disconnected';this.publish();};
      rpc.addEventListener('block-added',this.onBlock);rpc.addEventListener('disconnect',this.onDisconnect);
      try{await rpc.subscribeBlockAdded();const {sink}=await rpc.getSink();if(HASH.test(sink)){const response=await rpc.getBlock({hash:sink,includeTransactions:false});this.observe(response.block);}this.publish();}
      catch{this.status='disconnected';this.publish();}
    })().finally(()=>{this.pendingAttach=null;});return this.pendingAttach;
  }
  addClient(req,res){res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});res.write('retry: 2000\n\n');this.clients.add(res);res.write('data: '+JSON.stringify(this.snapshot())+'\n\n');
    const timer=setInterval(()=>{if(!res.destroyed)res.write(': keepalive\n\n');},10000);req.on('close',()=>{clearInterval(timer);this.clients.delete(res);});}
  close(){clearTimeout(this.flush);for(const c of this.clients)c.end();this.clients.clear();}
}
