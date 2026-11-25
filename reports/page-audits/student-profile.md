# Page audit — `/student/profile`

Date: 2026-11-24. Role: single read-only critic under `reports/PROTOCOL.md:3,10-19`. The only file written is this report. No product source, config, schema, test, existing report, or `reports/page-audits/INDEX.md` was edited. Uncommitted working-tree changes were treated as authoritative. All existing `reports/*.md` and `reports/page-audits/*.md` files were read before finalizing.

Findings are split into **Confirmed from source/runtime** and **Suspected**. Cross-referenced findings are listed but not re-scored.

## Route

`/student/profile` — authenticated student workspace page. `app/student/profile/page.tsx:14-95` resolves the session with Supabase Auth, reads the role and profile from Neon, mints a one-hour Storage signed URL for the student's own CV, and renders `ProfileForm`. The form writes through two server actions in `app/actions/student-profile.ts`. Founders/admins reach CVs through `app/api/cv/[id]/route.ts`, not through this page.

## Files traced

| File | Why |
|---|---|
| `app/student/profile/page.tsx:1-95` | Audited route: auth/role guard `:15-23`, profile load `:25-55`, own CV signed URL `:57-65`, fallback alert `:76-84`. |
| `app/student/profile/profile-form.tsx:1-514` | Audited client form: completion `:79-97`, skill batching `:107-127`, CV validation `:129-221`, progress UI `:225-265`, banner `:267-287`, fields `:289-511`. |
| `app/actions/student-profile.ts:1-122` | Downstream saves: role checks `:22-33`, `:79-90`; zod parse `:45-48`; profile writes `:65-72`; CV upload/link `:92-118`. |
| `lib/validators.ts:13-23,43-51` | Shared skill transform and `saveStudentProfileSchema`. |
| `lib/neon-data.ts:23-27,47-55,116-123,552-624,641-656` | Role lookup, full-name update, profile upsert/CV path write, profile reads, directory read. |
| `lib/supabase/server.ts:16-41` | Server Auth/Storage client and cookie handling. |
| `proxy.ts:100-134` | Protected-prefix gate and role-area redirect. |
| `app/api/cv/[id]/route.ts:22-92` | Downstream CV access for founders/admins. |
| `components/ui/shadcn/progress.tsx:20-73` | `Progress` role, value text, and visual track. |
| `neon/schema.sql:1-4` | Confirms application-layer authorization, no Neon RLS. |
| `supabase/run-all.sql:270-292` | Private `cvs` bucket, 5 MB limit, PDF-only MIME list, owner-folder insert/update policies. |
| `supabase/migrations/20261124000000_close_security_bypasses.sql:155-181` | Final CV SELECT policy: owner, admin, application relationship, or shortlist plus confirmed order. |
| `design/voice-guide.md:5-27` | Plain, local, human copy rules used for message review. |
| `reports/PROTOCOL.md`, `reports/SKILL-ASSIGNMENTS.md` | Overlap and skill precedence rules. |
| Existing report owners listed under "Cross-reference only" below | Used to avoid duplicate findings. |

## Skills used

Precedence follows `reports/SKILL-ASSIGNMENTS.md:5-13`. No unassigned conflicting aesthetic skill (`design-taste-frontend`, `apple-design`, `animate`, `gpt-taste`) was invoked, so no precedence conflict needed resolution.

| Skill | Applied here |
|---|---|
| `unslop` | Checked for decorative widgets, competing banners, and hype copy. The single banner slot at `profile-form.tsx:99-105` and real-state progress are deliberate and not flagged. |
| `better-interface` | Judged the form's action flow, banner state, CV card, and skill chips. |
| `better-layout` | Checked responsive grid at `:232`, two-column fields at `:395`, and full-width actions at `:350-357`, `:504-510`. |
| `better-ui` | Checked focus rings, target sizes, token drift, and the vendored `Progress` component. Token drift is cross-referenced, not re-scored. |
| `better-writing` | Reviewed labels, errors, hints, and empty/fallback copy against `design/voice-guide.md:5-27`. |
| `frontend-a11y` | Checked `role="alert"`/`role="status"`, `aria-describedby`, `Label htmlFor`, `aria-valuetext`, file-label focus, and keyboard skill removal. |
| `better-accessibility` | Checked visible focus, 44px targets, reduced-motion variants, and the no-link fallback path. |
| `webapp-testing` | Drove the route with Playwright MCP on `http://127.0.0.1:3000` in isolated context `profile-critic-unique-2426`. |
| `security-review` | Reviewed auth/role checks, error disclosure, file validation, signed URLs, and own-row reads. |
| `api-security-testing` | Traced `app/api/cv/[id]/route.ts` and Storage policies for owner/founder/admin boundaries. |

## UI/UX findings

### Confirmed from source/runtime

**U1 — LOW — Unauthenticated and non-student fallback has no next action**
- Location: `app/student/profile/page.tsx:76-84`.
- Why it matters: The page renders a `role="alert"` text node but offers no `/login` link and no role-home link. `proxy.ts:110-113` and `:124-131` normally redirect before this branch renders, so impact is limited to a proxy bypass or direct server-render fallback. A user who reaches it sees "Sign in to view your profile." with no sign-in control.
- Fix: Render a `Link` to `/login` when `!user` and a `Link` to the resolved role home when the role is wrong; keep `role="alert"` and the plain wording.

### Cross-reference only, not re-scored

- The real-state `Progress` binding is already praised as the reference implementation in `reports/component-relevance-audit.md:40` and accepted with runtime proof in `reports/orchestrator.md:132-141`. Runtime also showed `Completion 100%` and `Profile completion 8 of 8 details`. No new finding is added.
- Focus-ring and hard-coded palette drift at `profile-form.tsx:33`, `:313`, `:462` and `components/ui/shadcn/progress.tsx:49,62,67` belongs to the existing token issue in `reports/page-audits/admin-payments.md:80-84` and `reports/brand-tokens.md:5-7`; `lib/design-tokens.ts:44-48,70-71` reserves `#b23c26` for small text and `#d84f37` for focus. Apply the shared token when this form is next edited; do not double-score it here.
- Proxy role behavior and CV proxy authorization are owned by `reports/orchestrator-audit.md:116-117` and `reports/FINAL-AUDIT.md:36`. This audit adds no new access-control finding there.

### Resolved candidates, not findings

- The comment at `app/actions/student-profile.ts:111-113` says CVs open only through `/api/cv/[id]`, but the student's own preview is directly signed at `app/student/profile/page.tsx:59-65`. This is misleading documentation, not a confirmed security flaw. Founders/admins still use the proxy.
- The CV filename is intentionally shown inside the uploaded card at `profile-form.tsx:306`; "Selected file:" is intentionally limited to `!hasCv` at `:344-347`. No duplicate/chip overflow was proven. The runtime run with `S1` through `S16` could not prove current source behavior because the server was prebuilt.

## Workflow findings

### Confirmed from source

**W1 — MED — Full-name rule is stricter in the browser than at the server boundary**
- Location: `app/student/profile/profile-form.tsx:81`, `:154-156`, `:378`; `lib/validators.ts:44`.
- Why it matters: The completion check and both submit guards require at least two characters, but `saveStudentProfileSchema` accepts one. A direct server action can persist a one-character name while the UI reports completion under a different rule. `full_name` is consumed by founder browse and admin lists (`lib/neon-data.ts:641-656`).
- Fix: Export one shared rule, set the server schema to `min(2, 'Enter your full name (at least 2 characters).')`, and derive the completion check from the same constant.

**W2 — MED — Skill cap silently discards extra values at the server boundary**
- Location: `app/student/profile/profile-form.tsx:27`, `:107-127`; `lib/validators.ts:14-23`.
- Why it matters: The form blocks a 16th skill with an error. The server transform instead calls `.slice(0, 15)` and produces no issue, so any direct or repeated submission silently loses skills beyond 15. The schema comment says "max 15" but the behavior is truncation.
- Fix: Parse all comma-separated values, then `.refine((list) => list.length <= 15, { message: 'You can add up to 15 skills.' })`; return an actionable validation error instead of dropping data.

**W3 — MED — CV PDF validation differs across select, submit, and server**
- Location: `app/student/profile/profile-form.tsx:135`, `:194`; `app/actions/student-profile.ts:96-107`; `supabase/run-all.sql:271-275`.
- Why it matters: The change handler accepts a file when its name ends in `.pdf` even if `file.type` is empty or non-PDF. Submit and the server then reject anything except exact `application/pdf`, so a valid PDF with a blank or nonstandard MIME can be selected and then fail with "Use a PDF of 5 MB or smaller." with no next step. `file.type` is also client-controlled and Storage checks only the declared content type, so non-PDF bytes labelled `application/pdf` can be stored. This is a UX and data-integrity defect, not a proven access bypass because the bucket is private.
- Fix: Use one server-side predicate that checks a PDF signature (`%PDF-`) plus normalised extension/MIME, reject before upload, and mirror that predicate in the client. Do not rely on `file.type` alone.

**W4 — MED — Profile save is split across two writes with no transaction**
- Location: `app/actions/student-profile.ts:65-72`; `lib/neon-data.ts:565-592`, `:116-123`.
- Why it matters: `upsertStudentProfile` commits before `updateProfileFullName`. If the second statement fails, `student_profiles` has the new name while `profiles.full_name` stays stale, so the profile header and founder/admin name displays can disagree.
- Fix: Put both statements in one transaction or a small database RPC and return success only after both commit.

**W5 — MED — Raw driver error text is returned to the browser**
- Location: `app/actions/student-profile.ts:69-71`; `lib/neon-data.ts:23-27`.
- Why it matters: `NeonDataError.message` comes from the driver. `SaveResult.message` returns it verbatim and `profile-form.tsx:175` prints it. This can expose table names, constraint names, SQLSTATE codes, or connection details.
- Fix: Log the detailed error server-side with a correlation ID and return a generic safe message such as "Could not save profile. Try again or contact support."

**W6 — MED — CV upload can succeed in Storage but fail to link in Neon**
- Location: `app/actions/student-profile.ts:105-118`; `lib/neon-data.ts:594-612`.
- Why it matters: Upload happens before `setStudentProfileCv`. If the DB write fails, the object remains at `${user.id}/cv.pdf` and the message says "CV uploaded. Could not save the link. Try again." Retry overwrites the same path, but until then `cv_path` is unchanged, so own preview and founder access see the old CV or none.
- Fix: Delete the uploaded object when the DB write fails, or reconcile both sides through one idempotent server helper and report one outcome.

### Suspected, not confirmed at runtime

**W7 — LOW — Skill add can partially apply a comma list while reporting only an error**
- Location: `app/student/profile/profile-form.tsx:111-126`.
- Why it matters: The loop pushes valid skills before it meets a duplicate or the 16th value, then clears `skillInput` and shows one error. A user typing "React, Python, React" sees "React is already added." and may not notice Python was added. Runtime could not confirm this against the current source because port 3000 served a prebuilt server.
- Fix: Validate the whole batch first and commit only when clean, or report "Added 2 of 3. Skipped: React." and preserve rejected text for editing.

## Database/RLS findings

### Confirmed controls

- Students read only their own row: `app/student/profile/page.tsx:39-40` passes the authenticated `user.id`; `lib/neon-data.ts:614-624` uses a parameterized `where id = ${id} limit 1`.
- Both write actions recheck role from Neon before mutation: `app/actions/student-profile.ts:22-33`, `:79-90`; `getProfileRole` is parameterized at `lib/neon-data.ts:47-55`.
- The own CV preview URL is short-lived (one hour) and signed on each render at `app/student/profile/page.tsx:57-65`. The CV proxy uses five-minute links and repeats relationship rules at `app/api/cv/[id]/route.ts:48-92`.
- The `cvs` bucket is private, 5 MB, PDF-only, with owner-folder insert/update policies at `supabase/run-all.sql:270-292`. The final SELECT policy at `supabase/migrations/20261124000000_close_security_bypasses.sql:155-181` allows owner, admin, application relationship, or shortlist plus confirmed order.
- No new RLS finding: `neon/schema.sql:1-4` states that authorization stays in the application layer, and this audit found no SQL string interpolation in the traced helpers.

### Confirmed from source

**D1 — MED — Raw save errors cross the trust boundary**
- This is the data-layer cause already recorded as W5. Location: `lib/neon-data.ts:23-27` feeding `app/actions/student-profile.ts:69-71`. It is listed here for the Database/RLS section and counted once in the summary.

### Suspected

**D2 — MED — Profile data helpers trust caller-supplied user id**
- Location: `lib/neon-data.ts:594-612`, `:614-624`; `neon/schema.sql:1-4`.
- Why it matters: These helpers accept arbitrary `id` and perform no ownership or role check. Current callers pass `user.id` (`app/student/profile/page.tsx:40`, `app/actions/student-profile.ts:115`, `app/api/cv/[id]/route.ts:42`), and no exploit was found. Because Neon has no RLS by design, a future helper call that passes a different id would read or overwrite another student's row without a second guard.
- Fix: Require both `actorId` and `ownerId`, compare them before SQL, and throw on mismatch; or expose a narrow "own profile" repository that accepts only the authenticated session and never a raw id.

## Severity summary

| ID | Area | Severity | Status | Primary location |
|---|---|---|---|---|
| U1 | UI/UX | LOW | Confirmed | `app/student/profile/page.tsx:76-84` |
| W1 | Workflow | MED | Confirmed | `profile-form.tsx:154-156`; `lib/validators.ts:44` |
| W2 | Workflow | MED | Confirmed | `lib/validators.ts:14-23` |
| W3 | Workflow | MED | Confirmed | `profile-form.tsx:135,194`; `app/actions/student-profile.ts:96` |
| W4 | Workflow | MED | Confirmed | `app/actions/student-profile.ts:65-72` |
| W5 / D1 | Workflow + data | MED | Confirmed | `app/actions/student-profile.ts:69-71`; `lib/neon-data.ts:23-27` |
| W6 | Workflow | MED | Confirmed | `app/actions/student-profile.ts:105-118` |
| W7 | Workflow | LOW | Suspected | `profile-form.tsx:111-126` |
| D2 | Database/RLS | MED | Suspected | `lib/neon-data.ts:594-624`; `neon/schema.sql:1-4` |

Totals: **HIGH 0**, **MED 7**, **LOW 2**. One MED item (W5/D1) is counted once.

## Recommended fixes

1. Align validation first: one shared full-name rule (W1), one skill-cap error instead of truncation (W2), and one PDF predicate with signature checking (W3).
2. Make profile save atomic and stop returning raw driver text (W4, W5/D1).
3. Reconcile Storage and Neon on CV upload so a failed DB write cannot leave an unlinked object or stale message (W6).
4. Add actor/owner checks inside the profile data helpers even though current callers are correct (D2).
5. Add a sign-in or role-home link to the defensive fallback alert (U1).
6. Batch-validate skill additions or report partial success accurately (W7).
7. When touching these files, apply the existing focus-token fix from `reports/page-audits/admin-payments.md:80-84` instead of creating a new token finding.

## Notes/limitations

- Read-only pass. No product source, config, schema, test, existing report, `INDEX.md`, database row, or Storage object was changed. No build was run.
- Uncommitted working-tree changes were treated as authoritative. `git status --short` showed both target files modified; citations reflect the working tree.
- Playwright MCP verified `GET /student/profile` returned 200, login as `student.tashi@btc-e2e.test`, headings `My Profile`, `Progress`, `CV / Resume`, `Your details`, and rendered state `Completion 100%`, `Profile completion 8 of 8 details`, `CV Uploaded`. A `setInputFiles` test used an explicit `application/pdf` MIME and showed no "Selected file:" line; source review at `:306` and `:344-347` shows that is intentional when `hasCv` is true.
- Port 3000 served a prebuilt `next/dist/server/lib/start-server.js` process, not current-source `next dev`. Runtime evidence therefore proves the rendered build on that port, not every working-tree line. Suspected findings are labelled accordingly.
- No physical screen-reader pass, no real mobile-device pass, no live role-demotion test, and no database/Storage mutation was performed.
- `reports/page-audits/INDEX.md:32` still records this route as `pending`; the orchestrator owns changing it to `done`.
