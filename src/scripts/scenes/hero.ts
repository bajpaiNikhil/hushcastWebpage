// Scene A, the hero (PRD 9.2, creative vision 4 and 8).
// A tablet (front left) casts to a laptop (back right). Built in Blender (blender/build_scene_a.py),
// lighting baked into one atlas, so every material here is unlit.
// - Intro: driven by the hero's s2/s3/s4 classes from thread.ts, so the 3D, the posters and the
//   thread stay in step. s2 pulse, s3 dot turns green, s4 the stroke lands on the laptop 0.2 s late.
// - Scroll plays the cast (the hero is a tall, pinned scroll stage on desktop; scroll only maps to time,
//   nothing is hijacked): the tablet's screen lifts off, flies along a beam over the router and lands
//   on the laptop; the camera follows, then pulls back to show the WiFi bubble around both devices,
//   with the stream running inside it, and the cloud outside, crossed out and never reached.
// - The pointer adds a few degrees of parallax on desktop.
// - ANCHOR_TabletOut / ANCHOR_LaptopIn give the poster's thread positions (tools/render-posters.mjs).
import {
  Scene, PerspectiveCamera, Object3D, Mesh, MeshBasicMaterial, CanvasTexture, Vector3, SRGBColorSpace,
  LinearMipmapLinearFilter, Texture, BufferAttribute, Quaternion, CubicBezierCurve3, TubeGeometry, SphereGeometry,
  RingGeometry, BufferGeometry, CurvePath, LineCurve3, LineSegments, AdditiveBlending, Group, DoubleSide,
  type Material, type WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { claim, release, wake, owns, type SceneHandle } from './stage';
import { POSTER, FORCE } from './gate';
import { clamp } from '../util';

const stageEl = document.getElementById('stage')!;
const host = document.getElementById('stage3d')!;
const heroEl = document.getElementById('top')!;
const TXT = { ready: stageEl.dataset.ready!, casting: stageEl.dataset.casting!, stop: stageEl.dataset.stop!, wait: stageEl.dataset.wait!, address: stageEl.dataset.address! };
const FONT = getComputedStyle(document.body).fontFamily;

// Screens are bright on purpose so the devices read at a glance: a light drawing app on the tablet,
// a light browser on the laptop (its waiting page stays dark, like the real viewer page).
const C = { bg: '#0B0B0D', screen: '#0E0E10', paper: '#F6F6F8', dots: '#D9D9DE', tool: '#E8E8EC', ink: '#F5F5F7', t1: '#F5F5F7', t2: '#8E8E93', hair: 'rgba(255,255,255,.14)',
  chrome: '#E4E4E8', chromeLine: '#CFCFD4', pill: '#FFFFFF', url: '#3A3A3E', lights: ['#FF5F57', '#FEBC2E', '#28C840'], red: [224, 85, 85], green: [52, 199, 89] };
// the drawing on the screens: a wave, its arrow head and a sun (viewBox 320 x 200)
const INK = ['M44 158 C 74 96, 116 86, 146 124 S 214 176, 252 106', 'M236 104 L254 104 L250 122', 'M192 70 A15 15 0 1 0 162 70 A15 15 0 1 0 192 70'];
// Screen content, not page UI: the drawing app's own pen colours. The page's red and green keep their meaning.
const PENS = ['#64D2FF', '#0A84FF', '#BF5AF2', '#FF375F', '#FF9F0A', '#FFD60A'];

const ease = (k: number) => 1 - Math.pow(1 - clamp(k, 0, 1), 3);
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const rgb = (k: number) => `rgb(${C.red.map((v, i) => Math.round(mix(v, C.green[i], k))).join(',')})`;

/* ---------- screen canvases ---------- */
function inkLengths() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.setAttribute('aria-hidden', 'true');
  document.body.appendChild(svg);
  const out = INK.map((d) => { const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', d); svg.appendChild(p); return p.getTotalLength(); });
  svg.remove(); return out;
}
const INK_LEN = inkLengths();
const INK_PATHS = INK.map((d) => new Path2D(d));

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath(); g.roundRect(x, y, w, h, r);
}

/** The drawing app on the tablet (and mirrored on the laptop): a toolbar of pens and a colourful
 *  sketch drawn stroke by stroke. k = progress of each stroke, 0..1. */
function slide(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, k: number[], fit: 'slice' | 'meet') {
  g.save();
  g.beginPath(); g.rect(x, y, w, h); g.clip();
  const s = fit === 'slice' ? Math.max(w / 320, h / 200) : Math.min(w / 320, h / 200);
  g.translate(x + (w - 320 * s) / 2, y + (h - 200 * s) / 2); g.scale(s, s);
  g.fillStyle = C.paper; g.fillRect(0, 0, 320, 200);
  g.fillStyle = C.dots;
  for (let yy = 52; yy < 200; yy += 14) for (let xx = 14; xx < 320; xx += 14) g.fillRect(xx - 0.6, yy - 0.6, 1.2, 1.2);
  // toolbar: the pens, the blue one picked
  g.fillStyle = C.tool; roundRect(g, 22, 18, 104, 20, 10); g.fill();
  PENS.forEach((c, i) => {
    g.fillStyle = c; g.beginPath(); g.arc(34 + i * 16, 28, 4.4, 0, Math.PI * 2); g.fill();
    if (i === 0) { g.strokeStyle = '#1C1C1E'; g.lineWidth = 1.2; g.setLineDash([]); g.beginPath(); g.arc(34, 28, 6.6, 0, Math.PI * 2); g.stroke(); }
  });
  g.lineCap = 'round'; g.lineJoin = 'round';
  const wave = g.createLinearGradient(44, 0, 252, 0);
  wave.addColorStop(0, PENS[0]); wave.addColorStop(0.5, PENS[2]); wave.addColorStop(1, PENS[3]);
  const style = [{ c: wave as CanvasGradient | string, w: 5 }, { c: PENS[3], w: 5 }, { c: PENS[4], w: 4.5 }];
  k.forEach((kk, i) => {
    if (kk <= 0) return;
    g.strokeStyle = style[i].c; g.lineWidth = style[i].w;
    g.setLineDash([INK_LEN[i] * kk, INK_LEN[i] * 2]); g.stroke(INK_PATHS[i]);
  });
  g.restore();
}

interface State { pulse: number; green: number; mirror: number; inkT: number }
const st: State = { pulse: 0, green: 0, mirror: 0, inkT: -1 };
const INK_END = 3.0; // seconds until the drawing is complete
const inkK = (t: number) => [ease(t / 1.7), ease((t - 1.6) / 0.45), ease((t - 2.1) / 0.9)];

function drawTablet(g: CanvasRenderingContext2D) {
  const W = g.canvas.width, H = g.canvas.height;
  g.clearRect(0, 0, W, H);
  slide(g, 0, 0, W, H, st.inkT < 0 ? [0, 0, 0] : inkK(st.inkT), 'slice');
  // the floating HushCast badge
  const fs = H * 0.05, ph = fs * 2.1, label = st.green > 0.5 ? TXT.casting : TXT.ready;
  g.font = `500 ${fs}px ${FONT}`;
  const tw = g.measureText(label).width, sw = g.measureText(TXT.stop).width;
  const pw = fs * 0.6 + fs * 0.75 + fs * 0.55 + tw + fs * 0.9 + sw + fs * 0.75;
  const px = W - W * 0.05 - pw, py = H * 0.07;
  g.fillStyle = 'rgba(30,30,33,.94)'; roundRect(g, px, py, pw, ph, ph / 2); g.fill();
  g.strokeStyle = C.hair; g.lineWidth = Math.max(1, fs * 0.06); g.setLineDash([]); g.stroke();
  const dx = px + fs * 0.6 + fs * 0.375, dy = py + ph / 2;
  if (st.pulse > 0 && st.pulse < 1) {
    g.fillStyle = `rgba(224,85,85,${0.7 * (1 - st.pulse)})`;
    g.beginPath(); g.arc(dx, dy, fs * 0.375 + fs * 1.2 * ease(st.pulse), 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = rgb(st.green); g.beginPath(); g.arc(dx, dy, fs * 0.375, 0, Math.PI * 2); g.fill();
  g.fillStyle = C.t1; g.textBaseline = 'middle';
  const tx = dx + fs * 0.375 + fs * 0.55; g.fillText(label, tx, dy + fs * 0.04);
  const sx = tx + tw + fs * 0.45;
  g.fillStyle = C.hair; g.fillRect(sx, py + ph * 0.24, Math.max(1, fs * 0.06), ph * 0.52);
  g.fillStyle = C.t2; g.fillText(TXT.stop, sx + fs * 0.45, dy + fs * 0.04);
}

function drawLaptop(g: CanvasRenderingContext2D) {
  const W = g.canvas.width, H = g.canvas.height;
  g.fillStyle = C.screen; g.fillRect(0, 0, W, H);
  // browser chrome
  const ch = H * 0.11;
  g.fillStyle = C.chrome; g.fillRect(0, 0, W, ch);
  g.fillStyle = C.chromeLine; g.fillRect(0, ch - 2, W, 2);
  for (let i = 0; i < 3; i++) { g.fillStyle = C.lights[i]; g.beginPath(); g.arc(W * 0.035 + i * ch * 0.42 + ch * 0.13, ch / 2, ch * 0.13, 0, Math.PI * 2); g.fill(); }
  const ux = W * 0.2, uw = W * 0.6;
  g.fillStyle = C.pill; roundRect(g, ux, ch * 0.2, uw, ch * 0.6, ch * 0.3); g.fill();
  g.fillStyle = C.url; g.font = `500 ${ch * 0.34}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(TXT.address, ux + uw / 2, ch / 2 + ch * 0.02);
  // viewport: waiting text, then the mirrored slide (0.2 s behind the tablet)
  const vy = ch, vh = H - ch;
  if (st.mirror < 1) {
    g.globalAlpha = 1 - st.mirror; g.fillStyle = C.t2; g.font = `400 ${H * 0.045}px ${FONT}`;
    g.fillText(TXT.wait, W / 2, vy + vh / 2); g.globalAlpha = 1;
  }
  if (st.mirror > 0) {
    g.globalAlpha = st.mirror; slide(g, 0, vy, W, vh, st.inkT < 0 ? [0, 0, 0] : inkK(st.inkT - 0.2), 'meet'); g.globalAlpha = 1;
  }
  g.textAlign = 'start';
}

function screenTex(w: number, h: number) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const t = new CanvasTexture(cv);
  t.colorSpace = SRGBColorSpace; t.flipY = false; t.anisotropy = 4; t.minFilter = LinearMipmapLinearFilter;
  return { g: cv.getContext('2d')!, t };
}

/* ---------- scroll progress and the camera path ---------- */
const DEG = Math.PI / 180;
const params = new URLSearchParams(location.search);
const FIXED_P = FORCE && params.has('p') ? Number(params.get('p')) : null; // tuning: ?3d=force&p=0.5
function progress() {
  if (POSTER) return 0;
  if (FIXED_P !== null) return FIXED_P;
  // the hero is one screen tall: scrolling past it only drifts the camera a few degrees
  const r = heroEl.getBoundingClientRect();
  return clamp(-r.top / Math.max(1, heroEl.offsetHeight * 0.85), 0, 1);
}
// keyframes: p, yaw, pitch (deg), distance (m), look-at target
interface Key { p: number; yaw: number; pitch: number; dist: number; t: [number, number, number] }
const KEYS: Key[] = [
  { p: 0.0, yaw: -8, pitch: 12, dist: 1.42, t: [0.02, 0.16, -0.16] },
  { p: 1.0, yaw: 6, pitch: 18, dist: 1.34, t: [0.05, 0.17, -0.18] },
];
const smooth = (a: number, b: number, x: number) => { const k = clamp((x - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); };
const cam = { yaw: 0, pitch: 0, dist: 0, tx: 0, ty: 0, tz: 0 };
const goal = { ...cam };
let px = 0, py = 0, prog = 0;
function camGoal() {
  prog = progress();
  let i = 0; while (i < KEYS.length - 2 && prog > KEYS[i + 1].p) i++;
  const a = KEYS[i], b = KEYS[i + 1], k = smooth(a.p, b.p, prog);
  goal.yaw = (mix(a.yaw, b.yaw, k) + px * 4) * DEG;
  goal.pitch = (mix(a.pitch, b.pitch, k) - py * 2) * DEG;
  goal.dist = mix(a.dist, b.dist, k);
  goal.tx = mix(a.t[0], b.t[0], k); goal.ty = mix(a.t[1], b.t[1], k); goal.tz = mix(a.t[2], b.t[2], k);
}

/* ---------- scene lifecycle ---------- */
let scene: Scene | null = null;
let camera: PerspectiveCamera | null = null;
let anchors: Object3D[] = [];
let scr: { t: ReturnType<typeof screenTex>; l: ReturnType<typeof screenTex> } | null = null;
let loading: Promise<void> | null = null;
let visible = false, ready = false, failed = false;
let tl = { s2: 0, s3: 0, s4: 0 }; // timestamps (ms) when each intro step began, 0 = not yet
let drawn = '';

/** Screen planes carry no UVs in the export (no texture in Blender), so map the local XY rectangle
 *  to 0..1 here: u left to right, v top to bottom (the canvas texture is not flipped). */
function planeUVs(g: BufferGeometry) {
  g.computeBoundingBox();
  const b = g.boundingBox!, pos = g.attributes.position, uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = (pos.getX(i) - b.min.x) / (b.max.x - b.min.x);
    uv[i * 2 + 1] = (b.max.y - pos.getY(i)) / (b.max.y - b.min.y);
  }
  g.setAttribute('uv', new BufferAttribute(uv, 2));
}

function alphaRamp() {
  const n = 128, cv = document.createElement('canvas'); cv.width = cv.height = n;
  const g = cv.getContext('2d')!;
  const gr = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
  gr.addColorStop(0, '#fff'); gr.addColorStop(0.18, '#c0c0c0'); gr.addColorStop(0.38, '#363636'); gr.addColorStop(0.52, '#000');
  g.fillStyle = gr; g.fillRect(0, 0, n, n);
  return new CanvasTexture(cv);
}

/* ---------- the cast: effects built here, on top of the Blender scene ---------- */
interface Fx {
  curve: CubicBezierCurve3; card: Mesh; cardMat: MeshBasicMaterial; trail: Mesh; trailMat: MeshBasicMaterial; trailSegs: number;
  packets: Mesh[]; packetMat: MeshBasicMaterial; rings: Mesh[]; ringMats: MeshBasicMaterial[];
  lapMat: MeshBasicMaterial; cloudMats: MeshBasicMaterial[];
  q0: Quaternion; q1: Quaternion; s0: Vector3; s1: Vector3;
}
let fx: Fx | null = null;
// the stream itself is green: on this site green means "casting", and this is the cast
const green = (opacity: number) => new MeshBasicMaterial({ color: 0x34c759, transparent: true, opacity, depthWrite: false, toneMapped: false });

function buildFx(root: Object3D) {
  root.updateMatrixWorld(true);
  const tab = root.getObjectByName('Screen_Tablet') as Mesh, lap = root.getObjectByName('Screen_Laptop') as Mesh;
  const router = root.getObjectByName('Router')!;
  const p0 = new Vector3(), p1 = new Vector3(), q0 = new Quaternion(), q1 = new Quaternion(), s0 = new Vector3(), s1 = new Vector3();
  tab.matrixWorld.decompose(p0, q0, s0); lap.matrixWorld.decompose(p1, q1, s1);
  tab.geometry.computeBoundingBox(); lap.geometry.computeBoundingBox();
  const tb = tab.geometry.boundingBox!, lb = lap.geometry.boundingBox!;
  s1.multiply(new Vector3((lb.max.x - lb.min.x) / (tb.max.x - tb.min.x), (lb.max.y - lb.min.y) / (tb.max.y - tb.min.y), 1));
  const nT = new Vector3(0, 0, 1).applyQuaternion(q0);
  const curve = new CubicBezierCurve3(p0.clone(), p0.clone().addScaledVector(nT, 0.1).add(new Vector3(0.02, 0.26, 0)),
    p1.clone().add(new Vector3(-0.12, 0.3, 0.12)), p1.clone());
  // the flying copy of the tablet screen
  const cardMat = new MeshBasicMaterial({ map: scr!.t.t, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, side: DoubleSide });
  const card = new Mesh(tab.geometry, cardMat); card.visible = false;
  // the beam it leaves behind, revealed as it flies
  const trailSegs = 120;
  const trail = new Mesh(new TubeGeometry(curve, trailSegs, 0.0022, 6, false), green(0.6));
  trail.geometry.setDrawRange(0, 0);
  // packets running along the beam once the cast is up
  const packetMat = green(0); packetMat.blending = AdditiveBlending;
  const pg = new SphereGeometry(0.0065, 10, 8);
  const packets = Array.from({ length: 7 }, () => new Mesh(pg, packetMat));
  // WiFi rings spreading from the router across the floor
  const rg = new RingGeometry(0.97, 1, 72); rg.rotateX(-Math.PI / 2);
  const rp = new Vector3(); router.getWorldPosition(rp);
  const ringMats = [0, 1, 2].map(() => green(0));
  const rings = ringMats.map((m) => { const r = new Mesh(rg, m); r.position.set(rp.x, 0.003, rp.z); return r; });
  // the cloud, outside the bubble: the outline from the privacy diagram, grey, crossed out, never reached
  const C = (x: number, y: number) => new Vector3((x - 1615) * 0.0011, -(y - 240) * 0.0011, 0);
  const cp = new CurvePath<Vector3>();
  const cub = (a: number[], b: number[], c: number[], d: number[]) => cp.add(new CubicBezierCurve3(C(a[0], a[1]), C(b[0], b[1]), C(c[0], c[1]), C(d[0], d[1])));
  cub([1555, 300], [1500, 300], [1480, 235], [1530, 215]); cub([1530, 215], [1540, 160], [1620, 150], [1650, 195]);
  cub([1650, 195], [1710, 180], [1750, 235], [1715, 275]); cub([1715, 275], [1740, 300], [1720, 330], [1690, 330]);
  cp.add(new LineCurve3(C(1690, 330), C(1560, 330))); cub([1560, 330], [1545, 330], [1550, 305], [1555, 300]);
  const cloudMats = [new MeshBasicMaterial({ color: 0x636366, transparent: true, opacity: 0, depthWrite: false }),
    new MeshBasicMaterial({ color: 0xe05555, transparent: true, opacity: 0, depthWrite: false })]; // red slash: not used
  const cloud = new Group();
  cloud.add(new Mesh(new TubeGeometry(cp, 200, 0.0042, 6, true), cloudMats[0]));
  cloud.add(new Mesh(new TubeGeometry(new LineCurve3(C(1500, 350), C(1730, 130)), 2, 0.0048, 6, false), cloudMats[1]));
  cloud.position.set(0.36, 0.31, -0.6); cloud.rotation.y = 0.15; cloud.scale.setScalar(0.75);
  const g = new Group(); g.add(card, trail, cloud, ...packets, ...rings); root.add(g);
  fx = { curve, card, cardMat, trail, trailMat: trail.material as MeshBasicMaterial, trailSegs, packets, packetMat, rings, ringMats,
    lapMat: lap.material as MeshBasicMaterial, cloudMats, q0, q1, s0, s1 };
}

const tmpQ = new Quaternion(), Z = new Vector3(0, 0, 1);
/** Place every effect for the cast, by time since it started (s3). Returns true while anything moves.
 *  The flight takes 1.3 s; then the stream runs along the beam for a while and the WiFi rings pulse
 *  twice. Nothing loops forever: after about 9 s the scene is still and stops rendering. */
const FLIGHT = 1.3, STREAM = 7, RINGS = 2 * 2.7;
function updateFx(now: number) {
  if (!fx) return false;
  const t = tl.s3 ? (tl.s3 === 1 ? 1e6 : (now - tl.s3) / 1000) : -1;
  const f = clamp(t / FLIGHT, 0, 1);
  const fe = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
  fx.card.visible = f > 0.001 && f < 0.999;
  if (fx.card.visible) {
    fx.curve.getPointAt(fe, fx.card.position);
    fx.card.quaternion.slerpQuaternions(fx.q0, fx.q1, fe).multiply(tmpQ.setFromAxisAngle(Z, Math.sin(fe * Math.PI) * 0.35));
    fx.card.scale.lerpVectors(fx.s0, fx.s1, fe).multiplyScalar(1 - Math.sin(fe * Math.PI) * 0.25);
    fx.cardMat.opacity = Math.min(1, f * 12, (1 - f) * 10) * 0.95;
  }
  const idx = fx.trail.geometry.index!.count;
  fx.trail.geometry.setDrawRange(0, Math.floor(Math.floor(fe * fx.trailSegs) / fx.trailSegs * idx / 3) * 3);
  const after = t - FLIGHT;                               // seconds since the screen landed
  fx.trailMat.opacity = after < 0 ? 0.85 : 0.35 + 0.5 * Math.exp(-after / 1.5);
  const land = after < 0 ? 0 : Math.exp(-after / 0.35);  // the laptop screen flashes as it lands
  fx.lapMat.color.setRGB(1 + 0.12 * land, 1 + 0.2 * land, 1 + 0.14 * land);
  const on = after < 0 ? 0 : clamp(after / 0.4, 0, 1) * clamp((STREAM - after) / 0.8, 0, 1);
  fx.packetMat.opacity = on * 0.95;
  fx.packets.forEach((m, i) => { m.visible = on > 0.01; if (m.visible) fx!.curve.getPointAt(((now / 2800) + i / fx!.packets.length) % 1, m.position); });
  fx.rings.forEach((r, i) => {
    const k = after < 0 ? -1 : (after / 2.7 - i / 3);
    r.visible = k >= 0 && k < 2 && after < RINGS + 1;
    const kk = k - Math.floor(k);
    r.scale.setScalar(0.04 + 0.55 * kk); fx!.ringMats[i].opacity = r.visible ? 0.5 * (1 - kk) * (1 - kk) : 0;
  });
  fx.cloudMats.forEach((m) => { m.opacity = 0.9; });
  return t >= 0 && t < FLIGHT + Math.max(STREAM, RINGS + 1);
}

async function load() {
  const gltf = await new GLTFLoader().loadAsync('/models/hero.gltf');
  const s = new Scene();
  s.add(gltf.scene);
  scr = { t: screenTex(1024, 622), l: screenTex(1024, 640) };
  gltf.scene.traverse((o) => {
    if (o.name.startsWith('ANCHOR_')) anchors.push(o);
    const m = o as Mesh; if (!m.isMesh) return;
    const old = m.material as MeshBasicMaterial;
    let mat: Material;
    if (o.name.startsWith('Screen_')) planeUVs(m.geometry);
    if (o.name === 'Screen_Tablet') mat = new MeshBasicMaterial({ map: scr!.t.t, toneMapped: false });
    else if (o.name === 'Screen_Laptop') mat = new MeshBasicMaterial({ map: scr!.l.t, toneMapped: false });
    else if (o.name === 'Ground') mat = new MeshBasicMaterial({ map: old.map, alphaMap: alphaRamp(), transparent: true, depthWrite: false, color: 0x8c8c8c });
    else mat = new MeshBasicMaterial({ map: old.map });
    old.dispose(); m.material = mat;
  });
  anchors = ['ANCHOR_TabletOut', 'ANCHOR_LaptopIn'].map((n) => anchors.find((a) => a.name === n)!).filter(Boolean);
  buildFx(gltf.scene);
  scene = s;
  camera = new PerspectiveCamera(22, 1.28, 0.05, 20);
  syncToClasses(true);
  camGoal(); Object.assign(cam, goal);
}

function dispose() {
  scene?.traverse((o) => {
    const m = o as Mesh & LineSegments;
    if (!m.isMesh && !m.isLineSegments) return;
    m.geometry.dispose();
    const mat = m.material as MeshBasicMaterial;
    for (const t of [mat.map, mat.alphaMap]) if (t && t !== scr?.t.t) (t as Texture).dispose();
    mat.dispose();
  });
  scr?.t.t.dispose(); scr?.l.t.dispose();
  scene = null; camera = null; anchors = []; scr = null; fx = null; loading = null; ready = false; drawn = '';
}

/** Match the intro state to the hero classes. `jump` = no animation (late join or poster). */
function syncToClasses(jump = false) {
  const now = performance.now(), c = heroEl.classList;
  const was = { ...tl };
  if (c.contains('s2') && !tl.s2) tl.s2 = jump ? 1 : now;
  if (c.contains('s3') && !tl.s3) tl.s3 = jump ? 1 : now;
  if (c.contains('s4') && !tl.s4) tl.s4 = jump ? 1 : now;
  if (POSTER) {
    const end = params.get('poster') === 'end';
    tl = end ? { s2: 1, s3: 1, s4: 1 } : { s2: 0, s3: 0, s4: 0 };
  }
  if (was.s2 !== tl.s2 || was.s3 !== tl.s3 || was.s4 !== tl.s4) wake();
}

/** Advance the intro. Returns true while something is still animating. */
function advance(now: number) {
  const age = (t: number) => (t === 1 ? 1e6 : (now - t) / 1000);
  st.pulse = tl.s2 && !tl.s3 ? clamp(age(tl.s2) / 0.9, 0, 1) : 0;
  st.green = tl.s3 ? ease(age(tl.s3) / 0.55) : 0;
  st.mirror = tl.s3 ? ease((age(tl.s3) - FLIGHT) / 0.4) : 0;   // the browser shows the cast once the screen lands
  st.inkT = tl.s4 ? age(tl.s4) : -1;
  const busy = (tl.s2 && !tl.s3 && st.pulse < 1) || (tl.s3 && st.green < 1) || (tl.s3 && st.mirror < 1) || (tl.s4 && st.inkT < INK_END + 0.25);
  return !!busy;
}

const handle: SceneHandle = {
  host, maxDpr: matchMedia('(pointer: fine) and (min-width: 981px)').matches ? 2 : 1.5,
  resize(w, h) {
    if (!camera) return;
    // The canvas is larger than the stage (it bleeds out, see .stage-3d in global.css). Widen the
    // vertical field of view by the same ratio so the devices keep the size they have on the poster.
    const k = POSTER ? 1 : h / Math.max(1, stageEl.clientHeight);
    camera.aspect = w / h;
    camera.fov = 2 * Math.atan(Math.tan(11 * DEG) * k) / DEG;
    camera.updateProjectionMatrix();
  },
  detached() { ready = false; stageEl.classList.remove('has3d'); },
  fail() { failed = true; stageEl.classList.remove('has3d'); dispose(); document.dispatchEvent(new Event('hc:3d-off')); },
  frame(r: WebGLRenderer, dt: number, now: number) {
    if (!scene || !camera || !scr) return false;
    const busy = advance(now);
    camGoal();
    const k = 1 - Math.exp(-dt / 0.28);   // about 1 s to settle
    let moving = false;
    for (const key of ['yaw', 'pitch', 'dist', 'tx', 'ty', 'tz'] as const) {
      const d = goal[key] - cam[key];
      if (Math.abs(d) > 1e-4) { cam[key] += d * k; moving = true; } else cam[key] = goal[key];
    }
    camera.position.set(
      cam.tx + cam.dist * Math.cos(cam.pitch) * Math.sin(cam.yaw),
      cam.ty + cam.dist * Math.sin(cam.pitch),
      cam.tz + cam.dist * Math.cos(cam.pitch) * Math.cos(cam.yaw));
    camera.lookAt(cam.tx, cam.ty, cam.tz);
    const looping = updateFx(now);
    const sig = `${st.pulse.toFixed(3)} ${st.green.toFixed(3)} ${st.mirror.toFixed(3)} ${st.inkT < 0 ? -1 : Math.min(st.inkT, INK_END + 0.25).toFixed(3)}`;
    if (sig !== drawn) { drawn = sig; drawTablet(scr.t.g); drawLaptop(scr.l.g); scr.t.t.needsUpdate = true; scr.l.t.needsUpdate = true; }
    r.render(scene, camera);
    if (!ready) { ready = true; stageEl.classList.add('has3d'); document.dispatchEvent(new Event('hc:hero-ready')); }
    return busy || moving || looping;
  },
};
/* ---------- visibility: start at 20% visible, pause when hidden, dispose when far ---------- */
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
new IntersectionObserver(([e]) => {
  visible = e.isIntersecting;
  if (visible) start();
}, { threshold: 0.2 }).observe(stageEl);
new IntersectionObserver(([e]) => {
  if (!e.isIntersecting && scene) { release(handle); handle.detached(); dispose(); }
}, { rootMargin: '150% 0px' }).observe(stageEl);

new MutationObserver(() => syncToClasses()).observe(heroEl, { attributes: true, attributeFilter: ['class'] });
addEventListener('scroll', () => { if (visible && ready) wake(); }, { passive: true });
heroEl.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse' || !ready) return;
  const r = heroEl.getBoundingClientRect();
  px = (e.clientX - r.left) / r.width - 0.5; py = (e.clientY - r.top) / Math.min(r.height, innerHeight) - 0.5; wake();
});
heroEl.addEventListener('pointerleave', () => { px = py = 0; wake(); });

/* ---------- poster tooling (tools/render-posters.mjs) ---------- */
const v = new Vector3();
function anchorPct() {
  if (!camera) return [];
  return anchors.map((a) => { a.getWorldPosition(v).project(camera!); return [(v.x + 1) / 2 * 100, (1 - v.y) / 2 * 100]; });
}
if (POSTER) {
  (window as unknown as { __hcPoster: () => Promise<unknown> }).__hcPoster = async () => {
    await loading; if (!scene || !camera || !scr) return null;
    const r = claim(handle)!; r.setPixelRatio(1); r.setSize(1600, 1250, false); handle.resize(1600, 1250);
    tl.s4 = tl.s4 ? 1 : 0; advance(performance.now());
    camGoal(); Object.assign(cam, goal);
    handle.frame(r, 1, performance.now());
    return { png: r.domElement.toDataURL('image/png'), anchors: anchorPct() };
  };
}
