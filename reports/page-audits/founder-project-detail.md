# Founder project detail page audit

## Route

`/founder/projects/[id]` — the founder workspace detail page for one project. It loads the project after a session and ownership check, lists that project's applicants, shows project/applicant status timelines, exposes CV and email links, and renders project and applicant status controls.

## Files traced

- `app/founder/projects/[id]/page.tsx:22-71` — server auth, project read, ownership check, applicant read, page shell.
- `app/founder/projects/[id]/project-detail-client.tsx:54-239` — applicant UI, status buttons, live result message, CV/mail links.
- `app/founder/projects/[id]/loading.tsx:1-17` — route loading state observed on the malformed-ID path.
- `app/founder/projects/[id]/error.tsx:7-48` — route error boundary with retry and back links.
- `app/actions/projects.ts:137-213` — status whitelists, ownership checks, revalidation.
- `lib/neon-data.ts:4-7,242-250,252-262,400-422` — no-RLS posture, project lookup, project update, application lookup/update.
- `app/api/cv/[id]/route.ts:22-92` — CV proxy authorization used by the page's "View CV" links.
- `proxy.ts:100-142` — founder area role gate.
- `components/ui/status-timeline.tsx:30-121,146-172` — labelled status stepper and status vocabularies.
- `app/layout.tsx:127-137` — skip link, global polite live region, motion provider.
- `supabase/migrations/20261024000000_init_btc.sql:76-104` — UUID ids and constrained status text.
- `reports/PROTOCOL.md`, `reports/SKILL-ASSIGNMENTS.md` — reporting and skill-precedence rules.
- Existing reports read before finalizing: all `reports/*.md` and all other `reports/page-audits/*.md`; overlap references are named below instead of duplicated.

## Skills used

Loaded and applied from `reports/SKILL-ASSIGNMENTS.md`:

- `better-interface` — shared severity scale, evidence bar, escalation trigger for an error with no recovery path.
- `better-accessibility` — keyboard, role/state, group-label and announcement review against WCAG 2.2 AA.
- `frontend-a11y` — React button/ARIA pattern checks.
- `unslop` — minimal-copy and AI-tell pass; no copy finding reached the reporting bar.
- `apple-design` — reduced-motion and interaction-physics expectations; used with its precedence over generic motion advice.
- `security-review` — auth, input validation, authorization and data-layer boundary checks.

Precedence applied: `unslop` for copy, `apple-design` for motion, `better-*` for evidence-based interface findings, and `security-review` for authorization/data-layer findings. `design-taste-frontend` was not loaded for this route audit, so no landing/portfolio aesthetic claim is made.

## UI/UX findings

Confirmed findings:

| ID | Severity | Exact location | Evidence and why it matters | Concrete fix |
|---|---|---|---|---|
| U1 | `HIGH` | `app/founder/projects/[id]/page.tsx:27,36`; `lib/neon-data.ts:242-250`; `app/founder/projects/[id]/loading.tsx:6-14`; `app/founder/projects/[id]/error.tsx:7-48` | Runtime with the seeded founder session: `/founder/projects/not-a-uuid` returned 200 and stayed on "Loading applicants…" after ~11.5s. The response body contained `invalid input syntax for type uuid: "not-a-uuid"` and a `NeonDataError` stack through `getProject`; the route error boundary was not shown. The raw route param reaches `getProject(id)`, whose `where id = ${id}` throws instead of returning `null`. This blocks the task and gives no recovery path, which is a `better-interface` escalation trigger. The diagnostic leak was observed in dev only; production masking was not verified. | Validate `id` as a UUID before the database read and call `notFound()` for malformed IDs. Catch `NeonDataError` around the project/applicant reads and send unexpected failures to `error.tsx`, which already offers retry and back links. Add a regression check for `/founder/projects/not-a-uuid` that ends in a not-found or error state, never a perpetual loading state. |
| U2 | `MED` | `app/founder/projects/[id]/project-detail-client.tsx:122-138`; `app/founder/projects/[id]/project-detail-client.tsx:215-231` | Runtime DOM audit found 8 accessible `aria-pressed` buttons and zero `role="group"` elements. The four applicant buttons repeat the same labels on every card, so a screen reader announcing a pressed state does not hear which project or applicant set owns it. Names, focus rings and the current-state `disabled` behaviour passed; this finding is only the missing group context. | Wrap the project buttons in `<div role="group" aria-label={`Project status for ${project.title}`}>` and each applicant set in `<div role="group" aria-label={`Applicant status for ${s?.full_name ?? 'applicant'}`}>`. Keep native buttons, visible text, `aria-pressed` and the disabled current state. Do not add custom keyboard handling. |

Verified passing, not findings:

- Seven valid project IDs returned 200 and rendered applicant data plus status controls; zero horizontal overflow at 320/375/768/1440.
- One `h1` ("Project applicants") per rendered detail route; 17 consecutive Tab stops had visible focus rings.
- With `prefers-reduced-motion: reduce`, no CSS animations were found on the target controls; `loading.tsx:11-13` uses `motion-reduce:animate-none`.
- Console output was limited to HMR websocket failures during the dev run.

## Workflow findings

Confirmed finding:

| ID | Severity | Exact location | Evidence and why it matters | Concrete fix |
|---|---|---|---|---|
| W1 | `MED` | `app/actions/projects.ts:173`; `app/actions/projects.ts:212`; `app/founder/projects/[id]/project-detail-client.tsx:72,80,93-100` | Both status actions return generic strings ("Project status updated.", "Applicant status updated."). The client places them in a local `role="status"`/`role="alert"` element. In a long applicant list, the announcement does not say which applicant changed or what the new status is; U2 removes the surrounding group context as well. This is source-confirmed; an actual post-mutation announcement was not driven because no status data was mutated. | Include the subject and new state in the result message, e.g. `Applicant status updated: {full_name} is now {label}.` Derive the name/label in the client or return them from the action; keep the existing `role=status`/`role=alert` switch and do not write to a second live region. |

Verified passing, not findings:

- `app/actions/projects.ts:137-138` whitelists project and applicant statuses, matching the database constraints in `supabase/migrations/20261024000000_init_btc.sql:83,97`.
- `app/actions/projects.ts:152-162,188-201` checks authentication and project ownership before both status writes; `:170-172,209-211` revalidate the affected paths.
- "View CV" links target `app/api/cv/[id]/route.ts`, which checks session, founder/admin role, relationship or confirmed order, and issues a 300s signed URL (`:32-56,63-92`).
- `proxy.ts:100-134,137-142` validates the Supabase JWT and gates `/founder` by role area.

## Database/RLS findings

Confirmed finding:

| ID | Severity | Exact location | Evidence and why it matters | Concrete fix |
|---|---|---|---|---|
| D1 | `LOW` | `lib/neon-data.ts:4-7`; `lib/neon-data.ts:412-422`; `app/actions/projects.ts:193-204`; `lib/neon-data.ts:252-262` | There is no Neon-side RLS; authorization lives in application code. The low-level `updateApplicationStatus(id, status)` helper issues `update public.applications set status = ${status} where id = ${id}` with no founder or project predicate. The current server action does load the application and verify the parent project's `founder_id` before calling it, and the project-status helper already includes `founder_id`. No current caller bypass was found, so this is a defense-in-depth hardening gap, not a proven cross-founder write. | Add a founder predicate to the helper: accept `founderId` (and optionally `projectId`), join or subquery `public.projects where founder_id = ${founderId}`, rename it to `updateApplicationStatusForFounder`, and update the single action call site. Add a test that a valid application id plus the wrong founder id updates zero rows. |

Overlaps, not duplicated:

- Broad post-RLS authorization summary belongs to `reports/FINAL-AUDIT.md:31-41`; this report only adds route-level tracing and D1's helper predicate detail.
- Prior accessibility-runtime limits live in `reports/accessibility-critic.md:12,29,43,49-54`; this route audit adds the missing authenticated runtime evidence without restating its global contrast findings.
- Component-inventory context lives in `reports/component-relevance-audit.md:8,114`; dashboard visual baselines in `reports/visual-recheck.md:141,148,172`; the sibling static-audit limitation in `reports/page-audits/student-project-detail.md:118`.

Suspected, not counted:

- D1 becomes exploitable only if a future caller invokes the low-level helper without the action's ownership check. No such caller exists in the traced route.
- Production behaviour of the malformed UUID path was not verified; U1's raw database error appeared in the dev response only.

## Severity summary

| Confirmed finding | Severity | Area |
|---|---|---|
| U1 — malformed UUID leaves loading state and leaks dev error | `HIGH` | UI/UX, data-layer boundary |
| U2 — status button sets lack accessible group labels | `MED` | Accessibility, UI/UX |
| W1 — status announcements omit subject and new state | `MED` | Workflow, screen-reader feedback |
| D1 — application status helper has no founder predicate | `LOW` | Database/RLS hardening |

No suspected item was promoted to a confirmed finding. No `HIGH` authorization bypass was found on this route.

## Recommended fixes

1. Validate the route UUID in `app/founder/projects/[id]/page.tsx` before `getProject(id)`, convert malformed IDs to `notFound()`, and let unexpected Neon errors reach the existing `error.tsx` retry UI. Cover `/founder/projects/not-a-uuid` with a regression check.
2. Add labelled `role="group"` wrappers around the project status set and each applicant status set in `project-detail-client.tsx`; keep native buttons and existing focus treatment.
3. Make status messages name the applicant and new status, and keep the single local `role=status`/`role=alert` switch as the announcement path.
4. Harden `lib/neon-data.ts:412-422` with a founder/project predicate and rename it so callers cannot mistake it for an unscoped helper.
5. Leave `reports/page-audits/INDEX.md` status unchanged; the orchestrator owns that update.

## Notes/limitations

- Read-only critic run: no product source, config, schema, test, or other report file was edited. The working tree contains many uncommitted product changes, including the audited route files; they were treated as authoritative and left untouched.
- Playwright MCP was used in an isolated context (`founder-detail-audit`) against the running dev server with the seeded founder `founder.dorji@btc-e2e.test` / `LocalTest123!` from `README.md:69-77` and `supabase/seeds/local-dev.sql:10,21,38`. No status, order, application or shortlist data was mutated.
- A final recheck could not connect to `http://127.0.0.1:3000`; the malformed-ID evidence above comes from the earlier successful runtime capture. No production claim is made.
- No physical screen reader, 200% browser zoom, post-mutation announcement, production build, typecheck, lint, or test command was run. `npm run build` was deliberately not run while `next dev` was active.
- No child agents were used; one agent performed the UI, workflow, and database checks. All existing `reports/*.md` and `reports/page-audits/*.md` files were read before finalizing.
