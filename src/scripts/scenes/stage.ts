// The one WebGL context for the whole page (PRD 9.4). Scenes borrow the renderer, one at a time.
// - Only the scene that currently owns the canvas renders; the canvas moves between hosts.
// - Render on demand: a scene asks for frames with `wake()` and stops asking when nothing moves.
// - Frame guard: slow frames first drop the pixel ratio to 1, then stop 3D (the poster stays).
import { WebGLRenderer, SRGBColorSpace, NoToneMapping } from 'three';
import { FORCE, POSTER } from './gate';

export interface SceneHandle {
  host: HTMLElement;
  /** Highest pixel ratio this scene may use (2 for the desktop hero, 1.5 elsewhere). */
  maxDpr: number;
  /** Draw one frame. Return true to keep animating, false to go idle. */
  frame(r: WebGLRenderer, dt: number, now: number): boolean;
  resize(w: number, h: number): void;
  /** The scene lost the canvas (another scene claimed it, or 3D stopped). */
  detached(): void;
  /** 3D must stop for this scene: show the poster. */
  fail(reason: string): void;
}

let renderer: WebGLRenderer | null = null;
let owner: SceneHandle | null = null;
let dead = false;
let raf = 0, last = 0;
let slow = 0, slowSince = 0, downgraded = false;
const ro = new ResizeObserver(() => sizeToHost());

export function getRenderer(): WebGLRenderer | null {
  if (dead) return null;
  if (renderer) return renderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'default', failIfMajorPerformanceCaveat: !(FORCE || POSTER), preserveDrawingBuffer: POSTER });
  } catch {
    dead = true; return null;
  }
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NoToneMapping;
  renderer.setClearColor(0x000000, 0);
  const cv = renderer.domElement;
  cv.setAttribute('aria-hidden', 'true');
  cv.addEventListener('webglcontextlost', (e) => { e.preventDefault(); stopAll('context-lost'); });
  return renderer;
}

function dpr(h: SceneHandle) { return downgraded ? 1 : Math.min(devicePixelRatio || 1, h.maxDpr); }

function sizeToHost() {
  if (!renderer || !owner) return;
  const r = owner.host.getBoundingClientRect();
  const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
  renderer.setPixelRatio(dpr(owner));
  renderer.setSize(w, h, false);
  owner.resize(w, h);
  wake();
}

/** Give the canvas to a scene. The previous owner is told to let go. */
export function claim(h: SceneHandle): WebGLRenderer | null {
  const r = getRenderer(); if (!r) return null;
  if (owner === h) return r;
  if (owner) { const prev = owner; owner = null; ro.unobserve(prev.host); prev.detached(); }
  owner = h; h.host.appendChild(r.domElement); ro.observe(h.host);
  sizeToHost();
  return r;
}

export function release(h: SceneHandle) {
  if (owner !== h) return;
  ro.unobserve(h.host); owner = null;
  cancelAnimationFrame(raf); raf = 0;
  renderer?.domElement.remove();
}

export const owns = (h: SceneHandle) => owner === h;

/** Ask for frames. Cheap to call often. */
export function wake() {
  if (raf || !owner || !renderer) return;
  last = 0;
  raf = requestAnimationFrame(tick);
}

function tick(now: number) {
  raf = 0;
  if (!owner || !renderer) return;
  const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;
  if (last) guard(now - last, now);
  last = now;
  if (!owner) return;
  const more = owner.frame(renderer, dt, now);
  if (more && owner) raf = requestAnimationFrame(tick); else last = 0;
}

// Frame time over 24 ms for 2 s: drop to pixel ratio 1; if it happens again, stop 3D.
function guard(ms: number, now: number) {
  if (FORCE || POSTER) return; // testing: keep 3D on even with a software renderer
  if (document.hidden || ms > 250) { slow = 0; return; }
  if (ms > 24) { if (!slow) slowSince = now; slow++; } else { slow = 0; return; }
  if (now - slowSince < 2000) return;
  slow = 0;
  if (!downgraded && owner && dpr(owner) > 1) { downgraded = true; sizeToHost(); return; }
  stopAll('slow-frames');
}

function stopAll(reason: string) {
  dead = true;
  const h = owner;
  if (h) { release(h); h.fail(reason); }
  document.dispatchEvent(new CustomEvent('hc:3d-off', { detail: reason }));
  try { renderer?.dispose(); } catch { /* already gone */ }
  renderer = null;
}

export const is3dDead = () => dead;
