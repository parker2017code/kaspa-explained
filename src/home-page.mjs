import {renderUseCaseStories} from './use-case-stories.mjs';
import {learningRoute} from './learning-path.mjs';
import {escape,transaction} from './components.mjs';

export function homePage({standalone=false,directory=[]}={}){
  const publicPages=directory.filter(page=>page.file!=='404.html'&&!page.unlisted);
  return {file:'index.html',title:'Kaspa Explained',description:'Understand Kaspa through clear explanations and interactive examples. Follow payments, explore parallel blocks, and test what spending rules enforce.',body:`
    <section class="site-hero site-hero-interactive" aria-labelledby="site-title">
      <div class="site-hero-copy"><p class="eyebrow">An independent guide to Kaspa</p><h1 id="site-title">Send a payment.<br>See where it goes.</h1><p class="lead">Kaspa is a network for sending its coin, KAS. Try a payment with 12.5 example KAS. Move the amount and watch what comes back to you.</p><div class="action-row"><a href="/what-is-kaspa">How the network checks it <span aria-hidden="true">→</span></a><a href="#explore-everything">Explore everything <span aria-hidden="true">↓</span></a></div><p data-learning-resume hidden></p></div>
      <div class="site-hero-model">${transaction({direct:true})}</div>
    </section>
    ${learningRoute()}
    ${renderUseCaseStories({standalone:true})}
    <section class="chapter site-directory" id="explore-everything" aria-labelledby="directory-title"><div class="section-title"><h2 id="directory-title">Explore everything</h2><p>${publicPages.length} public pages. ${standalone?'Pick an explanation or a model. The teaching models run locally.':'Pick an explanation, a model, or a testnet application. Testnet pages use test coins; the teaching models run locally.'}</p></div><nav class="topic-list" aria-label="All public pages">${publicPages.map(page=>`<a href="${escape(page.publicPath||('/'+(page.file==='index.html'?'':page.file.replace(/\.html$/,''))))}"><div><strong>${escape(page.title)}</strong><p>${escape(page.description)}</p></div><span aria-hidden="true">↗</span></a>`).join('')}</nav></section>
    <nav class="reading-next" aria-label="Continue learning"><p>Begin with the network</p><a href="/what-is-kaspa">How parallel blocks become a usable payment history <span aria-hidden="true">→</span></a></nav>`};
}
