# Student projects audit

## Route

`/student/projects` - authenticated student workspace feed of open projects.

Read-only critic pass. No product source, config, schema, test, existing report,
or uncommitted user change was edited. The only file written by this audit is
this report.

## Files traced

- `app/student/projects/page.tsx:1-102` - audited server route.
- `app/student/projects/projects-client.tsx:1-253` - audited client feed and Apply control.
- Supporting trace only, not edited:
  - `app/actions/projects.ts:60-68,102-135` - deadline validation and `applyToProject`.
  - `lib/neon-data.ts:74-83,242-250,282-332,380-393,443-455` - project/profile/application queries.
  - `proxy.ts:100-134` - role-area guard.
  - `app/layout.tsx:15-20` - root metadata title template.
  - `neon/schema.sql:1-4,18-42` - no-RLS design, project/application constraints.
  - `lib/design-tokens.ts:18-47` and `design/brand-guidelines.md:3-6` - canonical visual tokens.
- All 28 `reports/**/*.md` files present at audit time were read before finalizing.
  Direct overlaps are referenced below instead of restated as new findings:
  `reports/component-relevance-audit.md:13,41-42,81-85`,
  `reports/page-audits/student-project-detail.md:42-48,64-69,87`,
  `reports/visual-recheck.md:148`, `reports/page-audits/for-students.md:36`,
  and `reports/page-audits/INDEX.md:28`.
- Runtime check: Playwright MCP in a fresh isolated context at 1280x900 with the
  seeded student account. No `Apply` click and no application, order, shortlist,
  or profile data was mutated.

## Skills used

Precedence follows `reports/SKILL-ASSIGNMENTS.md:5-13`.

- `unslop`: checked for AI-tell copy and decorative action. No new AI-tell copy found.
- `better-interface`: evidence and severity discipline; findings are tied to file and line.
- `better-layout`: checked the single-column feed rhythm and sticky heading handoff.
- `better-ui`: checked badges, target sizes, focus rings, and reduced-motion classes.
- `better-writing`: checked labels against `design/voice-guide.md`.
- `frontend-a11y` and `better-accessibility`: checked heading order, live regions,
  decorative-element hiding, and text-only status labels.
- `webapp-testing`: used for the isolated browser pass and DOM evidence.
- `security-review` and `api-security-testing`: checked auth, ownership, SQL
  parameterization, and application-layer authorization placement.

## UI/UX findings

### Confirmed

**U1 - MED - No search or filter on a data-rich feed.**
`app/student/projects/projects-client.tsx:233-250`; data source at
`app/student/projects/page.tsx:66-80`.

Why it matters: each card carries skills, work mode, budget, duration and
deadline, but the feed renders every row in order with no way to narrow by
skill, text, or Remote/On-site. Finding a matching brief is pure scanning. This
gap is already owned at `reports/component-relevance-audit.md:41,85`; this pass
adds route-specific runtime evidence: 7 rendered articles, 0 visible text
inputs, and button text limited to `Log out`, six `Applied`, and one `Apply`.

Concrete fix: follow the owner's recommendation at
`reports/component-relevance-audit.md:85`: reuse the existing `Input` plus
`SegmentedControl` for Remote/On-site, add a `role=status` count such as
`Showing 2 of 7 open projects`, and narrow the rendered cards.

Status: Confirmed (source and rendered DOM). Carried from owner, not duplicated.

**U2 - LOW - Page title duplicates the brand suffix.**
`app/student/projects/page.tsx:16`; template at `app/layout.tsx:17-19`.

Why it matters: the route metadata already includes `| Bhutan Tech Connect`,
then the root template appends the brand again. Runtime `document.title` was
`Open Projects | Bhutan Tech Connect | Bhutan Tech Connect`. The same class of
title duplication was recorded for dashboards at
`reports/component-relevance-audit.md:13`; this is new evidence for this route.

Concrete fix: change `page.tsx:16` to `{ title: 'Open Projects' }` and let the
root template add `| Bhutan Tech Connect`, or use an absolute title if the
route must override the template.

Status: Confirmed (source and runtime).

**U3 - LOW - Skill badges are silently capped at five.**
`app/student/projects/projects-client.tsx:119-134`, especially `:123`.

Why it matters: `(project.required_skills ?? []).slice(0, 5)` drops any sixth
or later skill with no `+N more` indicator. A student can judge fit from an
incomplete skill set and apply to a brief that requires more than the card
shows. The seeded rows had only one or two skills, so the truncation itself was
not triggered at runtime.

Concrete fix: render an explicit `+N more` badge after the first five, with an
`aria-label` such as `3 more required skills`, and link it to the detail view
where the full list can be shown; or render the full list if the field is
bounded in practice.

Status: Confirmed (source behavior); runtime trigger not observed.

**U4 - LOW - Hardcoded hex classes bypass the canonical token system.**
`app/student/projects/projects-client.tsx:81,85,90,93,101-107,114,118,121,127,137,143,149,155,167-171,177,186-188,237`.

Why it matters: `design/brand-guidelines.md:3-6` and
`lib/design-tokens.ts:18-47` declare the token files as the source of truth.
This feed repeats literal hex utilities instead. The same issue on the detail
route is already owned at `reports/page-audits/student-project-detail.md:42-48`;
this finding is the listing-route instance and adds no new palette judgment.

Concrete fix: replace literals with the existing semantic utilities already
used elsewhere, for example `bg-card`, `border-border`, `text-primary`,
`text-body-secondary`, `bg-background`, and the named accent classes. Verify
the rendered result after the swap rather than changing hex values in place.

Status: Confirmed (source).

### Suspected

None beyond the runtime-trigger caveat in U3.

### Verified, not findings

- One visible `h1` (`Open Projects`) comes from `page.tsx:88-93`; the feed adds
  only an `sr-only` `h2` at `projects-client.tsx:235`, and cards use `h3` at `:111`.
  Runtime heading order was h1 -> h2 -> h3 with no skipped level.
- Apply and detail targets are at least 44px tall and carry visible focus rings
  (`projects-client.tsx:167,177`). The status dot is decorative and hidden
  (`projects-client.tsx:102-105`); the text status remains readable.
- Apply feedback uses `role=status` for success and `role=alert` for failure
  (`projects-client.tsx:183-191`). No feedback node is present before an Apply
  attempt, which is appropriate.
- Budget, duration, work mode and deadline are all rendered from real row data
  (`projects-client.tsx:69-78,135-158`). This agrees with the data-layer
  accuracy already recorded at `reports/page-audits/for-students.md:36`.
- Runtime horizontal overflow was false at 1280px (`scrollWidth 1265`,
  `innerWidth 1280`). No page errors were captured; the only console errors were
  dev-server HMR WebSocket handshake failures.

## Workflow findings

### Confirmed

**W1 - HIGH - Carried: the detail route cannot complete the apply decision.**
`app/student/projects/projects-client.tsx:162-180`; owner reports
`reports/component-relevance-audit.md:42,81-82` and
`reports/page-audits/student-project-detail.md:64-69`.

Why it matters: the only Apply control on this flow lives inside the listing
card. `View details` at `projects-client.tsx:175-180` sends the student to a
read-only brief, so the page where the decision is made has no action. This is
the highest-priority workflow gap already ranked by the owning report.

Concrete fix: use the owner's fix. Extract the card's Apply button plus its
`role=status`/`role=alert` result into a reusable control and mount it on the
detail page with `Apply -> Sending... -> Applied` states. Add the detail path to
the `revalidatePath` list at `app/actions/projects.ts:131-134` when that control
lands.

Status: Confirmed (owner-verified; this pass did not re-click Apply). Carried,
not duplicated.

### Suspected

**W2 - MED - Expired deadlines can remain listed and applicable.**
`app/student/projects/page.tsx:56`;
`app/student/projects/projects-client.tsx:73-78,163-174`;
`app/actions/projects.ts:60-68,118-120`.

Why it matters: `createProject` rejects a past deadline at posting time
(`app/actions/projects.ts:60-68`), but dates pass after posting. The listing
filters only `status === 'open'` and the Apply action also checks only
`status !== 'open'`; neither re-checks `deadline`. An open row whose deadline
has passed still renders an enabled Apply button and can accept a new
application. The current seeded rows all showed future deadlines (six `24 Dec`,
one `15 Dec` against 24 Nov 2026), so the failure was not triggered at runtime.

Concrete fix: filter open rows with `deadline is null or deadline >= current_date`
in the SQL query used by `page.tsx:52-56`, add the same deadline check to
`applyToProject` at `app/actions/projects.ts:116-120`, and either hide expired
rows or show a disabled `Apply by <date> - Closed` state at
`projects-client.tsx:163-174`.

Status: Suspected (source path is clear; runtime data did not contain a past deadline).

**W3 - LOW - Client applied state can drift from server truth.**
`app/student/projects/projects-client.tsx:204-229`; server revalidation at
`app/actions/projects.ts:131-134`.

Why it matters: `useState(appliedIds)` and `useState<string[]>` are initialized
from server props once. A successful local Apply updates state, but an external
change (another tab applying, a founder closing the project, an admin removing
an application) is not reconciled unless the whole page reloads. The button can
remain stale until then.

Concrete fix: keep server props authoritative by syncing when `appliedIds`
changes, for example `useEffect(() => setApplied(appliedIds), [appliedIds])`,
or key the client list on a server-derived revision. After a successful apply,
call `router.refresh()` in addition to the server action's `revalidatePath`.

Status: Suspected (code path identified; not reproduced in this read-only pass).

### Verified, not findings

- `applyToProject` checks signed-in user, `student` role, project existence,
  `open` status, and duplicate-insert error at `app/actions/projects.ts:103-134`.
- The student ID comes from the server session at `app/actions/projects.ts:106-108`,
  not from browser input.
- Runtime showed six disabled `Applied` buttons and one enabled `Apply` button,
  matching the seeded application IDs. No Apply click was made, so no data changed.
- Every `View details` link used a project UUID path at runtime.

## Database/RLS findings

### Confirmed

**D1 - MED - Student feed fetches every project row, then filters in memory.**
`app/student/projects/page.tsx:52-56`;
`lib/neon-data.ts:322-332`;
narrower existing helper at `lib/neon-data.ts:282-295`.

Why it matters: `listAllProjectsWithDetails()` runs
`select * from public.projects order by created_at desc`, then `page.tsx:56`
keeps only `status === 'open'`. Closed, in-progress and review rows are read and
mapped for every student page load, and status truth is split between SQL and
JavaScript. `listOpenProjects()` already filters in SQL but omits `founder_id`
and `status`, which is why the page bypasses it. The cost grows with the
project table and the split invites future status-rule drift.

Concrete fix: extend `OpenProjectRow` and `listOpenProjects()` at
`lib/neon-data.ts:268-295` to select `founder_id` and `status` as well, add the
deadline condition from W2, then call that helper from `page.tsx:52-56` and
remove the in-memory `filter`.

Status: Confirmed (source).

**D2 - LOW - Missing user silently becomes an empty feed rather than a redirect.**
`app/student/projects/page.tsx:37-46`;
route guard at `proxy.ts:110-131`;
empty state at `app/student/projects/projects-client.tsx:236-239`.

Why it matters: normally `proxy.ts` redirects an unauthenticated request to
`/login` and a wrong-role user to their own dashboard; an unauthenticated probe
of this route returned `307`. But if that guard is bypassed or `getUser()`
fails after the proxy check, this server component still returns
`projects = []` and the UI says `No open projects right now. Check back soon.`
That masks an auth failure as an empty dataset.

Concrete fix: in `page.tsx`, replace the `if (user) { ... }` wrapper with an
explicit `if (!user) redirect('/login')`, then load data unconditionally. Keep
the proxy as the first line of defence, not the only one.

Status: Suspected (defense-in-depth gap; the normal unauthenticated path was
observed to redirect correctly).

### Suspected

No additional suspected RLS or injection findings.

### Verified, not findings

- No browser-supplied student ID reaches a query. The ID is `user.id` from the
  server session (`page.tsx:38-41,54`) and the query is parameterized at
  `lib/neon-data.ts:443-451`.
- Founder display names are fetched only for IDs present on the visible rows
  (`page.tsx:58-64`) through a parameterized `any($ids::uuid[])` predicate at
  `lib/neon-data.ts:74-83`. No full-founder-table read was found.
- Application uniqueness is enforced in the database by
  `unique (student_id, project_id)` at `neon/schema.sql:35-42` and mapped to a
  user-facing duplicate error at `app/actions/projects.ts:122-127`.
- `neon/schema.sql:1-4` explicitly states that this Neon schema has no RLS and
  that authorization lives in server actions and middleware. The findings above
  are therefore application-layer findings, not missing-policy findings.
- All traced SQL uses tagged-template parameters; no string concatenation was
  found on this route's read or apply paths.

## Severity summary

| Severity | New confirmed here | Carried from owner | Suspected |
|---|---:|---:|---:|
| HIGH | 0 | 1 (W1) | 0 |
| MED | 1 (D1) | 1 (U1) | 1 (W2) |
| LOW | 3 (U2, U3, U4) | 0 | 2 (W3, D2) |

## Recommended fixes

1. **HIGH:** complete W1 with the owner's reusable Apply control on the detail
   route and add that path to `revalidatePath` (`app/actions/projects.ts:131-134`).
2. **MED:** add the deadline rule to both the student query and `applyToProject`,
   and disable or hide Apply on expired rows (W2, D1).
3. **MED:** add `Input` search plus a Remote/On-site `SegmentedControl` and a
   `role=status` count to the feed (U1).
4. **MED:** make `listOpenProjects()` return the fields this feed needs and stop
   reading all project rows in `page.tsx:52-56` (D1).
5. **LOW:** set the route title to `Open Projects` so the root template supplies
   the single brand suffix (U2).
6. **LOW:** expose `+N more required skills` instead of silently truncating at
   five (U3).
7. **LOW:** replace hardcoded hex utilities with the canonical semantic tokens (U4).
8. **LOW:** reconcile client applied state with server props and redirect
   explicitly when no user is present (W3, D2).

## Notes/limitations

- Static audit plus one authenticated browser pass. No `npm run build`,
  typecheck, lint or test command was run, and no build was run alongside the
  running `next dev` server.
- The browser pass used a fresh isolated Playwright context at 1280x900 and the
  seeded student account. Evidence captured: runtime title
  `Open Projects | Bhutan Tech Connect | Bhutan Tech Connect`; one `h1`, one
  `sr-only h2`, seven article cards; six disabled `Applied` buttons and one
  enabled `Apply`; one hidden input and no search/filter controls; deadlines
  `24 Dec` on six cards and `15 Dec` on one; `scrollWidth 1265` against
  `innerWidth 1280`; no page errors. Console errors were limited to five dev
  HMR WebSocket handshake failures and are not treated as product defects.
- No Apply click was made. No application, order, shortlist, profile or project
  row was created, changed or deleted by this audit.
- Not verified in this pass: 320px reflow, physical screen-reader behaviour,
  200% zoom, and formal WCAG contrast ratios. The earlier pass recorded no
  horizontal overflow on student routes at 320px (`reports/visual-recheck.md:151`),
  but that was not re-measured here.
- Overlaps were referenced rather than duplicated: search/filter and the detail
  Apply gap belong to `reports/component-relevance-audit.md:41-42,81-85`; the
  detail-page Apply and token findings are recorded at
  `reports/page-audits/student-project-detail.md:42-48,64-69`; dashboard title
  duplication is recorded at `reports/component-relevance-audit.md:13`;
  budget/deadline display accuracy is recorded at
  `reports/page-audits/for-students.md:36`; prior Apply/Applied rendering is
  recorded at `reports/visual-recheck.md:148`.
- `reports/page-audits/INDEX.md:28` still marks this route as pending. That
  index was not edited because this audit was authorized to write only this
  report file.
