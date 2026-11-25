# Pass 3 — `/faq` sticky section headings

**Date:** 2026-11-25
**Scope:** Decide whether `/faq` should use `StickySectionHeadings`; implement if suitable.

## Decision

Implemented. `/faq` now uses the shared two-row sticky heading component.

The page previously used `PinnedHeadingSection` for each cluster. That component pins a heading at `lg:top-24`, while `StickySectionHeadings` sticks at `top-16`. Keeping both would stack two sticky layers under the 64px site header and risk overlap with the section index. The per-cluster pinned heading was therefore replaced by a static two-column grid; the new sticky bar is the only sticky navigation layer. The FAQ copy, icons, heading text, IDs, disclosure questions, photo, CTA, metadata, JSON-LD, and all pre-existing uncommitted work were preserved.

## Changed files

- `app/faq/page.tsx`
  - Replaced the `PinnedHeadingSection` import with `StickySectionHeadings` and the `StickySection` type.
  - Added `stickySections`, derived from the existing `clusters`, so labels stay in sync with the visible `<h2>` text.
  - Wrapped the cluster list in `StickySectionHeadings`.
  - Moved each cluster `id` from `Chapter` to an inner `<div id={cluster.id} data-sticky-section>` so the shared CSS scroll margin applies to the actual anchor target without duplicate IDs. `Chapter` keeps `aria-labelledby` pointed at the unchanged `${cluster.id}-heading` element.
  - Replaced `PinnedHeadingSection` with a plain responsive grid: static heading column and content column.
- `reports/page-fixes/pass3-faq.md`
  - Added this report.

No shared components, CSS, tokens, layout, actions, database files, or tests were edited.

## Sticky sections wired

The component receives `title="Frequently asked questions"`, `eyebrow="Answers by topic"`, and `navLabel="FAQ topics"`.

| Section ID | Nav label | Scroll target |
| --- | --- | --- |
| `getting-started` | The basics | `<div id="getting-started" data-sticky-section>` |
| `profiles-and-projects` | Profiles and projects | `<div id="profiles-and-projects" data-sticky-section>` |
| `shortlists-and-payments` | Shortlists, payments and launch | `<div id="shortlists-and-payments" data-sticky-section>` |

The shared stylesheet gives these targets `scroll-margin-top: 10.5rem` on large screens and `9.5rem` below `1024px`, clearing the site header plus both sticky rows. Active-section state is driven by the existing `StickySectionHeadings` scroll/resize observer using the same IDs.

## Checks

- Read installed Next.js guides before editing:
  - `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
  - `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- Reviewed `components/layout/sticky-section-headings.tsx`, its CSS module, `components/layout/pinned-heading-section.tsx`, `components/marketing/guides/primitives.tsx`, brand/voice docs, design tokens, and `app/globals.css`.
- Ran only the allowed check:
  - `npx eslint app/faq/page.tsx` — clean, no findings.
- Reviewed `git diff -- app/faq/page.tsx` to confirm the existing uncommitted FAQ work remained intact and only the sticky-section wiring changed in this pass.
- Did not run tests, build, `tsc`, dev server, or a browser check, per instruction. Visual/sticky behaviour has not been verified in a running app.
- No commit and no destructive git command were run.

## Owner-routed issues

- **Non-blocking, shared design-system owner:** `StickySectionHeadings` references `var(--color-surface)` for hover and active nav backgrounds, but `--color-surface` is not defined anywhere in the repo. `app/globals.css` defines `--color-card: #fffefa`, which appears to be the intended value. This was not changed here because the task forbids editing shared components or CSS. The shared component/CSS owner should add or remap the token.
- **Implementation note, page owner:** `Chapter` does not accept arbitrary `data-*` attributes. Putting the id and `data-sticky-section` on an inner wrapper is the smallest page-local way to satisfy the shared component contract without changing the shared primitive.

## Skip rationale

Not applicable: the change was implemented. The reason for not keeping the old `PinnedHeadingSection` alongside the new component is recorded in the Decision section above.
