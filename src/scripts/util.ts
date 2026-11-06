export const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector(s) as T;
export const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll(s)) as T[];
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const toastEl = () => document.getElementById('toast')!;
let toastT: number;
export function toast(msg: string) {
  const el = toastEl();
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastT);
  toastT = window.setTimeout(() => el.classList.remove('show'), 5600);
}

/** Load a module when the target is near the viewport. */
export function lazy(selector: string, load: () => Promise<unknown>, margin = '600px') {
  const el = document.querySelector(selector);
  if (!el) return;
  const io = new IntersectionObserver((es) => {
    if (es.some((e) => e.isIntersecting)) { io.disconnect(); load(); }
  }, { rootMargin: margin });
  io.observe(el);
}
