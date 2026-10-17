# WIN redesign: project instructions

Concept redesign of win.wine for EuvinoPRO, built as a portfolio piece. Static HTML/CSS/JS in this folder, live at https://win-redesign.vercel.app, repo github.com/souvikb93/win (push to `main` auto-deploys).

**Before any UI change, read [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) and follow it.** It holds the tokens, component rules, motion rules, content rules and a log of mistakes already corrected.

## The rules that matter most
1. **One accent: violet `#5844ff`.** No orange or gradients as decoration; orange is warnings only. Headlines are one colour.
2. **One card language** (white, 20px radius, hairline, soft shadow, 32px padding). No glows. Visuals sit on the card, not in a box inside it.
3. **Buttons are text-only**, no resting glow. Text links draw an underline in on hover.
4. **Spacious, not cramped.** If it feels tight, remove things before shrinking them.
5. **Motion explains the product** (request, check, delivery). Show relationships through interaction, not connector lines. The dot travels only on the link between nodes. Never hide the system cursor.
6. **WIN's official flows are exact:** direct = 6 steps, via agency = 8 steps (see DESIGN_SYSTEM.md §6).
7. **Example content uses made-up names** (Nordwein Handel, Weingut Sonnenhang, Vinara Import). Real names only as real facts (logo strip, press, milestones).
8. **Don't invent facts.** Source from win.wine, euvinopro.eu or linked press; log them in RESEARCH.md.
9. Top nav = pages only. Home sections = side nav. Language = "EN ⌄" dropdown.

## How to work here
- Owner dictates by voice; parse for intent. For larger design changes, **suggest first, then build** when asked to ("suggest before building").
- Verify before saying done: visible preview pane, hard-reloaded assets, 1440×900, 1366×768 and 375×812, measure with the DOM, no console errors. State plainly what was not watched in real time.
- Then commit (end with the Co-Authored-By line), push, and confirm the Vercel deployment is Ready.
- Update DESIGN_SYSTEM.md whenever the owner corrects something, so it isn't repeated.
- Keep `HANDOFF.md` current at the end of a session.
