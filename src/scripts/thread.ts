import { RM, $, $$, clamp, lazy } from './util';
import { why3dOff } from './scenes/gate';
import { buildGrid, route, smooth, type Pt } from './route';

const NS = 'http://www.w3.org/2000/svg';
const tsvg = $<SVGSVGElement>('#thread'), tLive = $<SVGSVGElement>('#threadLive'), tGhost = $('#threadGhost'), tPath = $<SVGPathElement>('#threadPath');
const rEdge = $('#roadEdge'), rSurf = $('#roadSurf'), tNodes = $('#threadNodes');

interface Anchor { x: number; y: number; kind: string; el: Element; len: number; node?: SVGCircleElement }
interface Sample { l: number; y: number; my: number }
/* The road's points:
   - [data-thread] fixed waypoints. "left" = a section's left edge (the road passes 56 px left of the text);
     anything else (the hero exit, the end beside the icon) is a point in open space.
   - [data-visit] places it travels to on a wide page (the devices in How it works, the router), routed
     around every line of text by route.ts.
   - [data-stop] things he reaches when he walks past their height (and visits the road could not reach). */
export const T = { total: 0, samples: [] as Sample[], anchors: [] as Anchor[], stops: [] as Anchor[], ready: false };
let drawn = 0;
export const getDrawn = () => drawn;
export { tPath };

// The gutter: as far left of the text as the page allows (56 px on a wide page, the 14 px minimum on a
// phone), so the road, the walker and the light in his hand stay clear of the text edge.
const GUTTER = 56;
function anchorPoint(el: Element, W: number) {
  const r = el.getBoundingClientRect();
  if (!r.width && !r.height) return null;
  const kind = (el as HTMLElement).dataset.thread || 'center';
  let x = r.left + scrollX + r.width / 2, y = r.top + scrollY + r.height / 2;
  if (kind === 'left') { x = r.left + scrollX - GUTTER; y = r.top + scrollY + 26; }
  return { x: clamp(x, 14, W - 14), y, kind, el, len: 0 } as Anchor;
}
export function buildThread() {
  const W = document.documentElement.clientWidth;
  for (const sv of [tsvg, tLive]) { sv.style.width = W + 'px'; sv.style.height = '0px'; }
  const H = document.documentElement.scrollHeight;
  for (const sv of [tsvg, tLive]) { sv.setAttribute('viewBox', `0 0 ${W} ${H}`); sv.style.height = H + 'px'; }
  // Waypoints: the fixed ones ([data-thread]) and, on a wide page, the things he visits on the way
  // ([data-visit]: the devices in How it works, the router in the house). Top to bottom.
  const wide = W >= 981;
  const wps = $$(wide ? '[data-thread],[data-visit]' : '[data-thread]')
    .flatMap((el) => { const a = anchorPoint(el, W); return a ? [a] : []; })
    .sort((a, b) => a.y - b.y);
  if (wps.length < 2) return;
  // Route each leg around the text. A visit the road cannot reach cleanly is dropped (he still reaches
  // it by height, as a stop); a fixed point that cannot be reached cleanly is joined straight (and
  // tools/check-road.mjs will say so).
  const grid = buildGrid(W, H);
  const pts: Pt[] = [wps[0]]; const at: number[] = [0]; const used: Anchor[] = [wps[0]];
  let last = wps[0];
  for (const w of wps.slice(1)) {
    let leg = route(grid, last, w);
    if (!leg) { if ((w.el as HTMLElement).dataset.visit !== undefined) continue; leg = [last, w]; }
    for (const p of leg.slice(1)) pts.push({ x: clamp(p.x, 14, W - 14), y: p.y });
    at.push(pts.length - 1); used.push(w); last = w;
  }
  const sm = smooth(grid, pts);
  for (const el of [rEdge, rSurf, tGhost, tPath]) el.setAttribute('d', sm.d);
  const total = tPath.getTotalLength(), k = total / Math.max(1, sm.total);
  used.forEach((a, i) => { a.len = sm.lens[at[i]] * k; });
  const samples: Sample[] = sm.samples.map((p) => ({ l: p.l * k, y: p.y, my: 0 }));
  let m = -Infinity; for (const s of samples) { m = Math.max(m, s.y); s.my = m; }
  T.total = total; T.samples = samples; T.anchors = used;
  T.stops = $$('[data-stop]').filter((el) => !used.some((a) => a.el === el)).flatMap((el) => {
    const r = el.getBoundingClientRect(); if (!r.width && !r.height) return [];
    const y = r.top + scrollY + r.height / 2;
    return [{ x: 0, y, kind: 'stop', el, len: lenAtY(y) } as Anchor];
  });
  tPath.style.strokeDasharray = `${total} ${total}`;
  tNodes.textContent = '';
  used.forEach((p) => { if (p.kind === 'left') { const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', String(p.x)); c.setAttribute('cy', String(p.y)); c.setAttribute('r', '4'); tNodes.appendChild(c); p.node = c; } });
  T.ready = true; renderThread();
}

function lenAtY(y: number) {
  const s = T.samples; if (!s.length || y <= s[0].my) return 0;
  let lo = 0, hi = s.length - 1; if (y >= s[hi].my) return T.total;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (s[mid].my < y) lo = mid; else hi = mid; }
  const a = s[lo], b = s[hi]; return a.l + (b.l - a.l) * clamp((y - a.my) / Math.max(1e-6, b.my - a.my), 0, 1);
}

export function renderThread() {
  if (!T.ready) return;
  // The walker walks as far as the reader has scrolled: his target sits at 64% of the viewport.
  drawn = RM ? T.total : Math.min(T.total, lenAtY(scrollY + innerHeight * 0.64));
  if (RM) { paint(T.total); arriveAll(); return; }
  walk();
}

/* ---------- arrivals: when the walker reaches a stop, that section plays its one moment ----------
   The stop (the [data-thread] element) gets .arrived, and its step or section gets .met, once per
   page view. CSS and the section scripts start their moment from those classes (see onArrive).
   Without JS or with reduced motion nothing waits for him: everything shows in its final state. */
const arrivedEls = new WeakSet<Element>();
const bloomEls = [0, 1].map(() => { const b = document.createElement('i'); b.className = 'bloom'; b.setAttribute('aria-hidden', 'true'); document.body.appendChild(b); return b; });
let bloomI = 0, wLift = -1, firstPass = true;
function arrive(a: Anchor | null, el: Element, show: boolean) {
  if (arrivedEls.has(el)) return;
  arrivedEls.add(el);
  el.classList.add('arrived');
  el.closest('.step, section')?.classList.add('met');
  document.dispatchEvent(new CustomEvent('hc:arrive', { detail: el }));
  if (!show || !a || el.closest('#top, #get-app')) return;
  // a soft green ring opens where he stands, and he lifts his light for a beat
  const b = bloomEls[bloomI++ % 2];
  b.classList.remove('go'); b.style.left = a.x + 'px'; b.style.top = a.y + 'px';
  void b.offsetWidth; b.classList.add('go');
  wLift = 0;
}
function arriveAll() { $$('[data-thread],[data-stop]').forEach((el) => arrive(null, el, false)); }
function checkArrivals(len: number) {
  for (const a of T.anchors) if (a.kind !== 'gutter' && len >= a.len - 1) arrive(a, a.el, !firstPass);
  // a stop: the ring opens on the road beside it, where he is when he passes it
  for (const s of T.stops) if (len >= s.len - 1) { const p = tPath.getPointAtLength(s.len); arrive({ ...s, x: p.x, y: p.y }, s.el, !firstPass); }
  firstPass = false;
}
// the furthest the walker can go is where the page's last scroll position puts his target
function beyondReach(el: Element) {
  const a = T.anchors.find((p) => p.el === el && p.kind !== 'gutter') || T.stops.find((p) => p.el === el);
  const maxY = document.documentElement.scrollHeight - innerHeight + innerHeight * 0.64;
  return !a || a.len > lenAtY(maxY) + 1;
}
/** Run cb once the walker has reached el (at once if he already has, or if he never walks). */
export function onArrive(el: Element | null, cb: () => void) {
  if (!el) return;
  if (arrivedEls.has(el)) { cb(); return; }
  const h = (e: Event) => { if ((e as CustomEvent).detail === el) { document.removeEventListener('hc:arrive', h); cb(); } };
  document.addEventListener('hc:arrive', h);
}
// If the road cannot be built (or a stop sits where he never walks), a stop that has been on screen
// for a while arrives anyway, so no moment is ever held back for good.
const waitIO = new IntersectionObserver((es) => es.forEach((e) => {
  const el = e.target as HTMLElement & { _hcT?: number };
  if (e.isIntersecting) el._hcT ??= window.setTimeout(() => {
    el._hcT = undefined;
    if (T.ready && !RM && !beyondReach(el)) return; // he is on his way: let him get there
    waitIO.unobserve(el); arrive(null, el, false);
  }, 2200);
  else { clearTimeout(el._hcT); el._hcT = undefined; }
}), { threshold: 0.6 });
$$('[data-thread],[data-stop]').forEach((el) => waitIO.observe(el));
function paint(len: number) {
  tPath.style.strokeDashoffset = String(T.total - len);
  for (const a of T.anchors) if (a.node) a.node.classList.toggle('on', len >= a.len - 1);
}

/* ---------- the walker: a stick figure that walks the road as far as you have scrolled ---------- */
const walker = $('#walker'), wBody = $('#walkerBody');
const wLamp = $('#wLamp');
const W = { legB: $('#wLegB'), armB: $('#wArmB'), torso: $('#wTorso'), legF: $('#wLegF'), armF: $('#wArmF'), head: $('#wHead'), lamp: $('#wLamp'), glow: $('#wGlow') };
const WS = matchMedia('(max-width: 760px)').matches ? 1.05 : 1.25; // walker scale
let wLen = -1, wPhase = 0, wAmp = 0, wFace = 1, wRaf = 0, wLast = 0, wWave = -1, waved = false, lit = false;

/* At the end of the road, mid-wave, his light leaves his hand and travels to the app icon; when it lands
   the icon starts casting (closing.ts listens for hc:lit). Once per page view, only when he walked there. */
function lightIcon() {
  const icon = document.getElementById('dot'), card = icon?.closest('.get-card');
  if (!icon || !card || !wLamp.isConnected) return;
  const a = wLamp.getBoundingClientRect(), iconMark = icon.querySelector('.mk-dot') || icon, b = iconMark.getBoundingClientRect();
  const from = [a.left + a.width / 2 + scrollX, a.top + a.height / 2 + scrollY], to = [b.left + b.width / 2 + scrollX, b.top + b.height / 2 + scrollY];
  if (b.bottom < 0 || b.top > innerHeight) { document.dispatchEvent(new Event('hc:lit')); card.classList.add('lit'); return; }
  const orb = document.createElement('i'); orb.className = 'orb'; orb.setAttribute('aria-hidden', 'true'); document.body.appendChild(orb);
  const mid = [(from[0] + to[0]) / 2, Math.min(from[1], to[1]) - 90];
  const at = (p: number[], o = 1, s = 1) => ({ transform: `translate(${p[0]}px,${p[1]}px) scale(${s})`, opacity: o });
  W.lamp.style.opacity = '0'; W.glow.style.opacity = '0';
  const anim = orb.animate([at(from, 1), at(mid, 1, 1.3), at(to, 1, .8)], { duration: 1200, easing: 'cubic-bezier(.45,0,.25,1)', fill: 'forwards' });
  anim.onfinish = () => {
    orb.animate([at(to, 1, .8), at(to, 0, 2.4)], { duration: 500, easing: 'ease-out', fill: 'forwards' }).onfinish = () => orb.remove();
    card.classList.add('lit'); document.dispatchEvent(new Event('hc:lit'));
    setTimeout(() => { W.lamp.style.opacity = ''; W.glow.style.opacity = ''; }, 900); // a new light in his hand
  };
}
const line = (el: Element, x1: number, y1: number, x2: number, y2: number) => {
  el.setAttribute('x1', x1.toFixed(2)); el.setAttribute('y1', y1.toFixed(2)); el.setAttribute('x2', x2.toFixed(2)); el.setAttribute('y2', y2.toFixed(2));
};
function pose(swing: number, amp: number, wave: number, lift: number) {
  // feet at (0, 0), about 26 px tall before scaling. Standing: feet apart, arms a little out.
  // Walking: legs and arms swing in opposite pairs, the body bobs and leans into the step.
  const rest = 1 - amp, sw = Math.sin(swing);
  const bob = -Math.abs(Math.cos(swing)) * 1.1 * amp, lean = 1.3 * amp;
  const hipY = -10 + bob, neckY = -19 + bob, shY = -17 + bob;
  const legF = 0.2 * rest + 0.5 * amp * sw, legB = -0.2 * rest - 0.5 * amp * sw;
  const armF = 0.38 * rest - 0.6 * amp * sw, armB = -0.38 * rest + 0.6 * amp * sw;
  line(W.legF, 0, hipY, Math.sin(legF) * 10.4, hipY + Math.cos(legF) * 10.4);
  line(W.legB, 0, hipY, Math.sin(legB) * 10.4, hipY + Math.cos(legB) * 10.4);
  line(W.torso, 0, hipY, lean, neckY);
  const ax = lean * 0.8;
  line(W.armB, ax, shY, ax + Math.sin(armB) * 7.5, shY + Math.cos(armB) * 7.5);
  // the front hand carries the green light; at the end of the road he holds it up and waves
  // at a stop (lift 0..1..0) he raises the light in front of him and it glows a little brighter
  const a = wave > 0 ? Math.PI * 0.85 + Math.sin(wave * Math.PI * 4) * 0.35 : (armF + 0.35 * rest) * (1 - lift) + Math.PI * 0.72 * lift;
  const hx = ax + Math.sin(a) * 7.5, hy = shY + Math.cos(a) * 7.5;
  line(W.armF, ax, shY, hx, hy);
  for (const el of [W.lamp, W.glow]) { el.setAttribute('cx', (hx + 0.6).toFixed(2)); el.setAttribute('cy', (hy + 1.2).toFixed(2)); }
  W.glow.setAttribute('r', (5.5 * (1 + 0.7 * lift)).toFixed(2));
  W.head.setAttribute('cx', (lean * 1.15).toFixed(2)); W.head.setAttribute('cy', (neckY - 3.6).toFixed(2));
}
function walk() {
  if (!wRaf) { wLast = 0; wRaf = requestAnimationFrame(walkTick); }
}
function walkTick(now: number) {
  wRaf = 0;
  const dt = wLast ? Math.min(0.05, (now - wLast) / 1000) : 1 / 60; wLast = now;
  if (wLen < 0) wLen = drawn;
  const d = drawn - wLen;
  const step = Math.abs(d) < 0.25 ? d : d * (1 - Math.exp(-dt / 0.22));
  wLen += step;
  wPhase += (Math.abs(step) / 24) * Math.PI * 2;           // one full stride every 24 px of road
  const moving = Math.abs(step) / dt > 6 ? 1 : 0;
  wAmp += (moving - wAmp) * (1 - Math.exp(-dt / 0.14));
  paint(wLen);
  checkArrivals(wLen);
  const p = tPath.getPointAtLength(wLen);
  const q = tPath.getPointAtLength(Math.min(T.total, wLen + 3));
  if (Math.abs(q.x - p.x) > 0.6) wFace = Math.sign(q.x - p.x) * Math.sign(d || 1) || wFace;
  // wave once when the walker reaches the end of the road
  const atEnd = wLen >= T.total - 1 && !moving;
  if (atEnd && !waved) { waved = true; wWave = 0; if (!lit) { lit = true; setTimeout(lightIcon, 650); } }
  if (!atEnd && wLen < T.total - 40) waved = false;
  if (wWave >= 0) { wWave += dt / 1.6; if (wWave >= 1 || !atEnd) wWave = -1; }
  if (wLift >= 0) { wLift += dt / 1.1; if (wLift >= 1) wLift = -1; }
  walker.style.transform = `translate(${(p.x - 20).toFixed(1)}px,${(p.y - 36).toFixed(1)}px)`;
  wBody.setAttribute('transform', `scale(${(WS * wFace).toFixed(2)},${WS})`);
  pose(wPhase, wAmp, wWave >= 0 ? wWave : 0, wLift >= 0 ? Math.sin(wLift * Math.PI) ** 2 : 0);
  walker.style.opacity = '1';
  if (Math.abs(drawn - wLen) > 0.25 || wAmp > 0.01 || wWave >= 0 || wLift >= 0) wRaf = requestAnimationFrame(walkTick);
}

/* ---------- hero intro: s1..s4. Scene A (scenes/hero.ts) and the posters follow these classes ---------- */
const hero = $('#top');
function heroIntro() {
  if (RM) { hero.classList.add('s1', 's2', 's3', 's4'); return; }
  setTimeout(() => hero.classList.add('s1'), 120);
  setTimeout(() => hero.classList.add('s2'), 900);   // the dot pulses
  setTimeout(() => hero.classList.add('s3'), 1700);  // the dot turns green, the screen leaves the tablet
  setTimeout(() => hero.classList.add('s4'), 2600);  // the drawing starts (arrives 0.2 s later on the laptop)
}

/* ---------- reveal ---------- */
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) e.target.classList.add('in'); }), { threshold: [0, .15, .3] });
$$('.rv').forEach((el) => io.observe(el));
document.documentElement.classList.add('rv-ok');

/* ---------- nav: "Availability" appears once the hero is behind you ---------- */
const navRoot = document.documentElement;
navRoot.classList.add('nav-wait');
new IntersectionObserver(([e]) => navRoot.classList.toggle('past-hero', !e.isIntersecting && e.boundingClientRect.top < 0)).observe(hero);

/* ---------- mobile bar: hide it where its action is already on screen ---------- */
const mbar = document.getElementById('mbar');
if (mbar) {
  const here = new Set<Element>();
  // it also steps aside while you scroll down (reading), and comes back when you scroll up
  let down = false, lastY = scrollY;
  const setBar = () => mbar.classList.toggle('away', here.size > 0 || down);
  const mio = new IntersectionObserver((es) => {
    es.forEach((e) => (e.isIntersecting ? here.add(e.target) : here.delete(e.target)));
    setBar();
  }, { threshold: 0.25 });
  addEventListener('scroll', () => {
    const y = scrollY;
    if (Math.abs(y - lastY) > 16) { down = y > lastY; lastY = y; setBar(); }
  }, { passive: true });
  for (const id of ['top', 'film', 'get-app']) { const el = document.getElementById(id); if (el) mio.observe(el); }
}

let ticking = false;
addEventListener('scroll', () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { ticking = false; renderThread(); }); }, { passive: true });
let rb: number;
const rebuild = () => { clearTimeout(rb); rb = window.setTimeout(() => { buildThread(); document.dispatchEvent(new Event('hc:rebuild')); }, 120); };
addEventListener('resize', rebuild);
// The road is built once, after the page has loaded (it lies below the hero, so nothing waits for it),
// in an idle moment; then again only when the page's size changes. The observer's first report is the
// size the page already has, so it is skipped.
let seenSize = false;
if ('ResizeObserver' in window) new ResizeObserver(() => { if (seenSize) rebuild(); seenSize = true; }).observe(document.body);
const idle = (fn: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 600 }) : setTimeout(fn, 50));
const firstBuild = () => idle(() => { buildThread(); if (!T.ready || RM) arriveAll(); });
if (document.readyState === 'complete') firstBuild(); else addEventListener('load', firstBuild, { once: true });
if (RM) arriveAll();

/* ---------- Scene A: three.js loads after the page (and the poster) has loaded ---------- */
if (why3dOff()) heroIntro();
else {
  let begun = false;
  const begin = () => { if (!begun) { begun = true; heroIntro(); } };
  document.addEventListener('hc:hero-ready', begin, { once: true });
  document.addEventListener('hc:3d-off', begin, { once: true });
  setTimeout(begin, 1800); // never hold the intro hostage to the 3D
  const load3d = () => { import('./scenes/hero').catch(() => document.dispatchEvent(new Event('hc:3d-off'))); };
  if (document.readyState === 'complete') load3d(); else addEventListener('load', load3d, { once: true });
}

/* ---------- lazy modules ---------- */
lazy('#film', () => import('./film'));
lazy('#modes', () => import('./playground'));
lazy('#privacy', () => import('./privacy'));
lazy('#get-app', () => import('./closing'));
