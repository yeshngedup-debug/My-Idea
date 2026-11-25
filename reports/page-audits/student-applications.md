# Page audit: `/student/applications`

Date: 2026-11-24. Role: read-only page critic. No product source, config, schema, test, or existing report was edited. Only this file was written.

## Route

- **Route:** `/student/applications`
- **Purpose:** let a signed-in student review every application they sent and see each application's current status.
- **Shape:** server component loads the signed-in user and their rows; client component supplies the status filter, empty states, badges, and status timelines.
- **Auth:** route is behind the shared proxy gate. Unauthenticated requests go to `/login`; authenticated users in another role area are redirected to their own dashboard (`proxy.ts:110-130`).

## Files traced

- `app/student/applications/page.tsx:1-52`
- `app/student/applications/applications-client.tsx:1-147`
- `components/interactive/segmented-control.tsx:1-101`
- `components/ui/status-timeline.tsx:1-197`
- `components/ui/badge.tsx:1-21`
- `components/layout/pinned-heading-section.tsx:1-26`
- `components/layout/workspace-page-heading.tsx:1-26`
- `lib/neon-data.ts:1-8,356-441`
- `app/actions/projects.ts:102-135,176-212`
- `app/founder/projects/[id]/project-detail-client.tsx:55-82,215-231`
- `app/student/projects/[id]/page.tsx:28-60,75-91`
- `neon/schema.sql:1-101`
- `proxy.ts:100-134`
- `app/error.tsx:18-55`, `app/student/loading.tsx:1-5`, `app/globals.css:26`
- Coordination and assignment: `reports/PROTOCOL.md`, `reports/SKILL-ASSIGNMENTS.md`
- All `reports/*.md` and `reports/page-audits/*.md` present at finalization were read; overlap is listed in Notes/limitations.

## Skills used

Loaded and applied the assigned set from `reports/SKILL-ASSIGNMENTS.md`:

- `unslop`: AI-tell and minimal-copy check. Authoritative here for rejecting decorative or dead-end copy. Applied to U1 and W1.
- `better-interface`: evidence and severity framing; no claim without file:line or measured contrast.
- `better-layout`: sticky heading/two-column shell and dense list grouping. No layout defect found beyond the cross-referenced row-link gap.
- `better-ui`: badge, dot, focus ring, and control polish. No separate finding: focus rings are visible and the status is not colour-only.
- `better-writing`: copy clarity and action labels. Applied to U2 and W1.
- `frontend-a11y`: semantic `ol`, `aria-current`, toggle buttons, and the polite live count. The filter and live region are correctly wired.
- `better-accessibility`: WCAG 2.2 AA view, including computed contrast. No contrast failure found; measurements are in Notes/limitations.
- `webapp-testing`: runtime check attempted. No listener was available on `127.0.0.1:3000`, so this audit is static; prior Playwright evidence is cited only as cross-reference.
- `security-review`: authn/authz, owner scoping, IDOR, validation, and error handling on the read path.
- `api-security-testing`: data-layer abuse cases, ownership on status mutation, parameterization, and integrity constraints.

Precedence from `reports/SKILL-ASSIGNMENTS.md:5-13` was respected: `unslop` governs minimal copy, and `better-*` skills govern evidence-based interface findings. `design-taste-frontend` and `apple-design` are not assigned to this role and were not used.

## UI/UX findings

### U1 - MED - Confirmed - Terminal "Rejected" timeline relabels earlier stages as "Not yet"

- **Evidence:** `components/ui/status-timeline.tsx:37-40` sets `flowsOffPath` for a terminal step; `components/ui/status-timeline.tsx:48-53` then suppresses every `isDone` label; `components/ui/status-timeline.tsx:138-142` marks `rejected` terminal. This timeline is rendered on the page at `app/student/applications/applications-client.tsx:135-140`.
- **Why it matters:** a student who was shortlisted and then rejected sees "Pending - Not yet" and "Shortlisted - Not yet" beside "Rejected - Current". Earlier progress is erased from the view. The page promises "where it stands" (`app/student/applications/page.tsx:43`), but the stepper cannot distinguish "never reached" from "reached, then closed".
- **Concrete fix:** stop deriving reached stages from list index when a terminal state is active. Add stored status history (D3) and render actual reached steps. Until history exists, use a neutral label such as "Earlier stage" for steps before a terminal step and remove the checkmark inference; do not show "Done" unless the transition is known.

### U2 - LOW - Confirmed - Applied date omits the year and disagrees with project detail

- **Evidence:** `app/student/applications/applications-client.tsx:122-127` formats with only `day` and `month`. The project detail page formats posted and deadline dates with `day`, `month`, and `year` at `app/student/projects/[id]/page.tsx:77-81` and `app/student/projects/[id]/page.tsx:86-90`.
- **Why it matters:** "5 Apr" is ambiguous once the workspace holds applications from more than one year, and the same product uses two date contracts for adjacent screens.
- **Concrete fix:** add `year: "numeric"` to the `toLocaleDateString` options at `applications-client.tsx:124-127`, or use one shared date formatter across student workspace pages.

### U3 - LOW - Confirmed - Important guidance is rendered at 11px to 12px

- **Evidence:** live count at `app/student/applications/applications-client.tsx:90` uses `text-xs`; applied date at `applications-client.tsx:122` uses `text-xs`; status text at `components/ui/status-timeline.tsx:95` and the "Next:" guidance at `status-timeline.tsx:107` use `text-[11px]`.
- **Why it matters:** the "Next:" sentence is the only explanation of what a status means, yet it is the smallest text in the card. Scaled or low-vision readers get the least legible copy where interpretation matters most. This is not a contrast failure (see Notes/limitations).
- **Concrete fix:** raise `text-[11px]` to at least `text-xs` and preferably `text-sm` for the "Next:" line; keep 12px minimum for dates and counts. Recheck density on the `sm` compact layout at `status-timeline.tsx:105-113`.

## Workflow findings

### W1 - MED - Confirmed - Status copy tells the student to message a founder, but the page offers no route or contact action

- **Evidence:** `components/ui/status-timeline.tsx:130` says "Watch for the next message."; `components/ui/status-timeline.tsx:135` says "Message your founder." Both are rendered in every application card at `app/student/applications/applications-client.tsx:135-140`. The page renders no message link, and no message or inbox route exists under `app/**` (route tree searched; the only student navigation out of the card is the empty-state link at `applications-client.tsx:65-70`).
- **Why it matters:** the next step is imperative but impossible from this screen. Under `better-writing` and `unslop`, copy must describe a real next action or say plainly that there is none. A false next step costs trust at the exact moment a student is waiting on an outcome.
- **Concrete fix:** either add a real destination (a message route or a mailto link using founder contact data) or rewrite the copy to match the product, for example "Your founder will contact you when the next step is ready." and "Work starts now. Check your project brief." Do not leave imperative copy without a control.

### W2 - MED - Confirmed - Founder can regress an application status with no transition guard

- **Evidence:** `app/founder/projects/[id]/project-detail-client.tsx:216-222` renders all four statuses as buttons for every applicant and calls `setApplication` for any of them. The server action only validates that the target string is in the whitelist at `app/actions/projects.ts:188-190`, then updates it after an ownership check at `app/actions/projects.ts:192-204`. The low-level update has no predicate or transition rule at `lib/neon-data.ts:412-422`. The student page immediately reflects the changed status via `app/student/applications/applications-client.tsx:135-140`.
- **Why it matters:** an application can go from `rejected` back to `pending`, or `accepted` back to `shortlisted`. The student timeline and filter counts then contradict what the student was told. There is no audit trail to explain the change.
- **Concrete fix:** enforce a server-side transition map (for example `pending -> shortlisted|rejected`, `shortlisted -> accepted|rejected`, terminal states immutable unless an explicit reopen action is added). Disable invalid buttons in `project-detail-client.tsx:216-222` for the same transitions. Store who changed the status and when (D3).

### W3 - LOW - Confirmed - Filter state is not addressable by URL

- **Evidence:** `app/student/applications/applications-client.tsx:48` initializes the filter with `useState("all")`; `applications-client.tsx:83-88` never reads or writes the URL. `app/student/applications/page.tsx:17-47` accepts no `searchParams` and passes no initial filter.
- **Why it matters:** `/student/applications?status=pending` still renders All. A link from the dashboard cannot preselect the queue, and reload or browser Back loses the filter.
- **Overlap:** the desired deep link is already owned by `reports/component-relevance-audit.md:39` and `reports/component-relevance-audit.md:88`. This audit adds the receiving-page evidence above; it does not re-score the dashboard finding.
- **Concrete fix:** accept a validated `status` search param in `page.tsx`, pass it as `initialFilter`, and sync client changes with `router.replace` so `?status=pending` and Back behave consistently.

## Database/RLS findings

### D1 - Verified control (not a finding) - Read path is owner scoped and parameterized

- `app/student/applications/page.tsx:18-26` takes the student id from `supabase.auth.getUser()`, not from a query string, and passes it to `listStudentApplications`.
- `lib/neon-data.ts:429-436` uses a parameterized predicate `where a.student_id = ${studentId}` with a single joined query. There is no user-controlled application id on this route, so the classic IDOR shape is absent.
- `proxy.ts:110-130` gates the whole `/student` area for authentication and role before the page renders. The `if (user)` fallback in `page.tsx:25` is therefore not a public-data path.
- `app/error.tsx:18-55` catches a thrown database error from `lib/neon-data.ts:438-440`; the page does not silently turn a failed query into the "no applications" empty state.

### D2 - MED - Confirmed - `listStudentApplications` returns invalid `student_id` and `project_id` values

- **Evidence:** `lib/neon-data.ts:356-364` declares `student_id` and `project_id` as required strings. `lib/neon-data.ts:366-377` maps every row through `String(r.student_id)` and `String(r.project_id)`. The query at `lib/neon-data.ts:429-436` selects `a.id`, `a.status`, `a.created_at`, and a project object containing only `title`; it never selects `a.student_id` or `a.project_id`. Both fields therefore become the literal string `"undefined"`.
- **Why it matters:** the current page happens to discard both fields at `app/student/applications/page.tsx:27-32`, so there is no visible corruption today. The shared typed accessor is still wrong, and it blocks the already-requested row-to-project link in `reports/component-relevance-audit.md:43`: the page has no valid project id to link to.
- **Concrete fix:** select `a.student_id`, `a.project_id`, and `p.id` in the query at `lib/neon-data.ts:429-436`; extend the project object type at `lib/neon-data.ts:362` with `id`; map `id` in `mapApplication` at `lib/neon-data.ts:375`. Add a unit assertion that both id fields are UUIDs, not `"undefined"`.

### D3 - MED - Confirmed - Application table has no status timestamp or history

- **Evidence:** `neon/schema.sql:35-42` defines `applications` with `id`, `student_id`, `project_id`, `status`, and `created_at` only. No `updated_at`, no status history table, and no `changed_by` exist. The page can only show the application date at `app/student/applications/applications-client.tsx:122-128`.
- **Why it matters:** the UI cannot say when a decision happened or which stages were actually reached. That is the root cause of U1 and leaves W2 unobservable to the affected student. "Where it stands" is currently a current-state claim with no timeline provenance.
- **Concrete fix:** add `updated_at timestamptz not null default now()` to `public.applications` and set it in `lib/neon-data.ts:412-422`. For a real audit trail, add `public.application_status_history(application_id, from_status, to_status, changed_at, changed_by_ref)` and write one row per accepted transition in `app/actions/projects.ts:177-212`. Backfill existing rows before relying on it in the UI.

### Verified controls worth preserving

- Duplicate applications are blocked in the database by `unique (student_id, project_id)` at `neon/schema.sql:41`; `app/actions/projects.ts:122-128` maps error `23505` to a clear message. No application-layer-only uniqueness assumption.
- The query path is one join with no per-row database calls (`lib/neon-data.ts:429-436`); client filtering at `applications-client.tsx:50-54` adds no N+1. The `applications_student_idx` index at `neon/schema.sql:88` supports the owner predicate.
- No RLS is defined by design (`neon/schema.sql:1-4`, `lib/neon-data.ts:1-8`). That is acceptable for this route because authorization is in server code, but every future Neon endpoint touching `applications` must repeat the owner or founder-ownership check.

## Severity summary

| ID | Severity | Layer | Finding | Status |
|---|---|---|---|---|
| U1 | MED | UI/UX | Terminal rejection relabels earlier stages as "Not yet" | Confirmed, source |
| U2 | LOW | UI/UX | Applied date has no year and differs from project detail | Confirmed, source |
| U3 | LOW | UI/UX | Next-step guidance at 11px to 12px | Confirmed, source |
| W1 | MED | Workflow | "Message your founder" has no in-app destination | Confirmed, source |
| W2 | MED | Workflow | Founder can regress any application status without a transition guard | Confirmed, source |
| W3 | LOW | Workflow | Filter cannot be preselected by URL | Confirmed, source; overlap noted |
| D2 | MED | Database | Shared accessor returns `"undefined"` for two required ids | Confirmed, source |
| D3 | MED | Database | No status timestamp or history for applications | Confirmed, source |

Totals: **HIGH 0, MED 5, LOW 3**. No security exploit or cross-account data exposure was confirmed on this route.

## Recommended fixes

1. **D2 first:** select `a.student_id`, `a.project_id`, and `p.id` at `lib/neon-data.ts:429-436` and extend `mapApplication` at `lib/neon-data.ts:366-377`. This unblocks the row link already requested in `reports/component-relevance-audit.md:43`.
2. **D3 + U1:** add `updated_at` and a status-history table from `neon/schema.sql:35-42`; change `components/ui/status-timeline.tsx:48-53` to use reached-step data instead of index inference for terminal states.
3. **W2:** add a server-side transition whitelist in `app/actions/projects.ts:188-204`, mirror it in the buttons at `app/founder/projects/[id]/project-detail-client.tsx:216-222`, and record the actor in the history row.
4. **W1:** either provide a real contact destination for `components/ui/status-timeline.tsx:130,135` or rewrite those two strings to describe actual product behaviour.
5. **U2:** include the year at `app/student/applications/applications-client.tsx:124-127`, or share the formatter already used at `app/student/projects/[id]/page.tsx:77-81,86-90`.
6. **U3:** raise the smallest guidance text at `components/ui/status-timeline.tsx:95,107` and `applications-client.tsx:90,122` to 12px minimum and 13px to 14px for the "Next:" sentence.
7. **W3:** read a validated `?status=` value in `app/student/applications/page.tsx:17-47` and keep it in sync with `applications-client.tsx:48,83-88`.

## Notes/limitations

### Runtime limitation

No process was listening on `127.0.0.1:3000` when this audit ran, and no other local listener was identified as this app. Playwright was therefore not driven by this agent. All findings above are source-verified static findings. The interaction evidence in `reports/component-relevance-audit.md:43,65-67` (filter changes, count text, ArrowLeft focus movement) is prior runtime evidence from another agent, not a re-verification by this audit. No production build was run, and no dev server was started.

### Confirmed vs suspected

- **Confirmed:** U1, U2, U3, W1, W2, W3, D2, D3 are all confirmed by exact source lines read during this audit.
- **Suspected, not scored:** wrapping and truncation of long project titles at 375px and at large browser zoom were not observed at runtime; the `truncate` class at `applications-client.tsx:119` needs a rendered check.
- **Suspected, not scored:** whether any out-of-band email notification exists. W1 is confirmed only for the absence of an in-app destination and the absence of a contact control on this page.
- **Suspected, not scored:** whether a shortlisted-to-rejected transition occurred in production data. W2 confirms the capability in the UI and action, not a specific historical incident.
- **Checked but not reported:** no delete or withdraw action exists for applications (`deleteApplication` and `withdrawApplication` searches returned none). No requirement or prior report establishes withdrawal as expected behaviour, so the absence is not scored as a defect.

### Contrast check

Computed from the literal hex values: `#657069` on `#fffefa` is 5.11:1 and on `#f5f2ea` is 4.61:1; `#8a5a00` on `#f5f2ea` is 5.30:1; `#b23c26` on `#fffefa` is 5.83:1; focus ring `#d84f37` on the `#eae5d9` filter track is 3.28:1. These pass AA for normal text and the 3:1 non-text threshold. U3 is a readability recommendation, not a WCAG contrast failure.

### Reports read and overlap

Read at finalization: `reports/PROTOCOL.md`, `reports/SKILL-ASSIGNMENTS.md`, `reports/FINAL-AUDIT.md`, `reports/orchestrator.md`, `reports/orchestrator-audit.md`, `reports/visual-critic.md`, `reports/visual-recheck.md`, `reports/copy-critic.md`, `reports/accessibility-critic.md`, `reports/performance-seo.md`, `reports/content-integrity.md`, `reports/component-relevance-audit.md`, `reports/cold-eyes.md`, `reports/brand-tokens.md`, `reports/icon-fix.md`, `reports/dashboard-design-direction.md`, and `reports/page-audits/INDEX.md`. No `reports/page-audits/student-applications.md` existed before this file.

Overlap not duplicated here:

- Row title should link to the project brief: owned by `reports/component-relevance-audit.md:43`; D2 adds the missing data-layer cause.
- URL-preselected `?status=pending` from the student dashboard: owned by `reports/component-relevance-audit.md:39,88`; W3 adds the receiving-page evidence.
- Status is not conveyed by colour alone: already verified in `reports/accessibility-critic.md:43` (`StatusTimeline` plus text badges); no new finding.
- Colour-token normalization and focus-ring treatment: owned by `reports/brand-tokens.md:5-8`; no new finding.
- Dense dashboard design intent and status vocabulary: owned by `reports/dashboard-design-direction.md:41,72`; no new finding.
- Raw-path copy on other pages: owned by `reports/copy-critic.md:32`; no new finding.

### Uncommitted source state

`git status --short` showed `app/student/applications/applications-client.tsx` as modified at audit time. Its uncommitted changes (reduced-motion classes, the sr-only "Your applications by status" heading, and the focus-ring colour change to `#b23c26`) were treated as authoritative current source. None were reverted, overwritten, or scored as regressions.
