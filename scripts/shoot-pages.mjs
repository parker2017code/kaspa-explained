// Full-page screenshots at every width and both themes, for human review.
//
// Renders in a real browser at a real viewport. It never touches the operator's
// own browser window: playwright drives its own instance.
//
// Usage: node scripts/shoot-pages.mjs outdir base "path1,path2" [widths] [themes]
import { chromium } from 'playwright';
import fs from 'node:fs';

const [outdir, base, pathsCsv, widthsCsv = '320,390,768,1024,1280,1600', themesCsv = 'dark,light'] =
  process.argv.slice(2);
const paths = pathsCsv.split(',').filter(Boolean);
const widths = widthsCsv.split(',').map(Number);
const themes = themesCsv.split(',');
fs.mkdirSync(outdir, { recursive: true });

const browser = await chromium.launch();
const report = [];
for (const theme of themes) {
  for (const w of widths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
    await ctx.addInitScript((t) => {
      try { localStorage.setItem('ke-theme', t); localStorage.setItem('theme', t); } catch {}
    }, theme);
    const page = await ctx.newPage();
    for (const p of paths) {
      const slug = (p === '/' ? 'index' : p.replace(/^\//, '').replace(/\//g, '_'));
      const file = `${outdir}/${slug}__${w}__${theme}.png`;
      try {
        await page.goto(base + p, { waitUntil: 'load', timeout: 30000 });
        await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
        await page.waitForTimeout(700);
        // Horizontal overflow is a defect at every width; record it while here.
        const diag = await page.evaluate(() => {
          const de = document.documentElement;
          // Visible means actually painted for a reader. Hidden tooltip panels
          // and collapsed disclosures legitimately sit outside the viewport and
          // are not defects; counting them made this check fire on every page,
          // which is the same as not checking.
          const visible = (el) => {
            if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') return false;
            const s = getComputedStyle(el);
            if (s.visibility === 'hidden' || s.display === 'none' || +s.opacity === 0) return false;
            if (el.closest('[hidden],[aria-hidden=true],details:not([open])')) return false;
            // Screen-reader-only text is a 1px clipped box on purpose; its
            // content overflowing that box is the technique working, not a bug.
            const r0 = el.getBoundingClientRect();
            if (r0.width <= 2 || r0.height <= 2) return false;
            if (el.matches('.sr-only,.visually-hidden,.screen-reader-text')) return false;
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.height > 0;
          };
          const name = (el) => el.tagName.toLowerCase() +
            (typeof el.className === 'string' && el.className.trim()
              ? '.' + el.className.trim().split(/\s+/)[0] : '');
          const els = [...document.querySelectorAll('body *')].filter(visible);
          // Wide content is allowed to exceed the viewport when an ancestor
          // scrolls it, which is what the standard asks for: the box scrolls,
          // the page does not. Flagging those made this report 16 false
          // positives on tables that were behaving correctly.
          const inScroller = (el) => {
            let n = el.parentElement;
            while (n && n !== document.body) {
              const ox = getComputedStyle(n).overflowX;
              if (ox === 'auto' || ox === 'scroll') return true;
              n = n.parentElement;
            }
            return false;
          };
          const over = els
            .filter((el) => el.getBoundingClientRect().right > de.clientWidth + 1)
            .filter((el) => !inScroller(el))
            .slice(0, 6).map(name);
          // Text clipped by its own box: content wider than the box, no scroll
          // affordance, and the box is not deliberately truncating with ellipsis.
          const clipped = els
            .filter((el) => el.children.length === 0 &&
                            el.textContent.trim().length > 0 &&
                            el.scrollWidth > el.clientWidth + 1 &&
                            !['auto', 'scroll'].includes(getComputedStyle(el).overflowX) &&
                            getComputedStyle(el).textOverflow !== 'ellipsis')
            .slice(0, 6)
            .map((el) => name(el) + ': ' + el.textContent.trim().slice(0, 30));
          const tiny = els.filter((el) =>
            el.matches('a[href],button,[role=button],input,select') &&
            (el.getBoundingClientRect().height < 44 || el.getBoundingClientRect().width < 44) &&
            el.textContent.trim().length > 0).slice(0, 6).map(name);
          return { scrollW: de.scrollWidth, clientW: de.clientWidth, over, clipped, tiny };
        });
        await page.screenshot({ path: file, fullPage: true });
        report.push({ path: p, w, theme, file, ...diag });
      } catch (e) {
        report.push({ path: p, w, theme, error: String(e).slice(0, 100) });
      }
    }
    await ctx.close();
  }
}
await browser.close();
fs.writeFileSync(`${outdir}/report.json`, JSON.stringify(report, null, 2) + '\n');
// Count every defect field. An earlier version omitted `over` from this
// filter and printed "0 with overflow" while report.json held 16 renders with
// overflowing elements, which is a summary that contradicts its own data.
const bad = report.filter((r) => r.error ||
  (r.scrollW > r.clientW + 1) ||
  (r.clipped || []).length ||
  (r.over || []).length ||
  (r.tiny || []).length);
console.error(`shot ${report.length} renders, ${bad.length} with a defect ` +
  `(page-scroll, element overflow, clipped text, or sub-44px target)`);
for (const b of bad.slice(0, 25)) {
  console.error(`  ${b.path} @${b.w} ${b.theme}: ` +
    (b.error ? b.error : `scroll ${b.scrollW}>${b.clientW} over=[${(b.over||[]).join(', ')}] clipped=[${(b.clipped||[]).join(' | ')}]`));
}
