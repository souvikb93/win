# WIN redesign prototype

A concept redesign of [win.wine](https://www.win.wine/), EuvinoPRO's product-data network for the wine and beverage trade, styled in EuvinoPRO's brand language.

**This is an unofficial design concept, not the official website.**

## Pages
- `index.html`: Home. Hero with a coded product mock-up, customer logo carousel, before/after, Easy/Right/Fast, interactive How-it-works diagram (direct flow and via a trade agency), solutions by role, security, EuvinoPRO modules, press teaser, call to action.
- `press.html`: The whole page is one horizontal-scroll timeline (vanilla GSAP port of hyperiux/timeline from 21st.dev). Every article and partner lives on it, articles are clickable, a Framer-style cursor changes over links, logos and the rail, and `press.html#hawesko`-style deep links jump to a milestone. Vertical fallback on mobile and with reduced motion.
- `contact.html`: Demo/contact form (front-end only, sends nothing), next steps, FAQ.

## Stack
Plain HTML, CSS and JS with no build step. `js/layout.js` injects the shared nav and footer. The EN | DE toggle is in place, but German copy hasn't been written yet.

## Run locally
```bash
python3 -m http.server 4410
```

## Deploy
Static on Vercel (`vercel.json` turns on clean URLs). Import the repo in Vercel with no framework preset and no build command.

Research notes: [RESEARCH.md](RESEARCH.md)
