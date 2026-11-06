import { RM, $, toast } from './util';
import { T, tPath } from './thread';

const sec = $('#privacy'), houseWrap = $('#houseWrap'), unplug = $('#unplug'), netState = $('#netState');
const packet = $('#packet');

function setUnplugged(on: boolean) {
  unplug.setAttribute('aria-checked', String(on));
  houseWrap.classList.toggle('unplugged', on);
  netState.textContent = on ? sec.dataset.stateOff! : sec.dataset.stateOn!;
}
unplug.addEventListener('click', () => setUnplugged(unplug.getAttribute('aria-checked') !== 'true'));
addEventListener('offline', () => { setUnplugged(true); toast(sec.dataset.toastOffline!); });
addEventListener('online', () => { setUnplugged(false); toast(sec.dataset.toastOnline!); });
if (!navigator.onLine) setUnplugged(true);

// The packet: on a wide page the road itself runs tablet → router → laptop, and the packet rides it;
// otherwise it runs along the diagram's own home-network line. It starts once the walker has reached the
// laptop, and only moves while the diagram is on screen.
const lan = $<SVGPathElement>('#lanPath'), lanLen = lan.getTotalLength(), hLap = $('#hLap');
const roadPkt = $('#roadPacket');
let pRaf = 0, pVis = false;
function packetTick(now: number) {
  pRaf = 0;
  const a = T.anchors.find((p) => p.el.id === 'hTab'), b = T.anchors.find((p) => p.el.id === 'hLap');
  const onRoad = !!(a && b);
  houseWrap.classList.toggle('on-road', onRoad);
  if (!pVis || RM || !hLap.classList.contains('arrived')) { packet.style.opacity = roadPkt.style.opacity = '0'; if (pVis && !RM) pRaf = requestAnimationFrame(packetTick); return; }
  const k = (now % 2800) / 2800, e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  const o = String(Math.min(1, Math.min(k, 1 - k) * 8));
  if (onRoad) {
    const p = tPath.getPointAtLength(a!.len + (b!.len - a!.len) * e);
    roadPkt.setAttribute('cx', p.x.toFixed(1)); roadPkt.setAttribute('cy', p.y.toFixed(1));
    roadPkt.style.opacity = o; packet.style.opacity = '0';
  } else {
    const p = lan.getPointAtLength(lanLen * e);
    packet.setAttribute('cx', p.x.toFixed(1)); packet.setAttribute('cy', p.y.toFixed(1));
    packet.style.opacity = o; roadPkt.style.opacity = '0';
  }
  pRaf = requestAnimationFrame(packetTick);
}
new IntersectionObserver((es) => es.forEach((e) => {
  pVis = e.isIntersecting;
  if (pVis && !pRaf && !RM) pRaf = requestAnimationFrame(packetTick);
}), { threshold: [0, .15, .3] }).observe(sec);
