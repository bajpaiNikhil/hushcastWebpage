// Renders the hero posters from the real three.js scene, so poster and 3D match pixel for pixel.
// Usage: npm run build && node tools/render-posters.mjs
// Writes public/posters/hero-{start,end}.avif and .webp (needs ffmpeg 6.1+ with libaom-av1 and libwebp) and prints
// the anchor positions to put in global.css (.anc-tablet / .anc-laptop).
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import { serve } from './serve.mjs';

const { server, port } = await serve(path.resolve('dist'));
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const out = path.resolve('public/posters'); fs.mkdirSync(out, { recursive: true });
for (const state of ['start', 'end']) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', (m) => { if (m.type() === 'error') console.error('page:', m.text()); });
  await page.goto(`http://127.0.0.1:${port}/?poster=${state}`, { waitUntil: 'load' });
  let res = null;
  for (let i = 0; i < 60 && !res; i++) {
    await page.waitForTimeout(250);
    res = await page.evaluate(() => (window.__hcPoster ? window.__hcPoster() : null));
  }
  if (!res) throw new Error(`poster ${state}: scene never became ready`);
  const png = path.join(os.tmpdir(), `hero-${state}.png`);
  fs.writeFileSync(png, Buffer.from(res.png.split(',')[1], 'base64'));
  try {
    // flattened onto the page colour: the signal line no longer runs behind the stage, and an opaque
    // poster is far smaller (the CSS mask still fades its edges into the page)
    const flat = 'color=c=0x0B0B0D:s=1600x1250[bg];[bg][0:v]overlay=format=auto:shortest=1,format=yuv420p';
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', png, '-filter_complex', flat, '-frames:v', '1', '-c:v', 'libaom-av1', '-still-picture', '1', '-crf', '30', '-cpu-used', '4', path.join(out, `hero-${state}.avif`)]);
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', png, '-filter_complex', flat, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '70', path.join(out, `hero-${state}.webp`)]);
  } catch { console.warn('ffmpeg (with libaom-av1 and libwebp) not found: posters not written'); }
  for (const ext of ['webp', 'avif']) { const f = path.join(out, `hero-${state}.${ext}`); if (fs.existsSync(f)) console.log(`hero-${state}.${ext}: ${(fs.statSync(f).size / 1024).toFixed(1)} KB`); }
  console.log(state, 'anchors (left%, top%):', res.anchors.map((a) => a.map((n) => n.toFixed(2)).join(', ')).join(' | '));
  await page.close();
}
await browser.close(); server.close();
