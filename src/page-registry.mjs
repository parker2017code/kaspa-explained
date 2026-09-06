import {pages,searchPage} from './pages.mjs';
import {testnetPage} from './testnet-page.mjs';
import {contractsPage} from './contracts-page.mjs';
import {moneyPage} from './money-page.mjs';
import {splitPage} from './split-page.mjs';
import {publicAppsPage} from './public-apps-page.mjs';

export const standalone=process.env.KASPA_RELEASE==='v1';
const contentPages=[...pages,moneyPage,...(standalone?[]:[testnetPage,contractsPage,splitPage,publicAppsPage])];
export const documents=[...contentPages,searchPage(contentPages)];
