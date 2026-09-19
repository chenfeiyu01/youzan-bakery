# Design QA — revision 2

Local implementation result: passed for tested desktop/mobile prototype scope.
Lune visual-clone comparison: blocked, not claimed. Its live browser tabs/navigation timed out; public HTML, CSS and JavaScript were available and reviewed. This revision responds to the user's explicit changes to the existing prototype, using their own footage and original copy, rather than claiming an exact clone.

## User requirements

1. Opening continuity: `opening.png` extracted from the served shot-1.mp4, decoded with PyAV. Pixel comparison is identical. The old high-resolution hero-to-video dissolve was removed. CSS transition duration on the video is 0s; both layers share one transform and object-fit. Browser confirmed initial video currentTime=0.
2. No progress/chapter UI: removed from rendered DOM, along with old chapter cards. Copy and hierarchy rewritten around brand commitment and craft.
3. Visible motion design: viewport-pinned video, horizontal brand typography, moving masked text, independently moving editorial images, horizontal collection, scroll-linked rotating icon, hover scale and arrow motion, dialog reveal.

## Browser evidence

1440×900: opening, film text, white manifesto, editorial parallax, horizontal collection, product dialog. 390×844: opening and manifesto; no horizontal document overflow. Screenshots are `qa/v2-*.png`.

Checked brand links, gallery horizontal movement by PageDown, product details, Escape dismissal, return to opening, and film entry. No page warning/error console entries. Browser observes video at time zero before scroll with poster `/assets/opening.png`.

## Corrections during review

- Removed difference blend from oversized hero typography after it produced a blue patch on the pastry.
- Reduced desktop brand lettering to avoid obstructing the product crest.
- Prevented dialog focus restoration from scrolling away from its destination.
- Guarded short mobile gallery progress division.

## Limits

Live Lune visual fidelity cannot be certified from this run. Reduced-motion path inspected in code; actual iPhone decoding and frame pacing not measured. Source footage retains generated morphing and 720p resolution. No public deployment.

# Revision 3 — approved photography

Result: passed for the tested local desktop/mobile asset-integration scope.

Six approved photographs replace the editorial video captures: crumb, rolling-pin craft, butter, chocolate pastry, atelier, and high-resolution signature croissant. Optimized WebP assets total approximately 1 MB. New butter and atelier sections extend the visual narrative; the collection has two distinct product dialogs and a working atelier navigation button.

Opening continuity is deliberately preserved: the supplied high-resolution croissant differs in silhouette and crest from the served video first frame, so it is used in the collection and product dialog. The opening still uses the video's exact first frame; no static-to-video dissolve was introduced.

Browser checks at 1440×900 and 390×844 covered photography loading, editorial composition, horizontal desktop collection, stacked mobile collection, distinct product content, dialog dismissal, atelier navigation and responsive cropping. No horizontal mobile overflow or console warnings/errors were observed. The dialog close button was given a dark background to remain visible against the light product photograph. Production build passed.

Evidence: `qa/v3-craft.png`, `qa/v3-butter.png`, `qa/v3-chocolate.png`, `qa/v3-atelier.png`, `qa/v3-mobile-atelier.png`, and `qa/v3-source-comparison.jpg`. The source comparison confirms the atelier composition is retained under viewport cropping. Earlier limits concerning original video resolution, physical-device playback and exact Lune fidelity still apply.
