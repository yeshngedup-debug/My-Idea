# Page fixes — `/founder/projects/[id]` (founder-project-detail)

Per `reports/page-fixes/MANIFEST.md`. Only the four owned route files and this
report were in scope; two owned route files needed edits. The dirty working tree
was treated as source of truth. No `git checkout`, `git reset`, `git stash`,
`git clean`, full build, test suite or dev server was run.

## Files changed

### `app/founder/projects/[id]/page.tsx`

- **U1 — malformed route ids now stop before the database.** Added
  `UUID_PATH` and `if (!UUID_PATH.test(id)) notFound();` immediately after
  `await params`. `/founder/projects/not-a-uuid` can no longer reach
  `getProject(id)` and produce a `NeonDataError` / perpetual loading state.
- **U1 — data failures are routed to the existing boundary with generic UI
  copy.** `readProject()` and `readApplicants()` log the original error on the
  server and throw a short generic `Error`, so the route still renders
  `app/founder/projects/[id]/error.tsx` but does not hand raw database text to
  the client. Ownership/missing-project checks remain `notFound()` outside the
  try blocks, so 404 behaviour is unchanged.
- Existing session guard, founder-ownership check and project/applicant field
  mapping were left intact.

### `app/founder/projects/[id]/project-detail-client.tsx`

- **U2 — status control sets now have accessible group context.** The project
  buttons are wrapped in `role="group" aria-label={"Project status for " + title}`;
  each applicant's four buttons are wrapped in
  `role="group" aria-label={"Applicant status for " + name}`. Native buttons,
  visible labels, `aria-pressed`, disabled-current behaviour and focus rings are
  unchanged. No custom keyboard handling was added.
- **W1 client mitigation — successful status announcements now name the
  subject and new state.** Added `projectStatusLabel()` and
  `applicantStatusLabel()` helpers and changed the two mutation handlers to
  emit, for example, `Project status updated: Atlas Portal is now In review.`
  and `Applicant status updated: Sonam is now Shortlisted.`. Failure messages
  still come from the shared action. The existing single local
  `role="status"` / `role="alert"` switch is the only announcement path.
- No colours, gradients, emoji, dependencies or copy outside the status
  messages were introduced.

### `app/founder/projects/[id]/error.tsx` and `loading.tsx`

- No edits. The error boundary already provides a generic message, retry and
  back link; the loading state already uses `role="status"`, `aria-busy` and
  `motion-reduce:animate-none`.

### `reports/page-fixes/founder-project-detail.md`

- Added this report.

## Checks performed

- Read `reports/page-fixes/MANIFEST.md` in full and followed its ownership,
  palette, reporting and no-build/no-test rules.
- Read `AGENTS.md`, the relevant Next 16 guides
  (`01-getting-started/03-layouts-and-pages.md`,
  `05-server-and-client-components.md`, `07-mutating-data.md`,
  `10-error-handling.md`) and the `error.js` API reference before editing.
- Read `reports/page-audits/founder-project-detail.md`, the relevant
  `reports/page-audits/CONSOLIDATED.md` sections, `design/brand-system.md`,
  `design/brand-guidelines.md`, `design/voice-guide.md`,
  `lib/design-tokens.ts` and `app/globals.css`.
- Source-verified U1, U2, W1 and D1 against the current files; the audit leads
  were still present. Also verified the shared status whitelists, ownership
  checks and revalidation in `app/actions/projects.ts:137-213`, the queries in
  `lib/neon-data.ts:242-250,252-262,395-422,457-479`, the schema constraints
  in `neon/schema.sql:18-40,87-92`, and `app/not-found.tsx` as the global
  not-found target.
- `node_modules/.bin/eslint.cmd` on the four owned TSX files — clean, no
  findings.
- `git diff --check` on the four owned TSX files — no whitespace errors; Git
  emitted only its usual warning that LF working copies will become CRLF next
  time Git touches these files.
- Reviewed `git diff` for the owned files. It also contains substantial
  pre-existing user work (expanded header comment, pinned heading section,
  `h1`→`h2`, colour/label tweaks, `aria-busy`, `role="status"/"alert"` switch,
  CV link `sr-only` text). None of that pre-existing work was altered by this
  pass.

## Workflow findings routed to the workflow owner

These need shared files and are **not** fixed here.

- **W1 (MED) — shared status actions still return generic success strings.**
  `app/actions/projects.ts:173` returns `"Project status updated."` and
  `:212` returns `"Applicant status updated."`. The owned client now supplies
  subject and new state for successful announcements, but other present or
  future callers still receive context-free strings.
  **Recommended fix (workflow owner):** include the subject and resulting
  status in the action result (for example,
  `Applicant status updated: {full_name} is now {label}.`) or return structured
  `{ subject, status }` data and let each client format it. Keep one live-region
  announcement per mutation.

Verified passing on this route, not routed:

- `app/actions/projects.ts:137-138` whitelists the same four project and four
  applicant statuses used by the client and by the DB constraints.
- `app/actions/projects.ts:152-162,188-201` checks authentication and project
  ownership before both status writes; `:170-172,209-211` revalidate the
  affected paths.
- The CV links still target the relationship/order-checked proxy at
  `app/api/cv/[id]/route.ts`.

## Database findings routed to the database owner

Fields/query verification (read-only):

- `getProject` at `lib/neon-data.ts:242-250` is a parameterized
  `where id = ${id} limit 1` read; with the new route-level UUID guard,
  malformed ids no longer reach it. `listProjectApplicants` at `:457-479` is
  parameterized by `project_id` and returns the page's applicant fields.
- `public.projects` and `public.applications` have UUID ids, constrained status
  text and the expected `founder_id` / `project_id` foreign keys
  (`neon/schema.sql:18-40`). No stale or unhandled status value was found in
  the client maps.
- `projects_founder_idx`, `applications_project_idx` and
  `applications_student_idx` exist (`neon/schema.sql:87-89`).
  `listProjectApplicants` is unbounded but project-scoped and index-backed; no
  pagination change was required for this fix. If applicant volume grows, the
  database owner can add a bounded/paginated helper.

Finding for the database owner:

- **D1 (LOW) — unscoped low-level application status helper.**
  `lib/neon-data.ts:412-422` issues
  `update public.applications set status = ${status} where id = ${id}` with no
  founder or project predicate. `neon/schema.sql:1-4` confirms authorization
  lives in application code, not Neon RLS. The only current caller,
  `app/actions/projects.ts:193-204`, loads the application and verifies the
  parent project's `founder_id` first, and the project helper at
  `lib/neon-data.ts:252-262` already includes `founder_id`; no current bypass
  was found.
  **Recommended fix (database owner):** accept `founderId` and optionally
  `projectId`, scope the update through `public.projects where founder_id =
  ${founderId}`, rename it to `updateApplicationStatusForFounder`, update the
  single call site, and add a test that a valid application id with the wrong
  founder id updates zero rows.

## Deliberately not changed

- **W1's shared action source and D1's data-layer predicate** — both live in
  files owned by other phases; they are routed above instead of being partially
  patched.
- **`app/founder/projects/[id]/error.tsx` and `loading.tsx`** — already
  provide the recovery and loading behaviour the audit asked for; changing
  them would add churn without fixing a finding.
- **Pre-existing user work in the two edited files** — preserved exactly as
  found except for the targeted additions listed above.
- **Shared `StatusTimeline`, `Badge`, layout and heading components** —
  design-system-owned and verified as passing for this route; no duplicated or
  rewritten component was introduced.
- **No regression test file was added** — test ownership sits with the
  orchestrator and shared owners. The recommended check is that
  `/founder/projects/not-a-uuid` ends in a not-found or error state, never a
  perpetual loading state.
- No production behaviour claim is made; the audit's raw dev error was not
  reproduced after the fix because no dev server was started.
