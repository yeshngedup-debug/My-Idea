# `/student/projects/[id]` (student-project-detail) page-fix report

## Files changed

- `app/student/projects/[id]/page.tsx`
  - Replaced page-local hardcoded hex classes with existing semantic Tailwind
    roles (`text-body-secondary`, `text-primary`, `text-muted-foreground`,
    `border-border`, `bg-card`, `bg-background`, `ring-accent`). The off-token
    `#4c5a52` is gone.
  - Added UUID shape validation before any auth or Neon read; malformed IDs now
    call `notFound()` instead of reaching a parameterized UUID column.
  - Made the unauthenticated and missing-row paths fail closed with
    `notFound()`.
  - Added a student-visible guard for non-open briefs: a signed-in student may
    open a moved-on project only when `listStudentAppliedProjectIds(user.id)`
    contains that project ID. Other non-open rows get the same `notFound()`
    response as a missing project.
  - Preserved the existing uncommitted `min-w-0`, `break-words` and
    `motion-reduce:transition-none!` work; the readable status text, decorative
    `aria-hidden` dot, back-link focus ring and copy were kept intact.
- `reports/page-fixes/student-project-detail.md` (this report).

## Checks performed

- Read in full before editing: `reports/page-fixes/MANIFEST.md`,
  `reports/page-audits/student-project-detail.md`, the relevant sections of
  `reports/page-audits/CONSOLIDATED.md`, `AGENTS.md`,
  `design/brand-system.md`, `design/brand-guidelines.md`,
  `design/voice-guide.md`, `lib/design-tokens.ts` and `app/globals.css`.
- Read the installed Next.js 16 guides relevant to this Server Component and
  dynamic route: `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`,
  `05-server-and-client-components.md`, `07-mutating-data.md` and
  `10-error-handling.md`. No client boundary or server action was added.
- Source-verified the current worktree:
  - `lib/neon-data.ts:242-250` confirms `getProject(id)` selects every status;
    `app/student/projects/page.tsx:52-56` confirms students normally see only
    `status = 'open'`.
  - `lib/neon-data.ts:443-455` supplies the existing applied-project-ID read;
    the route uses the server session ID, never a browser-supplied student ID.
  - `neon/schema.sql:18-30` constrains project status to
    `open`/`in_progress`/`review`/`completed` and stores `id` as `uuid`, so the
    new shape guard prevents an invalid UUID cast before the query.
  - `app/student/loading.tsx`, `app/error.tsx` and `app/not-found.tsx` already
    cover dynamic-route loading, unexpected errors and `notFound()`.
- `npx eslint "app/student/projects/[id]/page.tsx"` — passed, no findings.
- Grep for hex literals in the owned page — no matches.
- Reviewed `git diff -- app/student/projects/[id]/page.tsx`; no shared file,
  database file, schema, config or another agent's report was touched.
- No full `next build`, `npm test`, or dev server was run, per the manifest.

## Workflow findings routed to the workflow owner

- **W1 — HIGH — carried, not duplicated.** The detail page still ends after the
  required-skills list and offers no Apply action, no `Sending...` state, no
  `Applied` state and no application-status feedback. Owner:
  `reports/component-relevance-audit.md:42,81-82`; also carried at
  `reports/page-audits/CONSOLIDATED.md:159-160,255-257`. One reusable Apply
  control should close both this route and `/student/projects`.
- Recommended workflow fix: extract the card control at
  `app/student/projects/projects-client.tsx:162-180` into a reusable component,
  place it on the detail page with the same `Apply -> Sending... -> Applied`
  states and `role=status`/`role=alert` feedback, and add
  `/student/projects/[id]` to the `revalidatePath` list at
  `app/actions/projects.ts:131-133` after a successful application. That action
  file and the client component are outside this route's ownership, so no
  Apply UI or revalidation change was attempted here.
- No other route-local workflow defect was found. The back link targets the
  real open-projects listing, `applyToProject` keeps ownership on the server,
  and the detail page has no form, redirect or state transition of its own.

## Database findings routed to the database owner

- **D1 — MED — object visibility basis.** `lib/neon-data.ts:242-250` still
  exposes an unscoped `getProject(id)` for any caller, and
  `supabase/schema.sql:80` names its open-project policy
  `anyone_read_open_projects` while its `using (true)` clause permits every
  status. The route now suppresses rows the signed-in student cannot see, but
  other callers of the shared helper remain dependent on their own checks.
  Recommended shared fix: add a student-scoped read such as
  `getStudentVisibleProject(id, userId)` that requires
  `status = 'open' or exists (application with student_id = userId)`, then let
  the route call that helper. Do not add an open-only filter to `getProject`
  itself; founders and admins need all statuses (`app/actions/projects.ts:116,157,197`,
  `app/actions/admin-students.ts:117`).
- The route-local guard currently calls
  `listStudentAppliedProjectIds(user.id)` only for non-open rows. That helper
  reads all applied project IDs for the student
  (`lib/neon-data.ts:443-455`); a scoped existence query in the helper above
  would avoid returning a growing ID list for this single-record check.
- Positive verification, not findings: `id` reaches SQL only as a tagged
  template parameter; application uniqueness is enforced at
  `supabase/schema.sql:90`; the status and work-mode values rendered by this
  page are constrained by `supabase/schema.sql:74` and
  `supabase/projects-table.sql:46-49`; the budget/deadline fields read here
  exist in `neon/schema.sql:18-30`.

## Deliberately not changed

- No Apply control, application-status control, server action or
  `revalidatePath` edit: W1 belongs to the workflow owner and one shared fix
  closes both student project routes.
- No shared `Badge`, `Button`, `SubmitButton`, global CSS, token, schema, query
  helper, middleware or boundary file was edited. The page passes semantic
  classes to `Badge`; its default variants remain with the design-system owner.
- No route-specific `loading.tsx` or `error.tsx` was added: existing shared
  boundaries already cover this route, and the added UUID guard prevents the
  malformed-ID data error from reaching them.
- No date/locale, budget, status-label or copy rewrite: the current values are
  safe for the constrained schema values and match the voice guide.
- No user work was reverted. The pre-existing uncommitted class changes at the
  back link, heading and definition-list value were preserved.
