# Component specs — BTC / Paywave-derived system

Layout patterns are derived from the public reference; copy, media and brand remain BTC's own.

Brand reference: teal `#66bfbf`, mist `#eaf6f6`, white `#ffffff` and magenta `#ff0063`; derived roles ink `#0b2e2e`, muted `#356464`, brand text `#0b5c5c`, accent text `#c2004b` and black `#000000` on magenta.

## Button
- variants: primary (magenta fill, black text), secondary (teal outline on mist), ghost (text + hover wash)
- sizes: 32 / 44 / 48px (44 is the default touch target)
- states: default, hover, active `scale(0.98)` 120–160ms, focus-visible 2px ring, disabled, loading label retained
- tokens: bg magenta, text black on magenta, radius pill, type sm/600
- used on: all public pages and workspace headers

## SectionCard
- variants: default (white surface, hairline `#b9dede` border, radius 24), featured (gradient hairline border) one per page max
- states: static
- tokens: surface, border, radius lg, space 64–80 between cards

## PillLabel
- variants: default (brand text on mist), accent (accent text on mist)
- states: static
- tokens: type xs/600, tracking .08em, radius pill

## ProductPanel
- variants: brief card, shortlist row, stats mock
- states: static; decorative, aria-hidden where duplicate text exists
- tokens: surface, border, radius lg, soft gradient glow behind

## PricingCard
- variants: default (white surface + `#b9dede` hairline), featured (solid teal or magenta with correct on-colour)
- states: static
- tokens: price from `src/config/payment.ts`, never hardcoded
- a11y: heading hierarchy, list semantics, honest PAYMENT_CONFIGURED note

## StatusPill
- variants: pending, confirmed, rejected, shortlisted, open
- states: static; colour plus text, never colour alone
- tokens: semantic danger/success/accent roles

## Input / Field
- variants: text, textarea, select
- states: default, focus ring, invalid (aria-invalid + message), disabled
- a11y: programmatic label, described-by for hints/errors

## EmptyState
- variants: list empty, action required
- states: static; one primary CTA only
- a11y: real heading, readable copy, 44px action

## Motion
- entrance: opacity + translateY 8px, 200ms, ease `cubic-bezier(.22,1,.36,1)`
- state: opacity + scale(.97→1), 160ms
- press: scale(.98), 120–160ms
- all disabled under prefers-reduced-motion; transform/opacity only
