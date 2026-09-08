import {mkdir,writeFile,readFile,copyFile,cp,mkdtemp,rename} from 'node:fs/promises';
import {documents,standalone} from '../src/page-registry.mjs';
import {site} from '../src/site.mjs';
import {escape} from '../src/components.mjs';
import {renderSiteShell} from '../src/site-shell.mjs';
import {legacyDestination} from './legacy-target.mjs';

if(process.env.KASPA_RELEASE && !['v1','v2'].includes(process.env.KASPA_RELEASE))throw new Error('Choose release v1 or v2.');
await mkdir('.cache',{recursive:true});
const output=await mkdtemp('.cache/site-build-');
const destination=standalone?'dist-v1':'dist';
await mkdir(`${output}/assets`,{recursive:true});
export const shell=renderSiteShell;
for(const page of documents){await writeFile(`${output}/${page.file}`,shell(page));if(page.publicPath){await mkdir(`${output}/${page.publicPath.slice(1).split('/').slice(0,-1).join('/')}`,{recursive:true});await writeFile(`${output}${page.publicPath}.html`,shell(page));}}
for(const name of ['app.mjs','learning-ui.mjs','site-design.css','use-case-demo.mjs','use-case-demo.css','network-diagram.mjs','models.mjs','app.css','money-app.mjs','money-models.mjs','coordination.mjs','coordination.css','network-diagram.css','mechanism-diagrams.mjs','mechanism-diagrams.css','flow-diagrams.mjs','flow-diagrams.css'])await copyFile(`src/${name}`,`${output}/assets/${name}`);
if(!standalone){
  for(const name of ['v6-app.mjs','v6-progress.mjs','v6-ui.mjs','v6-lessons.mjs','v6-world.mjs','v6-world-assets.mjs','v6-dag.mjs','v6.css'])await copyFile(`src/${name}`,`${output}/assets/${name}`);
  await cp('src/assets/v6',`${output}/assets/v6`,{recursive:true});
  for(const name of ['v5-presentation.mjs','v5-experience-scenarios.mjs','v5-experience-scene.mjs','v5-experience.css','v5-advanced-story.mjs','v5-advanced-ui.mjs','v5-app.mjs','v5-town.mjs','v5-town-model.mjs','v5-economy.mjs','v5-market-wallet.mjs','v5-wallet.mjs','v5-ui.mjs','v5.css','v5-argent-protocol.mjs','v5-argent-templates.json'])await copyFile(`src/${name}`,`${output}/assets/${name}`);
  await copyFile('docs/wrap-poc-roundtrip-verification.json',`${output}/assets/wrap-poc-roundtrip.json`);
  for(const name of ['wrap-ui.mjs','wrap-local-client.mjs','wrap.css','public-apps.mjs','public-apps.css','public-contracts.mjs','public-recovery.mjs','public-assets-ui.mjs','public-token.mjs','public-receipt.mjs','public-asset-signing.mjs','public-asset-recovery.mjs','public-acceptance.mjs','public-transaction.mjs'])await copyFile(`src/${name}`,`${output}/assets/${name}`);
  for(const name of ['v4-economy-story.mjs','v4-economy-protocol.mjs','v4-economy-model.mjs','v4-world-props.mjs','v4-activity-view.mjs','v4-mining-model.mjs','v4-mining-ui.mjs','public-argent-ui.mjs','public-argent-protocol.mjs','public-argent-templates.json','v4-game.mjs','v4-technical-map.mjs','v4-live-story.mjs','v4-legacy-services.mjs','v4-world-model.mjs','v4-world-3d.mjs','v4-showcase-page.mjs','v4-showcase.css','v4-game.css','public-v4-ui.mjs','public-v4-protocol.mjs','public-v4-extra.mjs','public-v4-composed.mjs','v4-dag-view.mjs','v4-dag-3d.mjs'])await copyFile(`src/${name}`,`${output}/assets/${name}`);
  const v4Sources={};for(const kind of ['agent','bundle','compute','launch','terrarium','vault'])v4Sources[`contracts/public/v4-${kind}.sil`]=await readFile(`contracts/public/v4-${kind}.sil`,'utf8');for(const name of ['capped-token','backed-receipt','application-escrow','shared-treasury','prediction-escrow','proof-payout'])v4Sources[`contracts/public/${name}.sil`]=await readFile(`contracts/public/${name}.sil`,'utf8');for(const name of ['warden','creature'])for(const ext of ['ag','sil']){const path=ext==='ag'?`contracts/public/argent-habitat/${name}.ag`:`contracts/public/argent-habitat/generated/${name[0].toUpperCase()+name.slice(1)}.sil`;v4Sources[path]=await readFile(path,'utf8');}await writeFile(`${output}/assets/v4-contract-source.json`,JSON.stringify(v4Sources));
  const v5Sources={};for(const path of ['contracts/public/argent-market/business.ag','contracts/public/argent-market/generated/Business.sil','contracts/public/argent-market/ring.ag','contracts/public/argent-market/generated/Ring.sil','contracts/public/argent-market/delivery.ag','contracts/public/argent-market/generated/Delivery.sil'])v5Sources[path]=await readFile(path,'utf8');await writeFile(`${output}/assets/v5-contract-source.json`,JSON.stringify(v5Sources));
  await cp('src/vendor/three',`${output}/assets/vendor/three`,{recursive:true});
  await mkdir(`${output}/assets/kaspa`,{recursive:true});
  for(const name of ['kaspa.js','kaspa_bg.wasm','LICENSE'])await copyFile(`.cache/upstream/kaspa-wasm32-sdk/web/kaspa/${name}`,`${output}/assets/kaspa/${name}`);
  await copyFile('.cache/public-templates/templates.json',`${output}/assets/public-templates.json`);
}
for(const name of ['favicon.svg','favicon.ico','favicon.png','og-kaspa-explained.png','carnot-local-brownian-global.pdf','the-instrument.pdf','LICENSE.md','THIRD_PARTY.md'])await copyFile(name,`${output}/${name}`);
await cp('licenses',`${output}/licenses`,{recursive:true});
const aliases=JSON.parse(await readFile('src/legacy-routes.json','utf8'));
if(!standalone)for(const name of ['testnet','contracts','split','experiment/index','experiment/board','experiment/discover','experiment/polls','experiment/tipjar','experiment/vault'])aliases[name]='/applications';
const resolveAlias=(url,visited=new Set())=>{const key=url.split('#')[0].replace(/^\//,'').replace(/\.html$/,'');if(visited.has(key))return '/search';visited.add(key);return aliases[key]?resolveAlias(aliases[key],visited):url;};
for(const [name,target] of Object.entries(aliases)){const url=resolveAlias(target);const targetFile=url.split('#')[0].slice(1)||'index';const targetPage=documents.find(page=>page.file===targetFile+'.html');const ids=targetPage?[...targetPage.body.matchAll(/(?:id|data-workspace)="([^"]+)"/g)].map(match=>match[1]):[];await mkdir(`${output}/${name.split('/').slice(0,-1).join('/')}`,{recursive:true});await writeFile(`${output}/${name}.html`,`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page moved · Kaspa Explained</title><script>location.replace((${legacyDestination.toString()})(${JSON.stringify(url)},location.hash,${JSON.stringify(ids)}));</script><noscript><meta http-equiv="refresh" content="0;url=${escape(url)}"></noscript></head><body><a href="${escape(url)}">Continue to the explanation</a></body></html>`);}
await writeFile(`${output}/sitemap.xml`,`<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${documents.filter(p=>p.file!=='404.html'&&!p.unlisted).map(p=>`<url><loc>${site.domain}/${p.file==='index.html'?'':p.file.replace('.html','')}</loc></url>`).join('')}</urlset>`);
await writeFile(`${output}/robots.txt`,'User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: https://kaspaexplained.com/sitemap.xml\n');
await writeFile(`${output}/CNAME`,'kaspaexplained.com\n');
await writeFile(`${output}/.nojekyll`,'');
// Preserve the previous generated tree until the replacement has been installed.
const previous=output+'-previous';let moved=false;
try{await rename(destination,previous);moved=true;}catch(error){if(error.code!=='ENOENT')throw error;}
try{await rename(output,destination);}catch(error){if(moved)await rename(previous,destination);throw error;}
console.log(`Built ${documents.length} pages and ${Object.keys(aliases).length} compatibility routes in ${destination}/.`);
