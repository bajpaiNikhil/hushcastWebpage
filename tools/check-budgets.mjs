// Budgets from CLAUDE.md / PRD 9.5. Sizes are gzip (a stand-in for the host's compression).
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const dist = path.resolve('dist');
const KB = 1024;
const gz = (f) => zlib.gzipSync(fs.readFileSync(f), { level: 9 }).length;
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const files = walk(dist);
const problems = [];
const report = [];

// Initial load of the home page: HTML + the CSS and JS it references directly (not lazy chunks).
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const refs = [...html.matchAll(/(?:src|href)="(\/_astro\/[^"]+\.(?:js|css))"/g)].map((m) => m[1]);
// follow static imports of those modules
const seen = new Set(); const queue = [...refs];
while (queue.length) {
  const r = queue.pop(); if (seen.has(r)) continue; seen.add(r);
  const f = path.join(dist, r);
  if (r.endsWith('.js')) for (const m of fs.readFileSync(f, 'utf8').matchAll(/^import[^'"]*['"]\.\/([^'"]+)['"]/gm)) queue.push('/_astro/' + m[1]);
}
const initial = [path.join(dist, 'index.html'), ...[...seen].map((r) => path.join(dist, r))];
const initialSize = initial.reduce((a, f) => a + gz(f), 0);
report.push(`initial HTML+CSS+JS: ${(initialSize / KB).toFixed(1)} KB (budget 150)`);
if (initialSize > 150 * KB) problems.push('initial HTML+CSS+JS over 150 KB');

// 3D code (three.js + scene modules) is lazy and counted against the 3D budgets, not page JS.
const is3d = (f) => /^(three|hero|icon|stage)\./.test(path.basename(f));
const js = files.filter((f) => f.endsWith('.js') && f.includes('_astro'));
const pageJs = js.filter((f) => !is3d(f)), js3d = js.filter(is3d);
const jsSize = pageJs.reduce((a, f) => a + gz(f), 0);
report.push(`page JS total: ${(jsSize / KB).toFixed(1)} KB (budget 60), ${pageJs.length} files`);
if (jsSize > 60 * KB) problems.push('page JS over 60 KB');
for (const f of initial) if (is3d(f)) problems.push(`3D code in the initial load: ${path.basename(f)}`);
const js3dSize = js3d.reduce((a, f) => a + gz(f), 0);
report.push(`3D JS (lazy): ${(js3dSize / KB).toFixed(1)} KB: ${js3d.map((f) => `${path.basename(f)} ${(gz(f) / KB).toFixed(1)}`).join(', ')}`);

// Posters
for (const f of files.filter((f) => /poster.*\.(avif|webp|png|jpe?g)$/i.test(f))) {
  const s = fs.statSync(f).size; report.push(`poster ${path.relative(dist, f)}: ${(s / KB).toFixed(1)} KB (budget 60)`);
  if (s > 60 * KB) problems.push(`${path.relative(dist, f)} over 60 KB`);
}
// 3D models: public/models/<scene>.gltf + <scene>.bin + <scene>-*.webp, counted per scene.
const SCENE = { hero: 350, wifi: 250, modes: 300, icon: 120 }; // A, B, C, D (KB)
const models = files.filter((f) => f.includes(`${path.sep}models${path.sep}`));
let modelTotal = 0; const sceneKB = {};
for (const f of models) {
  const scene = path.basename(f).split(/[.-]/)[0];
  const s = fs.statSync(f).size; modelTotal += s; sceneKB[scene] = (sceneKB[scene] || 0) + s;
}
for (const [scene, s] of Object.entries(sceneKB)) {
  const lim = SCENE[scene] ?? 120;
  report.push(`model ${scene}: ${(s / KB).toFixed(1)} KB (budget ${lim})`);
  if (s > lim * KB) problems.push(`model ${scene} over ${lim} KB`);
}
if (modelTotal) report.push(`3D models total: ${(modelTotal / KB).toFixed(1)} KB (budget 1229)`);
if (modelTotal > 1.2 * 1024 * KB) problems.push('3D models over 1.2 MB');
// PRD 9.5: hero 3D (lazy, after LCP) <= 350 KB = three.js + scene code + hero model
if (sceneKB.hero) {
  const heroTotal = js3d.filter((f) => !/^icon\./.test(path.basename(f))).reduce((a, f) => a + gz(f), 0) + sceneKB.hero;
  report.push(`hero 3D transfer (three.js + scene code + model): ${(heroTotal / KB).toFixed(1)} KB (budget 350)`);
  if (heroTotal > 350 * KB) problems.push('hero 3D over 350 KB');
}
// The film: self-hosted, never part of the initial load (preload="none", no autoplay)
for (const f of files.filter((f) => f.includes(`${path.sep}media${path.sep}`))) report.push(`film ${path.basename(f)}: ${(fs.statSync(f).size / KB).toFixed(0)} KB (on demand)`);
for (const m of html.matchAll(/<video\b[^>]*>/g)) {
  if (!/preload="none"/.test(m[0])) problems.push('a <video> without preload="none"');
  if (/\bautoplay\b/.test(m[0])) problems.push('a <video> with autoplay');
}
// Fonts: none allowed
for (const f of files.filter((f) => /\.(woff2?|ttf|otf)$/i.test(f))) problems.push(`font file shipped: ${path.relative(dist, f)}`);

console.log(report.join('\n'));
if (problems.length) { console.error('check-budgets FAILED:\n- ' + problems.join('\n- ')); process.exit(1); }
console.log('check-budgets OK');
