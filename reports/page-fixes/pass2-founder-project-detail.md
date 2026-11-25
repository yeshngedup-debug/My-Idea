# Second-pass fixes — `/founder/projects/[id]` (`founder-project-detail`)

Second-pass feature-completeness review after phase 1 and the phase-2 shared
owners completed. Scope followed `reports/page-fixes/MANIFEST.md`: only the four
owned route files plus this new report were editable. The dirty worktree was
treated as the source of truth. No destructive git command, install, dev server,
browser tool, full build, or full test suite was run. Browser-driven error-state
forcing was explicitly out of scope, so error, loading and not-found behaviour is
reported from source only.

## Files changed

### `app/founder/projects/[id]/project-detail-client.tsx`

- **Applicant transitions now mirror the server guard.** Added
  `APPLICATION_STATUSES`, `APPLICATION_TRANSITIONS` and `applicantStatusHelp()`
  at `:47-75`. The four buttons at `:287-318` now disable illegal transitions
  (`pending -> shortlisted|rejected`, `shortlisted -> accepted|rejected`,
  `accepted` and `rejected` terminal) instead of offering every status for every
  applicant. This matches `app/actions/projects.ts:138-145,217-222`.
- **Disabled controls now explain themselves.** Each applicant button group has
  `aria-describedby` pointing to a visible plain-language note: what comes next,
  or that a final status has no reopen action. Native buttons, visible labels,
  `aria-pressed`, focus rings and the single local live region are unchanged.
- **Mutation failures now have a local fallback.** `setProject()` and
  `setApplication()` at `:106-146` catch rejected server actions, log the detail
  to the console, and put a friendly `role="alert"` message in the existing
  status region. This covers preflight database failures that the shared actions
  can still throw before they return a `ProjectResult`.
- **Empty state now gives the next thing to expect.** `:222-228` says when
  applicant details will appear instead of only "No applications yet."
- **CV link now names its window behaviour.**
  `project-detail-client.tsx:269-275` keeps the `cv_path` gate and signed-proxy
  URL, and adds "(opens in a new tab)" to the screen-reader text.

### `app/founder/projects/[id]/error.tsx`

- `:27-30` now says the project or its applicant list is unavailable. The old
  body named only the applicant list even when the project read failed. Retry and
  back links are unchanged.

### `app/founder/projects/[id]/loading.tsx`

- `:1,7,14` now describe loading the project as well as the applicants. The
  `role="status"`, `aria-busy`, and `motion-reduce:animate-none` behaviour is
  unchanged.

### `app/founder/projects/[id]/page.tsx`

- No edits. Source verification found the UUID guard, session fail-closed check,
  founder ownership check, generic upstream error wrapping, and project/applicant
  mapping still present at `:22-89`.

## Feature verification

| Area | Result | Evidence |
|---|---|---|
| Project detail actions | Passing | Project status buttons call `updateProjectStatus`; the shared action checks auth and founder ownership and revalidates the detail/list/student paths (`app/actions/projects.ts:148-181`). |
| Project close / reopen | Passing as existing behaviour | The four status buttons are the close/reopen controls. The shared action allows all four constrained project statuses, so no client-side transition map was invented. `components/ui/status-timeline.tsx:164-170` uses the same four values. |
| Applicant status transitions | Fixed in owned file | The client now disables illegal transitions and explains them. The server transition map and current-status guard remain authoritative (`app/actions/projects.ts:138-145,199-222`). |
| Applicant CV links | Passing | Links render only when `student.cv_path` exists and point to `/api/cv/{student_id}`. The proxy checks session, founder/admin role, application relationship or confirmed order, then signs the Storage URL (`app/api/cv/[id]/route.ts:44-104`). |
| Proof gating | Not applicable on this route | Payment proof upload and order status live on `/founder/shortlists` (`app/founder/shortlists/shortlists-client.tsx:358-375`). This route has no proof control, and none was added. CV access gating was verified above. |
| Edit project control | Deliberate non-change | No project edit/rename action exists in `app/actions/projects.ts`; only create and status update are implemented. Adding an edit flow needs a shared action and form outside this ownership. |
| Empty state | Improved | The no-applicants panel now tells the founder what will appear there. |
| Error state | Improved, source-based only | `page.tsx:24-40` logs original errors and throws generic messages; `error.tsx:18-48` offers retry and back. No runtime failure was forced. |
| Loading state | Improved, source-based only | `loading.tsx:1-18` is accessible and reduced-motion aware. No runtime navigation was driven. |
| Not-found state | Passing, source-based only | Malformed ids and non-owners call `notFound()` at `page.tsx:47-61`; the global not-found boundary handles the response. |

## Checks performed

- Read `AGENTS.md`, `design/brand-system.md`, `design/brand-guidelines.md`,
  `design/voice-guide.md`, `lib/design-tokens.ts`, `app/globals.css`, the
  `founder-project-detail` row in `reports/page-fixes/MANIFEST.md`, the phase-1
  report, all three phase-2 shared reports, and the route audit.
- Read the installed Next.js 16 guides `03-layouts-and-pages.md`,
  `05-server-and-client-components.md`, `07-mutating-data.md`,
  `10-error-handling.md`, and the `error.js` file-convention reference.
- Source-verified current shared behaviour: `app/actions/projects.ts:138-234`,
  `app/api/cv/[id]/route.ts:22-105`, `components/ui/status-timeline.tsx:122-170`,
  `lib/neon-data.ts:271-285,439-465,502-524`, and `neon/schema.sql:18-55`.
- `npx eslint` on all four owned TSX files — no diagnostics.
- `npx tsc --noEmit --pretty false` — exited 1 with two errors outside this
  route's ownership: `app/student/projects/page.tsx:111` passes
  `initialQuery`/`initialMode` to a client component that does not declare them,
  and `app/student/projects/projects-client.tsx:323` omits the required
  `detailHref` prop. No diagnostic named any of the four owned files. Those
  errors were not edited because they belong to the student-projects owner.
- No `next build`, `npm test`, dev server, browser tooling, or data mutation was
  run. No production or live-interaction claim is made.

## Workflow findings routed to the workflow owner

- **MED — server action preflight reads can still throw.**
  `app/actions/projects.ts:164` (`getProject`), `:200-204`
  (`getApplication`/`getProject`) and `:212` (`listProjectApplicants`) run
  outside try/catch. A Neon failure there bypasses the `ProjectResult` contract.
  The owned client now catches that rejection and shows a local alert, but other
  callers would still see a raw rejected action.
  **Recommended fix:** wrap the preflight reads and return
  `{ ok: false, message: 'Could not load ... Try again.' }` instead of throwing.
- **MED — carried, not duplicated: generic success strings.**
  `app/actions/projects.ts:180` and `:233` still return
  "Project status updated." and "Applicant status updated." This page formats
  successful announcements with subject and new state, so this route is covered,
  but future callers are not.
  **Recommended fix:** return structured `{ subject, status }` data or include
  the subject and resulting label in the action result.
- **Verified passing, not routed:** the application transition map, current
  status re-read, ownership checks, and revalidation paths are present in the
  current action source. The client now mirrors the same map.

## Database findings routed to the database owner

- **LOW — carried, not duplicated: unscoped low-level update helper.**
  `lib/neon-data.ts:439-465` still updates
  `public.applications` by id only. The action checks the parent project's
  `founder_id` first, so no current bypass was found.
  **Recommended fix:** make the helper founder-scoped inside SQL, treat zero
  affected rows as an authorization failure, and add a wrong-founder test.
- **LOW — no database-side transition enforcement.**
  `neon/schema.sql:35-55` constrains the status vocabulary and stores audit rows,
  but does not reject `accepted -> pending` or `rejected -> shortlisted`. The
  server map at `app/actions/projects.ts:138-145,217-222` is the only guard.
  **Recommended fix:** add an idempotent migration with a trigger that enforces
  the same transition map and records `changed_by_ref`.
- **LOW — carried, not duplicated: unbounded applicant read.**
  `lib/neon-data.ts:502-524` remains project-scoped and index-backed but has no
  limit or pagination. No page-level cap was added because silent truncation
  would hide real applicants.
- **LOW — CV path has no object-existence guarantee.**
  `listProjectApplicants()` returns the stored `cv_path`, and the client renders
  a link for any truthy path. The proxy returns a friendly 404/502 when the
  object or signed URL is missing (`app/api/cv/[id]/route.ts:33-38,70-71`).
  **Recommended fix:** validate object existence during upload or in a shared
  helper if broken links must be prevented before the click.

## Design-system finding routed to the design-system owner

- **LOW — terminal copy mismatch for accepted applicants.**
  `components/ui/status-timeline.tsx:143-162` marks only `rejected` as terminal,
  while the server map now makes `accepted` terminal too. The owned page note
  states that accepted is final, but the shared timeline still shows earlier
  steps as ordinary progress and says "Next: Work starts now."
  **Recommended fix:** mark the accepted step `terminal: true` and update its
  `next` copy to describe work, not a further status change.

## Deliberately not changed

- No separate edit project form or action: none exists in the shared workflow,
  and adding one would exceed this route's ownership and the small-diff rule.
- No separate close/reopen buttons: the existing project status buttons already
  expose Open and Completed, and the server action permits every constrained
  project status.
- No payment-proof UI: proof upload and order confirmation are owned by
  `/founder/shortlists`, not this detail route.
- No applicant status filter: the component-relevance audit suggested one, but
  it is a new feature rather than a broken action or state on this page.
- No shared action, data helper, schema, API route, or `StatusTimeline` edit.
- No new route, dependency, gradient, emoji, or off-palette colour.
- No runtime error/loading/not-found proof: those checks were disallowed, so the
  report names them as source-verified rather than browser-verified.
- All pre-existing uncommitted work in the owned files was preserved.
