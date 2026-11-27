# Recon — Paywave visual reference → Bhutan Tech Connect

## Scope
- **Source:** https://paywave.framer.website/ (public marketing site only)
- **Platform:** Web
- **Slice:** Public marketing site (hero, solution, demo, features, integrations, testimonials, blog, CTA, footer). Authenticated dashboards keep BTC functionality and only adopt the visual language where it fits.
- **For:** Bhutan Tech Connect — a local student/founder matching platform with admin verification and Nu payments.

## Sources
| Source | What it gave |
| --- | --- |
| https://paywave.framer.website/ | Public page structure, visual system, section order |
| https://paywave.framer.website/contact | Centred form card with dark + accent corner shapes |
| https://paywave.framer.website/pricing | 3 pricing cards, middle one solid-accent, inside a rounded section card |
| https://paywave.framer.website/integrations | Logo grid in rounded cards |
| https://paywave.framer.website/blog | Article cards in a rounded section |
| https://paywave.framer.website/about | 404 (no source page) — BTC about page keeps its own content |

## Additional patterns observed
- Pricing cards: mostly white with hairline lavender borders on the reference site only; one highlighted card filled with the accent colour, inside a large rounded white section card. BTC maps these to white surfaces and `#b9dede` hairlines.
- Contact: centred form with small pill label, muted subtitle, and two solid corner wedges (dark + accent) as decoration.
- Footer: wordmark + tagline left, two compact link columns right, copyright bottom-right, inside a rounded card.
- Blog/article cards and integration logo grids are decorative patterns only — BTC has no real blog posts or partner logos, so these map to FAQ links and stack facts, never invented content.

## Screen inventory
| ID | Screen | Route | Purpose | Key components | States |
| --- | --- | --- | --- | --- | --- |
| S01 | Home | `/` | Explain product, drive signup | pill nav, hero + product panel, bento, feature cards, trust grid, CTA | desktop/mobile |
| S02 | Students | `/for-students` | Outcome-led path for students | hero, steps, benefits, CTA | desktop/mobile |
| S03 | Founders | `/for-founders` | Request access + pricing | hero, pain/solution, steps, pricing table, CTA | desktop/mobile |
| S04 | How it works | `/how-it-works` | Diagram + role swimlanes | steps, images, CTA | desktop/mobile |
| S05 | About | `/about` | Mission + local context | photo-led hero, story, CTA | desktop/mobile |
| S06 | FAQ | `/faq` | Answer objections | accordion, CTA | desktop/mobile |
| S07 | Contact | `/contact` | Founder access / support | form, photo, contact details | desktop/mobile |

## Flows
- F01 Guest understands product and signs up: S01 → S02/S03 → `/signup`
- F02 Founder requests access: S03 → S07
- F03 Guest learns process: S01 → S04 → S06

## Visual system to borrow (not copy content)
- Page background: very light tint; content sits in large white rounded "cards" with ~24px radius and hairline borders.
- Sticky pill-shaped navigation with wordmark, compact links, one dark/solid primary button.
- Centered section headings with one accent-coloured phrase; small pill section labels ("Demo", "Features").
- Soft gradient glow behind hero product mockups; gradient hairline borders on featured cards.
- Two-column feature cards with heading, muted body, and a visual (product UI, avatars, logo grid).
- Quote/testimonial grid — **adapt**: BTC has no real testimonials, so use verified product facts, not invented quotes.
- Final CTA card with soft gradient, minimal footer.
- BTC palette mapping for these borrowed patterns: mist `#eaf6f6` and white `#ffffff` for surfaces, teal `#66bfbf` for quiet accents, magenta `#ff0063` with black `#000000` text for the single filled action, brand text `#0b5c5c`, muted `#356464` and `#b9dede` hairlines.

## BTC facts that must stay true
- Neon Auth, Neon Postgres, Neon Object Storage; admin verification; bank/mBoB payments confirmed by admin.
- Pricing: Basic Nu 750, Full Support Nu 1,500 (from `src/config/payment.ts`).
- No fabricated metrics, testimonials, partner logos, or outcome claims.
- All photography must keep existing Wikimedia credits.

## Inferred data model
Already implemented in `neon/schema.sql`; this redesign does not change it.

## Feature matrix
See `replica/features.csv`.

## Cannot clone / out of scope
- Paywave's payment product, brand, copy, pricing, testimonials, avatars, and logos.
- Framer-specific motion and template assets.
- Any licensed media.

## Size
M — public marketing surface only; dashboards unchanged functionally.

## Next step
Apply the visual system to the public pages, verify build/live, then stop.
