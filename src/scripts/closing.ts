import { $ } from './util';
import { why3dOff } from './scenes/gate';

const dot = $('#dot'), dotCap = $('#dotCap'), sec = $('#get-app');
function setCasting(on: boolean) {
  dot.setAttribute('aria-pressed', String(on));
  dotCap.textContent = on ? sec.dataset.casting! : sec.dataset.idle!;
  document.body.classList.toggle('live', on);
}
dot.addEventListener('click', () => setCasting(dot.getAttribute('aria-pressed') !== 'true'));
// the walker's light reached the icon (thread.ts): it starts casting, unless you have already tapped it
let touched = false;
dot.addEventListener('click', () => { touched = true; });
document.addEventListener('hc:lit', () => { if (!touched) setCasting(true); });

// Scene D: the icon in 3D (the flat SVG stays as the fallback)
if (!why3dOff()) import('./scenes/icon').catch(() => { /* the SVG icon stays */ });
if (sec.querySelector('.get-card.lit')) setCasting(true); // the light arrived before this module did
