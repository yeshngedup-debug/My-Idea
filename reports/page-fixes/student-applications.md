# Page fixes: `/student/applications`

Slug: `student-applications`. Scope: `app/student/applications/page.tsx` and
`app/student/applications/applications-client.tsx` only. Shared files and other
reports were read but not edited. No build, tests, or dev server were run.

## Files changed

- `app/student/applications/page.tsx`
  - Accepts the Next 16 `searchParams` promise (`Promise<{ status?: string | string[] }>`), awaits it, and validates `status` against the five real filter values (`all`, `pending`, `shortlisted`, `accepted`, `rejected`). Unknown, repeated, or missing values fall back to `all`.
  - Passes the validated value as `initialFilter` to `ApplicationsClient`.
- `app/student/applications/applications-client.tsx`
  - Accepts `initialFilter` and seeds the filter state from it, so `/student/applications?status=pending` renders the pending queue on first paint and on reload.
  - Adds `handleFilterChange`: updates local state immediately and writes the same value to `?status=` with the documented native `history.pushState` API (preserves unrelated query keys, removes `status` for `all`). Both the segmented control and the "Show all applications" reset use it. No extra server round trip per click.
  - Adds a `popstate` listener that re-reads `?status=` from the URL, so browser Back/Forward restores the matching filter.
  - Adds `year: "numeric"` to the applied-date formatter, matching the date contract already used on `/student/projects/[id]`.
  - Preserved the pre-existing uncommitted work in this file (reduced-motion classes, sr-only heading, `#b23c26` focus ring). Nothing was reverted.

## Checks performed

- Read `reports/page-fixes/MANIFEST.md` in full, the route audit, the relevant `CONSOLIDATED.md` sections (lines 57, 105-121, 187-218), `AGENTS.md`, `design/brand-system.md`, `design/brand-guidelines.md`, `design/voice-guide.md`, `lib/design-tokens.ts`, `app/globals.css`, and the Next 16 docs for `page.tsx` `searchParams` (`03-api-reference/03-file-conventions/page.md`), `useSearchParams`, `useRouter`, and the native History API (`01-getting-started/04-linking-and-navigating.md`). `searchParams` is a promise in this version and is awaited; the route is request-time dynamic because it calls `auth.getUser()`, so no Suspense boundary was needed for the client URL sync.
- Source-verified audit leads against current files before acting; no report or shared file was changed.
- `npx eslint app/student/applications/page.tsx app/student/applications/applications-client.tsx` exits clean (no warnings or errors).
- Verified the existing owner-scoped read (`app/student/applications/page.tsx:42-49` takes the id from `auth.getUser()`; `lib/neon-data.ts:429-436` uses a parameterized `where a.student_id = ${studentId}`) and the proxy role gate (`proxy.ts:100-134`). No auth or ownership change was needed here.

## Workflow findings routed to the workflow owner

- **W2 (MED) — founder can regress an application status.** `app/founder/projects/[id]/project-detail-client.tsx:216-222` offers all four statuses for every applicant; `app/actions/projects.ts:176-212` only whitelists the target string and checks project ownership; `lib/neon-data.ts:412-422` updates without a transition predicate. A `rejected` row can return to `pending`, and the student view then contradicts the earlier decision. Recommended: enforce a server-side transition map (`pending -> shortlisted|rejected`, `shortlisted -> accepted|rejected`, terminal states immutable unless an explicit reopen action exists), mirror it in the founder buttons, and record actor/time in a history row. Not edited: owned by the workflow owner (`app/actions/*.ts`, shared founder component).
- **W1 (MED) — imperative next-step copy with no destination.** `components/ui/status-timeline.tsx:130` ("Watch for the next message.") and `:135` ("Message your founder.") render in every card via `applications-client.tsx:166-171`, but this route and the app expose no message/inbox action. Recommended: rewrite to describe actual behaviour, e.g. "Your founder will contact you when the next step is ready." and "Work starts now. Check your project brief.", or add a real contact destination. Not edited: shared design-system component.

## Database findings routed to the database owner

- **D2 (MED) — `listStudentApplications` returns invalid ids.** `lib/neon-data.ts:356-377` declares `student_id` and `project_id` as required strings and maps them with `String(...)`, but the query at `:429-436` selects only `a.id`, `a.status`, `a.created_at`, and a project object with `title`; both ids become the literal `"undefined"`. Recommended: select `a.student_id`, `a.project_id`, and `p.id`, extend the project object type at `:362` with `id`, map `id` at `:375`, and assert UUIDs in a unit test. This blocks the row-to-project link requested in `reports/component-relevance-audit.md:43`; this page currently discards both fields, so there is no visible corruption today. Not edited: `lib/neon-data.ts` is DB-owner territory.
- **D3 (MED) — no status timestamp or history.** `neon/schema.sql:35-42` has only `created_at`; `lib/neon-data.ts:412-422` and `app/actions/projects.ts:177-212` do not record changes. The UI cannot say when a decision happened or which stages were actually reached; this is the root cause of the shared timeline finding U1. Recommended: add `updated_at` to `public.applications`, set it on status update, and add `application_status_history(application_id, from_status, to_status, changed_at, changed_by_ref)` written per accepted transition. Not edited: schema and data layer are DB-owner territory.
- Verified controls worth preserving: `unique (student_id, project_id)` at `neon/schema.sql:41`, index `applications_student_idx` at `:88`, single joined query with no N+1, and owner id taken from the session rather than the query string.

## Deliberately not changed

- **U1 — terminal rejection relabels earlier stages "Not yet."** Lives in `components/ui/status-timeline.tsx:37-53,138-142` (shared design-system owner). A correct fix needs the status history from D3, so a neutral "Earlier stage" label should replace index-based inference only when real history exists. Rendering the timeline here is leave-as-is.
- **U3 — 11px guidance text.** `components/ui/status-timeline.tsx:95,107` is shared. The two owned 12px items (live count at `applications-client.tsx:120`, applied date at `:152`) already meet the audit's stated 12px minimum for dates and counts, so density was not changed.
- **Row title → project brief link** (`reports/component-relevance-audit.md:43`). The DB accessor never selects a project id (D2); linking now would produce `/student/projects/undefined`. Once the DB owner selects `p.id` and adds it to the `ApplicationRow.project` type, the server page's `project: a.project` mapping already forwards it and a link can be added without another server-page change.
- No changes to `components/interactive/segmented-control.tsx`, `components/ui/status-timeline.tsx`, `app/actions/**`, `lib/neon-data.ts`, `neon/schema.sql`, or any report other than this one.
