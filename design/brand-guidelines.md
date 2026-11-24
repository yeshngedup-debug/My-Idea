# Bhutan Tech Connect — Brand guidelines

**Canonical since:** 2026-11-24. This document is the visual brand contract. The
typed source of truth is `lib/design-tokens.ts`; `app/globals.css` mirrors the
CSS/Tailwind values. One palette describes the site as it is actually built —
no repaint is required or implied.

## 1. Canonical palette

| Role | Token | HEX | Where it is used |
|---|---|---|---|
| Page | `colors.page` | `#f5f2ea` | Warm paper background, chrome (`theme-color`), most page roots |
| Surface | `colors.surface` | `#fffefa` | Cards, popovers, inputs, mobile sheet, raised panels |
| Ink | `colors.ink` | `#18251f` | Body copy and general foreground text |
| Primary action / forest | `colors.forest` | `#17352b` | Primary buttons, hero bands, headings, logo, borders at opacity |
| Forest hover | `colors.forestHover` | `#244b3e` | Hover state of forest buttons |
| Small-text accent | `colors.smallTextAccent` | `#b23c26` | Eyebrows, inline links, list markers, small labels, focus ring in legal UI |
| Warm accent | `colors.accent` | `#d84f37` | Decorative icons, rules, large text, default focus ring |
| Warm accent hover | `colors.accentHover` | `#b44532` | Hover state of the warm accent |
| Amber highlight | `colors.amber` | `#fbbf24` | Logo arch master, CTA ambient glow, highlight fills |
| Amber (display) | `colors.amberDisplay` | `#e7b648` | Oversized statistics on the warm paper background |
| Amber (logo in app) | `colors.amberLogo` | `#e0ad3c` | In-app logo arch (`components/ui/logo.tsx`) |
| Border | `colors.border` | `#ded8cb` | Hairlines, inputs, table rules |
| Muted foreground | `colors.textMuted` | `#657069` | Secondary/meta text |
| On dark | `colors.onDark` | `#fffefa` | Text and icons on forest surfaces |

**Supporting tones:** secondary surface `#eae5d9`; soft muted surface
`#eeeae1`; hover border `#cfc6b6`; secondary text `#56645c`; success
`#377553` / `#e7f2e9`; error `#c24132` / `#fcebea`; info `#466e8c` /
`#e9f1f5`.

**Retired direction.** The brief's navy `#16324f` and its adjacent amber were
consolidated into forest `#17352b`, vermilion `#b23c26`/`#d84f37` and amber
`#fbbf24` for contrast on warm paper and a warmer, Bhutan-specific feel. The
legacy navy survives only in archived `design/*.svg` masters and old
single-colour files; it is not a UI colour for new work.

## 2. Typography

- **Family:** Geist loaded through `next/font/google` as `--font-geist`
  (`app/layout.tsx`), applied to `html`/`body` via `font-sans`. Fallback stack:
  `ui-sans-serif, system-ui, sans-serif`. Serif (`Georgia, Cambria, …`) and
  mono are reserved for exceptional display/OG contexts, not body copy.
- **Voice:** editorial and confident — large semibold headings, short measured
  lines (`text-balance`), generous vertical rhythm.

| Role | Size | Leading | Tracking | Weight |
|---|---|---|---|---|
| Display / hero numeral | `clamp(4.5rem, 10vw, 8rem)` | `0.8` | `-0.09em` | 600 |
| Page title | `clamp(3rem, 7vw, 6rem)` | `0.92` | `-0.06em` | 600 |
| H1 | `clamp(2.25rem, 4.6vw, 4.25rem)` | `1.02` | `-0.045em` | 600 |
| H2 | `clamp(2rem, 6vw, 5.5rem)` | `1.04` | `-0.045em` | 600 |
| H3 / card title | `1.5rem` | `1.2` | `-0.03em` | 600 |
| Body | `1rem` | `1.75` | `0` | 400 |
| Small | `0.875rem` | `1.5` | `0` | 400 |
| Eyebrow / kicker | `0.75rem` | `1.2` | `+0.14em` to `+0.2em`, uppercase | 700 |
| Micro label / credit | `0.625rem` | `1.2` | `+0.2em` | 700 |

**Rule:** tracking tightens as size grows; never tightens body copy or apply
expanded tracking to paragraphs. Legal/meta text may use `+0.02em`. No gradient
text, no outline text, no letter-spacing tricks that reduce legibility.

## 3. Logo

**Symbol.** Two dots (student, founder) joined by a bridge, with an amber arch
cap above. Meaning: connecting student talent to founder opportunity — "back
people, not companies." Built on a 256×256 grid, filled paths only (no
strokes), no live text inside the symbol. It works alone as favicon/app icon or
alongside the wordmark.

**Colour rules.**

- Digital UI: forest `#17352b` symbol with amber `#e0ad3c` arch — the live
  rendering in `components/ui/logo.tsx` and `public/favicon.svg`.
- Full-colour master: forest/amber. One-colour versions: forest (dark on light)
  and white (reversed on forest/dark). Greyscale must still carry the concept.
- The archived masters use navy `#16324f` + `#fbbf24`. Keep them as source
  artifacts; do not introduce navy into new UI, and do not repaint existing
  assets just to match the new palette.

**Lockups.**

| File | Use |
|---|---|
| `btc-lockup-horizontal.svg` | Website header, print, wide applications |
| `btc-lockup-stacked.svg` | Social avatar, square applications |
| `btc-symbol-small.svg` | Favicon, app icon (16–512 px) |

**Clear space:** at least half the symbol's height on every side. **Minimum
size:** 24 px wide (symbol), 100 px wide (lockup). Do not stretch, rotate,
outline, add shadows/gradients, or place on busy photography without a solid
backing shape. The wordmark in the SVG lockups is live text (Inter); convert it
to outlines for print. When creating new lockups use Geist, matching the site.

**Asset inventory:** `btc-symbol.svg`, `btc-symbol-colour.svg`,
`btc-symbol-navy.svg`, `btc-symbol-white.svg`, `btc-symbol-small*.svg`,
`btc-lockup-horizontal.svg`, `btc-lockup-stacked.svg`, `favicon.svg`,
`favicon.ico`, favicon PNGs, `apple-touch-icon.png`, `icon-192.png`,
`icon-512.png`, `maskable-512.png`, `site.webmanifest`.

## 4. Photography

- Use **real Wikimedia Commons photographs of Bhutanese people in gho and
  kira**. No stock, no AI-generated faces, no sacred or religious imagery.
- Attribution is mandatory and must travel with the image. Pass the Commons
  file URL to `components/ui/photo-credit.tsx`, which owns the author/licence
  registry and renders the visible credit link. Current credits: Doctor 17
  (CC BY-SA 4.0), Keith Mason (CC BY-SA 3.0), Christopher J. Fynn
  (CC BY-SA 3.0); the registry is authoritative if more are added.
- Alt text must describe the person/scene, not the licence line. Credit text
  stays legible over both paper and forest surfaces.
- Treat photos as the hero: full-bleed or bento imagery with a restrained dark
  wash (`.cinematic-wash`) or amber glow (`.cta-ambient`). No gradient text over
  photos. Never place the logo directly on a photo without a solid backing.

## 5. Accessibility

- Targets: **4.5:1** for normal text, **3:1** for large text (≥24 px regular or
  ≥18.66 px bold) and UI components/focus indicators, per WCAG 2.2 AA.
- Body ink `#18251f` on paper `#f5f2ea` measures **14.19:1**; forest
  `#17352b` on paper **11.88:1**; both pass comfortably.
- Small-text accent `#b23c26` measures **5.26:1** on paper / **5.83:1** on
  surface — use it for all small vermilion text.
- Warm accent `#d84f37` is **3.69:1** on paper / **4.09:1** on surface: use it
  for large text, decoration and focus rings only, not 14px copy. Its hover
  tone `#b44532` is **4.89:1** on paper.
- Amber highlights are decorative: `#fbbf24` on forest **7.96:1**, but
  `#e7b648` on paper only **1.68:1** — never use amber for body text on paper.
- Focus: 2px `#d84f37` ring with 2px offset; 44px minimum touch targets (24px
  for inline links). Respect `prefers-reduced-motion`,
  `prefers-reduced-transparency` and `prefers-contrast: more` — the CSS already
  provides solid, non-animated, high-contrast fallbacks.
