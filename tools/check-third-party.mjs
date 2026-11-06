// Fails on: any request to another origin, any cookie, any storage write, any CSP violation,
// any console error. Loads dist/, scrolls the whole page and uses each interactive section.
import { chromium } from 'playwright';
import path from 'node:path';
import { serve } from './serve.mjs';

const dist = path.resolve('dist');
const { server, port } = await serve(dist);
const origin = `http://127.0.0.1:${port}`;
const problems = [];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => {
  window.__storageWrites = [];
  for (const [name, proto] of [['localStorage', Storage.prototype]]) {
    const set = proto.setItem;
    proto.setItem = function (k, v) { window.__storageWrites.push(`${name}.${k}`); return set.call(this, k, v); };
  }
  document.addEventListener('securitypolicyviolation', (e) => window.__storageWrites.push(`CSP ${e.violatedDirective} ${e.blockedURI}`));
});

for (const url of ['/', '/privacy/', '/terms/', '/support/']) {
  const page = await ctx.newPage();
  page.on('request', (r) => { const u = r.url(); if (!u.startsWith(origin) && !u.startsWith('data:') && !u.startsWith('blob:')) problems.push(`${url}: request to ${u}`); });
  page.on('console', (m) => { if (m.type() === 'error') problems.push(`${url}: console error: ${m.text()}`); });
  page.on('pageerror', (e) => problems.push(`${url}: page error: ${e.message}`));
  await page.goto(origin + url, { waitUntil: 'load' });

  if (url === '/') {
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 450) { await page.evaluate((v) => scrollTo(0, v), y); await page.waitForTimeout(90); }
    await page.evaluate(() => document.getElementById('modes').scrollIntoView());
    await page.waitForTimeout(900);
    const box = await page.locator('#pad').boundingBox();
    await page.mouse.move(box.x + 30, box.y + 30); await page.mouse.down();
    await page.mouse.move(box.x + 150, box.y + 90, { steps: 8 }); await page.mouse.up();
    for (const m of ['listen', 'cinema', 'live']) await page.click(`#tab-${m}`);
    await page.locator('#unplug').scrollIntoViewIfNeeded(); await page.click('#unplug');
    await page.locator('#faq summary').first().click();
    await page.locator('#dot').scrollIntoViewIfNeeded(); await page.click('#dot');
    await page.waitForTimeout(400);
    const n = await page.locator('#tp').textContent();
    if (n !== '0') problems.push(`/: footer counter shows ${n}, expected 0`);
    if (!(await page.evaluate(() => getComputedStyle(document.querySelector('#threadPath')).strokeDashoffset !== 'none'))) problems.push('/: thread not drawn');
  }
  const writes = await page.evaluate(() => window.__storageWrites);
  for (const w of writes) problems.push(`${url}: ${w}`);
  const ls = await page.evaluate(() => localStorage.length + sessionStorage.length);
  if (ls) problems.push(`${url}: storage has ${ls} entries`);
  await page.close();
}
const cookies = await ctx.cookies();
if (cookies.length) problems.push(`cookies set: ${cookies.map((c) => c.name).join(', ')}`);
await browser.close(); server.close();

if (problems.length) { console.error('check-third-party FAILED:\n- ' + problems.join('\n- ')); process.exit(1); }
console.log('check-third-party OK: 4 pages, 0 other-origin requests, 0 cookies, 0 storage writes, 0 CSP violations, 0 console errors');
