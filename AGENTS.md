# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Durable design preferences

Keep monumental YOUZAN lettering and visible difference blending over the croissant. Keep supporting text separate. Use the approved HD boundary frames without a dissolve. Prefer continuous, reversible scroll choreography and product-image continuity over repeated slide-like entrances. Preserve the flowing ribbon motif, with no center dot or accidentally clipped contours.

Use a full-screen branded arrival sequence while preloading the film. Keep runtime media status separate from editorial text. Offer a slow-network bypass and bounded wait; respect reduced motion without downloading video.
Prioritize public loading speed: gate entry on both fully decoded HD boundary posters and the first film only, keep other film transfers sequential, and retain content-addressed URLs for safely cacheable media. Avoid increasing video size solely to add dense keyframes.

Eagerly preload and decode both HD boundary frames. Never reveal an incompletely decoded poster; keep the video visible as fallback.

## Local refinement branch

Continue on `feat/local-refinements`; keep `main` as the approved baseline. Do not publish or push these refinements until the user explicitly requests it. The collection page uses warm paper, Song/serif typography and direct product interaction rather than repeating the homepage scroll-video choreography. Keep loading light and reuse approved product photography.

Homepage motion update: each deliberate wheel, swipe or navigation-key gesture advances a complete film segment to the next segment's first frame. Reject inertial tail gestures; allow reverse, skip, native scrollbar takeover and reduced-motion fallback. Damping applies to editorial desktop wheel scrolling only; touch outside the cinema stays native. Scroll-drawn curves support whitespace. Footer must not repeat the product grid or use an oversized wordmark; use a restrained typographic sign-off and a drawn curve.
