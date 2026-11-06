// Tiny static server for dist/ that applies the "/*" block of public/_headers.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.png': 'image/png', '.avif': 'image/avif', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm', '.json': 'application/json', '.txt': 'text/plain', '.xml': 'application/xml', '.mp4': 'video/mp4', '.webm': 'video/webm' };

export function readHeaders(dist) {
  const f = path.join(dist, '_headers');
  const h = {};
  if (!fs.existsSync(f)) return h;
  for (const line of fs.readFileSync(f, 'utf8').split('\n').slice(1)) {
    const m = line.match(/^\s+([\w-]+):\s*(.+)$/);
    if (m) h[m[1]] = m[2].trim();
  }
  return h;
}

export function serve(dist, port = 0) {
  const headers = readHeaders(dist);
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = path.join(dist, p);
    if (!file.startsWith(dist)) { res.writeHead(403).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) { res.writeHead(404).end('not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', ...headers });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve({ server, port: server.address().port })));
}
