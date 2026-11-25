## Route

`/founder/projects` - founder's own posted-project list. Read-only critic audit. Existing uncommitted changes in `app/founder/projects/page.tsx`, `app/founder/projects/projects-client.tsx`, `app/founder/projects/error.tsx`, and `app/founder/projects/loading.tsx` were treated as authoritative and were not modified.

## Files traced

- `app/founder/projects/page.tsx` - server auth, session-scoped data load, heading, post link.
- `app/founder/projects/projects-client.tsx` - status filter, keyboard handler, count announcement, mobile list, desktop table, empty state.
- `app/founder/projects/error.tsx`, `app/founder/projects/loading.tsx` - error and loading boundaries.
- `components/interactive/segmented-control.tsx` - shared filter button behaviour and focus contract.
- `components/ui/badge.tsx`, `components/layout/pinned-heading-section.tsx`, `components/layout/workspace-page-heading.tsx` - status display and workspace chrome.
- `lib/supabase/server.ts`, `proxy.ts` - SSR Supabase client, JWT validation, signed-out redirect, role gate.
- `lib/neon.ts`, `lib/neon-data.ts` - Neon client, `listProjectsByFounder`, project mapper, status update helpers, error wrapping.
- `app/founder/projects/[id]/page.tsx`, `app/actions/projects.ts` - downstream destination of "View applicants" and its ownership checks.
- `neon/schema.sql`, `supabase/schema.sql`, `supabase/run-all.sql`, `supabase/migrations/20261026000000_fix_projects_rls.sql` - status constraints, indexes, RLS history.
- `reports/SKILL-ASSIGNMENTS.md`, `design/brand-guidelines.md`, `design/voice-guide.md`, `lib/design-tokens.ts` - precedence, voice, and token contract.
- Existing reports read before finalizing: all top-level `reports/*.md`, `reports/page-audits/INDEX.md`, and targeted overlap reports. Overlaps are referenced below, not duplicated.

## Skills used

Assigned skills were read and applied with `reports/SKILL-ASSIGNMENTS.md` precedence. Repo voice and `better-*` evidence governed interface findings; `frontend-a11y` and `better-accessibility` governed WCAG review; `webapp-testing` governed the browser drive; `security-review` and `api-security-testing` governed the auth and data-layer trace.

- `unslop` - `C:\Users\DELL\.config\opencode\skills\unslop\SKILL.md`
- `better-interface` - `C:\Users\DELL\.config\opencode\skills\better-interface\SKILL.md`
- `better-layout` - `C:\Users\DELL\.config\opencode\skills\better-layout\SKILL.md`
- `better-ui` - `C:\Users\DELL\.config\opencode\skills\better-ui\SKILL.md`
- `better-writing` - `C:\Users\DELL\.config\opencode\skills\better-writing\SKILL.md`
- `frontend-a11y` - `C:\Users\DELL\.config\opencode\skills\frontend-a11y\SKILL.md`
- `better-accessibility` - `C:\Users\DELL\.config\opencode\skills\better-accessibility\SKILL.md`
- `webapp-testing` - `C:\Users\DELL\.config\opencode\skills\webapp-testing\SKILL.md`
- `security-review` - `C:\Users\DELL\.config\opencode\skills\security-review\SKILL.md`
- `api-security-testing` - `C:\Users\DELL\.config\opencode\skills\strix\api-security-testing\SKILL.md`

## UI/UX findings

### Confirmed

**U1 - MED - Every row action has the same accessible name.**
- `app/founder/projects/projects-client.tsx:214-219` and `:270-275` - all seven rendered links say only `View applicants`, with no `aria-label`, visually hidden project title, or `title`.
- Why it matters: a screen-reader link list becomes seven identical entries, and the title is not programmatically associated with the row. The desktop title is a plain `<td>` (`:254-256`) rather than `th scope="row"`, so row context is not supplied automatically. The user cannot tell which brief will open without inspecting each target.
- Fix: put the project title inside each link as visually hidden text, for example `View applicants for {p.title}`, or add a matching `aria-label`. In the table, also make the title cell `th scope="row"`.

**U2 - LOW - Row action hit area is smaller than the adjacent primary controls.**
- `app/founder/projects/projects-client.tsx:47-48` - `ROW_LINK` uses `min-h-9`.
- `app/founder/projects/projects-client.tsx:17` and `:46` - primary links use `min-h-11`.
- Why it matters: Playwright measured the row links at 36px and `Post a project` at 44px. The 36px target still clears WCAG 2.5.8 minimum, so this is not a proven WCAG failure, but it is inconsistent and harder to hit on touch.
- Fix: raise `ROW_LINK` to `min-h-11` and give the mobile card link a full-width or padded tap area.

**U3 - LOW - Long project titles are truncated, and mobile loses more information.**
- `app/founder/projects/projects-client.tsx:200-201` - mobile title uses `truncate`.
- `app/founder/projects/projects-client.tsx:254-255` - desktop title uses `max-w-xs truncate`.
- Why it matters: at 1440px no seeded title was cut, but at 375px five of seven titles were truncated, including `Scope verification brief 1795535788506`. The full value is reachable by opening the project, so this is a scanability issue, not data loss.
- Fix: allow two-line wrapping (`line-clamp-2` plus `break-words`) and keep `title={p.title}` for hover; do not rely on the tooltip alone.

**U4 - LOW - Posting dates omit the year.**
- `app/founder/projects/projects-client.tsx:105-109` - formatter emits day and short month only.
- `app/founder/projects/projects-client.tsx:211-213` and `:266-268` - both responsive presentations use it.
- Why it matters: all seven seeded rows rendered `24 Nov`. A project carried across a year boundary becomes ambiguous, and ordering by recency cannot be checked from the visible date.
- Fix: include the year (`24 Nov 2026`) or show a relative label with the full date in `title`/screen-reader text.

### Suspected / not proven

**S1 - LOW - Date locale is hard-coded.**
- `app/founder/projects/projects-client.tsx:105-109` - `toLocaleDateString('en-GB', …)`.
- Why it matters: the app renders `lang="en"` and has no locale switcher, so this is not a current defect. It will resist a future `en-BT` or user-locale preference and will silently differ from browser expectations.
- Fix: centralize the locale in one config value or pass `undefined` so the browser locale is used, then reuse it across workspace tables.

## Workflow findings

### Confirmed runtime symptom, suspected root cause

**W1 - MED - The status filter did not change the visible list, pressed state, or count.**
- `app/founder/projects/projects-client.tsx:157-164` - `SegmentedControl` is wired to `setFilter`.
- `app/founder/projects/projects-client.tsx:97-103` - `filtered` derives from `filter`.
- `app/founder/projects/projects-client.tsx:148-151`, `:175-190`, and `:183-189` - count, empty state, and reset button all read the same state.
- Why it matters: in the captured authenticated session, clicking `Open` left `All:true` and every other button `false`, left the status at `Showing all 7 projects`, and left seven rows. Pressing `ArrowRight` while `Open` was focused also left focus and state unchanged. That blocks the only way to isolate project stages on this page. Source wiring is present, so the root cause is unresolved: a stale dev bundle, hydration failure, or event-handler regression is suspected. This is not declared a proven production failure.
- Fix: reproduce on a clean dev restart or production build before changing logic. If it reproduces, collapse the two keyboard handlers into one explicit `selectOnArrow` path and verify that `onChange` reaches `setFilter`.

### Confirmed

**W2 - MED - A `status` query parameter is ignored.**
- `app/founder/projects/page.tsx:19` - the page accepts no `searchParams`.
- `app/founder/projects/projects-client.tsx:57` - initial state is always `all`.
- `reports/component-relevance-audit.md:44` and `:89` - the overview-to-filter handoff was previously recommended and remains unimplemented.
- Why it matters: `?status=in_progress` still rendered `Showing all 7 projects` in the captured session. Today no live overview link sends that parameter, so this is a latent navigation defect rather than a currently broken in-app link, but it prevents bookmarkable or shareable filtered views.
- Fix: read and allow-list `searchParams.status` in the server page, pass it as `initialFilter`, and initialize client state from it. Keep unknown values on `all`.

**W3 - LOW - Arrow-key selection logic is duplicated and contradicts the shared control's contract.**
- `app/founder/projects/projects-client.tsx:6-9` - the file comment says the keyboard operation needs no custom handler here.
- `app/founder/projects/projects-client.tsx:60-95` - a wrapper handler maps arrow/Home/End keys by DOM index.
- `components/interactive/segmented-control.tsx:21-24` and `:37-63` - the shared control documents arrows as focus-only and already handles the same keys.
- Why it matters: two handlers react to one keydown. Current labels are unique, so this is source-confirmed code-quality debt, not a proven separate failure, but a localized label or nested span could make focus and selection diverge. It is also a plausible contributor to W1.
- Fix: add an explicit `selectOnArrow` prop to `SegmentedControl`, key selection by `option.value`/`data-value`, and remove the wrapper handler and stale comment.

### Verified controls - no new finding

- Signed-out `GET /founder/projects` returned `307` to `/login`, matching `proxy.ts:110-113`. The defensive signed-in card at `projects-client.tsx:115-130` is therefore unreachable through normal navigation but is harmless.
- The error boundary logs details to the console (`error.tsx:14-16`), uses `role="alert"` (`:20-22`), and offers retry plus a founder-home link (`:31-45`). Its claim that data is safe (`:27-30`) is accurate because this route performs no writes.
- The loading boundary uses `role="status"`, `aria-busy`, and `motion-reduce:animate-none` (`loading.tsx:4-15`); no loading-state finding.

## Database/RLS findings

### Confirmed

**D1 - LOW - The list query fetches every project column for a four-field view.**
- `lib/neon-data.ts:297-306` - `select * from public.projects where founder_id = ${founderId}`.
- `app/founder/projects/page.tsx:28-33` - only `id`, `title`, `status`, and `created_at` survive.
- `lib/neon-data.ts:191-208` - the mapper still materializes description, budget, skills, deadline, and other unused fields.
- Why it matters: this is one parameterized query, not an N+1, and `neon/schema.sql:87` provides an index on `(founder_id, created_at desc)`. The cost is unnecessary transfer and mapping for every founder row, which grows with the founder's history.
- Fix: add a narrow list projection and pass that row type directly, with server-side pagination or a bounded limit if the list can grow large.

### Suspected / downstream only

**D2 - LOW - The applicant-status write reached through this page uses a check-then-update window.**
- `app/actions/projects.ts:193-204` - ownership is checked by loading the application and project, then a separate update call runs.
- `lib/neon-data.ts:395-410` and `:412-422` - `getApplication` and `updateApplicationStatusRow` are separate statements; the update is keyed by application id only.
- Why it matters: no write occurs on `/founder/projects`, and no exploit was demonstrated. If project ownership changes between the two statements, the update could still run. Project status updates are safer because they fold ownership into the `WHERE` clause at `lib/neon-data.ts:252-266`.
- Fix: use one conditional update such as `update applications … where id = ${id} and exists (select 1 from projects where id = project_id and founder_id = ${founderId})`, and treat zero affected rows as an authorization failure.

### Verified controls - no new finding

- **No route-level IDOR.** The browser supplies no project id to this page. `page.tsx:20-27` reads the signed-in user from `supabase.auth.getUser()` and calls `listProjectsByFounder(user.id)`; the founder id never comes from the URL or form. The downstream detail route rechecks `p.founder_id !== user.id` before loading applicants (`app/founder/projects/[id]/page.tsx:33-51`).
- **No SQL injection found.** `listProjectsByFounder` uses a tagged, parameterized Neon query (`lib/neon-data.ts:302-305`). No interpolated request data was found in the traced route.
- **Status vocabulary is bounded.** `FILTERS` at `projects-client.tsx:23-29` matches the Neon check constraint at `neon/schema.sql:25`: `open`, `in_progress`, `review`, `completed`. The fallback label at `:111-113` is defensive, not a current mismatch.
- **RLS is not the enforcement point.** `lib/neon-data.ts:1-7` and `neon/schema.sql:1-4` state that Neon has no RLS and authorization stays in application code. This is already owned by `reports/FINAL-AUDIT.md:59` and `reports/orchestrator-audit.md:116`; it adds no new bypass on this read-only, session-scoped route.
- **Stale Supabase baseline is superseded.** `supabase/schema.sql:80` still has `anyone_read_open_projects … using (true)`, but `supabase/migrations/20261026000000_fix_projects_rls.sql:31-36` explicitly drops it and narrows public reads to `status = 'open'`. The app reads Neon, so this is not active behaviour here.
- **Proxy role-failure fallback is not re-litigated.** `safeRole()` collapsing a Neon error to `student` (`proxy.ts:27-34`, `:123-131`) is already recorded in `reports/page-audits/admin-projects.md:82-86`, `reports/page-audits/founder-overview.md:109`, and `reports/page-audits/student-overview.md:158-168`.

## Severity summary

| ID | Area | Severity | Status |
|---|---|---|---|
| U1 | UI/UX | MED | Confirmed |
| U2 | UI/UX | LOW | Confirmed |
| U3 | UI/UX | LOW | Confirmed |
| U4 | UI/UX | LOW | Confirmed |
| S1 | UI/UX | LOW | Suspected / future-proofing only |
| W1 | Workflow | MED | Confirmed runtime symptom, suspected root cause |
| W2 | Workflow/navigation | MED | Confirmed |
| W3 | Workflow/keyboard | LOW | Confirmed, code-quality only |
| D1 | Database/perf | LOW | Confirmed |
| D2 | Database/authz, downstream | LOW | Suspected, not demonstrated on this route |

Totals: **0 HIGH, 3 MED, 7 LOW** (8 confirmed, 2 suspected). No High finding was found in this route's current source.

## Recommended fixes

1. **W1 and W2 first.** Reproduce the filter on a clean server or production build, then fix `onChange` and collapse the duplicate arrow-key logic. Add allow-listed `searchParams.status` handling so deep links preselect the filter.
2. **U1.** Give each `View applicants` link a unique accessible name containing the project title, and mark the title cell as a row header in the table.
3. **U3, U2, U4, S1.** Wrap long titles, enlarge the row link target, show the year, and centralize date-locale choice.
4. **D1.** Replace `select *` with a narrow founder-list projection and bound the result set if growth warrants it.
5. **D2.** Fold project ownership into the applicant-status `UPDATE` so the check and write cannot drift apart.

## Notes/limitations

- **Playwright was used while the dev server was live.** Signed-out fetches redirected to `/login`; a founder login with `founder.dorji@btc-e2e.test` reached `/founder/projects` with `h1` `My Projects`. Measured results: `Showing all 7 projects`, filter state `All:true` with all others `false`, no state change after clicking `Open`, no focus or state change after `ArrowRight`, seven identical `View applicants` names at 36px, `Post a project` at 44px, all dates `24 Nov`, no truncation at 1440px, and five truncated titles at 375px.
- **The filter symptom could not be re-confirmed at report time.** Port 3000 later refused connections. No new dev server was started, and `npm run build` was not run. Console output contained dev-only HMR WebSocket handshake errors; these were treated as environment noise, not product findings.
- **No child agents were spawned.** All tracing and checks were performed inline.
- **No product files were edited.** Only this report was written. Existing uncommitted changes remain authoritative.
- **Overlap discipline.** This report does not repeat the app-layer authorization model, `safeRole` failure fallback, corrected Supabase project RLS policy, or stale literal-arrow finding already covered in the reports cited above. `reports/component-relevance-audit.md:45` recorded the former absence of a filter; this report checks the now-present implementation and its runtime behaviour instead.
- **Index not updated.** `reports/page-audits/INDEX.md` remains untouched because this critic was limited to writing its own report file. Its row for `/founder/projects` should be marked `done` by the owning process.
