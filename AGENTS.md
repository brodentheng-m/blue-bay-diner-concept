# AGENTS.md — Blue Bay Diner concept site

## What this is
A **cold-outreach concept demo** for a real diner whose Google listing points at a
dead, SSL-less parked domain. It is NOT commissioned and NOT affiliated with the
business. The disclosure banner and footer line are **required** — removing them
breaks the legal basis for showing this page at all.

## STRICT DESIGN RULE
- Color families **purple, violet, and indigo are FORBIDDEN.** They are remapped in
  `src/input.css`; do not un-remap them. Never hardcode a purple hex.
- Headings: `font-display` (Playfair Display). Body: Inter.
- Do NOT edit `src/input.css` unless the change is a palette token or a guardrail fix.

## CONTENT RULES — the whole pitch dies if these are violated
`PLAN.md` holds a VERIFIED FACTS table. **It is the only permitted source of
business facts.**

**NEVER write:**
- Menu items, dish names, or ANY price (no `$`, no dollar figures)
- Staff or owner names, "family owned since 19XX", founding stories
- Testimonials, quotes, review text, "our customers say"
- Awards, "#1", "best in Queens", press mentions
- Stock photos of food they may not actually serve

**ALLOWED:**
- Name, address, phone, 4.2 rating, "open until 12 AM"
- Generic service categories (breakfast, lunch, dinner, dine-in, takeout)
- The verbatim Google description, clearly attributed as a summary
- Dashed placeholder frames that explicitly invite a phone call

## Technical
- Tailwind v4, no framework. Rebuild after any HTML/CSS change: `npm run build`.
- Phone must be `href="tel:+17182256333"` with display text `(718) 225-6333`,
  and use the `.tap` class so it is a 44px tap target.
- Map link: `https://maps.google.com/?q=58-50+Francis+Lewis+Blvd,+Flushing,+NY+11365`
- Must pass: no horizontal scroll at 320/360/390px; hamburger nav works; banner
  dismisses AND stays dismissed across reload.

## Deliverable standard
The page must look **finished**, not like a skeleton. No dashed placeholder in the
hero or the first content section. A photo placeholder in the primary content area
reads as "unpublished", which is the opposite of what a pitch needs.
