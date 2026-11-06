// The road's router. It maps the page onto an 8 px grid, marks every line of text (and every control,
// the film frame and the availability card) as a no-go area wide enough for the road and the walker,
// then finds the cheapest path between two stops that never goes up the page and never enters a no-go
// cell. Devices cost a little more to cross than open space, so the road prefers the gaps between them.
// The staircase it finds is pulled straight where the way is clear, and its corners are rounded only as
// far as they stay clear. tools/check-road.mjs checks the result with the same margins.
import { $$ } from './util';

export interface Pt { x: number; y: number }
export interface Grid { cols: number; rows: number; hard: Uint8Array; soft: Uint8Array }
const C = 8;          // cell size, px
const M = 6;          // extra clearance around everything, px
const SOFT = 3;       // extra cost per cell over a device
const TURN = 6;       // cost of starting a sideways run, so the road prefers few, long turns

function mark(g: Grid, a: Uint8Array, x1: number, y1: number, x2: number, y2: number) {
  const c1 = Math.max(0, Math.floor(x1 / C)), c2 = Math.min(g.cols - 1, Math.floor(x2 / C));
  const r1 = Math.max(0, Math.floor(y1 / C)), r2 = Math.min(g.rows - 1, Math.floor(y2 / C));
  if (c1 > c2) return;
  for (let r = r1; r <= r2; r++) a.fill(1, r * g.cols + c1, r * g.cols + c2 + 1);
}

export function buildGrid(W: number, H: number): Grid {
  const cols = Math.ceil(W / C), rows = Math.ceil(H / C);
  const g: Grid = { cols, rows, hard: new Uint8Array(cols * rows), soft: new Uint8Array(cols * rows) };
  const sx = scrollX, sy = scrollY;
  // The road is 16 px wide; the walker stands 14 px either side of it and 36 px tall above it. Blocks that
  // are still waiting to rise into place sit up to 14 px low, hence the extra room above.
  const block = (b: DOMRect) => mark(g, g.hard, b.left + sx - 14 - M, b.top + sy - 22 - M, b.right + sx + 14 + M, b.bottom + sy + 36 + M);
  const main = document.querySelector('main'); if (!main) return g;
  const ok = new Map<Element, boolean>();
  const rg = document.createRange();
  const tw = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    if (!n.textContent || !n.textContent.trim()) continue;
    const el = n.parentElement; if (!el) continue;
    let use = ok.get(el);
    if (use === undefined) {
      use = !el.closest('#thread,#threadLive,#walker,title,desc,.sr') && !(el.closest('details:not([open])') && !el.closest('summary')) && getComputedStyle(el).visibility !== 'hidden';
      ok.set(el, use);
    }
    if (!use) continue;
    rg.selectNodeContents(n);
    for (const b of rg.getClientRects()) if (b.width > 1) block(b);
  }
  for (const el of $$('main :is(button,a,video,input,.film-frame,.tabs,.get-card,.chip,.pens)')) {
    const b = el.getBoundingClientRect();
    if (b.width && b.height && getComputedStyle(el).visibility !== 'hidden') block(b);
  }
  for (const el of $$('main :is(.tablet,.laptop,.tv)')) {
    const b = el.getBoundingClientRect();
    if (b.width && b.height) mark(g, g.soft, b.left + sx, b.top + sy, b.right + sx, b.bottom + sy);
  }
  return g;
}

const cellOf = (v: number, n: number) => Math.max(0, Math.min(n - 1, Math.floor(v / C)));
const blockedAt = (g: Grid, x: number, y: number) => g.hard[cellOf(y, g.rows) * g.cols + cellOf(x, g.cols)] === 1;

/** Cheapest path from a to b that only moves down or sideways and avoids no-go cells; null if none. */
export function route(g: Grid, a: Pt, b: Pt): Pt[] | null {
  const { cols } = g;
  const r0 = cellOf(a.y, g.rows), r1 = cellOf(b.y, g.rows), c0 = cellOf(a.x, cols), c1 = cellOf(b.x, cols);
  if (r1 < r0) return null;
  const n = r1 - r0 + 1;
  const from = new Int16Array(n * cols).fill(-1);
  let prev = new Float32Array(cols), cur = new Float32Array(cols);
  const enter = new Float32Array(cols);
  const free = (r: number, c: number) => g.hard[r * cols + c] === 0 || (r === r0 && c === c0) || (r === r1 && c === c1);
  for (let k = 0; k < n; k++) {
    const r = r0 + k, row = r * cols;
    for (let c = 0; c < cols; c++) {
      enter[c] = k === 0 ? (c === c0 ? 0 : Infinity) : free(r, c) && prev[c] < Infinity ? prev[c] + 1 + (g.soft[row + c] ? SOFT : 0) : Infinity;
    }
    cur.set(enter);
    const fr = from.subarray(k * cols, (k + 1) * cols);
    for (let c = 0; c < cols; c++) fr[c] = enter[c] < Infinity ? c : -1;
    for (const dir of [1, -1]) {
      let run = Infinity, org = -1;
      for (let i = 0; i < cols; i++) {
        const c = dir === 1 ? i : cols - 1 - i;
        if (!free(r, c)) { run = Infinity; org = -1; continue; }
        run += 1 + (g.soft[row + c] ? SOFT : 0);
        if (enter[c] + TURN < run) { run = enter[c] + TURN; org = c; }
        if (run < cur[c]) { cur[c] = run; fr[c] = org; }
      }
    }
    [prev, cur] = [cur, prev];
  }
  if (!(prev[c1] < Infinity)) return null;
  // walk back: in each row the path entered at `from` and ran sideways to where it left
  const raw: Pt[] = [];
  let c = c1;
  for (let k = n - 1; k >= 0; k--) {
    const e = from[k * cols + c], y = (r0 + k) * C + C / 2;
    raw.push({ x: c * C + C / 2, y });
    if (e !== c && e >= 0) raw.push({ x: e * C + C / 2, y });
    c = e < 0 ? c : e;
  }
  raw.reverse();
  raw[0] = { x: a.x, y: a.y }; raw.push({ x: b.x, y: b.y });
  // keep only the turns
  const turns: Pt[] = [raw[0]];
  for (let i = 1; i < raw.length - 1; i++) {
    const p = turns[turns.length - 1], q = raw[i], s = raw[i + 1];
    if (Math.abs((q.x - p.x) * (s.y - q.y) - (q.y - p.y) * (s.x - q.x)) > 0.01) turns.push(q);
  }
  turns.push(raw[raw.length - 1]);
  // pull the string: from each point, go straight to the furthest point still in clear view
  const ends = [cellOf(a.y, g.rows) * cols + cellOf(a.x, cols), cellOf(b.y, g.rows) * cols + cellOf(b.x, cols)];
  const clear = (p: Pt, q: Pt) => {
    const steps = Math.ceil(Math.hypot(q.x - p.x, q.y - p.y) / 4);
    for (let i = 1; i < steps; i++) {
      const x = p.x + (q.x - p.x) * i / steps, y = p.y + (q.y - p.y) * i / steps;
      const cell = cellOf(y, g.rows) * cols + cellOf(x, cols);
      if (g.hard[cell] && !ends.includes(cell)) return false;
    }
    return true;
  };
  const out: Pt[] = [turns[0]];
  for (let i = 0; i < turns.length - 1;) {
    let j = i + 1;
    while (j + 1 < turns.length && clear(turns[i], turns[j + 1])) j++;
    out.push(turns[j]); i = j;
  }
  return out;
}

export interface Smoothed { d: string; samples: { l: number; x: number; y: number }[]; lens: number[]; total: number }

/** Round the corners of a polyline as far as they stay clear; return the path and its length samples. */
export function smooth(g: Grid, pts: Pt[]): Smoothed {
  const f = (v: number) => v.toFixed(1);
  const samples: Smoothed['samples'] = [{ l: 0, x: pts[0].x, y: pts[0].y }];
  const lens: number[] = [0];
  let d = `M${f(pts[0].x)},${f(pts[0].y)}`, l = 0, at = pts[0];
  const lineTo = (p: Pt) => {
    const L = Math.hypot(p.x - at.x, p.y - at.y), k = Math.max(1, Math.ceil(L / 12));
    for (let i = 1; i <= k; i++) samples.push({ l: l + L * i / k, x: at.x + (p.x - at.x) * i / k, y: at.y + (p.y - at.y) * i / k });
    l += L; at = p; d += ` L${f(p.x)},${f(p.y)}`;
  };
  const quad = (p0: Pt, c: Pt, p1: Pt, n = 10) => {
    const pt = (t: number) => ({ x: (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * c.x + t * t * p1.x, y: (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * c.y + t * t * p1.y });
    return Array.from({ length: n + 1 }, (_, i) => pt(i / n));
  };
  for (let i = 1; i < pts.length - 1; i++) {
    const v = pts[i], a = pts[i - 1], b = pts[i + 1];
    const li = Math.hypot(v.x - a.x, v.y - a.y), lo = Math.hypot(b.x - v.x, b.y - v.y);
    let r = Math.min(64, li / 2, lo / 2), arc: Pt[] = [];
    while (r >= 3) {
      const p1 = { x: v.x - (v.x - a.x) / li * r, y: v.y - (v.y - a.y) / li * r };
      const p2 = { x: v.x + (b.x - v.x) / lo * r, y: v.y + (b.y - v.y) / lo * r };
      arc = quad(p1, v, p2);
      if (arc.every((p) => !blockedAt(g, p.x, p.y))) break;
      r /= 2; arc = [];
    }
    if (!arc.length) { lineTo(v); lens.push(l); continue; }
    lineTo(arc[0]);
    for (let k = 1; k < arc.length; k++) {
      const p = arc[k]; l += Math.hypot(p.x - at.x, p.y - at.y); at = p; samples.push({ l, x: p.x, y: p.y });
      if (k === 5) lens.push(l);
    }
    d += ` Q${f(v.x)},${f(v.y)} ${f(arc[arc.length - 1].x)},${f(arc[arc.length - 1].y)}`;
  }
  lineTo(pts[pts.length - 1]); lens.push(l);
  return { d, samples, lens, total: l };
}
