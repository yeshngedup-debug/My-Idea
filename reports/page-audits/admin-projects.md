## Route

`/admin/projects` — admin-only project list with a status filter. Read-only critic audit. Uncommitted working-tree changes in `app/admin/projects/page.tsx` and `app/admin/projects/projects-client.tsx` were treated as authoritative and were not modified.

## Files traced

- `app/admin/projects/page.tsx` — server auth guard, server-side data load, error state.
- `app/admin/projects/projects-client.tsx` — filter, keyboard handling, mobile list, desktop table, empty/error states.
- `lib/neon-data.ts` — `getProfileRole`, `listProfilesByIds`, `listAllProjectsWithDetails`, `ProjectRow`, `ProjectRow` mapping.
- `lib/supabase/server.ts` — server Supabase client and cookie handling.
- `proxy.ts` — `/admin/*` route protection and role redirect.
- `components/interactive/segmented-control.tsx` — filter buttons, focus/keyboard contract.
- `components/ui/badge.tsx` — status badge class merging.
- `components/layout/pinned-heading-section.tsx`, `components/layout/simple-layout.tsx`, `components/layout/workspace-page-heading.tsx`, `app/admin/layout.tsx`, `app/layout.tsx` — workspace chrome, sticky offsets, `h1`.
- `lib/design-tokens.ts`, `design/brand-guidelines.md`, `design/voice-guide.md` — token and voice contract.
- `supabase/migrations/20261024000000_init_btc.sql`, `supabase/migrations/20261026000000_fix_projects_rls.sql` — project status constraint and Supabase RLS history.
- Existing reports read before finalizing: every `reports/*.md` and the only existing page audit, `reports/page-audits/INDEX.md`. Overlaps are referenced below, not duplicated.

## Skills used

Assigned skills were read and applied, with `reports/SKILL-ASSIGNMENTS.md` precedence (repo brand/voice documents and `better-*` evidence govern interface findings here):

- `unslop` — `C:\Users\DELL\.config\opencode\skills\unslop\SKILL.md`
- `better-interface` — `C:\Users\DELL\.config\opencode\skills\better-interface\SKILL.md`
- `better-layout` — `C:\Users\DELL\.config\opencode\skills\better-layout\SKILL.md`
- `better-ui` — `C:\Users\DELL\.config\opencode\skills\better-ui\SKILL.md`
- `better-writing` — `C:\Users\DELL\.config\opencode\skills\better-writing\SKILL.md`
- `frontend-a11y` — `C:\Users\DELL\.config\opencode\skills\frontend-a11y\SKILL.md`
- `better-accessibility` — `C:\Users\DELL\.config\opencode\skills\better-accessibility\SKILL.md`
- `webapp-testing` — `C:\Users\DELL\.config\opencode\skills\webapp-testing\SKILL.md`
- `security-review` — `C:\Users\DELL\.config\opencode\skills\security-review\SKILL.md`
- `api-security-testing` — `C:\Users\DELL\.config\opencode\skills\strix\api-security-testing\SKILL.md`

## UI/UX findings

### Confirmed

**U1 — MED — Long project titles are truncated with no way to see the full value.**
- `app/admin/projects/projects-client.tsx:187-189` — mobile `<h3>` uses `truncate`.
- `app/admin/projects/projects-client.tsx:235-236` — desktop table cell uses `max-w-xs truncate`.
- Why it matters: the title is the primary identifier in this list. There is no admin project-detail route under `app/admin/projects/`, so a long or distinctive title becomes permanently unreadable from this page, especially on mobile and at narrower desktop widths. This weakens the "table as work surface" direction recorded in `reports/dashboard-design-direction.md:65-75`.
- Fix: allow two-line wrapping (`line-clamp-2` plus `break-words`) and add `title={row.title}` for hover, or add a project detail link so the full title is reachable by keyboard and touch. Do not rely on the tooltip alone.

**U2 — LOW — Small amber/ochre text is off-token and inconsistent with the status vocabulary.**
- `components/layout/workspace-page-heading.tsx:21` — eyebrow uses `text-[#8a5a00]`.
- `app/admin/projects/projects-client.tsx:38` — `open` badge uses `border-amber-200 bg-amber-50 text-[#8a5a00]`.
- Why it matters: `design/brand-guidelines.md:17-21,124-128` reserves vermilion `#b23c26` for small text and treats amber highlights as decorative, never body text on paper. Tailwind `amber-50`/`amber-200` are also outside the canonical token set in `lib/design-tokens.ts:18-72`. Static contrast math for `#8a5a00` on paper/surface is about 5.30:1 / 5.87:1, so this is a token drift finding, not a proven WCAG failure.
- Fix: use `colors.smallTextAccent` (`#b23c26`) or `colors.textMuted` (`#657069`) for the eyebrow, and tokenized status colors from `lib/design-tokens.ts` for badges. Keep the text label plus dot so status is not color-only.

**U3 — LOW — Filter keyboard selection is implemented twice and keyed by visible label text.**
- `app/admin/projects/projects-client.tsx:66-98` — wrapper handler maps arrow/Home/End keys to a filter by matching `target.textContent?.trim()` against `FILTERS`.
- `components/interactive/segmented-control.tsx:21-24,37-63` — the shared control already moves focus with those keys and explicitly documents arrow keys as a focus shortcut, with selection via native button Enter/Space.
- Why it matters: current labels are unique, so this is not a present functional failure. The duplication is brittle: a localized label, icon, or nested span would make focus movement and selected state diverge. It also overrides the shared component's documented contract without a named prop.
- Fix: move the "select on arrow" behavior into `SegmentedControl` behind an explicit `selectOnArrow` prop, and derive the target from `option.value`/`data-value` instead of `textContent`; remove the wrapper handler.

### Suspected / not proven

**S1 — LOW — Date formatting ignores the user or application locale.**
- `app/admin/projects/projects-client.tsx:132-137` — hard-codes `toLocaleDateString("en-GB", …)`.
- Why it matters: the app renders `lang="en"` (`app/layout.tsx:65-68`) and has no visible locale switcher, so this is not a defect today. It will silently resist future localization or an `en-BT` preference.
- Fix: centralize the locale in one config value (or pass `undefined` to use the browser locale) and reuse it across workspace tables.

## Workflow findings

### Confirmed

**W1 — MED — Authentication and authorization failures are rendered as a generic retry state.**
- `app/admin/projects/page.tsx:28-33` — missing session sets `"Your session has expired…"`; non-admin sets `"Admins only."`.
- `app/admin/projects/page.tsx:55-58` — any thrown error overwrites the reason with `"Could not load projects. Try again."`.
- `app/admin/projects/projects-client.tsx:104-116` — all errors render the same `role="alert"` panel with a `router.refresh()` "Try again" button.
- Why it matters: refreshing cannot fix an expired session or a role denial, so the only offered action is guaranteed to reproduce the failure. `proxy.ts:110-131` normally redirects before the page renders, but this page was deliberately given its own server guard; that defensive path should still give a correct next step.
- Fix: separate auth/authz errors from transient load errors. For auth failures, `redirect('/login')` or redirect to the verified role home; for genuine load failures, keep retry. Keep the generic message only for unexpected errors and log details server-side, as the page already does at `page.tsx:56`.

**W2 — MED — A profile-name lookup failure after projects load is swallowed and shown as partial data.**
- `app/admin/projects/page.tsx:35-52` — `rows` is assigned before `listProfilesByIds` runs; a throw from `listProfilesByIds` leaves `rows` populated with no `founderName`.
- `app/admin/projects/page.tsx:55-58` — catch sets `loadError` but does not clear `rows`.
- `app/admin/projects/projects-client.tsx:100-105` — the error panel is rendered only when `rows.length === 0`.
- `app/admin/projects/projects-client.tsx:197-200` and `:238-240` — every row then renders `"Unknown founder"`.
- Why it matters: an admin sees a normal-looking list with misleading founder values and no indication that the name lookup failed. The page fails open on data completeness even though it fails closed on authorization.
- Fix: on any load error, return an error-only state (`rows = []` with `loadError`), or add a distinct `partial: true` state that renders a visible warning and disables decisions based on founder names. Clear `rows` in the catch unless the error is explicitly classified as non-fatal.

**W3 — MED — A transient role lookup failure in the proxy sends an admin to the student area.**
- `proxy.ts:27-34` — `safeRole()` catches any Neon error and returns `null`.
- `proxy.ts:123-131` — `null` is mapped through `ROLE_HOME[role ?? 'student']`, so `/admin/projects` redirects to `/student` instead of showing an error or retry.
- Why it matters: an admin who hits a brief Neon failure cannot reach this queue and is dropped into a workspace with no admin links (`components/layout/simple-layout.tsx:32-56`). This fails closed but gives a misleading destination. It is distinct from the two-provider role-sync fail-open already owned by `reports/orchestrator-audit.md:128`; that overlap is not repeated here.
- Fix: represent "role lookup failed" separately from "role is student". On lookup failure, return a 503/error route or redirect to `/login` with a retry message; never infer `student`.

## Database/RLS findings

### Confirmed

**D1 — LOW — The admin list fetches every column of every project with no pagination.**
- `lib/neon-data.ts:322-328` — `select * from public.projects order by created_at desc`.
- `app/admin/projects/page.tsx:37-43` — only `id`, `title`, `status`, `created_at`, `founder_id` are used.
- `lib/neon-data.ts:191-208` — the mapper still materializes description, budget, skills, deadline, student ID, and other unused fields.
- Why it matters: this is not an N+1 query — the page makes one project query plus one batched profile query (`page.tsx:45-51`, `lib/neon-data.ts:74-87`) — but it transfers and maps unused text/array columns for the whole table. The client then renders each row twice (`projects-client.tsx:180-203` mobile list and `:205-256` desktop table) with one half hidden by CSS, doubling DOM nodes as the table grows.
- Fix: add a dedicated list helper selecting only the five needed columns, add server-side pagination or a bounded `LIMIT`, and render one responsive row set where practical (CSS-hidden duplicate markup is acceptable only for small bounded lists).

### Verified controls — no finding

- **No IDOR from this route.** No object ID is accepted from the browser; all rows come from a server-side admin query (`page.tsx:35-43`). The Supabase identity is validated with `getUser()` (`page.tsx:23-26`, `proxy.ts:100-103`), and the Neon role is rechecked at `page.tsx:31-33`. This complements the app-layer authorization evidence in `reports/FINAL-AUDIT.md:31-44` and `reports/orchestrator-audit.md:116`.
- **No SQL injection found.** All Neon helpers use tagged parameterized queries, including `getProfileRole` (`lib/neon-data.ts:47-55`), `listProfilesByIds` (`lib/neon-data.ts:74-87`), and `listAllProjectsWithDetails` (`lib/neon-data.ts:322-328`). No string interpolation of request data was found.
- **RLS is not the enforcement point here.** `lib/neon-data.ts:1-7` states that Neon has no RLS; Supabase policies in `supabase/migrations/20261026000000_fix_projects_rls.sql:44-48` are not consulted by these Neon reads. This is documented architecture (`README.md:9`, `reports/FINAL-AUDIT.md:59-60`), not a new defect. It does mean every new helper must repeat the role check.
- **Status values are bounded.** `supabase/migrations/20261024000000_init_btc.sql:83` constrains `projects.status` to the four values mirrored by `FILTERS` in `projects-client.tsx:22-28`; the fallback badge/label at `:138-139,191,243` is defensive rather than a current mismatch.
- **Error output is safe.** Unexpected database errors are logged server-side (`page.tsx:56`) and reduced to a generic client message (`page.tsx:57`).

## Severity summary

| ID | Area | Severity | Status |
|---|---|---|---|
| U1 | UI/UX | MED | Confirmed |
| U2 | UI/UX | LOW | Confirmed |
| U3 | UI/UX | LOW | Confirmed, code-quality only; not a current failure |
| S1 | UI/UX | LOW | Suspected / future-proofing only |
| W1 | Workflow | MED | Confirmed |
| W2 | Workflow | MED | Confirmed |
| W3 | Workflow/auth | MED | Confirmed |
| D1 | Database/perf | LOW | Confirmed |

Totals: **0 HIGH, 4 MED, 4 LOW** (7 confirmed, 1 suspected). No High finding was found in this route's current source.

## Recommended fixes

1. **W1/W2 first.** Split server load results into success / auth failure / transient failure. For auth failure, redirect; for transient failure, return an error-only state and clear `rows` so the client cannot silently show `"Unknown founder"`.
2. **W3.** Change `proxy.ts` `safeRole()` to distinguish lookup failure from a `student` role and stop routing admins to `/student` on a database error.
3. **U1.** Make project titles reachable in full via wrapping plus `title`, or add an admin project detail route/link.
4. **U3.** Make arrow-key selection an explicit `SegmentedControl` option keyed by option value; remove the wrapper-level text matching.
5. **U2/S1.** Replace off-token amber text with canonical tokens and centralize date locale formatting.
6. **D1.** Introduce a narrow, paginated list query and avoid rendering duplicate mobile/desktop row sets beyond small lists.

## Notes/limitations

- **Static audit only.** No Next.js dev server was listening on port 3000 or 3001; port 8080 accepted a TCP connection but `GET /admin/projects` timed out. No authenticated admin browser session was available. Playwright MCP was therefore not used, and no rendered contrast, focus order, keyboard behavior, or live DOM assertions were captured. `webapp-testing` was applied as a limitation check, not as a live pass.
- **No build or dev server was started.** Per instruction, `npm run build` was not run while any dev server could be active, and no server was started for this audit.
- **No child agents were spawned.** All tracing and checks were performed inline.
- **No product files were edited.** The only intended output is this report. Existing uncommitted changes were read as authoritative.
- **Overlap discipline.** This report does not re-litigate app-layer authorization or parameterized SQL already verified in `reports/FINAL-AUDIT.md:31-44` and `reports/orchestrator-audit.md:116`, nor the two-provider identity-sync risk in `reports/orchestrator-audit.md:128`. It adds route-specific evidence for the partial-data error, auth retry path, proxy failure redirect, title truncation, and list-query shape.
- **Design direction overlap.** `reports/dashboard-design-direction.md:65-75,103-104` owns the intended dashboard pattern; this report only checks whether `/admin/projects` implements it.
- **Index not updated.** `reports/page-audits/INDEX.md` remains untouched because this critic was limited to writing its own report file. Its row for `/admin/projects` should be marked `done` by the owning process.
