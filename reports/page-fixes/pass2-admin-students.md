# `/admin/students` second-pass feature-completeness report

Date: 2026-11-25. Source of truth: the current dirty worktree. Only the two
owned page files were eligible for edits; this pass edited the client file and
created this report. No destructive git command was run.

## Files changed

- `app/admin/students/admin-students-client.tsx`
  - Added bounded client pagination with 12 students per page (`:65`, `:76`,
    `:121-134`). The list now renders `visibleStudents` instead of every
    filtered row (`:387`), and search/filter changes reset to page 1
    (`:253-256`, `:279-282`, `:366-370`).
  - Added a polite "Showing x–y of n students" status line (`:305-310`) and a
    labelled Previous/Next nav with `aria-controls`, disabled bounds and
    `aria-current="page"` (`:521-545`). The list gained the matching
    `id="student-profiles-list"` (`:387`).
  - Changed select-all to act on the visible page and renamed its inverse to
    "Deselect shown" so the label matches the actual scope (`:145-156`,
    `:329-341`).
  - Made "CV on file" a real `/api/cv/[id]` link with `target="_blank"`,
    `rel="noopener noreferrer"`, a descriptive `aria-label`, an underline and a
    44px-minimum target (`:468-478`).
  - Hardened rank saving: duplicate in-flight saves are ignored, decimal ranks
    are normalized locally before/after the write, failed saves restore the
    last known server rank, and clear/save copy no longer reads "Rank cleared
    saved." (`:158-190`).
- `app/admin/students/page.tsx`
  - No additional edit this pass. Verified the existing server-side admin
    recheck, data load, application-count map and `loadError` contract still
    match the client props (`:27-103`).
- `reports/page-fixes/pass2-admin-students.md`
  - New report.

Previous phase-1 fixes remain intact: unused `bio`/`contact_email` are absent
from the client payload, `cv_path` remains for the visible CV affordance,
`displayName` has an "Unnamed student" fallback, the status banner uses
`role={status.ok ? 'status' : 'alert'}`, and consequential controls keep their
44px targets.

## Features verified from current source

- **Admin gate and authorization.** `proxy.ts:19-39,110-137` separates role
  homes, validates the Supabase JWT with `getUser()`, and confines `/admin/*`
  to the admin home while failing closed on an unknown role. The page repeats
  the check at `page.tsx:33-46`; every server action repeats it at
  `app/actions/admin-students.ts:29-40,47-48,68-69,91-92`.
- **Moderation list.** `page.tsx:47-76` loads the roster, all application IDs,
  founders and projects in parallel and computes per-student application
  counts. The client renders searchable/sortable cards with a name fallback,
  college/course/year, up to four skills plus an overflow badge, availability,
  application count, rank input and verified toggle
  (`admin-students-client.tsx:100-119`, `:387-505`).
- **Profiles and CV/proof access.** No `/admin/students/[id]` route exists. The
  only student detail route is founder-only
  (`app/founder/students/[id]/page.tsx:29-37`) and `proxy.ts:128-137` would
  bounce an admin away from it, so no dead profile link was introduced. The
  actionable profile artifact is now the CV link at
  `admin-students-client.tsx:468-478`; `app/api/cv/[id]/route.ts:48-77`
  validates the UUID, requires sign-in, allows admins directly and redirects
  to a freshly signed Storage URL. Generated shortlist text uses the stable
  proxy URL rather than embedding expiring signed URLs
  (`app/actions/admin-students.ts:125-128`).
- **Filters and states.** Search covers name, college and skills; filters cover
  verified, not verified and applied (`admin-students-client.tsx:100-119`,
  `:248-293`). Empty, no-match, load-error and retry states are present
  (`:337-377`). Per-row `aria-busy`, disabled pending controls, and a
  success/failure banner keep mutation feedback explicit (`:307-320`,
  `:387-389`, `:410-427`, `:483-505`).
- **Counts and statuses.** Application counts are derived from
  `listAllApplicationStudentIds()` (`lib/neon-data.ts:526-534`) and shown with
  correct singular/plural copy (`admin-students-client.tsx:463-467`). Stored
  values match the schema: `rank int`, `verified boolean`, shortlist status
  `requested/contacted/hired/rejected`, application status
  `pending/shortlisted/accepted/rejected` (`neon/schema.sql:35-43,57-86`).
- **Loading state.** `/admin/students` inherits `app/admin/loading.tsx:1-5`,
  which renders `WorkspaceLoading`; no local loading file was added.
- **Shortlist workflow.** Selection count, founder/project pickers, generation,
  copy and `.txt` download are wired at
  `admin-students-client.tsx:570-620`. The action now verifies founder role and
  project ownership before writing (`app/actions/admin-students.ts:97-110`)
  and `replaceAdminShortlist()` commits both halves in one transaction
  (`lib/neon-data.ts:909-961`).
- **Accessibility and targets.** Filter chips, select-all, row select, rank,
  verify toggle, CV link and pagination controls are keyboard-operable with
  visible focus rings and at least 44px minimum height/width where required
  (`admin-students-client.tsx:284-291`, `:329-341`, `:404-427`, `:468-478`,
  `:483-505`, `:522-545`).
- **Pagination.** The 12-row page size, clamped current page, "Showing"
  announcement and Previous/Next bounds were traced through the filter/sort
  pipeline. This is **source verification only**: no dev server or browser was
  run, so rendered interaction was not observed.

## Checks performed

- Read the installed Next.js 16 guides before editing:
  `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`,
  `05-server-and-client-components.md`, `07-mutating-data.md` and
  `10-error-handling.md`.
- Re-read `AGENTS.md`, `reports/page-fixes/MANIFEST.md`, the route audit, the
  phase-1 fix report, the shared workflow/database reports,
  `design/brand-system.md`, `design/brand-guidelines.md`, `design/voice-guide.md`
  and the relevant shared source files before treating old findings as leads.
- `npx eslint app/admin/students/page.tsx
  app/admin/students/admin-students-client.tsx` — clean, exit 0.
- `npx tsc --noEmit --pretty false` — clean, exit 0. An intermediate run during
  the pass reported an unrelated `app/founder/projects/error.tsx:34` error; it
  was gone on the final rerun and no edit to that file was made here.
- Source-verified the workflow and database contracts listed above. No live
  database query, mutation, browser run, dev server, `next build` or full
  `npm test` was used (per `MANIFEST.md:50-51`).

## Findings routed to other owners

- **Workflow owner — no open route-specific finding.** The former W1 and W2
  findings are fixed in the current tree: founder/project validation is at
  `app/actions/admin-students.ts:97-110`, and the stale E2E comment is corrected
  at `tests/e2e/admin-flow.test.ts:46-57`. The new rank rollback and pagination
  behavior live entirely in the owned client file, so nothing is routed.
- **Database owner — U2 remains open.** `listAdminStudents()`
  (`lib/neon-data.ts:725-738`) and `listAllApplicationStudentIds()`
  (`lib/neon-data.ts:526-534`) still read the full roster/application set. The
  new client pagination bounds the DOM, not the query or payload. Recommended:
  add a page/cursor plus total-count contract in the shared data layer and move
  search/filter state into the URL before assuming this scales to a large
  roster. No silent cap was added because it would truncate real pages.
- **Database owner — verified fixes, no duplication.** D1 shortlist atomicity
  is now implemented at `lib/neon-data.ts:909-961`; D2 `APP_URL` validation is
  at `lib/env.ts:34-60`; D3 no-RLS remains a documented architecture boundary at
  `neon/schema.sql:1-4`. None was re-reported as a new defect.
- **Design-system owner — no edit.** `app/admin/loading.tsx:1-5` is a shared
  loading boundary and was only inspected.

## Deliberately not changed

- **Server-side pagination.** Implementing it needs the shared Neon query
  contract above; adding a client-only page size here does not claim that the
  unbounded query problem is solved.
- **Admin profile route/link.** No such route exists and founder detail is
  role-gated. Adding a link would create a 404 or a forbidden navigation; the
  CV proxy link is the supported artifact.
- **Shared files and tests.** No edits to `app/actions/**`, `app/api/**`,
  `proxy.ts`, `lib/neon-data.ts`, `lib/env.ts`, `neon/schema.sql`, tests,
  `app/globals.css` or `lib/design-tokens.ts`.
- **Runtime proof.** Browser tooling, a dev server and a full build were
  explicitly out of scope; pagination and CV-link behavior are reported as
  source-verified, not rendered-verified.
- **Palette/dependencies.** Existing warm-paper/forest/vermilion/amber classes
  and existing components were reused; no dependency, gradient, violet or emoji
  was introduced.
- **Report status.** `reports/page-audits/INDEX.md` was not edited; status
  changes belong to the orchestrator.
