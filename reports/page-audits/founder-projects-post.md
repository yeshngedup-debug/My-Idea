# Page audit: `/founder/projects/post`

## Route

`/founder/projects/post` is the founder brief-authoring route. The server wrapper checks for a signed-in user and renders `PostProjectForm`; the client form calls the `createProject` server action, which rechecks the founder role, validates FormData with Zod, writes one row to Neon `public.projects`, and revalidates three dashboard paths. No API route handler is called from this page.

## Files traced

- `app/founder/projects/post/page.tsx:18-56` - route wrapper, auth check, sign-in fallback.
- `app/founder/projects/post/post-project-form.tsx:1-279` - client form state, readiness checklist, submit flow, ARIA markup.
- `app/actions/projects.ts:26-91` - `createProject` action; `:98-100` `createProjectFormAction` exists but is **not used by this form**.
- `lib/validators.ts:14-41` - skills transform and `createProjectSchema`.
- `lib/neon-data.ts:47-55` - `getProfileRole`; `:222-240` - `insertProject`.
- `lib/neon.ts:12-20` - `getSql()` and `DATABASE_URL` handling.
- `lib/supabase/server.ts:16-42` and `lib/env.ts:13-32` - server session client and env validation.
- `proxy.ts:27-34`, `:100-134`, `:137-142` - `/founder/*` gate, role fallback, CSP and matcher.
- `components/ui/shadcn/progress.tsx:20-74` - progress semantics used at `post-project-form.tsx:96-102`.
- `components/interactive/segmented-control.tsx:21-98` - existing comparison component for a toggle group.
- `neon/schema.sql:18-33` - `public.projects` columns and constraints.
- `lib/validators.test.ts:8-107` and `app/actions/projects.test.ts:11-124` - existing unit coverage.
- Reports read before finalizing: every existing `reports/*.md` and every existing `reports/page-audits/*.md`, including `reports/PROTOCOL.md`, `reports/SKILL-ASSIGNMENTS.md`, and `reports/page-audits/INDEX.md:26`.

No other server action, query, mutation, or API route is reachable from this route. `revalidatePath` at `app/actions/projects.ts:87-89` is the only cache mutation.

## Skills used

| Skill | Application |
|---|---|
| `unslop` | Checked labels, hints, and error copy for filler or AI tells. No copy finding. |
| `better-interface` | Judged the form feedback loop: readiness bar, missing list, submit state, error state. |
| `better-layout` | Checked the two-panel grouping, full-width submit, and 320px-friendly stacking intent. |
| `better-ui` | Checked token use, focus rings, 44px targets, badge chips, and the shared `Progress` component. |
| `better-writing` | Checked labels and messages against `design/voice-guide.md`; no copy finding. |
| `frontend-a11y` | Checked label association, ARIA roles, live regions, keyboard semantics, and error association. |
| `better-accessibility` | Checked WCAG 2.2 focus, name, and error-identification requirements. |
| `webapp-testing` | Used Playwright MCP for route/auth checks; limits are recorded in `Notes/limitations`. |
| `security-review` | Checked auth, role recheck, auth-derived `founderId`, input validation, and secrets. |
| `api-security-testing` | Confirmed there is no reachable API surface on this page; reviewed the server-action boundary instead. |

Precedence from `reports/SKILL-ASSIGNMENTS.md:5-12` was applied: `unslop` for minimal copy, `better-*` for evidence-based interface findings, `frontend-a11y`/`better-accessibility` for WCAG findings, and the security skills for the data section.

## UI/UX findings

### Confirmed

**U1 - MED - Error feedback is global, not field-level.** `app/founder/projects/post/post-project-form.tsx:59-65`, `:88-93`, `:113-122`, `:130-139`, `:185-196`, `:203-228`. The form sets `noValidate` at `:88`, so native validation bubbles are disabled. The custom check at `:63-65` writes one sentence to a top-level `role="alert"` at `:89-93`. No failing input receives `aria-invalid`, `aria-describedby`, `aria-errormessage`, or focus. A grep of the current file finds only the alert at `:90` and the progress description at `:101`; there is no `aria-invalid` anywhere. Why it matters: a keyboard or screen-reader user who submits an incomplete brief hears "Still needed: ..." but is not told which control failed and is not taken to it. The `required`/`minLength` attributes remain in the accessibility tree, but the visible custom error is not bound to them. Fix: keep `noValidate`, track the failing field IDs from `requirements`, set `aria-invalid="true"` plus `aria-describedby` to per-field message IDs, render short messages beside each field, and focus the first invalid control. Alternatively remove `noValidate` and use the native messages already implied by `:118-120`, `:135-137`, `:189`, and `:211-225`. Status: Confirmed in current source; runtime screen-reader behavior not verified. Cross-reference: `reports/accessibility-critic.md:46` claims `aria-describedby`/`aria-invalid` wiring in this form at old line numbers; current source no longer contains it. The same field-association class is owned as a finding in `reports/page-audits/founder-profile.md:60`.

**U2 - MED - Work mode uses radio semantics without radio keyboard behavior.** `app/founder/projects/post/post-project-form.tsx:233-255`. The group has `role="radiogroup"` at `:237`; each button has `role="radio"` and `aria-checked` at `:242-243`. There is no arrow-key handler, no Home/End handler, and no roving `tabIndex`, so both buttons stay in the Tab order and arrow keys do nothing. Why it matters: the ARIA radio pattern promises ArrowLeft/ArrowRight movement and a single tab stop. Keyboard users must Tab through both buttons and cannot use the expected group keys. Fix either add roving tabindex plus Arrow/Home/End handlers that set `workMode` and move focus, or replace the block with the existing `SegmentedControl` (`components/interactive/segmented-control.tsx:21-98`) and use its documented `role="group"` plus `aria-pressed` toggle-button model instead of false radio semantics. Status: Confirmed in current source. Cross-reference: `reports/component-relevance-audit.md:46` records the radiogroup as present and says "None" for gaps; that report checks presence, not keyboard behavior. `reports/component-relevance-audit.md:48` owns the same arrow-key gap for availability buttons on another route.

**U3 - LOW - Progress description is attached to the wrapper, not the progressbar.** `app/founder/projects/post/post-project-form.tsx:96-102` and `components/ui/shadcn/progress.tsx:43`, `:53-63`. The form passes `aria-describedby="post-form-missing"` to `Progress`; the component spreads extra props on the outer `div` at `:43`, while `role="progressbar"` lives on the inner `div` at `:55`. Why it matters: the "Still needed" text is not programmatically associated with the progressbar that announces `aria-valuetext`. Impact is limited because the paragraph at `post-project-form.tsx:103` is itself an `aria-live="polite"` region and will announce changes. Fix: add an explicit prop in `Progress` and spread `aria-describedby` onto the inner progressbar at `progress.tsx:53-63`, or remove the misleading attribute and keep only the live region. Status: Confirmed in current source.

### Verified passes, not findings

- `Label htmlFor` matches `id` for title, description, skill input, duration, and deadline (`post-project-form.tsx:112-113`, `:127-131`, `:143-146`, `:184-186`, `:258-260`). Budget fields use explicit `aria-label` at `:212` and `:226`.
- Focus-visible rings, `min-h-11`/`h-12` targets, and the cream/forest/vermilion tokens are present throughout the form. Copy follows the repo voice guide; no hype, emoji, tracked labels, or repeated intent was found.
- `Progress` supplies `role="progressbar"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and a readable `aria-valuetext` (`progress.tsx:53-60`) from `post-project-form.tsx:96-102`.

## Workflow findings

### Confirmed

**W1 - MED - Comma-separated skill entry makes the badge list disagree with the stored list.** `app/founder/projects/post/post-project-form.tsx:33-37`, `:70`, `:143-160`, `:162-177`; `lib/validators.ts:14-23`. The placeholder at `:155` invites `React, Figma, Python...`, but `addSkill()` at `:33-37` stores the whole trimmed string as one badge. The submit handler joins badges with commas at `:70`, and the server schema splits on commas, trims, filters, and caps at 15 at `lib/validators.ts:16-22`. One visible badge can therefore become three stored skills. The 15-item guard at `post-project-form.tsx:35` counts badges, while the server cap counts split tokens, so tokens past the 15th are silently dropped. Why it matters: the founder cannot trust the chip summary shown on the form, and the skills stored on the project can differ from what the form displayed. Fix: split `skillInput` on commas inside `addSkill()`, trim each token, dedupe per token, and cap the state array at 15; or change the placeholder to "One skill at a time" if single-token entry is intended. Status: Confirmed in current source; `lib/validators.test.ts:91-105` confirms the server-side split.

**W2 - MED - A role-lookup failure produces a silent submit failure.** `app/actions/projects.ts:35`, `:71-85`; `post-project-form.tsx:77-84`; `lib/neon-data.ts:47-54`. `getProfileRole(user.id)` is called at `app/actions/projects.ts:35` outside the `try` block that starts at `:71`. `getProfileRole` rethrows database errors at `lib/neon-data.ts:52-54`. The client callback at `post-project-form.tsx:77-84` awaits `createProject(fd)` with no `catch`, so a rejected action never reaches `setStatus` at `:82`. Why it matters: during a transient Neon outage the user sees "Posting..." end, the button returns to "Post project", and no error appears. That invites repeated attempts on a paid brief flow. Fix: wrap the role lookup and insert in a single `try/catch` returning `{ ok: false, message: 'Could not post project. Try again.' }`, log the real error server-side, and add a `.catch` in the client callback that sets the same user-facing message. Status: Confirmed in current source; runtime confirmation was blocked by the hydration limitation in `Notes/limitations`. This is mutation-specific and does not duplicate the read-page role-failure findings in `reports/page-audits/student-overview.md:156-171`, `reports/page-audits/admin-overview.md:64`, and `reports/page-audits/founder-overview.md:109`.

### Suspected, not counted as a confirmed defect

**S1 - LOW - The page guard checks only authentication, not founder role.** `app/founder/projects/post/page.tsx:19-22`, `:40-41`. Any signed-in user would be rendered `PostProjectForm`; there is no `getProfileRole` call in this wrapper. Normal traffic is stopped by `proxy.ts:124-131`, and the action rechecks founder at `app/actions/projects.ts:35-38`, so this is not an exploitable path in the verified routing setup. Why it matters: if the proxy matcher is narrowed or the component is rendered through another entry point, a student or admin sees the full posting form and only learns of the restriction after submit. Fix: call `getProfileRole(user.id)` in the page and render a role-appropriate denial before the form, as suggested for the same class at `reports/page-audits/founder-browse-students.md:93` and `reports/page-audits/founder-overview.md:109`. Status: Suspected, defence-in-depth only; not reachable in the verified runtime and therefore not included in the severity totals.

## Database/RLS findings

### Confirmed

**D1 - MED - Budget bounds allow values the database cannot store.** `app/founder/projects/post/post-project-form.tsx:203-228`, `lib/validators.ts:34-35`, `neon/schema.sql:29-30`, `app/actions/projects.ts:83-85`. The two number inputs set `min={1}` and `step={1}` but no `max`. Zod requires only positive numbers. The columns are `numeric(10,2)`, whose upper bound is `99999999.99`. A user can enter, for example, `100000000`, pass the client readiness check at `post-project-form.tsx:50-54` and the validator, then hit a numeric overflow on insert. The catch at `app/actions/projects.ts:83-85` turns that into the generic "Could not post project. Try again." message. Why it matters: a reachable input produces an opaque failure instead of a clear bound or a successful write. Fix: add `.max(99999999.99, 'Budget must be at most 99999999.99.')` to both budget fields in `createProjectSchema` and matching `max` attributes on both inputs; or widen the columns and update both layers to the same contract. Align `step` with the chosen decimal policy at the same time. Status: Confirmed in current source.

**D2 - LOW - The 120-character title cap exists only in the client.** `app/founder/projects/post/post-project-form.tsx:120` sets `maxLength={120}`; `lib/validators.ts:27` sets only `.min(5)`; `neon/schema.sql:20` uses unconstrained `text`. Why it matters: crafted FormData or a future non-form caller can store titles the UI contract forbids, which can overflow table cells and cards that assume the shorter value. It is not a current injection or authorization issue. Fix: add `.max(120, 'Title must be at most 120 characters.')` to `createProjectSchema`. Status: Confirmed in current source; impact requires bypassing the rendered form.

### Verified passes, not findings

- **No IDOR on create.** `app/actions/projects.ts:75` sets `founderId: user.id` from the verified Supabase session. No founder ID or project ID is accepted from the browser on this route.
- **No SQL injection.** The only write uses the parameterized tagged template at `lib/neon-data.ts:225-235`; `getProfileRole` is also parameterized at `:50`.
- **Role checks exist at two layers.** `proxy.ts:100-132` validates the JWT with `getUser()` and redirects users outside `/founder`; `app/actions/projects.ts:32-38` rechecks authentication and founder role before validation or insert.
- **No Neon RLS by design.** `neon/schema.sql:1-4` states that authorization lives in application code and no RLS policies are created. Supabase RLS does not govern these direct Neon writes. This architecture is already owned by `reports/FINAL-AUDIT.md:31-44` and `reports/orchestrator-audit.md:116`; this route adds no bypass and no duplicate global finding is raised.
- **Input validation is centralized.** `app/actions/projects.ts:41-55` trims inputs and uses `createProjectSchema.safeParse`; description length, duration enum, work mode, positive budgets, and the min/max ordering are enforced at `lib/validators.ts:27-41`. Zod also rejects `NaN` and `Infinity` for budgets, verified locally against the installed version.
- **Deadline handling is server-enforced.** `app/actions/projects.ts:60-69` rejects invalid or past dates before insert; the field is optional at `post-project-form.tsx:257-267`.
- **Cache invalidation covers the affected dashboards.** `app/actions/projects.ts:87-89` revalidates `/founder/projects`, `/founder`, and `/student/projects`.
- **No API route handler, no secrets, and no payment state are reachable from this page.** The paid-shortlist checks in `reports/page-audits/founder-shortlists.md` are out of scope. `createProjectFormAction` at `app/actions/projects.ts:98-100` is unused by this form, so its discarded-result behavior is not a route finding.

## Severity summary

| Severity | Confirmed findings | IDs | Suspected findings |
|---|---|---|---|
| HIGH | 0 | none | 0 |
| MED | 5 | U1, U2, W1, W2, D1 | 0 |
| LOW | 2 | U3, D2 | S1 (LOW, defence-in-depth only) |

The audit found no HIGH defect. The five MED items are local to this form and its action: error association, radio keyboard semantics, skill parsing, silent action failure, and an unenforced budget bound.

## Recommended fixes

1. **U1:** add field-level error state in `post-project-form.tsx`, wire `aria-invalid`/`aria-describedby`, and focus the first invalid control on submit.
2. **U2:** implement roving tabindex plus Arrow/Home/End selection for the work-mode group, or replace it with `SegmentedControl` and `aria-pressed` buttons.
3. **W2:** move the role lookup inside the action's `try`, return a generic error, and catch rejected actions in the client callback so the `role="alert"` is always used.
4. **W1:** split comma-separated skills in `addSkill()` so one badge always equals one stored skill.
5. **D1:** align budget bounds across the inputs, Zod schema, and `numeric(10,2)` columns.
6. **U3:** forward `aria-describedby` to the inner progressbar in `components/ui/shadcn/progress.tsx` or drop the attribute.
7. **D2:** add `.max(120)` to `createProjectSchema.title`.
8. **S1, optional hardening:** check founder role in `page.tsx` before rendering the form.

## Notes/limitations

- **Runtime method and limit.** Playwright MCP was used. `http://localhost:3000` returned `net::ERR_CONNECTION_REFUSED`, so checks used `http://127.0.0.1:3000`. Unauthenticated `GET /founder/projects/post` redirected to `/login`, confirming the proxy gate. An authenticated founder context (`founder-post-critic`) loaded the page. However, the form did not hydrate in that harness: controls had no React internal props, the `post-project-form` client chunk was not observed, typing in `#title` did not move the progress bar, and an empty submit caused a native GET to `/founder/projects/post?` with no `role="alert"`. The console repeated `WebSocket connection to 'ws://127.0.0.1:3000/_next/hmr?id=...' failed: net::ERR_INVALID_HTTP_RESPONSE`. These observations are treated as a dev/harness hydration failure, not product defects. U1, U2, U3, W1, W2, D1, and D2 are therefore source-verified only where runtime confirmation is absent.
- **Server stopped during the final pass.** A later attempt to re-drive the page got `ERR_CONNECTION_REFUSED`, and no listener remained on ports 3000-3005. Interactive keyboard behavior and screen-reader announcements were not verified.
- **No valid submission was made.** Only empty or invalid interactions were used in the browser; no project row was created. `npm run build` was not run while `next dev` had been active.
- **Read-only scope preserved.** No product source, config, schema, test, or existing report was edited. Both target files were already modified in the working tree before this audit; their current contents were treated as authoritative. `reports/page-audits/INDEX.md:26` still says `pending`; this audit does not edit that index.
- **Overlaps referenced, not duplicated.** `reports/accessibility-critic.md:46`, `reports/component-relevance-audit.md:11,46,48`, `reports/page-audits/founder-profile.md:60`, `reports/page-audits/student-overview.md:156-171`, `reports/page-audits/admin-overview.md:64`, `reports/page-audits/founder-overview.md:109`, `reports/page-audits/founder-browse-students.md:93`, `reports/FINAL-AUDIT.md:31-44`, and `reports/orchestrator-audit.md:116` were read and are cited above where relevant. No shared global finding is re-scored here.
