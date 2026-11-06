# HushCast website

Marketing site for HushCast, an Android app that shows a phone or tablet's screen and sound in a browser on the same WiFi. No account, no cloud, no upload, no ads.

Owner: Nikhil. This project is private. Do not publish, deploy or share anything unless asked.

## Source of truth (read before changing copy or design)
- `docs/PRD.md`: product facts (section 4), claims rules (section 6), budgets (section 9). **The PRD wins** over everything else, including the creative docs.
- `docs/creative-vision.md`: the creative direction (the thread, the playground, quiet motion).
- `docs/vision.html`: the approved prototype. Port from it. Do not redesign it.

If a task needs a product claim that is not in PRD section 4 or 6, stop and ask. Never invent features, numbers, browsers, testimonials or prices.

## Stack
- Astro, static output only. TypeScript strict. No UI framework (no React, Vue or Svelte) unless asked.
- three.js (tree-shaken, self-hosted, its own lazy chunk) for scenes A–D, with GLTFLoader only. Models ship as .gltf + .bin + WebP textures: no Meshopt/Draco/KTX2 (their WASM decoders would need 'wasm-unsafe-eval' in the CSP) and no embedded GLB textures (three.js loads those from blob: URLs, which the CSP blocks).
- Plain CSS with custom properties. No Tailwind, no CSS-in-JS.
- Tooling: `@gltf-transform/cli`, Playwright (checks only).

## Commands
- `npm run dev`: local server (port 4321). Use `npm run dev -- --host` to test on a phone over WiFi.
- `npm run build`: static site in `dist/`.
- `npm run check`: `astro check`, budgets and the third-party request test. Run it before saying a task is done.
- `npm run models`: optimise `blender/exports/*.glb` into `public/models/<scene>.gltf` (+ .bin, + WebP).
- `node tools/render-posters.mjs` (after a build): render the hero posters from the live three.js scene into `public/posters/` (needs ffmpeg with libaom-av1 and libwebp) and print the anchor positions for global.css.
- Blender (background): `blender --background --factory-startup --python blender/build_scene_a.py -- build bake export` (hero) and `--python blender/build_scene_d.py` (icon).

## Folder map
- `src/pages/`: index, privacy, terms, support (exactly 4 URLs)
- `src/layouts/Base.astro`: head, meta, nav, footer
- `src/components/`: one file per section, HTML and CSS only, **no client JS**
- `src/components/devices/`: Tablet, Laptop, Phone, Tv frames
- `src/scripts/`: the only client JS (thread, playground, privacy, closing, scenes/*)
- `src/scripts/scenes/`: gate.ts (may 3D run? includes a throwaway WebGL probe), stage.ts (the one shared WebGL renderer), hero.ts (Scene A), icon.ts (Scene D)
- `src/scripts/film.ts`: the film's play button; `src/content/film.ts`: film copy; `public/media/`: film web copy, captions, poster (`tools/make-film.py`)
- `blender/`: build_scene_a.py, build_scene_d.py, web-scenes.blend, web-scene-d.blend, bake/, exports/
- `src/content/`: all copy and the FAQ. Components read from here and never hard-code sentences.
- `src/styles/tokens.css`: colour tokens, which mirror the app's `Color.kt` exactly
- `public/`: self-hosted assets only (models, posters, loops, decoders, screenshots)
- `tools/`: optimise-models.mjs, render-posters.mjs, make-screens.py, check-budgets.mjs, check-third-party.mjs, check-copy.mjs

## Hard rules
**Privacy (part of the product promise)**
- Zero third-party requests. No CDNs, Google Fonts, analytics, embeds, external images or HDRIs.
- No cookies. The only allowed local storage write is a reduced-motion override.
- CSP allows self only. Also send `Referrer-Policy: no-referrer` and `X-Content-Type-Options: nosniff`.

**Copy (PRD section 6)**
- Sentence case everywhere. No ALL CAPS, and no `text-transform: uppercase`.
- Never write: encrypted (except "not encrypted"), secure, zero latency, real-time, 4K video, any browser, WebRTC, HLS, seamless, revolutionary, blazing.
- Always: "about 0.2 s", "about 10 s", "up to 4K", "up to 1080p in Live".
- Live has ONE viewer. Never show or imply several people watching a Live cast.
- The no-password and not-encrypted facts must stay visible in the privacy section.
- Terms of service (`/terms/`, `termsDoc` in `src/content/legal.ts`) are full terms, not the PRD's short version (owner's decision, 6 Nov 2026): provided by Nikhil Bajpai as an individual, governed by the laws of India. Product facts in them come only from PRD section 4. Not legal advice; a lawyer's review is the owner's call.
- No prices on the site (owner's decision, 3 Nov 2026; this overrides PRD section 4's launch prices). The owner adds them before launch. The pricing section shows free vs Unlock only.
- Until the owner gives the Play link: "Coming soon to Google Play", no buy button, no APK link. The link lives in ONE place: `site.playUrl` in `src/content/copy.ts`. Empty = every acquisition link shows release status and points to `#get-app`; set it and the nav, hero, film, availability section and mobile bar switch to the Play link.

**Design**
- Use only the tokens in `tokens.css` (see Colour below). Red (#E05555) and green (#34C759) only mean idle/stop and casting / the signal.
  - Green is also the colour of the stream itself: the cast arc, its packets and WiFi rings in the hero, the road's painted line behind the walker, passed milestones, the walker's light. The cloud's slash is red (not used). Drawings on device screens use the drawing app's pen colours: that is screen content, not page UI.
- System font stack only. One filled white button per view.
- Touch targets ≥ 44 px, visible focus, AA contrast, headings in order.
- Motion is slow and eased, never bouncy, one moment per section. Respect `prefers-reduced-motion` everywhere.
- Do not redraw the H-Stroke logo. Use the SVG converted from the app's vector drawable.

**Performance budgets (fail the build if exceeded)**
- HTML + CSS + JS before 3D: ≤ 150 KB compressed. Page JS: ≤ 60 KB compressed.
- Hero poster ≤ 60 KB, preloaded with `fetchpriority="high"`. It is the LCP element.
- GLB: A ≤ 350 KB / 25k tris, B ≤ 250 KB / 15k, C ≤ 300 KB / 18k, D ≤ 120 KB / 6k. Total ≤ 1.2 MB.
- Only one WebGL context alive at a time. Dispose of a scene when it leaves the viewport. Render on demand, cap pixel ratio at 1.5 (2 for the hero on desktop).
- No scroll-jacking or snap. Scroll only maps to an animation time.
- 3D is optional. Show the poster or loop when: reduced motion, saveData, 2g/3g, low memory or few CPU cores on mobile, no WebGL, context lost, or frame time > 24 ms for 2 s.
- The page and CTA must work with JS disabled.

## The road and the walker (signature element)
One inline SVG path through every `[data-thread]` anchor, starting at `.anc-out` under the hero stage, drawn as a road (edge, surface, dashed centre line). A small stick figure carrying a green light walks it as far as the reader has scrolled (his target sits at 64% of the viewport); behind him the centre line is painted green, passed milestones turn green, and he waves once at the end. Three layers (`#thread` static road + milestones, `#threadLive` the green line and the privacy packet, `#walker` moved by transform only) so scrolling never repaints the whole road; the walker's animation loop stops when he stands still. `data-thread="left"` = section header (the road runs in the gutter, never through text). Keep it ≥ 14 px from the page edge. With reduced motion there is no walker and the road is shown fully painted. (Owner's choice, 3 Nov 2026: the walker stays.)

**Routing (3 Nov 2026).** The road never crosses text, but it does travel between things. `src/scripts/route.ts` maps the page onto an 8 px grid, marks every line of text (plus controls, the film frame, the tabs and the availability card) as no-go with room for the walker, and finds the cheapest path that only goes down or sideways; devices cost a bit more to cross than open space. Fixed points: `[data-thread]` (`left` = 56 px left of a section's text, 14 px minimum on phones; `.anc-out` under the hero; `.anc-end` level with the app icon). On a wide page (≥ 981 px) it also travels to `[data-visit]`: the three devices in How it works and the tablet, router and laptop in the house (where the road is the network line and the packet rides it; the dotted LAN line is shown only when the road doesn't go there). A visit it cannot reach cleanly becomes a `[data-stop]`, reached by height. `tools/check-road.mjs` (part of `npm run check`) fails if the road (±8 px) or the walker (±14 × 36 px) touches any visible text at 1440, 834 or 390 px.

**Availability is said once** in the content: the availability card (plus the phone bar, which hides while you scroll down and returns on scroll up). The nav "Availability" pill appears only once the hero is behind you (always visible without JS and on the other pages). The hero and film only get a link when `site.playUrl` is set.

**Arrivals.** When the walker reaches a stop, `thread.ts` adds `.arrived` to the stop and `.met` to its `.step` or `section` (once per page view), opens a green ring where he stands and he lifts his light. Each section's one moment starts from those classes: Film (ring from the play button), How (each screen switches on, its number fills), Use cases (drawings draw in), Modes ("draw for me" demo, via `onArrive`), Privacy (a packet on the diagram's own home-network line), Pricing (light down the Unlock column; the table is its own stop), Limits and FAQ (items come in one after another). A section's eyebrow number takes its colour when he arrives (How cyan, Modes the current mode, Privacy green, white elsewhere). At the end, mid-wave, his light travels to the app icon and the icon starts casting (`hc:lit`, unless the visitor already tapped it). Waiting states only exist once thread.ts runs (`.rv-ok`) and with motion allowed; `.rv` blocks show themselves after 3 s if the script never runs; with reduced motion everything arrives at once, and a stop he can never reach (or a road that failed to build) arrives after 2.2 s on screen. Don't use mixed-case SVG attribute selectors such as `[pathLength]` for these: Chrome does not restyle them when a parent's class changes.

## Page order and the hero
Hero (brand lockup, headline, "Watch the film 1:57") → Film (#film) → How → Use cases → Modes → Privacy → Pricing → Limits → FAQ → Availability (#get-app). The hero is one screen tall (no pinned stage). Scene A plays the cast once on load (time-based: dot green, the screen flies to the laptop, the drawing arrives 0.2 s later, the stream runs ~7 s, then the scene is still and stops rendering); scrolling only drifts the camera a few degrees.

## Colour
Tokens in `tokens.css` (owner-approved 3 Nov 2026): charcoal base; cyan = illustrative accent (headline phrase, selected states); green = casting / the local signal; red = idle/stop; mode accents Live cyan, Listen violet, Cinema amber, always with a label or icon. No raw hex in components.

## How to work here
- Work in small steps. Show the plan before multi-file changes.
- After UI changes, run the dev server and take Playwright screenshots at 1440, 834 and 390 px wide. Look at them before reporting.
- Run `npm run check` before saying anything is done. Report real numbers (KB, triangles, Lighthouse), never estimates.
- Don't add dependencies without saying why and what they cost in KB.
- Commit after each completed phase with a clear message. Never push or deploy unless asked.
