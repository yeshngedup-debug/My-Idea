# Per-page audit — `/admin` (Platform overview)

Date: 2026-11-24. Role: single read-only critic (no child agents). No product source, config, schema, test or existing report was edited. The only file written is this report.

## Route

`/admin` — the admin "Platform overview" dashboard. Server-rendered, no client motion wrapper, no server actions, no user-supplied IDs.

## Files traced

| File | Why it is in the `/admin` call graph |
|---|---|
| `app/admin/page.tsx` (1–266) | Primary target. Role guard, four parallel data fetches, stat derivation, recent-orders list, shortcuts. |
| `app/admin/admin-charts.tsx` (1–491) | Secondary target. Role donut, project-stage bars, six-month activity trend, sr-only tables. |
| `lib/neon-data.ts` | `getProfileRole` (47–55), `listRoleCounts` (104–114), `listProjectStatuses` (312–320), `listAllProjectsWithDetails` (322–332), `listOrders` (1021–1031), `mapProject` (191–208), `mapOrder` (929–941), `asError` (23–27). |
| `proxy.ts` (28–34, 100–134) | Route-level role protection traced end to end for `/admin`. |
| `components/layout/workspace-stats.tsx` (11–51) | Renders the four stat figures used by `/admin`. |
| `components/ui/badge.tsx`, `components/ui/photo-credit.tsx` | Render the order status badge and hero photo credit. |
| `app/layout.tsx` (16–19) | Root `metadata.title.template`, needed to verify the rendered document title. |
| Cross-route reuse (grep only) | `app/admin/payments/page.tsx`, `app/admin/projects/page.tsx`, `app/founder/browse-projects/page.tsx`, `app/student/projects/page.tsx` — callers of the same global helpers. |
| Schema / status vocabulary | `neon/schema.sql:25,81`, `supabase/schema.sql:74`, `app/actions/projects.ts:137–138`, `app/admin/payments/payments-client.tsx:137`. |

## Skills used

All ten assigned skills were loaded from `~/.config/opencode/skills/` and applied under the precedence in `reports/SKILL-ASSIGNMENTS.md` (`better-*` govern evidence-based interface findings; dashboard UI is owned by `better-layout`, `better-accessibility`, `unslop`; security regression uses `security-review`, `api-security-testing`).

| Skill | Applied to |
|---|---|
| `unslop` | Dashboard anti-slop pass: stat-card restraint, minimal copy, dead / filler copy (U1, U4, U5). |
| `better-interface` | Evidence + severity rubric for every finding. |
| `better-layout` | Stat grid / visual hierarchy review (U3, U4). |
| `better-ui` | Chart swatches, patterns, badges, focus states (no defect found — see Notes). |
| `better-writing` | Page copy, labels, "reviewable" wording (U1, U3, W1). |
| `frontend-a11y` | `<dt>`/`<dd>` semantics, sr-only tables, chart accessible names (U2). |
| `better-accessibility` | WCAG 1.3.1 / 2.5.3, non-text contrast check (U2; contrast passed). |
| `webapp-testing` | Live Playwright verification against the running server on `localhost:3000`. |
| `security-review` | Authz chain, fail-closed behaviour, error handling (W3, W4, D1). |
| `api-security-testing` | IDOR / injection / mutation surface trace and RLS posture (D1, D6). |

Reference standards read: `reports/PROTOCOL.md`, `reports/SKILL-ASSIGNMENTS.md`, `design/voice-guide.md`, `design/brand-guidelines.md`, `README.md`.

## UI/UX findings

### Confirmed

**U1 — LOW — Document title carries the brand suffix twice.** `app/admin/page.tsx:29` sets `metadata = { title: "Admin Dashboard | Bhutan Tech Connect" }`, while `app/layout.tsx:19` defines `title.template: "%s | Bhutan Tech Connect"`. Live browser title on `/admin` was `Admin Dashboard | Bhutan Tech Connect | Bhutan Tech Connect`. Impact: untidy tab/SEO title, inconsistent with other routes that rely on the template. Fix: change `app/admin/page.tsx:29` to `title: "Admin Dashboard"` and let the root template append the brand.

**U2 — LOW — Stat label and detail merge into one run-on accessible name.** `app/admin/page.tsx:80–81` supplies `detail: "${projects.length} projects total"` and `:86` supplies `detail: "Awaiting confirmation"`. `components/layout/workspace-stats.tsx:36–40` renders the label and a `<span>` detail inside the same `<dt>`, separated only by a CSS margin (`ml-2`) with no whitespace text node. The live accessibility snapshot reported `term "Open projects7 projects total"` and `term "Payments to reviewAwaiting confirmation"`. Impact: screen readers announce concatenated labels; this is a WCAG 1.3.1 / 2.5.3 naming defect. Fix: emit a real separator in `workspace-stats.tsx:36–40` (e.g. `{stat.detail ? <><span aria-hidden="true"> · </span><span className="sr-only"> — </span>{stat.detail}</> : null}`), or put `aria-label={stat.label}` on the `<dt>`. Fixing the shared component also corrects the student/founder dashboards.

**U3 — LOW — "Total members" total includes admins but its breakdown omits them.** `app/admin/page.tsx:61` computes `totalUsers = profiles.length` over *all* roles, but `:71` renders the detail as `${founders} founders · ${students} students` only. Live data exposed the mismatch: total `5`, detail `2 founders · 2 students` (1 admin uncounted). Impact: the broadcast total does not reconcile with the printed breakdown. Fix: append `${admins} admins` when `admins > 0`, or label the lead figure "Students and founders" if admins are intentionally excluded.

**U4 — LOW — Inconsistent stat-card hierarchy.** `app/admin/page.tsx:73–77` gives "Student accounts" its own card while the founder count appears only inside the lead card's detail (`:71`). Impact: a "stat-card slop" asymmetry — one role is promoted, the other demoted — with no stated reason. Fix: either promote a founder card too, or drop the standalone student card and keep both counts in the lead detail.

**U5 — LOW — Unreachable third copy branch in the activity-trend empty state.** `app/admin/admin-charts.tsx:358–365` gates on `activeMonths < 2` and then branches for `=== 0`, `=== 1` and a final `else` rendering `Only ${activeMonths} months …`. `activeMonths` is an integer count from `filter` (`:349–351`), so when it is `< 2` it can only be 0 or 1; the `else` is dead code. Impact: none to users, but misleading dead copy that can drift. Fix: delete the final `else` branch and keep the two reachable cases.

### Suspected

None in this section. No AI-tell layout, glow, marquee, gradient text or decorative widget was found on `/admin`; the chart visuals are inline SVG with text fallbacks.

## Workflow findings

### Confirmed

**W3 — LOW — Transient role-lookup failure bounces an admin to the wrong role home.** `proxy.ts:28–34` deliberately collapses any `getProfileRole` error to `null`; `proxy.ts:124–131` then treats `null` as the fallback role `"student"` (`proxy.ts:19–23,126`) and redirects a request to `/admin` to `/student`. The page-level guard `app/admin/page.tsx:32–42` calls `getProfileRole` directly and throws on failure, so no data is leaked (fail-closed), but navigation degrades. Impact: a short Neon outage sends admins to a wrong-role page (or into a redirect/500 loop) instead of a clear error. Fix: in `proxy.ts:124–131`, when an authenticated user's role lookup returns `null`, let the request reach the page and let the authoritative page guard decide, or return a 503 with a retry link rather than redirecting to a guessed home.

**W4 — LOW — Database failure surfaces as a generic Next.js error boundary.** `app/admin/page.tsx:47–53` fires four `Promise.all` fetches with no `try/catch`; `lib/neon-data.ts:23–27,52–54,111–113,317–319,329–331,1028–1030` wrap errors in `NeonDataError`. Impact: fail-closed and safe, but an admin sees an opaque error with no route-specific recovery hint. Fix: wrap the fetch block and render an admin-facing error state ("Could not load platform overview — Retry") while logging the underlying `NeonDataError` server-side.

### Suspected

**W1 — MED — Definition of "reviewable payment" diverges between the overview and `/admin/payments`.** `app/admin/page.tsx:65` counts `status === "submitted"` only, and `:139–155` shows the "waiting for verification" banner only when that count is positive. Order status `pending` is a valid value (`neon/schema.sql:81`, created at `lib/neon-data.ts:955`), and `app/admin/payments/payments-client.tsx:137` treats **both** `submitted` and `pending` as actionable (Confirm/Reject). Impact: an order that is actionable on the payments page can be absent from "Payments to review" and from the nudge banner, so the overview under-reports the review queue. Marked *suspected* because the live seeded data contained only `confirmed` orders, so the divergence could not be observed in the rendered page; it is proven by code. Fix: align both surfaces — either count `submitted || pending` in `app/admin/page.tsx:65`, or restrict `payments-client.tsx:137` to `submitted` if `pending` means "awaiting founder's proof". Make the product decision explicit.

## Database/RLS findings

### Confirmed

**D1 — MED — Global "list-all" helpers carry no authorization; isolation is page-level only.** `lib/neon-data.ts:104–114,312–320,322–332,1021–1031` perform unscoped `select` over `profiles`, `projects` and `shortlist_orders` with no role argument or row scoping. The module header `lib/neon-data.ts:4–7` states explicitly: "authorization is enforced in application code — there is no RLS on the Neon side." `/admin` is gated only at `proxy.ts:111–131` and `app/admin/page.tsx:32–45`. These same helpers are reused by `app/admin/payments/page.tsx`, `app/admin/projects/page.tsx`, `app/founder/browse-projects/page.tsx` and `app/student/projects/page.tsx` (grep-confirmed). Impact: any future call site that omits the page-level role check exposes platform-wide rows; there is no defence in depth. Fix: make admin-only intent explicit in the data layer — e.g. rename/split into `listAllProjectsForAdmin()` and add a `requireRole("admin")` assertion inside global aggregates — and/or enable RLS on the Neon tables. This extends the general posture recorded in `reports/FINAL-AUDIT.md` and `reports/orchestrator-audit.md`; it is reported here specifically for `/admin`'s call graph.

**D2 — MED — Full-row fetches are used where only a timestamp is needed.** `app/admin/page.tsx:51–52` calls `listAllProjectsWithDetails()` (`lib/neon-data.ts:322–332`, `select * from public.projects`) and `listOrders()` (`:1021–1031`, `select * from public.shortlist_orders`), but the project rows are used only for `created_at` (`app/admin/page.tsx:134`) and the order rows only for `created_at` plus the five fields in `:184–217`. `mapProject` (`:191–208`) materialises descriptions, skill arrays and budgets that are immediately discarded. Impact: avoidable DB payload and per-row object allocation; cost grows with table size. Fix: add narrow helpers returning only `created_at` (and the order fields actually rendered), or push the six-month grouping into SQL. Same root cause as the broad-helper concern in `reports/performance-seo.md`, scoped here to `/admin`.

**D3 — LOW — `projects` is scanned twice for two derived figures.** `app/admin/page.tsx:47–53` runs `listProjectStatuses()` (`lib/neon-data.ts:312–320`) and `listAllProjectsWithDetails()` (`:322–332`) in the same `Promise.all`; both read the whole `projects` table. Impact: 2× table scan per overview load. Fix: one query returning `status, created_at`, then derive both the stage counts and the activity dates in the page.

**D4 — LOW — Aggregate role counts are expanded into N strings and recounted.** `app/admin/page.tsx:55–57` uses `flatMap` to build one array item per member, then `:61–64` calls `.filter(...).length` to recover counts that already exist in `profileCounts`. Impact: O(number of members) memory and CPU for a figure obtainable in O(number of roles). Fix: read `profileCounts.find(c => c.role === "student")?.count ?? 0` (and founder/admin) directly; keep the aggregate rows for the donut.

**D5 — LOW — Status strings are mapped into throwaway objects before counting.** `app/admin/page.tsx:58` maps `projectStatuses` to `{ status }` objects solely so `:64` can filter-count `"open"`. Impact: needless allocation. Fix: `const openProjects = projectStatuses.filter(s => s === "open").length;` and drop the `projects` binding.

**D6 — Confirmed negative: no IDOR, injection, mutation or direct-API surface on `/admin`.** Neither target file reads a user-supplied id, search param or header; there are no server actions, writes or `fetch` calls; every query in the traced helpers is a constant statement with no interpolated user input (`getProfileRole` is the only parameterised lookup, `lib/neon-data.ts:50`). The chart status keys (`app/admin/admin-charts.tsx:20–31`) match the schema constraints (`neon/schema.sql:25,81`), and "Other" buckets (`:121–129,252–259`) handle unknown values, so aggregation is correct apart from W1.

### Suspected

None beyond W1's effect on a reported aggregate (listed under Workflow because the divergence is a product/workflow decision).

## Severity summary

| Severity | Count | IDs |
|---|---|---|
| HIGH | 0 | — |
| MED | 3 | D1 (confirmed), D2 (confirmed), W1 (suspected) |
| LOW | 10 | U1, U2, U3, U4, U5, W3, W4, D3, D4, D5 (all confirmed) |

No HIGH finding: role protection is present at both the proxy and the page, the page fails closed on lookup errors, there is no IDOR/injection/mutation surface, and the rendered charts pass the 3:1 non-text contrast threshold with redundant text and sr-only tables.

## Recommended fixes

1. **Align payment reviewability (W1).** Decide whether `pending` is admin-actionable, then make `app/admin/page.tsx:65` and `app/admin/payments/payments-client.tsx:137` agree.
2. **Make global helpers explicit and narrow (D1, D2, D3).** Introduce admin-named data functions with a role assertion, and select only the columns `/admin` renders; collapse the two project scans into one.
3. **Fix the `<dt>` accessible name in the shared stat component (U2)**, which also improves the student/founder dashboards.
4. **Correct the document title (U1)** and reconcile the "Total members" breakdown (U3); remove dead copy (U5) and the throwaway allocations (D4, D5).
5. **Harden failure behaviour (W3, W4).** Do not guess a role on lookup failure in `proxy.ts`, and add a route-specific error/retry state around the four fetches.
6. **Resolve the stat-card hierarchy question (U4)** with a single consistent rule for founders vs students.

## Notes/limitations

- **Live verification was partial but real.** No own dev server was available (my temporary `next dev` hit `EADDRINUSE`); a pre-existing production `next start` server on `localhost:3000` was used instead. Unauthenticated `GET /admin` returned `307` to `/login`, confirming the route guard. An already-authenticated admin tab in the shared Playwright session was inspected read-only: it rendered the h1 "Platform overview", four stat figures (Total members 5, Student accounts 2, Open projects 7 / 7 total, Payments to review 0), the role donut, stage bars, the "Only one month of dated activity…" note, and three `Confirmed` rows in "Recent payment orders". No data was mutated.
- **Shared-browser caveat.** Other agents were concurrently creating/navigating tabs in the same Playwright MCP session; the admin tab disappeared mid-inspection. The console messages that could be inspected were HMR `WebSocket` handshake failures from concurrently running dev servers, not errors attributable to `/admin`. A fresh isolated admin login was not completed, so this is an observation of a rendered authenticated page, not a full keyboard/screen-reader pass. `reports/accessibility-critic.md` marked dashboard runtime "Not verified"; this report partially closes that gap for `/admin` only.
- **Build was not run**, per the constraint against `npm run build` while a server is live. Findings are source-traced plus the rendered check above; no production build or type check was performed in this pass.
- **Overlap avoided.** Auth/RLS and broad performance posture are already recorded in `reports/FINAL-AUDIT.md`, `reports/orchestrator-audit.md` and `reports/performance-seo.md`; D1/D2/D3 add only the `/admin`-specific call-graph evidence. `reports/component-relevance-audit.md` covers the `/admin/payments` status-filter gap; W1 is scoped to the overview's count/banner only. Copy and a11y findings here are original to this route (the copy and accessibility critics covered public routes). `reports/dashboard-design-direction.md` provided the intended dashboard direction; U4 is judged against it.
- **Uncommitted user changes were treated as authoritative** (`git status --short` showed both target files modified). Nothing was reverted, overwritten or staged.
