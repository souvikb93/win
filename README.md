# WIN redesign prototype

A concept redesign of [win.wine](https://www.win.wine/), EuvinoPRO's product-data network for the wine and beverage trade, styled in EuvinoPRO's brand language.

**This is an unofficial design concept, not the official website.**

## Pages
- `index.html`: Home. Hero with a coded product mock-up, customer logo carousel, before/after, Easy/Right/Fast, interactive How-it-works diagram (direct flow and via a trade agency), solutions by role, security, EuvinoPRO modules, press teaser, call to action.
- `press.html`: The Press page. A 3D scroll gallery (vanilla port of youcefbnm/animated-gallery from 21st.dev) of 12 tiles: 8 article images from win.wine plus 4 text clippings; every tile opens the original coverage. (`/press2` redirects here.)
- `contact.html`: Two-column contact page that fits the first viewport at 1440×900 and 1366×768: intro and contact cards on the left, a compact form with inline validation and a prototype-only success state on the right (sends nothing). FAQ sits below the fold. No login links on this page.

## Stack
Plain HTML, CSS and JS with no build step. `js/layout.js` injects the shared nav and footer. The EN | DE toggle is in place, but German copy hasn't been written yet.

## Run locally
```bash
python3 -m http.server 4410
```

## Deploy
Static on Vercel (`vercel.json` turns on clean URLs). Import the repo in Vercel with no framework preset and no build command.

Research notes: [RESEARCH.md](RESEARCH.md)
