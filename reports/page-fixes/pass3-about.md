# Pass 3 — `/about` sticky section headings

## Changed files

- None. `app/about/page.tsx` was intentionally left unchanged.
- This report: `reports/page-fixes/pass3-about.md`.

The existing uncommitted diff in `app/about/page.tsx` was preserved as-is:
`contextFactId()`, the expanded inline-image `accessibleLabel`, and the narrower
Wikimedia attribution wording remain untouched. No report other than this one
was edited.

## Sticky sections wired

- None. No `StickySectionHeadings` wrapper, local `sections` array,
  `data-sticky-section` markers, or manual sticky CSS was added.

## Checks performed

- Read `AGENTS.md` and the installed Next.js 16 guides for layouts/pages,
  Server and Client Components, and linking before evaluating the change.
- Read `design/brand-system.md`, `design/brand-guidelines.md`,
  `design/voice-guide.md`, `lib/design-tokens.ts`, and `app/globals.css`.
- Read the current `app/about/page.tsx`, its existing diff, the audit and
  prior page-fix reports for `/about`, and the existing `/faq` consumer of
  `StickySectionHeadings`.
- Read `components/layout/sticky-section-headings.tsx`,
  `components/layout/sticky-section-headings.module.css`, and
  `components/layout/pinned-heading-section.tsx`.
- Read the page's heading primitives:
  `components/marketing/section-intro.tsx`,
  `components/editorial/inline-image-text.tsx`, and
  `components/brand/local-bridge-differences.tsx`.
- Ran `npx eslint app/about/page.tsx`; no findings.
- Did not run `npm test`, `npm run build`, a dev server, full `tsc`, or browser
  tooling, per the pass scope.

## Issues routed to shared owners

- **Pinned/wayfinding conflict — design-system owner.**
  `components/layout/pinned-heading-section.tsx:22` pins the national-context
  heading with `lg:sticky lg:top-24` (96px). `StickySectionHeadings` pins its
  two navigation rows at `top-16` (64px) with `z-30`
  (`components/layout/sticky-section-headings.tsx:123-128`). If the shared
  wrapper spans the context section, the pinned heading lands underneath the
  new sticky rows instead of reading as a coherent second level. Recommended
  fix: choose one pinned wayfinding primitive per page, or have the shared
  owners agree a combined offset/z-index contract before adding a second one.
  No shared file was edited.
- **Heading data-attribute gap — design-system owner.**
  The page-only scope cannot put `data-sticky-section` on the real `h2`
  elements. `SectionIntro` renders its `h2` with only `headingId`
  (`components/marketing/section-intro.tsx:5-12,29-34`), `InlineImageText`
  renders its heading with only `id`
  (`components/editorial/inline-image-text.tsx:5-21,54-73`), and
  `LocalBridgeDifferences` derives its heading id from an `id` prop
  (`components/brand/local-bridge-differences.tsx:49-76`). None accepts a
  heading-level data attribute. The `/faq` consumer works around this by
  putting `id` and `data-sticky-section` on a wrapper div while the `h2` keeps
  a separate id (`app/faq/page.tsx:309-325`), but that does not meet this
  pass's requirement to mark the real headings themselves. Recommended fix:
  add an optional heading-prop/data-attribute passthrough to the shared
  heading primitives. No shared file was edited.

## Skipped rationale

`/about` is not a suitable consumer for `StickySectionHeadings` in this
page-only pass. Its main editorial sequence contains a deliberate
`PinnedHeadingSection` at `app/about/page.tsx:158-246`, whose heading is
already pinned near the viewport top on `lg+`. Adding the shared two-row sticky
header across that range would overlap or bury that pinned heading. Excluding
the context section and starting the wrapper after the live statistics panel
would leave the page's opening "why" and context headings outside the section
index, introduce a second sticky chrome mid-page, and still fail the real
heading-marker requirement because the shared heading primitives do not expose
a heading data-attribute prop.

No source edit was made rather than shipping a partial or conflicting sticky
system. A future pass can add this page once the shared owners resolve the
pinned-offset contract and heading data-attribute support.
