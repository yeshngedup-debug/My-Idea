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
| White page | `colors.page` | `#FFFFFF` | App background, marketing ground, page gutters |
| White surface | `colors.surface` | `#FFFFFF` | Forms, project rows, cards, panels |
| Quiet surface | `colors.surfaceMuted` | `#F5F5F7` | Muted sections, inputs, loading placeholders |
| Ink | `colors.ink` | `#1D1D1F` | Headings and body copy |
| Secondary ink | `colors.inkSoft` | `#6E6E73` | Supporting copy and metadata |
| Border | `colors.border` | `#D2D2D7` | Borders, dividers, inactive controls |
| Accent and primary action | `colors.cta` | `#0B5C5C` | The single filled action, accent, focus ring |
| Accent hover | `colors.ctaHover` | `#0B5C5C` | Filled action hover state |
| On accent | `colors.onCta` | `#FFFFFF` | Text on deep teal |
| Error | `colors.error` | `#B42318` | Error text and borders |

### Palette rules

- The five neutral values and deep teal `#0B5C5C` are the complete palette. Do not introduce a second accent.
- Use `#6E6E73` for supporting copy; keep body copy at `#1D1D1F`.
- Use white text on `#0B5C5C`. No gradients, tinted surfaces, or coloured sections.
- Do not introduce violet, generic tech blue, magenta, gradient text, neon text, or glass effects.
- Status is always communicated by a readable label and, where useful, a shape or icon. Colour alone is never sufficient.

## 3. Typography

- **Family:** system sans (`system-ui`, Inter or Geist where available). It is the only product typeface family.
- **Voice:** direct, calm, specific. Headings describe the outcome; body copy explains what happens next.
- **Measure:** body copy stays below roughly 70 characters per line.

| Role | Size | Leading | Tracking | Weight |
|---|---|---|---|---|
| Display | `clamp(2.75rem, 7vw, 5.25rem)` | `1.04` | `-0.045em` | 600 |
| Page title | `clamp(2.5rem, 5vw, 4rem)` | `1.08` | `-0.04em` | 600 |
| H1 | `clamp(2.25rem, 4.5vw, 3.5rem)` | `1.08` | `-0.04em` | 600 |
| H2 | `clamp(1.875rem, 3vw, 2.75rem)` | `1.14` | `-0.03em` | 600 |
| H3 / card title | `1.5rem` | `1.25` | `-0.03em` | 600 |
| Body | `1.0625rem` | `1.6` | `0` | 400 |
| Small | `0.875rem` | `1.55` | `0` | 400 |
| Label | `0.875rem` | `1.55` | `0` | 400 |

**Rule:** tracking tightens only as display size grows; body copy and labels stay at normal tracking. All labels are natural case. Do not use uppercase labels or heavy tracking.

## 4. Layout and components

- **Marketing:** a practical landing rhythm. The hero exposes both audiences' actions, followed by the trust bar and the three-step process. Neutral icon panels support decisions; they are not the product.
- **Product:** one compact shell with role-specific navigation, a clear next action, then dense queues and forms.
- **Cards:** use one radius family and real borders. Cards group related information; they are not decorative tiles repeated without hierarchy.
- **Status:** badges use short labels such as `Open`, `In review`, `Awaiting payment`, `Verified`, and `Rejected`. The same stored status uses the same wording across student, founder, and admin screens.
- **Empty and error states:** explain what is missing and give one useful next action. They are never generic apologetic messages.
- **Loading states:** static, low-contrast placeholders that match the final layout. No shimmer, pulse, or hidden content.

## 5. Logo

**Symbol.** Two dots (student and founder) joined by a bridge, capped by one arch. It means connecting people through opportunity.

- Digital UI: deep teal `#0B5C5C` symbol and arch.
- One-colour versions may use deep teal or white.
- Do not add gradients, shadows, sacred imagery, or a third dot.
- Keep clear space equal to half the mark height and use the mark at 24 px or larger.

## 6. Visual panels

- The website does not render photography. Visual panels use Phosphor icons through `MinimalMedia` in `src/components/marketing/minimal-system.tsx`.
- Each panel has a visible label; the decorative SVG is `aria-hidden="true"`.
- Panels stay within the locked neutral palette with deep teal only as an accent.
- Do not use stock-photo gestures, staged boardrooms, fabricated product screenshots, or religious imagery as decoration.

## 7. Motion

- Motion budget: **low**.
- Allowed: 150–250 ms opacity and fade changes.
- Not allowed: scroll reveals, blur entrances, parallax, marquees, scrubbed text, pinned editorial chapters, transform entrances, autoplay, or looping decoration.
- Content must be visible in the first server render and first client render. Do not set `opacity: 0` as an initial state.
- Honour `prefers-reduced-motion`. The global CSS backstop removes animation and transition durations for visitors who request it.

## 8. Accessibility

- WCAG 2.2 AA: 4.5:1 for normal text, 3:1 for large text and UI/focus indicators.
- Ink `#1D1D1F` on white or `#F5F5F7` is the default body treatment. Secondary text `#6E6E73` is used for supporting copy.
- Deep teal `#0B5C5C` uses white text and is reserved for the primary action and focus.
- Focus: a 2 px deep-teal ring with a 2 px offset.
- Keep a skip link, one meaningful `h1` per page, ordered headings, visible labels, and programmatic status announcements.
- Every interactive target is at least 44 × 44 px; inline text links may use the 24 px floor.
- Do not rely on colour alone for project, application, payment, or verification state.
