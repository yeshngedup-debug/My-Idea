# Pass 3 — deadline status fixes

Date: 2026-11-25. Scope: F-13 (deadline semantics) and F-35 (zero-row status updates) from `reports/page-fixes/pass2-consolidated.md`. The dirty working tree was treated as the source of truth; all pre-existing uncommitted work was preserved.

## Changed files

- `app/actions/projects.ts`
  - Added local-calendar deadline parsing/state helpers that mirror the student card.
  - `createProject` now accepts date-only deadlines through the end of the local calendar day instead of parsing `YYYY-MM-DD` as UTC midnight and comparing it with local midnight.
  - `updateProjectStatus` and `updateApplicationStatus` now treat a `false` affected-row result as a stale update: they revalidate the relevant paths, return `ok: false`, and say to refresh and try again.
  - Centralised status revalidation into `revalidateProjectPaths` / `revalidateApplicationPaths`.
- `lib/neon-data.ts`
  - `updateProjectStatus` now uses `returning id` and returns `Promise<boolean>`.
  - `updateApplicationStatus` now returns inserted history rows from the final statement and returns `Promise<boolean>`. Re-applying the same status remains a no-op with `false`.
- `app/founder/projects/post/post-project-form.tsx`
  - Deadline help now states that the optional date is open through that date in local time and is shown on the student card.
  - The help text is wired to the date input with `describedBy`.
- `app/actions/projects.test.ts`
  - Added current-day, date-only deadline coverage under `America/Los_Angeles`.
  - Added affected-row defaults and stale zero-row failure tests for both project and applicant status actions.
  - Added `updateProjectStatus` imports/coverage and revalidation assertions.
- `reports/page-fixes/pass3-deadline-status.md`
  - This report.

## Behavior verified in source

- **F-13:** date-only form values stay `YYYY-MM-DD`; the action parses them as local midnight and rejects them only after local `23:59:59.999`. This matches the existing student card parser/closer in `app/student/projects/projects-client.tsx`, which was read but not changed. Timestamp deadlines still use their parsed instant.
- **F-35:** a zero-row update is no longer reported as success. Both status actions return truthful stale-update copy and call `revalidatePath` before returning. Per the installed Next.js server-actions guide, `revalidatePath` includes a current-route RSC re-render in the action response, so the row refreshes without a separate client fetch. Existing thrown-error copy and authority/transition checks are unchanged.

## Verification

Commands run:

- `npx eslint app/actions/projects.ts app/actions/projects.test.ts app/founder/projects/post/post-project-form.tsx app/student/projects/projects-client.tsx lib/neon-data.ts` — clean; no findings.
- `npx vitest run app/actions/projects.test.ts` — 1 test file passed; 13 tests passed.
- `git diff --check` — no whitespace errors; Git emitted pre-existing LF/CRLF warnings for already-dirty files.

Not run: full `npm test`, `npm run build`, dev server, dependency install, browser drive, commits, or destructive Git operations.

## Routed / out of scope

- No runtime proof was attempted; F-13 and F-35 are resolved at source and by focused tests, not by browser verification.
- F-15 image provenance and all auth/payment/config/layout/schema findings remain routed to their named owners; no authors or licences were guessed.
- Other rows in `reports/page-fixes/pass2-consolidated.md` were not edited or closed by this pass.
