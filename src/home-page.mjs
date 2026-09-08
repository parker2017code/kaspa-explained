import {renderUseCaseStories} from './use-case-stories.mjs';
import {heroDiagram} from './site-visuals.mjs';
import {learningRoute} from './learning-path.mjs';
import {escape} from './components.mjs';
const routes=items=>`<nav class="topic-list" aria-label="Related explanations">${items.map(([title,description,href])=>`<a href="${escape(href)}"><div><strong>${escape(title)}</strong><p>${escape(description)}</p></div><span aria-hidden="true">↗</span></a>`).join('')}</nav>`;

export function homePage({standalone=false}={}){
  return {file:'index.html',title:'Kaspa Explained',description:'Understand Kaspa through clear explanations and interactive examples. Follow payments, explore parallel blocks, and test what spending rules enforce.',body:`
    <section class="site-hero" aria-labelledby="site-title">
      <div class="site-hero-copy"><p class="eyebrow">An independent guide to Kaspa</p><h1 id="site-title">Understand what happens to your payment.</h1><p class="lead">Kaspa is a proof-of-work network for sending its native coin, KAS. Its miners can create blocks in parallel. Follow how those blocks become an ordered history, and what makes a payment valid.</p><div class="action-row"><a class="primary-button" href="/what-is-kaspa">Start with the basics <span aria-hidden="true">→</span></a><a href="/playground">Try an interactive model <span aria-hidden="true">↗</span></a></div><p class="site-hero-note">Explanations you can inspect. Sources you can check.</p><p data-learning-resume hidden></p></div>
      <figure class="site-hero-visual">${heroDiagram()}<figcaption>Illustration of parallel blocks and a payment. This is not live network data.</figcaption></figure>
    </section>
    ${renderUseCaseStories({standalone:true})}
    ${learningRoute()}
    <section class="chapter" aria-labelledby="find-topic"><div class="section-title"><h2 id="find-topic">Find the part you need</h2><p>Go directly to practical guidance, technical detail or the evidence behind a claim.</p></div>${routes([
      ['Wallets and payments','Understand keys, change and fees, and inspect a transaction.','/why-kaspa-matters'],
      ['Mining and supply','Explore a miner’s share of discoveries and the costs around it.','/kaspa-mining'],
      ['Building applications','Connect spending rules to compilers, recovery and application design.','/build-on-kaspa'],
      ['Network and tool status','Check dated evidence for active rules, releases and experimental tools.','/status'],
      ['Programmable money','Explore reserves, collateral and conditional payouts.','/money'],
      ['Sources and further reading','Check the references, research history and books by Moose.','/sources'],
    ])}</section>
    <nav class="reading-next" aria-label="Continue learning"><p>Begin with the network</p><a href="/what-is-kaspa">How parallel blocks become a usable payment history <span aria-hidden="true">→</span></a></nav>`};
}
