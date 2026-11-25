# `/admin/students` (admin-students) page-fix report

## Files changed

- `app/admin/students/page.tsx`
  - Removed unused `bio` and `contact_email` from the client row mapping
    (`:69` area). Kept `cv_path` because the current working tree renders a
    visible "CV on file" indicator from it (see deliberate non-changes).
- `app/admin/students/admin-students-client.tsx`
  - Removed the unused `bio` and `contact_email` fields from `AdminStudent`
    (`:36-42`) and documented why `cv_path` stays.
  - A11y-A1: derived one `displayName` per row at `:349`
    (`s.full_name?.trim() || 'Unnamed student'`) and used it for both the
    select/deselect `aria-label` (`:367`) and the visible heading (`:402`).
    This mirrors the founder picker fallback already in the file.
  - A11y-A2: status banner now uses `role={status.ok ? 'status' : 'alert'}`
    (`:278`) so failures interrupt politely-announced success messages,
    matching the `CopyButton` precedent at
    `components/interactive/copy-button.tsx:86-93`. Message text is unchanged
    and no second hidden live region was added.
  - A11y-A3: raised the four controls called out by the audit to the route's
    own 44px contract — filter buttons (`:262`, `min-h-11`), select-all
    (`:295`, `min-h-11`), row select (`:369`, `min-h-11 min-w-11`) and verify
    toggle (`:452`, `min-h-11`). Existing focus rings were preserved.

No other file was edited. Note: the dirty working tree already contained
substantial in-scope improvements in these two files before this pass
(server-side role recheck and `loadError` retry state in `page.tsx`, plus
per-row pending state, try/catch mutation feedback, rank validation,
`aria-busy`, and empty/error/retry UI in the client). Those edits are user
work and were preserved untouched; the bullets above are only the changes
made by this fix pass.

## Checks performed

- Read in full before editing: `reports/page-fixes/MANIFEST.md`,
  `reports/page-audits/admin-students.md`, relevant sections of
  `reports/page-audits/CONSOLIDATED.md`, `AGENTS.md`, `design/brand-system.md`,
  `design/brand-guidelines.md`, `design/voice-guide.md`, `lib/design-tokens.ts`,
  `app/globals.css`, and `reports/page-fixes/home.md` for report format.
- Read the installed Next.js 16 guides for the APIs and boundaries touched:
  `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`,
  `05-server-and-client-components.md`, `07-mutating-data.md` and
  `10-error-handling.md`. No deprecated API was introduced; the page stays a
  Server Component and the client keeps its `'use client'` interactivity.
- Source verification of the U1 payload: `lib/neon-data.ts:514-550`
  (`StudentProfileRow` / `mapStudentProfile`) confirms every remaining mapped
  field exists. `cv_path` is consumed at `admin-students-client.tsx:436`;
  `bio` and `contact_email` have no consumer in either owned file.
- Database verification: `listAdminStudents` (`lib/neon-data.ts:658-669`),
  `listAllApplicationStudentIds` (`:481-489`), `mapStudentProfile` (`:532-550`)
  and `replaceAdminShortlist` (`:835-882`) were read against `neon/schema.sql`
  (`:1-101`). All traced SQL uses tagged-template parameters (no injection),
  and shortlist deletes are scoped to `source = 'admin'`. Findings are routed
  below.
- `node_modules/.bin/eslint.cmd app/admin/students/page.tsx
  app/admin/students/admin-students-client.tsx` — exit code `0`, no findings.
- Reviewed `git diff` for both owned files. No full `next build`, `npm test`,
  dev server or browser run (per `MANIFEST.md:50-51`). Runtime behavior was
  therefore not verified; the earlier audit also could not reach a dev server.

## Workflow findings routed to the workflow owner

- **W1 — shortlist generation does not verify founder role or project
  ownership** (`app/actions/admin-students.ts:94-95,116-117,154`). The action
  checks only non-empty `founderId`/`studentIds`, then uses generic
  `listProfilesByIds` and `getProject` without checking `role === 'founder'` or
  `project.founder_id === founderId` before `replaceAdminShortlist`. The client
  picker filter is not a server boundary. Route to workflow owner: require
  `getProfile(founderId)?.role === 'founder'` and, when `projectId` is set,
  `project.founder_id === founderId`, rejecting before any text or rows are
  written; add server tests for both rejects. (Out of scope: `app/actions/**`.)
- **W2 — stale select-all comment in E2E test**
  (`tests/e2e/admin-flow.test.ts:47`). The comment claims the select-all button
  has no `aria-label`, but it uses visible text "Select all shown" / "Deselect
  all" at `admin-students-client.tsx:295-304`. Route to workflow owner: fix the
  comment and add a `getByRole('button', { name: 'Select all shown' })` step if
  bulk selection needs coverage.
- Verified controls that are **not** findings: unauthenticated/role-area
  redirects in `proxy.ts:100-134`; admin role rechecks in `page.tsx:43-47` and
  `app/actions/admin-students.ts:29-40,47-48,68-69,91-92`; rank validation and
  optimistic verification rollback in the client (`:141-199`, pre-existing);
  CV links served through `/api/cv/[id]` rather than signed URLs embedded in
  exported text.

## Database findings routed to the database owner

- **D1 — shortlist replacement is not transactional**
  (`lib/neon-data.ts:842-878`; the code comment at `:842-846` acknowledges a
  partial failure). Upsert and stale-row delete are separate statements. Route
  to database owner: wrap both in one `sql.begin` transaction and revalidate
  only after commit; add a forced-delete-failure test.
- **D2 — `APP_URL` can silently produce localhost CV links**
  (`lib/env.ts:8-11,34-36` and `app/actions/admin-students.ts:110-113`). Route
  to database/platform owner: require `NEXT_PUBLIC_APP_URL` in production or
  reject a localhost origin during shortlist generation; add a link-string unit
  test and deploy-time env check.
- **D3 — Neon schema intentionally has no RLS**
  (`neon/schema.sql:1-4,65-100`). Route to database owner: keep mandatory
  server-side relationship checks (W1) and atomicity (D1); if supported, add a
  DB constraint for "project belongs to founder" / "founder has founder role",
  otherwise document the app-layer-only trust boundary.
- **U2 — unbounded roster and application reads**
  (`lib/neon-data.ts:658-665`, `:481-489`; full client-side filtering/rendering
  at `admin-students-client.tsx:98-117,348-472`). Route to database owner:
  server-side pagination with a total count (or an explicit decision to
  virtualize), keeping search/filter state in the URL. Not a confirmed failure
  at current data volume.

## Deliberately not changed

- **`cv_path` kept in the client payload.** The audit recommended removing it
  with `bio`/`contact_email`, but the current working tree uses it for the
  visible "CV on file" indicator at `admin-students-client.tsx:436`. Removing
  it would break that feature. Only the two truly unused PII fields were
  dropped.
- **Oversized avatar.** No avatar element exists in either owned file, so
  there was nothing to resize here. "Status feedback" was addressed through
  the A11y-A2 live-region fix; the file already had a success/failure banner.
- **Pagination / virtualization.** Requires server-side query work (`U2`) and
  would be a larger rewrite than the manifest's "keep diffs small" allows;
  routed instead of implemented.
- **Shared files.** No edits to `app/actions/**`, `lib/neon-data.ts`,
  `lib/env.ts`, `neon/schema.sql`, `proxy.ts`, tests, `app/globals.css` or
  `lib/design-tokens.ts`. No new dependencies, gradients, violet, emoji or
  palette changes were introduced.
- **Report status.** `reports/page-audits/INDEX.md` is unchanged; moving this
  route from `pending` to `done` belongs to the orchestrator.
