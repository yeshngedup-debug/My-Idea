# Page fixes — `/for-founders`

Slug: `for-founders`. Route file: `app/for-founders/page.tsx`. Work done against
the current dirty working tree; no shared file, other page file, or existing
report was edited. No `git checkout`, `reset`, `stash`, or `clean` was run.

## Files changed

- `app/for-founders/page.tsx` (only source file changed)

Changes:

- **CV access copy corrected** at the `profileViews` "CV links" item (`:107`)
  and the main profile prose (`:323-326`). Both now name all three real paths:
  admins, founders with an application to their project, and founders with a
  confirmed shortlist order. The prose also names the short-lived signed links.
  This replaces the previous "confirmed order only" promise.
- **Payment confirmation copy corrected** at the third payment step (`:135`):
  an admin now confirms payment, finalizes and ranks the shortlist, then
  releases it. The existing "founders cannot confirm their own orders" fact is
  retained.
- **Raw `/login` path removed** from the access step (`:64-71`): "Log in" is now
  a real `Link href="/login"` using the existing `textLink` styles. The shared
  style constant was moved above `accessSteps` (`:52-53`) so both links can use
  it without duplication.
- **Mobile height wrapper** at `:176` changed from `min-h-screen` to
  `min-h-[100dvh]` to avoid the mobile address-bar jump. This is the low-severity
  carry-over already tracked by `reports/cold-eyes.md:25`; the file is owned by
  this slug, so the one-line fix is applied here.
- No new dependencies, gradients, emoji, off-palette colours, or structural
  rewrites were introduced.

## Checks performed

- Read `reports/page-fixes/MANIFEST.md` fully, the route audit
  `reports/page-audits/for-founders.md`, the relevant sections of
  `reports/page-audits/CONSOLIDATED.md` (lines 95-115, 163-220, 251-292), and
  `AGENTS.md`.
- Read Next.js 16 local guides before editing:
  `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`,
  `04-linking-and-navigating.md`, `05-server-and-client-components.md`,
  `07-mutating-data.md`, `10-error-handling.md`, and
  `14-metadata-and-og-images.md`. The page remains a static Server Component;
  the only navigation API added is the already-imported `Link`.
- Read the design contract: `design/brand-system.md`, `design/brand-guidelines.md`,
  `design/voice-guide.md`, `lib/design-tokens.ts`, and `app/globals.css`.
- Source-verified the audit claims instead of trusting them: read
  `app/api/cv/[id]/route.ts`, `components/motion/stacked-cards.tsx`,
  `components/interactive/animated-disclosure-list.tsx`,
  `components/marketing/product-preview/shortlist-preview.tsx`,
  `app/founder/shortlists/shortlists-client.tsx`,
  `app/actions/shortlist-order.ts`, `config/payment.ts`, `neon/schema.sql`, and
  the relevant helpers in `lib/neon-data.ts`.
- Verified link targets exist on disk: `/login`, `/contact`, `/how-it-works`.
- `npx eslint app/for-founders/page.tsx` completed with no findings.
- `git diff -- app/for-founders/page.tsx` and `git diff --check` reviewed; the
  diff is 6 small hunks in the one owned file. No full build, test suite, or dev
  server was run, per the manifest.

## Workflow findings routed out (not edited here)

1. **CV access rule is broader than the old public promise. (MED, shared)**
   - Evidence: `app/api/cv/[id]/route.ts:59-78` grants founders access when a
     student applied to one of their projects
     (`hasApplicationToFounderProject` at `lib/neon-data.ts:492-508`) before it
     checks confirmed orders and shortlist rows. `app/founder/students/[id]/page.tsx:89-93`
     renders the CV link whenever `cv_path` exists. `app/api/cv/[id]/route.ts:84-92`
     signs URLs for 300 seconds.
   - Action taken here: copy on this route now matches the current rule.
   - Owner: **workflow owner** (`app/api/**`, server-side authorization).
   - Recommended fix: decide the intended rule. If application-based access is
     intended, keep the route and align the remaining route copies
     (`/how-it-works`, `/for-students`, `/privacy`) as this page now does. If
     confirmed-order-only access is intended, remove or gate
     `hasApplicationToFounderProject` at `app/api/cv/[id]/route.ts:63`, gate the
     link at `app/founder/students/[id]/page.tsx:89-93`, and add a test for the
     rejected application case.

2. **Payment confirmation reports an unlock before admin finalization. (MED, shared)**
   - Evidence: `app/actions/shortlist-order.ts:169-192` sets status `confirmed`
     and returns "Payment confirmed. Shortlist unlocked." but does not create or
     rank `shortlists` rows. The live founder UI says "Your ranked shortlist
     will appear here as soon as the admin finalizes it" at
     `app/founder/shortlists/shortlists-client.tsx:304-307`.
   - Action taken here: this page's payment copy now names the admin
     finalization and ranking step.
   - Owner: **workflow owner** for the action and success message; the
     founder-shortlists page agent owns the live UI line cited above.
   - Recommended fix: either create/rank the shortlist rows inside the
     confirmation flow before returning success, or change the action message
     at `app/actions/shortlist-order.ts:192` to say the admin will finalize and
     rank the shortlist. Add a regression check for the confirmed-but-empty
     state.

3. **Product-preview copy and contrast live in a shared component. (MED, shared)**
   - Evidence: `components/marketing/product-preview/shortlist-preview.tsx:42-45`
     says the founder view appears after payment is confirmed, and `:57-60`
     says "Shortlist unlocked." immediately after admin confirmation. The
     panel micro-label at `:48` and the sample-data disclaimer at `:76` use
     `text-[#657069]` on `#eae5d9`, about 4.1:1, below AA for 12px text. This
     page mounts the preview at `app/for-founders/page.tsx:448`.
   - Owner: **design-system owner** (all files under `components/**`).
   - Recommended fix: update the two copy blocks to mention admin finalization,
     and replace `text-[#657069]` at `:48` and `:76` with `text-body-secondary`
     (`#56645c`, about 4.95:1 on `#eae5d9`). Keep the sample-data disclaimer.

4. **Reduced-motion payment cards still stick and overlap. (MED, shared)**
   - Evidence: `app/globals.css:141-146` applies `position: sticky` to every
     `[data-stacked-card]` at `min-width: 768px`, and `components/motion/stacked-cards.tsx:113`
     adds `md:sticky`. The reduce fallback at `app/globals.css:160-163` resets
     only opacity and transform, so the route still scroll-pins under
     `prefers-reduced-motion: reduce`. The component comment at
     `components/motion/stacked-cards.tsx:16-23` promises a plain ordered list.
   - Owner: **design-system owner** (`app/globals.css`, `components/**`).
   - Recommended fix: gate the sticky rule on
     `(min-width: 768px) and (prefers-reduced-motion: no-preference)` at
     `app/globals.css:141` and add `[data-stacked-card] { position: static;
     top: auto; }` inside the reduce block at `:160-163`. A page-level
     `!important` override was deliberately not added: the globals rule is
     unlayered and would require a hack to beat it from this file.

## Database findings routed out (not edited here)

- **No route-level data layer.** `app/for-founders/` contains only `page.tsx`;
  there is no `use server`, `fetch`, database client, `/api/` call, mutation,
  redirect, or revalidation in this route. The page renders static
  `config/payment.ts` values and the sample seed in
  `components/marketing/product-preview/sample-shortlist-data.ts`. No
  route-owned RLS, ownership predicate, status contract, or unbounded read
  exists to fix.
- **Verified claims against schema and helpers:**
  - `neon/schema.sql:56-57` defines `student_profiles.cv_path`;
    `app/api/cv/[id]/route.ts:84-92` signs it for 300 seconds, which supports
    the new "short-lived links" wording.
  - `neon/schema.sql:35-42` (`applications`) and `:18-33` (`projects.founder_id`)
    back `lib/neon-data.ts:492-508`, the application path now named in copy.
  - `neon/schema.sql:75-85` defines `shortlist_orders.status` with
    `confirmed` in the check constraint; `lib/neon-data.ts:1046-1058` filters on
    exactly that value. No stale status value appears in this page's copy.
  - `neon/schema.sql:65-73` defines `shortlists` rows. Finalization is implied
    by those rows; there is no separate "finalized" column.
  - `lib/neon-data.ts:641-651` (`listBrowseableStudents`) requires `cv_path`,
    `full_name`, `college`, and at least one skill, which supports the existing
    "Completed profiles" claim. No change made.
- **Shared items for the database owner:**
  1. `neon/schema.sql:1-4` states there is no RLS and authorization stays in the
     application layer. CV access is enforced only by
     `app/api/cv/[id]/route.ts:36-82`. This is the global architecture finding
     owned elsewhere, not a new finding from this route. Recommended fix stays
     with the database/workflow owners: add RLS or keep and document the
     app-only contract consistently.
  2. `neon/schema.sql:75-85` has no admin-finalization state or timestamp.
     If "finalized" must be an enforceable state rather than a human step, the
     database owner should add a `finalized_at` field or equivalent via a
     migration, and the workflow owner should set it in the admin shortlist
     action. Until then, the page describes workflow, not a DB-enforced rule.
  3. `neon/schema.sql:87-92` indexes `shortlist_orders` only on
     `(founder_id, created_at desc)`, while `lib/neon-data.ts:1046-1058` filters
     on `founder_id` plus `status = 'confirmed'`. Scale-dependent note for the
     database owner: consider a composite `(founder_id, status)` index if order
     volume grows. Not a defect observed on this static page.

## Deliberately not changed

- `app/for-founders/page.tsx:450-487` (payment section): the repeated
  three-column prose-row pattern is a carried LOW finding owned by
  `reports/visual-recheck.md:119`. Changing the treatment is a design rewrite
  beyond a small, purposeful diff. The three real steps and their order are
  preserved.
- Reduced-motion sticky cards, preview contrast, and preview copy: all live in
  shared files outside this slug's ownership and are routed above.
- Header founder CTA, metadata/OG image, and the agreement-template copy in
  the closing band: the audit verified them as correct or already resolved.
- `neon/schema.sql`, `lib/neon-data.ts`, `app/actions/**`, `app/api/**`,
  `components/**`, and `app/globals.css`: shared owners; read only.
