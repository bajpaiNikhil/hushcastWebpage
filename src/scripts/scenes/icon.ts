// Scene D, the dot (PRD 9.2, creative vision 8). The launcher icon, extruded in Blender from the
// app's own vector paths (blender/build_scene_d.py). The dot is its own mesh: red when idle, green
// while casting. No lights and no textures to download: shading comes from two tiny matcaps drawn here.
// - Scroll: the icon tilts as it travels through the viewport and faces you flat when centred.
// - Tap or Enter (the <button> in End.astro): one slow turn, and the dot changes colour halfway.
import {
  Scene, PerspectiveCamera, Mesh, MeshMatcapMaterial, MeshBasicMaterial, CanvasTexture, SRGBColorSpace, Color, Group,
  type Material, type Texture, type WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { claim, release, wake, owns, type SceneHandle } from './stage';
import { clamp } from '../util';

const btn = document.getElementById('dot')!;
const host = btn.querySelector<HTMLElement>('.icon-3d')!;
const RED = new Color('#E05555'), GREEN = new Color('#34C759');

function matcap(stops: [number, string][], hx = 0.36, hy = 0.3) {
  const n = 128, cv = document.createElement('canvas'); cv.width = cv.height = n;
  const g = cv.getContext('2d')!;
  const gr = g.createRadialGradient(n * hx, n * hy, n * 0.02, n * 0.5, n * 0.5, n * 0.5);
  for (const [o, c] of stops) gr.addColorStop(o, c);
  g.fillStyle = gr; g.fillRect(0, 0, n, n);
  const t = new CanvasTexture(cv); t.colorSpace = SRGBColorSpace; return t;
}

let scene: Scene | null = null, camera: PerspectiveCamera | null = null, rig: Group | null = null;
let dotMat: MeshBasicMaterial | null = null;
let loading: Promise<void> | null = null, visible = false, ready = false, failed = false;
const rot = { x: 0, y: 0 }, goal = { x: 0, y: 0 };
let px = 0, py = 0;
let on = btn.getAttribute('aria-pressed') === 'true', spinT = -1, green = on ? 1 : 0;

async function load() {
  const gltf = await new GLTFLoader().loadAsync('/models/icon.gltf');
  const light = matcap([[0, '#ffffff'], [0.5, '#ededf0'], [0.85, '#b9b9bf'], [1, '#8a8a90']]);
  const dark = matcap([[0, '#3a3a41'], [0.5, '#1c1c21'], [1, '#0b0b0d']], 0.3, 0.22);
  rig = new Group(); rig.add(gltf.scene);
  gltf.scene.traverse((o) => {
    const m = o as Mesh; if (!m.isMesh) return;
    (m.material as Material).dispose();
    if (o.name === 'Tile') m.material = new MeshMatcapMaterial({ matcap: dark });
    else if (o.name === 'Boxes') m.material = new MeshBasicMaterial({ color: 0x0f0f12 });
    else if (o.name === 'Faint') m.material = new MeshMatcapMaterial({ matcap: light, transparent: true, opacity: 0.3 });
    else if (o.name === 'Dot') m.material = dotMat = new MeshBasicMaterial({ color: on ? GREEN.clone() : RED.clone() }); // flat, like the app icon
    else m.material = new MeshMatcapMaterial({ matcap: light });
  });
  scene = new Scene(); scene.add(rig);
  camera = new PerspectiveCamera(30, 1, 0.1, 20);
  camera.position.set(0, 0, 3.6); camera.lookAt(0, 0, 0);
}

function dispose() {
  scene?.traverse((o) => {
    const m = o as Mesh; if (!m.isMesh) return;
    m.geometry.dispose();
    const mat = m.material as MeshMatcapMaterial | MeshBasicMaterial;
    ((mat as MeshMatcapMaterial).matcap as Texture | null | undefined)?.dispose(); mat.dispose();
  });
  scene = null; camera = null; rig = null; dotMat = null; loading = null; ready = false;
}

const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

const handle: SceneHandle = {
  host, maxDpr: 1.5,
  resize(w, h) { if (camera) { camera.aspect = w / h; camera.updateProjectionMatrix(); } },
  detached() { ready = false; btn.classList.remove('is3d'); },
  fail() { failed = true; btn.classList.remove('is3d'); dispose(); },
  frame(r: WebGLRenderer, dt: number) {
    if (!scene || !camera || !rig || !dotMat) return false;
    // scroll: -1 (below centre) .. 1 (above centre) -> tilt; flat when the icon is centred
    const b = btn.getBoundingClientRect();
    const q = clamp(((b.top + b.height / 2) - innerHeight / 2) / innerHeight, -1, 1);
    goal.x = q * 0.55 + py * 0.25; goal.y = -q * 0.45 + px * 0.35;
    const k = 1 - Math.exp(-dt / 0.3);
    let moving = false;
    for (const key of ['x', 'y'] as const) {
      const d = goal[key] - rot[key];
      if (Math.abs(d) > 1e-4) { rot[key] += d * k; moving = true; } else rot[key] = goal[key];
    }
    let spin = 0;
    if (spinT >= 0) {
      spinT += dt; const s = clamp(spinT / 1.4, 0, 1); spin = ease(s) * Math.PI * 2;
      if (s >= 1) spinT = -1; else moving = true;
    }
    const target = on ? 1 : 0;
    if (green !== target && (spinT < 0 || spinT > 0.7)) { green = clamp(green + Math.sign(target - green) * dt / 0.5, 0, 1); moving = true; }
    dotMat.color.copy(RED).lerp(GREEN, green);
    rig.rotation.set(rot.x, rot.y + spin, 0);
    r.render(scene, camera);
    if (!ready) { ready = true; btn.classList.add('is3d'); }
    return moving;
  },
};

async function start() {
  if (failed) return;
  if (!claim(handle)) { handle.fail('no-webgl'); return; }
  if (!scene) {
    loading ??= load().catch(() => { handle.fail('load'); });
    await loading;
    if (!scene || !visible || !owns(handle)) return;
    handle.resize(host.clientWidth || 1, host.clientHeight || 1);
  }
  wake();
}
const sec = document.getElementById('get-app')!;
new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }, { threshold: 0.2 }).observe(sec);
new IntersectionObserver(([e]) => {
  if (!e.isIntersecting && scene) { release(handle); handle.detached(); dispose(); }
}, { rootMargin: '150% 0px' }).observe(sec);

addEventListener('scroll', () => { if (visible && ready) wake(); }, { passive: true });
new MutationObserver(() => {
  const now = btn.getAttribute('aria-pressed') === 'true';
  if (now === on) return;
  on = now; if (on) spinT = 0; wake();
}).observe(btn, { attributes: true, attributeFilter: ['aria-pressed'] });
sec.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse' || !ready) return;
  const r = btn.getBoundingClientRect();
  px = clamp((e.clientX - (r.left + r.width / 2)) / 400, -1, 1); py = clamp((e.clientY - (r.top + r.height / 2)) / 400, -1, 1); wake();
});
sec.addEventListener('pointerleave', () => { px = py = 0; wake(); });
