# Brand system — implementation map

Canonical palette and product rules live in `design/brand-guidelines.md`. The typed source of truth is `src/lib/design-tokens.ts`; `src/app/globals.css` mirrors the CSS and Tailwind roles.

## Token → code

| Layer | File(s) | Contract |
|---|---|---|
| Typed source | `src/lib/design-tokens.ts` | White/gray/ink colours, deep-teal accent, spacing, radii, elevation, motion, type scale, focus, touch targets |
| CSS contract | `src/app/globals.css` | Tailwind roles for page, surfaces, ink, borders, deep-teal CTA, focus, elevation, and motion |
| Root shell | `src/app/layout.tsx` | System sans, white `theme-color`, skip link, JSON-LD, no decorative grain |
| Marketing chrome | `src/components/marketing/minimal-site-header.tsx`, `minimal-site-footer.tsx`, `nav.ts` | Shared route labels, mobile navigation, student/founder actions, white ground, deep-teal accent |
| Marketing content | `src/app/(marketing)/**` | Practical icon-led hero, trust bar, three-step flow, project briefs, package pricing, founder access |
| Authentication | `src/app/(auth)/**`, `src/features/auth/components/**` | Focused product form shell, accessible validation and status feedback |
| Authenticated shell | `src/components/layout/simple-layout.tsx`, `workspace-nav.tsx` | Role-aware compact navigation, account access, shared mist ground |
| Workspace primitives | `src/components/layout/**`, `src/components/ui/**` | Page headings, metrics, list surfaces, loading and empty states, status and form feedback |
| Student product | `src/app/(app)/student/**` | Next action, open-project feed, application status, profile and CV progress |
| Founder product | `src/app/(app)/founder/**` | Project posting, talent discovery, shortlists, package payment and order status |
| Admin product | `src/app/(app)/admin/**` | Verification queues, project and payment review, platform overview |
| Identity | `src/components/ui/logo.tsx`, `public/favicon.svg`, `public/og-image.svg` | Two-dot bridge symbol with deep-teal structure and decorative teal arch |
| Visual system | `src/components/marketing/minimal-system.tsx` | Neutral Phosphor icon panels; no website photography |

## Motion contract

- Allowed: 100–200 ms interaction feedback on hover, press, expand, submit, or other direct visitor actions.
- Not allowed: scroll reveal, scrub, marquee, parallax, pinned editorial chapters, blur/scale entrances, or any initial `opacity: 0` state.
- `[data-reveal]` and `[data-scale-fade]` are global content-visible safeguards.
- `prefers-reduced-motion` is enforced in `src/app/globals.css`.

## Do not

- Do not introduce violet/purple, generic tech blue, gradient text, neon text, glass effects, or warm cream as the primary page colour.
- Do not introduce a second accent colour; deep teal `#0B5C5C` is the only accent.
- Do not use sacred symbols, connected-node decoration, fabricated product screenshots, fake metrics, testimonials, or user counts.
- Do not use scroll-driven motion or hide content until it enters the viewport.
- Do not let the same stored status use different names across role surfaces.
- Do not hand-pick off-palette hexes for new UI.
