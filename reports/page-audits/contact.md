# `/contact` page audit

## Route

`/contact` — public, static contact page. Audit is read-only and covers the current working-tree source, including uncommitted user changes. No other route was audited and no product source was edited.

## Files traced

- `app/contact/page.tsx:1-300` — sole route under audit: metadata, mailto setup, static sections, images, links.
- `config/app.ts:4-6` — source of `APP_CONTACT.email` (`CONTACT_EMAIL` with a public fallback).
- `lib/metadata.ts:8-42` — `pageMetadata` builder used by `app/contact/page.tsx:15-20`.
- `app/layout.tsx:15-49,127-137` — global metadata template, skip link, `MotionProvider`; skip target matches `app/contact/page.tsx:53`.
- `components/marketing/site-header.tsx:26-34,103-124` — sticky header and primary CTA rendered at `app/contact/page.tsx:51`.
- `components/marketing/nav.ts:34-66` — nav, utility links, CTA label/href constants.
- `components/marketing/guides/primitives.tsx:13-45,83-108` — `Chapter` and `ActionLink` behavior.
- `components/marketing/cta-band.tsx:22-60` — closing FAQ CTA rendered at `app/contact/page.tsx:287-292`.
- `components/ui/motion.tsx:42-142`, `components/marketing/hero-motion.tsx:27-74` — reveal/stagger and reduced-motion behavior.
- `components/ui/photo-credit.tsx:25-59` — external Wikimedia credit links used at `app/contact/page.tsx:108-113,188-190`.
- `reports/PROTOCOL.md`, `reports/SKILL-ASSIGNMENTS.md`, all 16 existing `reports/*.md` files, and `reports/page-audits/INDEX.md` were read before finalizing.

## Skills used

Loaded and applied from `~/.config/opencode/skills/<id>/SKILL.md`: `unslop`, `better-interface`, `better-layout`, `better-ui`, `better-writing`, `frontend-a11y`, `better-accessibility`, `webapp-testing`, `security-review`, `api-security-testing`.

Precedence from `reports/SKILL-ASSIGNMENTS.md` was applied inside the assigned set: `unslop` governs minimal copy and removal of duplicated intent; `better-*` skills govern evidence-based interface findings; `frontend-a11y`/`better-accessibility` supply the a11y lens; `security-review`/`api-security-testing` bound the data/API section; `webapp-testing` supplied the intended runtime method, which was blocked as recorded in `Notes/limitations`.

## UI/UX findings

**Confirmed overlap — owned by `reports/cold-eyes.md:19`; not counted as a new finding.** **HIGH** — `components/marketing/site-header.tsx:29-34`; `components/marketing/nav.ts:52-55`; rendered on `/contact` via `app/contact/page.tsx:51`. The header's `founderContext` covers `/for-founders` and `/founder` but not `/contact`, so the default primary CTA remains `CTA_LABELS.signup` = "Create student account" while this page's own founder section at `app/contact/page.tsx:202-225` says founder accounts require an admin-arranged request. Why it matters: a founder sent here from signup or the founder guide still sees a student-signup action as the header's primary intent. Fix in the header, not this page: include `/contact` in the founder context, and on `/contact` hide the CTA or point it to the founder mailto defined at `app/contact/page.tsx:23-25` instead of a self-link to `/contact`. Current-source evidence confirms the owner report still applies; no new analysis is added here.

**Confirmed overlap — owned by `reports/cold-eyes.md:20`; former repeated-address issue in `reports/visual-recheck.md:57-58` is fixed per `reports/visual-recheck.md:105`.** **MED** — `app/contact/page.tsx:66-85` and `app/contact/page.tsx:149-151`. The same `generalHref` is exposed three times: the giant address link at `:66-82`, "Email the team" at `:85`, and "Email the team" again at `:149-151`. The address itself now appears once, so the older M6 duplicate-address defect is resolved; the duplicate action remains. Why it matters: three entry points for one intent add noise and make the first chapter feel repeated. Fix: keep the giant mailto at `:66-82` as the single primary action; delete the hero `ActionLink` at `:85` (keep the FAQ link at `:86-91`) and delete the repeated `ActionLink` at `:149-151`, or replace the latter with a genuinely different action.

**Confirmed overlap — owned by `reports/cold-eyes.md:20`.** **MED** — `app/contact/page.tsx:86-91`, `app/contact/page.tsx:30-35`, and `app/contact/page.tsx:287-292`. "Read the FAQ" appears twice with the same label and `/faq` destination, and `helpfulLinks[0]` is a third card to the same route. Why it matters: repeated navigation competes with the email action and lengthens a short page without adding a destination. Fix: keep the closing `CtaBand` at `:287-292`; remove the hero link at `:86-91`, then either drop the FAQ card at `:30-35` or replace it with a non-duplicate destination.

**Confirmed overlap — owned by `reports/cold-eyes.md:25`.** **LOW** — `app/contact/page.tsx:50` uses `min-h-screen` on the page wrapper. Why it matters: mobile Safari's collapsing address bar can cause a visible height jump on a short page. Fix: change to `min-h-[100dvh]`.

**Suspected — static source only; no rendered check.** **LOW** — `app/contact/page.tsx:79` applies `break-all` to the up-to-72px email address. Why it matters: on a 320px viewport the address may wrap inside words or digits, reducing legibility even though the mailto still works. Fix: use `break-words` with `overflow-wrap: anywhere` only as a fallback, and lower the mobile end of the clamp (for example `text-[clamp(1.75rem,7vw,4.5rem)]`). Verify at 320px and 375px once a dev server is reachable. Typography ownership remains with `reports/copy-critic.md` and rendered-visual ownership with `reports/visual-recheck.md`; this item adds only the current call-site evidence.

Not carried forward from older reports: the two `CaretRight` markers reported at old `app/contact/page.tsx:173,293` (`reports/visual-recheck.md:123`, `reports/component-relevance-audit.md:99`) are absent from the current source; the bento grid at old `:78` (`reports/visual-critic.md:28`, `reports/orchestrator-audit.md:15`), negative tracking at old `:235` (`reports/copy-critic.md:26`), and headings ending in periods at old `:70,110,163,224` (`reports/copy-critic.md:28`) are also absent.

## Workflow findings

**Confirmed — route-specific, not owned by an existing report.** **MED** — `app/contact/page.tsx:22-25`, `app/contact/page.tsx:66-82`, `app/contact/page.tsx:149-151`, `app/contact/page.tsx:161-169`, `app/contact/page.tsx:218-225`. The general mailto has no subject or body (`:22`), and the founder mailto has a subject but no body (`:23-25`), while the page asks users to state their role, page/feature, and project or order reference (`:161-169`) and, for founders, name, organisation, and project (`:218-225`). Why it matters: the guidance stays on the page instead of travelling with the message; mobile mail clients open a blank draft, which invites incomplete requests and follow-up. Fix: extend the existing `encodeURIComponent` pattern at `:23-25` to both constants, e.g. a general subject "Question about Bhutan Tech Connect" with a body listing "Role / Page or feature / Project or order reference", and a founder body listing "Name / Organisation / Project idea". The visible copy does not need to change. `reports/content-integrity.md:49` already verified the email address and mailto wiring; this finding concerns message context only.

**Confirmed — route-specific, not owned by an existing report.** **LOW** — `app/contact/page.tsx:18`, `app/contact/page.tsx:61-64`, `app/contact/page.tsx:127-130`, `app/contact/page.tsx:145-147`. The page promises help ("we will help", "We answer questions") and explicitly says there is no form or ticket queue, but gives no response-time expectation or acknowledgment path. Why it matters: email-only contact leaves the sender without a way to judge whether the note arrived or when to expect a reply. Fix: add one short line under the hero with a verified response window (for example, "We usually reply within two working days"). If the team cannot commit to a window, use an honest line such as "We read every message and reply as soon as we can" and soften the metadata promise at `:18` to match.

No form is a deliberate choice here: `app/contact/page.tsx:127-130` states "No form to fill in and no ticket queue." This audit does not recommend adding a form; it only flags the missing message context and expectation.

## Database/RLS findings

**No findings (HIGH/MED/LOW: 0).** `/contact` has no server actions, no database queries, no mutations, no API route calls, no `fetch`, no Supabase/Neon client, and no auth-specific work. Evidence: the import block at `app/contact/page.tsx:1-13` contains only UI, metadata, config, and Next primitives; constants at `:22-46` are static strings; the component body at `:48-300` is static JSX; a targeted grep for `fetch|use server|async |supabase|neon|prisma|createClient|cookies\(|headers\(|redirect\(|revalidate|insert|update|delete|mutation|action` found only `ActionLink` references at `:85,149,151,223,225`. `config/app.ts:5` reads a public contact address from `CONTACT_EMAIL` with a non-secret fallback; no secret is exposed. External Wikimedia links in `components/ui/photo-credit.tsx:41-54` use `target="_blank"` with `rel="noopener noreferrer"`. There is no user input on this route, so injection, IDOR/BOLA, mass assignment, rate limiting, and RLS review are not applicable; `api-security-testing` confirms no API surface to test here.

## Severity summary

| Class | HIGH | MED | LOW |
|---|---:|---:|---:|
| Confirmed, route-specific | 0 | 1 | 1 |
| Confirmed, carried over from existing reports | 1 | 2 | 1 |
| Suspected, static-only | 0 | 0 | 1 |
| **Total** | **1** | **3** | **3** |

The single HIGH is a carried-over header issue owned by `reports/cold-eyes.md:19`; this audit found no new HIGH defect in `app/contact/page.tsx`. Route-specific confirmed items are the under-specified mailto intents (MED) and missing response expectation (LOW).

## Recommended fixes

1. **Header CTA (HIGH, owner `cold-eyes.md:19`)** — in `components/marketing/site-header.tsx:29-34`, include `/contact` in `founderContext`; on `/contact`, hide the primary CTA or replace it with the founder mailto from `app/contact/page.tsx:23-25`.
2. **Mailto context (MED)** — in `app/contact/page.tsx:22-25`, add encoded `subject` and `body` for both `generalHref` and `founderHref`; mirror the prompts already shown at `:161-169` and `:218-225`.
3. **Duplicate actions (MED, owner `cold-eyes.md:20`)** — keep one email CTA at `app/contact/page.tsx:66-82`; remove `:85` and `:149-151`. Keep one FAQ path: remove `:86-91` and either drop or replace `helpfulLinks[0]` at `:30-35`.
4. **Response expectation (LOW)** — add a verified reply window or an honest no-SLA statement near `app/contact/page.tsx:61-64`; align the metadata promise at `:18`.
5. **Small-screen polish (LOW)** — change `app/contact/page.tsx:50` to `min-h-[100dvh]`. After a dev server is available, check `app/contact/page.tsx:79` at 320px and 375px and replace `break-all` only if the address actually breaks badly.

## Notes/limitations

- Runtime verification was not practical: `http://localhost:3000/contact`, `:3001`, and `:3002` all timed out. Playwright MCP tools were discovered but not used because no dev server was reachable. This report is therefore static-only: no live browser render, keyboard pass, console read, screenshot, contrast measurement, or responsive measurement was performed in this audit.
- `npm run build` was not run. No dev server was started and no product file was edited.
- Uncommitted user changes were treated as authoritative; nothing was reverted or overwritten.
- One agent was used; no child agents were spawned.
- `reports/page-audits/INDEX.md` was not updated. This is a new `contact.md`; no existing report was modified.
- Prior reports were used for overlap rather than duplicated: `cold-eyes.md` owns the header CTA and repeated-action items; `visual-recheck.md` owns the former duplicate-address/chevron items; `visual-critic.md` owns rendered visual findings; `component-relevance-audit.md` owns interaction relevance; `copy-critic.md` owns copy/typography; `accessibility-critic.md` owns WCAG/motion findings; `content-integrity.md` already verified the contact email and internal links; `performance-seo.md` owns site-wide metadata/indexing concerns.
