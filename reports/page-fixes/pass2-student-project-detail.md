# Pass 2 — `/student/projects/[id]` (student-project-detail)

## Scope

Second-pass feature-completeness review of the phase-1 HIGH item: the detail
page had no Apply control. Verification and fixes stayed inside the owned files:

- `app/student/projects/[id]/page.tsx`
- `reports/page-fixes/pass2-student-project-detail.md` (this report)

No shared file, schema, config, test, other page, other report, `MANIFEST.md`,
or phase-2 report was edited. No install, dev server, browser tool, build, or
`npm test` was run.

## Files changed

### `app/student/projects/[id]/page.tsx`

- Added a real Apply control. A route-local Server Action calls the existing
  `applyToProject(project.id)` from `app/actions/projects.ts`, then revalidates
  `/student/projects/[id]` and redirects back with a fixed notice token. Submit
  uses the existing `SubmitButton`, so the button shows `Sending...` while the
  action is in flight.
- Added visible outcome states driven by the redirect token: `Application sent.`
  with a link to Applications, `You already applied to this project.`,
  `Applications are closed for this brief.`, session-ended, student-role, and a
  generic failure. Success uses `role="status"`; failures use `role="alert"`.
  Only known tokens render, so a stray query string cannot inject copy.
- Added route-local application gating on top of the shared action:
  student role check, open-status check, deadline check, and the existing
  duplicate/application check in `applyToProject`. A deadline stored as a date
  stays open through the local calendar day, matching the listing card.
- Made disabled states honest: an applied brief shows a disabled `Applied`
  button and explains that the application is on file; a past-deadline open
  brief shows `Closed`, a disabled `Applications closed` button, and the date;
  a non-open applied brief shows its real status. Every terminal state links to
  Applications for the application's own status.
- Completed the brief details: founder display name from `getProfile`, every
  required skill (no five-skill truncation), and an explicit
  `No specific skills listed.` empty state. Description, budget, duration,
  work mode, Apply-by date and Posted date remain real row values. Blank or
  whitespace-only descriptions now show `No description provided.`
- Kept the phase-1 UUID guard, fail-closed auth/missing/non-open guard,
  semantic Tailwind roles, readable status text, decorative `aria-hidden` dot,
  and back-link focus ring.

## Features verified

| Area | Result |
|---|---|
| Apply present and reachable | Fixed. Active form button on an open, unapplied, in-date brief. |
| Apply has real effect | Fixed. Calls the shared `applyToProject`, then revalidates and redirects. |
| Pending / applied / error states | Fixed. Pending label plus six explicit notice tokens. |
| Disabled reasons | Fixed. Applied, closed-by-deadline and moved-on briefs each say why. |
| Deadline copy matches action | Fixed on this route. The badge says `Closed` when the deadline has passed and the form cannot submit. |
| Founder details | Fixed. Real profile name is shown; missing profile falls back to `Founder`. |
| Requirement details | Fixed. All skills render; empty skills have an honest notice. |
| Loading / error / not-found | Verified, not changed. `app/student/loading.tsx`, `app/error.tsx` and `app/not-found.tsx` cover this dynamic route. |
| Voice and palette | Verified. Plain copy, no banned phrases, no new hex literals, focus rings retained. |

`reports/page-fixes/shared-workflow.md:173-176` states that an application
completeness gate was deliberately not added because shipped copy treats a
complete profile and CV as guidance. This pass did not turn that guidance into
a hard rejection.

## Checks performed

- Read the installed Next.js 16 guides before editing:
  `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
  (async `searchParams`), `05-server-and-client-components.md`,
  `07-mutating-data.md` (inline Server Actions, `bind`, redirect after
  mutation), `10-error-handling.md`, and
  `node_modules/next/dist/docs/01-app/02-guides/forms.md` (passing additional
  arguments with `bind`).
- Read the current route, the shared apply action, the listing client and
  server, `lib/neon-data.ts`, the shared boundaries, `app/globals.css`,
  `lib/design-tokens.ts`, `design/brand-system.md`, `design/voice-guide.md`, the
  phase-1 report, the phase-1 audit, and the ownership manifest.
- `npx eslint "app/student/projects/[id]/page.tsx"` — passed, no findings.
- `npx tsc --noEmit --pretty false` — failed on two pre-existing shared errors
  outside ownership; the owned file reported no error:
  - `app/student/projects/page.tsx:111-112` passes `initialQuery` and
    `initialMode` to `ProjectsClient`, whose props at
    `app/student/projects/projects-client.tsx:278-284` do not declare them.
  - TSC reported `app/student/projects/projects-client.tsx:323`; in the current
    file the `ProjectCard` call at `:327-335` omits the required `detailHref`
    declared at `:102-114`.
- Reviewed `git diff -- "app/student/projects/[id]/page.tsx"`; only the owned
  page was changed by this pass. Uncommitted work elsewhere was not reverted.

## Routed findings — workflow owner

- **MED — deadline can be bypassed outside this route.**
  `app/actions/projects.ts:117-121` checks project status but not `deadline`;
  `app/student/projects/projects-client.tsx:64-89,224-255` disables Apply on a
  passed deadline. The detail route now blocks that submit locally, but a
  direct call to the shared action still inserts an application after the date.
  Recommended fix: add the same date-only end-of-day deadline check inside
  `applyToProject` before `insertApplication`, and return the existing
  `Applications are closed` message.
- **LOW — detail cache not revalidated by listing applies.**
  `app/actions/projects.ts:132-135` revalidates the list, applications and admin
  students, but not `/student/projects/[id]`. A student who applies from the
  listing and then opens the brief can see a stale non-applied control. The
  detail route's own form now revalidates its path before redirecting.
  Recommended shared fix: add
  `revalidatePath(\`/student/projects/${projectId}\`)` after a successful
  insert.
- **MED — current shared type errors block a clean typecheck.** See the two TSC
  findings above. Recommended: align `ProjectsClient` props with the server
  page's query/mode props, and pass `detailHref` at the `ProjectCard` call site
  or remove it from the card contract. Both files are outside this ownership.

## Routed findings — database owner

- No new database finding. `getProfile`, `getProject`, `getProfileRole` and
  `listStudentAppliedProjectIds` are read-only typed helpers; application
  uniqueness and project status constraints remain unchanged. The phase-1 D1
  object-visibility finding is already mitigated in this route by the
  open-or-applied guard.

## Deliberate non-changes

- No hard profile/CV completeness gate. Shared workflow copy treats it as
  guidance, and the shared workflow report explicitly declined to add one.
- No edit to `app/actions/projects.ts`, `app/student/projects/projects-client.tsx`,
  `app/student/projects/page.tsx`, `lib/neon-data.ts`, schema, config, shared
  boundaries, or the existing phase-1/phase-2 reports.
- No route-specific `loading.tsx`, `error.tsx` or `not-found.tsx`; new files
  besides this report are outside the permitted edit set and the shared
  boundaries already cover the route.
- No runtime claim. Per the review constraints, no dev server, browser action,
  build or test suite was used to observe the rendered flow.
- No user work was discarded. The current uncommitted state of all other files
  was left untouched.
