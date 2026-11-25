# Founder profile page audit

## Route

`/founder/profile`

Audit date: 2026-11-24. Role: read-only page auditor. No product source, config, schema, test or existing report was edited. The uncommitted changes in `app/founder/profile/actions.ts` and `app/founder/profile/profile-client.tsx` were treated as authoritative and are reflected in every line citation below.

## Files traced

Scoped route files:

- `app/founder/profile/page.tsx`
- `app/founder/profile/profile-client.tsx`
- `app/founder/profile/actions.ts`
- `app/founder/profile/profile-details.tsx` (rendered dependency inside the route)

Server and data dependencies reached:

- `lib/supabase/server.ts` - session creation from cookies
- `lib/neon.ts` - Neon SQL client and `DATABASE_URL`
- `lib/neon-data.ts` - `getProfileRole` (`:47`), `getProfile` (`:57`), `updateProfileFullName` (`:116`), `listProjectsByFounder` (`:297`)
- `neon/schema.sql` - Neon table shapes and lack of RLS
- `supabase/schema.sql`, `supabase/mvp-fixes.sql`, `supabase/migrations/20261124000000_close_security_bypasses.sql` - identity and RLS context
- `proxy.ts` - protected-prefix routing and role-home redirect
- `components/layout/pinned-heading-section.tsx`, `components/layout/workspace-page-heading.tsx`
- `components/ui/button.tsx`, `components/ui/input.tsx`, `components/ui/label.tsx`, `components/ui/pressable.module.css`
- `lib/design-tokens.ts`, `design/voice-guide.md`, `design/brand-guidelines.md`

## Skills used

Only the assigned skills that actually shaped a finding or a limitation are cited:

- `unslop` - minimal copy and AI-tell judgment on implementation notes and stat presentation
- `better-interface` - evidence-and-severity framing for all confirmed findings
- `better-layout` - page column and pinned-heading review
- `better-ui` - form control, focus-ring and card treatment review
- `better-writing` - user-facing copy review
- `frontend-a11y` - form labelling, validation feedback and live-region review
- `better-accessibility` - WCAG 2.2 AA check on names, roles and invalid state
- `webapp-testing` - live-availability probe and Playwright attempt; see limitations
- `security-review` - auth guard, server-action authorization and data-layer review

`api-security-testing` was assigned but is not cited: this route has no HTTP API handler. Its concerns are covered through the server action under `security-review`. Precedence followed `reports/SKILL-ASSIGNMENTS.md`: `unslop` for copy/AI tells, `better-*` for evidence, `security-review` for the data-layer pass.

## UI/UX findings

### U1. MED. Confirmed. Internal implementation notes are shown as user-facing copy

`app/founder/profile/profile-details.tsx:56-59` renders "Member since uses your account creation date. This profile has no company or avatar field." `app/founder/profile/profile-details.tsx:81-83` renders "Counts come from your posted briefs only."

Why it matters: these sentences describe what the page cannot do, not what the user can do. They read as design notes left in the product and break the quiet editorial voice required by `design/voice-guide.md`. `unslop` treats that kind of absence-explaining caption as an AI tell.

Fix: delete both notes. If context is needed, replace with a user fact, for example "Counts update when a brief changes status." Do not mention missing fields.

### U2. LOW. Confirmed in source. Server validation feedback is not tied to the input

`app/founder/profile/profile-client.tsx:46-59` renders the input without `invalid` or `describedBy`. `app/founder/profile/profile-client.tsx:73-84` renders the result banner without an `id`. The shared input already supports both props at `components/ui/input.tsx:9-12,30-35`.

Why it matters: native `required`, `minLength` and `maxLength` catch simple cases, but the server also trims (`app/founder/profile/actions.ts:12-16,38-41`). A whitespace-only value passes native validation and fails on the server. The alert is announced through `role="alert"` at `app/founder/profile/profile-client.tsx:75`, so the message is not silent, but the field is not marked invalid and the message is not programmatically associated with it. Runtime screen-reader behavior was not verified; see limitations.

Fix: add `id="founder-name-result"` to the result element, pass `describedBy={result && !result.ok ? 'founder-name-result' : undefined}` and `invalid={Boolean(result && !result.ok)}` to `Input`, and move focus back to the input when the action returns `ok: false`.

### U3. LOW. Confirmed. The form uses a second accent role for focus

`app/founder/profile/profile-client.tsx:58` uses `focus:ring-[#b23c26]/30` and `focus:border-[#b23c26]`. `app/founder/profile/profile-client.tsx:65` uses `focus-visible:ring-[#b23c26]`. `app/founder/profile/profile-client.tsx:79` uses `#b23c26` for error text.

Why it matters: `reports/brand-tokens.md:6-7` established `#b23c26` as small-text accent and reserved `#d84f37` for focus rings. `lib/design-tokens.ts:45,47,71` defines the same split. The shared controls follow it at `components/ui/button.tsx:21` and `components/ui/input.tsx:37`. This form makes the same colour mean both focus and error.

Fix: use `colors.focus` with a translucent alpha for the ring and `colors.smallTextAccent` only for the error text. Remove the per-call focus overrides so the shared control styles win.

### U4. LOW. Suspected. "Member since" may not be the member-since date

`app/founder/profile/page.tsx:42-48` derives `memberSince` from Supabase `user.created_at`. `app/founder/profile/profile-details.tsx:49-53` labels it "Member since".

Why it matters: Supabase auth creation and Neon profile creation are separate records. A user invited later, migrated, or backfilled can have an auth timestamp older than the platform profile. The label overstates what the code proves. No bad data was observed; this is a data-accuracy risk from the source choice.

Fix: expose `profiles.created_at` through a typed helper and use that value. If that field cannot be exposed, relabel the row "Account created" to match the real source.

## Workflow findings

### W1. HIGH. Inherited and confirmed systemically, suspected reachable on this route. Stale Neon role can keep founder access after a Supabase demotion

`app/founder/profile/page.tsx:30-31` and `app/founder/profile/actions.ts:30-31` both gate on `getProfileRole(user.id)`. That helper reads the Neon `profiles.role` at `lib/neon-data.ts:47-51`. The verified identity comes from Supabase at `app/founder/profile/page.tsx:23-28` and `app/founder/profile/actions.ts:24-28`, but the role does not come from the identity provider.

Why it matters: a demotion made only in Supabase leaves the elevated Neon role active until `scripts/neon-mirror-identities.mjs` is run. This page would still render and the server action would still accept a name write. This is not a new discovery: `reports/orchestrator-audit.md:128` records the fail-open path and `reports/FINAL-AUDIT.md:57-60` documents the manual mirror. This finding adds the two route-specific call sites only. Live demotion was not attempted because it would mutate shared state.

Fix: make the identity-provider role authoritative and treat the Neon role as a cache, or make the mirror synchronous on every role change. Until then, document that role changes require `scripts/neon-mirror-identities.mjs` before the user loses access.

### W2. LOW. Suspected. Name save is last-write-wins with no concurrency guard

`app/founder/profile/actions.ts:43-44` calls `updateProfileFullName(user.id, parsed.data)` after validation. `lib/neon-data.ts:116-123` issues an unconditional `update ... where id = ${id}` and sets `updated_at = now()`.

Why it matters: two open tabs can save different names and the later request silently overwrites the earlier one. No stale-state conflict is possible today because `app/founder/profile/profile-client.tsx:24-26` updates local state and refreshes on success, but another tab is outside that component. No two-tab reproduction was run.

Fix: pass the expected current name or `updated_at` from the form and make the write conditional, then return a conflict message when the row changed. Alternatively add an `optimistic lock` column and reject stale writes in the helper.

## Database/RLS findings

### D1. MED. Confirmed. The name-write helper has no ownership or role check of its own

`lib/neon-data.ts:116-123` accepts any `id` and writes `full_name` and `updated_at`. There is no RLS on Neon, as stated in `lib/neon-data.ts:1-7` and `neon/schema.sql:1-4`. The only protection for this write is the caller check in `app/founder/profile/actions.ts:24-31,44`.

Why it matters: the database will not stop a future server-side caller that passes the wrong ID. `reports/FINAL-AUDIT.md:59-60` already warns that every Neon helper must include its own role or ownership check. This route is another instance of that pattern, not a currently exploitable bug. The SQL itself is parameterized, so there is no injection issue.

Fix: make the helper session-bound, for example `updateOwnProfileFullName(sessionUserId, fullName)`, and recheck `role = 'founder'` inside it. As a minimum, make the statement `update public.profiles ... where id = ${id} and role = 'founder'` and throw when no row is returned.

### D2. LOW. Confirmed. Read queries on this route are correctly scoped and parameterized

`lib/neon-data.ts:47-51` reads the role by `id`, `lib/neon-data.ts:57-72` reads the profile by `id`, and `lib/neon-data.ts:297-310` reads projects by `founder_id`. All use tagged template parameters. `app/founder/profile/page.tsx:30-36` passes only the verified `user.id`.

Why it matters: this is a pass, recorded so a future change does not silently introduce a client-supplied ID or string-built SQL. It also narrows D1 to the write helper rather than the whole route.

Fix: no change. Keep the rule that server actions derive the user ID from `getUser()` and never accept it from `FormData`.

## Severity summary

| Severity | Count | IDs |
|---|---:|---|
| HIGH | 1 | W1 (inherited, suspected reachable on this route) |
| MED | 2 | U1, D1 |
| LOW | 4 | U2, U3, U4, W2 |
| Pass recorded | 1 | D2 |

No issue was rated HIGH as a new, proven defect on this route. W1 is HIGH because the systemic fail-open path is already confirmed in earlier reports.

## Recommended fixes

1. Make the role source consistent across Supabase and Neon, or make the mirror automatic. Add the `/founder/profile` page and `updateFounderName` call sites to the regression check. See W1.
2. Re-check founder role and ownership inside `updateProfileFullName`, and make the update conditional on the targeted row. See D1.
3. Remove the two implementation-note captions from the account and projects cards. See U1.
4. Bind the server result banner to the name input with `id`, `describedBy`, `invalid` and focus return. See U2.
5. Restore the established focus-ring role and keep `#b23c26` for error text only. See U3.
6. Either expose `profiles.created_at` for "Member since" or relabel the row "Account created". See U4.
7. Add a concurrency precondition to the name write if multi-tab editing is a supported flow. See W2.

## Notes/limitations

- Read-only audit. Product source was not edited. `git status --short` before finalization showed uncommitted modifications to `app/founder/profile/actions.ts` and `app/founder/profile/profile-client.tsx`; those working-copy versions were used as the source of truth. The old error string that echoed driver details and the old `String(formData.get(...))` coercion are already fixed in the working copy and were not re-reported.
- No child agents were spawned.
- No `npm run build` was run.
- Live browser verification was attempted but not completed. A final probe briefly returned `STATUS=200` for `http://127.0.0.1:3000/founder/profile`; the next shell probe returned `Unable to connect` and `timed out`, and Playwright tab creation failed with `net::ERR_CONNECTION_REFUSED`. No authenticated founder session was driven, no screenshots were captured, and no form submit was exercised in the browser. U2, U3, U4, W1 and W2 are therefore source-based; their headings say confirmed only where the code fact itself is confirmed.
- No database state was read or mutated directly. D1 and D2 are source and schema findings.
- All existing `reports/*.md` and `reports/page-audits/*.md` files were read before finalizing. Overlaps are referenced instead of duplicated: W1 with `reports/orchestrator-audit.md:128` and `reports/FINAL-AUDIT.md:57-60`; D1 with `reports/FINAL-AUDIT.md:59-60`; U3 with `reports/brand-tokens.md:6-7`; layout intent with `reports/dashboard-design-direction.md:77-80`; the audit index entry with `reports/page-audits/INDEX.md:24`.
- Verified passes not listed as findings: `supabase.auth.getUser()` validates the JWT (`app/founder/profile/page.tsx:23-28`, `app/founder/profile/actions.ts:24-28`); the write action rechecks role; no profile ID is accepted from the browser; Zod trims and bounds the name; database errors are logged server-side and returned as a generic message; project counts derive only from the verified user's `founder_id`; the input has a matching `htmlFor`/`id` pair, `required`, `minLength`, `maxLength` and `autoComplete`; `Button` and `Input` meet the 44px target floor; result states use `role="status"` and `role="alert"`; decorative icons are `aria-hidden`.
