# Final audit

Independent subagent audit could not be spawned (`Subagent depth limit reached
(1)`). This audit was performed directly with the assigned
`verification-loop`, `e2e-testing`, `production-audit` and `security-review`
skills. No files were changed by the audit.

## Release surface

Next.js 16 App Router, Supabase Auth + Storage, Neon Postgres. Local Supabase
stack on 127.0.0.1:54321/54322. Neon production branch via supplied
`DATABASE_URL` in gitignored `.env.local`.

## Evidence

| Check | Command / method | Result |
| --- | --- | --- |
| Type check | `npx tsc --noEmit` | PASS, no output |
| Lint | `npm run lint` | PASS, 0 errors, 2 pre-existing warnings in generated `coverage/` files |
| Unit tests | `npm test` | 6 files, 45/45 passed |
| Build | `npm run build` | compiled, 37 routes |
| E2E | `$env:E2E_REQUIRE_DB='1'; npm run test:e2e` | 4/4 passed |
| Neon write proof | `node scripts/neon-verify.mjs` after E2E | projects 3→4, applications 2→3, shortlists 2→3, orders 2→3; new application row timestamped during E2E |
| Health | `GET /api/health` | `{"status":"ok","db":"up","provider":"neon"}` |
| Neon stats | `GET /api/neon` | `ok:true` with live counts and projects |
| Browser | Playwright on public and all three dashboards | all routes 200, zero console errors on final render |
| Sticky headings | Playwright at 1440 | heading holds `top: 96px` while content moves `100px → 0 → -100px`; `main` uses `overflow-x: clip`; overflow 0 at 320/375/1440; one `h1` per page |
| Sticky exclusions | Playwright heading inventory | heroes, CTA bands, short intros, forms and FAQ clusters have no sticky ancestor |
| Secrets | `git grep` for connection strings / API keys; `git ls-files` for `.env*` / `.neon` | none tracked; only a documented placeholder in README |

## Authorization after RLS removal

- Server actions recheck role from Neon `profiles` before every privileged write.
- `proxy.ts` checks Supabase JWT with `getUser()` and the Neon role before
  allowing `/student`, `/founder` or `/admin`.
- `/api/cv/[id]` repeats the founder relationship and confirmed-order rules
  that the old storage RLS encoded.
- Founder project ownership is rechecked in the project status and applicant
  status actions and in the founder project detail page.
- Student-facing reads filter by the authenticated user ID.
- Admin-only writes are guarded by `requireAdmin()`.

No new authorization gap was found. Role changes made only in Supabase need a
re-run of `scripts/neon-mirror-identities.mjs`, which is documented in README.

## Component gate

Three accepted integrations map to real actions, have Playwright proof, and use
no new runtime, glow, blur, marquee, parallax, `scale(0)` or `transition: all`.
See `reports/orchestrator.md` for source URLs, licences and rejections.

## Risks

1. **AI Gateway cannot be used.** The CLI login blocker is cleared and
   `neon deploy` succeeds, but invocation returns 403 `paid_plan_required`.
   No AI feature was added. This is a billing blocker, not a code failure.
2. **Two providers.** Supabase Auth/Storage and Neon Postgres must stay in sync.
   Signup mirrors the profile; out-of-band role changes need the mirror script.
3. **No RLS on Neon.** Authorization lives in application code. Every new data
   helper must include its own role or ownership check.
4. **Local E2E seed.** The mirror script resets payment state before E2E. This
   is documented and reproducible, but production data must never be seeded.
5. **Lint warnings** in generated `coverage/` files are pre-existing and
   harmless.

## Service wiring after CLI sign-in (2026-11-24, second pass)

| Check | Command / method | Result |
| --- | --- | --- |
| Deploy | `neon deploy` | `No changes` first, then `+ function platform`; 11 Neon variables pulled into `.env` with **no key added, removed or changed** in `.env` or `.env.local` |
| Services | `neon status`, `neon config plan` | Postgres, Neon Auth, AI Gateway, Realtime and Functions listed as utilized |
| Function | `GET https://br-young-lake-bd6zvogz-platform.compute.c-8.us-east-2.aws.neon.tech/` | `{"ok":true,"source":"neon-function",...}` with live Neon counts and open projects |
| Function in app | `GET /api/neon` | `{"ok":true,...,"source":"neon-function"}` |
| Realtime | two-context Playwright | Founder status changed from `Payment being checked` to `Payment confirmed. Shortlist unlocked` after admin confirmation, over a WebSocket to `ep-aged-boat-bda7dqda.rt.c-8.us-east-2.aws.neon.tech`; 0 console errors |
| AI Gateway | `GET /v1/models` → 200 with models; `POST /v1/chat/completions` → 403 `paid_plan_required` | No feature added; recorded as a plan/credits blocker |
| Neon Auth | branch enabled, not adopted | Supabase Auth kept: replacing sessions and users is not required and would break existing accounts |

Realtime authorization: the sealed query filters `public.shortlist_orders` by
the verified Supabase user ID; the renewal route requires a founder role and
takes no user ID from the browser. Neon tables have no RLS.

## Recommendation

**APPROVE** for the implemented scope: the app runs on Neon Postgres with
Supabase Auth/Storage, a deployed Neon Function, and a live Realtime query, and
passes every local gate. **NEEDS WORK** before a full Neon-native launch: buy
AI Gateway credits if AI features are wanted, decide whether to migrate identity
to Managed Better Auth, and define a production identity-sync process.
