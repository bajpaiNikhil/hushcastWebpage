import { $ } from './util';

/* Footer proof: requests this page made to other origins, read from resource timing. */
const tp = $('#tp');
function countTP() {
  let n = 0;
  for (const e of performance.getEntriesByType('resource')) {
    try { const u = new URL(e.name, location.href); if (/^https?:$/.test(u.protocol) && u.origin !== location.origin) n++; } catch { /* ignore */ }
  }
  tp.textContent = String(n);
}
try { new PerformanceObserver(countTP).observe({ type: 'resource', buffered: true }); } catch { /* unsupported */ }

addEventListener('load', countTP);
countTP();
