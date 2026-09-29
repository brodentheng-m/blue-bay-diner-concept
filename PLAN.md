# Blue Bay Diner — Concept Site

**Purpose:** Cold-outreach concept demo. The owner's Google Business Profile links to
`bluebay1.com`, which is a parked domain with no SSL. The pitch is: "your Google listing
sends customers to a dead, unsecured page — here's what they should see instead."

**NOT a commissioned build.** Disclosure banner + footer are required and must not be removed.

---

## VERIFIED FACTS — the only permitted content source. (and no others)

| Field | Value | Source |
|---|---|---|
| Business name | Blue Bay Diner | Google Maps place page |
| Category | Diner | Google Maps |
| Address | 58-50 Francis Lewis Blvd, Flushing, NY 11365 | Google Maps |
| Phone | (718) 225-6333 | Google Maps |
| Rating | 4.2 stars | Google Maps |
| Hours | Open · Closes 12 AM | Google Maps |
| Description (verbatim, Google's own) | "Old-school diner serves hefty portions of breakfast fare, burgers & made-from-scratch desserts." | Google Maps |
| Website | bluebay1.com — **PARKED, no SSL** | verified 2026-09-28 |

### Verified website defect (the basis of the pitch)
- `https://www.bluebay1.com/` → `TLS connect error: tlsv1 unrecognized name` (no valid cert)
- `http://www.bluebay1.com/` → 200 but serves a 114-byte redirect to `/lander` (domain parking)
- DNS resolves to 13.248.213.45 / 76.223.67.189 (parking IPs)
- Google Maps still lists this domain as the official website

## HARD CONTENT RULES

**Forbidden — do not write any of these:**
- Menu items, dish names, or any prices
- Hours other than "Open until 12 AM" on the verified page
- Staff names, owner names, family history, "since 19XX"
- Testimonials, reviews, quote attributions, "rated #1"
- Awards, press mentions, certifications
- Photos of food (no stock imagery of dishes they may not serve)

**Permitted:**
- Name, address, phone, rating, the Google description summarized
- Generic diner categories that are not specific claims: breakfast, lunch, dinner,
  dine-in, takeout, catering inquiries by phone
- A styled placeholder frame inviting a phone call where a real menu would go

## Placeholders (deliberate, must read as intentional)
- Menu section: dashed frame, "Menu — call (718) 225-6333 for today's specials"
- Photo slots: labeled empty frames with correct aspect ratio, NEVER stock food photos

## Design direction
- Classic American diner: warm reds, cream, chrome-neutrals. Not the emerald default.
- Playfair Display headings + Inter body (this user's business default).
- No purple/violet/indigo (enforced in `src/input.css`).

## Sections
1. Disclosure banner (dismissible, persists)
2. Header: name, tap-to-call
3. Hero: name, rating, address, "Call for hours & specials", dead-site callout
4. What we serve (generic categories only)
5. Menu placeholder frame
6. Hours + location + working map link
7. Footer with repeated disclosure

## Build phases
- [x] Facts table
- [ ] Scaffold + guardrail
- [ ] Build page
- [ ] Content scan (no invented prices/dishes/reviews)
- [ ] `npm run build` + guardrail value check
- [ ] Mobile geometry + interaction QA
- [ ] Deploy to Pages, verify live
