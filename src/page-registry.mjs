import {pages,searchPage} from './pages.mjs';
import {moneyPage} from './money-page.mjs';
import {v4Page} from './v4-page.mjs';
import {v5Page} from './v5-page.mjs';
import {v6Page} from './v6-page.mjs';
import {publicAppsPage} from './public-apps-page.mjs';
import {wrapPage} from './wrap-page.mjs';
import {homePage} from './home-page.mjs';
import {testnetWorkspacePage} from './testnet-workspace-page.mjs';
import {experimentsPage} from './experiments-page.mjs';

export const standalone=process.env.KASPA_RELEASE==='v1';
const contentPages=[...pages.map(page=>page.file==='index.html'?homePage({standalone}):page),moneyPage,...(standalone?[]:[publicAppsPage,v4Page,{...v5Page,unlisted:true,publicPath:'/covenants/v5',file:'covenants-v5.html',title:'Sprout Harbor V5 · A KAS economy'},{...v6Page,unlisted:true,publicPath:'/covenants/v6'},experimentsPage,testnetWorkspacePage,wrapPage])];
export const documents=[...contentPages,searchPage(contentPages)];
