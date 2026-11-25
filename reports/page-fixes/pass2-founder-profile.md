# Founder profile — second-pass feature completeness

Route: `/founder/profile`. Slug: `founder-profile`. Owner: per-page fix agent.
Source of truth: the current dirty working tree. No destructive git command,
build, test suite, dev server, or browser session was used.

## Fixes made

- `app/founder/profile/page.tsx:42-47`
  - The account date now comes from `profile.created_at`, which
    `getProfile()` selects and normalizes to ISO
    (`lib/neon-data.ts:65-86`). The first pass's Supabase
    `user.created_at` workaround and its stale comment are gone.
- `app/founder/profile/actions.ts:18-23,32-39,41-53`
  - Added `fieldError` to the result contract so a name-validation message is
    distinguished from an auth, role, or save failure.
  - A failed Neon role lookup is now logged and returned as a generic failure
    instead of rejecting the server action promise.
  - Validation failures are explicitly marked as field errors.
- `app/founder/profile/profile-client.tsx:11-22,32-61,72-98`
  - Added client-side name validation that mirrors the server schema
    (trim, 2–100 characters), and set `noValidate` so the app's own result
    banner handles bad input instead of a native-only tooltip being the only
    visible rejection.
  - The submitted value is trimmed before the action runs.
  - The action call is wrapped in `try/catch`; unexpected rejections now show
    the same friendly save-failure message and return focus to the input.
  - On success the editable draft is normalized to the saved, trimmed name,
    so the field and the account card cannot disagree.
  - The input is disabled while saving, and `aria-invalid` /
    `aria-describedby` are set only for field-validation failures, not for
    unrelated save failures.

No other owned file was changed in this pass.

## Features verified from source

- **Identity and ownership gate**
  - `page.tsx:23-31` validates the Supabase session with `getUser()`, redirects
    unauthenticated users to `/login`, and redirects non-founders home.
  - `actions.ts:25-39` repeats the session check and founder-role check before
    any write. No profile ID is read from `FormData`; the user ID comes only
    from the validated session.
  - A role-lookup failure now fails closed with a friendly message
    (`actions.ts:32-39`).
- **Validation**
  - `profile-client.tsx:17-22` rejects empty, whitespace-only, under-2-character,
    and over-100-character names before a request is sent.
  - `actions.ts:12-16,41-53` keeps the authoritative Zod trim/bounds check for
    direct server-action calls and browser-bypassed submits.
  - The native `required`, `minLength`, and `maxLength` attributes remain for
    semantics and assistive technology, but `noValidate` means the app-level
    banner is the visible rejection path.
- **Save and feedback states**
  - `profile-client.tsx:43-61` shows a pending label, disables the submit button
    and input while saving, focuses the field on failure, and refreshes router
    data on success.
  - `actions.ts:55-65` logs database detail server-side, returns a generic
    failure, then revalidates `/founder/profile` and `/founder`.
  - `profile-client.tsx:112-124` renders one result element with
    `role="status"` for success and `role="alert"` for failure; field errors are
    associated with the input through `id`/`describedBy` and `aria-invalid`.
- **Account-created display**
  - `page.tsx:42-47` uses the profile record's own creation date.
  - `profile-details.tsx:46-54` labels that value "Account created" with
    decorative icons hidden from assistive technology.
- **Project summary**
  - `page.tsx:15-20,36-40` uses the live status contract and derives counts only
    from the verified user's projects.
- **Loading and error boundaries**
  - `loading.tsx:1-5` delegates to the shared workspace skeleton. No route-level
    `error.tsx` was added because it is outside this route's ownership and
    `app/error.tsx` provides a parent boundary.
- **Design/voice**
  - The form keeps the warm-paper / forest / vermilion palette, uses the shared
    `Input`, `Label`, and `Button`, and adds no new dependency, route, gradient,
    emoji, or wholesale rewrite.

## Checks performed

- Read all five owned files, the first-pass report, the page audit, the
  manifest, shared workflow/database/design reports, `lib/neon-data.ts`,
  `lib/design-tokens.ts`, `app/globals.css`, `app/error.tsx`, and the student
  profile form as the interaction comparison.
- Read the installed Next.js guides for mutating data, form validation, and
  error handling before editing server-action and form behavior.
- `npx eslint app/founder/profile/page.tsx app/founder/profile/profile-client.tsx app/founder/profile/profile-details.tsx app/founder/profile/actions.ts app/founder/profile/loading.tsx` — clean.
- `npx tsc --noEmit --pretty false` — clean.
- No `next build`, `npm test`, dev server, live database mutation, or browser
  drive was run. Screen-reader announcement and focus behavior are
  source-verified, not runtime-proven.

## Routed findings — workflow owner

- **W1, HIGH, still open.** `page.tsx:30-31` and `actions.ts:32-39` gate on the
  Neon role from `lib/neon-data.ts:55-62`, while identity comes from Supabase.
  An out-of-band Supabase demotion can leave stale founder access until the
  role mirror runs. `app/actions/auth.ts:108-126` syncs on login and `proxy.ts`
  fails closed on lookup errors, but neither makes the provider authoritative
  for every request. Recommended: make the identity-provider role
  authoritative or mirror role changes synchronously, with regression coverage
  for `/founder/profile` and `actions.ts`. Not edited here: the fix belongs in
  shared auth/proxy files.
- **W2, LOW, still open.** `actions.ts:55-56` calls an unconditional last-write-wins
  update at `lib/neon-data.ts:130-137`; two tabs can silently overwrite each
  other. Recommended: pass an expected current name or `updated_at` and make
  the write conditional, returning a conflict message on a stale write. Not
  edited here: the atomic precondition belongs in the shared data helper.

## Routed findings — database owner

- **D1, MED, still open.** `lib/neon-data.ts:130-137` accepts any profile ID and
  has no role or ownership predicate; Neon has no RLS
  (`lib/neon-data.ts:1-7`). The action's session/role check is the only guard.
  SQL is parameterized, so there is no injection issue. Recommended: replace
  with a session-bound `updateOwnProfileFullName(sessionUserId, fullName)` that
  rechecks `role = 'founder'` and throws when no row is updated; at minimum add
  `and role = 'founder'` to the `where` clause. Not edited here: shared data
  layer is outside this route's ownership.
- **Scale note, not a defect today.** `listProjectsByFounder()` reads the
  verified user's rows and counts statuses in JavaScript. Recommended only if
  brief volume grows: project `status` in SQL or aggregate counts in the
  database.

## Deliberately not changed

- `profile-details.tsx`: the first pass already removed implementation-note
  captions and made the label honest. No new claim was added.
- `loading.tsx`: the shared skeleton is sufficient; no route-specific loading
  copy was needed.
- No route-level `error.tsx` was added; the parent boundary is shared-owned.
- No shared `lib`, proxy, schema, auth, component, or global CSS file was edited.
- No new validation dependency was introduced; the two client constants mirror
  the existing server schema and are documented as such.
- The first-pass report was left intact; this second-pass record is additive.
