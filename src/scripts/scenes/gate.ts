// Decides whether the 3D scenes may run (CLAUDE.md "3D is optional", PRD 9.4).
// Tiny on purpose: it ships in the main bundle; three.js itself is only fetched when this says yes.
import { RM } from '../util';

interface Conn { saveData?: boolean; effectiveType?: string }
const params = new URLSearchParams(location.search);
/** `?3d=force` skips the device checks (testing only). `?poster=1` is used by tools/render-posters.mjs. */
export const FORCE = params.get('3d') === 'force';
export const POSTER = params.has('poster');

/** Returns null when 3D may run, otherwise the reason it may not. */
export function why3dOff(): string | null {
  if (FORCE || POSTER) return null;
  if (params.get('3d') === 'off') return 'off';
  if (RM) return 'reduced-motion';
  const n = navigator as Navigator & { connection?: Conn; deviceMemory?: number };
  const c = n.connection;
  if (c?.saveData) return 'save-data';
  if (c?.effectiveType && /(^|-)(2g|3g)$/.test(c.effectiveType)) return 'slow-network';
  const mobile = matchMedia('(pointer: coarse)').matches;
  if (mobile && ((n.deviceMemory ?? 8) <= 4 || (n.hardwareConcurrency ?? 8) <= 4)) return 'low-end-device';
  if (!webglWorks()) return 'no-webgl';
  return null;
}

/** A throwaway WebGL probe, released at once, so devices without WebGL never download three.js. */
let probed: boolean | undefined;
function webglWorks() {
  if (probed !== undefined) return probed;
  try {
    const gl = document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl');
    probed = !!gl;
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch { probed = false; }
  return probed;
}
