# Page audit — `/founder` (founder overview)

**Role:** read-only critic. **Date:** 2026-11-24. **No product source, config,
schema, test, or existing report was edited.** Uncommitted working-tree changes
were treated as authoritative. Written per `reports/PROTOCOL.md`;
`reports/page-audits/INDEX.md:21` lists this report as `pending`, and the
orchestrator owns marking it `done`.

Live Playwright verification was possible against `next dev` on port 3000.
Findings below separate **Confirmed** (source and/or rendered), **Suspected**,
and **cross-reference only**.

## Route

`/founder` — `app/founder/page.tsx` (async server component), rendered through
`app/founder/layout.tsx:1-5` → `components/layout/simple-layout.tsx:21-112`.
Loading state: `app/founder/loading.tsx:1-5`.

Source purpose: "post project, recent projects, workspace shortcuts"
(`app/founder/page.tsx:1-3`). Rendered purpose: "Post a brief, review who
applies, and unlock a shortlist when you are ready" (`:50-61`). The page shows
three figures (`:42-63`), up to five recent projects (`:65-130`) and three
shortcuts (`:133-154`).

## Files traced

| File | Why |
|---|---|
| `app/founder/page.tsx` | Target route, full 159 lines |
| `app/founder/layout.tsx`, `app/founder/loading.tsx` | Route shell and loading state |
| `components/layout/simple-layout.tsx`, `workspace-nav.tsx` | Workspace chrome, repeated auth read, skip target, mobile nav overflow |
| `components/layout/workspace-hero.tsx`, `workspace-stats.tsx` | Rendered hero and figures |
| `components/ui/badge.tsx` | Status pill on recent-project rows |
| `lib/supabase/server.ts`, `proxy.ts` | Session lookup and `/founder/*` role gate |
| `lib/neon-data.ts` (`getProfileRole:47-55`, `listProjectsByFounder:297-310`) | Role check and the page's only data read |
| `lib/neon.ts` | Neon client and `DATABASE_URL` handling |
| `neon/schema.sql:1-4`, `supabase/run-all.sql:166-168` | No-Neon-RLS model and the `(founder_id, created_at desc)` index |
| `app/error.tsx:18-54` | Root error boundary reached by page throws |
| `app/founder/projects/[id]/page.tsx:22-52` | Destination of each recent-project row; ownership re-check |
| `app/layout.tsx:15-19` | Root title template behind the rendered `<title>` |
| `reports/PROTOCOL.md`, `reports/SKILL-ASSIGNMENTS.md` | Overlap and skill-precedence rules |
| Every `reports/*.md` and every `reports/page-audits/*.md` | Read before finalizing; overlaps referenced below |

## Skills used

Loaded from `C:\Users\DELL\.config\opencode\skills\` and applied in the
precedence order set by `reports/SKILL-ASSIGNMENTS.md:5-13`:

- **unslop** — minimal copy and AI-tell judgment. No new AI-tell copy found;
  informed the decision to reference — not repeat — the stale F2/F3 stat-card
  and arrow findings.
- **better-interface** — evidence bar and severity language for every finding.
- **better-layout** — two-column work area, 320px stacking and reading order;
  no grouping defect found.
- **better-ui** — hero, focus rings, status pill, control sizes. Informed U2.
- **better-writing** — concise CTA, empty-state and status wording; no new
  copy defect found. The earlier generic-headline issue is already marked fixed
  at `reports/orchestrator-audit.md:98`.
- **frontend-a11y** — landmark labels, heading order, focus order, accessible
  names and target sizes. Informed U2 and the verified-passing list.
- **better-accessibility** — WCAG 2.2 view of the same controls; agrees with
  `reports/accessibility-critic.md:38-47`.
- **webapp-testing** — used for the Playwright method and the live drive
  recorded in Notes/limitations.
- **security-review** — session-derived identity, role re-check, parameterization,
  failure modes and error leakage. Informed W1 and the data-layer pass.
- **api-security-testing** — read from its staged path
  `C:\Users\DELL\.config\opencode\skills\strix\api-security-testing\SKILL.md`;
  used for IDOR/object-level authorization checks. No HTTP API, mutation or
  client-supplied object ID exists on this route.

`design-taste-frontend` was not loaded: `reports/SKILL-ASSIGNMENTS.md:19`
assigns it to the visual-design critic role, not to this per-route audit.

## UI/UX findings

### Confirmed

**U1 — LOW — Recent-project dates omit the year and use server locale/timezone.**
`app/founder/page.tsx:108-114` calls `new Date(project.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })` inside the server component. Live rows render as `Posted 24 Nov`; no year or `timeZone` is supplied. This is the same pattern recorded for `/student` at `reports/page-audits/student-overview.md:95-103`, but the rows and evidence here are route-specific. **Why it matters:** a project from a previous year is indistinguishable from this month's, and a timestamp near midnight can display a different day from Bhutan (+06:00) if the server runs in another zone. **Fix:** format with `timeZone: "Asia/Thimphu"` and add the year when `created_at` is not in the current year, or select a preformatted Bhutan-local string in SQL and render it directly.

**U2 — LOW — The empty-state CTA is 40px, below the project's 44px target.**
`app/founder/page.tsx:89-94` uses `min-h-10` for "Create your first project", while the adjacent primary and list controls use `min-h-11` at `:57`, `:74` and `:102`. The project's 44px target convention is recorded at `reports/brand-tokens.md:7` and applied as a finding at `reports/page-audits/founder-browse-students.md:43-46`. **Why it matters:** the smallest target sits in the only call to action shown to a new founder, where activation matters most; it also breaks the visual rhythm of the other workspace controls. **Fix:** change `min-h-10` to `min-h-11` at `:91`. Confirmed in source; the seeded founder has seven projects, so this branch was not observed at runtime.

### Suspected

None.

### Cross-reference, confirmed but not re-scored

**XR1 — LOW — Document title carries the brand twice.**
`app/founder/page.tsx:12` sets `title: "Founder Dashboard | Bhutan Tech Connect"` while `app/layout.tsx:19` applies `title.template: "%s | Bhutan Tech Connect"`. Live title: `Founder Dashboard | Bhutan Tech Connect | Bhutan Tech Connect` (two brand matches). This is the same workspace-wide defect already owned by `reports/component-relevance-audit.md:13` and `reports/page-audits/admin-overview.md:46`. **Fix:** set `title: "Founder Dashboard"` at `app/founder/page.tsx:12` and let the root template append the brand once. No new finding is raised.

### Verified passing (no action)

- `GET /founder` returned **200** in an authenticated isolated browser context at 1440 × 900 and 320 × 812. No page errors and no HTTP responses `>= 400` were observed. Seven console errors were dev-server HMR WebSocket handshake failures only, not application errors.
- Document structure: one `h1` ("Projects and people"), two `h2`s ("Recent projects", "Go to"), labelled hero section (`components/layout/workspace-hero.tsx:17-19`), labelled figures section (`components/layout/workspace-stats.tsx:16-18`) and labelled shortcuts nav (`app/founder/page.tsx:137`). The first Tab lands on "Skip to main content".
- All interactive controls carry `focus-visible` rings (`app/founder/page.tsx:57,74,91,102,146` and `components/layout/workspace-nav.tsx:22-23,37,66`). Measured shortcut links are 66-67px high with rings; the header primary CTA and "View all" are 44px.
- Status is carried by the visible text label at `app/founder/page.tsx:121-125`; the colour dot is `aria-hidden="true"` at `:117-120`. This follows `reports/dashboard-design-direction.md:70-75`.
- No horizontal page overflow: `document.documentElement.scrollWidth - innerWidth = -15` at both widths. At 320px the mobile workspace nav intentionally overflows inside its `overflow-x-auto` container (`components/layout/workspace-nav.tsx:55-57`, measured `navScroll = 269`), so the anchors extending past the viewport are contained and do not create page scroll.
- The old F2/F3 findings in `reports/visual-recheck.md:158,160` (equal-width stat cards, decorative arrows) are not reproduced in current source: `WorkspaceStats` is a leading figure plus `<dl>` ledger (`components/layout/workspace-stats.tsx:11-50`), and `app/founder/page.tsx` has no arrow icon or glyph. The later pass at `reports/visual-recheck.md:131,152` also records those issues as fixed.
- The shared `<dt>` detail run-on named in `reports/page-audits/admin-overview.md:48` does not apply here: all three stats pass `detail: null` at `app/founder/page.tsx:42-46`.

## Workflow findings

### Confirmed

**W1 — MED — A role-lookup failure misroutes a founder and ends on a generic error page.**
`proxy.ts:28-34` deliberately collapses any `getProfileRole` error to `null`; `:117-126` then treats `null` as the `student` home and redirects a request for `/founder` to `/student`. The page guard at `app/founder/page.tsx:24` calls the same helper directly, and `lib/neon-data.ts:47-54` rethrows database errors, so the redirected `/student` render throws. If the role read succeeds but the project read at `app/founder/page.tsx:27` fails, the same throw occurs. The root boundary at `app/error.tsx:33-49` offers only "Try again" and "Back to home" (`/public`), with no route back to `/founder`. This refines — but does not duplicate — `reports/page-audits/student-overview.md:156-171`, `reports/page-audits/admin-overview.md:64` and `reports/page-audits/admin-projects.md:82-86` with the founder-specific redirect target and missing recovery path. **Why it matters:** during a short Neon outage an authenticated founder is sent to another role's area and then to a generic failure screen with no role-appropriate next step. This is an availability/recovery gap, not a data leak: the only founder data read is gated on the verified session and role. **Fix:** share one `safeRole`-style helper that distinguishes "role is null" from "lookup failed"; on failure return a 503/error state with a verified role home instead of defaulting to `/student`; add `app/founder/error.tsx` with a link to `/founder` (or the verified role home) and a retry action.

### Suspected

None. The 503 failure path was not simulated against a live Neon outage; the code path is confirmed, the operational impact is inferred from the source chain.

### Cross-reference, not re-scored

A stale Neon role after a Supabase demotion is already owned as HIGH/suspected for the founder workspace at `reports/page-audits/founder-profile.md:82-88`, with the global two-provider risk at `reports/FINAL-AUDIT.md:57-60`. This overview performs no privileged write, so it adds no new evidence.

## Database/RLS findings

### Confirmed safe — no IDOR on this route

`app/founder/page.tsx:15-27` derives the identity from `supabase.auth.getUser()`, redirects unauthenticated users to `/login`, re-reads the role from Neon, and passes only `user.id` to `listProjectsByFounder`. No URL parameter, form input, or client role is trusted. `lib/neon-data.ts:297-306` uses a parameterized `where founder_id = ${founderId}` predicate. Each recent row links to `/founder/projects/${project.id}` (`app/founder/page.tsx:100-102`), whose destination re-checks `p.founder_id !== user.id` before loading applicants (`app/founder/projects/[id]/page.tsx:33-51`). There is no server action, mutation, `fetch`, or API route call in this page. The `(founder_id, created_at desc)` index at `supabase/run-all.sql:166-168` supports the ordering. No cross-user read path, injection sink, mass-assignment surface or error detail leak was found.

### Confirmed

**D1 — LOW — The overview fetches every project column and every row to render five and count three figures.**
`lib/neon-data.ts:297-306` runs `select * from public.projects where founder_id = ${founderId} order by created_at desc` with no `limit`; `app/founder/page.tsx:27-46` maps all rows and computes counts from them, while `:98` renders only `projects.slice(0, 5)`. `mapProject` then discards most of the selected columns because the page keeps only `id`, `title`, `status` and `created_at` (`:28-33`). This is the founder equivalent of the student-overview overfetch at `reports/page-audits/student-overview.md:193-206`. **Why it matters:** every overview request transfers, parses and maps the full project history, including descriptions, budgets and skills, even though the visible need is five rows plus three counts. Cost grows with account age and is unnecessary for this route. **Fix:** add a narrow `listRecentProjectsForOverview(founderId, 5)` selecting only `id, title, status, created_at` with `limit 5`, plus a separate aggregate query (`count(*)`, `count(*) filter (where status = 'open')`, `count(*) filter (where status = 'in_progress')`) over the same `founder_id`; keep the parameterized predicate, ordering and the list route's unbounded helper separate.

**D2 — LOW — One page view repeats session and profile lookups.**
`proxy.ts:101-103,124-126` validates the JWT and reads the Neon role; `app/founder/page.tsx:15-25` calls `getUser()` and `getProfileRole()` again; `components/layout/simple-layout.tsx:26-30` calls `getUser()` and `getProfile()` a third time. That is three Supabase auth validations and three Neon profile-row reads before the project read at `app/founder/page.tsx:27`. **Why it matters:** each duplicate is a network round trip on the request path for a page whose only data need is one founder's recent projects. It does not create an authorization flaw, but it adds avoidable latency and load. **Fix:** wrap session + profile loading in a request-scoped server cache shared by the page and layout, and let both consume one verified role; keep the proxy check as the route-gate defense in depth. Do not trust a plain proxy-set header as authorization in the server components.

### Suspected

None. No N+1 pattern was found: the page performs one project query and does not fan out per row.

### Cross-reference, not re-scored

`neon/schema.sql:1-4` states that Neon has no RLS and authorization stays in application code. That architecture risk is already owned by `reports/FINAL-AUDIT.md:59-60` and `reports/orchestrator-audit.md:116`. This route adds no bypass because its only read is session-scoped as described above; do not add a duplicate global finding. Any future helper added to this page must repeat the role/ownership check.

## Severity summary

| Severity | Count | IDs |
|---|---:|---|
| HIGH | 0 | — |
| MED | 1 | W1 |
| LOW | 4 | U1, U2, D1, D2 |
| Cross-reference only | 2 | XR1 (LOW title duplication), no-RLS architecture |

No HIGH issue, confirmed IDOR, injection, client-side-only authorization flaw, or server-action/mutation defect was found on this route.

## Recommended fixes

1. **W1 (MED)** — `proxy.ts:28-34,117-126`, `app/founder/page.tsx:24` and `app/error.tsx:33-49`: separate lookup failure from a null role, stop defaulting a founder to `/student`, and add a founder-aware error boundary with retry.
2. **D1 (LOW)** — `lib/neon-data.ts:297-310` and `app/founder/page.tsx:27-46,98`: split the overview into a bounded five-row projection plus a count aggregate; keep the owner predicate and index-aligned ordering.
3. **U1 (LOW)** — `app/founder/page.tsx:108-114`: format dates with `Asia/Thimphu` and include the year for older rows.
4. **U2 (LOW)** — `app/founder/page.tsx:89-94`: raise the empty-state CTA to `min-h-11`.
5. **D2 (LOW)** — `app/founder/page.tsx:15-25` and `components/layout/simple-layout.tsx:26-30`: share one request-scoped session/profile loader instead of three lookups.
6. **XR1 (LOW, owner elsewhere)** — `app/founder/page.tsx:12`: drop the brand from the page title so the root template appends it once.

## Notes/limitations

- **Live verification was performed.** Playwright used a fresh isolated browser context, signed in as the local seed founder `founder.dorji@btc-e2e.test`, and loaded `/founder` at 1440 × 900 and 320 × 812. Evidence: 200 response, one `h1`, two `h2`s, 5 recent rows, figures `Projects posted 7 / Open projects 7 / In progress 0`, first-Tab skip link, focus rings, labelled nav, no page overflow, 0 page errors and 0 HTTP `>= 400`. The only console errors were seven Next HMR WebSocket handshake failures from `next dev`, not product defects. Captures: `.playwright-mcp/founder-overview-audit-1440.png` and `.playwright-mcp/founder-overview-audit-320.png`.
- Not simulated at runtime: Neon outage / role-lookup failure (W1), non-founder or unmirrored account, empty project list (U2), and prior-year dates (U1). Those findings are source-confirmed and labelled as such; W1's operational impact is inferred from the traced code path.
- No `npm run build` was run while `next dev` was active. No migration, seed, test, or mutation was run.
- No file other than this report was created, edited, or reverted.
- Overlaps were referenced instead of duplicated: title duplication with `reports/component-relevance-audit.md:13` and `reports/page-audits/admin-overview.md:46`; role-failure pattern with `reports/page-audits/student-overview.md:156-171`, `admin-overview.md:64` and `admin-projects.md:82-86`; no-Neon-RLS with `reports/FINAL-AUDIT.md:59-60` and `reports/orchestrator-audit.md:116`; date formatting with `reports/page-audits/student-overview.md:95-103`; 44px targets with `reports/brand-tokens.md:7`; old stat-card/arrow findings with `reports/visual-recheck.md:158,160` and their later fixed status at `:131,152`; status language with `reports/dashboard-design-direction.md:70-75`.
