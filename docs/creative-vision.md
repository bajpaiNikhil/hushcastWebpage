# HushCast website: creative vision and design guide

Private working document for Nikhil. Version 1, 3 November 2026.
Read it alongside `hushcast-vision.html`. Open the page, scroll through it once, then press **Director's notes** (bottom right) and scroll again.

---

## 1. The idea in one line

**The page is your WiFi. The stream is one line, and that line never leaves the page.**

A single white hairline starts at the moment a cast begins in the hero. It runs from the tablet to the laptop, then down through every chapter. It cascades through the three steps, plugs into the tablet in the modes playground, enters the house in the privacy scene, runs down the margin past pricing and the FAQ, and ends inside the app icon at the bottom. It never touches the edge of the screen.

That one line explains the product: the stream goes from your device to a screen on the same network, and nowhere else. You don't need a lock, a shield or a networking diagram to show it. The visitor follows the line for the whole page and sees, without being told, that it never goes up to the cloud.

The ChatGPT guide puts the product inside a cinematic film. This version is different: **the site itself behaves like the product.**

---

## 2. Five creative principles

**1. One thread.** Every chapter connects to the same line. The 3D scenes are places the line passes through, not separate set pieces. Because of this, the four Blender scenes, the screenshots and the editorial pages read as one site and not four demos joined together.

**2. Colour is earned.** The whole page is greyscale. The only hues on the site are the red and green dot, and they appear only where the app shows them. When the badge turns green in the hero, it is the most saturated pixel on the screen, so the visitor feels the cast start. This follows the PRD's "no hue accent" rule.

**3. Feel it, don't read it.** "About 0.2 s" and "about 10 s" mean nothing as numbers. In the modes chapter the visitor draws on a tablet and watches the stroke arrive. In Live it is almost instant. In Cinema they wait about ten seconds while a countdown runs. In Listen no picture arrives at all, and only the listeners respond. One small "Illustration" line keeps this honest.

**4. The site keeps the promise in public.** The footer shows a live count of requests this page has made to other websites, read from the browser's own resource timing. It shows 0. Also, if the visitor's internet really drops while they are on the privacy section, the scene unplugs itself and says so. The privacy claim is shown on their own device, not just stated.

**5. Hush.** Quiet motion: slow ease-out curves, nothing bounces, no idle loops. Each section has one animated moment. The pricing, limits and FAQ sections are deliberately still. After three immersive chapters, that stillness is what makes them trustworthy.

---

## 3. What I'd keep and change from the ChatGPT guide

**Keep:** the Blender pipeline, collection naming, modular animation clips, the scroll-to-time mapping (`t = p × T`), budgets, poster and fallback deliverables, approval gates, and starting with Scene A. That is solid production planning.

**Change:**

| ChatGPT guide | What I'd do | Why |
|---|---|---|
| Hero opens "in almost complete darkness", with a 7-beat scroll timeline before the laptop appears | The headline and CTA are readable at frame zero. A 2.5 s time-based intro plays on load. Scroll only drifts the camera a few degrees | PRD goal 1 is to understand the product in 10 s, and §9.2 says "a few degrees, no free orbit". A dark opening also works against the poster being the LCP image |
| Labels like "INTRODUCING HUSHCAST", "CASTING", "ABOUT 0.2 SECONDS" | Sentence case everywhere | PRD §5: no ALL CAPS |
| Hero copy "In any browser" | "In a browser on the same WiFi" | PRD §6 forbids this until Q4 is answered. The guide flags this in Part 8 but still uses it in the hero copy |
| "It doesn't go through our servers." | "There is no server in the middle." | "Our servers" suggests servers exist. Appendix A's "there is no us in the middle" is the true idea |
| A phone in the hero as an "alternative endpoint" | Leave the phone out of the hero. Use it in Live mode as the second person who sees "This cast is full" | A third device in the hero makes people ask "can three people watch?" In Live, the phone turns the one-viewer rule into something you can see |
| Modes are watch-only 3D animations | A drawing playground: draw, and watch the delay | It makes "every animation must explain something" a step stronger, because the interaction itself does the explaining |
| Privacy toggle only | Toggle, plus a reaction to a real `offline` event | It proves "works without internet" on the visitor's own device |
| Footer not covered | "No trackers on this site" plus the live request counter | PRD §1: the site must behave like the product |
| Hero carries 7 animated beats | One beat: red pulse, green, line to laptop, stroke lands 0.2 s later | PRD §8: one animated moment per section |

One more thing: the ChatGPT file contains stray text, `hxmzaehsan.com`. It looks like a watermark from a reference image. Make sure nothing from that source reaches production.

---

## 4. Section by section

| # | Section | Headline | The one moment | What it explains | 3D | Mobile |
|---|---|---|---|---|---|---|
| 0 | Hero | **Cast without the cloud.** | Badge dot pulses red, turns green ("Casting · 1 viewer"), the line crosses to the laptop, and the stroke appears on the laptop 0.2 s after the tablet | What it is, one viewer, almost no delay | Scene A | Stage sits under the copy. CTA moves to a bottom bar |
| 1 | How it works | **Start. Open. Watch.** | The line cascades through three staggered frames | Three steps, with nothing to install on the viewer | None. Real screenshots | Single column. The line becomes a timeline |
| 2 | Modes | **Draw something. Watch it arrive.** | The visitor draws, and the stroke arrives after a delay that depends on the mode | Live = 1 viewer, about 0.2 s. Listen = sound only, 2 to 10 listeners. Cinema = up to 4K, about 10 s | Scene C | Tablet above, viewer below |
| 3 | Privacy | **The line never leaves the house.** | Unplug the internet. The cloud link fades, and the stream dot keeps running from tablet to router to laptop | Local only, and works offline | Scene B | Same scene, smaller labels |
| — | Plain truths | (inside privacy) | None | No password, not encrypted, how you can always see a cast | None | Cards stack |
| 4 | Pricing | **Try everything. Pay once.** | None, on purpose | 5 casts unlocked, the free tier, three prices | None | Prices stack |
| 5 | Good to know | **A few honest limits.** | None | The §4.4 list | None | — |
| 6 | FAQ | **Straight answers.** | Accordion only | Privacy questions first, then delay, devices and troubleshooting | None | — |
| 7 | Closing | **Your screen. Your WiFi. Your call.** | The line ends inside the icon. Tap it to switch idle to casting, and the nav logo dot changes too | You are in control, and the icon is the status light | Scene D | Same |

Other headlines I'd test with you: "Your Android screen. In a browser. Only on your WiFi." (most literal) and "Show your screen. Keep it private." I chose **Cast without the cloud** because it is four words, it is in your PRD's allowed list, and the thread gives the visual proof right underneath it.

---

## 5. Motion system

| Use | Duration | Easing |
|---|---|---|
| Section reveal (opacity only, no layout shift) | 1000 ms | `cubic-bezier(.22,.61,.36,1)` |
| Mode switch (crossfade + 10 px rise) | 600 ms | same |
| Hero line, tablet to laptop | 900 ms | ease-out cubic |
| Status dot red → green | 500–600 ms | same |
| Camera drift on scroll | follows scroll, 1 s smoothing | same |
| Privacy packet loop | 2.8 s | ease-in-out |
| Listen rings | 2.7 s loop, only while visible | same |

Rules: nothing bounces, nothing loops when off screen, and with reduced motion everything appears in its finished state (the line fully drawn, no packet, no rings).

---

## 6. Typography and layout

The system font stack only. The headline sizes do the work that a display font would normally do.

| Element | Desktop | Mobile | Tracking |
|---|---|---|---|
| Hero | 88 px / 1.0 | 46 px | −0.04 em |
| Section headline | 56 px / 1.05 | 34 px | −0.032 em |
| Lede | 21 px, secondary grey, 34 ch max | 18 px | — |
| Body | 17 px / 1.55 | 16 px | — |
| Eyebrow / caption | 13–14 px, index number in tertiary grey | same | — |

Layout: 1120 px max width, 32 px side padding. The thread lives in a gutter 30 px left of the content column, and on mobile the content column moves right (38 px left padding) to make room for it. Headlines break by hand at the meaning boundary ("Draw something. / Watch it arrive."). Only one filled white button per view.

---

## 7. The thread: technical spec

- It is one inline SVG, about 2 KB of code. No library.
- Anchors are any element with `data-thread`. Center anchors are device screens. "Left" anchors are section headers, which add two gutter points so the line runs beside the text and never through it.
- The path is cubic segments with vertical control handles, so it always flows downward. It is clamped 14 px from the page edge.
- Drawing: the scroll position maps to a path length through a sampled lookup table. The tip sits at about 64% of the viewport. A faint "ghost" line at 5% opacity shows where it will go next.
- Layering: the line sits under the content. Devices are opaque, so the line looks like it enters and leaves them.
- Rebuilt on resize and on content height changes (FAQ open, notes on).
- **With Three.js scenes:** each GLB exports empty objects named `ANCHOR_*` (for example `ANCHOR_TabletOut` and `ANCHOR_LaptopIn` in Scene A). The integration module projects them to screen space and feeds them to the thread, so the 2D line and the 3D devices stay locked together while the camera drifts. This is the one new requirement for the Blender agent.

---

## 8. What changes in the Blender brief

- **Scene A:** remove the phone. Make the laptop about 35% of the stage width, placed further back. Keep a clear gap between tablet and laptop in every camera framing, desktop and mobile, because the line crosses it. Export `ANCHOR_TabletOut` and `ANCHOR_LaptopIn`. The poster is the final frame (green dot, stroke on both screens).
- **Scene B:** set the devices on a diagonal (tablet high-left, router centre, laptop low-right) so the line reads as one downward flow. The connection line is not in the GLB: it is the page thread passing through `ANCHOR_Tablet`, `ANCHOR_Router` and `ANCHOR_Laptop`. The internet link and cloud are meshes with an `InternetDisconnect` clip.
- **Scene C:** the drawing is a 2D canvas used as a `CanvasTexture` on the tablet and viewer screen meshes. Clips: `LiveMode` (laptop + phone showing "full"), `ListenMode` (screens out, rings + 10 headphone meshes, 2 lit), `CinemaMode` (TV in).
- **Scene D:** the supplied H-Stroke vector, extruded slightly, with the dot as its own mesh so the material can swap. Clips: `IdleToLive`, `LiveToIdle`. Export `ANCHOR_IconIn`.

Budgets are unchanged. Dropping the phone frees triangles in Scene A.

---

## 9. Build order

1. **This prototype becomes the real page shell.** It already has the copy, layout, thread, playground, toggle, FAQ, fallbacks and reduced-motion handling. It is roughly 70% of the non-3D site.
2. Real screenshots and the real H-Stroke SVG go in (Q7).
3. Scene A in Blender → GLB with anchors → connect it to the thread → approval gate in the browser.
4. Scene D (small, and it reuses the materials).
5. Scenes C and B.
6. Budget, Lighthouse, accessibility and device QA (PRD §12).

---

## 10. Decisions I need from you

1. **Headline:** "Cast without the cloud." or one of the other two?
2. **Phone out of the hero:** OK?
3. **Playground:** OK to show the delays as an illustration, with "Illustration. Real delay depends on your WiFi."?
4. **Offline reaction:** OK to have the privacy scene react when the visitor actually goes offline?
5. **Request counter in the footer:** keep it? It is a strong claim, so CI must enforce zero third-party requests forever.
6. **Assets:** the real H-Stroke SVG (`ic_launcher_foreground.xml`) and the Moto Pad screenshots.

### Placeholders in the prototype
The logo mark (a dot plus a wordmark), the dashed "H-Stroke SVG here" box, the app UI in the step frames, the Android permission dialog wording, the QR code and the sample IP address are stand-ins. Replace each with the real asset before anything is shown outside the team.
