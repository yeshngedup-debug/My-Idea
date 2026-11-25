# `/founder/students/[id]` second pass — feature completeness

Date: 2026-11-25. Scope: the `founder-student-detail` row in
`reports/page-fixes/MANIFEST.md`, which owns only
`app/founder/students/[id]/page.tsx`,
`app/founder/students/[id]/shortlist-button.tsx`, and this new report. The dirty
worktree was treated as the source of truth. All phase-1 edits and all other
agents' uncommitted work were preserved. No shared file, other page, other
report, schema, action, config, or `MANIFEST.md` was edited. No install, Reticle
wiring, dev server, build, npm test, or browser tool was used.

Skills loaded first: `frontend-a11y`, `debug-broken-ui`.

## Files changed in this pass

- `app/founder/students/[id]/page.tsx`
  - Replaced the boolean-only application check with application context. The
    page now loads the founder's projects and the student's applications in the
    same `Promise.all`, finds the latest application to a project owned by this
    founder, and derives `hasApplied` from that row (`:65-82`).
  - Added a compact, linked status line under the profile meta:
    `Latest application to your project · [project title] · [status]`
    (`:119-131`). It uses the existing project detail route and on-palette
    link/focus styles. Status values map to the four schema values
    (`pending`, `shortlisted`, `accepted`, `rejected`).
  - The application link and status are rendered only when a matching row
    exists; no empty placeholder was added for founders with no application
    relationship.
- `app/founder/students/[id]/shortlist-button.tsx`
  - Added the missing next step after a request: when the button is in
    `Shortlisted` state, a quiet `Next: View Premium Shortlist` link to
    `/founder/shortlists` is now visible (`:72-82`). This covers both a fresh
    success and an already-shortlisted profile on load.
  - Success feedback is now the short announcement `Shortlist requested.`
    (`:34`) so the stable live region announces the state change without
    duplicating the persistent next-step line. Failure feedback still uses the
    action's message and the accent colour token.
- `reports/page-fixes/pass2-founder-student-detail.md` — this report (new).

No other source file was changed in this pass.

## Features verified against current source

### Profile completeness display

- The page renders the stored profile fields founders need to judge readiness:
  full name (`:107`), college/course/year and availability (`:112-117`),
  skills (`:133-139`), bio (`:141-146`), and CV access (`:148-160`).
- `getStudentProfile` now projects explicit columns
  (`lib/neon-data.ts:665-679`), so the detail page no longer relies on
  `select *`. The stale phase-1 over-fetch lead is resolved in shared code.
- No percentage progress bar was added here. Completion editing is the
  student-authoring feature at `/student/profile`
  (`reports/orchestrator.md:132-141`); this founder page is read-only. The
  directory-level completeness requirement is enforced before arrival by
  `listBrowseableStudents` (`cv_path`, full name, college, skills) and again on
  this route by the `!sp || !sp.cv_path` guard (`:63`).

### CV and proof access

- `View CV (PDF)` points to `/api/cv/[id]` with an encoded UUID and
  `noopener noreferrer` (`:151`). It is rendered only when `canViewCv` is true.
- `canViewCv` mirrors the API gate: application to a founder project, or a
  founder shortlist paired with a confirmed order (`:82-90`). The API keeps its
  independent role and relationship checks.
- Ineligible founders see a plain access note instead of a link that would
  fail (`:154-159`).
- The stale phase-1 CV-500 finding is resolved in shared code:
  `app/api/cv/[id]/route.ts:22-105` now validates the UUID, logs Storage
  failures, and returns friendly 502 text. No page-side workaround was added.
- Payment proof/screenshot access belongs to `/founder/shortlists`, not this
  route; no proof control was invented here.

### Shortlist / invite action

- `canRequestShortlist` mirrors the server action's gate
  (`hasApplied || generalUnlocked`) and is passed to the button (`:82,164-168`).
- `alreadyShortlisted` counts only `source === 'founder'` and
  `project_id == null` rows (`:92-97`), so admin or project-scoped rows no
  longer disable the general request.
- The button still disables ineligible and pending states, exposes `aria-busy`,
  uses one stable `role="status"` live region, keeps a 44 px minimum target,
  and calls `router.refresh()` after success (`shortlist-button.tsx:26-47,59-112`).
- The component-relevance gap at `reports/component-relevance-audit.md:49` is
  now fixed locally with the `View Premium Shortlist` next step. No separate
  "invite" action exists in the app source; the shortlist request is the only
  invite-like control on this route.

### Application context

- A founder who opens a student with an application to one of their projects
  now sees the project title, a link to that project, and the application
  status (`:119-131`). `listStudentApplications` is sorted newest first, so
  `find` selects the latest matching row.
- Applications to other founders' projects are filtered out before rendering
  via the founder project id set (`:73-76`). No data from unrelated projects is
  exposed.

### Empty, error, and loading states

- Missing, non-student, or CV-less targets call `notFound()` (`:35,57-63`);
  malformed UUIDs are rejected before any database call (`:35`).
- Anonymous users redirect to `/login`; non-founders redirect to `/student`
  (`:42-55`).
- Empty skills and bio are omitted without leaving empty headings; ineligible
  CV and shortlist states have explanatory copy and a recovery link.
- No route-scoped `loading.tsx`, `error.tsx`, or `not-found.tsx` is owned by this
  slug. `app/founder/loading.tsx` and the route-aware root boundaries
  (`app/error.tsx`, `app/not-found.tsx`) remain the inherited behaviour. No
  new route file was created outside the ownership table.

## Checks performed

- Read in full before editing: `AGENTS.md`, the installed Next.js 16 guides
  already reviewed in phase 1 (`03-layouts-and-pages.md`,
  `05-server-and-client-components.md`, `07-mutating-data.md`,
  `10-error-handling.md`, `dynamic-routes.md`, `not-found.md`, `use-router.md`),
  `reports/page-fixes/MANIFEST.md`, the original page audit, the phase-1 fix
  report, `reports/component-relevance-audit.md`, the shared phase-2 reports,
  `design/brand-system.md`, `design/brand-guidelines.md`,
  `design/voice-guide.md`, `lib/design-tokens.ts`, and `app/globals.css`.
- Source verification: traced `app/actions/shortlist.ts`,
  `app/api/cv/[id]/route.ts`, `lib/neon-data.ts` (application, shortlist,
  order, and profile helpers), `neon/schema.sql:35-117`,
  `app/founder/browse-students/page.tsx`, and
  `app/student/profile/profile-form.tsx:84-102` to confirm the new context and
  gates match current contracts.
- `npx eslint "app/founder/students/[id]/page.tsx" "app/founder/students/[id]/shortlist-button.tsx"`
  — no findings.
- `npx tsc --noEmit --pretty false` — no findings.
- `git diff` reviewed after editing; only the two owned source files changed in
  this pass. No full build, test suite, dev server, or browser tool was run.
  Runtime behaviour was not re-verified by this agent.

## Workflow findings routed to the workflow owner

- No unresolved CV-route finding remains from phase 1. The UUID guard, Storage
  error log, and friendly 502 copy are already present in
  `app/api/cv/[id]/route.ts:22-105`; left unchanged here.
- No unresolved shortlist-action finding remains from phase 1. Raw DB detail is
  logged server-side and replaced with friendly copy, and
  `app/actions/shortlist.ts:57-59` now revalidates the detail path. The client
  `router.refresh()` remains as an immediate in-browser refresh.
- A seed CV path can still lack a matching Storage object. The page now avoids
  offering a link to ineligible founders, but an eligible founder with a stale
  path still reaches the friendly 502 fallback. Seed/Storage repair remains in
  the database/tooling scope.
- The next-step gap is fixed in the owned button rather than routed; the link
  target `/founder/shortlists` and its agreement route both exist.
- Inherited error and loading boundaries are route-aware enough for this slug;
  a dedicated boundary would be a design-system/shared-file change and was not
  made here.

## Database findings routed to the database owner

- `listFounderShortlists` (`lib/neon-data.ts:819-831`) still reads every row for
  the founder, and this page filters locally at `:94-97`. The behaviour is
  correct, but a scoped helper filtering
  `source = 'founder' and project_id is null` remains the durable fix. The
  existing partial unique index `shortlists_one_per_founder_student_general`
  (`neon/schema.sql:110-114`) supports that predicate.
- The new application context uses `listStudentApplications(id)`
  (`lib/neon-data.ts:467-486`) plus a local project-id filter. This is correct
  and parameterised, but a detail-specific helper scoped to
  `student_id + founder projects` would avoid reading applications to unrelated
  projects as the student's application count grows.
- `cv_path` remains plain text with no object-existence guarantee
  (`neon/schema.sql:70`). A seed smoke check or verified-upload workflow is
  still recommended.
- Current schema values remain consistent with this page: application statuses
  (`neon/schema.sql:39`) match `APPLICATION_STATUS_LABEL`; availability and year
  checks (`:62-68`) match `AVAILABILITY_LABEL` and the rendered profile copy;
  shortlist order status filtering uses `confirmed` (`:94`), matching
  `listConfirmedOrderProjectIds`.

## Deliberately not changed

- Shared files: `app/actions/shortlist.ts`, `app/api/cv/[id]/route.ts`,
  `lib/neon-data.ts`, `neon/schema.sql`, `supabase/**`, `proxy.ts`,
  `app/globals.css`, and `lib/design-tokens.ts`.
- Route-scoped `loading.tsx`, `error.tsx`, or `not-found.tsx` files: not in the
  ownership table. The malformed-ID case is already handled in the page.
- A profile completion progress bar on this read-only founder page: completion
  editing and its accessible progress indicator belong to `/student/profile`.
- Any new invite control: the codebase has no invite action; the shortlist
  request is the existing invite-like workflow.
- No new dependency, gradient, violet, emoji, wholesale rewrite, or broad copy
  edit. All new styling uses existing theme utilities and the existing link
  focus ring.
