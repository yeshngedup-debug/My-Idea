# Page audit — `/student` (student overview)

**Role:** read-only critic. **Date:** 2026-11-24. **No product source was edited.**
Written per `reports/PROTOCOL.md`. `reports/page-audits/INDEX.md:30` lists this
report as `pending`; the orchestrator owns marking it `done`.

## Route

`/student` — `app/student/page.tsx` (server component), rendered inside
`app/student/layout.tsx` → `components/layout/simple-layout.tsx`.

Purpose stated in source: "applications health, recent applications, shortcuts"
(`app/student/page.tsx:1-3`). Rendered purpose: "Find paid work that fits your
skills and track where you stand" (`:69`).

## Files traced

| File | Why |
|---|---|
| `app/student/page.tsx` | Target route, full 195 lines |
| `app/student/layout.tsx`, `app/student/loading.tsx` | Route shell and loading state |
| `components/layout/simple-layout.tsx`, `workspace-nav.tsx` | Shell, skip target, active-nav logic |
| `components/layout/workspace-hero.tsx`, `workspace-stats.tsx` | Rendered hero and figures |
| `components/ui/badge.tsx`, `components/ui/motion.tsx` | Status pill and reveal/stagger behaviour |
| `components/ui/photo-credit.tsx` | Credit in hero band |
| `lib/supabase/server.ts`, `proxy.ts` | Session lookup and `/student/*` role gate |
| `lib/neon-data.ts` (`getProfileRole:47-55`, `mapApplication:366-378`, `listStudentApplications:424-440`) | Data reads |
| `lib/neon.ts` | Neon client configuration |
| `neon/schema.sql`, `supabase/migrations/20261124000000_close_security_bypasses.sql` | RLS / authorization model |
| `app/error.tsx`, `app/student/applications/{page,applications-client}.tsx` | Error recovery and the destination of every row link |
| `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`, `02-guides/data-security.md` | Next 16 proxy/data-security conventions |

All `reports/*.md` (16 files) and `reports/page-audits/INDEX.md` were read before
finalizing.

## Skills used

Loaded from `~/.config/opencode/skills/` and applied in the precedence order set
by `reports/SKILL-ASSIGNMENTS.md:5-13`:

- **unslop** — copy minimality, no decorative tells. Informed U1 (student-only
  UI shown to a non-student) and U3 (plain, specific date information).
- **better-interface** — state-appropriate content and honest affordances.
  Informed U1 and W1.
- **better-layout** — grouping and reading order of the two-column work area;
  no overflow or grouping defect found.
- **better-ui** — focus states, status pill treatment and hover surfaces; no
  new defect found (see Verified passing).
- **better-writing** — plain labels and error/empty-state copy. Informed U1 and
  U2.
- **frontend-a11y** — live-region semantics and landmark labelling. Informed U2;
  verified names, headings and focus rings.
- **better-accessibility** — WCAG check of the same controls; agrees with
  `reports/accessibility-critic.md:38-47`.
- **webapp-testing** — used for method only; runtime drive was not possible (see
  Notes/limitations).
- **security-review** — session-derived identity, role re-check, parameterization
  and failure modes. Informed W2 and D1/D3.
- **api-security-testing** — read from its staged path
  `~/.config/opencode/skills/strix/api-security-testing/SKILL.md`; used to check
  for IDOR / object-level authorization flaws on the scoped read. None found.

`design-taste-frontend` was not loaded: `reports/SKILL-ASSIGNMENTS.md:19` assigns
it to the visual-design critic role, not to this per-route audit.

## UI/UX findings

### CONFIRMED

**U1 — MED — A signed-in non-student sees a complete, zeroed student dashboard**
`app/student/page.tsx:86-97` (banner), `:71-82` (student CTAs), `:54-58` (zero
figures), `:99-192` (recent applications and "Go to" panel). The `!isStudent`
branch adds one sentence but does not stop the student-only UI from rendering.
This state is reachable: `getProfileRole` returns `null` (not an error) when a
Supabase-authenticated user has no matching Neon profile row
(`lib/neon-data.ts:50-51`), `proxy.ts:117-126` defaults a null role to the student
home and lets `/student` through, and the page then renders "Browse projects",
"Update profile", "Applications sent: 0", "Your next opportunity is waiting"
and all three shortcuts. The two-provider sync risk is already recorded in
`reports/FINAL-AUDIT.md:57-58`. **Why it matters:** a founder or an unmirrored
account is invited to act in an area they cannot use, and the zeros read as real
data. **Fix:** make the `!isStudent` branch an early return that renders only an
account-setup message inside the shell — no hero CTAs, no `WorkspaceStats`, no
work area — or redirect to a role-appropriate setup page. Do not infer a role
from the pathname.

**U2 — LOW — `role="alert"` on a static, server-rendered condition**
`app/student/page.tsx:87-92`. `role="alert"` creates an assertive live region,
but this paragraph is present in the initial HTML and is not a user-triggered
result. **Why it matters:** assertive announcements interrupt other speech and
can duplicate content already read on load. **Fix:** use a plain `<p>`; reserve
`role="status"` for a message that genuinely changes after interaction. U1's
early return should replace this element with an account-setup state anyway.

**U3 — LOW — Application dates omit the year and use the server's locale/timezone**
`app/student/page.tsx:141-147`. `toLocaleDateString("en-GB", { day: "numeric",
month: "short" })` runs in the server component, with no `timeZone` and no year.
**Why it matters:** an application from a previous year is indistinguishable from
one filed this month, and a timestamp near midnight can display as a different
day in Bhutan (+06:00) than on the server. **Fix:** format with an explicit
`timeZone: "Asia/Thimphu"` and add the year when `created_at` is not in the current
year, or show a bounded relative label ("3 Nov", "3 Nov 2025").

### SUSPECTED

**U3b — LOW — `created_at` is stringified then re-parsed**
`lib/neon-data.ts:374` (`created_at: String(r.created_at)`) feeds
`new Date(application.created_at)` at `app/student/page.tsx:143`. The Neon driver
may return a `Date` for `timestamptz`, so this can round-trip through a localised
`Date.toString()` before parsing. Not confirmed without a live value. **Fix:**
normalize once — `new Date(r.created_at).toISOString()` in `mapApplication`, or
select `to_char(a.created_at at time zone 'Asia/Thimphu', ...)` in
`listStudentApplications` and render the string directly.

### Verified passing (no action)

- Status is carried by the text label at `app/student/page.tsx:160`; the colour
  dot is `aria-hidden="true"` (`:150-151`). This matches the status-language
  decision in `reports/dashboard-design-direction.md:73`.
- All interactive elements have `focus-visible` rings (`:73,79,108,124,135,182`)
  and targets are at least `min-h-11`; consistent with
  `reports/accessibility-critic.md:39`.
- Landmarks and headings are labelled: hero `section aria-label`
  (`components/layout/workspace-hero.tsx:17-19`), figures `section aria-label`
  (`components/layout/workspace-stats.tsx:16-18`), `<nav aria-label="Student
  shortcuts">` (`app/student/page.tsx:173`), one `h1` in the hero and `h2`s for
  both work areas (`:102,170`).
- Reduced motion is honoured: `components/ui/motion.tsx:29-40,59-61,89-92,122-125`
  renders content statically instead of hidden.
- The leading-figure + compact-ledger stat treatment
  (`components/layout/workspace-stats.tsx:11-50`) resolves the equal-width icon
  cards and decorative arrows previously reported at
  `reports/visual-recheck.md:158,160`. No arrow glyph or stat-card icon remains in
  the current source.

## Workflow findings

### CONFIRMED

**W1 — MED — Every recent-application row opens the same unfiltered list**
`app/student/page.tsx:133-135`: all five rows link to `/student/applications`,
regardless of the row's status or project. The list's filter is local React state
with no query-param support (`app/student/applications/applications-client.tsx:25-31,47-54`),
so the user must find the row again. **Why it matters:** the row presents a
specific project, date and status, so the click promises that item but delivers a
generic queue; "track where you stand" then needs extra scanning. This refines —
does not duplicate — `reports/component-relevance-audit.md:39,88,98`, which
reported the rows as non-interactive `HoverLift` blocks. The rows are now real
links, so the false affordance is fixed; the deep link it asked for is still
missing. **Fix:** link to `/student/applications?status=<status>` and have
`ApplicationsClient` initialize `filter` from `searchParams` (visible result:
the matching segment pressed and `Showing N pending applications`), or link each
row's title to the project detail route that already exists at
`app/student/projects/[id]/page.tsx`.

**W2 — MED — A role-lookup failure lands the user on a generic error page**
`app/student/page.tsx:27` calls `getProfileRole` without a try/catch, while
`proxy.ts:28-34` deliberately swallows the same error via `safeRole` and defaults
to the student home (`:117-126`). `getProfileRole` rethrows database errors
(`lib/neon-data.ts:52-54`). **Why it matters:** during a Neon outage the proxy
admits the request, the page throws, and the root boundary
(`app/error.tsx:18-54`) offers only "Try again" / "Back to home". A founder who
visits `/student` at that moment gets no route back to their own dashboard. This
is an availability/recovery gap, **not** a data leak: the only data read is
gated on `isStudent` at `app/student/page.tsx:37-38`. The overall app-layer
authorization design is already recorded in `reports/orchestrator-audit.md:116`;
this finding is specific to the page's divergent failure handling. **Fix:** share
one `safeRole`-style helper between proxy and page; on lookup failure show a
role-appropriate setup/error state or redirect using a verified claim rather
than a default, and add `app/student/error.tsx` with a link to the user's own
role home.

## Database/RLS findings

### CONFIRMED safe — no IDOR on this route

`app/student/page.tsx:20-22` takes the user from `supabase.auth.getUser()`; the
ID passed to the read at `:38` is that session user's ID, never a URL param.
`lib/neon-data.ts:429-436` scopes the query with a parameterized
`where a.student_id = ${studentId}` and joins the project title by `project_id`.
The role is re-checked at `app/student/page.tsx:27-28`. No cross-user read path
was found. All SQL involved is parameterized, consistent with
`reports/orchestrator-audit.md:116`.

### CONFIRMED — architecture risk owned elsewhere (reference, not a new finding)

`neon/schema.sql:1-4` states that no RLS policies exist and authorization stays
in the application layer. This is already recorded as a standing risk in
`reports/FINAL-AUDIT.md:59-60`. This route adds no new bypass because both reads
are session-scoped as above; do not add a duplicate finding to the global audit.
Any future helper added to this page must include its own role/ownership check.

### CONFIRMED

**D1 — LOW — No `LIMIT` on the applications read; the page fetches every row to show five**
`lib/neon-data.ts:424-437` returns all rows for the student, and
`app/student/page.tsx:131` applies `.slice(0, 5)` after the query and mapping.
**Why it matters:** the overview transfers, parses and maps the full application
history on every request; cost grows with account age even though only five rows
are rendered. The sibling list route needs the full set
(`app/student/applications/page.tsx:26`), so the limit must be optional.
**Fix:** add a `limit?: number` parameter to `listStudentApplications` and pass
`5` from the overview, or introduce `listRecentStudentApplications(studentId, 5)`
with `limit 5` in the SQL; keep the unbounded call in the applications route.
Retain the `where a.student_id = ${studentId}` predicate and `order by created_at
desc` in both cases.

## Severity summary

| Severity | Count | IDs |
|---|---|---|
| HIGH | 0 | — |
| MED | 3 | U1, W1, W2 |
| LOW | 3 | U2, U3 (+ SUSPECTED U3b), D1 |
| Pass / cross-reference | 2 | No IDOR on the scoped read; no-RLS architecture owned by `FINAL-AUDIT.md:59-60` |

No HIGH issue was found on this route. No confirmed unauthorized data access,
injection, or client-side-only authorization flaw was found.

## Recommended fixes

1. **U1 (MED)** — `app/student/page.tsx:37-45,86-97`: early-return for
   `!user || !isStudent`; render an account-setup message only, with no student
   CTAs, figures, recent list or shortcuts.
2. **W2 (MED)** — `app/student/page.tsx:27` and `proxy.ts:28-34`: share a
   `safeRole` helper, stop defaulting a failed lookup to `/student`, and add
   `app/student/error.tsx` with a link to the verified role home.
3. **W1 (MED)** — `app/student/page.tsx:133-135` and
   `app/student/applications/applications-client.tsx:47-54`: deep-link recent
   rows with `?status=<status>` and initialize the filter from the query, or link
   each row to the existing project detail page.
4. **U3 / U3b (LOW)** — `app/student/page.tsx:143-146` and
   `lib/neon-data.ts:374`: normalize `created_at` to ISO once, format in
   `Asia/Thimphu`, and include the year when it is not the current year.
5. **U2 (LOW)** — `app/student/page.tsx:87-92`: drop `role="alert"` (superseded
   by fix 1).
6. **D1 (LOW)** — `lib/neon-data.ts:424-437` and
   `app/student/page.tsx:38`: add the optional `limit` and pass `5` from the
   overview; leave the applications list unbounded.

## Notes/limitations

- **Static audit only.** No process was listening on ports 3000–3010 when checked,
  so Playwright MCP could not verify the rendered page, focus order, live-region
  announcements or network behaviour. `webapp-testing` was therefore used for
  method only. Nothing here should be read as a runtime pass; the "Verified
  passing" list is source-based except where it cites an earlier rendered report.
- No `npm run build` was run (a `next dev` process must not be combined with a
  build), and no migration, seed, test or E2E was run.
- Uncommitted changes in the working tree were treated as authoritative. No file
  other than this report was created, edited or reverted.
- Cross-references are deliberate: `reports/FINAL-AUDIT.md:57-60` owns the
  two-provider sync and no-RLS risks; `reports/orchestrator-audit.md:116` owns the
  application-layer authorization verification;
  `reports/component-relevance-audit.md:39,88,98` owns the original recent-row
  affordance finding; `reports/visual-recheck.md:158,160` owns the old stat-card
  and arrow findings; `reports/accessibility-critic.md:38-47` owns the global
  focus, landmark and live-region pass; `reports/dashboard-design-direction.md:73`
  owns the status-language decision. This report adds only route-specific
  evidence and the new findings above.
- Out-of-scope observation for the next agent: the sibling route
  `app/student/applications/page.tsx:25-26` reads applications with only a `user`
  check and no role re-check. It is protected by the proxy, so no bypass is
  claimed, but it is worth checking in `student-applications.md`.
