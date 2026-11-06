// The film's big play button: a clear affordance over the poster. Without JavaScript the button
// stays hidden and the native controls do the same job. Nothing is fetched until play is pressed.
const video = document.getElementById('filmVideo') as HTMLVideoElement | null;
const btn = document.getElementById('filmPlay') as HTMLButtonElement | null;
if (video && btn) {
  btn.hidden = false;
  const show = (on: boolean) => { btn.hidden = !on; };
  btn.addEventListener('click', () => { video.play().catch(() => show(true)); video.focus(); });
  video.addEventListener('play', () => show(false));
  video.addEventListener('ended', () => show(true));
  // pause when the film is scrolled almost out of view, so sound never plays from an unseen video
  new IntersectionObserver(([e]) => { if (!e.isIntersecting && !video.paused) video.pause(); }, { threshold: 0.15 }).observe(video);
}
export {};
