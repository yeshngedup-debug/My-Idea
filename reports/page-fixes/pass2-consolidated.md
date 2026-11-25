# Pass 2 consolidated findings register

Date: 2026-11-25. This register consolidates all 30 `reports/page-fixes/pass2-*.md`
page reports (excluding this file), `reports/page-fixes/MANIFEST.md`,
`reports/international-standards.md`, and the three shared phase-2 reports:
`shared-workflow.md`, `shared-database.md`, and `shared-design-system.md`.
Later pass-3 reports and `reports/page-audits/CONSOLIDATED.md` were read only to
update current status; they were not treated as new runtime proof.

The dirty working tree was treated as the source of truth. The original
consolidation edited only this report. This final reconciliation also edited
only report files: it did not rerun the test suite or build, but records the
already-completed final gates listed in section 9. No product source, config,
schema, test, or other report was changed by this reconciliation. No
`git checkout`, `reset`, `stash`, or `clean`, dev server, browser run, install,
live database mutation, or Storage mutation was performed. Runtime-only claims
remain unverified.

## 1. Scope, status key, and summary counts

Status meanings:

- **LIVE-OPEN** — source-verified current defect; fixable in the current diff
  without a new product/infrastructure decision.
- **LIVE-DEFERRED** — source-verified current limitation that needs product,
  policy, config, deployment, or scope consent.
- **PARTIAL-LATER-PASS** — a later pass added a source fix, but the original
  finding is only partly closed and has no runtime proof.
- **RUNTIME-UNVERIFIED** — plausible from source; not proven or disproven
  because no browser/runtime drive was run.
- **RESOLVED-SOURCE** — current source contains the fix; not re-raised live.
- **RESOLVED-RUNTIME** — previously suspected defect was resolved by a clean
  runtime recheck; no source change was needed.

| Metric | Count |
| --- | ---: |
| Pass-2 page reports consolidated | 30 |
| Shared phase-2 reports consolidated | 3 |
| International audit items carried forward | 10 open + 6 runtime checks + 7 already fixed |
| Register rows in section 2 | 63 |
| Page pass outcomes | 27 fixed, 2 verified-no-change, 1 blocked |
| LIVE-OPEN rows | 24 |
| LIVE-DEFERRED rows | 22 |
| PARTIAL-LATER-PASS rows | 1 |
| RUNTIME-UNVERIFIED rows | 6 |
| RESOLVED rows | 10 |
| Must-fix blockers | 8 |
| Nice-to-have / scope-gated rows | 28 |
| Register severity total | 6 high, 36 medium, 21 low |

The single blocked page is `login`: its owned copy/focus fixes landed, but the
routed HIGH self-service password recovery gap remains unimplemented.

## 2. Consolidated findings register

Duplicates are merged by owner and scope: unbounded Neon reads (F-01), stale
unlock copy (F-03), partial live-data outages (F-07), disclosure IDREFs (F-08),
CV/completeness copy (F-09), rate limits (F-11/F-12), deadline semantics (F-13),
upload body limit (F-14), image provenance (F-15), admin-payment scan work
(F-26/F-27), and sticky conflicts (V-01/F-31 and pass-3 entries in section 7).

| ID | Severity | Route/scope | Finding | Evidence file:line | Current status | Owner | Recommended action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F-01 | Medium | Shared database / many lists | Read helpers still allow unbounded result sets; a silent cap would hide real rows. | `lib/neon-data.ts:359-375,467-486,502-524,526-534,698-719,725-738,819-831,892-905,979-985,1115-1127,1129-1142` | LIVE-DEFERRED | Database owner with page/workflow owners | Add explicit cursor/limit contracts per surface; do not cap silently. |
| F-02 | Medium | Shared database / detail reads | Low-level detail reads still accept raw IDs; current action/API checks prevent an active bypass. | `lib/neon-data.ts:616-679`; `neon/schema.sql:1-4` | LIVE-DEFERRED | Database + Workflow owners | Decide RLS/ownership posture and harden helper boundaries together. |
| F-03 (A1) | High | Founder shortlists / workflow | Confirmation used to claim immediate unlock while rows appear only after admin finalization; the live pill can still choose the wrong order under F-31. | `lib/order-status.ts:5-14`; `app/actions/shortlist-order.ts:235-238`; `components/founder/live-order-status.tsx:19`; `app/for-founders/page.tsx:174`; `reports/page-fixes/pass3-payment-workflow.md:34-59` | RESOLVED-SOURCE | Workflow + Founder UX + Design System | Preserve the single copy contract. Track the remaining order-selection defect as F-31. |
| F-04 (A2) | High | Paid packages / product promises | Known packages now enforce min/max counts and only advertise supported promises; legacy/no-order paths and one public FAQ heading remain routed. | `config/payment.ts:16-17,30-38`; `app/actions/admin-students.ts:50-65,137-167`; `config/payment.test.ts:10-15`; `app/for-founders/page.tsx:199`; `reports/page-fixes/pass3-payment-workflow.md:61-95` | PARTIAL-LATER-PASS | Product + Backend + Legal | Decide what legacy/admin-only shortlists promise; update the remaining FAQ heading. |
| F-05 (A3) | High | Rejected payment / order workflow | Rejection copy now offers a self-service new-order path; no reopen action was added. | `lib/order-status.ts:11-14`; `app/actions/shortlist-order.ts:137-138,259`; `app/founder/shortlists/shortlists-client.tsx:456`; `reports/page-fixes/pass3-payment-workflow.md:97-113` | RESOLVED-SOURCE | Backend + Product | Preserve the create-new-order recovery path; treat reopen as F-30 lifecycle scope. |
| F-06 (A4) | Medium | Public package marketing | Public pricing now shows the paused-orders notice and hides the “2 working days” SLA while payments are paused. | `app/for-founders/page.tsx:212-215,420-427`; `config/payment.ts:20`; `reports/page-fixes/pass3-payment-workflow.md:90-93` | RESOLVED-SOURCE | Marketing + Product + Operations | Preserve the conditional copy; treat a live SLA as operational data before re-enabling it. |
| F-07 | Medium | Live context / shared UI | A quiet partial-data note now renders in full and compact panels while keeping available figures visible. | `components/data/live-context.tsx:241-280,403-405,473-475`; `components/data/live-context.test.tsx`; `reports/page-fixes/pass3-international-f07.md:15-48` | RESOLVED-SOURCE | Design System owner with Workflow owner for data contract | Preserve; verify the live region in the runtime pass under V-05. |
| F-08 | Low | Disclosures / shared + page owners | Closed disclosure rows previously emitted `aria-controls` to unmounted panels; current page/shared work makes IDs valid or omits them. | `app/founder/browse-projects/browse-projects-client.tsx:277-293`; `components/interactive/animated-disclosure-list.tsx:24-31,86-88,99-103,127-129`; `reports/page-fixes/pass2-home.md:132-142` | RESOLVED-SOURCE | Design System + affected page owners | Preserve; verify final DOM under B6 before adding new disclosure variants. |
| F-09 | Medium | Marketing guide copy | Unsupported CV access and complete-profile promises were replaced with accurate conditional/guidance copy. | `app/for-founders/page.tsx:76,107,324-326`; `app/for-students/page.tsx:30,169,184,270-271` | RESOLVED-SOURCE | Content + page owners | Preserve; do not reintroduce unconditional CV or completeness claims. |
| F-10 | Medium | Apply flow / validators | `applyToProject` inserts before any profile/CV read; no real completeness gate exists. | `app/actions/projects.ts:123-124`; `app/for-students/page.tsx:122-128` | LIVE-DEFERRED | Workflow + Database + Product | Decide whether a gate is desired, then align copy, validators, and DB invariants. |
| F-11 | Medium | Rate limiting / workflow | Rate limiting remains process-local; key/validation hardening landed. | `lib/rate-limit.ts:18,40-65`; `app/actions/auth.ts:140-144`; `reports/page-fixes/shared-workflow.md` | LIVE-DEFERRED | Platform + Workflow | Choose a shared store and deployment contract; keep public endpoint access open. |
| F-12 (A9) | Low | Login copy / i18n | Exact rate-limit copy is now “Try again in a moment.” | `app/(auth)/login/page.tsx:19`; `reports/page-fixes/pass3-auth-recovery.md:27-31` | RESOLVED-SOURCE | Content + i18n | Preserve; no one-minute promise remains. |
| F-13 | Medium | Deadline semantics / workflow | Date-only deadlines now stay open through the local calendar day and use one parser with the student card; zero-row status writes fail closed. | `app/actions/projects.ts:27-59`; `lib/neon-data.ts:271-286`; `reports/page-fixes/pass3-deadline-status.md:7-16` | RESOLVED-SOURCE | Workflow owner | Preserve; verify the boundary date in a real browser/timezone under V-05. |
| F-14 | Medium | Uploads / config | Server-action body limit is raised to 6 MB for 5 MB uploads plus multipart overhead. No real upload was run. | `next.config.ts:9-10`; `app/actions/student-profile.ts:103-104`; `app/actions/shortlist-order.ts:123-124`; `reports/page-fixes/pass3-shared-config.md:19-38` | RESOLVED-SOURCE | Config + Workflow owner | Preserve; recheck a real 5 MB upload before release. |
| F-15 | Medium | Image provenance / content | `/images/thimphu-market.webp` and suspected `punakha-dzong.webp` lack verified author/licence provenance. | `app/about/page.tsx:208-221`; `app/public/page.tsx:244-257`; `reports/page-fixes/shared-design-system.md:51` | LIVE-DEFERRED | Content/Legal owner | Record verified provenance or replace/remove the images; do not guess attribution. |
| F-16 (A5) | Medium | Workspace clock / contrast | Visible “Local time” label now uses `#657069`; measured contrast on `#f5f2ea` is 4.61:1. | `components/layout/workspace-clock.tsx:38`; `reports/page-fixes/pass3-shared-config.md:9-17` | RESOLVED-SOURCE | Design System + Frontend | Preserve; sample rendered contrast under V-02. |
| F-17 (A6) | Medium | Formatting / i18n | In-scope payment/admin callsites use shared `en-GB`/UTC/`Nu` formatters; many charts, project budgets, and dates remain routed residuals. | `lib/format.ts:9-55`; `app/admin/payments/payments-client.tsx:15,212,215`; `app/founder/shortlists/shortlists-client.tsx:11,257,322,346,417,427`; `reports/page-fixes/pass3-payment-workflow.md:139-230` | PARTIAL-LATER-PASS | Frontend + Data/i18n + Product | Adopt the shared formatters in the residual files; keep `en-GB` grouping and explicit UTC labels. |
| F-18 (A7) | Medium | Recovery / deletion / support | Self-service password recovery landed; privacy copy publishes operational targets, but no deletion-request workflow or actual SLA enforcement exists. | `config/app.ts`; `app/actions/auth.ts`; `app/auth/callback/route.ts`; `app/(auth)/forgot-password/page.tsx`; `app/(auth)/reset-password/page.tsx`; `app/privacy/page.tsx:172-183`; `reports/page-fixes/pass3-auth-recovery.md:9-61` | PARTIAL-LATER-PASS | Auth + Legal/Support | Keep the reset flow; implement or reconsider the deletion-request workflow and SLA enforcement. |
| F-19 (A8) | Medium | Global offline state | Original audit found no offline/reconnect notice. Pass 3 added `OfflineStatus`, but no queue, mutation guard, input preservation, or runtime proof. | `components/network/offline-status.tsx`; `components/network/offline-status.test.tsx`; `reports/page-fixes/pass3-offline-status.md:19-64` | PARTIAL-LATER-PASS | Platform + Frontend + page owners | Keep the notice; decide whether guarded/queued mutations and input preservation are needed. |
| F-20 (A10) | Low | Metadata / i18n | Metadata is English-only with no alternates. Pass 3 documented the contract but added no fake localized routes. | `app/layout.tsx:24-28,65-67`; `reports/page-fixes/pass3-offline-status.md:35-42` | LIVE-DEFERRED | SEO + i18n | Add `alternates.languages`, locale switcher, and translated routes only when i18n ships. |
| F-21 | High | Payment proof / workflow | Confirmation now checks Storage object existence before writing `confirmed`; a deleted object fails closed with friendly copy. | `app/actions/shortlist-order.ts:194-214,216-231`; `app/actions/shortlist-order.test.ts:173-197`; `reports/page-fixes/pass3-payment-workflow.md:115-137` | RESOLVED-SOURCE | Workflow owner | Preserve; verify against live Supabase Storage. F-23 keeps the schema-level gap visible. |
| F-22 (C2) | Medium | Payment proof URL availability | Signed-URL availability is checked before confirmation; this does not close the schema-level proof invariant. | `app/actions/shortlist-order.ts:216-225`; `reports/international-standards.md:242-244` | RESOLVED-SOURCE | Workflow owner | Preserve; track the schema gap under F-23. |
| F-23 | Medium | Order schema / proof invariant | `status = 'confirmed'` can be stored with null `screenshot_path`; only the reviewed writer enforces proof. | `neon/schema.sql:88-98`; `app/actions/shortlist-order.ts:177-231` | LIVE-DEFERRED | Database + Workflow | Decide constraint/backfill policy for existing confirmed-without-proof rows. |
| F-24 | Medium | Admin payment audit | Review writes status and `confirmed_at` only; no reviewer identity, decision time, or rejection reason. | `app/actions/shortlist-order.ts:227-231,241-259`; `lib/neon-data.ts:1084-1113`; `neon/schema.sql:88-98` | LIVE-OPEN | Workflow + Database | Add audit columns and write them from the admin action. |
| F-25 | Medium | Admin role source | Neon role is read from mirrored identities while Supabase is identity source; demotions can leave stale Neon authority. | `app/admin/payments/page.tsx:32`; `app/actions/shortlist-order.ts:171`; `scripts/neon-mirror-identities.mjs:49-57` | LIVE-DEFERRED | Workflow + Identity/Platform | Choose one authoritative role source and align mirror/revocation behavior. |
| F-26 | Low | Admin payments / project scan | Distinct project IDs still trigger `listAllProjects()`, which scans and sorts the whole table. | `app/admin/payments/page.tsx:50-57`; `lib/neon-data.ts:359-374` | LIVE-OPEN | Database + Frontend | Fetch only the needed project rows with a scoped helper. |
| F-27 | Low | Admin payment queue | Global queue reads and sorts every order; only a per-founder index exists. | `lib/neon-data.ts:1115-1127`; `neon/schema.sql:107-108` | LIVE-OPEN | Database owner | Add a queue-appropriate index and paginate intentionally. |
| F-28 | Medium | Shortlist finalization model | Schema has no `finalized_at`, `released_at`, or stored per-shortlist rank. | `neon/schema.sql:78-86`; `app/actions/shortlist-order.ts:227-231` | LIVE-DEFERRED | Database + Product | Model finalization/release and rank in schema before enforcing workflow claims. |
| F-29 | Low | Order detail reads | `getOrder()` and `setOrderScreenshot()` accept raw IDs; ownership is checked only in the action. | `lib/neon-data.ts:1050-1082`; `app/actions/shortlist-order.ts:127-131` | LIVE-OPEN | Workflow + Database | Move ownership checks into helpers or require scoped IDs. |
| F-30 | Medium | Order lifecycle | No owner-checked cancel/expire transition; abandoned pending/submitted orders stay open and counted. | `app/actions/shortlist-order.ts:177-259` | LIVE-DEFERRED | Workflow + Product | Define and implement lifecycle transitions with explicit ownership. |
| F-31 | Medium | Live order pill | Shared live pill derives status from `data?.[0]`; an older confirmed order can still unlock while a newer pending order displays. | `components/founder/live-order-status.tsx:19,35-37,57`; `lib/neon-realtime.ts:45-54`; `reports/page-fixes/pass3-payment-workflow.md:56-59` | LIVE-OPEN | Design System + Workflow | Select the relevant order deterministically and align with the confirmation contract. |
| F-32 | Medium | Role lookup / proxy | Failed Neon role lookup is returned silently instead of as a retryable infrastructure failure. | `proxy.ts:28-36,121-138` | LIVE-OPEN | Workflow owner | Return explicit retryable failure while keeping unknown-role redirect fail-closed. |
| F-33 | Medium | Student profile save | Both profile writes now run in one Neon transaction; zero-row writes and `getSql()` failures are handled inside the action. | `app/actions/student-profile.ts:65-105`; `app/actions/student-profile.test.ts`; `reports/page-fixes/pass3-profile-write.md:17-33` | RESOLVED-SOURCE | Workflow owner | Preserve; consider deduplicating the scoped SQL in a later data-layer pass. |
| F-34 | Medium | CV upload consistency | Upload ordering, per-attempt paths, stored-path verification, and failure copy are now honest; unreferenced-object cleanup remains deferred. | `app/actions/student-profile.ts:140-169`; `reports/page-fixes/pass3-profile-write.md:35-58` | PARTIAL-LATER-PASS | Workflow + Database + Storage policy owner | Keep Neon authoritative; add a cleanup policy for failed Neon writes after upload. |
| F-35 | Medium | Status updates | Zero affected rows now fail with refresh copy; status helpers return actual affected-row status. | `app/actions/projects.ts:61-71,171-180`; `lib/neon-data.ts:271-286`; `reports/page-fixes/pass3-deadline-status.md:9-16` | RESOLVED-SOURCE | Workflow + Database | Preserve; verify stale-row refresh in a real browser under V-05. |
| F-36 | Low | Status timeline | Data layer now exposes real history, but shared timeline still infers “Not yet” from index position. | `lib/neon-data.ts:467-486`; `components/ui/status-timeline.tsx:37-59,122-141` | LIVE-OPEN | Design System owner | Render real status history instead of positional inference. |
| F-37 | Medium | Application transitions | Transition map is action-side only; migration adding history/audit tables still needs deployment and DB enforcement. | `lib/neon-data.ts:445-461`; `neon/schema.sql:46-55`; `supabase/migrations/20261125000000_application_status_audit.sql:6-18` | LIVE-DEFERRED | Database + Workflow | Deploy migration and add DB-side trigger/check for concurrent callers. |
| F-38 | Low | Order status vocabulary | No schema CHECK constrains order status; existing confirmed-without-proof rows complicate enforcement. | `neon/schema.sql:88-98` | LIVE-DEFERRED | Database owner | Backfill/decide legacy rows, then add a CHECK constraint. |
| F-39 | Low | Signup validation | Client and server validation are duplicated with no shared schema. | `components/auth/signup-form.tsx:47-59`; `app/actions/auth.ts:130-137` | LIVE-OPEN | Workflow owner | Extract one shared validator used by both layers. |
| F-40 | Low | Signup error values | Server errors arrive as `?error=` redirects, remounting the form and clearing non-password values. | `components/auth/signup-form.tsx:86-91` | LIVE-DEFERRED | Workflow + Product | Add a state channel that preserves safe field values across errors. |
| F-41 | Low | Marketing CTAs | Signed-in students can still be sent to `/signup`; intent may be deliberate. | `app/for-students/page.tsx:111,171,330` | LIVE-DEFERRED | Signup + Design System + Product | Confirm intent; if wrong, make CTAs auth-state aware. |
| F-42 | Medium | Project action preflight | `getProfileRole()` sits outside the action `try/catch`; transient Neon failure rejects instead of returning `ProjectResult`. | `app/actions/projects.ts:35-39,72-86`; `lib/neon-data.ts:55-62` | LIVE-OPEN | Workflow owner | Move preflight into guarded result-returning flow. |
| F-43 | Medium | Budget validation | Client rejects >2 decimals, but shared validation/schema allow rounding gaps and have no positivity/order CHECK. | `lib/validators.ts:37-42`; `app/actions/projects.ts:53-56`; `neon/schema.sql:24,29-30`; `app/founder/projects/post/post-project-form.tsx:22-28,120-140,373-375` | LIVE-OPEN | Workflow + Database | Share decimal rules and add schema CHECKs. |
| F-44 | Low | Post-project page guard | Page checks `user` only; proxy and action provide normal defense. | `app/founder/projects/post/page.tsx:18-22,40-41` | LIVE-OPEN | Workflow owner | Add role check as defense in depth. |
| F-45 | Low | Accepted applicant copy | Server treats `accepted` as terminal; shared timeline marks only `rejected` terminal and still says work starts next. | `components/ui/status-timeline.tsx:143-162`; `app/actions/projects.ts:138-145,217-222` | LIVE-OPEN | Design System owner | Align terminal-state styling and copy with the action map. |
| F-46 | Low | CV path lifecycle | `cv_path` is plain text with no object-existence guarantee; stale seed path reaches friendly 502. | `neon/schema.sql:70`; `app/founder/students/[id]/page.tsx:148-160`; `app/api/cv/[id]/route.ts:70-71` | LIVE-DEFERRED | Database/Platform owner | Add seed/Storage lifecycle checks; do not mutate live objects without consent. |
| F-47 | Medium | Shortlist preparation | Admin can prepare shortlist without confirmed order; founder delivery is confirmation-gated. | `app/actions/admin-students.ts:50-65,86-110`; `app/founder/shortlists/shortlists-client.tsx:436-453`; `lib/neon-data.ts:805-818` | LIVE-DEFERRED | Workflow + Product + Operations | Decide whether internal preparation must be payment-gated; enforce one contract. |
| F-48 | Low | Demo-user guard | `assertNoDemoUsers()` is defined but never called in traced paths. | `lib/env.ts:67-77`; `reports/page-fixes/pass2-faq.md:183-189` | LIVE-OPEN | Workflow owner | Call the guard in the intended production paths or remove dead code. |
| F-49 | Medium | Student detail navigation | Apply redirect and detail back link lose list `q`/`mode`; `revalidatePath` misses detail path. | `app/student/projects/[id]/page.tsx:144-146,264-269`; `app/actions/projects.ts:132-135` | LIVE-OPEN | Student detail + Workflow owners | Preserve filters through links and revalidate both list and detail. |
| F-50 | Medium | Admin overview counts | “Total members” includes admins and out-of-vocabulary roles; intended definition is unclear. | `app/admin/page.tsx:88-110,120-123` | LIVE-DEFERRED | Product + Admin UX | Define the member set and align the query/label. |
| V-01 (B1) | High | Responsive / sticky behavior | 320/768/1440 overflow and sticky focus behavior are plausible from class structure but unproven. | `components/layout/workspace-nav.tsx:57`; `app/globals.css:141-146`; `components/motion/stacked-cards.tsx:102-109` | RUNTIME-UNVERIFIED | Frontend QA | Drive every marketing/workspace route at 320/768/1440; assert no horizontal scroll and tabbable sticky links. |
| V-02 (B2) | Medium | Contrast / focus on surfaces | Rendered contrast/focus on dark and photographic surfaces is not proven by source alone. | `components/marketing/cta-band.tsx:39-47`; `components/layout/workspace-hero.tsx:35-36`; `components/ui/photo-credit.tsx:39-56` | RUNTIME-UNVERIFIED | Accessibility + Design | Sample computed styles and screenshots; tab through each surface. |
| V-03 (B3) | Medium | Translation-safe layout | Narrow headings, `whitespace-nowrap`, and clamped display type may clip under long translations. | `app/contact/page.tsx:62`; `components/ui/button.tsx:21`; `components/marketing/cta-band.tsx:43` | RUNTIME-UNVERIFIED | i18n + Design | Inject 2–3× pseudo-localized strings at 320 px; verify wrapping and targets. |
| V-04 (B4) | Medium | Bundle / hydration / CLS | Production bundle, hydration delay, and `--:--` → time shift need measurement. | `app/layout.tsx:137`; `components/layout/workspace-clock.tsx:27-44`; `components/ui/motion.tsx:1` | RUNTIME-UNVERIFIED | Performance + Frontend | Run production build and throttled-mobile CLS/JS measurement. |
| V-05 (B5) | Medium | Error/empty/loading/offline states | Source copy is reasonable, but real failures, slow responses, expired sessions, and input preservation are unproven. | `app/error.tsx:19-38`; `components/layout/workspace-loading.tsx:15`; `app/admin/payments/payments-client.tsx:198-213` | RUNTIME-UNVERIFIED | QA + Frontend | Force failure/slow/empty/offline states and assert copy, focus, retry, and input preservation. |
| V-06 (B6) | Low | Final DOM ARIA | Heading order, landmarks, and disclosure IDREF pairing need a rendered snapshot. | `app/layout.tsx:129-136`; `components/auth/auth-shell.tsx:20-26`; `components/interactive/animated-disclosure-list.tsx:99-129` | RUNTIME-UNVERIFIED | Accessibility QA | Snapshot headings/landmarks and verify one `h1`, ordered headings, and ARIA pairing. |
| C-01 (C1) | Low | Terms claims | Delivery wording is corrected and unsupported suspension language replaced with report-abuse instruction. | `reports/international-standards.md:239-241`; `app/terms/page.tsx:162-163,189` | RESOLVED-SOURCE | Terms owner | Preserve; any suspension capability gap is conditional on product intent. |
| C-03 (C3) | Medium | Admin payment reject guard | Destructive reject confirmation now guards focus, Escape, and 44 px buttons. | `reports/international-standards.md:245-248`; `app/admin/payments/payments-client.tsx:110-121,326-359` | RESOLVED-SOURCE | Admin payments + Design System | Preserve; runtime focus return remains covered by V-05. |
| C-04 (C4) | Low | Live refresh controls | Refresh and pause controls are keyboard-operable, 44 px, and present in compact panel. | `reports/international-standards.md:249-252`; `components/data/live-context.tsx:146-171,415-421` | RESOLVED-SOURCE | Design System owner | Preserve; do not hide pause while polling continues. |
| C-05 (C5) | Low | Sticky / reduced motion | Sticky stacking is gated to desktop/no-preference motion with reduced-motion/higher-contrast overrides. | `reports/international-standards.md:253-256`; `app/globals.css:141-189` | RESOLVED-SOURCE | Design System owner | Preserve; verify composed pages under V-01 and section 7. |
| C-06 (C6) | Low | Compact statistics anchor | Compact/full panels now link to a visible note anchor. | `reports/international-standards.md:257-260`; `components/data/live-context.tsx:272-274,443-447`; `app/public/page.tsx:307-310` | RESOLVED-SOURCE | Design System + Public page owners | Preserve; verify anchor offset in runtime. |
| C-07 (C7) | Low | Password-help address | Password-help `mailto:` is built server-side instead of shipping a client config import. | `reports/international-standards.md:261-263`; `app/(auth)/login/page.tsx:39-41` | RESOLVED-SOURCE | Login + Workflow owners | Preserve; F-18 tracks the remaining deletion workflow. |
| R-01 (W4) | HIGH-resolved | `/public` runtime interactivity | Audit W4 suspected all interactivity inert; clean dev-server restart restored refresh, pause, disclosures, and mobile navigation. | `reports/page-audits/CONSOLIDATED.md:224-228`; `reports/page-fixes/public.md:121-127`; `reports/page-fixes/home.md:68` | RESOLVED-RUNTIME | No owner; not a product defect | Do not carry forward as live. Re-check only if HMR/WebSocket symptoms recur. |

## 3. Resolved vs live status

### Resolved — do not carry forward as live

- **10 register rows are resolved**: F-08, F-09, F-22, C-01, C-03, C-04, C-05,
  C-06, C-07, and R-01.
- **Nine are RESOLVED-SOURCE**: current source contains the fix.
- **One is RESOLVED-RUNTIME**: `/public` W4 was restored by a clean dev-server
  restart; the earlier failure coincided with HMR WebSocket errors.
- The international audit’s **7 already-fixed items** are C1–C7. C2 is mapped to
  F-22; its residual object-existence gap remains F-21. C1, C3–C7 are the six
  separate C rows above.
- Later pass-3 evidence adds `OfflineStatus` for A8/F-19 and documents the
  English-only metadata decision for A10/F-20. Neither item has runtime proof.

### Live source-verified

- **47 F rows are live** in current source: 24 LIVE-OPEN, 22 LIVE-DEFERRED, and
  1 PARTIAL-LATER-PASS (F-19).
- Live trust-critical items are F-03, F-21, F-07, F-16, F-13, F-33, F-34,
  and F-35. These are the must-fix blockers in section 4.
- Scope-gated items are not false; they are real limitations that need a
  product, policy, config, deployment, or consent decision before code can be
  called complete.

### Runtime-only

- The 6 V rows are not live defects and not passes. They are unverified checks.
- No new runtime check was run during this consolidation.

### Stale leads deliberately excluded

- `/public` W4 is resolved, not live (R-01).
- The earlier missing comma at `app/how-it-works/page.tsx:27-28` is fixed in the
  current pass-2 file; later reports report clean TSC.
- Earlier `TS1005` reports are stale. Later pass-2 and shared reports report
  clean TSC after that correction.
- The earlier student-projects prop mismatch is fixed by
  `pass2-student-projects.md`; later reports report clean TSC.
- `/terms` suspension copy is now “Report abuse using the contact address
  below.” A suspension capability gap is only a conditional product question,
  not a live copy defect.
- The phase-1 `/contact` header CTA lead and old CV-wording leads are verified
  resolved and not re-raised.

## 4. Must-fix blockers vs nice-to-have

### Must-fix blockers — 8

These are source-verified, user-visible or trust-critical, and fixable without
inventing a new product flow.

| ID | Why it must be fixed | Owner |
| --- | --- | --- |
| F-03 | Payment confirmation contradicts fulfillment and can mislead cross-timezone buyers. | Product + Workflow + Founder UX + Design System + Operations |
| F-21 | Confirmation can unlock without proof object existence. | Workflow |
| F-07 | Partial outages are presented as fully healthy data. | Design System + Workflow |
| F-16 | Visible “Local time” label fails WCAG 2.2 AA contrast. | Design System + Frontend |
| F-13 | Date-only deadlines can reject the current day west of UTC. | Workflow |
| F-33 | Failed profile save can leave partial state. | Workflow |
| F-34 | CV upload can disagree between Storage and database. | Workflow + Database |
| F-35 | Zero-row status updates can report false success. | Workflow + Database |

### Nice-to-have / scope-gated — 28

- **22 LIVE-DEFERRED F rows**: F-02, F-04, F-05, F-06, F-10, F-11, F-14,
  F-15, F-17, F-18, F-20, F-23, F-25, F-28, F-30, F-37, F-38, F-40, F-41,
  F-46, F-47, and F-50. These need product/policy/config/infra decisions.
- **6 runtime checks**: V-01–V-06. They are nice-to-have verification gates
  until an authorized runtime pass is run.

F-19 is reported separately as 1 PARTIAL-LATER-PASS row; it is not included in
the 28 nice-to-have/scope-gated count. The global notice landed in pass 3;
guarded/queued mutations, input preservation, and runtime proof did not.

## 5. Open international issues — 10

| International ID | Severity | Issue | Register ID | Current status | Evidence |
| --- | --- | --- | --- | --- | --- |
| A1 | High | Payment confirmation says “unlocked”, product rules say wait for admin | F-03 | LIVE-OPEN | `reports/international-standards.md:26-39` |
| A2 | High | Package size/support promises not enforced | F-04 | LIVE-DEFERRED | `reports/international-standards.md:41-54` |
| A3 | High | Rejected payment is a dead end | F-05 | LIVE-DEFERRED | `reports/international-standards.md:56-66` |
| A4 | Medium | Public marketing outpaces paused payments | F-06 | LIVE-DEFERRED | `reports/international-standards.md:68-81` |
| A5 | Medium | “Local time” label fails AA contrast | F-16 | LIVE-OPEN | `reports/international-standards.md:83-94` |
| A6 | Medium | Locale/timezone/currency formatting inconsistent | F-17 | LIVE-DEFERRED | `reports/international-standards.md:96-112` |
| A7 | Medium | Recovery/deletion are manual email flows with no SLA | F-18 | LIVE-DEFERRED | `reports/international-standards.md:114-126` |
| A8 | Medium | No app-level offline/reconnect state | F-19 | PARTIAL-LATER-PASS | `reports/international-standards.md:128-139`; `reports/page-fixes/pass3-offline-status.md:19-64` |
| A9 | Low | “Wait a minute” is not idiomatic/time-relative | F-12 | LIVE-OPEN | `reports/international-standards.md:141-149` |
| A10 | Low | English-only metadata has no language alternates | F-20 | LIVE-DEFERRED | `reports/international-standards.md:151-161`; `reports/page-fixes/pass3-offline-status.md:35-42` |

## 6. Ranked runtime checks — 6, none run here

| Rank | ID | Severity | Check | Evidence file:line | Status | Owner / action |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | B1 / V-01 | High | 320/768/1440 overflow and sticky-stack focus | `reports/international-standards.md:165-176`; `components/layout/workspace-nav.tsx:57`; `app/globals.css:141-146`; `components/motion/stacked-cards.tsx:102-109` | RUNTIME-UNVERIFIED | Frontend QA: drive all marketing/workspace routes and assert no horizontal scroll; verify sticky links remain tabbable. |
| 2 | B2 / V-02 | Medium | Rendered contrast and focus on dark/photo surfaces | `reports/international-standards.md:178-188`; `components/marketing/cta-band.tsx:39-47`; `components/layout/workspace-hero.tsx:35-36`; `components/ui/photo-credit.tsx:39-56` | RUNTIME-UNVERIFIED | Accessibility + Design: sample computed styles and screenshots; tab through each surface. |
| 3 | B3 / V-03 | Medium | Translation-safe layout | `reports/international-standards.md:190-200`; `app/contact/page.tsx:62`; `components/ui/button.tsx:21`; `components/marketing/cta-band.tsx:43` | RUNTIME-UNVERIFIED | i18n + Design: inject 2–3× strings at 320 px; verify wrapping, clipping, and targets. |
| 4 | B4 / V-04 | Medium | Client bundle, hydration, and CLS | `reports/international-standards.md:202-212`; `app/layout.tsx:137`; `components/layout/workspace-clock.tsx:27-44`; `components/ui/motion.tsx:1` | RUNTIME-UNVERIFIED | Performance + Frontend: production build and throttled-mobile measurement. |
| 5 | B5 / V-05 | Medium | Error/empty/loading/offline states in real navigation | `reports/international-standards.md:214-223`; `app/error.tsx:19-38`; `components/layout/workspace-loading.tsx:15`; `app/admin/payments/payments-client.tsx:198-213` | RUNTIME-UNVERIFIED | QA + Frontend: force failures, slow responses, empty lists, expired sessions, and offline mode. |
| 6 | B6 / V-06 | Low | Final DOM ARIA and heading order | `reports/international-standards.md:225-235`; `app/layout.tsx:129-136`; `components/auth/auth-shell.tsx:20-26`; `components/interactive/animated-disclosure-list.tsx:99-129` | RUNTIME-UNVERIFIED | Accessibility QA: snapshot headings/landmarks and verify ARIA pairing. |

Additional runtime-only claims that stayed unverified across page reports:
filters, browser back/forward, deep links, URL sync, filtered-empty recovery,
realtime confirmation, Storage expiry, failed mutation rollback, live timezone
and currency output, screen-reader output, focus return, loading timing, and
expired-session handling. None is reported as a pass.

## 7. Routed shared owners

| Owner | Scope from `MANIFEST.md` | Source report claim | Key routed leads still carried | Deliberate non-changes to preserve |
| --- | --- | --- | --- | --- |
| Workflow | `app/actions/*.ts` except founder profile actions, `app/api/**`, `proxy.ts`, tests, authz/state transitions | `shared-workflow.md` reports 64 focused tests passed, scoped ESLint clean, and TSC clean; no full build/test/dev server. | F-03, F-05, F-07 contract, F-10, F-11, F-13, F-14, F-21, F-24, F-25, F-30, F-32, F-33, F-34, F-35, F-37, F-39, F-42, F-43, F-44, F-48, F-49 | Password reset page, distributed rate-limit store, 1 MB server-action body limit vs 5 MB caps, order cancellation/expired status, seed/storage lifecycle |
| Database | `lib/neon-data.ts`, `neon/schema.sql`, `supabase/**`, `scripts/neon-*.mjs` | `shared-database.md` reports TSC clean, scoped ESLint clean, and `git diff --check` clean; no full build/test/dev server/live mutation. | F-01, F-02, F-17, F-23, F-26, F-27, F-28, F-29, F-37, F-38, F-43, F-46, F-47 | Unbounded reads kept visible instead of silently capped, raw-ID detail reads, CV object existence, migration/deployment decisions |
| Design System | Other `components/**`, `app/globals.css`, `lib/design-tokens.ts`, `app/layout.tsx`, shared layouts/boundaries | `shared-design-system.md` reports scoped ESLint clean and TSC clean; CSS read-only reviewed; no build/test suite/dev server. | F-07 UI, F-16, F-19 partial, F-31, F-36, F-41, F-45, V-01–V-06, sticky conflicts in section 8 | No guessed sticky offsets for `/public`, `/about`, or `/how-it-works`; no new pinned system layered over existing chrome |
| Page owners | Route-owned files listed in `MANIFEST.md` | 27 pass-2 pages fixed in owned files; 2 verified-no-change; 1 blocked by routed HIGH recovery gap. | Route-local fixes are preserved; routed items are not duplicated as page defects. | No shared-file or other-owner edit from page passes |

## 8. Pass 3 sticky-heading suitability

Runtime sticky behavior was not verified. The table records source/report
suitability only.

| Route | Suitability | Current status | Evidence file:line | Follow-up |
| --- | --- | --- | --- | --- |
| `/public` | Not suitable | NOT WIRED — no wrapper, sections array, marker, or manual sticky CSS. | `reports/page-fixes/pass3-public.md:5,10-13,28-39` | Existing `PinnedHeadingSection` at `app/public/page.tsx:217-294` collides with `StickySectionHeadings`. Needs a shared pinned-offset decision. |
| `/about` | Not suitable | NOT WIRED — no wrapper, sections array, marker, or manual sticky CSS. | `reports/page-fixes/pass3-about.md:13-16,38-80` | Needs one wayfinding primitive per page plus heading data-attribute passthrough in shared heading components. |
| `/how-it-works` | Not suitable | NOT WIRED — no wrapper, sections array, marker, or manual sticky CSS. | `reports/page-fixes/pass3-how-it-works.md:3-10,18-30` | Existing `ChapterProgress` and `PinnedScrollChapter` would compete with a second sticky nav. |
| `/for-founders` | Suitable | IMPLEMENTED — shared `StickySectionHeadings` wraps four real `h2` sections. | `reports/page-fixes/pass3-for-founders.md:14-36` | Verify composed sticky/focus behavior under B1/B6. |
| `/for-students` | Suitable | IMPLEMENTED — shared `StickySectionHeadings` wraps five real `h2` sections. | `reports/page-fixes/pass3-for-students.md:16-30` | Verify composed sticky/focus behavior under B1/B6. |
| `/faq` | Suitable | IMPLEMENTED — replaced conflicting `PinnedHeadingSection` layers with `StickySectionHeadings`. | `reports/page-fixes/pass3-faq.md:12-31` | Verify anchor offsets and reduced-motion fallback under B1/B6. |

## 9. Verification ledger

Static check claims copied from the source reports; none was rerun by this
consolidation.

- Clean scoped ESLint and clean TSC were reported by 20 page reports:
  `pass2-about.md`, `pass2-admin-overview.md`, `pass2-admin-projects.md`,
  `pass2-admin-students.md`, `pass2-contact.md`,
  `pass2-founder-browse-projects.md`, `pass2-founder-overview.md`,
  `pass2-founder-profile.md`, `pass2-founder-projects-post.md`,
  `pass2-founder-projects.md`, `pass2-founder-shortlists.md`,
  `pass2-founder-student-detail.md`, `pass2-home.md`,
  `pass2-how-it-works.md`, `pass2-login.md`, `pass2-privacy.md`,
  `pass2-signup.md`, `pass2-student-overview.md`,
  `pass2-student-profile.md`, and `pass2-student-projects.md`.
- `pass2-founder-browse-students.md` reported clean scoped ESLint and clean
  temporary-config typecheck; earlier unscoped failures were outside its route.
- Older unscoped TSC failures in admin payments, FAQ, founder project detail,
  public, student applications, student project detail, and terms are stale:
  the student-projects mismatch was later fixed and the `/how-it-works`
  TS1005 was corrected.
- `shared-workflow.md`: 64 focused tests passed; scoped ESLint and TSC clean.
- `shared-database.md`: TSC clean; scoped ESLint clean; `git diff --check` clean.
- `shared-design-system.md`: scoped ESLint clean; TSC clean; CSS read-only reviewed.
- `pass3-offline-status.md`: 3 focused tests passed; scoped ESLint and Prettier clean.
- Pass-3 sticky reports reported scoped ESLint clean for their owned page files;
  no full build, dev server, browser, or full test suite was run.

No runtime pass was performed for this register. All B1–B6 items and all
browser/focus/responsive/live-data claims remain unverified.
