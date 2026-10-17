# Handoff (2026-10-17)

## Goal
Modern SaaS-style redesign of win.wine in EuvinoPRO's brand language, built for Souvik's interview with EuvinoPRO. Live on Vercel from github.com/souvikb93/win.

## State
- Live at https://win-redesign.vercel.app. Each push to `main` deploys automatically (Vercel project `win-redesign`, linked to the GitHub repo).
- Pages: Home, Press (horizontal timeline), Contact, Press 2 (3D scroll gallery). The two Press versions stay side by side until one is picked.
- English only. The EN | DE toggle shows a "coming soon" toast.

## Files
- `index.html`, `press.html`, `press2.html`, `contact.html`
- `css/styles.css`: tokens and every component
- `js/layout.js`: shared nav, footer, language toggle and logo sizing
- `js/home.js`: hero, product tilt, side section nav, How-it-works engine, card motion
- `js/timeline.js` (Press), `js/gallery.js` (Press 2), `js/cursor.js` (contextual cursor label)
- `assets/logos/*`: cleaned customer logos (originals in `assets/logos/original/`)
- `assets/press/*`: article images from win.wine

## Changed / decisions
- Palette: EuvinoPRO navy #1A223E and violet #5844FF, WIN orange #E57F09 as the accent, teal #048BA8 for "validated".
- Type: Roboto Flex with condensed headlines; data in Roboto Mono.
- 21st.dev components were ported to vanilla JS: hyperiux/timeline, container-scroll-animation and youcefbnm/animated-gallery.
- Home card motion tells the product story: messy files shuffle, benefits tick in, field toggles snap into place, validation fixes a missing bottle size, data streams from WIN out to its modules.
- The Contact page uses +49 30 2000 3438 0 (from Souvik's brief). The Home CTA still shows +49 30 983 959 16 from the old imprint.

## Failed / gotchas
- A hidden preview pane runs no animation frames or scroll observers, so test motion with the pane visible or with stubbed observers.
- SplitText locks line breaks at split time. Reload the page after CSS width changes.
- The preview server needs `--bind 127.0.0.1` because of a hostname decode crash, and the port is pinned with `autoPort: false`.

## Next
1. Pick Press or Press 2 and delete the other.
2. Decide on one phone number for the whole site.
3. German copy.
4. Explainer artifact with diagrams for the interview.
