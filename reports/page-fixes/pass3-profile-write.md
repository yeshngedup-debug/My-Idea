# Pass 3 fix report: student profile write paths

Scope: consolidated findings F-33 and F-34 from
`reports/page-fixes/pass2-consolidated.md:99-100`. The dirty worktree was treated
as the source of truth. All pre-existing uncommitted work was preserved.

## Changed files

- `app/actions/student-profile.ts`
- `app/actions/student-profile.test.ts`
- `reports/page-fixes/pass3-profile-write.md` (this report)

No profile UI file, auth/payment file, schema, migration, layout, config, or
other shared file was touched. No dependency was installed, no commit was made,
and no dev server or full build/test suite was run.

## F-33 — profile save is now atomic within Neon

The action previously called `upsertStudentProfile` and
`updateProfileFullName` in sequence. A failure in the second call could leave
`student_profiles` updated while `profiles.full_name` stayed stale.

`app/actions/student-profile.ts:65-105` now submits both statements as one
non-interactive `sql.transaction`. Each statement uses `returning id`; if either
affected no row, the action throws inside the `try` and returns the same
sanitized `Could not save profile. Try again.` message. `getSql()` is also inside
the `try`, so a missing `DATABASE_URL` is sanitized rather than escaping the
action.

Residual: this scoped change duplicates two SQL statements in the action because
`lib/neon-data` exposes only the separate helpers and is outside this pass.
A future schema change must update both the action and the data-layer helpers.
No rollback was invented for a failure the backend cannot roll back.

## F-34 — CV upload has deterministic ordering and honest failure copy

`app/actions/student-profile.ts:140-169` now uploads to a per-attempt path
(`${user.id}/cv-<id>.pdf`) with `upsert: false` instead of overwriting the
published `${user.id}/cv.pdf` object. The exact uploaded path is then written to
Neon with `setStudentProfileCv`, followed by a `getStudentProfile` read-back that
verifies the stored `cv_path`.

If Storage fails, Neon is not touched and the message stays
`Could not upload CV. Try again.`. If the Neon write or read-back fails, the
action returns `The CV file was uploaded, but the profile link could not be
saved. Try again.` instead of claiming an unqualified success. Driver text is
logged only on the server.

The comment at `:151-155` was rewritten to state the real contract: Storage and
Neon cannot be changed in one transaction, a failed Neon write leaves only an
unreferenced object, the previously linked CV remains the one founders can open,
and signed URLs are never persisted because `/api/cv/[id]` mints a fresh one.

Residual: cross-service atomicity is impossible with the available APIs. A failed
Neon write leaves an unreferenced Storage object. Cleanup would require a storage
delete policy and a delete call, both outside this pass; no silent deletion was
assumed. The user-visible CV state stays consistent because Neon never points at
an unconfirmed upload.

## Tests

`app/actions/student-profile.test.ts` now mocks `getSql().transaction`, checks
that both profile writes are built in one transaction, covers a partial-result
failure, covers both CV failure branches (Neon write and read-back mismatch),
and confirms a Storage failure never reaches Neon.

Verification commands and results:

- `npx eslint app/actions/student-profile.ts app/actions/student-profile.test.ts`
  — exit 0, no findings.
- `npx vitest run app/actions/student-profile.test.ts` — 1 file passed, 12 tests
  passed (Vite printed only its pre-existing CommonJS config-loader warning).

## Routed findings

- F-33: resolved within Neon; SQL duplication is recorded above as a scoped
  maintenance residual.
- F-34: consistency and copy resolved to the extent the APIs allow; the
  unreferenced-object cleanup remains routed to the Storage policy owner.
- No other consolidated finding was edited or silently absorbed into this pass.
