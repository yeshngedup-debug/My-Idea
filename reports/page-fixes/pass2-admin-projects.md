# pass2-admin-projects — second-pass verification

Scope: `/admin/projects`. Only `app/admin/projects/page.tsx`,
`app/admin/projects/projects-client.tsx`, and this report were open for editing.
The dirty worktree was treated as the source of truth. No shared file, other page,
other report, `MANIFEST.md`, phase-2 report, route, or dependency was changed.

Skills loaded: `verify-pagination` and `frontend-a11y`.

## Features verified

Verification was source-based. No dev server or browser session was started, so
runtime rendering and live keyboard focus were not asserted.

- **Admin access fails closed.** `app/admin/projects/page.tsx:24-49` verifies the
  Supabase session with `getUser()`, redirects a missing session to `/login`,
  rechecks the Neon role with `getProfileRole()`, and redirects a known non-admin
  to that role's own workspace. Session, role, and data failures set `loadError`,
  clear `rows`, and render an error-only panel with a retry button
  (`projects-client.tsx:66-96`). No admin data is rendered on any failure path.
  A null role is sent to `/student`, whose own guard shows a setup notice and
  renders no student data (`app/student/page.tsx:122-133`).
- **Filters do not silently hide stored rows.** The five `FILTERS` values
  (`projects-client.tsx:22-28`) match the database CHECK constraint at
  `neon/schema.sql:25`. "All" returns every loaded row, each other filter selects
  from the same array, and the visible count is derived from that array
  (`projects-client.tsx:61-64,107-110`). An empty filtered result offers
  "Show all projects" instead of looking like an empty database
  (`projects-client.tsx:127-143`). The count is in a `role="status"`
  `aria-live="polite"` region (`projects-client.tsx:123-125`), so filter changes
  are announced.
- **Pagination is absent, not broken.** There is no pagination control in either
  owned file. Every row comes from one server-side read
  (`app/admin/projects/page.tsx:53`). Per `verify-pagination`, the second page,
  row overlap, and end-of-list request were **not exercised** and are reported as
  unknown, not passed. The unbounded query is routed below.
- **Counts are honest for this client-side view.** The page does not display a
  server total it has not fetched. "Showing all N projects" uses `rows.length`;
  a filtered count uses `filtered.length`. Both are exact for the loaded set.
- **No broken detail links exist.** A repository search found no `/admin/projects/`
  links, and the route directory contains only the two owned files. Project titles
  wrap in full and carry `title={row.title}` (`projects-client.tsx:152-157,203-208`).
  There is no link to a missing route.
- **No status action exists on this page.** The route is a read-only list. The
  shared founder status action is separate and is reviewed in routed findings.
- **Accessibility affordances are present.** The filter is a labelled `role="group"`
  of real buttons with `aria-pressed`, 44px minimum height, and a visible focus
  ring. Arrow, Home, and End now select through the shared control's explicit
  `selectOnArrow` prop, keyed by `option.value`, so selection follows focus
  without a page-owned duplicate handler. Status uses text plus an `aria-hidden`
  dot, never color alone. Retry and "Show all projects" buttons are native
  buttons, at least 44px high, with visible focus styles. Table headers use
  `scope="col"` and the table has an accessible name. Headings run `h1` to
  hidden `h2` to `h3`. Mobile and desktop row sets are hidden by
  `display: none` at the opposite breakpoint, so only one set enters the
  accessibility tree.
- **Design stays on system.** The owned files use the warm paper, forest,
  vermilion, and amber values. No violet, gradient, emoji, new dependency, or
  wholesale repaint was introduced.

## Fixes made

- `app/admin/projects/projects-client.tsx`
  - Replaced the local `handleFilterKeys` wrapper and its `KeyboardEvent` import
    with `selectOnArrow` on `SegmentedControl`. The shared control now exposes
    that opt-in behavior and derives the target from `option.value`, so the
    page-owned handler is redundant and brittle. Arrow/Home/End selection and
    native Enter/Space selection are unchanged for users.
  - No visual or copy change was needed. Existing phase-1 fixes for tokenized
    badges, full title wrapping, error-only loading, and server-side admin
    rechecks were preserved.
- `app/admin/projects/page.tsx` was read and left unchanged in this pass.

## Checks performed

- Read `AGENTS.md`, the Next.js 16 guides for layouts/pages, server and client
  components, mutating data, and error handling, plus
  `design/brand-system.md`, `design/voice-guide.md`, `lib/design-tokens.ts`,
  `app/globals.css`, the audit, manifest, and all four relevant fix reports.
- Re-read current source instead of trusting audit line numbers. Verified
  `FILTERS` against `neon/schema.sql:25`, the admin gate against
  `proxy.ts:27-36,121-138`, and the shared control against
  `components/interactive/segmented-control.tsx:19-24,37,72`.
- `npx eslint app/admin/projects/page.tsx app/admin/projects/projects-client.tsx`
  exited 0 with no findings.
- `npx tsc --noEmit --pretty false` exited 0 with no findings.
- `git diff --check -- app/admin/projects/page.tsx app/admin/projects/projects-client.tsx`
  exited with no whitespace errors. Git commands used for review were read-only.
- No `next build`, `npm test`, dev server, or browser tooling was run, as
  required by the manifest.

## Routed findings

### Workflow and database owners

- **Project status update can report success after zero rows changed.**
  `lib/neon-data.ts:271-285` runs the owner-scoped `UPDATE` and returns `void`
  without checking how many rows were affected. `app/actions/projects.ts:171-180`
  therefore returns `{ ok: true, message: 'Project status updated.' }` even if a
  concurrent ownership or existence change reduces the match count to zero.
  Recommended fix for the shared owners: make `updateProjectStatusRow` return
  the affected row count or throw on zero, and have the action treat zero rows as
  an authorization or staleness failure. Not edited here because both files are
  shared.
- **Unbounded and over-fetching admin list query.**
  `lib/neon-data.ts:344-357` selects every project and all mapped columns, while
  this page uses only `id`, `title`, `status`, `created_at`, and `founder_id`.
  Recommended fix for the database owner: add a narrow list helper, a bounded
  `LIMIT` or cursor pagination, and a supporting index after checking the query
  plan. A silent cap in this page would hide real projects, so none was added.
- **Duplicate row markup.** `projects-client.tsx:145-172` and `:173-224` render
  the same visible rows twice, with one set hidden by CSS at each breakpoint.
  This is acceptable for small bounded lists. The database owner should pair a
  paginated query with a single responsive row representation.

### Resolved prior findings, not re-routed

- `components/interactive/segmented-control.tsx:19-24,37,72` now exposes
  `selectOnArrow`. The page-owned wrapper flagged in phase 1 was removed in this
  pass.
- `components/layout/workspace-page-heading.tsx:21` now uses token colors. The
  off-token `text-[#8a5a00]` finding is stale.
- `proxy.ts:27-36,121-138` now distinguishes a failed role lookup from a student
  role. The earlier "failed lookup sends admins to /student" finding is stale,
  and this page's own guard also fails closed.

## Deliberate non-changes

- **No admin project-detail route or link was added.** No such route exists, and
  adding one would introduce a new route outside this page's ownership and
  outside the task constraint. Full title wrapping makes the value reachable.
- **No `loading.tsx` was added.** The file is not in this route's ownership list.
  Empty and error states are already handled in the owned client component.
- **No status controls were added to the admin list.** There is no admin status
  action in the current workflow, and adding one would be new behavior rather
  than a second-pass fix. The shared founder action concern is routed above.
- **No pagination or row cap was added in the owned files.** That would hide real
  rows until the database owner defines a paging contract.
- **No locale refactor.** `en-GB` date formatting remains future-proofing only.
  The app renders `lang="en"` and has no locale switcher.
- **No shared file, other page, other report, or manifest was touched.** All
  pre-existing uncommitted work was preserved.
