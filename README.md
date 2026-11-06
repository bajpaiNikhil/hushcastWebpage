# HushCast website

Marketing site for **HushCast**, an Android app that shows a phone or tablet's screen and sound in a browser on the same WiFi. No account, no cloud, no upload, no ads.

This repo is the website only, not the app. It is a static site: four pages, a small amount of client JavaScript, and an optional 3D hero scene.

> Private project. Nothing here is licensed for reuse.

## What was built

- **Four pages:** `/` (home), `/privacy/`, `/terms/`, `/support/`.
- **Home page order:** hero, film, how it works, use cases, modes, privacy, pricing (free vs Unlock, no prices yet), limits, FAQ, availability.
- **Hero:** a three.js scene (a tablet casting to a laptop) that plays once on load. A pre-rendered poster is the LCP element and the fallback.
- **The road and the walker:** one SVG road runs down the page and a small stick figure walks it as you scroll. Each section's single animation starts when he arrives. With reduced motion the road is fully drawn and nothing moves.
- **Works without JavaScript:** the content and the call to action do not depend on scripts.
- **Privacy by construction:** no third-party requests, no cookies, no analytics, no web fonts. The only allowed local storage write is a reduced-motion override.

## Stack

- [Astro](https://astro.build), static output only, TypeScript strict. No UI framework.
- Plain CSS with custom properties (`src/styles/tokens.css`). No Tailwind.
- three.js, tree-shaken and self-hosted in its own lazy chunk, with `GLTFLoader` only.
- Models ship as `.gltf` + `.bin` + WebP textures, so the CSP does not need `wasm-unsafe-eval` or `blob:` images.
- Playwright, for checks only.

## Repo layout

```
src/
  pages/        index, privacy, terms, support, robots.txt, sitemap.xml
  layouts/      Base.astro (head, meta, nav, footer)
  components/   one file per section, HTML and CSS only; devices/ holds the device frames
  content/      all copy, the FAQ and the legal text (components read from here)
  scripts/      the only client JS: thread, route, playground, privacy, closing, film, proof
    scenes/     gate (may 3D run?), stage (shared WebGL renderer), hero, icon
  styles/       tokens.css (colour tokens) and global.css
public/         self-hosted assets: _headers, models, posters, screens, media, icons, og.png
tools/          build helpers and the checks run by `npm run check`
.github/        CI workflow that runs `npm run check`
```

Source art (Blender scenes), product docs and local project notes are kept out of this repo. They are not needed to build or host the site.

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies. Needs Node 22.23.4 or newer. |
| `npm run dev` | Dev server on port 4321. Add `-- --host` to test on a phone over WiFi. |
| `npm run build` | Build the static site into `dist/`. |
| `npm run preview` | Serve the built site locally. |
| `npm run check` | Type check, build, then copy rules, size budgets, third-party requests and road checks. |
| `npm run models` | Optimise `blender/exports/*.glb` into `public/models/` (needs the Blender exports, which are not in this repo). |

`npm run check` uses Playwright. Install the browser once with `npx playwright install chromium`.

### Tools

- `tools/check-copy.mjs`: banned words, casing and required privacy facts on the built pages.
- `tools/check-budgets.mjs`: size budgets (initial HTML + CSS + JS, page JS, posters, models).
- `tools/check-third-party.mjs`: loads every page and fails on any other-origin request, cookie, storage write, CSP violation or console error.
- `tools/check-road.mjs`: fails if the road or the walker touches visible text at 1440, 834 and 390 px.
- `tools/render-posters.mjs`: renders the hero posters from the live scene (needs ffmpeg with libaom-av1 and libwebp).
- `tools/optimise-models.mjs`, `tools/make-screens.py`, `tools/make-film.py`: asset pipelines for models, screenshots and the film.

## Budgets

Enforced by `npm run check`:

- Initial HTML + CSS + JS: 150 KB compressed or less. Page JS: 60 KB or less.
- Hero poster: 60 KB or less.
- 3D models: 1.2 MB in total.
- One WebGL context at a time. 3D is optional and falls back to the poster for reduced motion, data saver, slow networks, low-end devices, no WebGL or slow frames.

## Privacy and security headers

`public/_headers` sets a self-only Content-Security-Policy, `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff` and a restrictive `Permissions-Policy`. Cloudflare Pages applies this file automatically.

The CSP allows one inline script by its SHA-256 hash. If that inline script changes, update the hash in `_headers`.

## Content rules

- All copy lives in `src/content/`. Components never hard-code sentences.
- Sentence case everywhere, no uppercase text transforms.
- Product facts come only from the product requirements document. Do not add claims, numbers or prices that are not in it. There are no prices on the site yet.
- **Play Store link:** `site.playUrl` in `src/content/copy.ts`. While it is empty, the site shows "Coming soon to Google Play" and no buy button. Set it and every acquisition link switches to the Play link.

## Deploying to Cloudflare Pages

1. Workers & Pages, Create, Pages, Connect to Git, and pick this repo.
2. Framework preset: Astro.
3. Build command: `npm run build`. Output directory: `dist`.
4. Environment variable: `NODE_VERSION=22`.
5. Keep Cloudflare Web Analytics, Rocket Loader and email obfuscation off. They inject scripts, which breaks the zero-third-party promise.
6. After the first deploy, run `curl -I` on the site and confirm the CSP and other headers are present.

## Continuous integration

`.github/workflows/ci.yml` runs `npm ci`, installs Chromium and runs `npm run check` on every push and pull request.
