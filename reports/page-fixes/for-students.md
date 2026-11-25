# `/for-students` page-fix report

Date: 2026-11-24. Scope: `app/for-students/page.tsx` and this report only, per `reports/page-fixes/MANIFEST.md`. The dirty working tree was treated as source of truth. No shared, DB, workflow, config, or other route file was edited.

## Files changed

- `app/for-students/page.tsx`
  - Tightened the hero alt at `:114` from a guess about gho, kira, and computers to a description supported by the credited Wikimedia file: young Bhutanese people working in groups at a training day in Thimphu. This closes the suspected S1 item in `reports/page-audits/for-students.md:27`.
  - Corrected the photo note at `:238-240` from "Bhutanese places" to "Bhutanese people in community settings." Both credited photos show people, not only places, and neither shows platform members.
  - Softened the application step at `:86` from "Your profile and CV go with it" to "You can send one application per project. A complete profile and CV help founders decide." The old clause implied a completeness gate that the apply path does not enforce.
  - No layout, color, token, component, CTA target, or metadata change was needed.

No other file was edited.

## Checks performed

- Read in full before editing: `reports/page-fixes/MANIFEST.md`, `reports/page-audits/for-students.md`, the relevant sections of `reports/page-audits/CONSOLIDATED.md` (`P1` item 3 at `:195` and the verification gap at `:244-247`), `AGENTS.md`, `design/brand-system.md`, `design/brand-guidelines.md`, `design/voice-guide.md`, `lib/design-tokens.ts`, and `app/globals.css`.
- Read the installed Next.js 16 guides for the APIs this page uses: `01-getting-started/03-layouts-and-pages.md`, `05-server-and-client-components.md`, `07-mutating-data.md`, `10-error-handling.md`, `12-images.md`, and `14-metadata-and-og-images.md`. This page remains a Server Component with static metadata and no data fetch, form, or server action, so no directive or boundary change applies.
- Verified the hero source against the Wikimedia Commons API for `File:Bhutanese youth.jpg`. Its description is "Bhutanese youths work in groups as part of a training day in democracy and action held by BCMD in Thimphu." This supports the new alt and contradicts the old "at computers" detail. The credit URL at `:115` is the correct file page and needs no change.
- Source-verified the F1 claim chain: `app/for-students/page.tsx:86,169,184`; `app/actions/projects.ts:103-135`; `lib/neon-data.ts:380-389`; `neon/schema.sql:35-42`; `app/student/projects/projects-client.tsx:163-174`; `app/actions/auth.ts:124-132`; `lib/validators.ts:43-51`.
- Re-verified `:86`, `app/actions/projects.ts:103-135`, and `lib/neon-data.ts:380-389` after the `/how-it-works` agent flagged cross-route copy consistency. No profile or CV completeness check exists in the apply path, so the unsupported clause was removed.
- Source-verified the other page claims against `neon/schema.sql` and `lib/neon-data.ts`: application statuses, one application per student and project, budget and deadline fields, the student and project application indexes, and the CV privacy path in `app/actions/student-profile.ts:92-115` and `app/api/cv/[id]/route.ts:36-92`.
- `npx eslint app/for-students/page.tsx` passed with no findings.
- `git diff -- app/for-students/page.tsx` reviewed: three small copy/alt edits only.
- No full `next build`, `npm test`, or dev server was run, per the manifest. No runtime/browser verification was attempted.

## Workflow findings routed to the workflow owner

- **F1, MEDIUM, partially mitigated in the owned file.** `app/for-students/page.tsx:169,184` still states that the profile must be complete before applying. The former `:86` clause that profile and CV go with every application has been softened in this pass, but the server-side fix still lives outside the owned file.
  - Observed behavior: `app/actions/projects.ts:103-135` checks only sign-in, student role, project existence, open status, and duplicate application. It calls `insertApplication(user.id, projectId)` at `:123`. `lib/neon-data.ts:380-393` inserts only `student_id`, `project_id`, and `status = 'pending'`. There is no read of `student_profiles` or `cv_path`. The Apply button is disabled only for `applied || applying` at `app/student/projects/projects-client.tsx:165`. Signup can create a profile with only a name (`app/actions/auth.ts:124-132`), and `saveStudentProfileSchema` requires only `full_name` (`lib/validators.ts:43-51`), while the page lists seven expected fields at `app/for-students/page.tsx:61-69`.
  - Recommended fix: in `app/actions/projects.ts`, before `insertApplication`, load `getStudentProfile(user.id)` and require non-empty `full_name`, `college`, `course`, `year`, `skills`, `bio`, `availability`, and a non-null `cv_path`. Return `Complete your profile and add a PDF CV before applying.` and do not insert when any value is missing. Keep the duplicate check and role/project checks in place. If the product intentionally allows incomplete applications, soften the remaining `:169,184` strings too, but `reports/page-audits/CONSOLIDATED.md:195` currently assigns this as a server-side invariant, so those two strings were left intact.
  - Supporting owner: `lib/validators.ts:43-51` is also shared validation and should be aligned if the completeness rule becomes authoritative.

- No other workflow finding originated in this route. Metadata, internal links, and the CV claim are consistent with current source. S2, the three `/signup` CTAs at `:111,:171,:329`, remains unconfirmed and is listed under deliberate non-changes.

## Database findings routed to the database owner

- **Profile/CV completeness has no database invariant.** `neon/schema.sql:44-63` allows every listed profile field to be null or empty by default, and `cv_path` at `:57` is nullable. `neon/schema.sql:35-42` enforces only the foreign keys, the status set, and `unique (student_id, project_id)` at `:41`. `lib/neon-data.ts:380-393` therefore records an application even when the student row is absent or empty. This is the database side of F1.
  - Recommended fix: coordinate with the workflow owner so the application boundary verifies the full profile and CV path before insert, ideally in one transaction. A database trigger or check function on `public.applications` is an option if the invariant must survive direct SQL writes, but draft profiles must stay allowed until the student applies.
- **Claims that do match the schema.** `pending`, `shortlisted`, `accepted`, and `rejected` at `page.tsx:91` match the CHECK at `neon/schema.sql:39` and the action list at `app/actions/projects.ts:138`. One application per project at `:86` matches `unique (student_id, project_id)` at `neon/schema.sql:41`. Budget range and deadline at `:81,316-318` match `budget_min`, `budget_max`, and `deadline` at `neon/schema.sql:29-32`. The lookup indexes at `neon/schema.sql:87-92` cover the application reads used by this flow.
- **No stale status values or route-specific unbounded reads were found.** The page makes no direct query. `listConfirmedOrderProjectIds` at `lib/neon-data.ts:1046-1059` has no explicit `limit`, but it is filtered by `founder_id` and belongs to the founder CV/shortlist flow, not this route. It is noted for the database owner only as a scale observation, not a `/for-students` defect.
- The former `:86` claim that profile and CV go with every application was removed because completeness is not guaranteed. Applications still reference the student and `student_profiles.cv_path` exists, so profile and CV are structurally reachable. The softened line now presents completeness as helpful, not enforced. See F1.

## Deliberately not changed

- The F1 copy at `:169,184` was not softened. The preferred fix is server-side enforcement, owned by the workflow and database owners (`reports/page-audits/CONSOLIDATED.md:195`). The cross-route correction at `:86` removes only the unsupported "go with it" clause; changing the remaining gate wording without an owner decision would alter the product promise further.
- The three `/signup` CTAs at `:111,171,329` were left as-is. S2 in the audit is unconfirmed without an authenticated browser session and may be an intentional marketing default. Auth-state-aware CTAs belong to the signup/design-system owners.
- The hero credit URL at `:115` and the second photo alt at `:246` were left as-is. The Commons metadata confirms the credit target, and no contrary evidence was found for the second image.
- Shared marketing components, `app/globals.css`, `lib/design-tokens.ts`, DB files, server actions, validators, `MANIFEST.md`, and other agents' reports were not touched.
- No full build, test suite, or dev server was run, and no runtime assertion was claimed. The three edits are source-verified and lint-clean.
