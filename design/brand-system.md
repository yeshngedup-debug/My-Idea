# Brand system — implementation map

Canonical palette and rules live in `design/brand-guidelines.md`; the typed
source of truth is `lib/design-tokens.ts`. This map shows where each token is
actually consumed today. Page files still use literal hex utilities — those
hexes are the same values as the tokens. This document describes them; it does
not ask for a repaint.

## Token → code

| Layer | File(s) | Tokens in use |
|---|---|---|
| Source of truth | `lib/design-tokens.ts` | `colors`, `palette`, `spacing`, `radii`, `motion`, `typeScale`, `tracking`, `zIndex`, `focus`, `touchTarget`; legacy `designTokens` + `color/space/radius` helpers kept additive |
| CSS contract | `app/globals.css` `@theme inline` / `:root` | `--color-background/page #f5f2ea`, `--color-card/surface #fffefa`, `--color-foreground/ink #18251f`, `--color-primary/forest #17352b`, `--color-accent #d84f37`, `--color-ring #d84f37`, `--radius 0.5rem`; HSL twins in `:root` |
| CSS motion | `app/globals.css` `:root` | `--ease-out`, `--ease-in-out`, `--duration-100/150/250`, `--shadow-material`; bento zoom uses 700ms inline |
| CSS components | `app/globals.css` classes | `.site-chrome` / `.glass-pill` (page + surface translucency), `.pressable` (100ms, scale .98), `.figure-zoom` / `.bento-zoom`, `.cinematic-wash`, `.cta-ambient` (amber `#fbbf24` glow); reduced-motion/transparency/contrast fallbacks |
| Shell | `app/layout.tsx` | Geist `--font-geist`, `theme-color #f5f2ea`, skip link `z-50`, favicon and manifest links |
| Marketing chrome | `components/marketing/site-header.tsx`, `site-footer.tsx`, `nav.ts` | forest CTA `#17352b` → hover `#244b3e`; small-text accent `#b23c26` underlines/dots; focus ring `#b23c26`/`#d84f37`; header `z-50`; chrome classes from CSS |
| Marketing content | `components/marketing/section-intro.tsx`, `page-hero.tsx`, `photo-feature.tsx`, `hover-photo.tsx`, `cta-band.tsx`, `bento-grid.tsx`, `home/desire-chapter.tsx`, `guides/*` | amber/small-text eyebrows, forest headings, paper/surface panels, forest image placeholders, bento gap lines at forest opacity, amber CTA wash |
| Auth forms | `components/ui/input.tsx`, `textarea.tsx`, `label.tsx`, `button.tsx`, `submit-button.tsx` | semantic `--color-*` variables; forest submit button with paper text; accent focus ring |
| Shared UI | `components/ui/card.tsx`, `badge.tsx`, `progress.tsx`, `spotlight-card.tsx`, `status-timeline.tsx`, `page-skeleton.tsx` | surface `#fffefa`, border `#ded8cb`, forest tints, small-text accent for active steps, accent focus ring |
| Identity | `components/ui/logo.tsx`, `public/favicon.svg`, `public/og-image.svg`, `design/*.svg` | forest symbol `#17352b`, amber arch `#e0ad3c` in app (masters: navy `#16324f` + `#fbbf24`), vermilion `#d84f37` in OG art |
| Media | `components/ui/photo-credit.tsx`, `components/editorial/*` | Wikimedia Commons credit registry with CC BY-SA licences; credits render beside every photograph |
| Motion | `components/ui/motion.tsx`, `motion-provider.tsx`, `components/motion/*` | shared easing/duration constants, transform + opacity only, reduced-motion counterparts |
| Elevation | marketing header, simple layout, sticky table heads, tooltip, skip link | `zIndex`: raised/sticky `10`, chrome `30–40`, header/tooltip/skip link `50` |

## Do not

- **No violet/purple** or generic tech-blue gradients in consumer-facing UI.
- **No gradient text** and no outlined/neon text effects.
- **No connected-node clichés** — no network graphs, circuit traces or circle
  containment decoration. The two-dot bridge mark is the one sanctioned
  exception because it means "back people, not companies."
- **No sacred symbols** — no druk (thunder dragon), prayer flags, dharma wheels
  or religious iconography as decoration.
- **No emojis** in UI copy, headings or documentation.
- Do not reintroduce navy `#16324f` into new UI work, or mix legacy SVG master
  colours with the canonical palette in a single composition.
- Do not hand-pick off-palette hexes, repaint existing components, animate
  layout properties, or drop photo attribution.
