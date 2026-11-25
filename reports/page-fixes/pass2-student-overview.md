# `/student` (student-overview) pass-2 feature-completeness report

Scope: source-only second pass on the current dirty worktree. The worktree was
treated as the source of truth; no destructive git command, dependency install,
full build, full test suite, dev server, or browser tool was used. Only
`app/student/page.tsx` and this new report were edited in this pass. Phase-1
uncommitted work was preserved.

## Files changed

- `app/student/page.tsx`
  - Wrapped `listStudentApplications()` at `:137-158` in a local `try/catch`.
    A Neon read failure now returns a `WorkspaceNotice` with plain copy instead
    of throwing into the root error boundary. This closes the page-side part of
    the old W2 lead for the applications read.
  - Changed the notice's `Try again` control at `:62-70` from a same-route
    client `Link` to a native anchor. A full reload is what actually retries
    the failed server render; a cached client transition to `/student` can do
    nothing. Focus ring and `min-h-11` target are unchanged.
  - No shared file, route, or dependency was changed.
- `reports/page-fixes/pass2-student-overview.md` (new). No other file was
  edited in this pass.

## Features verified in current source

- **Role gate (`:101-135`).** Identity comes from `supabase.auth.getUser()`;
  role comes from `getProfileRole(user.id)` after a verified session. Missing
  user redirects to `/login`; known founder/admin redirects to their own home;
  null role and role-read failure return separate notices before any student
  hero, stats, rows, or shortcuts render. `proxy.ts:121-138` now redirects null
  roles to `/` and lets failed lookups fall through to this page guard, so the
  old "non-student sees zeroed dashboard" lead is stale.
- **Honest counts (`:160-171`).** Applications sent counts all rows; Awaiting
  response counts only `pending`; Accepted counts only `accepted`. The counts
  are computed before `.slice(0, 5)` and do not depend on the recent-row slice.
  Labels match the values; no detail text promises an unverified rule.
- **Recent rows and status links (`:218-270`).** `listStudentApplications()`
  orders by `created_at desc` (`lib/neon-data.ts:472-481`), the page renders at
  most five rows, and each row carries project title, status text, and a date.
  `APPLICATION_FILTER_VALUES` (`:28-34`) exactly matches the receiving
  allow-lists at `app/student/applications/page.tsx:17-23` and
  `applications-client.tsx:27-35`: `all`, `pending`, `shortlisted`, `accepted`,
  `rejected`. A row with any other status falls back to the unparameterized
  list. The colour dot is `aria-hidden`, so status is not conveyed by colour
  alone.
- **Dates (`:82-99,249-251`).** `formatAppliedDate()` uses
  `Asia/Thimphu`, omits the year only for the current year, and returns
  "date unavailable" for an invalid value. The round-trip concern is resolved
  in `lib/neon-data.ts:39-44,391-404`, where `created_at` is normalized with
  `isoString()`.
- **Empty state (`:218-232`).** Zero applications show a short explanation and
  a `Browse open projects` CTA. `View all` is hidden when there are no rows, so
  there is no dead link. The applications list has its own empty state at
  `applications-client.tsx:86-103`.
- **Error and loading states (`:41-80,112-135,151-158`).** Role-read, missing
  role, and application-read failures each have a labelled section, one `h1`,
  plain copy, and two real recoveries. No server-rendered notice uses
  `role="alert"`. The root boundary (`app/error.tsx:19-64`) is route-aware and
  sends `/student` failures back to `/student`. `app/student/loading.tsx:1-5`
  uses the shared `WorkspaceLoading` skeleton with `role="status"` and a
  matching page shape.
- **Accessibility and palette.** The hero owns the page `h1`
  (`workspace-hero.tsx:32-38`); figures and shortcuts use labelled sections/nav
  (`:203-277`). All links have `focus-visible` rings and at least `min-h-11`
  targets, including the new native anchor. The page uses the warm-paper,
  forest, vermilion, and amber values already used by the dashboard; no new
  colour, gradient, emoji, or dependency was added.
- **Profile prompt (`:190-195,278-292`).** "Update profile" and "Keep your
  details and CV current" are guidance, not a completeness claim. The overview
  does not show a percentage or assert that a profile is complete, so no
  unverified completeness metric is presented here. The real completion UI is
  owned by `app/student/profile/profile-form.tsx`.

## Checks performed

- Read `AGENTS.md`, `reports/page-fixes/MANIFEST.md`, the original audit, the
  phase-1 fix report, and the three phase-2 shared reports before editing.
- Read `design/brand-system.md`, `design/brand-guidelines.md`,
  `design/voice-guide.md`, `lib/design-tokens.ts`, and `app/globals.css` for
  copy and palette constraints.
- Read installed Next.js 16 docs for layouts/pages, linking/navigating,
  server/client components, mutating data, and error handling. No mutation,
  client boundary, or dynamic route prop is used on this page.
- Source-verified the role gate against current `proxy.ts:121-138`, the error
  recovery against current `app/error.tsx:19-64`, the loading state against
  `app/student/loading.tsx` and `components/layout/workspace-loading.tsx`, and
  the status/date contracts against `neon/schema.sql:35-55`,
  `lib/neon-data.ts:39-44,391-404,467-486`, and the applications routes.
- `npx eslint app/student/page.tsx` — clean, exit 0, no warnings.
- `npx tsc --noEmit --pretty false` — clean, exit 0.
- Not run by design: `next build`, `npm test`, dev server, or browser tooling.

### Not verified without runtime proof

- Actual injection of a Supabase or Neon outage; the error notices are
  source-verified only.
- Live date output with real application rows.
- Keyboard/screen-reader announcement and visual focus behavior in a running
  browser.
- The status deep link opening the applications list with the matching filter
  pressed; the server and client allow-lists and filter state were verified in
  source only.
- The loading skeleton's live timing and any streaming behavior.

## Workflow findings routed to owners

- **Workflow owner — `proxy.ts:121-138`.** A failed Neon role lookup returns
  the response silently. The page now fails closed with a retryable notice,
  but the proxy still has no explicit infrastructure-failure state. Recommended
  fix: distinguish `ok === false` from a known null role in the proxy and
  return a route-aware retry/error response for the failure case, while keeping
  the current null-role redirect to `/`.
- **Workflow owner — root recovery only.** `app/error.tsx:19-64` correctly
  links `/student` failures to `/student`, but there is still no
  `app/student/error.tsx`. This is acceptable for the shared boundary; if a
  route-specific boundary is added, keep the same plain copy and role-aware
  recovery pattern.
- **Resolved by other owners in the current tree.** The old findings that
  `proxy.ts` defaulted null roles to `/student` and that
  `app/student/profile/page.tsx` rendered a student form for null/non-student
  users are stale. Current `proxy.ts:121-138` and
  `app/student/profile/page.tsx:63-95` fail closed.

## Database findings routed to the database owner

- **`lib/neon-data.ts:467-486` — unbounded read still open.**
  `listStudentApplications()` returns every application for the student; this
  overview renders only five at `app/student/page.tsx:235`. Recommended fix:
  add an optional `limit` parameter or a
  `listRecentStudentApplications(studentId, 5)` helper that keeps the
  parameterized `where a.student_id = ${studentId}` predicate, the project-title
  join, and `order by created_at desc`. The applications list route still needs
  the full result and should remain unbounded. No silent default cap was added.
- **`neon/schema.sql:35-55` — status and history are current.** Application
  values are `pending`, `shortlisted`, `accepted`, `rejected`; the overview's
  allow-list and counts use only these values. IDs and timestamps now come from
  explicit columns and `isoString()`, so the old `"undefined"` ID and locale
  date leads are resolved.
- **`neon/schema.sql:1-4` — no-RLS posture is an architecture-wide risk.**
  This route adds no bypass: the session user ID is passed to a parameterized,
  student-scoped query, and the role is re-read before the data call. No new
  index is needed; the existing student index supports the read.

## Deliberately not changed

- Shared files (`proxy.ts`, `lib/neon-data.ts`, `neon/schema.sql`,
  `app/error.tsx`, `app/globals.css`, and shared components) are outside this
  route's ownership; findings are routed above instead of partially patched.
- No `limit` was added to the applications read because the shared helper does
  not accept one and the sibling list route needs the full set.
- No profile completeness percentage was added to the dashboard. The profile
  form owns the real checklist, and adding a second copy here would need a new
  read and a shared rule; the current prompt makes no false claim.
- No `role="status"` or `role="alert"` was added to a server-rendered notice.
  These states are present on load, not results of a user action.
- The `View all` link and `Applications` shortcut keep the unparameterized
  list URL; only status-bearing recent rows deep-link to a filter.
- No full build, test run, dev server, or browser verification was started, per
  `reports/page-fixes/MANIFEST.md:50-51`.
