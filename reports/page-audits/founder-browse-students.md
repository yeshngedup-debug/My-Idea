# Page audit — `/founder/browse-students`

Date: 2026-11-24. Role: read-only critic. No product source, config, schema, test, or existing report was edited. This file is the only output written. Worktree changes were treated as authoritative.

## Route

`/founder/browse-students` — founder workspace student directory. A server component authenticates and loads student profiles plus the founder's shortlist IDs; a client component provides text search, availability filters, profile links, and shortlist requests. Card links lead to `/founder/students/[id]`; the shortlist button calls the `requestShortlist` server action.

## Files traced

- `app/founder/browse-students/page.tsx`
- `app/founder/browse-students/browse-client.tsx`
- `components/layout/pinned-heading-section.tsx`
- `components/layout/workspace-page-heading.tsx`
- `components/ui/badge.tsx`
- `components/ui/input.tsx`
- `components/interactive/segmented-control.tsx`
- `app/actions/shortlist.ts`
- `app/founder/students/[id]/page.tsx`
- `app/founder/students/[id]/shortlist-button.tsx`
- `app/api/cv/[id]/route.ts`
- `lib/neon-data.ts`
- `lib/supabase/server.ts`
- `proxy.ts`
- `app/founder/loading.tsx`
- `tests/e2e/founder-flow.test.ts`

## Skills used

Loaded and applied from `~/.config/opencode/skills/`: `unslop`, `better-interface`, `better-layout`, `better-ui`, `better-writing`, `frontend-a11y`, `better-accessibility`, `webapp-testing`, `security-review`, and `strix/api-security-testing`.

Precedence followed `reports/SKILL-ASSIGNMENTS.md:1-13`: `unslop` was authoritative for AI-tell and minimal-copy judgment (no AI-tell copy found on this route); `better-*` skills governed evidence-based interface findings; `security-review` plus `api-security-testing` governed the auth/data-layer regression checks. `design-taste-frontend`, `apple-design`, and `animate` are not assigned to this audit role and were not loaded.

## UI/UX findings

### Accessibility

**U1 — MED — Confirmed from source; runtime not re-verified**
- Location: `app/founder/browse-students/browse-client.tsx:207-224` (button text at `:217-223`)
- Why it matters: every card renders a button with the identical accessible name `Request shortlist` (or `Shortlisted`). In a screen-reader button list, or when using voice control, the controls are indistinguishable and cannot be tied to the student whose card they sit in. This is a naming failure, not a state failure (`aria-pressed` on the filter buttons at `:115` is correct).
- Fix: add a per-student accessible name on the button, e.g. `aria-label={isShortlisted ? `Shortlisted: ${s.full_name}` : `Request shortlist for ${s.full_name}`}`. Keep the visible label unchanged.

**U2 — LOW — Confirmed from source; overlaps an existing report**
- Location: `app/founder/browse-students/browse-client.tsx:109-125`, target-size class at `:116`
- Why it matters: the hand-rolled availability row is a plain `div` with no group name, and its buttons use `min-h-9` (36 px) while the search input uses `min-h-11` (`components/ui/input.tsx:37`) and the shared selector uses `min-h-11` (`components/interactive/segmented-control.tsx:87`). 36 px clears WCAG 2.2 AA's 24 px minimum but misses the project's 44 px control target recorded in `reports/brand-tokens.md:7`. `reports/component-relevance-audit.md:48` already owns the missing arrow-key navigation recommendation for this same control; this finding adds the group-name and target-size evidence and does not repeat that recommendation.
- Fix: replace the `div` at `:109` with `SegmentedControl` (`components/interactive/segmented-control.tsx:26-98`), pass `ariaLabel="Availability"`, and delete the local `AVAILABILITY_FILTERS` button markup. That yields one 44 px, named, arrow-key-capable control and resolves both findings.

### Visual and tokens

**U3 — LOW — Confirmed in source; visual impact not runtime-verified**
- Location: `app/founder/browse-students/browse-client.tsx:174`
- Why it matters: the availability badge uses Tailwind default palette classes `border-amber-200 bg-amber-50` while every other badge on the same page uses the canonical warm tokens (`browse-client.tsx:189,192`; `components/ui/badge.tsx:10-14`). `reports/brand-tokens.md:3-10` scoped normalization to `components/**`, so this app-level class was not covered there. The text colour `#8a5a00` is consistent with the workspace eyebrow (`components/layout/workspace-page-heading.tsx:21`), so only the border/background are off-system.
- Fix: drop `border-amber-200 bg-amber-50`, render `<Badge variant="outline" className="text-[#8a5a00]">`, or if a filled amber badge is intended, add a canonical token instead of raw `amber-*` utilities.

## Workflow findings

**W1 — HIGH — Confirmed from source; failure path untested in E2E**
- Location: `app/founder/browse-students/browse-client.tsx:207-224`; data source `app/founder/browse-students/page.tsx:39-52`; enforcement `app/actions/shortlist.ts:36-44` and `lib/neon-data.ts:732-749`
- Why it matters: `Request shortlist` is enabled on every card, including students who never applied to one of the founder's projects and are not covered by a confirmed order. For those cards the action rejects with `Shortlist students who applied to your projects, or any student once a premium shortlist is confirmed.` The page offers no route to establish that relationship, so the directory's primary action predictably fails for most students. The existing E2E only proves the happy path with a seeded relationship (`tests/e2e/founder-flow.test.ts:90-99`), so this failure branch has no regression coverage.
- Fix: compute eligibility once on the server (a helper returning the set of student IDs with an application to one of this founder's projects, plus `true` for all students when an order with `project_id is null` is confirmed), pass that set to `BrowseClient`, and either hide/disable the CTA with an inline reason or relabel it to `View shortlist options` and link to `/founder/shortlists` for ineligible students.

**W2 — MED — Confirmed from source**
- Location: `lib/neon-data.ts:805-817` (`listShortlistedStudentIds`), consumed at `app/founder/browse-students/page.tsx:35,53` and `app/founder/browse-students/browse-client.tsx:46,209,217-218`
- Why it matters: the query returns every `student_id` in `public.shortlists` for the founder with no filter on `source`, `project_id`, or `status`. Admin-generated rows and project-scoped rows therefore mark a general card as `Shortlisted` and disable the card's request button, even though the action's idempotency check only treats `source = 'founder' and project_id is null` as an existing general request (`lib/neon-data.ts:751-760`). A founder can be blocked from making a valid general request by an unrelated row.
- Fix: scope this query for the browse page to `source = 'founder' and project_id is null` (add a status filter only if a terminal status should also allow a new request). Keep the full, unfiltered set for `/founder/shortlists`, which legitimately needs admin and project rows.

**W3 — LOW — Confirmed from source**
- Location: `app/founder/browse-students/browse-client.tsx:133-150` versus the buttons at `:207-224`
- Why it matters: shortlist feedback is rendered above the card grid. On a long list the clicked button can be several screens below the message, so a sighted user gets no visible confirmation at the point of action. The persistent live region does announce the result to assistive technology, so this is a visual proximity issue only.
- Fix: keep the mounted live region for announcements, but also render a short per-card status line immediately under the button keyed by student ID (or give the global message an `id` and scroll it into view after the transition settles).

## Database/RLS findings

Global context: the absence of Neon RLS and the application-layer authorization model are already owned by `reports/FINAL-AUDIT.md:31,59,80` and `reports/orchestrator-audit.md:116-117`. The findings below are specific to this route and do not repeat that global finding. All SQL observed in `lib/neon-data.ts` is parameterized; no string interpolation was found in the traced functions.

**D1 — MED — Confirmed from source**
- Location: `app/founder/browse-students/page.tsx:28-37`
- Why it matters: `getProfileRole(user.id)`, `listBrowseableStudents()`, and `listShortlistedStudentIds(user.id)` run in one `Promise.all` before `if (role !== 'founder') redirect('/student')` at `:37`. A signed-in student or admin therefore triggers a full student-profile scan and a shortlist read before being rejected. No data leaves the server in that case, so this is an authorization-ordering and load issue, not a confirmed leak.
- Fix: await `getProfileRole(user.id)` first, redirect on any non-founder role, and only then run the two data reads in `Promise.all`.

**D2 — LOW — Suspected (scalability); confirmed over-fetch in source**
- Location: `lib/neon-data.ts:641-656`, mapped into client props at `app/founder/browse-students/page.tsx:39-49`
- Why it matters: `listBrowseableStudents()` uses `select *` with no `limit` and returns `contact_email`, `cv_path`, `cv_url`, `rank`, `verified`, and timestamps in addition to the eight fields the page serializes (`StudentProfileRow` at `lib/neon-data.ts:514-530`). Only the eight mapped fields reach the browser, so there is no PII exposure here, but the server reads and maps unused columns and the client payload grows linearly with the directory. Impact depends on future row count, which is not measurable in this static audit.
- Fix: project only `id, full_name, college, course, year, skills, bio, availability` in this helper and add cursor pagination (`order by updated_at desc, id desc` with a `limit` and cursor) before the directory is large. Leave `cv_path`/`contact_email` reads to `getStudentProfile` (`lib/neon-data.ts:614-624`) and the CV proxy (`app/api/cv/[id]/route.ts:42-92`).

**D3 — LOW — Confirmed from source**
- Location: `app/actions/shortlist.ts:38-50`, raw interpolation at `:49`
- Why it matters: any database failure not matching the two handled cases is returned to the client as `Shortlist request failed: ${detail}`. Neon/Postgres error text can include constraint names, column names, or SQLSTATE codes. That is internal schema detail exposed through a founder-facing UI, and `browse-client.tsx:72` prints it directly in the status region.
- Fix: log `detail` server-side only and return a generic message such as `Shortlist request failed. Please try again.` Keep the explicit no-relationship guidance at `:40-45`, which is user-safe.

**D4 — LOW — Confirmed in source; currently mitigated by proxy**
- Location: `app/founder/browse-students/page.tsx:28-54`; contrast `app/founder/students/[id]/page.tsx:36`
- Why it matters: when `user` is null the page skips the data block but still returns a 200 response with the workspace heading, search control, filter row, and `No students yet` empty state. The detail page redirects unauthenticated users to `/login`, so the two founder routes disagree. Normal traffic is protected by `proxy.ts:110-113`, so this is a defence-in-depth gap rather than a currently reachable anonymous page; it would fail open if the proxy matcher were narrowed or the page were rendered through another entry point.
- Fix: add `if (!user) redirect('/login');` before the conditional block, then fetch unconditionally.

## Severity summary

| Severity | Count | Finding IDs |
|---|---:|---|
| HIGH | 1 | W1 |
| MED | 3 | U1, W2, D1 |
| LOW | 6 | U2, U3, W3, D2, D3, D4 |

No confirmed critical/data-loss issue was found. The CV proxy at `app/api/cv/[id]/route.ts:36-82` keeps its role and relationship gate, so the browse page's broad profile list does not translate into unrestricted CV download.

## Recommended fixes

1. **W1 (HIGH)** — add server-side shortlist eligibility and stop offering a CTA that fails for most students; cover the rejection branch in E2E.
2. **D1 (MED)** — check founder role before any data read in `page.tsx`.
3. **W2 (MED)** — scope `listShortlistedStudentIds` to general founder rows for this page.
4. **U1 (MED)** — give each shortlist button a student-specific accessible name.
5. **U2 / U3 / W3 (LOW)** — replace the availability row with `SegmentedControl`, normalize the badge tokens, and place action feedback next to the clicked card.
6. **D2 / D3 / D4 (LOW)** — narrow and paginate the browse query, stop echoing raw DB errors, and redirect unauthenticated visitors at the page level.

## Notes/limitations

- Live verification was not possible: `http://127.0.0.1:3000/founder/browse-students` returned `NO_SERVER: Unable to connect to the remote server` when checked. No dev server was started and `npm run build` was not run while a dev server might be active. Playwright MCP was therefore not used; all confirmed findings are source-backed, and each is labelled as to whether runtime behavior was observed.
- Prior runtime evidence was reused rather than duplicated: `reports/component-relevance-audit.md:48,69` and `reports/visual-recheck.md:148` already verified that the availability filter changes the result count (`2 students` → `1 student available weekends`). This audit does not re-report that behavior as a finding.
- Overlaps deliberately not repeated: `reports/FINAL-AUDIT.md:31,59,80` and `reports/orchestrator-audit.md:116-117` own the global no-Neon-RLS and app-layer authorization finding; `reports/component-relevance-audit.md:48` owns arrow-key navigation for the availability control; `reports/brand-tokens.md:7` owns the 44 px target work in `components/**`; `tests/e2e/founder-flow.test.ts:90-99` owns the happy-path shortlist proof.
- No child agents were spawned, no seeded data was mutated, and no assumption was made about unverified profile quality (`verified` at `lib/neon-data.ts:526` is not used by this page's filter; whether that is intended is a product question, not a finding here).
