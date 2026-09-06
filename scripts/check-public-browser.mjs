// Unfunded browser acceptance against the actual static build and a real Testnet-10 node.
// No faucet, signing or submission controls are used; recovery remains in memory.
import {chromium,firefox,webkit} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,access,mkdir,writeFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {staticPreview} from './static-preview.mjs';

const engine=process.argv[2]||'chromium',browserType={chromium,firefox,webkit}[engine];
assert(browserType,'Choose chromium, firefox, or webkit');
const canonical=['index','what-is-kaspa','why-kaspa-matters','skeptical-case','kaspa-mining','build-on-kaspa','status','kaspa-origin-story','kips','moose','sources','playground','404','money','applications','search'];
for(const name of canonical)await access(`dist/${name}.html`);
const sitemap=await readFile('dist/sitemap.xml','utf8');
assert.equal((sitemap.match(/<loc>/g)||[]).length,15,'V2 must contain sixteen canonical documents including 404');
const templates=JSON.parse(await readFile('dist/assets/public-templates.json','utf8'));
assert.deepEqual(Object.keys(templates.templates).sort(),['escrow','prediction','proof','receipt','token','treasury']);
const output=`.cache/visual-review/public-browser/${engine}`;await mkdir(output,{recursive:true});
const results=[],server=staticPreview('dist');let browser,failure;
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
try{
 browser=await browserType.launch();
 for(const theme of ['light','dark']){
  const context=await browser.newContext({acceptDownloads:true,reducedMotion:'reduce',viewport:{width:390,height:900}});
  try{
   const page=await context.newPage(),errors=[],apiCalls=[],loaded=new Set();
   page.setDefaultTimeout(45000);
   page.on('pageerror',error=>errors.push(error.message));
   page.on('response',response=>{if(response.ok())loaded.add(new URL(response.url()).pathname);});
   await context.route('**/api/**',route=>{apiCalls.push(new URL(route.request().url()).pathname);return route.abort();});
   const q=name=>page.locator(`[data-public-${name}]`);
   const idle=()=>page.waitForFunction(()=>!document.querySelector('[data-public-apps]').hasAttribute('aria-busy'));
   const success=async label=>{await idle();assert.notEqual(await q('message').getAttribute('data-error'),'true',`${label}: ${await q('message').textContent()} (real node required; no offline stub)`);};
   const capture=async state=>{
    for(const width of [320,390,768,1440]){
     await page.setViewportSize({width,height:900});
     const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
     assert(overflow<=1,`${theme}/${state}/${width}: horizontal overflow ${overflow}`);
     assert.deepEqual(errors,[],`${state}: browser exceptions`);assert.deepEqual(apiCalls,[],`${state}: private API requests`);
     results.push({theme,state,width,overflow});
     await page.screenshot({path:`${output}/${theme}-${state}-${width}.png`,fullPage:true});
    }
   };
   await page.goto(`${base}/applications?theme=${theme}`);
   await capture('initial');
   await page.locator('[data-public-start] summary').focus();await page.keyboard.press('Enter');
   await q('import').click();await idle();
   assert.equal(await q('message').getAttribute('data-error'),'true','Missing recovery must fail');
   assert.equal(await q('wallet').isVisible(),false);await capture('missing-file');
   await q('create').focus();await page.keyboard.press('Enter');await success('Create wallet');
   assert(await q('wallet').isVisible(),'Wallet creation must succeed against real RPC');
   for(const path of ['/assets/kaspa/kaspa.js','/assets/kaspa/kaspa_bg.wasm','/assets/public-templates.json'])assert(loaded.has(path),`SDK/template resource was not loaded: ${path}`);
   const addresses=[];
   for(const account of ['0','1','2']){
    await q('account-select').selectOption(account);await success('Account node refresh');
    assert.equal((await q('balance').innerText()).trim(),'0 tKAS','Fresh disposable account must be unfunded');
    addresses.push(await q('address').inputValue());
   }
   assert.equal(new Set(addresses).size,3);assert(addresses.every(address=>address.startsWith('kaspatest:')));
   await capture('created-unfunded');
   const password=`Unfunded browser check ${randomUUID()}`;
   await q('show-backup').click();await q('backup-password').fill(password);
   const waiting=page.waitForEvent('download');await q('export').click();const download=await waiting;await success('Encrypted export');
   const stream=await download.createReadStream(),chunks=[];for await(const chunk of stream)chunks.push(chunk);
   const encrypted=Buffer.concat(chunks),envelope=JSON.parse(encrypted.toString());
   assert.equal(envelope.kdf,'PBKDF2-SHA256');assert.equal(envelope.iterations,250000);
   assert.equal(envelope.network,'testnet-10');assert(envelope.ciphertext.length>50);
   assert.deepEqual(Object.keys(envelope).sort(),['ciphertext','iterations','iv','kdf','network','salt','version']);
   await download.delete();
   // Reload removes unlocked module state but preserves this isolated context's encrypted storage.
   await page.reload();await page.locator('[data-public-start] summary').click();
   await q('import-file').setInputFiles({name:'unfunded-recovery.json',mimeType:'application/json',buffer:encrypted});
   await q('import-password').fill('An incorrect password');await q('import').click();await idle();
   assert.equal(await q('message').getAttribute('data-error'),'true','Wrong password must fail');
   assert.equal(await q('wallet').isVisible(),false);await capture('wrong-password');
   await q('import-password').fill(password);await q('import').click();await success('File restore');
   assert(await q('wallet').isVisible());
   for(const [index,address] of addresses.entries()){
    await q('account-select').selectOption(String(index));await success('Restored account refresh');
    assert.equal(await q('address').inputValue(),address,'Restore must recover every original role');
    assert.equal((await q('balance').innerText()).trim(),'0 tKAS');
   }
   await capture('restored-file');
   await page.reload();await page.locator('[data-public-start] summary').click();
   await q('import-password').fill(password);await q('import-local').click();await success('Browser recovery restore');
   assert(await q('wallet').isVisible());assert.equal(await q('address').inputValue(),addresses[0]);
   await capture('restored-local');
   assert.deepEqual(apiCalls,[]);assert.deepEqual(errors,[]);
  }finally{await context.close();} // Closing the isolated context terminates its RPC sockets and discards keys/storage.
 }
}catch(error){failure=error;}
finally{
 if(browser)await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
 await writeFile(`${output}/report.json`,JSON.stringify({engine,passed:!failure,states:results.length,results,error:failure?.message},null,2));
}
if(failure)throw failure;
console.log(`Public browser ${engine}: ${results.length} states passed; real Testnet-10 RPC, no funding or submission. Evidence: ${output}/report.json`);
