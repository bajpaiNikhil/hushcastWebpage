// npm run models: blender/exports/<scene>.glb -> public/models/<scene>.gltf + .bin + <scene>-<texture>.webp
// - dedup + prune; textures stay WebP (EXT_texture_webp) from the Blender exporter.
// - Written as .gltf with separate files, not .glb: three.js decodes textures embedded in a GLB from
//   blob: URLs, which the site's CSP (self only) blocks. Separate files load from 'self'.
// - No Meshopt, Draco or KTX2: each needs a WASM decoder, which costs more than these low-poly scenes
//   save and would need 'wasm-unsafe-eval' in the CSP.
// - Quantised (KHR_mesh_quantization, no decoder needed) only for scenes whose ANCHOR_* empties the
//   page does not read, because quantisation rewrites node transforms. The hero's anchors drive the thread.
const QUANTIZE = new Set(['icon']);
import fs from 'node:fs';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, quantize } from '@gltf-transform/functions';

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const src = path.resolve('blender/exports'), dst = path.resolve('public/models');
fs.mkdirSync(dst, { recursive: true });
for (const f of fs.readdirSync(src).filter((n) => n.endsWith('.glb'))) {
  const scene = path.basename(f, '.glb');
  const doc = await io.read(path.join(src, f));
  await doc.transform(dedup(), prune({ keepLeaves: true }), ...(QUANTIZE.has(scene) ? [quantize()] : []));
  doc.getRoot().listBuffers().forEach((b) => b.setURI(`${scene}.bin`));
  doc.getRoot().listTextures().forEach((t, i) => t.setURI(`${scene}-${(t.getName() || 'tex' + i).replace(/[^\w-]/g, '')}.webp`));
  await io.write(path.join(dst, `${scene}.gltf`), doc);
  const files = fs.readdirSync(dst).filter((n) => n === `${scene}.gltf` || n.startsWith(`${scene}.`) || n.startsWith(`${scene}-`));
  const total = files.reduce((a, n) => a + fs.statSync(path.join(dst, n)).size, 0);
  console.log(`${scene}: ${files.join(', ')} = ${(total / 1024).toFixed(1)} KB`);
}
