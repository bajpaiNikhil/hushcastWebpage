import { RM, $, $$, clamp } from './util';
import { onArrive } from './thread';

// The modes demonstration. Draw on the tablet; the stroke arrives on the other screen after the
// mode's (simulated) delay. Listen has no picture, so drawing is switched off there.
interface Pt { t: number; x: number; y: number; s: boolean; c: string }
interface View { c: HTMLCanvasElement; ctx: CanvasRenderingContext2D; w: number; h: number }
type Mode = 'live' | 'listen' | 'cinema';

const sec = $('#modes');
const play = $('#play'), tabs = $$<HTMLButtonElement>('[role=tab]', $('#modeTabs'));
const padEl = $<HTMLCanvasElement>('#pad'), cd = $('#countdown'), buffer = $('#buffer');
const demoBtn = $<HTMLButtonElement>('#demoBtn'), clearBtn = $<HTMLButtonElement>('#clearBtn');
const pens = $$<HTMLButtonElement>('.pen', sec);
const COPY = JSON.parse(sec.dataset.copy!) as Record<Mode, [string, string]>;
const CIN = JSON.parse(sec.dataset.cinema!) as { idle: string; buffering: string; seconds: string; caught: string };
const DELAY: Record<string, number> = { live: 200, cinema: 10000 };
const css = getComputedStyle(document.documentElement);
const PEN: Record<string, string> = {
  cyan: css.getPropertyValue('--cyan').trim(), blue: css.getPropertyValue('--pen-blue').trim(),
  violet: css.getPropertyValue('--violet').trim(), pink: css.getPropertyValue('--pen-pink').trim(), amber: css.getPropertyValue('--amber').trim(),
};

let mode: Mode = 'live', pts: Pt[] = [], vi = 0, raf = 0, userDrew = false, demo: object | null = null, penDown = false, playSeen = false;
let pen = PEN.cyan;
const C: { pad?: View; live?: View; cin?: View } = {};

function fitCanvas(c: HTMLCanvasElement): View | undefined {
  const r = c.getBoundingClientRect(); if (!r.width || !r.height) return undefined;
  const dpr = Math.min(2, devicePixelRatio || 1);
  c.width = Math.round(r.width * dpr); c.height = Math.round(r.height * dpr);
  const ctx = c.getContext('2d')!; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  return { c, ctx, w: r.width, h: r.height };
}
const padBox = () => ({ x: 0, y: 0, w: C.pad!.w, h: C.pad!.h });
function viewBox(v: View) { const a = C.pad!.w / C.pad!.h; let w = v.w, h = w / a; if (h > v.h) { h = v.h; w = h * a; } return { x: (v.w - w) / 2, y: (v.h - h) / 2, w, h }; }
function seg(o: View, b: { x: number; y: number; w: number; h: number }, p: Pt | null | undefined, q: Pt, lw: number) {
  const ctx = o.ctx; ctx.lineWidth = lw; ctx.strokeStyle = ctx.fillStyle = q.c;
  if (!p) { ctx.beginPath(); ctx.arc(b.x + q.x * b.w, b.y + q.y * b.h, lw / 2, 0, Math.PI * 2); ctx.fill(); return; }
  ctx.beginPath(); ctx.moveTo(b.x + p.x * b.w, b.y + p.y * b.h); ctx.lineTo(b.x + q.x * b.w, b.y + q.y * b.h); ctx.stroke();
}
const activeView = () => mode === 'live' ? C.live : mode === 'cinema' ? C.cin : undefined;
const LW = 4;
function redrawAll() {
  if (!C.pad) return;
  C.pad.ctx.clearRect(0, 0, C.pad.w, C.pad.h);
  pts.forEach((q, i) => seg(C.pad!, padBox(), q.s ? null : pts[i - 1], q, LW));
  [C.live, C.cin].forEach((v) => v && v.ctx.clearRect(0, 0, v.w, v.h));
  const v = activeView(); if (!v) return;
  const b = viewBox(v), lw = Math.max(1.5, LW * b.w / C.pad.w);
  for (let i = 0; i < vi; i++) seg(v, b, pts[i].s ? null : pts[i - 1], pts[i], lw);
}
function fitCanvases() { C.pad = fitCanvas(padEl); C.live = fitCanvas($<HTMLCanvasElement>('#vLive')); C.cin = fitCanvas($<HTMLCanvasElement>('#vCinema')); redrawAll(); }
function addPoint(x: number, y: number, s: boolean) {
  if (!C.pad) return;
  if (pts.length > 8000) { pts = []; vi = 0; redrawAll(); s = true; }
  const q: Pt = { t: performance.now(), x, y, s, c: pen }; const prev = s ? null : pts[pts.length - 1];
  pts.push(q); seg(C.pad, padBox(), prev, q, LW); play.classList.add('drew'); kick();
}
function stepViewer() {
  const v = activeView(); if (!v || !C.pad) { play.classList.remove('tx'); return false; }
  const now = performance.now(), d = DELAY[mode], b = viewBox(v), lw = Math.max(1.5, LW * b.w / C.pad.w);
  while (vi < pts.length && pts[vi].t + d <= now) { seg(v, b, pts[vi].s ? null : pts[vi - 1], pts[vi], lw); vi++; }
  const pending = vi < pts.length;
  play.classList.toggle('tx', pending);
  if (mode === 'cinema') {
    buffer.classList.toggle('idle', !pending);
    cd.textContent = pending ? `${CIN.buffering} ${Math.max(1, Math.ceil((pts[vi].t + d - now) / 1000))} ${CIN.seconds}.`
      : (pts.length ? CIN.caught : CIN.idle);
  }
  return pending;
}
function kick() { if (!raf) raf = requestAnimationFrame(tick); }
function tick() { raf = 0; const more = stepViewer(); if (more || demo) raf = requestAnimationFrame(tick); }
function stopDemo() { demo = null; }
function clearAll() { stopDemo(); pts = []; vi = 0; play.classList.remove('drew'); redrawAll(); stepViewer(); }
// "Draw for me": a wave in one colour, then a sun in another
const DEMO = (() => {
  const a: { x: number; y: number; s: boolean; c: string }[] = [];
  for (let i = 0; i <= 90; i++) { const t = i / 90; a.push({ x: .1 + .6 * t, y: .58 - .22 * Math.sin(t * Math.PI * 3) * (1 - .3 * t), s: i === 0, c: 'cyan' }); }
  for (let i = 0; i <= 48; i++) { const t = i / 48 * Math.PI * 2; a.push({ x: .83 + .075 * Math.cos(t), y: .36 + .12 * Math.sin(t), s: i === 0, c: 'amber' }); }
  return a;
})();
function runDemo() {
  if (mode === 'listen') return;
  clearAll(); const t0 = performance.now(), dur = 2300; let k = 0; const token = demo = { t0 };
  const keep = pen;
  (function f(now: number) {
    if (demo !== token) { pen = keep; return; }
    const n = Math.floor(clamp((now - t0) / dur, 0, 1) * DEMO.length);
    while (k < n) { const p = DEMO[k++]; pen = PEN[p.c]; addPoint(p.x, p.y, p.s); }
    pen = keep;
    if (k < DEMO.length) requestAnimationFrame(f); else demo = null;
  })(t0);
}
padEl.addEventListener('pointerdown', (e) => {
  if (mode === 'listen') return;
  stopDemo(); userDrew = true; penDown = true; padEl.setPointerCapture(e.pointerId);
  const r = padEl.getBoundingClientRect(); addPoint((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height, true); e.preventDefault();
});
padEl.addEventListener('pointermove', (e) => {
  if (!penDown) return;
  const r = padEl.getBoundingClientRect();
  let evs: PointerEvent[] = e.getCoalescedEvents ? e.getCoalescedEvents() : []; if (!evs.length) evs = [e];
  for (const ev of evs) addPoint(clamp((ev.clientX - r.left) / r.width, 0, 1), clamp((ev.clientY - r.top) / r.height, 0, 1), false);
});
['pointerup', 'pointercancel'].forEach((t) => padEl.addEventListener(t, () => { penDown = false; }));

pens.forEach((b) => b.addEventListener('click', () => {
  pen = PEN[b.dataset.pen!];
  pens.forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
}));

function setMode(m: Mode, focus?: boolean) {
  if (m === mode) return; mode = m;
  tabs.forEach((t) => {
    const on = t.dataset.mode === m; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
    if (on) { play.setAttribute('aria-labelledby', t.id); if (focus) t.focus(); }
  });
  play.dataset.mode = m;
  $('#modeTitle').textContent = COPY[m][0]; $('#modeText').textContent = COPY[m][1];
  demoBtn.disabled = clearBtn.disabled = m === 'listen';
  clearAll();
  if (!userDrew && !RM && m !== 'listen') setTimeout(() => { if (mode === m) runDemo(); }, 650);
}
tabs.forEach((t, i) => {
  t.addEventListener('click', () => setMode(t.dataset.mode as Mode));
  t.addEventListener('keydown', (e) => {
    const map: Record<string, number> = { ArrowRight: (i + 1) % tabs.length, ArrowLeft: (i - 1 + tabs.length) % tabs.length, Home: 0, End: tabs.length - 1 };
    if (e.key in map) { e.preventDefault(); setMode(tabs[map[e.key]].dataset.mode as Mode, true); }
  });
});
demoBtn.addEventListener('click', runDemo);
clearBtn.addEventListener('click', clearAll);

// animations only run while the demonstration is on screen. The "draw for me" demo is this
// section's moment: it starts when the walker reaches the tablet (and the tablet is on screen).
let walkerHere = false, seen = false;
const tryDemo = () => { if (walkerHere && seen && !playSeen && !userDrew && !RM) { playSeen = true; setTimeout(runDemo, 350); } };
new IntersectionObserver((es) => es.forEach((e) => {
  play.classList.toggle('inview', e.isIntersecting);
  seen = e.isIntersecting && e.intersectionRatio >= .3; tryDemo();
}), { threshold: [0, .15, .3] }).observe(play);
onArrive($('#modes .pad-dev'), () => { walkerHere = true; tryDemo(); });

document.addEventListener('hc:rebuild', fitCanvases);
fitCanvases(); stepViewer();
