# Handoff (2026-10-17)

## Goal
Modern SaaS-style redesign of win.wine in EuvinoPRO's brand, built for Souvik's interview with EuvinoPRO. Deploy on Vercel from github.com/souvikb93/win, with How-it-works diagrams.

## State
3 pages built and checked in the browser at 1440px and 375px: Home, Press, Contact. English only; the DE toggle shows a "coming soon" toast. Committed locally. Not pushed and not deployed.

## Files
- `index.html`, `press.html`, `contact.html`
- `css/styles.css`: tokens and every component
- `js/layout.js`: shared nav, footer and language toggle (the WIN logo SVG is inlined)
- `js/home.js`: hero event cards, carousel loop, How-it-works step engine, role tabs
- `assets/logos/*`: customer logos from win.wine
- `assets/brand/*`: WIN and EuvinoPRO logos, favicon

## Changed / decisions
- Palette: EuvinoPRO navy #1A223E and violet #5844FF, plus WIN orange #E57F09 as the accent (the orange full stop after headlines), and teal #048BA8 for "validated".
- Type: Roboto Flex (variable Roboto). Headlines use a condensed width as a nod to WIN's Roboto Condensed; data uses Roboto Mono.
- The product mock-up is coded HTML rebuilt from the real "Mein Netzwerk" screen.
- A concept disclaimer appears in the top strip and the footer.

## Failed / gotchas
- `.form-card form { display: grid }` overrode the `hidden` attribute. Fixed with a `[hidden]` rule.
- The preview server config lives in ~/.claude/launch.json (`win-site`, port 4410). A launch.json inside the project folder isn't picked up.

## Next
1. Push to GitHub and deploy on Vercel.
2. Explainer/case-study artifact with diagrams (architecture, request lifecycle, data ownership, before/after audit).
3. German copy (the existing German site text is a good base).
