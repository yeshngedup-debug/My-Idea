# Page audit — `/founder/students/[id]`

Date: 2026-11-24. Role: read-only page critic. No product source, config, schema, test, or existing report was edited. This file is the only file written by this audit. Worktree changes were treated as authoritative. No child agents were spawned, no shortlist action was clicked, and no seeded data was mutated.

## Route

Founder-facing full profile for one student. A server component authenticates, rechecks the founder role, verifies the target is a student with a `cv_path`, loads the founder's shortlist row, then renders profile fields, a CV link, and a client shortlist button. The CV link calls `/api/cv/[id]`; the button calls the `requestShortlist` server action.

## Files traced

- `app/founder/students/[id]/page.tsx` (audited in full)
- `app/founder/students/[id]/shortlist-button.tsx` (audited in full)
- `app/actions/shortlist.ts`
- `app/api/cv/[id]/route.ts`
- `lib/neon-data.ts`
- `lib/supabase/server.ts`
- `proxy.ts`
- `app/error.tsx`
- `lib/design-tokens.ts`, `app/globals.css`
- `supabase/seeds/local-dev.sql`, `supabase/schema.sql`, `supabase/student-profiles.sql`
- Next.js local docs: `node_modules/next/dist/docs/01-app/01-getting-started/10-error-handling.md`, `03-layouts-and-pages.md`
- All existing `reports/*.md` and `reports/page-audits/*.md` were read before finalizing.

## Skills used

Loaded and applied from `~/.config/opencode/skills/`: `unslop`, `better-interface`, `better-layout`, `better-ui`, `better-writing`, `frontend-a11y`, `better-accessibility`, `webapp-testing`, and `security-review`.

Precedence followed `reports/SKILL-ASSIGNMENTS.md:1-13`. `unslop` governed AI-tell and minimal-copy judgment (none found on this route). The `better-*` skills governed evidence-based interface findings. `frontend-a11y` and `better-accessibility` governed WCAG 2.2 checks. `webapp-testing` governed the Playwright runtime pass. `security-review` governed auth, role, and data-layer regression checks. `api-security-testing` was not available at `C:\Users\DELL\.config\opencode\skills\api-security-testing\SKILL.md`, so it was not used and is not cited. `design-taste-frontend`, `apple-design`, and `animate` are not assigned to this critic role and were not loaded.

## Data and call trace

| Step | Code | Behavior |
|---|---|---|
| 1 | `proxy.ts:100-113`, `proxy.ts:123-132` | `getUser()` validates the Supabase JWT; non-founders are bounced out of `/founder/*` before the page renders. |
| 2 | `page.tsx:30-41` | Awaits `params`, reads cookies via `createClient()` (`lib/supabase/server.ts:16-41`), redirects anonymous users to `/login`, then redirects any non-founder viewer to `/student`. |
| 3 | `page.tsx:43-52` | Calls `getProfileRole(id)` -> `lib/neon-data.ts:47-55`, `getStudentProfile(id)` -> `lib/neon-data.ts:614-624`, and `getShortlist(user.id, id)` -> `lib/neon-data.ts:788-803`. Non-student targets and targets without `cv_path` call `notFound()`. |
| 4 | `page.tsx:58-98` | Renders back link, `h1`, meta line, availability and skill badges, bio, CV link, and `ShortlistButton`. All queries are parameterized; no string interpolation into SQL was found. |
| 5 | `shortlist-button.tsx:20-34` | Calls `requestShortlist(studentId)` inside a transition; success sets local `shortlisted`; failure logs to console and shows a generic message. |
| 6 | `app/actions/shortlist.ts:17-55` | Re-reads the user, requires `founder`, requires target `student`, then `lib/neon-data.ts:725-786` checks application/order relationship and idempotency before insert. Revalidates `/founder/browse-students` and `/founder/shortlists`. |
| 7 | `page.tsx:91-93` -> `app/api/cv/[id]/route.ts:22-93` | Requires `founder`/`admin`; founders need an application or shortlist plus confirmed order (`:63-82`); then creates a 300-second signed Storage URL (`:84-92`). |

## Runtime evidence

- Playwright on `http://127.0.0.1:3000` with seeded founder accounts reached `/founder`, `/founder/browse-students`, and detail routes.
- Tashi `5199c208-e548-48b0-a441-4d6c36c3a640`: HTTP `200`, `h1` `Tashi Dorji`, button disabled with text `Shortlisted`, empty live region, links `Browse students` and `/api/cv/5199c208-e548-48b0-a441-4d6c36c3a640`.
- Pema `170b6f20-ad6b-4d36-a548-56054ae41162`: HTTP `200`, `h1` `Pema Choden`, button disabled with text `Shortlisted`. At a `360px` viewport, `scrollWidth === clientWidth === 360`, `h1` computed font size `20px`, and the shortlist button measured about `110.6 x 45.6px`.
- `GET /api/cv/170b6f20-ad6b-4d36-a548-56054ae41162` returned HTTP `500` with `{"error":"Could not generate CV link"}`. No shortlist request was clicked, so the disabled state reflects pre-existing database rows, not an action caused by this audit.
- At the final check there was no listener on `127.0.0.1:3000`. `npm run build` was not run while a dev server was active.

## Confirmed findings

### F1 — HIGH — CV link opens a JSON 500 in the verified local flow

- Status: confirmed runtime failure; not a blanket claim about production data.
- Location: link at `app/founder/students/[id]/page.tsx:89-93`; JSON 500 branch at `app/api/cv/[id]/route.ts:84-89`.
- Why it matters: `View CV (PDF)` is a primary reason to open this page. In the verified seeded flow it opens a new tab containing `{"error":"Could not generate CV link"}` instead of a PDF or a useful recovery step. The route's role and relationship checks passed before the failure, so this is a Storage/link failure, not an authorization rejection.
- Fix: make the seed environment store a real object under the `cvs` bucket at the path used by `cv_path`, or set `cv_path` only when the object exists. In the route, log the Storage error server-side and return a browser-friendly fallback for navigation requests (a small HTML error page with a back link to `/founder/browse-students`, or a redirect with a query flag) instead of raw JSON. Optionally check object existence before rendering the link in the page.

### F2 — HIGH — Both primary actions render without a relationship check

- Status: confirmed from source; runtime confirms reachability for the two seeded profiles but did not click the CTA.
- Location: `app/founder/students/[id]/page.tsx:43-52`, CV link at `:89-93`, button at `:96-98`; CV gate at `app/api/cv/[id]/route.ts:63-82`; shortlist rule at `app/actions/shortlist.ts:36-48` and `lib/neon-data.ts:732-749`.
- Why it matters: the page checks only viewer role, target role, and `cv_path`. It does not check whether the student applied to one of this founder's projects or whether the founder has a confirmed order. A founder who opens a student with no relationship sees a CV link that will return `403 No relationship with this student`, and an enabled `Request shortlist` button whose action returns `Shortlist students who applied to your projects, or any student once a premium shortlist is confirmed.` Both core actions therefore fail for the same predictable subset. `reports/page-audits/founder-browse-students.md:57-60` owns the directory-level version of this workflow gap; this finding adds the detail-page evidence and the CV half of the failure and does not repeat the browse fix.
- Fix: compute eligibility once on the server from `hasApplicationToFounderProject` plus confirmed order IDs. Pass it to the page. When ineligible, hide or replace the CV link with an access note and show a disabled button with the reason and a link to `/founder/shortlists`. Keep the CV proxy's server-side gate unchanged.

### F3 — MED — Any shortlist row disables the request button

- Status: confirmed from source; runtime shows the disabled state but does not prove which row caused it.
- Location: `app/founder/students/[id]/page.tsx:52`; query at `lib/neon-data.ts:788-803`; disabled state at `app/founder/students/[id]/shortlist-button.tsx:41,49-50`; action idempotency at `lib/neon-data.ts:751-760`.
- Why it matters: `getShortlist` selects any row for the founder/student pair with no `source`, `project_id`, or `status` filter. Admin-generated or project-scoped rows therefore set `alreadyShortlisted=true` and disable the general request button, while the server action only treats `source = 'founder' and project_id is null` as an existing general request. A founder can be blocked from a valid general request by an unrelated row. `reports/page-audits/founder-browse-students.md:62-65` owns the browse-card version; this is the detail-page instance through a different helper.
- Fix: add a page-scoped helper that filters `source = 'founder' and project_id is null` (add a status filter only if a terminal status should permit a new request), and pass that result as `alreadyShortlisted`. Keep the unfiltered full set for `/founder/shortlists`, which needs admin and project rows.

### F4 — LOW — Malformed `id` falls through to the global error page

- Status: confirmed from source; not runtime-reproduced after the dev server stopped.
- Location: `app/founder/students/[id]/page.tsx:30,43-49`; UUID-typed columns at `supabase/schema.sql:9-10` and `supabase/student-profiles.sql:7`; query wrappers at `lib/neon-data.ts:47-55,614-624`; fallback boundary at `app/error.tsx:18-50`.
- Why it matters: the raw path segment is passed to UUID comparisons. A malformed URL such as `/founder/students/not-a-uuid` makes Postgres throw instead of returning no rows. There is no `[id]/error.tsx` or `not-found.tsx` in this segment, so Next.js uses the global boundary: `This page could not load` with a `Back to home` link. That loses founder workspace context for a simple bad-link case and also gives a generic fallback for a real data outage. No data leaves the server; this is an error-path issue.
- Fix: validate `id` before the first DB call (`z.string().uuid().safeParse(id)` or equivalent) and call `notFound()` on failure. Add a route-scoped `error.tsx` that says the profile could not load and links back to `/founder/browse-students`, following the local pattern in `app/founder/projects/[id]/error.tsx:7-48`.

### F5 — LOW — App-level colors bypass canonical tokens

- Status: confirmed from source and consistent with runtime-rendered markup; visual severity not separately measured.
- Location: `app/founder/students/[id]/page.tsx:58,62,66-98` and `app/founder/students/[id]/shortlist-button.tsx:43-47,60-64`.
- Why it matters: the page and button use raw hex values including off-token `#4c5a52`, while `lib/design-tokens.ts:18-48` and `app/globals.css:3-28` already define the warm ramp and accent roles. `reports/brand-tokens.md:3-10` normalized `components/**` only, so these app-level declarations were left outside that pass. The values are legible; the problem is token drift that makes future theme changes partial.
- Fix: replace hex classes with Tailwind theme utilities (`text-body-secondary`, `text-forest`, `border-border`, `bg-surface`, `bg-background`, `text-small-text-accent`) or import `colors` from `lib/design-tokens.ts`. This extends, rather than repeats, `reports/brand-tokens.md`.

### F6 — LOW — Back link is a 36 px target

- Status: confirmed from source.
- Location: `app/founder/students/[id]/page.tsx:58` (`min-h-9`).
- Why it matters: the back link is the only way out of the page header and uses a 36 px minimum height, while the shortlist button uses `min-h-11` (`shortlist-button.tsx:43`) and the project records a 44 px control target in `reports/brand-tokens.md:7`. It clears WCAG 2.2 AA's 24 px minimum; this is consistency with the project's own target, not an AA failure.
- Fix: change `min-h-9` to `min-h-11` on the back link.

### F7 — LOW — `select *` over-fetches unused profile fields

- Status: confirmed over-fetch; performance impact not measurable in this static audit.
- Location: `lib/neon-data.ts:614-624` (`select *`), mapped fields at `:514-549`, consumed at `app/founder/students/[id]/page.tsx:47-49,62-98`.
- Why it matters: the page uses eight profile fields plus `cv_path`. The helper still reads `contact_email`, `rank`, `verified`, `cv_url`, and timestamps. No unused value is sent to the browser, so there is no exposure here, but the server reads and maps unnecessary columns. `reports/page-audits/founder-browse-students.md:81-84` owns the analogous list-query finding; this is the single-row detail helper.
- Fix: project only `full_name, college, course, year, skills, bio, availability, cv_path` in a detail-specific query or narrow the shared helper's select list.

### F8 — LOW — Redundant `user ?` guard

- Status: confirmed from source.
- Location: `app/founder/students/[id]/page.tsx:36,52`.
- Why it matters: `!user` already redirects at `:36`, so the conditional at `:52` can never be false. It adds no protection and suggests `user` may still be nullable at this point.
- Fix: replace with `const existing = await getShortlist(user.id, id);`.

## Suspected findings

### P1 — Suspected — Seed CV path has no matching Storage object

- Severity: LOW to MED depending on how widely the seed is reused; the resulting 500 is confirmed in F1, the root cause is not.
- Location: `supabase/seeds/local-dev.sql:66,75,81`; consumed by `app/api/cv/[id]/route.ts:84-89`.
- Why it matters: the seed comment says `cv_path is enough for the CV link UI` and writes `<student-id>/demo-cv.pdf`, but no matching object is uploaded in the seed. Supabase `createSignedUrl` then returns no `signedUrl`, which matches the observed 500. This is an environment-data explanation, not proof about production rows.
- Fix: upload a small PDF fixture to `cvs/<student-id>/demo-cv.pdf` in the local seed flow, or seed `cv_path` only from a verified object path. Add a seed smoke check that calls the CV route for each seeded student.

### P2 — LOW — Live region role changes at announcement time

- Status: suspected from source; no screen-reader runtime was available.
- Location: `app/founder/students/[id]/shortlist-button.tsx:55-69`.
- Why it matters: the same mounted `<p>` switches `role` between `status` and `alert` and switches `aria-live` between `polite` and `assertive` at the moment feedback text is inserted. Some assistive technology announces reliably from a stable live region but can miss a role change that happens with the content update. The pending state is also only visual button text at `:51-53`.
- Fix: keep one stable `role="status" aria-live="polite"` region for success and error text and style errors with `text-small-text-accent`; if an assertive error is required, use a second always-mounted `role="alert"` region and move only its text. Add an `aria-busy` or status message for the pending state if it needs to be announced.

## Checked, no finding

- Auth is layered correctly for this route: `proxy.ts:100-132`, `page.tsx:32-41`, and `app/api/cv/[id]/route.ts:29-40` all recheck identity/role. No anonymous profile or CV path was found.
- All traced SQL uses parameters (`lib/neon-data.ts:50,619,796,738-741,499-503`); no SQL injection vector was found in this route's data reads.
- The CV proxy's relationship rule is intentional and already documented in `reports/FINAL-AUDIT.md:31-38`. F2 reports the page's failure to reflect that rule, not a new authorization hole in the API.
- `app/actions/shortlist.ts:52-53` does not revalidate the detail path. The page reads cookies via `createClient()` at `page.tsx:31-34`, so it is dynamic, and the client sets `shortlisted` immediately at `shortlist-button.tsx:26`. Adding `revalidatePath('/founder/students/...')` would be redundant.
- Copy is plain and task-led; `unslop` found no AI tell, hype label, or empty filler on this page.
- `motion-reduce:transition-none` is present on the interactive link and button (`page.tsx:58,91`, `shortlist-button.tsx:43`), so no motion finding was raised.
- No horizontal overflow at `360px`; the `h1` wraps and the shortlist button exceeds 44 px.

## Overlaps deliberately not repeated

- Raw database error text returned by `app/actions/shortlist.ts:49` is owned by `reports/page-audits/founder-browse-students.md:86-89`. The detail route reaches the same action, but this audit adds no new evidence about that branch.
- The missing next step after `Shortlisted` is owned by `reports/component-relevance-audit.md:49` (`Shortlist requested · View Premium Shortlist`). F2/F3 stop at eligibility and state; they do not re-report that gap.
- Global absence of Neon RLS and app-layer authorization are owned by `reports/FINAL-AUDIT.md:31-38` and `reports/orchestrator-audit.md`. F2 does not repeat that context.
- `reports/dashboard-design-direction.md:77-81` already owns the document-rhythm direction for detail pages. This report judges the current page only; F5/F6 are token and target-size evidence, not a redesign proposal.
- `reports/accessibility-critic.md` covers form announcements generally. P2 is limited to this button's dynamic live-region role.
- `reports/page-audits/INDEX.md:29` still lists this route as `pending`; this critic did not edit the index. The orchestrator owns that status update.

## Severity summary

| Severity | Count | Finding IDs |
|---|---:|---|
| HIGH | 2 | F1, F2 |
| MED | 1 | F3 |
| LOW | 5 | F4, F5, F6, F7, F8 |
| Suspected | 2 | P1, P2 |

## Recommended fixes

1. **F1 / P1** — seed a real CV object and return a browser-friendly fallback from `app/api/cv/[id]/route.ts:84-89`.
2. **F2** — pass relationship eligibility to the detail page; stop rendering failing CV and shortlist actions for ineligible students.
3. **F3** — scope the detail shortlist lookup to general founder rows.
4. **F4** — validate the UUID path segment and add a route-scoped error boundary.
5. **F5 / F6 / F7 / F8** — use canonical tokens, raise the back link to `min-h-11`, narrow the profile select, and remove the dead `user ?` check.
6. **P2** — stabilize the live-region role before changing its text.

## Notes and limitations

- Runtime verification was possible for page rendering and the CV link, but the dev server stopped before a second CV request could be captured. Tashi's CV response was not rechecked; only Pema's observed 500 is claimed.
- No E2E test was written or run, no build was run, and no product file was changed. Findings marked `confirmed from source` are static evidence; findings marked `suspected` are explicitly not proven at runtime.
- Severity is scoped to this route. F1 is HIGH because the verified local flow breaks the page's primary document action; it is not a claim that every seeded or production CV is broken.
