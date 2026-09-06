import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFile,readdir,access} from 'node:fs/promises';

test('public V2 includes education and browser applications without local signer assets',async()=>{
 execFileSync(process.execPath,['scripts/build.mjs'],{env:{...process.env,KASPA_RELEASE:'v2'},stdio:'pipe'});
 const app=await readFile('dist/applications.html','utf8');assert.match(app,/data-public-apps/);
 for(const kind of ['escrow','treasury','prediction','proof'])assert.match(app,new RegExp(`data-public-kind="${kind}"`));
 for(const kind of ['token','receipt'])assert.match(app,new RegExp(`data-public-asset-kind="${kind}"`));
 assert.match(app,/data-public-send/);
 for(const file of ['index.html','what-is-kaspa.html','money.html','build-on-kaspa.html','search.html'])await access('dist/'+file);
 for(const path of ['server','api','assets/testnet-app.mjs','assets/contracts-app.mjs','assets/recovery-app.mjs','assets/refundable-transfer.sil','assets/payment-split.sil'])await assert.rejects(access('dist/'+path),path);
 for(const name of ['testnet','contracts','split','experiment/index','experiment/board','experiment/discover','experiment/polls','experiment/tipjar','experiment/vault']){
  const redirect=await readFile(`dist/${name}.html`,'utf8');assert.match(redirect,/\/applications/);assert.doesNotMatch(redirect,/data-(?:testnet|contract-kind|lookup-form)/);
 }
 const search=await readFile('dist/search.html','utf8');assert.match(search,/href="\/applications"/);assert.doesNotMatch(search,/data-search-item[^>]*href="\/(?:testnet|contracts|split)"|href="\/(?:testnet|contracts|split)"[^>]*data-search-item/);
 const sitemap=await readFile('dist/sitemap.xml','utf8');assert.match(sitemap,/<loc>https:\/\/kaspaexplained.com\/applications<\/loc>/);assert.doesNotMatch(sitemap,/<loc>[^<]*\/(?:testnet|contracts|split)<\/loc>/);
 for(const file of await readdir('dist/assets')){
  if(!file.endsWith('.mjs'))continue;
  const js=await readFile('dist/assets/'+file,'utf8');assert.doesNotMatch(js,/['"`]\/api\//,file);
 }
 for(const file of ['public-apps.mjs','public-assets-ui.mjs','public-token.mjs','public-receipt.mjs','public-asset-signing.mjs','public-asset-recovery.mjs','public-contracts.mjs','public-templates.json','kaspa/kaspa.js','kaspa/kaspa_bg.wasm'])await access('dist/assets/'+file);
});
