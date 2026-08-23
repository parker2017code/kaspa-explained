import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const runtimeModules =
  process.env.NODE_PATH ||
  process.env.HOME + '/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  ({ chromium } = require(runtimeModules + '/playwright'));
}

const ROOT = '/Users/parkerschmidt/Documents/repos/kaspa-explained';
const file = process.argv[2];
const ids = process.argv.slice(3);

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
const url = pathToFileURL(path.join(ROOT, file)).href;
await page.goto(url, { waitUntil: 'load', timeout: 20000 });
await page.waitForTimeout(200);

for (const id of ids) {
  const words = await page.evaluate((id) => {
    const el = document.getElementById(id) || document.querySelector(id);
    if (!el) return null;
    const text = el.innerText || el.textContent || '';
    return text.trim().split(/\s+/).filter(Boolean).length;
  }, id);
  console.log(id, words);
}
await browser.close();
