# Student project detail audit

## Route

`/student/projects/[id]`

Read-only critic pass. No product source, config, schema, test or existing report was changed. Uncommitted working-tree changes were treated as authoritative.

## Files traced

- `app/student/projects/[id]/page.tsx:1-151` (audited route)
- `app/student/projects/page.tsx:37-101` (listing source and open-status filter)
- `app/student/projects/projects-client.tsx:32-42,162-192` (existing Apply control and status feedback)
- `app/actions/projects.ts:102-135` (`applyToProject`)
- `lib/neon-data.ts:242-250,282-289,322-340` (`getProject`, open-project list, full project list)
- `lib/supabase/server.ts:16-42` (server-side auth)
- `proxy.ts:100-134` (role-area guard)
- `components/ui/badge.tsx:1-21`
- `lib/design-tokens.ts:18-47`, `app/globals.css:3-27`, `design/brand-guidelines.md:3-6`
- `supabase/schema.sql:67-90`, `supabase/projects-table.sql:46-49` (status, work-mode and application uniqueness constraints)
- `app/student/loading.tsx:1-5`, `app/error.tsx:18-55`, `app/not-found.tsx:16-50` (boundary coverage)
- All 19 `reports/*.md` files and `reports/page-audits/INDEX.md` were read before finalizing.

## Skills used

Precedence follows `reports/SKILL-ASSIGNMENTS.md:5-13`.

- `unslop`: checked for AI-tell copy and decorative action. No new AI-tell copy found.
- `better-interface`: evidence and severity discipline; findings are tied to source lines.
- `better-layout`: checked the single-column document rhythm and two-column field grid.
- `better-ui`: checked badge, focus ring, target size and reduced-motion handling.
- `better-writing`: checked labels such as "Back to open projects" and "Budget on request" against `design/voice-guide.md`.
- `frontend-a11y` and `better-accessibility`: checked heading order, visible focus, reduced motion and text-only status labels.
- `webapp-testing`: loaded for live-check criteria. No live run was possible; see Notes/limitations.
- `security-review`: checked auth, object visibility, authorization placement and data exposure.
- `api-security-testing`: requested but unavailable in this install (`C:\Users\DELL\.config\opencode\skills\api-security-testing\SKILL.md` does not exist), so it is not claimed as used.

## UI/UX findings

### Confirmed

**U1 - LOW - Hardcoded colors bypass the token source; one value is off-token.**
`app/student/projects/[id]/page.tsx:99,104,106,109,112,118,125,128,137`

Why it matters: `design/brand-guidelines.md:3-6` and `lib/design-tokens.ts:18-47` declare the token files as the source of truth. This page repeats literal hex values instead. `#4c5a52` at `:99` and `:118` is not present in `lib/design-tokens.ts` or `app/globals.css:3-27`, while the tokenized secondary body role is `#56645c` (`app/globals.css:25-26`). This is token drift, not a measured contrast failure.

Concrete fix: replace literals with the existing semantic utilities, for example `text-body-secondary` for the back link and description, `bg-card`/`border-border` for the card, `text-primary` for headings and values, `bg-background`/`text-primary` for the status badge, and `text-muted-foreground` for `dt`/`h2` labels.

### Suspected

None.

### Verified, not findings

- The status dot is decorative only (`aria-hidden="true"`) and the status text remains readable at `app/student/projects/[id]/page.tsx:109-115`.
- The single-underscore formatter at `:114` and the work-mode ternary at `:72` are safe for the current constrained values (`supabase/schema.sql:74`, `supabase/projects-table.sql:46-49`).
- Loading and error coverage exists through `app/student/loading.tsx:1-5`, `app/error.tsx:18-55` and `app/not-found.tsx:16-50`; no route-specific boundary gap was found.
- The uncommitted edits in this file add `min-w-0`, `break-words` and `motion-reduce:transition-none!` at `:99,106,128`; those fixes are already present and are not counted.

## Workflow findings

### Confirmed

**W1 - HIGH - already owned: the detail page cannot complete the apply decision.**
`app/student/projects/[id]/page.tsx:94-149`; owner report: `reports/component-relevance-audit.md:42,81-82`

Why it matters: the page presents a brief for a read-and-decide task but the render ends after the skills list. There is no `applyToProject` call, no form, no Apply/Applied button and no application-status control. The only apply path is the listing card at `app/student/projects/projects-client.tsx:163-180`. This is the clearest missing affordance already ranked by the owning report, so it is referenced rather than re-litigated.

Concrete fix: use the owner's fix. Extract the existing card apply action into a reusable control and place it on this detail page with the same `Apply -> Sending... -> Applied` states and `role=status`/`role=alert` feedback. Add the detail path to the `revalidatePath` list in `app/actions/projects.ts:131-133` when that control is added.

### Suspected

None.

### Verified, not findings

- The back link at `app/student/projects/[id]/page.tsx:97-102` points to the open-projects listing and has a visible focus ring.
- `applyToProject` checks the signed-in user, student role, open status and duplicate-insert error at `app/actions/projects.ts:106-129`; the duplicate rule is enforced in the database at `supabase/schema.sql:90`.

## Database/RLS findings

### Confirmed

**D1 - MED - Direct URL can expose a non-open project to any signed-in student.**
`app/student/projects/[id]/page.tsx:41-42,60`; `lib/neon-data.ts:242-246`; `app/student/projects/page.tsx:56`

Why it matters: the listing restricts students to `status = 'open'` (`app/student/projects/page.tsx:56`), but the detail page calls the generic `getProject(id)` for any authenticated user and only checks whether a row exists. `getProject` selects all statuses (`lib/neon-data.ts:245`). `proxy.ts:123-131` checks the `/student` area only, not project visibility. A student with a known non-open project ID can therefore read its title, description, budget, duration, work mode, deadline and skills. There is no Neon RLS to catch this; `README.md:9` and `lib/neon-data.ts:1-7` place authorization in server code. The SQL is parameterized, so this is object visibility, not injection.

Concrete fix: add a student-scoped helper, for example `getStudentVisibleProject(id, userId)`, that requires `status = 'open'` or an existing application for that `userId`, then call it from `app/student/projects/[id]/page.tsx:42` and keep `notFound()` at `:60` for no visible row. Do not simply add `status = 'open'` to the shared `getProject`, because founders and admins need all statuses (`app/actions/projects.ts:116,157,197`; `app/actions/admin-students.ts:117`).

### Suspected

None.

### Verified, not findings

- `id` reaches SQL only through a tagged template parameter at `lib/neon-data.ts:245`; no string concatenation was found on this read path.
- Application uniqueness is enforced by `unique (student_id, project_id)` at `supabase/schema.sql:90` and mapped to the user-facing duplicate message at `app/actions/projects.ts:125-126`.
- Project status values are constrained at `supabase/schema.sql:74`, and the apply action rejects non-open projects at `app/actions/projects.ts:118-120`.
- The student ID used for application ownership comes from the server session (`app/actions/projects.ts:106-108`), not from browser input.

## Severity summary

| Severity | New confirmed here | Carried from owner | Suspected |
|---|---:|---:|---:|
| HIGH | 0 | 1 (W1, `component-relevance-audit.md`) | 0 |
| MED | 1 (D1) | 0 | 0 |
| LOW | 1 (U1) | 0 | 0 |

## Recommended fixes

1. Track W1 with `reports/component-relevance-audit.md`: add the reusable Apply control to this detail page and revalidate the detail path after a successful application.
2. Fix D1 in the route, not in the shared helper: require `status = 'open'` or an existing application for the signed-in student before rendering the project.
3. Fix U1 by replacing hardcoded hex classes with the existing semantic Tailwind tokens, and bring `#4c5a52` onto the documented token palette if that exact shade is intended.

## Notes/limitations

- Static audit only. No listener was found on `localhost:3000` or `localhost:3001`, and no seeded student browser session was available, so Playwright MCP was not run against this route. No runtime claim is made about rendered layout, live interaction or console output.
- No `npm run build`, typecheck, lint or test command was run in this audit. No dev server was started, and no build was run alongside one.
- `api-security-testing` was assigned but not installed; the security pass relied on `security-review` plus direct source tracing.
- Overlaps were cross-referenced instead of duplicated: W1 belongs to `reports/component-relevance-audit.md:42,81-82`; the detail-page document rhythm is owned by `reports/dashboard-design-direction.md:77-81`.
- The working tree contains uncommitted changes across many product files. This report reads them as current and does not revert or overwrite any of them.
