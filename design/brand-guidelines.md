# Bhutan Tech Connect — Brand guidelines

**Canonical since:** 2026-11-27. This document is the visual and product-language contract. The typed source of truth is `src/lib/design-tokens.ts`; `src/app/globals.css` mirrors the CSS and Tailwind values.

## 1. Product read

Bhutan Tech Connect is a practical local talent marketplace, not an editorial magazine. The interface should help a student or founder understand the next useful action in seconds, on a phone and without prior platform knowledge.

The brand promise is **back people, not companies**: a student and a founder meet through a clear brief, visible budget, human verification, and payment in Ngultrum.

### Experience principles

1. **Action before atmosphere.** Show the role-specific next action early. Marketing imagery supports the decision; it does not delay it.
2. **Trust is visible.** Human verification, Ngultrum payment, no bidding wars, and Bhutan-based work should appear without scrolling on the homepage.
3. **Density over decoration.** Use real briefs, budgets, statuses, deadlines, and package details. Do not fill space with feature claims or invented social proof.
4. **One emphasis.** Magenta marks the single high-priority action in a view. Peer actions use outline, text, or dark teal.
5. **Phone first.** Critical copy and controls remain usable at 360–390 px. Every interactive target is at least 44 × 44 px.

## 2. Canonical palette

| Role | Token | HEX | Where it is used |
|---|---|---|---|
| Mist page | `colors.page` | `#eaf6f6` | App background, quiet sections, page gutters |
| White surface | `colors.surface` | `#ffffff` | Forms, project rows, cards, panels |
| Primary teal | `colors.forest` | `#0b5c5c` | Primary text, structure, outlined actions, dark surfaces |
| Deep teal ink | `colors.ink` | `#0b2e2e` | Headings and body copy |
| Soft ink | `colors.inkSoft` | `#356464` | Supporting copy and metadata |
| Pale teal line | `colors.border` | `#b9dede` | Borders, dividers, inactive controls |
| Strong teal line | `colors.borderStrong` | `#4d8c8c` | Hover borders and grouped surfaces |
| Decorative teal | `colors.brand` | `#66bfbf` | Logo arch, image fallback, decorative fills only |
| Magenta CTA | `colors.cta` | `#ff0063` | One filled high-priority action per view |
| Magenta hover | `colors.ctaHover` | `#d40054` | Filled CTA hover state |
| CTA ink | `colors.onCta` | `#000000` | Text on magenta; white fails contrast |
| Deep magenta | `colors.smallTextAccent` | `#c2004b` | Small accent text, focus rings, error text |
| Error | `colors.error` | `#c2004b` | Error text and borders |

### Palette rules

- `#66bfbf` is decorative. Do not use it for body text or small labels on white.
- Use `#0b5c5c` for teal text on mist or white.
- Use white text on `#0b2e2e`; use black text on `#ff0063`.
- Do not introduce violet, generic tech blue, gradient text, neon text, or glass effects.
- Status is always communicated by a readable label and, where useful, a shape or icon. Colour alone is never sufficient.

## 3. Typography

- **Family:** Geist through `next/font/google` as `--font-geist`. It is the only product typeface.
- **Voice:** direct, calm, specific. Headings describe the outcome; body copy explains what happens next.
- **Measure:** body copy stays below roughly 70 characters per line.

| Role | Size | Leading | Tracking | Weight |
|---|---|---|---|---|
| Marketplace display | `clamp(2.75rem, 6vw, 4.75rem)` | `1.0` | `-0.04em` | 600 |
| Page title | `clamp(2.5rem, 5vw, 4.25rem)` | `1.04` | `-0.04em` | 600 |
| H1 | `clamp(2.25rem, 4.5vw, 3.75rem)` | `1.08` | `-0.04em` | 600 |
| H2 | `clamp(1.65rem, 3vw, 2.5rem)` | `1.18` | `-0.02em` | 600 |
| H3 / card title | `1.5rem` | `1.25` | `-0.02em` | 600 |
| Body | `1rem` | `1.65` | `0` | 400 |
| Small | `0.875rem` | `1.55` | `0` | 400 |
| Label | `0.75rem` | `1.3` | `0.08em` | 500 |

**Rule:** tracking tightens as size grows; body copy stays at normal tracking. Natural-case labels are preferred. Wide uppercase tracking is reserved for compact navigation or metadata, never a row of decorative eyebrows.

## 4. Layout and components

- **Marketing:** a practical landing rhythm. The hero exposes both audiences' actions, followed by the trust bar and the three-step process. Photography supports decisions; it is not the product.
- **Product:** one compact shell with role-specific navigation, a clear next action, then dense queues and forms.
- **Cards:** use one radius family and real borders. Cards group related information; they are not decorative tiles repeated without hierarchy.
- **Status:** badges use short labels such as `Open`, `In review`, `Awaiting payment`, `Verified`, and `Rejected`. The same stored status uses the same wording across student, founder, and admin screens.
- **Empty and error states:** explain what is missing and give one useful next action. They are never generic apologetic messages.
- **Loading states:** static, low-contrast placeholders that match the final layout. No shimmer, pulse, or hidden content.

## 5. Logo

**Symbol.** Two dots (student and founder) joined by a bridge, capped by a teal arch. It means connecting people through opportunity.

- Digital UI: deep teal `#0b2e2e` symbol with decorative teal `#66bfbf` arch.
- One-colour versions may use deep teal or white.
- Do not add gradients, shadows, sacred imagery, or a third dot.
- Keep clear space equal to half the mark height and use the mark at 24 px or larger.

## 6. Photography

- Use real, locally relevant photographs of Bhutanese people, work, and places.
- The current active photographs are CC0 Wikimedia Commons files. Their source and licence record lives in `src/lib/photo-credits.ts`.
- Alt text describes the scene, not the licence.
- Do not use stock-photo gestures, staged boardrooms, fabricated product screenshots, or religious imagery as decoration.
- Use `next/image` with explicit responsive `sizes`. The teal plate behind an image is the loading fallback.
- Avoid large text over photographs. When a label must sit on an image, use a solid backing.

## 7. Motion

- Motion budget: **low**.
- Allowed: 100–200 ms colour, border, opacity, or small press feedback on a control the visitor activates.
- Not allowed: scroll reveals, blur entrances, parallax, marquees, scrubbed text, pinned editorial chapters, autoplay, or looping decoration.
- Content must be visible in the first server render and first client render. Do not set `opacity: 0` as an initial state.
- Honour `prefers-reduced-motion`. The global CSS backstop removes animation and transition durations for visitors who request it.

## 8. Accessibility

- WCAG 2.2 AA: 4.5:1 for normal text, 3:1 for large text and UI/focus indicators.
- Deep teal `#0b2e2e` on mist or white is the default body treatment. Soft ink `#356464` is used for supporting copy and remains readable.
- Magenta `#ff0063` uses black text; white text on magenta is not allowed.
- Focus: a 2 px deep-magenta ring with a 2 px offset.
- Keep a skip link, one meaningful `h1` per page, ordered headings, visible labels, and programmatic status announcements.
- Every interactive target is at least 44 × 44 px; inline text links may use the 24 px floor.
- Do not rely on colour alone for project, application, payment, or verification state.
