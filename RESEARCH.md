# WIN (win.wine) redesign: research notes (2026-10-17)

## What WIN is
- WIN = "Wein- und Getränke-Informations-Netzwerk", the B2B product master-data network for the wine & beverage trade. Owned by **EuvinoPRO** (Euvino GmbH, Berlin). It's the company's original product; euvinopro.eu calls it "the data standard for the beverage industry".
- Retailer / wholesaler (Händler, GFGH) creates an article in their ERP → product request goes to WIN → WIN routes it to the right producer (or their agency/importer) → producer gets an email, fills in data (online or from their ERP) → WIN validates on input → complete record flows back into the retailer's ERP. Machine-to-machine, no Excel/PDF.
- Agency model: producer can set a one-time rule to forward all requests to an exclusive agency/importer, which refines the data for its market.
- 200+ wine attributes: description, aromas, media, LMIV (EU food labelling), logistics, packaging data for LUCID reporting. Retailer decides which fields are required vs optional.
- Trust: German servers + German data protection; not an open pool. Producer releases data per retailer, and only retailers who sent a request get it. Audit trail records who edited what and when.
- Free for producers. Extensions via EuvinoPRO modules: GDSN pool connection, catalogs/exposés, shops, multichannel, PPWR compliance (EU packaging regulation, applies from 12 Aug 2026).
- Customer logos: Hawesko, Karstadt, Schlumberger, Pellegrini, AMKA, Winedock, Schmidt, Dollerer, Ersan.
- Contact: +49 30 983 959 16 · info@euvinopro.eu · login: backend.euvinopro.eu

## Current site: problems
- WordPress 5.3.4 (2020). Slugs are leftover template names (`/beispiel-seite/` = "sample page") plus a typo (`/wie-funkionniert-win/`). Hero image is loaded from `neu.win.wine`.
- Press section last updated 2019.
- No primary CTA (demo/contact). The only button is "Einloggen".
- No split by audience (retailer / producer / agency), even though the value is different for each.
- "How it works" is a static image diagram, the best candidate for an interactive version.
- Feature cards are dead ends that link to thin sub-pages. No numbers or proof.
- Visually it doesn't match the parent brand: euvinopro.eu has been modernized (navy/violet/orange, Roboto) and win.wine hasn't.
- EN version exists at `?lang=en`, so copy for both languages is available.

## Brand tokens observed
| Token | Value | Source |
|---|---|---|
| WIN orange | #E57F09 | win.wine accent (CTAs, dots, cards) |
| WIN orange tint | #FAE5CE | win.wine |
| WIN teal | #048BA8 | win.wine hero band |
| Ink | #212529 / #333 | win.wine text |
| EuvinoPRO navy | #1A223E | euvinopro.eu primary text/dark |
| EuvinoPRO violet | #5844FF | euvinopro.eu buttons |
| EuvinoPRO orange | #FF6B35 | euvinopro.eu CTA |
| Fonts | Roboto Condensed (WIN), Roboto (EuvinoPRO) | |

## Pages
- `/` Home: hero, Einfach / Richtig / Schnell, process consulting, logos
- `/beispiel-seite/{einfach,richtig,schnell}/`: pillar detail
- `/wie-funkionniert-win/`: two flows (direct; via trade agency)
- `/category/presse/`: 5 articles (2017–2019)
- Impressum, Datenschutz
