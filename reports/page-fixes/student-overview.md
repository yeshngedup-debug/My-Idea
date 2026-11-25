# `/student` (student-overview) page-fix report

## Files changed

- `app/student/page.tsx`
  - Added a page-level role gate using the verified Supabase session and Neon
    role. Unauthenticated users redirect to `/login`; a known founder or admin
    redirects to their own home; a null role gets an account-setup notice; a
    role lookup failure gets a plain error notice. None of these states render
    student hero CTAs, stats, recent applications, or shortcuts. This closes
    audit U1 at `app/student/page.tsx:105-146`.
  - Added `WorkspaceNotice` at `app/student/page.tsx:41-78`. It uses a labelled
    section, a single `h1`, a short plain paragraph, and existing palette and
    focus styles. It has no `role="alert"`.
  - Removed the static `role="alert"` banner. It was present in the initial
    server HTML and was not a user-triggered result. This closes audit U2.
  - Added `formatAppliedDate` at `app/student/page.tsx:80-97`, using
    `Asia/Thimphu` and including the year for applications outside the current
    year. The date line at `app/student/page.tsx:237-239` now uses it. This
    closes audit U3.
  - Wrapped `getProfileRole` in a local try/catch at
    `app/student/page.tsx:110-120`, so a Neon lookup failure no longer throws
    before the page can show a usable recovery state. This handles only the
    page side of W2; the shared proxy behavior is routed below.
  - Added allow-listed status deep links to recent application rows at
    `app/student/page.tsx:25-34,225-232`. When the row status is in the exact
    applications allow-list, the link is
    `/student/applications?status=<status>`. Any other status keeps the plain
    `/student/applications` link. This closes W1 on this page after the
    `student-applications` agent added server/client query support.
- `reports/page-fixes/student-overview.md` (this report). No other file was
  edited.

The working tree was dirty. The existing uncommitted role-check work in
`app/student/page.tsx` was treated as authoritative user work and built on, not
reverted.

## Checks performed

- Read in full before editing: `reports/page-fixes/MANIFEST.md`,
  `reports/page-audits/student-overview.md`,
  `reports/page-audits/CONSOLIDATED.md` (student summary and cross-cutting
  sections), `AGENTS.md`, `design/brand-system.md`,
  `design/brand-guidelines.md`, `design/voice-guide.md`,
  `lib/design-tokens.ts`, and `app/globals.css`.
- Read the installed Next.js 16 docs relevant to this Server Component and the
  APIs touched: `01-getting-started/03-layouts-and-pages.md`,
  `05-server-and-client-components.md`, `07-mutating-data.md`,
  `10-error-handling.md`, `16-proxy.md`, and `02-guides/data-security.md`.
  No server action, mutation, client boundary, or dynamic route prop is used
  here. `redirect` from a Server Component page is valid.
- Verified `getProfileRole` and `listStudentApplications` in `lib/neon-data.ts`,
  and the `applications`, `projects`, and `profiles` tables in `neon/schema.sql`.
- Verified that the read still uses the session user ID, never a URL param, and
  that the query remains parameterized and scoped by `student_id`.
- Verified the applications filter allow-list in
  `app/student/applications/applications-client.tsx:27-35` and
  `app/student/applications/page.tsx:17-23`. Both use the exact set: `all`,
  `pending`, `shortlisted`, `accepted`, `rejected`. The overview mirrors that
  set at `app/student/page.tsx:28-34`.
- Ran `npx eslint app/student/page.tsx` before and after the W1 link change. No
  findings were reported.
- Did not run a full `next build`, `npm test`, or a dev server, per the manifest.
  No runtime or browser verification was performed.

## Workflow findings routed to the workflow owner

- W1 is now fixed on this page. Recent application rows at
  `app/student/page.tsx:225-232` link to
  `/student/applications?status=<status>` when the row status is in the
  allow-list verified at `app/student/applications/applications-client.tsx:27-35`
  and `app/student/applications/page.tsx:17-23`: `all`, `pending`,
  `shortlisted`, `accepted`, `rejected`. Any other status keeps the
  unparameterized `/student/applications` link. The receiving query support was
  implemented by the `student-applications` agent, so no further routing is
  needed for W1.
- W2 remainder, shared role-failure handling. The page no longer throws on a
  role lookup error (`app/student/page.tsx:110-120`), but `proxy.ts:28-34`
  deliberately swallows the same error and `proxy.ts:117-126` defaults a null
  role to `/student`. The workflow owner should share one `safeRole`-style
  helper between proxy and pages, and stop treating a failed lookup as a
  student role.
- Proxy null-role default at `proxy.ts:119` and `proxy.ts:126`. An
  authenticated user with no Neon profile row is still sent to `/student`.
  This page now contains that state with a setup notice, but the workflow owner
  should route null roles to `/` or a dedicated setup route.
- `app/student/error.tsx` does not exist. A route-specific error boundary with
  a link to the user's verified role home remains a shared error-boundary task.
  Per `reports/page-fixes/MANIFEST.md:96`, error boundaries are owned by the
  design-system owner; the role-aware link needs coordination with the workflow
  owner.
- `app/student/profile/page.tsx:82-95` still renders a student heading and a
  static role alert for null or non-student users. I deliberately did not link
  the setup notice to `/student/profile`, because that page would not give a
  clean setup flow. This is owned by the `student-profile` agent.

## Database findings routed to the database owner

- D1, unbounded read. `lib/neon-data.ts:424-437` returns every application for
  the student. This page calls it at `app/student/page.tsx:135` and slices to
  five at `app/student/page.tsx:223`, so the full history is transferred and
  mapped on every overview render. Recommended fix: add an optional `limit`
  parameter to `listStudentApplications` and pass `5` from this page, or add
  `listRecentStudentApplications(studentId, 5)`. Keep the parameterized
  `where a.student_id = ${studentId}` predicate, the project-title join, and
  `order by created_at desc`. Leave the applications list unbounded.
- U3b, suspected date round-trip. `lib/neon-data.ts:366-374` stores
  `created_at: String(r.created_at)`. If the Neon driver returns a `Date`, this
  can pass through a localised `Date.toString()` before this page parses it.
  Not confirmed without a live value. Recommended fix: normalize once in
  `mapApplication` with `new Date(r.created_at).toISOString()`, or select a
  preformatted Bhutan-time string in `listStudentApplications` and render it
  directly.
- No IDOR on this route. `app/student/page.tsx:105` takes the ID from
  `supabase.auth.getUser()`, and `app/student/page.tsx:135` passes that session
  ID to the helper. `lib/neon-data.ts:429-436` scopes the query with a
  parameterized `where a.student_id = ${studentId}`. The role is re-read from
  Neon before any data is fetched. No cross-user read path was found.
- `neon/schema.sql:88` has `applications_student_idx on public.applications
  (student_id)`, which supports the scoped query. No new index is needed for
  this page.
- `neon/schema.sql:39` allows `pending`, `shortlisted`, `accepted`, and
  `rejected`. The stats at `app/student/page.tsx:148-159` count only `pending`
  for "Awaiting response" and `accepted` for "Accepted", while "Applications
  sent" counts all rows. The labels match those counts, so I left them
  unchanged.

## Deliberately not changed

- Shared files: `lib/neon-data.ts`, `proxy.ts`, `app/globals.css`,
  `lib/design-tokens.ts`, `app/error.tsx`, and any error boundary were not
  edited. They are outside this route's ownership.
- `app/student/applications/applications-client.tsx` and
  `app/student/applications/page.tsx` were not edited. Their existing query
  support was verified and consumed from this page. The `View all` link and the
  `Applications` shortcut still use the unparameterized list on purpose.
- No new dependency, gradient, violet, emoji, or wholesale rewrite was added.
  The notice reuses the warm-paper, forest, and vermilion palette already in
  the page.
- No `limit` argument was added to the applications read because the current
  helper does not accept one.
- No dev server, full build, or test run was started.
