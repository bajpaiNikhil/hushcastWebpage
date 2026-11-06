# HushCast website: build plan for Claude Code (VS Code)

There are 10 phases. Do **one phase per session**: paste the prompt, review the plan Claude proposes, let it build, check the "done when" list, commit, then run `/clear` before the next phase. `CLAUDE.md` carries the rules between sessions, so you never need to repeat them.

Tip: for phases marked 🧭, switch Claude Code to **plan mode** first (Shift+Tab). It will propose the plan without editing files, and you approve it before it touches anything.

---

## Phase 0: you, 10 minutes (no Claude yet)

1. Install Node.js (current LTS) and the **Claude Code** extension in VS Code.
2. Create the folder and put these files in it:
   ```
   hushcast-web/
   ├── CLAUDE.md                  ← from this pack
   ├── BUILD_PLAN.md              ← this file
   └── docs/
       ├── PRD.md                 ← HushCast_Website_PRD.md
       ├── creative-vision.md     ← HushCast_Creative_Vision.md
       ├── vision.html            ← hushcast-vision.html
       └── app-assets/            ← copy in: ic_launcher_foreground.xml,
                                    ic_launcher_foreground_live.xml,
                                    ic_launcher_background.xml, Color.kt
   ```
3. `git init`, then open the folder in VS Code and start Claude Code.

---

## Phase 1: scaffold 🧭

```
Read CLAUDE.md, docs/PRD.md sections 7–9, and docs/vision.html.
Scaffold the Astro project in this folder exactly as the folder map in CLAUDE.md says:
- Astro, empty template, TypeScript strict, static output
- src/styles/tokens.css built from docs/app-assets/Color.kt (show me the mapping table)
- src/styles/global.css with the base styles from vision.html
- src/layouts/Base.astro with head, meta tags, nav and footer
- npm scripts: dev, build, check, models (check and models can be stubs for now)
Don't port the sections yet. Run the dev server and screenshot the empty layout at 1440 and 390.
```
**Done when:** `npm run dev` shows the nav and footer, the tokens match `Color.kt`, and nothing loads from another origin.

---

## Phase 2: port the sections (HTML/CSS only) 🧭

```
Port every section of docs/vision.html into src/components/ as Astro components,
with no client JS yet. Rules:
- One component per section, plus device frames in src/components/devices/
- Move every sentence of copy into src/content/copy.ts and the FAQ into src/content/faq.ts
- Keep the markup, classes and look identical to the prototype
- Keep every data-thread attribute and all ARIA attributes
- Remove the director's notes and the notes button (they were for review only)
Then screenshot index at 1440, 834 and 390 next to vision.html at the same sizes and list any visual differences.
```
**Done when:** the page matches the prototype with JS turned off, the copy lives only in `src/content/`, and the screenshot comparison is clean.

---

## Phase 3: port the interactions

```
Split the prototype's <script> into src/scripts/:
- thread.ts (load immediately), playground.ts (load when #modes is near the viewport),
  privacy.ts (load when #privacy is near), closing.ts (load when #end is near)
- Use Astro's <script> handling so each one ships as its own small module
- Keep reduced-motion behaviour exactly as in the prototype
Measure the compressed JS size of each module and the total, and report the numbers.
Test with Playwright: draw a stroke on #pad, switch all three tabs, toggle #unplug,
click #dot, emulate offline, and confirm the thread draws on scroll.
```
**Done when:** everything behaves as in the prototype, total page JS ≤ 60 KB compressed (it should be far less), and there are no console errors.

---

## Phase 4: quality gates, before any 3D 🧭

```
Build the checks from CLAUDE.md so the budgets are enforced from now on:
- tools/check-third-party.mjs: Playwright loads dist/, scrolls the whole page,
  interacts with each section, and fails on any request to another origin, any cookie,
  or any localStorage write
- tools/check-budgets.mjs: fails if initial HTML+CSS+JS > 150 KB compressed, JS > 60 KB,
  any poster > 60 KB, any GLB over its scene budget, or 3D total > 1.2 MB
- tools/check-copy.mjs: fails on the forbidden words and ALL CAPS rules in CLAUDE.md
- public/_headers with the CSP, no-referrer and nosniff headers
- npm run check runs astro check + build + all three tools
- .github/workflows/ci.yml runs npm run check on every push
Then run Lighthouse (mobile, throttled) on the built site and report the four scores and LCP/CLS/TBT.
```
**Done when:** `npm run check` passes, Lighthouse scores are 90 / 100 / 100 / 100, and the checks fail when you deliberately add a Google Font link (try it, then remove it).

---

## Phase 5: other pages and SEO

```
Create privacy.astro, terms.astro and support.astro using PRD section 10.4 for the privacy
policy (plain language, one screen). Use placeholders for anything that depends on open
questions Q1 (domain, email) and mark them TODO. Add: meta description ≤ 155 chars,
title ≤ 60 chars, Open Graph tags (image = hero poster, placeholder for now),
sitemap.xml, robots.txt. No SoftwareApplication price until launch.
```
**Done when:** 4 URLs exist, the checks pass, and every TODO is listed for you.

---

## Phase 6: real assets

```
1. Convert docs/app-assets/ic_launcher_foreground.xml (and the _live version) from an
   Android vector drawable to SVG. Convert it exactly; do not redraw anything.
   Show me both SVGs next to each other in a screenshot.
2. Replace the logo placeholder in the nav, footer and closing icon with the real SVG.
   The dot must remain a separate element so it can turn red or green.
3. Replace the step screenshots with files from public/screenshots/ (I'll add them),
   as AVIF + WebP with width/height set so there's no layout shift.
```
**Done when:** the real H-Stroke shows everywhere, no placeholders remain except the Play link, and CLS ≤ 0.05.

---

## Phase 7: 3D stage infrastructure 🧭

```
Build src/scripts/scenes/stage.ts per PRD 9.4 and CLAUDE.md, using a simple placeholder GLB
(a box) until the real scenes exist:
- Poster first: each scene section shows its poster image; the canvas fades over it
  only when the model is ready
- One shared WebGL renderer, moved between sections; dispose when far away
- IntersectionObserver start at 20% visible, pause when hidden, render on demand
- Every fallback rule from CLAUDE.md, plus auto-downgrade on slow frames
- Self-hosted Meshopt and KTX2 decoders in public/decoders/
- Projects GLB empties named ANCHOR_* to page coordinates and passes them to thread.ts
- Scroll progress → animation time mapping (t = p × duration) for scroll-scrubbed clips
Prove that only one WebGL context exists at a time and that memory drops after scrolling away
(use Playwright + the performance API). Report the three.js bundle size.
```
**Done when:** the placeholder model appears over the poster, fallbacks are tested one by one, and there is one context at a time.

---

## Phase 8: Scene A, the hero 🧭

Do this one in two parts.

**8a: Blender (in Blender itself, or with Claude driving Blender if you connect it):**
```
Build Scene A per docs/creative-vision.md section 8 and PRD 9.3: tablet 255×163×7 mm
front-left, laptop further back at about 35% of stage width, NO phone, a clear gap between
them in both the desktop and mobile camera framings. Baked Cycles lighting, ≤ 6 materials,
one 1024 px atlas + 512 px emissive. Empties: ANCHOR_TabletOut, ANCHOR_LaptopIn.
Clips: StageReveal, IndicatorActivate, ConnectDevices, LogoDraw.
Export to blender/exports/hero.glb and render the poster from the final frame.
```

**8b: Integration:**
```
Run npm run models on hero.glb, then wire it into the hero with stage.ts.
Replace the CSS stand-in devices only when WebGL is available; keep them as the
fallback otherwise. The thread must connect through the GLB anchors.
Report: triangles, draw calls, GLB KB, poster KB, frame time on desktop and on a
throttled mid-range mobile profile. Screenshot at 1440 and 390.
```
**Done when:** you have reviewed it **in the browser, not as a Blender render** (approval gate 2), and every budget is met.

---

## Phase 9: scenes D, C and B

Same two-part prompt as Phase 8, one scene per session, in this order:
- **D (icon):** the real H-Stroke extruded, a separate dot mesh, clips IdleToLive and LiveToIdle, ANCHOR_IconIn.
- **C (modes):** the playground canvas becomes a CanvasTexture on the screen meshes. Clips LiveMode, ListenMode, CinemaMode, switched by the tabs in 600 ms.
- **B (privacy):** diagonal layout, ANCHOR_Tablet, ANCHOR_Router and ANCHOR_Laptop, InternetDisconnect clip driven by the toggle and the offline event.

---

## Phase 10: QA and launch switch

```
Run the full PRD section 12 checklist and report pass/fail for every line, with evidence.
Then add a single config flag (PLAY_URL) that, once set, swaps "Coming soon to Google Play"
for the official Play badge + link + QR code everywhere, and adds the price to structured data.
Test both states.
```
Test on real devices yourself:
- **Android phone:** connect it to your computer over USB, then open `chrome://inspect` in Chrome to debug the site running on the phone.
- **iPhone Safari:** use the Xcode iOS Simulator.
- **Mac and Windows:** check in a regular browser on each.

**Done when:** every acceptance criterion passes and you have approved every claim on the page.

---

## Habits that keep Claude Code on track
- **Start sessions with the phase prompt.** Don't start with "continue". Use `/clear` between phases.
- **When it drifts, point it back to the source.** Say "check this against CLAUDE.md and PRD section 6".
- **Ask for numbers, not adjectives.** "Report the KB" beats "make sure it's small".
- **Review every diff that touches `src/content/`.** That folder holds your product claims.
