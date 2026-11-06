**Contents**[1. Summary](#1-summary)[2. Goals, non-goals, success measures](#2-goals-non-goals-success-measures)[3. Audience](#3-audience)[4. Product facts (the only things the site may state as fact)](#4-product-facts-the-only-things-the-site-may-state-as-fact)[5. Message house](#5-message-house)[6. Claims guardrails](#6-claims-guardrails)[7. Site structure (one page + 3 small pages)](#7-site-structure-one-page-3-small-pages)[8. Visual design direction](#8-visual-design-direction)[9. The 3D plan (for the 3D/web AI agent)](#9-the-3d-plan-for-the-3d-web-ai-agent)[10. Content deliverables (content creator)](#10-content-deliverables-content-creator)[11. Roles and deliverables](#11-roles-and-deliverables)[12. Acceptance criteria and QA checklist](#12-acceptance-criteria-and-qa-checklist)[13. Open questions for the owner (needed before launch)](#13-open-questions-for-the-owner-needed-before-launch)[Appendix A. Copy fragments the writer can start from (edit freely, keep the guardrails)](#appendix-a-copy-fragments-the-writer-can-start-from-edit-freely-keep-the-guardrails)[Appendix B. FAQ (the writer finalises; answers here are factual drafts)](#appendix-b-faq-the-writer-finalises-answers-here-are-factual-drafts)[Appendix C. Asset inventory](#appendix-c-asset-inventory)[Appendix D. Glossary](#appendix-d-glossary)

Version 1.0 · for the content, design, web and 3D team

# HushCast website: product requirements (PRD)

Version 1.0, 2026-11-03. Owner: Nikhil Bajpai. Audience of this document: content creator, web designer, web developer, and the 3D/web AI agent (Blender-aware).

Source of truth for product facts: this document, section 4. If anything here conflicts with the app, the app and `CLAUDE.md` win; ask the owner before publishing a claim that is not in section 4 or section 6.

---

## 1. Summary

**HushCast** is an Android app that shows a phone's or tablet's screen and sound in a browser on the same WiFi, with no account, no cloud, no upload and no ads.

**The website** is a single, fast, calm, privacy-first marketing site whose job is to make a visitor understand the product in 10 seconds, trust it, and get it from Google Play. It uses a small number of lightweight 3D scenes (built in Blender, exported for the web) only where they explain something better than a screenshot.

The site must itself behave like the product: **no trackers, no cookies, no third-party requests.**

### One-sentence pitch

Show your Android screen in any browser on your WiFi. It never leaves your network.

### Positioning

A calm, private utility, not a "streaming platform". Closest feel: a well-made Apple-style utility. Dark, quiet, confident, plain words.

---

## 2. Goals, non-goals, success measures

### Goals

1. A first-time visitor can say what HushCast does after the hero (10 seconds) and how it works after the "How it works" section (30 seconds).
2. The privacy promise is believable: shown with a diagram and plain words, not slogans.
3. Visitors on an Android device get to Google Play in one tap; visitors on a computer get a QR code or "send link to my phone".
4. Pricing and the free tier are clear and honest (section 4.5).
5. The site is light and fast on a mid-range phone on 4G (budgets in section 9), and 3D never blocks reading or the download button.

### Non-goals

- No blog engine, user accounts, comments, forms that collect data, chat widgets, or newsletter sign-up that needs a server.
- No claims about things that are not measured or tested (section 6).
- No iOS/Windows/Mac app pages (the app is Android only; viewers are browsers).
- No 3D that hides content, needs a gaming GPU, or autoplays sound.

### Success measures (measured without tracking people)

- Lighthouse (mobile, throttled): Performance 90+, Accessibility 100, Best Practices 100, SEO 100.
- LCP 2.5 s or less, CLS 0.05 or less, TBT 200 ms or less.
- Zero third-party requests (checked in the browser network panel).
- Optional, privacy-friendly: Google Play listing install counts and Play Console store listing conversion (no website analytics are required; see open question Q3).

---

## 3. Audience

| Persona | Situation | What they need to hear |
| --- | --- | --- |
| **Presenter / teacher** | Shows slides or drawing from a tablet to a laptop or classroom screen. | Almost no delay; no account or install on the viewing computer; works on school/office WiFi. |
| **Privacy-minded user** | Dislikes cloud mirroring tools. | Nothing leaves the WiFi; no account; no ads; what exactly is and is not private. |
| **Movie / media sharer** | Watches local video or YouTube on a big screen at home. | Cinema mode for the sharpest picture; Listen mode for music to a few people. |
| **Gamer / hobbyist** | Wants to see the phone on a monitor. | Live mode, one viewer, low delay. |

Primary language: English. Primary region for launch: India, the US, the EU (pricing exists for these).

---

## 4. Product facts (the only things the site may state as fact)

### 4.1 What it does

- Runs on Android 10 or newer, phones and tablets.
- Captures the screen and the sound that apps play, and serves them to a web page on the local WiFi. The viewer needs only a browser and the link (no install, no account).
- Start, allow screen sharing (Android's own prompt), then open the link or scan the QR code on the screen. The viewer page starts by itself.
- Stop is always one tap: in the app or on the floating badge.
- The launcher icon shows state: red dot when idle, green dot while casting.

### 4.2 The three modes (the only names the site uses)

| Name | Technical name (do not show) | What the viewer gets | Limits (true today) |
| --- | --- | --- | --- |
| **Live** | WebRTC, screen + audio | Screen and sound with very little delay (about 0.2 s measured). For drawing and presenting. | One viewer at a time (a second person sees "This cast is full"). Up to 1080p. |
| **Listen** | WebRTC, audio only | Sound only. No screen is captured or sent. | Up to 10 listeners (2 on the free plan). |
| **Cinema** | HLS | Whatever is on the screen, up to the 4K setting, plus sound. Watch only. | About 10 seconds of delay. Say "up to 4K", never "4K video". |

Never write the words WebRTC or HLS on the site (the app does not show them either).

### 4.3 Privacy: what is true and what is not

True:

- No account. No cloud. No upload. The stream goes from the device to browsers on the same WiFi.
- It keeps working on a WiFi with no internet connection.
- The app has no ads and no analytics. The only network service involved in the app is Google Play, for the one-time purchase; the app sends nothing about the user.
- A cast is visible on the device: Android shows its own "screen is being captured" notice, the app shows a floating badge, and the app icon turns green.

Must be said plainly (builds trust):

- **Anyone on the same WiFi who has the address can open the page.** There is no password in this version. In Live the first viewer takes the only seat and others are refused; the host sees the viewer count and can Stop at any moment.
- **The stream is not encrypted.** It stays on the local network. Do not write "encrypted" or "secure"; write "stays on your WiFi".
- During Live and Listen Android shows the **microphone indicator**. Reason: the audio engine opens the microphone only as a clock; the microphone sound is never sent (the sound that is sent is what apps play). Explain it in the FAQ, in one short answer.

### 4.4 Known limits (put them in the FAQ, not hidden)

- Apps that protect their video (Netflix, Prime Video, Disney+ and similar) show black and silence. This is an Android restriction, not a HushCast choice. Never show them on the site.
- Rotation is fixed when the cast starts.
- Some routers block devices from talking to each other ("client isolation"); the cast cannot work on such WiFi.
- The friendly address `hushcast.local:8080` works on some devices and not others. The IP address and the QR code always work. (Verified on a Mac only.)
- On a phone the picture keeps the phone's tall shape in the browser.

### 4.5 Pricing and plans (from the monetization spec)

- **One purchase, no subscription, no ads.** Product "HushCast Unlock" through Google Play.
- Prices: **US $4.99, EU EUR 2.99 (tax included), India INR 89**. Other countries are priced by Google Play for that region. The website must not hard-code a price in code paths that could be wrong; show the three launch prices as text and say "Local pricing in Google Play".
- **First 5 casts are fully unlocked** (a cast counts after 2 minutes with a viewer connected).
- **After that, free forever:** Listen with unlimited time and 2 listeners; Live up to 720p, 7 minutes per cast (a warning appears 2 minutes before it ends).
- **Unlock adds:** Cinema, Live without a time limit, up to 1080p in Live, up to 10 listeners in Listen.
- Refunds follow Google Play's policy.

### 4.6 Status and availability (must be reflected on the site)

- The app is **not on Google Play yet** (the final application id and the Play listing are pending). Until launch the site shows "Coming soon to Google Play" and no purchase button. At launch, swap in the official Play badge and link.
- Do not publish an APK download.

### 4.7 Measured numbers allowed on the site

- Live delay: "almost no delay", about a fifth of a second (measured 175-220 ms for video on one Wi-Fi network). Always keep the wording "about".
- Cinema delay: "about 10 seconds" (measured 10.5 s).
- Anything else needs a new measurement and the owner's approval.

---

## 5. Message house

**Promise:** Your screen, in a browser, only on your WiFi.

**Three pillars** (each gets one section; use these words):

1. **Simple.** A few taps: Start, share, open the link.
2. **Private.** No account, no cloud, no upload. Works without internet.
3. **In your control.** The icon dot shows state; Stop ends it at once; you see how many are watching.

**Tone of voice:** calm, plain, human; short sentences; sentence case everywhere (no ALL CAPS); no hype words ("revolutionary", "seamless", "blazing", "next-gen", "supercharge"); say "device" or "your phone or tablet", never "tablet app". Active voice. One idea per sentence. Reading level: age 12.

**Headline candidates** (designer and writer choose with the owner):

- "Your Android screen. In any browser. Only on your WiFi."
- "Show your screen. Keep it private."
- "Cast without the cloud."

**Support line:** "No account. No cloud. No ads."

---

## 6. Claims guardrails

### Allowed

"No account", "no cloud", "no upload", "no ads", "stays on your WiFi", "works without internet", "almost no delay (about 0.2 s)", "about 10 seconds delay in Cinema", "up to 4K", "up to 1080p in Live", "one purchase", "free to try", "Listen is free forever".

### Forbidden (unless the owner re-verifies and approves in writing)

- "Encrypted", "secure", "military-grade", "unhackable".
- "4K video" (say "up to 4K"), "zero latency", "real-time" without "almost".
- Netflix/Prime/Disney+ or any DRM app shown or promised.
- Several people watching a screen cast (Live is one viewer). Several listeners is fine for Listen.
- Windows, iPhone, Safari or Android Chrome viewer support (not yet tested). Say "any modern browser" only after the owner confirms; until then say "a browser on your computer or phone" and show a Mac browser only.
- Battery, heat or performance claims (not measured).
- Awards, user counts, ratings, testimonials, press logos (none exist).
- Any comparison to named products.
- Identifiable people or copyrighted clips in imagery or video.

---

## 7. Site structure (one page + 3 small pages)

Single scrolling home page, anchored sections, plus Privacy policy, Terms (short) and Support/Contact. Total of 4 URLs.

| # | Section | Purpose | Content brief | 3D? |
| --- | --- | --- | --- | --- |
| 1 | **Hero** | State the product, set the mood, give the CTA | Headline, support line, CTA ("Coming soon to Google Play" then the Play badge), QR to the Play page at launch | **Scene A** (hero) |
| 2 | **How it works** | 3 steps | 1 Start: tap Start casting and allow screen sharing. 2 Open: scan the QR code or type the address on the same WiFi. 3 Watch: it starts by itself. Real app screenshots in device frames (no 3D needed) | No (real UI) |
| 3 | **Three modes** | Explain Live / Listen / Cinema | A tab or three cards with the table in 4.2, plain words, one visual per mode | **Scene C** (one scene, three states) |
| 4 | **Private by design** | The trust section | Diagram of the privacy line (4.3), the "plain truths" about no password and no encryption, the red/green dot explanation | **Scene B** (WiFi line) |
| 5 | **Free, then one purchase** | Pricing | The plan table in 4.5, three prices, "local pricing in Google Play", "Listen is free forever" | No |
| 6 | **Good to know** | Honest limits | The list in 4.4, short | No |
| 7 | **FAQ** | Objections | 12 questions (Appendix B), accessible accordion | No |
| 8 | **Final CTA + footer** | Convert | Same CTA, Privacy policy, Terms, Contact, "No trackers on this site" | **Scene D** (the dot, tiny) |

Navigation: logo + 4 anchors + CTA. Sticky and minimal. Mobile: a single-column page, a bottom-safe CTA.

---

## 8. Visual design direction

Take the look from the app (identical tokens). Source: `app/src/main/java/com/example/smartcastvideo/ui/theme/Color.kt` and the design spec `docs/superpowers/specs/2026-10-30-minimal-ui-redesign-design.md`.

| Token | Value | Use |
| --- | --- | --- |
| bg | `#0B0B0D` | page background, 3D canvas background (transparent canvas) |
| surface | `#161618` | cards |
| surface 2 | `#1E1E21` | raised cards, inputs |
| hairline | white at 8% | dividers |
| text primary | `#F5F5F7` | headings, body |
| text secondary | `#8E8E93` | captions |
| text tertiary | `#636366` | fine print |
| action | `#F5F5F7` button, text `#0B0B0D` | the one filled button per view |
| danger | `#E05555` | ONLY: stop, "screen is being captured", idle dot |
| live | `#34C759` | ONLY: "casting now" dot |
| warning | `#BA7517` | warnings only |

Rules:

- Dark only. **No hue accent.** White is the action colour. Red and green only mean what they mean in the app.
- System font stack only (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter-like fallback`). No web fonts, no icon fonts, no CDN. Large, confident headings; generous whitespace; continuous rounded corners; hairlines instead of boxes.
- Motion: slow, eased, nothing bouncy. One animated moment per section. Respect `prefers-reduced-motion` everywhere.
- Imagery: real app screenshots (captured on the Moto Pad and a phone, no personal data) in plain device frames; 3D only for scenes A-D below. No stock photos of people, no abstract gradient blobs.
- Logo/icon: the H-Stroke with viewers (an H of pen strokes with a wavy crossbar, a red live dot at the top of the right stem, three small viewer screens on thin links). Source: `app/src/main/res/drawable/ic_launcher_foreground.xml` (vector). Use it as SVG; do not redraw it.
- Layout: max content width 1120 px; text column 640 px; 8 px spacing grid; 12-column desktop, 4-column mobile.
- Accessible by default: contrast AA or better (white on `#0B0B0D` is far above), focus rings visible, touch targets at least 44 px, headings in order, alt text for every image.

---

## 9. The 3D plan (for the 3D/web AI agent)

### 9.1 Principles

1. **3D explains, it never decorates.** Four scenes only (A-D). Anything a real screenshot shows better stays a screenshot.
2. **Content first.** The page must be complete, readable and have a working download button with no WebGL at all. 3D is an enhancement.
3. **Light by construction.** Budgets below are limits, not goals. If a scene does not fit, simplify the scene.
4. **No third-party requests.** Self-host the 3D library, decoders, models and textures. This is part of the privacy promise.
5. **Same look as the app.** Near-black, no hue accent, red/green only with their meaning.

### 9.2 Scenes

Reuse assets from the intro video Blender plan (`docs/video/06-blender-build.md`: tablet, laptop, phone, house outline, cloud, icon), but **rebuild them low-poly for the web**; do not export the video-quality assets.

| ID | Where | What it shows | Interaction | Budget |
| --- | --- | --- | --- | --- |
| **A, Hero** | Section 1 | A tablet floating in the dark. The H-Stroke draws itself on the screen in the strokes order; the red dot at the top of the right stem pulses once and turns green when a cast "starts". Three small viewer screens appear on thin links beside it. | Slow camera drift on scroll (a few degrees); subtle pointer parallax on desktop; no free orbit. Loop paused when off screen. | model \<= 350 KB, \<= 25k triangles, 1 texture set \<= 1024 px |
| **B, Stays on WiFi** | Section 4 | A thin white house outline, a router, a tablet and a laptop inside, a thin line between them with a small dot travelling along it. Outside: a grey cloud with a slash that **stays unlit**. Optional toggle "Unplug the internet": the cloud link fades and the dot keeps travelling. | Scroll-scrubbed (the dot position follows scroll) or a 6 s loop. | model \<= 250 KB, \<= 15k triangles |
| **C, Three modes** | Section 3 | ONE scene with three states switched by the mode tabs. Live: tablet + one viewer screen + a small "0.2 s" label. Listen: tablet with sound rings and several small headphones (no picture). Cinema: tablet and a large screen, a short visible lag. | Tab click changes the state with a 0.6 s ease. | model \<= 300 KB, \<= 18k triangles, shared assets, 3 animation clips |
| **D, The dot** | Section 8 | The app icon alone, large; the dot toggles red to green on click/tap or hover ("Idle" / "Casting"). | Click/tap or Enter key. | model \<= 120 KB, \<= 6k triangles |

Total 3D transfer for the whole page: **\<= 1.2 MB** (compressed), loaded in four separate requests, never together.

### 9.3 Blender pipeline (the agent builds these)

- Units metric, 1 Blender unit = 1 m. One `.blend` with one collection per scene. Naming: `A_hero`, `B_wifi`, `C_modes`, `D_dot`, objects named in English without spaces.
- Real-size devices (tablet 255 x 163 x 7 mm; laptop thin; phone about 9:20 portrait). Rounded slabs with a bevel but low segment counts (bevel 2-3 segments).
- **No live shadows, no real-time lights.** Bake lighting and ambient occlusion into textures in Cycles. Use emission only for screens, the line, the dot and the icon.
- Max 6 materials per scene; PBR metal/rough only; one texture atlas per scene, 1024 px max (hero: one 1024 px atlas plus a small 512 px emissive map).
- Screens use an emissive texture (a still screenshot or a short animated atlas), not a video texture.
- Animation: keyframe actions exported as glTF animation clips, loops under 8 s; no physics, no particles (draw sound rings as animated geometry).
- Apply all modifiers; delete hidden geometry; merge by distance; no n-gons; no unused data blocks.
- Export `.glb` (glTF 2.0). Then optimise with gltf-transform: **Meshopt or Draco** geometry compression, **KTX2 (Basis)** textures, `dedup`, `prune`, quantise positions to 14-16 bits. Verify the size against the budgets and check the model in a glTF viewer.
- Deliver for each scene: `.blend` source, `.glb` (optimised), a 1600 px **poster** (AVIF and WebP, each \<= 60 KB, same camera as the scene's first frame, transparent or `#0B0B0D` background), and a short **fallback loop** (muted MP4/WebM \<= 400 KB, 6 s) for devices that cannot run WebGL.

### 9.4 Web integration

- Static site, no framework required (Astro or plain HTML with small islands). JavaScript for the page itself \<= 60 KB compressed; the 3D library is loaded **lazily**, only when scene A or the first scene becomes visible.
- Renderer: three.js (tree-shaken, self-hosted) with GLTFLoader, MeshoptDecoder (or DRACOLoader) and KTX2Loader, or `<model-viewer>` where a scene needs no custom animation (scene D is a good fit). Choose one approach per scene; do not ship both libraries.
- **One WebGL context at a time.** Share a single renderer and swap scenes, or create a scene's context when it enters the viewport and dispose it (geometry, materials, textures, renderer) when it leaves.
- Lazy start with IntersectionObserver (start when 20% visible, pause when not visible, dispose when far away). Render on demand when nothing animates (no idle 60 fps loop). Cap pixel ratio at 1.5 (2 for the hero on desktop). Resize observer, canvas has fixed aspect-ratio in CSS before it loads (no layout shift).
- The **poster is the LCP element** for the hero. The canvas fades over it when the model is ready. The page never waits for 3D.
- **Fallback rules (no 3D, poster or loop instead):** `prefers-reduced-motion: reduce`; `navigator.connection.saveData`; effective connection `2g/3g`; `navigator.deviceMemory <= 4` or `hardwareConcurrency <= 4` on mobile; WebGL unavailable or context lost; frame time over 24 ms for 2 seconds (auto-downgrade, then stop and show the poster).
- Do not hijack scrolling (no scroll-jacking, no snap that traps the user); scroll-scrubbing only maps scroll position to an animation time.
- Every scene has an accessible text equivalent next to it (the section copy) and the canvas has `role="img"` plus a short `aria-label`; interactive scenes (C, D) are keyboard operable.
- No analytics inside scenes, no external textures or HDRIs (use baked lighting, not environment maps loaded from a CDN).

### 9.5 Performance budgets (page level, mobile, throttled 4G, mid-range phone)

| Metric | Budget |
| --- | --- |
| Initial HTML + CSS + JS (before any 3D) | \<= 150 KB compressed |
| Hero poster (LCP image) | \<= 60 KB, preloaded, `fetchpriority="high"` |
| Fonts | 0 KB (system fonts) |
| Hero 3D (lazy, after LCP) | \<= 350 KB |
| Whole page 3D total | \<= 1.2 MB, requested on demand |
| LCP / CLS / TBT | \<= 2.5 s / \<= 0.05 / \<= 200 ms |
| Frame rate | 60 fps desktop, 30 fps acceptable on mid-range mobile; auto-degrade below that |
| Memory | one active scene, disposed when off screen |
| Third-party requests | 0 |

### 9.6 What the 3D agent must report back

For each scene: final triangle count, draw calls, texture sizes, `.glb` size, load time on throttled 4G, measured frame time on a mid-range Android phone and on a laptop, and a screenshot of the poster. If a budget is exceeded, say which one and propose the cut.

---

## 10. Content deliverables (content creator)

1. Final copy for every section in section 7, in the tone in section 5, within the guardrails in section 6. Deliver as a single document (headline, support line, section copy, button labels, alt text, meta description \<= 155 characters, page title \<= 60 characters).
2. FAQ: finalise the 12 answers in Appendix B (one to three short sentences each).
3. Google Play listing copy: short description (80 characters), full description (about 400 words), what's new text for 1.0, and five screenshot captions. Must obey the same guardrails.
4. Privacy policy (plain-language, one screen): the app collects nothing, stores two small values on the device (the trial counter and the unlock state), the purchase is handled by Google Play, and the website uses no cookies or trackers. Terms: short. (A lawyer's review is the owner's decision.)
5. A 30-45 second script for a silent, captioned loop of the hero, and a 15 second teaser. The longer intro video already has its own files in `docs/video/` (brief, script v4, storyboard, voiceover); reuse its language, do not contradict it.
6. A press-kit text (3 sentences, 1 paragraph, 5 facts) for later.

Style references: `docs/video/01-brief.md` (the do-not-claim list is binding) and this PRD's section 6.

---

## 11. Roles and deliverables

| Role | Owns | Delivers | Needs from others |
| --- | --- | --- | --- |
| **Content creator** | Words | Copy doc, FAQ, store listing, privacy policy draft, alt text | Section 4 facts; owner's decisions on Q1-Q6 |
| **Web designer** | Look and layout | Figma file (desktop 1440, tablet 834, mobile 390), component library using the tokens in section 8, interaction notes, an annotated spec for each 3D scene's framing | Copy; real screenshots; the icon SVG |
| **3D/web AI agent** | Scenes A-D | The Blender source, optimised `.glb`s, posters, fallback loops, an integration module (lazy loader, fallbacks, disposal), the report in 9.6 | Designer's framing and palette; the asset list; the budgets |
| **Web developer** | The site | Static build, responsive layout, accessibility, the accordion/tabs, the lazy 3D integration (with the agent's module), headers and caching, the CI check for budgets and for zero third-party requests | Designs; copy; scene files |
| **Owner** | Decisions and truth | Answers to open questions; real screenshots; final approval of every claim |  |

### Milestones (relative, adjust to the team)

1. **Week 1:** copy outline and FAQ draft; wireframes; Blender assets blocked out (grey boxes) and size/triangle plan agreed.
2. **Week 2:** design complete; scene A and D first optimised exports; copy final draft.
3. **Week 3:** site built with posters; scenes B and C; Lighthouse and budget checks; accessibility pass.
4. **Week 4:** polish, QA on real devices, owner approval of every claim, launch toggle ("coming soon" to Play badge) tested.

---

## 12. Acceptance criteria and QA checklist

**Content**

- Every sentence passes section 6 (allowed/forbidden). No "encrypted", no "4K video", no DRM apps, no unverified browsers.
- The words WebRTC and HLS appear nowhere on the site.
- The no-password and not-encrypted truths are stated in plain words in section 4 of the page.
- Prices match section 4.5; the free-plan limits match exactly (Listen 2 listeners, Live 720p / 7 minutes).
- "Coming soon to Google Play" shows until the owner provides the final Play link; no APK link exists.

**Design**

- Only the tokens in section 8; no hue accent; red/green only for their meanings; one filled button per view.
- No web fonts, no icon fonts, no external images.

**3D and performance**

- All budgets in 9.2 and 9.5 met (report attached).
- The page is complete and the CTA works with JavaScript disabled and with WebGL disabled.
- Reduced motion, data saver, low memory, WebGL lost and slow-frame fallbacks each tested and showing the poster or the loop.
- Only one WebGL context is alive at any time; memory returns after scrolling away (check with the browser's performance tools).
- No layout shift when the canvas appears.

**Privacy and security**

- Network panel shows zero third-party requests, no cookies, no local storage writes except an optional "reduced motion override".
- Strict headers: CSP that allows only the site's own origin; `Referrer-Policy: no-referrer`; HTTPS; `X-Content-Type-Options: nosniff`.

**Accessibility and SEO**

- Keyboard-only walkthrough passes; screen reader reads sections in order; every image and scene has a text equivalent.
- Contrast AA or better; focus visible; targets at least 44 px.
- Meta tags, Open Graph image (a poster), `sitemap.xml`, `robots.txt`, structured data (SoftwareApplication) with the real price only at launch.

**Devices**

- Checked on a mid-range Android phone (Chrome), an iPhone (Safari), a Mac (Safari, Chrome), and a Windows laptop (Edge/Chrome), at 390, 834 and 1440 px widths.

---

## 13. Open questions for the owner (needed before launch)

| # | Question | Why it matters |
| --- | --- | --- |
| Q1 | Final domain name and the support email address. | Footer, privacy policy, store listing. |
| Q2 | Final Android application id and the Google Play link (and when it goes live). | The CTA and the QR code; until then the site says "coming soon". |
| Q3 | Website analytics: none (recommended), or a cookie-free self-hosted counter? | The site promises no trackers. |
| Q4 | Which browsers may the site say work (after testing Windows, iPhone, Android Chrome)? | Claim guardrail. |
| Q5 | Do we show a "notify me" option? (Needs a server or a mailto; a mailto is the only privacy-safe version.) | No forms that collect data. |
| Q6 | Brand name check and trademark/domain availability for "HushCast". | Legal. |
| Q7 | Who provides the real screenshots (Moto Pad and one phone), with no personal data on screen? | Sections 2 and 3. |
| Q8 | Will the longer intro video (`docs/video/`) be embedded? If yes: a poster plus click-to-load (no autoplay, no third-party player). | Weight and privacy. |

---

## Appendix A. Copy fragments the writer can start from (edit freely, keep the guardrails)

- Hero sub: "HushCast shows your phone or tablet's screen and sound in a browser on the same WiFi. No account, no cloud, no upload."
- Step 1: "Tap Start casting and allow screen sharing." Step 2: "On any computer or phone on the same WiFi, scan the QR code or type the address." Step 3: "It starts by itself. Tap Stop whenever you like."
- Privacy line: "The stream goes straight from your device to the browser. It never goes to us, because there is no us in the middle."
- Modes: "Live: your screen and sound, with almost no delay." "Listen: just the sound, for a few people." "Cinema: the sharpest picture, a few seconds behind."
- Honest line: "Anyone on your WiFi who has the address can open the page, so cast on a network you trust."
- Pricing: "Try it with 5 free casts. Listen stays free forever. Unlock everything once: $4.99, EUR 2.99, INR 89. Local pricing in Google Play."
- Footer: "No trackers on this site."

## Appendix B. FAQ (the writer finalises; answers here are factual drafts)

1. **Is HushCast free?** You get 5 free casts with everything unlocked. After that, Listen stays free (2 listeners) and Live is free up to 720p for 7 minutes per cast. One purchase unlocks everything.
2. **Do I need an account?** No.
3. **Does it use the internet?** No. It works on a WiFi with no internet. Only buying the unlock goes through Google Play.
4. **Who can see my screen?** Anyone on the same WiFi who has the address. In Live only one person can watch at a time; you see the viewer count and can Stop at any moment. There is no password in this version, so use a network you trust.
5. **Is it encrypted?** It stays on your local network and is not encrypted. We say "stays on your WiFi", nothing more.
6. **Why does Android show the microphone indicator?** In Live and Listen the audio engine opens the microphone only to keep time. The microphone sound is never sent; what is sent is the sound apps play.
7. **Why is the picture black for Netflix and similar apps?** Android blocks screen capture for protected video. HushCast cannot and does not bypass it.
8. **How much delay is there?** Live: about a fifth of a second. Cinema: about 10 seconds.
9. **Which devices?** Android 10 or newer, phones and tablets. The viewer needs only a browser. (Browser list: pending Q4.)
10. **What is the address I type?** The app shows it under the QR code. `hushcast.local:8080` works on some devices; the numbers address (like 192.168.x.x:8080) always works.
11. **It does not connect. What now?** Make sure both devices are on the same WiFi. Some routers block devices from talking to each other ("client isolation"); try another network or a phone hotspot.
12. **Can I get a refund?** Purchases are handled by Google Play and follow its refund policy.

## Appendix C. Asset inventory

| Asset | Where it is | Notes |
| --- | --- | --- |
| App icon (vector) | `app/src/main/res/drawable/ic_launcher_foreground.xml`, `ic_launcher_background.xml` | Use as SVG; red dot idle. Live version with the green dot: `ic_launcher_foreground_live.xml` |
| Design tokens | `app/src/main/java/com/example/smartcastvideo/ui/theme/Color.kt`; spec in `docs/superpowers/specs/2026-10-30-minimal-ui-redesign-design.md` | Mirror, do not invent colours |
| Video brief, script, storyboard, Blender build, voiceover | `docs/video/` | Reuse language and assets; web assets must be rebuilt low-poly |
| Product facts | `CLAUDE.md` and this PRD section 4 | Facts win over this PRD if they differ |
| Monetization rules | `docs/superpowers/specs/2026-11-02-monetization-design.md` | Prices and limits |
| Screenshots | To be captured (Q7) | Moto Pad + a phone; no personal data |

## Appendix D. Glossary

- **Cast:** one run of the app sharing a screen or sound.
- **Viewer / listener:** a browser connected to a cast (Live has one viewer, Listen has listeners).
- **Badge:** the small floating pill on the device while casting (shows the address, Stop, and the "2 min left" warning on the free plan).
- **Unlock:** the one-time Google Play purchase.
- **Poster:** the still image shown instead of (or before) a 3D scene.