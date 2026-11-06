// Fails if the road or the walker touches text: the road (±8 px) and the walker (±14 px wide, 36 px
// tall above his feet) are checked against every visible line of text in <main>, at 1440, 834 and 390 px.
import { chromium } from 'playwright';
import path from 'node:path';
import { serve } from './serve.mjs';

const { server, port } = await serve(path.resolve('dist'));
const browser = await chromium.launch();
let failed = 0;
for (const w of [1440, 834, 390]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
  await page.goto(`http://127.0.0.1:${port}/?3d=off`, { waitUntil: 'load' });
  await page.waitForTimeout(1000);
  const hits = await page.evaluate(() => {
    const rects = [];
    const tw = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT);
    let n;
    while ((n = tw.nextNode())) {
      if (!n.textContent.trim()) continue;
      const el = n.parentElement;
      if (!el || el.closest('svg,[aria-hidden=true],.sr,#thread,#walker')) continue;
      const dt = el.closest('details'); if (dt && !dt.open && !el.closest('summary')) continue;
      const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      const rg = document.createRange(); rg.selectNodeContents(n);
      for (const b of rg.getClientRects()) if (b.width > 1) rects.push({ x1: b.left + scrollX, x2: b.right + scrollX, y1: b.top + scrollY, y2: b.bottom + scrollY, t: n.textContent.trim().slice(0, 40) });
    }
    const p = document.getElementById('threadPath'); const L = p.getTotalLength(); const found = new Set();
    for (let l = 0; l < L; l += 6) {
      const q = p.getPointAtLength(l);
      for (const b of rects) {
        const road = q.x + 8 > b.x1 && q.x - 8 < b.x2 && q.y + 8 > b.y1 && q.y - 8 < b.y2;
        const walker = q.x + 14 > b.x1 && q.x - 14 < b.x2 && q.y > b.y1 && q.y - 36 < b.y2;
        if (road || walker) found.add(`${road ? 'road' : 'walker'}: "${b.t}"`);
      }
    }
    return [...found];
  });
  if (hits.length) { failed += hits.length; console.error(`check-road ${w}px: ${hits.length} collision(s)`); hits.forEach((h) => console.error('  ' + h)); }
  await page.close();
}
await browser.close(); server.close();
if (failed) process.exit(1);
console.log('check-road OK: the road and the walker touch no text at 1440, 834 and 390 px');
