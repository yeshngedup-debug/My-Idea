# Founder profile page fixes

Route: `/founder/profile`. Slug: `founder-profile`. Owner: per-page fix agent.
Source of truth: current working tree. No git discard commands were run.

## Files changed

- `app/founder/profile/profile-client.tsx`
  - Bound server validation feedback to the name input: the result element now
    has `id="founder-name-result"`, and the input gets `invalid` plus
    `describedBy` when the action returns a failure (audit U2).
  - On a failed save, focus returns to the name input so the user lands on the
    field they need to correct (audit U2).
  - Removed local `#b23c26` focus overrides from `Input` and `Button`. The shared
    controls' `#d84f37` focus ring now wins; `#b23c26` remains only on the error
    message (audit U3).
  - Kept the input ref through the existing `Input` forwardRef.
- `app/founder/profile/profile-details.tsx`
  - Deleted both implementation-note captions ("Member since uses your account
    creation date..." and "Counts come from your posted briefs only.") instead
    of replacing them with claims the data does not prove (audit U1).
  - Renamed the `memberSince` prop to `accountCreated` and relabelled the row
    "Account created" so the label matches its Supabase auth source (audit U4).
- `app/founder/profile/page.tsx`
  - Passes `accountCreated` and a comment that states why the row is labelled
    from the verified auth timestamp; no DB files were touched (audit U4).

`app/founder/profile/actions.ts` and `app/founder/profile/loading.tsx` were read
but not modified. The working tree already contained user changes in
`actions.ts` and `profile-client.tsx` (generic DB error, typed `FormData` read,
router refresh, `setResult(null)` on edit, and removal of the redundant
`aria-live` on the result element); all were preserved. No shared files were
edited.

## Checks performed

- Read `reports/page-fixes/MANIFEST.md` in full, `reports/page-audits/founder-profile.md`,
  the `founder-profile` rows and role-mirror notes in
  `reports/page-audits/CONSOLIDATED.md` (lines 75-100, 187-216, 251-262),
  root and Next package `AGENTS.md`, and Next 16.4.5 docs
  `01-getting-started/03-layouts-and-pages.md` (via the installed doc set),
  `05-server-and-client-components.md`, `07-mutating-data.md`, and
  `10-error-handling.md`.
- Read `design/brand-system.md`, `design/brand-guidelines.md`,
  `design/voice-guide.md`, `lib/design-tokens.ts`, and `app/globals.css` before
  choosing colours and copy.
- Verified the shared `Input` supports `ref`, `invalid` and `describedBy`
  (`components/ui/input.tsx:8-42`), and that `Button` and `Input` already provide
  the `#d84f37` focus ring (`components/ui/button.tsx:21`,
  `components/ui/input.tsx:37`).
- Source-verified the workflow: `getUser()` validates identity
  (`page.tsx:23-28`, `actions.ts:24-28`), the role gate runs before render and
  before the write (`page.tsx:30-31`, `actions.ts:30-31`), no profile ID comes
  from `FormData`, Zod trims and bounds the name (`actions.ts:12-16,38-41`), DB
  errors are logged and returned generically (`actions.ts:43-49`), success
  revalidates `/founder/profile` and `/founder` and refreshes the router
  (`actions.ts:51-53`, `profile-client.tsx:24-27`), and pending/failure states
  are shown on the button and in a `status`/`alert` element.
- Status contract pass: page statuses `open`, `in_progress`, `review`,
  `completed` (`page.tsx:15-20`) match the Neon check constraint
  (`neon/schema.sql:25`). Project counts use only the verified user's
  `founder_id` (`page.tsx:33-40`, `lib/neon-data.ts:297-310`).
- `npx eslint app/founder/profile/page.tsx app/founder/profile/profile-client.tsx app/founder/profile/profile-details.tsx app/founder/profile/actions.ts app/founder/profile/loading.tsx` — clean, no findings.
- No build, test suite, or dev server was started (per manifest). No browser
  session was available, so screen-reader announcement and focus behaviour are
  source-verified, not runtime-driven; this matches the audit limitation.

## Workflow findings routed to the workflow owner

- **W1, inherited HIGH, still open.** `app/founder/profile/page.tsx:30-31` and
  `app/founder/profile/actions.ts:30-31` gate on `getProfileRole(user.id)` from
  Neon (`lib/neon-data.ts:47-51`) while identity comes from Supabase. A
  Supabase-only demotion leaves this page and the name write live until the
  manual mirror runs. Shared root causes: `proxy.ts:17,28-34,117-120` and
  `scripts/neon-mirror-identities.mjs:49-57`. This is the same systemic path as
  `/admin/payments` S1 (CONSOLIDATED.md:85-100, 189-191).
  Recommended fix: make the identity-provider role authoritative or mirror
  synchronously on every role change, and add a regression check for both
  `/founder/profile` and `/admin/payments`. Not edited here: it requires shared
  auth/proxy changes outside this route's ownership.
- **W2, LOW, suspected.** `app/founder/profile/actions.ts:43-44` writes via
  `lib/neon-data.ts:116-123`, an unconditional last-write-wins update. Two tabs
  can overwrite each other silently.
  Recommended fix: pass the expected current name or `updated_at` from the form
  and make the write conditional, or add an optimistic-lock column in the shared
  helper and return a conflict message on a stale write. Not edited here: the
  atomic precondition belongs in the shared data helper and schema.

## Database findings routed to the database owner

- **D1, MED.** `lib/neon-data.ts:116-123` (`updateProfileFullName`) accepts any
  `id` and has no ownership or role predicate; `neon/schema.sql:1-4` states there
  is no Neon RLS. The action's caller check is the only guard
  (`app/founder/profile/actions.ts:24-31`). SQL is parameterized, so no
  injection issue.
  Recommended fix: make the helper session-bound (for example
  `updateOwnProfileFullName(sessionUserId, fullName)`), recheck
  `role = 'founder'` inside it, and throw when no row is updated; at minimum add
  `and role = 'founder'` to the `where` clause.
- **U4 data source.** `profiles.created_at` exists (`neon/schema.sql:14`), but
  `getProfile` (`lib/neon-data.ts:57-72`) selects only `id`, `role`, `full_name`.
  Until a typed helper exposes it, the UI is labelled "Account created" from
  Supabase `user.created_at` rather than claiming a profile creation date.
  Recommended fix if the true profile timestamp is wanted: add `created_at` to a
  typed `getProfile` result and switch the page and label together.
- **Scale note, not a defect today.** `listProjectsByFounder`
  (`lib/neon-data.ts:297-310`) does `select *` and counts statuses in JavaScript;
  the supporting `projects_founder_idx (founder_id, created_at desc)` exists
  (`neon/schema.sql:87`).
  Recommended fix if brief volume grows: project `status` only or aggregate the
  counts in SQL.
- **D2, pass recorded.** Role, profile, and founder-project reads are
  parameterized and scoped to the verified `user.id` or that user's
  `founder_id` (`lib/neon-data.ts:47-51,57-72,297-310`,
  `page.tsx:30-36`). Keep the rule that server actions never accept a profile ID
  from the browser.

## Deliberately not changed

- `app/founder/profile/actions.ts`: the working copy already has the JWT check,
  role recheck, typed `FormData` read, Zod trim/bounds, generic DB error, and
  revalidation. No further change needed for this route's audit.
- `app/founder/profile/loading.tsx`: generic workspace skeleton is unchanged;
  no route-level `error.tsx` was added because it is outside the ownership list
  and a parent boundary exists at `app/error.tsx:1`.
- No new captions were added after deleting the implementation notes: a
  "Counts update when a brief changes status" line would be a claim about
  behaviour this route does not verify.
- Shared focus-ring and ring-offset colours in `components/ui/button.tsx:21` and
  `components/ui/input.tsx:37` were left alone (design-system owner). The local
  overrides were removed so those shared styles take effect.
- No DB, shared `lib`, `proxy`, or API files were edited; those findings are
  routed above.
