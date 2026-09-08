import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {documents,standalone} from '../src/page-registry.mjs';
const directory=standalone?'dist-v1':'dist';
test('current pages and compatibility destinations resolve in generated output',async()=>{
  const aliases=JSON.parse(await readFile('src/legacy-routes.json','utf8'));
  const failures=[];
  const inspect=async(href,from)=>{
    if(!href.startsWith('/')||href.startsWith('//'))return;
    const url=new URL(href,'https://kaspaexplained.com');
    let path=url.pathname==='/'?'index.html':url.pathname.slice(1);
    if(!path.split('/').at(-1).includes('.'))path+='.html';
    try{await stat(directory+'/'+path);}catch{failures.push(`${from}: missing ${href}`);return;}
    if(url.hash&&path.endsWith('.html')){
      const html=await readFile(directory+'/'+path,'utf8'),id=url.hash.slice(1);
      if(!html.includes(`id="${id}"`)&&!html.includes(`data-workspace="${id}"`))failures.push(`${from}: missing fragment ${href}`);
    }
  };
  for(const page of documents){const html=await readFile(directory+'/'+page.file,'utf8');for(const m of html.matchAll(/(?:href|src)="([^"]+)"/g))await inspect(m[1],page.file);}
  for(const [name,url] of Object.entries(aliases))await inspect(url,name);
  assert.deepEqual(failures,[]);
});

test('homepage directory includes every public page and keeps unlisted routes out',()=>{
  const home=documents.find(page=>page.file==='index.html');
  const directory=home.body.match(/<nav class="topic-list" aria-label="All public pages">([\s\S]*?)<\/nav>/)?.[1];
  assert.ok(directory,'The homepage exposes the public directory');
  const hrefs=[...directory.matchAll(/href="([^"]+)"/g)].map(match=>match[1]);
  const expected=documents.filter(page=>page.file!=='404.html'&&!page.unlisted).map(page=>page.publicPath||('/'+(page.file==='index.html'?'':page.file.replace(/\.html$/,''))));
  assert.deepEqual(hrefs,expected);
  assert.equal(new Set(hrefs).size,hrefs.length);
});
