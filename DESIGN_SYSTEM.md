# WIN redesign: Design System & Working Rules

The single source of truth for how this site looks, moves and gets built. Read it before changing any UI. If a rule here and a request conflict, follow the request, then update this file.

This is a concept redesign of win.wine for EuvinoPRO. The tone is **enterprise SaaS, calm and premium, trade-focused**: confident, quiet, generous spacing, nothing decorative that doesn't explain the product.

---

## 1. Principles

1. **One accent.** Violet is the only brand accent. No second accent colour, no multi-colour gradients.
2. **Show the product, don't decorate.** Motion and visuals must explain how WIN works (a request, a check, a delivery). If it only looks pretty, cut it.
3. **Consistency beats novelty.** Every card, button, pill, link and row follows one pattern. Never invent a new variant when an existing one fits.
4. **Room to breathe.** Cramped layouts are the most common failure. Prefer fewer things with more space.
5. **Realistic and specific.** Real UI details (URLs, field names, timestamps, counts), not abstract boxes and arrows.
6. **Calm motion.** Timed, eased, purposeful. Nothing bounces for its own sake.

---

## 2. Colour

All colours are CSS variables in `css/styles.css` `:root`. Never hard-code hex values in new CSS unless adding a token.

### Brand
| Token | Value | Role |
|---|---|---|
| `--navy` | `#1a223e` | Primary text, dark cards, nav lockup |
| `--navy-900` | `#0f1428` | Deepest dark: footer, Security band |
| `--violet` | `#5844ff` | **The accent.** Primary buttons, active states, links, focus, progress |
| `--violet-600` | `#4733f0` | Primary button hover |
| `--violet-100` | `#ecebff` | Light accent tint: pills, icon tiles, active rows, announcement bar |
| `--accent-soft` | `#f4f2ff` | Faintest tint for highlighted rows |
| `--accent-light` | `#a99dff` | Accent on dark backgrounds (never on white) |

### Semantic (use only for their meaning)
| Token | Value | Meaning |
|---|---|---|
| `--teal` / `--teal-100` | `#048ba8` / `#e1f3f7` | Validated, complete, data returned |
| `--red` | `#d9483b` | Errors, missing required data |
| `--orange` | `#e57f09` | **Warnings only** (e.g. "Incomplete"). Never decoration, never a brand accent |

### Neutrals
`--bg #f5f7fb` page · `--surface #fff` cards · `--line #e4eaf3` hairlines · `--line-strong #d3dbe8` · `--ink` = navy · `--ink-2 #4b5563` body · `--ink-3 #8a90a1` meta/placeholder.

### Colour rules
- Page is light (`--bg`). Dark sections (Security, footer) use `--navy-900`. Do not add more dark blocks without a reason.
- Request = violet. Validated data = teal. Warning/incomplete = amber-orange tint. Error = red. Keep these meanings fixed across the whole site.
- **Never** put violet and orange together as a decorative pair. **Never** use a gradient on headlines or buttons.
- Announcement and info bars are **light** (`--violet-100`), not deep.
- Customer logos are shown in **one colour: brand navy** (single-colour versions in `assets/logos/mono/`, rebuilt from the 140×100 originals in `assets/logos/original/`: darkness becomes opacity so white lettering stays knocked out, upscaled 6× once, edge-sharpened and tight-cropped; Schlumberger (vector SVG) and Pellegrini (354×123 PNG) use official files from the companies' own sites, see `assets/logos/official/SOURCES.md`; the others are limited by the 140×100 originals, so swap in official files when they become available). Never mix original colours in the strip. **No frames or tiles around the logos, no hover effect, and the strip never pauses on hover.** Logos are cropped tight and sized by eye (a per-logo `--h`: Hawesko 42, Schlumberger 64, Pellegrini 54, AMKA 33, Winedock 52, Döllerer 64, Ersan 22 px) so they read as the same size, not the same bounding box; re-balance by eye when adding one. Keep the logo strip to customers the owner has approved (Karstadt and Weinladen Schmidt were removed on request).
- Contrast: body text on white must be `--ink-2` or darker; `--ink-3` is for meta only.

---

## 3. Typography

- **Roboto Flex** (variable) for everything; **Roboto Mono** for data, IDs, URLs, timestamps, small labels.
- Headlines use the condensed width: `font-variation-settings: "wdth" 78–85`, weight 700, tight leading (≈1.04–1.1), letter-spacing −0.01em.
- The brand full stop after headlines is a violet `.dot`. One per heading.
- **No eyebrow labels.** No small uppercase/mono label above section headings ("HOW IT WORKS", "SECURITY"…). It reads as generic AI styling. Headings stand alone. Small uppercase mono is reserved for functional data (IDs, timestamps, sources), never as a section lead-in.
- **Top-of-page backgrounds are identical on Home, Press and Contact.** All three use the shared `.hero-bg` (glows and dot field anchored in px from the top, so box height doesn't matter). Never give a page its own intro background.
- **Hero headline is two lines on desktop** ("The Data Network for the / Beverage Industry."); it wraps naturally on phones.
- Scale: h1 `clamp(40px,5.2vw,72px)` · h2 `clamp(34px,4.4vw,56px)` · card h3 `28px` (`21px` for small dark cards) · body `17px` · lead `clamp(17px,1.6vw,21px)` · meta mono `11–12.5px` uppercase with letter-spacing.
- Headlines are one colour (navy). No gradient text.
- **Section headers and page titles use Title Case** ("One Request, Followed End to End."). Short articles, prepositions and conjunctions stay lowercase. Why WIN card titles also use Title Case with the brand full stop (owner copy); step titles and body copy stay sentence case.
- Titles lead; dates and sources are secondary but must stay readable (≈22px dates beside titles).

---

## 4. Layout & spacing

- Container: `max-width 1200px`, gutter `24px` (`16px` under 600px).
- Section padding: `clamp(80px,11vw,140px)` vertical. Heading block max-width ≈ 760px.
- Grid gaps 20–24px between cards. Inner card gap 16–18px.
- **Navigation**
  - Top nav lists **pages only**: Home, Press, Contact. The nav spans the **full width** (padding `clamp(20px,3vw,48px)`), no centred container.
  - Home sections are reached through the **side section nav** (lines only at rest; panel + labels on hover/focus; chip bar below 1180px).
  - Language selector is a simple **"EN ⌄"** dropdown (like FarmDoc), never a pill toggle. German is marked "Soon".
  - The **Log in** link does not appear on the Contact page.
- **Viewport fitting**: only the artifact that needs it (How it works panel, Why WIN stack) is sized to the viewport. Headings and body text stay in normal flow. Test **1440×900** and **1366×768**; nothing may clip or get an internal scrollbar.
- **Mobile**: stack vertically, no horizontal scroll (`scrollWidth === innerWidth`), tap targets ≥ 40px. Hide decoration (floating papers, URLs, subtitles) before shrinking content.

---

## 5. Components

### Buttons
- **Text only.** No icons inside buttons unless explicitly asked.
- Primary: violet fill, white text, 48px high (40px small), 12px radius. **No glow or coloured shadow at rest.** Hover = darker violet. Keyboard focus = white ring + violet ring.
- Secondary: white, hairline inset border. Ghost-light only on dark.
- The nav **Log in** link is brand violet, 600 weight.
- Tertiary / text links: violet, 600 weight. **Underline draws in from the left on hover and focus** (`background-size` 0→100%). Never a permanent underline except in the announcement bar's "Learn more".

### Cards: one card language
Applies to Why WIN, Solutions, Press, Security.
- Surface white, **20px radius**, hairline inset border, one soft shadow (`--card-shadow`), **32px padding** (24px on phones).
- Hover on interactive cards: lift 3px + `--card-shadow-hover`. **No glow, no cursor-follow highlight, no coloured shadow.**
- Dark variant = same shape and padding on navy (Security cards; the dark cards). Don't invent a third look.
- Don't put cards inside cards. Visuals sit **directly on the card**, not in a second boxed panel.
- Titles inside cards use the same size across a section.
- Decorative elements (e.g. the paper files) must never overlap text. Reserve space for them.

### Tick marks
Brand purple on a `--violet-100` disc (any check list). The hero has no trust-point row under its CTAs. Teal ticks only mean "validated" inside product UI.

### Pills / chips
Small rounded (999px) labels: violet-100 = info/request, teal-100 = complete, amber tint = warning, grey = neutral. 11–12px, 600 weight.

### Forms
Visible labels (no placeholder-only), 40–46px inputs, 12px radius, hairline border, violet focus ring. **Inline validation** with `role="alert"` messages, focus moves to the first error. Optional fields are marked "(optional)" and never block submit. If there is no backend, show a clear **prototype-only** success state and say nothing was sent.

### Announcement bar
Full-width, light (`--violet-100`), sits under the nav, close button on the **far right**, **solid (opaque) colour**, visible at the very top of the page and slides away as soon as the visitor starts scrolling (returns at the top), dismissible per session. Short copy on phones.

### Footer
Deep navy (`--navy-900`) with the soft violet glow. Brand lockup identical to the nav: **WIN logo + "by EuvinoPRO"**, same typography.

### Logo
- WIN wordmark with the **wine-bottle "i"**. Navy on light, white on dark. **One colour only**, not a two-colour version.
- Use the inline SVG from `js/layout.js`, don't redraw it.

### Product screens
Mock UIs are realistic: window chrome, URL, real field names, mono IDs. Use **made-up names** (see §7). The hero uses the provided "Mein Netzwerk" screenshot.

---

## 6. Motion

- Easing `cubic-bezier(.2,.7,.2,1)` (`--ease`). Durations: micro 150–250ms, state change 300–450ms, scene change 500–700ms.
- Use motion to show **cause and effect**: a request travels, a screen folds into its sender and opens from its receiver, a field validates, a count climbs.
- **Never** show relationships with connector lines/beams between a diagram and a screen. Show it by interaction: the active party and its screen share the same purple outline; data moving closes one screen and opens the next.
- The travelling dot/packet stays on the link between two nodes. It never crosses over a node.
- Loops pause when off-screen (IntersectionObserver). `prefers-reduced-motion` gets a static end state.
- Don't hide the system cursor. Contextual labels trail beside it.
- No bouncing, no shaking, no decorative parallax. Micro-interactions on hover are allowed if they say something (list items nudge, underline draws).

### Official flows are not negotiable
The How it works animation follows WIN's own diagrams exactly:
- **Direct (6):** create article in ERP → request sent to WIN → notification to the producer → producer answers (ERP or online) → product data sent to WIN → imported into the ERP.
- **With agency (8):** the same first three, then 4 the producer's **one-time setting to forward all requests to the agency**, 5 **WIN notifies the agency directly**, 6 agency answers, 7 data sent to WIN, 8 imported into the ERP. The agency connects to WIN, never to the producer.

---

## 7. Content rules

- **Made-up names** in all example UI: merchant *Nordwein Handel*, producer *Weingut Sonnenhang*, agency *Vinara Import*, wine *Riesling Kalkstein 2025*, other *Markthalle Feinkost*, *Cantina del Lago*. Never favour a real company in examples.
- Real names appear **only** where they are real facts: the customer logo strip, press coverage, milestones, and the provided product screenshot.
- Facts must be sourced (win.wine, euvinopro.eu, linked press). Don't invent features, integrations, numbers or customer claims. Researched facts live in `RESEARCH.md`.
- Voice: plain, specific, short. English first; the toggle is in place, German copy comes later.
- Hero copy and How-it-works body copy were supplied by the owner. Keep them verbatim unless told otherwise.

---

## 8. Build rules

- **Stack:** plain HTML/CSS/JS, no build step. One stylesheet (`css/styles.css`), small scripts per feature (`layout.js`, `home.js`, `why.js`, `solution.js`, `testimonials.js`, `gallery.js`, `cursor.js`).
- **21st.dev components** are ported to vanilla JS (GSAP via CDN where needed). Free tier = 2 downloads/day.
- Shared nav/footer live in `js/layout.js`. Change them once.
- Add a token before adding a hard-coded value. Reuse a pattern before creating one.
- Accessibility: semantic landmarks, labelled controls, visible `:focus-visible`, 4.5:1 text contrast, `aria-hidden` on purely decorative animation, keyboard reachable.
- Deploy: push to `main` → Vercel auto-deploys to https://win-redesign.vercel.app. Commit messages end with the Co-Authored-By line.

---

## 9. Verification checklist (do before saying "done")

1. Open the page in the preview pane (**make it visible**; a hidden pane runs no animation frames or observers).
2. Hard-reload assets (`fetch(file,{cache:'reload'})`) so you aren't judging cached CSS/JS.
3. Check **1440×900**, **1366×768** and **375×812**. No overflow, no clipping, no overlap.
4. Measure, don't eyeball: computed styles, `getBoundingClientRect`, `scrollWidth`.
5. For animation, step through the sequence order (a fast test clock is fine) and confirm states, then say plainly that real-time feel wasn't watched.
6. No console errors.
7. Commit, push, confirm the Vercel deployment is **Ready** and the live page contains the change.

---

## 10. Mistakes already made (don't repeat)

| Mistake | Rule |
|---|---|
| Violet + orange together, gradient headline | One accent. Single-colour headlines. Orange = warnings only |
| Glow behind primary buttons; purple glow on card hover | No resting glow. No cursor-follow highlight |
| Different card styles per section | One card language (§5) |
| Boxed animation inside a card | Visuals sit directly on the card |
| Whole section forced into the viewport | Only the artifact is viewport-sized |
| Cramped diagrams and screens | More space, fewer elements, larger type |
| Lines connecting diagram to screen | Show relation by shared outline and fold/open interaction |
| Dot crossing over nodes | Dot stays on the link between nodes |
| Steps that didn't match WIN's diagrams | Follow the official 6/8-step flows exactly |
| Keeping an old page variant after a new one is chosen | Delete the loser and its dead CSS/JS (Press timeline was removed) |
| Press intro with its own grey/orange glow, so the background changed between pages | One shared `.hero-bg` on every page (§3) |
| Eyebrow labels above every section heading | None. Headings stand alone (§3) |
| Teal ticks under the hero CTAs | Brand purple ticks |
| Hero headline on three lines | Two lines on desktop |
| Sentence-case section headers | Title Case for section headers and page titles (§3) |
| Real companies in example UI | Made-up names; real names only as real facts |
| Custom cursor hiding the pointer | Never hide the system cursor |
| Decorative files overlapping text | Reserve space; hide on phones |
| Dark announcement pill above the headline | Light full-width bar under the nav, close on the right |
| Section links crowding the top nav | Pages in the top nav; sections in the side nav |
| EN/DE pill toggle | Simple "EN ⌄" dropdown |
| Logos in framed tiles, pausing on hover, or sized by equal box height | Frameless, always moving, balanced by eye (§2) |
| Customer logos in mixed colours / grey-scaled | One brand-navy colour for the whole strip (§2) |
| Judging cached CSS or a hidden preview | Hard reload, visible pane (§9) |
| Date much smaller than title | Titles lead, dates stay clearly readable (≈22px) |
| Combining unrelated items into one entry (2017 "Part 1/2/3") | Merge into one clear milestone or keep fully separate |

**Home section backgrounds:** the customer strip and Why WIN share one white band (`--surface`, no divider). The Problem section no longer exists; do not re-add it.

**Why WIN cards:** the card word (Easy / Precise / Fast) is a display word `clamp(44px,4.8vw,68px)` violet; the sentence under it is the standard card h3 (28px). Never size a card h3 off-scale. Why WIN header keeps 20px gap to the lead and 44px below it before the first card.

**Product-UI mockups (Why WIN and any new card):**
- **No company or product names.** Use roles: trader, producer, supplier, agency. Generic for every visitor. (How it works and Solutions still carry made-up names: replace on request.)
- **Animations never resize their card.** Reserve space for the largest state (hidden messages use `visibility`, not `display`).
- **Progress bars are grey, brand violet only when complete.** No amber/teal states.
- **Case:** headings Title Case; UI labels, messages, buttons and pills sentence case ("Bottle size", "Send to trader", "Ready to use"); acronyms (GTIN, ERP) upper.

**Home ending:** Testimonials carousel (after 21st.dev "Carousel Testimonials"; role-based, no real names or photos; quotes are placeholders until real ones are supplied) then a navy "Ready To See WIN In Action." CTA panel with the primary "Book a demo" button to `contact.html?topic=demo`. Press lives on its own page only.

**Solution page (`solution.html`):** How it works as a scroll timeline (after 21st.dev manuarora700/timeline). Direct flow only: merchant, WIN, producer, 6 steps. Sticky step number left, line fills violet with scroll, each step's screen loops on its own while visible (`js/solution.js`). Role names only, no companies. Top nav: Home, Solution, Press, Contact.

Home no longer carries How it works: under the Why WIN cards (same section) a 23px line "See how WIN works, step by step." and a secondary "View process" button link to `solution.html`.

The "One Network, Three Roles" tabs section moved from Home to the Solution page, below the timeline and above the closing CTA. Its tab script lives in `js/solution.js`.

Data & Privacy page was removed (owner request). The security cards no longer exist on the site. Top nav: Home, Solution, Press, Contact.

**CTA panel background:** after 21st.dev "Nice BG", recoloured to the brand: navy-900 base, a violet glow bottom-right, a faint woven hatch, film grain and a soft vignette. Pure CSS on `.cta-panel::before/::after`. Applies to every `.cta-panel`. Text sits above it (z-index 1).

**Platform diagram (scroll-triggered):** no button, no hint. WIN sits in the centre; six modules sit evenly on a circle (regular hexagon, mirrored left/right: top, upper right, lower right, bottom, lower left, upper left) inside two concentric dotted circles with spokes. When the diagram is about half in view the modules spiral out of WIN (160° sweep while the radius grows, slight overshoot, 70ms stagger); when it is mostly out of view they spiral back in. Rings and the WIN ring turn as they open. Geometry is built in `js/home.js` from the real size, so the circles are true circles at any width. On phones the modules drop down as a list when in view.

**Footer:** no Log in link. No bottom bar (copyright / "Concept redesign" line removed); roomier footer padding. The CTA card is taller with equal gaps above and below; card + footer fit one screen at 1440x900.

**Side edge:** nav, announcement bar and footer share one left/right edge, `--edge: clamp(20px, 3vw, 48px)` (43px at 1440, 20px on phones). The announcement content is left-aligned from that edge, its close icon sits on the right edge, and the footer is full width inside the same edge.

**Hero floating cards:** show product advantages, not events. Title first, short line under it: Automatic ERP Updates / Direct Data Transfer; Built-In Data Validation / Fewer Missing Fields; Cross-Platform Integration. They are scroll-driven and calm: a short 44px eased slide (right-hand cards from the right, the left-hand card from the left), each as it rises into view (`--p` in `js/home.js`), and once in they stay. Right cards are right-aligned and the left card left-aligned on the shared side edge (`--edge`). Icons loop gently: the ERP card uses the useanimations.com "infinity" loop icon (rebuilt as an SVG dash animation from its Lottie data, 4 s), the validation check draws in and out, and the Cross-Platform card uses the useanimations.com "layers" icon, whose hover motion (layers lift apart and settle) plays as a loop on the same 4 s clock.

**Gotcha:** never cut `css/styles.css` at a comment marker and append: later blocks below it get deleted silently (this dropped the footer/edge/CTA spacing once). Edit blocks in place.

**Hero cards v3:** every card has a header and a sub-header (third: Cross-Platform Integration / Connects With Your Systems). Slim (about 62px high), lifted off the screen with a layered shadow. Slide in 96px from their own side while scrolling (right cards from the right, left card from the left), starting only after the user scrolls. All three icon loops share one 4 s clock, act in the first ~74 % and hold, like the infinity icon.

**Hero card timing:** arrival is tied to how far the device has come into view, not to each card's own position. The three cards stagger in (right, left, right) and are all fully in by the moment the whole device is in the viewport. The first card sits level with the search bar on the right, below the fold at load.

**Customer logo hover:** hovering a logo paints a splash of brand violet that follows the pointer, painted only inside the logo's own shape (an overlay `.logo-splash` masked by the logo image, radial gradient at the pointer, radius grows to 170px over .55 s and shrinks on leave). The marquee never pauses. Hidden on touch devices. Logic at the end of the logo carousel block in `js/home.js`.

**Hero card icons:** solid brand-violet tile with white line icons (all three, including the looping infinity icon). No teal or tinted tiles.

**Logo middle line:** logos are aligned by their ink, not their image box. Each tile can carry `--dy` (e.g. Hawesko +3.6px, Schlumberger -2.9px, Pellegrini -4.7px) so the average of each logo's bounding-box centre and visual-mass centre lands on the same line (within about 0.3px). Measure with a canvas alpha scan when adding a logo.

**Platform diagram refinement (labels, spacing, size):** exact card text, Title Case, short supporting line: PPWR Compliance / EU Packaging Rules (NEW badge), GDSN Connector / Publish & Receive, Catalogues / Trade & Product, Online Shops / B2B & B2C, Multichannel / E-commerce Channels, Process Consulting / Master Data Workflows. Card size and type unchanged. The circle radius is computed from the real card size and the box, so cards keep at least ~40px between each other and ~45px from the WIN circle; the section borrows extra width on wide screens (copy column 456px, diagram up to 720px) and stacks under 1261px. WIN circle is 94px closed / 115px open (was 108 / 132), logo 23 / 28px, rings scaled to match. Below 701px the modules become a list. **No rotation with scroll:** the diagram does not turn while scrolling (tried and removed on request); it only opens and closes.

**Platform card icons:** the six outer cards use useanimations.com Lottie icons (check-circle, globe, book-open, shopping-cart, git-branch, settings), played through `assets/vendor/lottie_light.min.js` (lottie-web 5.12.2, self-hosted) from `assets/icons/*.json`, drawn in brand violet. Each plays once per 4 s cycle (stretched to ~3 s, then rests), aligned to the hero infinity icon's clock, only while the diagram is open.

**Testimonials:** the quote is italic under a large brand-violet quote mark. Below it: round portrait (placeholder stock portraits from randomuser.me, saved in `assets/testimonials/`), name, role in Title Case (Category Manager, Managing Director, Product Data Lead) and company in violet (made-up: Nordwein Handel, Weingut Sonnenhang, Vinara Import). Names, quotes and photos are placeholders: replace with real ones, with permission, before this is shown as fact.

Testimonial controls are the three dots only (no arrows); the carousel also auto-advances while on screen.

**No side section navigation:** the dotted side nav on the Home page was removed (owner request). Home sections are reached by scrolling only.
**Platform copy (left column):** heading "One Connected Ecosystem. Built for the Beverage Industry." (44px max, three lines) and "From product data and regulatory compliance to catalogues and commerce, EuvinoPRO brings connected solutions together around WIN to help your business work smarter." The diagram is unchanged.
**Section rhythm:** Testimonials has the same 140px bottom padding as other sections, so the gap before the closing card matches the others.

**Testimonials copy:** heading "Trusted Across the Beverage Industry." with sub-heading "12,000+ producers and 300+ retailers and distributors supported by EuvinoPRO" First quote: "Product requests are clearer, data is easier to manage, and we spend less time chasing information." (Lena Hartmann, Nordwein Handel; the other two quotes are unchanged placeholders.)

**Testimonial attribution:** name in bold, then one line "Role, Company" in Title Case, same font and colour (no violet company name).

The testimonials sub-heading stays on one line above 900px wide (wraps on smaller screens).

**Precise card (final):** heading "Catch Missing Data Before It Moves On." and body "WIN checks product information as suppliers enter it, flagging missing or invalid fields before the data reaches your ERP." The preview is static: heading "Product Record Requested by a Trader" on one line; GTIN 4006381333931 (Valid), Bottle Size 0.75 L (Valid), Country of Origin (Empty, Required); "2 of 3 Required Fields Complete" 67% (grey bar); "Send to Trader" disabled until all fields are complete. No typing animation.

**Gotcha:** a desktop-only rule appended late (e.g. the Why WIN card two-column grid) overrides earlier mobile rules. Always re-add the mobile override after it and check 375px.

**Easy card (final):** heading "Choose What Suppliers Must Provide." and body "Set required and optional product fields to ensure suppliers provide the information your business needs." Preview heading "Product Data Requirements" on one line, no supporting text, no count pill (the "2 / 3 / 4 required" pill was removed). Field names and toggle animation unchanged.

**Why WIN card headings are one line** on desktop and tablet (≥601px), all three cards, same rule: no max-width, `white-space: nowrap`, size scales `clamp(22px, 2.05vw, 28px)` on desktop so the longest heading always fits (left column is 1.1fr of the card). Only on phones may they wrap. Keep new card headings short enough to fit at 22px in ~480px.

**Fast card (final):** body "WIN routes requests to the right supplier and sends completed product data directly to your connected ERP. No manual re-entry." Preview is static and finished: heading "Product Request from Trader to Producer", badge "Ready to Use"; five steps all Done (Trader ERP · Product Request Created; WIN · Request Forwarded to Supplier; Producer · Product Data Submitted; WIN · Data Checked for Completeness; Trader ERP · Product Data Received), the last row highlighted. Role labels and events in Title Case.

**Precise and Fast cards animate again** (they were static for a while). Precise loop: GTIN typed then Valid, Bottle Size typed then Valid, Country of Origin stays Empty and becomes Required, progress 0, 33, 67% (grey), "Send to Trader" always disabled; it always ends on the specified preview. Fast loop: five steps go In Progress then Done one by one, the last row gets the highlight and the badge flips from In Progress to Ready to Use; ends on the specified preview. Reduced motion shows the final states.

**Final-check rules (Home + Solution):** section headings 44px max (hero 76px); section lead 18px (hero lead 21px); card body 17px; card headings 28px, one line on desktop; all headings Title Case; no company names in mockups (Trader, Producer, Agency). Solution page browser screens are filled so no empty band shows under the content (heights about 376-384px, body min 340px). One Network, Three Roles: tabs rotate by themselves every 7 s (Merchants & Wholesalers, Producers, Agencies & Importers), a bar fills under the active tab, a click pauses rotation for about 11 s, and each role's right-hand visual runs a live loop that rests on its finished state. The solution-page tab strip scrolls the active tab into view on phones.

**Solution page screens v3:** every window header is `Title (bold) + muted context`: Request Product Data via WIN / New article; Product Data Request / For the trader; Product Data Validation / 214 attributes; Product Data Received / status pill. Screen 1: five fields type in one by one, button "Submit Request" is pressed and becomes "Request Sent". Screen 2: the whole window is a dark terminal streaming the request (no header, no stat cards). Screen 3: phone-mail style inbox (search bar, Primary tab, avatars, bold unread, time) with the new request arriving. Screen 4 keeps its fields and the "Send to WIN" button. Screen 6: the received values are read-only input fields in two columns with a progress bar. All CTA buttons are 156x36.

**Solution screens v4:** Step 1 header "Create a New Article" (no "via WIN", no side note). Step 2 terminal keeps the dark full-window design but shows the plain-language timestamped log again (Request 40-11873 from the trader, Producer matched, 41 required fields set by the trader, Request validated, Notification queued, Notification sent to the producer). Step 3 mail: tabs Inbox / Sent / Spam with reply and forward arrows on the right; a red badge on Inbox blinks, then the new mail slides in from the top and the rest move down (window height fixed). Step 4 header "Product Data Request" with no side note. All step headings and window headers are one line (steps shortened: New Product Request Notification, Product Request Is Answered).

**Mail screen (Step 3) v3:** rows are two lines (sender + time, then subject and snippet on one truncated line) so text never overlaps. The unread mail is bold with a small violet dot, no red or blue block highlight; the Inbox count badge is brand violet. Arrival like a real mail app: a banner drops in from the top ("WIN · EuvinoPRO, New product request"), the Inbox badge pops in, the new mail slides in at the top while the others move down and fades from a soft violet tint, then the banner leaves. Six rows fill the frame; window height stays fixed at 376px.

**Mail screen v4:** no count badge next to Inbox and no banner from the top. The alert is a small "New Mail / WIN · EuvinoPRO" drawer that slides in from the right at the bottom, stays about a second, the new mail then slides in at the top of the list, and the drawer slides back out.

**Solution page copy (final):** heading "How WIN Connects Merchants and Producers." Steps (eyebrow / heading): 01 MERCHANT / Article Created in ERP; 02 MERCHANT → WIN / Request Sent to WIN; 03 WIN → PRODUCER / Producer Notification Sent; 04 PRODUCER / Product Data Provided; 05 PRODUCER → WIN / Product Data Submitted; 06 WIN → MERCHANT ERP / Product Data Imported. Eyebrows are uppercase violet labels (desktop side label and phone line). The page says Merchant and Producer everywhere, never "trader". Window headers match: Create a New Article, Provide Product Data, Product Data Validation, Product Data Imported.

**Solution step headings (final, descriptive, no full stop):** Merchant Creates a New Article in ERP; ERP Sends a Product Request to WIN; WIN Notifies the Producer of a New Request; Producer Enters the Requested Product Data; Producer Submits Product Data to WIN; WIN Transfers Product Data to the Merchant’s ERP. Step headings do not carry the purple full stop. One line from 701px up (24px to 28px, scaled); on phones they wrap. Window headers: Create a New Article, Enter Product Data, Product Data Validation, Product Data Imported.

**Terminal (Step 2) is typed:** each log line is typed character by character (about 24 ms per character, colours kept for the highlighted words), a block cursor follows the line being typed and keeps blinking on the last line, then the loop resets.

**Solution step copy v3:** headings Merchant Creates a New Article in ERP; ERP Sends a Product Request to WIN; WIN Notifies the Producer of a New Request; Producer Provides the Product Information; Product Data Is Submitted to WIN; WIN Transfers Product Data to the Merchant’s ERP. Step 4 window header "Provide Product Information". Bodies as supplied by the owner (no repetition of the heading).

**One Network, Three Roles v2:** one card per role (left: heading, intro and three points; right: the live view on a soft background, split by a hairline). All three cards are the same size (1152 x 520 at 1440 wide; stacked and equal on tablet). Tabs are a centred segmented pill control (white track, navy active pill). No progress bar under the tabs; rotation still runs every 7 s.

**Solution page widths:** the intro paragraph is 900px wide on desktop (two lines); each step body text is exactly as wide as its browser window (680px max).

**Roles v3:** the three tabs are three separate pills (white with a hairline, navy when selected), not one segmented bar. The role card has a real 1px border and its right half uses the soft violet tint (`--accent-soft`) so it never blends into the page background; rows inside are white.

**Audience section (final copy):** heading "One Platform for the Entire Beverage Industry." with its intro; pills left-aligned with the heading and the card. Each tab = left panel (heading, intro, optional "Free for Producers" tag on Producers, three benefits with Title Case titles and sentence-case descriptions, CTA at the bottom) and right panel (one heading, one supporting line, a preview, never a CTA): Merchants "Your Requests, at a Glance" (three requests: Waiting, In Progress, Complete); Producers "Your Product Data, Ready to Share" (product record plus a completed request); Agencies "Relevant Requests, Automatically Routed" (Producer to Agency flow, forwarding rule enabled, record marked Prepared). Cards are 1152 x 560 at desktop, all equal. CTAs: Book a Merchant Demo, Register as a Producer, Discuss the Agency Model. The CTA is `align-self: flex-start; width: fit-content`, so the hover underline sits under the link only, never the whole column.

**Roles rotation pauses while the pointer is on the card** (not only on the pills): the three roles stop switching, the preview inside keeps looping, and rotation resumes about 3 s after the pointer leaves.

**Audience heading line break:** "One Platform for the Entire" / "Beverage Industry." (forced break on desktop, keeps "Beverage Industry" together; wraps naturally on phones).

**German version (Deutsch):** the whole site (all four pages, nav, footer, animations, typed text, form messages, alt texts, meta) has a German version. The language menu lists "English" and "Deutsch" in full; the nav button shows EN / DE. Choice is stored in localStorage ("win-lang", or `?lang=de`) and the page reloads in that language.
- English stays the source text in HTML and JS. German lives in `js/lang-de.js` (key = exact English string, whitespace collapsed; `patterns` for strings with numbers). `js/i18n.js` swaps text nodes and the attributes alt, aria-label, placeholder, title, data-type, data-cursor and the meta description, and a MutationObserver translates text that scripts add later. `data-de="..."` on an element overrides one word with several meanings (the mail avatar initials).
- **Every new visible string must be added to `js/lang-de.js`**, including strings built in JS. Strings that are typed character by character must be translated before typing (`WINi18n.t()`).
- Tone: formal "Sie", natural German, not word for word. Merchant = Händler, producer = Produzent, supplier = Lieferant, agency = Agentur. Kept as in German business use: ERP, GTIN, PPWR, GDSN, B2B/B2C, Category Manager, Newsletter, company and person names. German number format (0,75 l, 12.000+). Press titles use the original German article titles.
- Check German layouts after copy changes: headings are longer. Role cards are 600px high in German.

## Fonts and preview alignment (correction)
- Mockup inputs and values (steps 1–6, role previews) use the UI sans font. Mono is only for the terminal and URL chips.
- Role preview panels: head, rows, records, flow all share one left/right edge (`.role-visual.rv2` single `minmax(0,1fr)` column); both panel columns equal width. Rows must not keep a slide-in `translateX` after animating.
- Solution page ends with the footer; no closing CTA panel.

## Contact page
- Info cards: icon + value only (no "Call us / Email us / Visit us" labels), one line each, all 64px tall and equal width.
- Section label "Contact EuvinoPRO" is Title Case, not uppercase.
- Form: one field per row (Full name, Email, Company, Message); no helper line under the heading.
- Contact top section is exactly one viewport tall on desktop (100vh minus nav); form spacing scales with viewport height, extra compact under 760px height. FAQ starts below the fold.
- Contact audit: h1 uses the system scale clamp(40px,5.2vw,72px); info cards and form card use the shared card language (20px radius, `--card-shadow`, hairline); form card padding 32px; inputs 44px/12px radius; labels 14px/600, "(optional)" 14px/400 grey.
- Contact background is one continuous layer: the form section's glow and dots fade out into the FAQ; no border line between them.

## Press page cards
- Eyebrows on press cards (publication · date on the hover caption, kicker on typographic cards) are white on dark/violet and navy on light cards, 12px, never light purple.
- Tile frame is 4:3, nine tiles in three columns (rows read left to right). Cover images 1600 x 1191 px WebP (source 1720 x 1280, scaled), named `news-01..09.webp`. Each tile links to the original article (new tab).
- Press grid: three columns move together (no staggered middle column), so rows line up and every tile gap is the same (14px max, both directions). Page has no elastic overscroll (`overscroll-behavior-y: none`) so no blank band can show under the footer.
- Never delete the base `.cursor { position: fixed … }` rule: without it the press cursor label sits in the page flow and the pointer position makes the page scrollable below the footer.
- Press cards: cover (4:3) on top, then source · date (12px muted caps) and a Title Case headline (17px/600, max two lines) always visible, in a fixed-height caption so every card is the same size. Header intro has a larger gap above the gallery.

## Why WIN: Fast card stability
- The Fast card never changes size while its five steps run: every step row is a fixed 62px (56px on phones), the "In Progress / Done" label has a fixed width, the badge has a fixed minimum width, and the step text clamps to two lines. All three stack cards share one minimum height (460px max). Verified in English and German at 1440, 1100 and 375.

## Hero app screen
- The browser mockup on Home is a real screenshot, one per language: `assets/brand/win-network-screen-en.webp` and `-de.webp` (2000 x 1254). CSS shows the one matching `html[lang]`. Replace both files together when the app UI changes.

## Precise card (animated, replaces the static preview)
Loops while on screen, one pass: GTIN typed and accepted; bottle size typed as 0.85 L, flagged red ("Not a standard bottle size"), erased and retyped as 0.75 L (accepted); "Germany" typed and accepted (no "Required" flag on country); 3 of 3, bar turns violet, Send to Trader becomes active; then it restarts. Card height never changes. German: 0,85 L / 0,75 L, Deutschland, "Keine übliche Flaschengröße".

## Home: end of the Why WIN stack
- Gap from the last (Fast) card to "See how WIN works, step by step." is clamp(56px, 5.5vw, 80px) (about 79px at 1440), 56px on phones; the button reads "View solution" (matches the nav item "Solution"; German "Lösung ansehen").
- The three stack items have the same height (520px on desktop), so all three cards lift away together when the next block arrives (the 26px stagger between them stays constant). Never give the last item a different height; cards 1 and 2 would then leave first.

## Naming: Workflow
- The page at `solution.html` is called **Workflow** everywhere visible: nav item, footer link, page title, Home button "View workflow" (German "Workflow ansehen"). The Home line above it reads "See How WIN Connects Merchants and Producers." (German "So verbindet WIN Händler und Produzenten."). The file name stays `solution.html` so existing links keep working.

## Shiny button (`.btn-shiny`)
A light band sweeps across the border and face every 3 seconds (after 21st.dev "Shiny Button"). Used only on Home: "View workflow" (secondary, violet shine) and the closing "Book a demo" (primary on navy, white shine). Not a glow: nothing coloured sits around the button at rest. Off with reduced motion. Do not spread it to other buttons without asking.

## Trust badge (Home, ecosystem section)
Pill above "Explore EuvinoPRO": three overlapping round portraits (the placeholder testimonial photos) and "Trusted by 300+ businesses" (German "300+ Unternehmen vertrauen uns"). Subtle white-on-navy pill, hairline border, no glow.

- Ecosystem copy (current): heading "One Connected Ecosystem for the Beverage Industry." and body "From product data to compliance and commerce, EuvinoPRO connects solutions around WIN to help beverage businesses work smarter." (supersedes the earlier platform copy).
- Ecosystem copy spacing (proximity hierarchy): heading → body 16px, body → trust badge 32px, trust badge → CTA 20px. Related items sit closer; the proof is a separate beat, and the CTA stays near it.

## Spacing system (authoritative; supersedes older spacing values above)
One scale, one set of tokens (`:root` in `css/styles.css`, block "Spacing system"). Use tokens, not new numbers.

**Scale (px):** 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 56 · 64 · 80 · 112 · 140. Anything between is a bug.

| Token | Value | Where |
|---|---|---|
| `--sp-h1-body` | 24 | page title → lead (Home hero, Workflow, Press, Contact) |
| `--sp-h2-body` | 16 | section heading → lead (all sections, Why WIN header, CTA panel) |
| `--sp-head-content` | 40 → 56 (4vw) | section head → its content |
| `--sp-section` | 80 → 140 (11vw) | vertical padding of a full section |
| `--sp-band` | 72 → 112 (8vw) | vertical padding of a slim band (customer logos), top = bottom |

**Proximity rules (apply everywhere):**
- Items that belong together sit closer than items that do not: heading + body 16, body → proof 32, proof → its CTA 20.
- A control sits closer to what it controls than to the heading above it (Workflow role pills: head → pills 40, pills → card 24).
- Gaps between sibling cards: 14 (gallery) or 20 (role/feature columns); inside a card: padding 32 (small), 48 (feature cards); caption blocks 6.
- Last card → following line (Why WIN): 80 (5.5vw), equal item heights so cards lift together.
- Forms: 44px fields, 16–24 between fields, label → field 6.

**Edges:** content aligns to the 1152 container (144px at 1440). Nav, announcement bar and footer use the wider `--edge` (72px). The ecosystem section is full-bleed on purpose (the diagram needs the width) and aligns to the `--edge` like the nav.

**Deliberate exceptions (do not "fix"):** Home hero (top 138 to clear nav + announcement bar, no bottom), Why WIN section (43 top because the sticky header sits there), closing CTA section (0 top, 72 bottom), page intros on Workflow and Press (81 top/bottom), Contact top section (one viewport tall).

**Audit result (1440 wide, English):** heading → lead was 26/20/18/16 across pages, now 24 for every H1 and 16 for every H2; logos band was 128/112, now 112/112. Verified on Home, Workflow, Press and Contact; Contact still fits one viewport.

## Success color (authoritative)
One emerald green (a cooler green that sits comfortably next to the brand violet) for every success or positive state: valid, complete, done, sent, approved, ready, registered. It replaces the teal that was used for these before.
- `--success` #10b981: icons, strokes, small fills.
- `--success-600` #047857: text on light backgrounds and filled buttons with white text (AA contrast).
- `--success-100` #dcf5ec: soft background (pills, tick circles).
- Dark surfaces (terminal): light green #6ee7b7.
- Where it applies: Workflow mockup buttons "Request Sent" / "Sent", "Complete / Prepared / Done" pills, validation ticks and checklists, valid input borders and messages, progress/complete bars, "approved", console "ok" lines, Home Fast card done steps, form success icon.
- Error stays red (`--red`), in-progress stays violet. Success never uses violet or teal.
- Teal (`--teal`) remains only for data-flow elements in diagrams (packets, lanes, data records), where it means "data in transit", never "success".

**Success motion (tick):** when a button becomes "Request Sent" or "Sent" it turns green, pops slightly (scale 0.94 → 1.04 → 1, 0.45 s) and a tick draws itself in front of the label (circle stroke 0.45 s, then the check 0.35 s, after the useanimations check pattern). Done pills show a check instead of a dot. No motion with reduced-motion. Button size never changes (156 x 36).
