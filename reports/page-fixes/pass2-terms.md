# `/terms` (terms) pass-2 feature-completeness fix report

Date: 2026-11-25.

## Files changed

- `app/terms/page.tsx`
  - Updated the displayed last-updated month to November 2026 because the copy changed in this pass.
  - Changed “Shortlists are prepared after payment is confirmed” to “Shortlists are delivered after payment is confirmed.” The founder-facing unlock and the agreement template both tie **delivery** to confirmation; admin-side preparation is not gated the same way (see routed findings).
  - Replaced “We may suspend accounts that abuse the platform.” with “Report abuse using the contact address below.” No account-state or suspension transition exists in the current code, so the original sentence promised a capability the platform does not have.
  - Preserved the pre-existing uncommitted mailto class change at `:208` (`inline-flex min-h-6 items-center`).
- `reports/page-fixes/pass2-terms.md` (this report).

## Features verified

- Installed Next.js 16 guides read before editing: `03-layouts-and-pages.md`, `05-server-and-client-components.md`, `07-mutating-data.md`, and `10-error-handling.md` under `node_modules/next/dist/docs/01-app/01-getting-started/`. No Next.js API or routing convention was changed.
- Page structure remains intact: one `h1` at `app/terms/page.tsx:58-60`, five sections at `:89-213`, and an on-page nav at `:69-85` whose five `#` targets all exist. The root skip link still targets `#main-content` (`:39`).
- “Back to home” points to `/` (`:44-49`); `app/page.tsx:1-2` permanently redirects `/` to `/public`.
- The Questions mailto uses `APP_CONTACT.email` (`:205-211`; `config/app.ts:4-6`). The existing 24px inline-link sizing was left intact.
- “A template is provided in the founder dashboard” (`:134-136`) is backed by the live download link at `app/founder/shortlists/shortlists-client.tsx:501-505` and the PDF response at `app/founder/shortlists/agreement/route.ts:54-64`.
- “Delivered after payment is confirmed” now matches the confirmed-order gate in `lib/neon-data.ts:805-818` (a founder shortlist request needs an application relationship or a `status = 'confirmed'` order), the order-status contract in `neon/schema.sql:88-98`, and the founder UI unlock at `shortlists-client.tsx:436-453`. The agreement template also says delivery happens after payment confirmation (`agreement/route.ts:28-30`).
- “Non-refundable once delivered” matches the agreement template at `agreement/route.ts:45-47`. No refund action or refund promise exists elsewhere.
- “Matching service”, “not an employer”, “not an agent”, and “not a party to any work” (`:100-115`) are consistent with the agreement template’s direct-engagement language (`agreement/route.ts:32-35`) and with the project/application/shortlist flow.
- “The fee covers research, curation, and ranking” (`:157-160`) is consistent with the package features in `config/payment.ts:10-35` and the manual rank ordering in `app/actions/admin-students.ts:86-166`.
- “Hiring evaluation only … must not be redistributed or published” (`:165-168`) is mirrored in the agreement template at `agreement/route.ts:37-39`.
- “Be truthful …” and “Do not misuse … contact details” (`:184-188`) are user obligations rather than platform guarantees. Input validation exists in `lib/validators.ts`, but truthfulness and spam/resale cannot be proven from the schema; no over-claim was introduced.
- Palette, focus rings, reduced-motion handling, and the inline `<style>` block were unchanged from the phase-1 verified state.

## Fixes made

- `app/terms/page.tsx:62`: “Last updated: October 2026” → “Last updated: November 2026”.
- `app/terms/page.tsx:162`: “prepared after payment is confirmed” → “delivered after payment is confirmed”.
- `app/terms/page.tsx:189`: “We may suspend accounts that abuse the platform.” → “Report abuse using the contact address below.”

## Checks performed

- `npx eslint app/terms/page.tsx` — exit 0, no findings (npm notice lines only).
- `npx tsc --noEmit --pretty false` — exit 1. The only diagnostic was in an unowned file: `app/how-it-works/page.tsx(28,3): error TS1005: ',' expected.` The `pageMetadata` call at `app/how-it-works/page.tsx:24-29` is missing a comma after the `description` string. No diagnostic named `app/terms/page.tsx`; this pass did not touch that file. Routed below to the `how-it-works` owner.
- `git diff -- app/terms/page.tsx` reviewed: exactly the three copy changes above plus the pre-existing mailto class change at `:208`. No other diff was introduced.
- Not run by design: full `next build`, `npm test`, dev server, or browser tooling.

## Routed findings

- **Database + workflow owners — account suspension capability missing.** The original `app/terms/page.tsx:189` claimed “We may suspend accounts that abuse the platform.” Current source has no account-state field: `neon/schema.sql:8-16` gives `public.profiles` only `id`, `role`, name/college/avatar, and timestamps; `lib/neon-data.ts:55-63` reads only `role`; `proxy.ts:27-36,128-138` gates only on role; and a search of `app/actions/**` found no admin/account-status transition. Recommendation: if suspension remains intended product behaviour, add an explicit `active`/`suspended` profile status with a migration, an admin-only transition action, and a check in the shared authorization gate (`proxy.ts` plus the relevant server actions). Until that exists, keep the report-only abuse copy.
- **Workflow owner — admin shortlist preparation is not payment-gated.** `app/actions/admin-students.ts:86-110` lets an admin generate and persist a shortlist for any valid founder/project without checking for a confirmed order. This is not a user-facing delivery bypass: founder unlock is confirmation-gated (`shortlists-client.tsx:436-453`, `lib/neon-data.ts:805-818`). If policy means no internal preparation before payment either, add a confirmed-order guard to `generateShortlist`; otherwise the revised “delivered” wording is the accurate contract. No action was changed here.
- **`how-it-works` page owner — project typecheck is blocked by an unowned syntax error.** `app/how-it-works/page.tsx:27-28` needs a comma after the `description` string in the `pageMetadata({...})` call. This is not caused by `/terms` edits and is outside this ownership table.

## Deliberately not changed

- The pre-existing mailto class change at `app/terms/page.tsx:208` was preserved, not reverted or restyled.
- No schema migration, admin action, or `proxy.ts` change was attempted; those belong to the database/workflow owners and need a product decision on suspension.
- No technical enforcement was added for the redistribution, truthfulness, or contact-misuse clauses. They remain user obligations, and the agreement template carries the same hiring-use restriction.
- No change to the agreement route, payment config, founder shortlist UI, navigation, metadata, animation, or palette: source verification found no route-local defect in those areas.
- No other agent’s report or file was edited; no destructive git command was run.
