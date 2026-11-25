# Pass 3 — `/for-students` sticky section headings

## Changed files

- `app/for-students/page.tsx`
  - Imported `StickySectionHeadings` and the `StickySection` type from the shared layout component.
  - Added a local `sections` array with five stable ids and short labels.
  - Wrapped the five editorial `Chapter` blocks, leaving `GuideHero` and `CtaBand` outside the sticky section index.
  - Marked each real chapter `h2` with `data-sticky-section`.
  - Replaced the two local `lg:sticky lg:top-24 lg:self-start` title wrappers with `self-start` so their headings cannot sit underneath the new two-row sticky bar.
  - Added no CSS, tokens, dependencies, fake navigation items, or duplicate ids.
- `reports/page-fixes/pass3-for-students.md`: this report.

No shared component, CSS, token, layout, action, database, or test file was edited.

## Sticky sections wired

| Nav label | Target id | Real heading |
| --- | --- | --- |
| Who it's for | `who-heading` | Built for students ready to begin |
| Profile | `profile-heading` | Make your profile complete |
| Close to home | `rooted-heading` | Start close to home |
| Apply | `apply-heading` | Browse, apply, and track |
| Pay | `pay-heading` | Projects list a budget up front |

The wrapper uses `title="For students"`, `eyebrow="Student guide"`, and
`navLabel="Student guide sections"`. The shared component supplies the hairline
border, tinted near-solid sticky surface, quiet active/open state, rotated
caret, press feedback, focus ring, `var(--ease-out)`/`250ms` transitions, and
reduced-motion fallback.

## Checks performed

- Read `AGENTS.md`, the installed App Router guides
  `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
  and `05-server-and-client-components.md`, plus `design/brand-system.md`,
  `design/brand-guidelines.md`, `design/voice-guide.md`, `lib/design-tokens.ts`,
  `app/globals.css`, the guide primitives, the shared sticky component and its
  CSS module, the page audit, and the prior pass report before editing.
- Verified the page is a Server Component rendering a Client Component with a
  serializable `sections` prop; no `"use client"` directive was added.
- Verified all five nav ids match exactly one real `h2` id in the wrapped
  content and that each target carries `data-sticky-section`.
- Verified the two desktop-sticky title columns were the only overlapping local
  scroll primitives; they are now static `self-start` columns. `Chapter`,
  `Reveal`, `GuideHero`, and `CtaBand` remain unchanged.
- Ran `npx eslint app/for-students/page.tsx`; no findings.
- Did not run `npm test`, `npm run build`, `tsc`, a dev server, or browser
  tooling, per the pass scope.

## Workflow findings routed to the workflow owner

- None from this pass. The audit's former “complete before you apply” hard-rule
  mismatch is no longer stated on this page: the preserved copy now says a
  complete profile and CV help founders decide, and one application per project
  is possible. No server-side contract was changed.

## Database findings routed to the database owner

- None. No data claims, queries, schema expectations, or status values changed
  in this pass.

## Issues routed to shared owners

- None. No defect was observed in `components/layout/sticky-section-headings.tsx`
  or `components/layout/sticky-section-headings.module.css`, and neither file was
  edited. The shared component already follows the requested motion and
  accessibility language.

## Skipped rationale

- Not skipped. `/for-students` has five real editorial chapter headings and no
  competing in-page progress nav, so it is a suitable consumer once the two
  local sticky title columns were deactivated in the owned page file.
