# Design brief — Bhutan Tech Connect

**Summary:** A Bhutanese student–founder marketplace for focused, paid project work.
**Audience:** Bhutanese students (18–25), startup founders, and platform admins.
**Product read:** practical, high-trust, mobile-first, and local. It is a marketplace first and a brand story second.
**Promise:** “Back people, not companies.” A clear brief, visible budget, human verification, and payment in Ngultrum connect a student with a founder.

## Canonical palette

The interface uses one calm white/gray system with a single deep teal accent:

- Page and primary surface `#FFFFFF`
- Quiet surface `#F5F5F7`
- Ink and headings `#1D1D1F`
- Secondary text `#6E6E73`
- Borders and dividers `#D2D2D7`
- Deep teal `#0B5C5C` for the single primary action and focus only

The older teal/mist/magenta, navy/amber, and forest/vermilion directions are retired. Website photography is removed; visual panels use neutral Phosphor icons. `src/lib/design-tokens.ts` is the typed source of truth, `src/app/globals.css` mirrors it, and `design/brand-guidelines.md` defines the product and visual rules.

## Experience requirements

1. Show student and founder next actions immediately on a phone.
2. Make the trust bar visible early: human verification, payment in Ngultrum, no bidding wars, built in Bhutan.
3. Put the three-step workflow near the top, not behind a long editorial sequence.
4. Use real brief, budget, package, and status information. Do not invent metrics, testimonials, or user counts.
5. Carry the same white/gray/deep-teal language through marketing, authentication, student, founder, and admin surfaces.
6. Keep motion low: no reveal, scrub, marquee, parallax, pinned chapter, or blur entrance.
7. Keep headings, focus treatment, skip link, form feedback, empty states, loading states, and contrast accessible.

## Success criteria

- A student can understand how to find and apply for work in under one minute on a phone.
- A founder can understand access, pricing, and project posting without reading implementation details.
- The same stored status uses the same wording and tone in every role.
- No critical content depends on hover, scroll position, or JavaScript animation.
