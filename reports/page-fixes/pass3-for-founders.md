# Pass 3 — `/for-founders` sticky sections and paused-payment notice

Date: 2026-11-25. Scope: `app/for-founders/page.tsx` and this report only. The
dirty worktree was treated as the source of truth; existing uncommitted page work
was preserved. No shared component, CSS, token, layout, action, database, test,
or config file was edited. No commit, build, `npm test`, dev server, or full
`tsc` run was performed.

## Changed files

- `app/for-founders/page.tsx`
- `reports/page-fixes/pass3-for-founders.md`

## Sticky sections wired

The page uses the shared `StickySectionHeadings` component with:

- `title="For founders"`
- `eyebrow="Founder guide"`
- `navLabel="For founders sections"`

The wrapper covers only the four non-pinned editorial sections between the
access section and the product preview. Each nav item maps to a real `h2` with a
matching id and `data-sticky-section` marker:

| Id | Label | Heading |
| --- | --- | --- |
| `brief-heading` | `Brief` | Start with a clear, scoped brief |
| `profiles-heading` | `Profiles` | Meet the people behind the CVs |
| `shortlist-heading` | `Shortlist` | A ranked shortlist, prepared by an admin |
| `compare-heading` | `Compare` | Compare what each package includes |

A page-local `StickySectionIntro` renders those four headings because the shared
`SectionIntro` does not forward `data-sticky-section`. No fake nav items,
duplicate ids, or manual sticky CSS were added. The access and payment sections
keep their existing `SectionIntro` headings and `PinnedHeadingSection` layout.

## Paused-payment notice

- The shortlist package area now shows a visible `role="alert"` callout when
  `PAYMENT_CONFIGURED` is false: "Shortlist orders are paused until the bank and
  mBoB details are published. Prices below are indicative." This matches the
  founder workspace and FAQ wording instead of the older, vaguer setup copy.
- While ordering is paused, the Basic card omits the source-config feature
  "Delivered within 2 working days" so the public pricing does not promise a
  delivery window. When payments are configured, the configured feature list is
  rendered unchanged.
- The package section stays visible; it is not hidden. The section's existing
  "Prices are advertised ranges" note remains.

## Checks performed

- Re-read the current target page, `design/brand-system.md`,
  `design/brand-guidelines.md`, `design/voice-guide.md`, `lib/design-tokens.ts`,
  `app/globals.css`, the shared sticky component and its CSS module,
  `SectionIntro`, `PinnedHeadingSection`, `config/payment.ts`, the founder
  shortlists client notice, and the FAQ payment answer.
- Read the relevant local Next.js App Router guides before editing:
  `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`,
  `04-linking-and-navigating.md`, and `05-server-and-client-components.md`.
  The page remains a static Server Component with the client sticky component
  as a child boundary.
- Verified `PAYMENT_CONFIGURED` becomes false until both bank account and mBoB
  values are present, and that the workspace/FAQ copy already describes orders
  as paused until those details are published.
- `npx eslint app/for-founders/page.tsx` — clean, no findings.
- `git diff --check` — no whitespace errors. LF-to-CRLF warnings came from the
  pre-existing dirty worktree and were not introduced by this pass.
- Reviewed the owned file structure for heading ids, marker attributes, wrapper
  placement, and the absence of duplicate ids.
- No browser drive, dev server, build, test suite, or full type check was run,
  per the pass boundary.

## Issues routed to shared owners

1. **`SectionIntro` cannot mark its heading with `data-sticky-section`.
   (LOW, shared design-system owner)** — The component accepts `headingId` but
   not a data-attribute passthrough. This page uses a local heading renderer to
   meet the sticky contract without editing shared code. A shared owner may add
   an explicit prop later; no shared edit was made here.
2. **Paused payment config still advertises a delivery window. (MED, payment
   config owner)** — `config/payment.ts` includes "Delivered within 2 working
   days" in `PACKAGES.basic.features`. The page filters that line while
   `PAYMENT_CONFIGURED` is false, but the config itself still mixes paused MVP
   state with future delivery copy. Owner should expose paused-safe feature
   copy or a separate paused feature set so every consumer stays truthful. The
   config was read only.

## Scope rationale

This page was suitable for a scoped sticky treatment, not a whole-page wrapper.
The access and payment sections use `PinnedHeadingSection`, whose desktop title
sticks at `lg:top-24`. The shared sticky bar sits at `top-16` with `z-30`; putting
those pinned sections inside its wrapper would overlap their titles. The wrapper
therefore ends before `ShortlistPreview`, leaving both pinned sections, the
terms block, and the closing CTA outside the sticky nav. This keeps one
consistent wayfinding system active at a time.
