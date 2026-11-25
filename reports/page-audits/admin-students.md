# Page audit — `/admin/students`

Date: 2026-11-24. Role: read-only critic per `reports/PROTOCOL.md:6-19`.
The only file written is this report. No product source, config, schema, test,
or existing report was edited. Uncommitted working-tree changes were treated as
authoritative. `reports/page-audits/INDEX.md:38` still lists this route as
`pending`; the orchestrator owns that status change.

## Route

`/admin/students` — admin workspace student-management queue. The server
component rechecks admin role, loads all student profiles and application IDs,
then hands data to a client component that provides search, verification
filters, manual rank editing, verification toggles, multi-select, and shortlist
generation with copy/download.

## Files traced

| File | Why |
|---|---|
| `app/admin/students/page.tsx:27-111` | Target route, auth recheck, data load and client props |
| `app/admin/students/admin-students-client.tsx:1-559` | Full client UI, states, labels, controls and feedback |
| `app/actions/admin-students.ts:29-162` | Server actions for role check, rank, verification and shortlist generation |
| `lib/neon-data.ts:47-55,74-102,242-250,334-349,481-489,626-639,658-693,835-883` | Role/profile/project lookups, roster reads, updates and shortlist replacement |
| `app/api/cv/[id]/route.ts:22-93` | Authorization behind generated CV links |
| `lib/env.ts:8-36` | Required env validation and `APP_URL` fallback used in CV links |
| `proxy.ts:100-134` | `/admin/*` route guard |
| `neon/schema.sql:1-10,65-100` | Explicit no-RLS boundary and shortlist constraints |
| `components/ui/button.tsx:21`, `components/ui/input.tsx:37`, `components/interactive/copy-button.tsx:84-93` | Shared target-size and live-region precedents |
| `tests/e2e/admin-flow.test.ts:38-57` | Existing `/admin/students` E2E coverage |
| `reports/PROTOCOL.md:6-19`, `reports/SKILL-ASSIGNMENTS.md:3-12`, `reports/page-audits/INDEX.md:38` | Audit protocol, skill precedence and report status |

## Skills used

Loaded as assigned and applied with `reports/SKILL-ASSIGNMENTS.md:5-12`
precedence (`unslop` for minimal copy, `better-*` for evidence-based findings):

| Skill | Applied here |
|---|---|
| `unslop` | Checked labels and copy for hype, filler and AI tells; no high-signal copy issue found |
| `better-interface` | Reviewed action feedback, pending states, empty/error states and shortlist result flow |
| `better-layout` | Reviewed queue density, sticky action bar and card/list structure |
| `better-ui` | Checked focus rings, icons, badges and target-size consistency |
| `better-writing` | Checked accessible label wording and fallback text |
| `frontend-a11y` | Checked names, roles, live regions and keyboard-operable controls |
| `better-accessibility` | Applied WCAG 2.2 / project target-size evidence separately from source-only facts |
| `webapp-testing` | Attempted real-browser verification; see `Notes/limitations` |
| `security-review` | Reviewed admin authz, PII serialization and generated CV links |
| `api-security-testing` | Reviewed server-action boundaries, related IDs, SQL parameterization and RLS boundary |

## UI/UX findings

### U1. Unused PII is still serialized to the client

- **Severity:** LOW
- **Classification:** Confirmed (static source).
- **Evidence:** `app/admin/students/page.tsx:61-75` maps `bio`, `cv_path` and
  `contact_email` into each client row. `app/admin/students/admin-students-client.tsx:32-45`
  declares those fields, but the render path at `:98-117` and `:348-472` uses
  none of them.
- **Why it matters:** The server sends student bio text, CV path and contact
  email to the browser for no visible feature. That is unnecessary PII exposure
  in the client payload and avoidable weight on a roster page.
- **Fix:** Remove `bio`, `cv_path` and `contact_email` from `AdminStudent` and
  from the mapping in `page.tsx`. Keep `contact_email` only in the server action
  that intentionally generates the shortlist text.

### U2. Roster is loaded and rendered without pagination or virtualization

- **Severity:** LOW
- **Classification:** Suspected (scale-dependent; no production roster size was measured).
- **Evidence:** `lib/neon-data.ts:658-665` selects all student profiles;
  `app/admin/students/page.tsx:48-59` also loads all application IDs and builds
  the whole count map; `app/admin/students/admin-students-client.tsx:98-117`
  filters and sorts locally, and `:348-472` renders every matching row.
- **Why it matters:** The current design is fine for a small seed set, but it
  has no bounded query or DOM strategy. Initial payload, filtering work and DOM
  nodes grow linearly with the roster. This is not a confirmed failure at the
  current data volume.
- **Fix:** Add server-side pagination with a total count, or virtualize the row
  list if the admin workflow needs all rows in one scroll. Keep the existing
  search/filter state in the URL or query layer if pagination is added.

### A11y-A1. Select button names can read as `null`

- **Severity:** MED
- **Classification:** Confirmed (static source).
- **Evidence:** `AdminStudent.full_name` is nullable at
  `app/admin/students/admin-students-client.tsx:34`. The visible name at
  `:401-403` has no fallback, and the select button at `:367` builds
  `` `Select ${s.full_name}` `` / `` `Deselect ${s.full_name}` ``. With a null
  name, JavaScript string interpolation produces `Select null`; with an empty
  string it produces `Select `.
- **Why it matters:** Screen-reader users get an unusable or misleading control
  name, and sighted users see an unnamed card. This blocks reliable row
  identification during a bulk selection workflow.
- **Fix:** Derive one fallback once per row, e.g.
  `const displayName = s.full_name?.trim() || 'Unnamed student'`, then use it in
  both the heading and the `aria-label`. The founder picker already uses this
  pattern at `:526`.

### A11y-A2. Errors are announced with the same polite role as success

- **Severity:** MED
- **Classification:** Confirmed (static source).
- **Evidence:** `app/admin/students/admin-students-client.tsx:277-288` renders
  both success and failure through one `<p role="status">`. The repository's
  newer copy-control precedent uses a separate `role="alert"` for errors at
  `components/interactive/copy-button.tsx:86-93`.
- **Why it matters:** Rank, verification and shortlist failures are currently
  polite status messages. Assistive-tech users may miss a failed mutation while
  focus remains elsewhere, especially in a queue workflow where the next action
  depends on knowing whether the save worked.
- **Fix:** Use `role={status.ok ? 'status' : 'alert'}` and keep the message text
  unchanged. Do not duplicate the message in a second hidden live region.

### A11y-A3. Touch targets contradict the route's own 44px contract

- **Severity:** LOW
- **Classification:** Confirmed source inconsistency. It is not classified as a
  WCAG 2.2 2.5.8 failure because 32px/36px targets remain above that criterion's
  24px minimum; the issue is the project's stricter stated standard.
- **Evidence:** `app/admin/students/admin-students-client.tsx:6` promises
  "44px+ touch targets", but filter buttons use `min-h-9` at `:263`, select-all
  uses `min-h-9` at `:296`, row selection uses `min-h-8 min-w-8` at `:369`, and
  the verify toggle uses `min-h-8` at `:452`. Shared components use `min-h-11`
  at `components/ui/button.tsx:21` and `components/ui/input.tsx:37`;
  `reports/brand-tokens.md:7` records the 44px target fix as a brand rule.
- **Why it matters:** Admin actions are destructive or consequential (verify,
  shortlist, rank). Small adjacent targets make mis-taps more likely on touch
  devices and break consistency with the rest of the workspace.
- **Fix:** Raise these four controls to at least `min-h-11 min-w-11` and keep
  the existing focus rings. Re-check spacing at 320px so the larger targets do
  not collapse the card row.

## Workflow findings

### W1. Shortlist generation does not verify founder role or project ownership

- **Severity:** MED
- **Classification:** Confirmed missing validation in source; the resulting
  data-integrity impact is suspected because no server action was mutated in
  this read-only audit.
- **Evidence:** `app/actions/admin-students.ts:94-95` checks only that
  `founderId` and `studentIds` are non-empty. `:116` uses generic
  `listProfilesByIds([founderId])` (`lib/neon-data.ts:74-83`) without checking
  `role`, and `:117` uses generic `getProject(projectId)`
  (`lib/neon-data.ts:242-250`) without checking `founder_id`. The persisted call
  at `:154` passes both IDs to `replaceAdminShortlist`, whose inserts/deletes at
  `lib/neon-data.ts:847-878` scope by the supplied IDs only. The client filters
  the project picker by founder at
  `app/admin/students/admin-students-client.tsx:93-96,538-542`, but that filter
  is not a server-side boundary.
- **Why it matters:** A direct server-action call with a valid admin session
  could create admin-sourced shortlist rows for a non-founder profile or attach
  a project owned by a different founder. The generated header would then show
  a project title unrelated to the chosen founder. This is a defense-in-depth
  gap, not an unauthenticated bypass: `app/actions/admin-students.ts:29-40`
  does recheck admin role, and the route purpose is admin-controlled.
  The expectation of layered checks is explicit at
  `app/admin/students/page.tsx:6-8`.
- **Fix:** In `generateShortlist`, load the target profile with `getProfile`
  and return an error unless `role === 'founder'`. If `projectId` is present,
  compare `project.founder_id` with `founderId` and reject mismatches before
  any text is returned or rows are written. Add a server test for both rejects.

### W2. E2E comment about select-all is stale

- **Severity:** LOW
- **Classification:** Confirmed (static source).
- **Evidence:** `tests/e2e/admin-flow.test.ts:47` says "The select-all button
  has no aria-label", but the current button at
  `app/admin/students/admin-students-client.tsx:293-304` has visible text
  "Select all shown" / "Deselect all" and does not use an `aria-label`. The test
  at `:48` therefore targets a student-card select button, not select-all.
- **Why it matters:** The comment misstates the current accessible name and
  hides the fact that select-all is not covered by this step. It can lead a
  future fixer to "fix" a non-existent a11y issue while leaving the real bulk
  action untested. This is a test-documentation defect, not a product defect.
- **Fix:** Update the comment, and add a separate step using
  `getByRole('button', { name: 'Select all shown' })` if bulk selection needs
  coverage.

### Verified workflow controls (not findings)

- Unauthenticated users are redirected from protected areas at `proxy.ts:111-113`;
  role-area routing is enforced at `:123-131`.
- The page rechecks `role === 'admin'` before loading data at
  `app/admin/students/page.tsx:39-45`; actions recheck at
  `app/actions/admin-students.ts:29-40,47-48,68-69,91-92`.
- Rank input rejects non-finite and sub-1 values before the action at
  `app/admin/students/admin-students-client.tsx:144-150`; verification uses
  optimistic update plus explicit rollback at `:170-199`.
- Generated CV links use the `/api/cv/[id]` proxy rather than a signed URL
  embedded in exported text (`app/actions/admin-students.ts:110-113`). Admin
  access is unrestricted by design at `app/api/cv/[id]/route.ts:48-56`;
  founders are gated by application/order relationships at `:59-82`.

## Database/RLS findings

### D1. Shortlist replacement is not transactional

- **Severity:** MED
- **Classification:** Confirmed code path; failure occurrence is suspected,
  not reproduced.
- **Evidence:** `lib/neon-data.ts:842-846` explicitly notes that the upsert is
  followed by a delete and that a failure can leave extra stale rows. The two
  statements are separate at `:847-862` (project scope) and `:864-878`
  (general scope). `app/actions/admin-students.ts:153-157` reports an error if
  either statement throws.
- **Why it matters:** If the insert succeeds but the delete fails, the admin
  sees "Could not save shortlist. Try again." while the database has already
  added the new rows and may still contain removed students. A retry can leave
  a stale mixed shortlist that the founder sees on `/founder/shortlists`.
- **Fix:** Wrap both statements in one database transaction (`sql.begin` or the
  project's transaction helper equivalent), then revalidate only after commit.
  Add a test that forces the delete to fail and asserts no partial rows remain.

### D2. `APP_URL` can silently produce localhost CV links

- **Severity:** MED
- **Classification:** Confirmed fallback in source; the bad outcome is
  suspected and depends on production env configuration.
- **Evidence:** `lib/env.ts:8-11` requires only Supabase URL and anon key.
  `lib/env.ts:34-36` falls back to `http://localhost:3000` for `APP_URL` when
  `NEXT_PUBLIC_APP_URL` is absent. `app/actions/admin-students.ts:110-113` uses
  that value for every generated CV link.
- **Why it matters:** If a production deployment omits `NEXT_PUBLIC_APP_URL`,
  admins copy and download shortlists containing CV links that resolve to
  `localhost` on the recipient's machine. The workflow fails at the exact handoff
  the page exists to support. The current runtime env was not inspected, so
  this is not presented as an active production failure.
- **Fix:** Make `NEXT_PUBLIC_APP_URL` required in production with a clear error,
  or fail shortlist generation if the resolved `APP_URL` is a localhost origin.
  Add a deploy-time env check and a unit test for the generated link string.

### D3. Neon schema intentionally has no RLS

- **Severity:** LOW
- **Classification:** Confirmed design boundary, not a defect by itself.
- **Evidence:** `neon/schema.sql:1-4` states that authorization stays in the
  application layer and that no RLS policies are created. Shortlist rows are
  keyed only by `founder_id`, `student_id`, `project_id` and `source`
  (`:65-73`), with unique indexes at `:90-100`.
- **Why it matters:** The database will not stop a bad `founder_id` or a
  mismatched `project_id`. Application checks in W1 and atomicity in D1 are the
  only guards for shortlist integrity.
- **Fix:** Keep the server-side relationship checks mandatory. If the Neon
  deployment supports it, add a database-level constraint or policy for
  "project belongs to founder" and "founder profile has founder role"; otherwise
  document this as an explicit application-layer-only trust boundary.

### Reviewed database controls (not findings)

- All traced SQL uses tagged template parameters, including role lookup at
  `lib/neon-data.ts:50`, roster read at `:661-664`, selected-student read at
  `:632-634`, and shortlist writes at `:847-878`. No SQL injection was found.
- `replaceAdminShortlist` scopes its delete to `source = 'admin'` and the
  requested project/null scope at `lib/neon-data.ts:858-862,874-878`, so founder
  requested rows are not wiped by admin regeneration. That design is sound; the
  remaining issue is atomicity (D1).

## Severity summary

| Severity | Count | Findings |
|---|---:|---|
| HIGH | 0 | None confirmed or suspected in this route |
| MED | 5 | A11y-A1, A11y-A2, W1, D1, D2 |
| LOW | 5 | U1, U2, A11y-A3, W2, D3 |

No finding is classified as an active unauthenticated data breach. The two
highest-risk areas are shortlist write integrity (W1, D1) and assistive-tech
feedback/identification (A11y-A1, A11y-A2).

## Recommended fixes

1. **Validate shortlist targets on the server.** In
   `app/actions/admin-students.ts:116-117`, require `getProfile(founderId)?.role === 'founder'`
   and, when `projectId` is set, require `project.founder_id === founderId`.
   Reject before `replaceAdminShortlist` at `:154`.
2. **Separate error announcements.** Change the banner at
   `app/admin/students/admin-students-client.tsx:277-288` to use `role="alert"`
   for failures and `role="status"` only for success.
3. **Add a row-name fallback.** Use one `displayName` value for the heading at
   `admin-students-client.tsx:401-403` and the select label at `:367`.
4. **Make shortlist replacement atomic.** Wrap the two statements in
   `lib/neon-data.ts:847-878` in one transaction; revalidate only after commit.
5. **Fail fast on bad production URL config.** Make `NEXT_PUBLIC_APP_URL`
   required in production in `lib/env.ts:8-36`, or reject localhost `APP_URL`
   inside `generateShortlist` before returning links.
6. **Tighten the client payload.** Remove unused `bio`, `cv_path` and
   `contact_email` from the props mapped at
   `app/admin/students/page.tsx:61-75`.
7. **Align target sizes.** Raise the four small controls at
   `admin-students-client.tsx:263,296,369,452` to `min-h-11` /
   `min-w-11` and recheck 320px layout.
8. **Follow up on scale and test coverage.** Add pagination/virtualization if
   roster size warrants it, and update the stale select-all comment at
   `tests/e2e/admin-flow.test.ts:47`.

## Notes/limitations

- This was a static audit. Playwright MCP navigation to
  `http://localhost:3000/admin/students` and `http://127.0.0.1:3000/admin/students`
  failed with `net::ERR_CONNECTION_REFUSED`; a direct `Invoke-WebRequest` also
  could not connect. No rendered verification, keyboard trace, screen-reader
  pass or mutation test was completed. Findings marked confirmed are confirmed
  from source, not from runtime behavior.
- No database query was run and no application, order, verification or
  shortlist data was mutated. `npm run build` was not run while the dev-server
  state was uncertain.
- Existing reports were read first. Overlaps are referenced, not duplicated:
  `reports/accessibility-critic.md:16,43,46` owns broad dashboard/global a11y
  and states dashboard runtime was not verified; this report adds route-specific
  static evidence. `reports/brand-tokens.md:6-7` owns the 44px/focus-ring token
  decision. `reports/dashboard-design-direction.md:65` owns the work-queue
  redesign scope. `reports/component-relevance-audit.md:53,86,100` previously
  flagged the hand-rolled copy button; the current working tree already uses
  `CopyButton` at `admin-students-client.tsx:488-492`, so no duplicate finding
  is raised here.
- `reports/page-audits/INDEX.md:38` is unchanged. The orchestrator owns moving
  `/admin/students` from `pending` to `done`.
