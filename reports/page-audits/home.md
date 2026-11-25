# `/` route audit

## Route

`/` — public root alias. `app/page.tsx:1-2` imports `redirect` and calls `redirect('/public')`. A direct request returned HTTP `307` with `Location: /public`; `/public` returned `200`.

The rendered destination is the public, unauthenticated landing page at `app/public/page.tsx:35-382`. It awaits `getLiveContext()` at `:36`, renders `main#main-content` at `:42-44`, and produced title `Paid project work in Bhutan | Bhutan Tech Connect` and H1 `Students find paid projects. Founders post the brief.` in the live browser pass. This report audits the `/` alias and the destination experience it serves.

Read-only critic pass under `reports/PROTOCOL.md:3,10-19`. Uncommitted working-tree changes were treated as authoritative. No product source, config, schema, test, existing report, or `reports/page-audits/INDEX.md` entry was edited. `app/page.tsx` itself is unmodified in `git status`.

## Files traced

| File | Why it is in scope |
|---|---|
| `app/page.tsx:1-2` | Sole route under audit: one server-component redirect to `/public`. |
| `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/redirect.md:12,52` and `permanentRedirect.md:11,49` | Installed Next.js 16 guidance for the observed 307 and the 308 alternative. |
| `app/layout.tsx:15-49,108-139` | Inherited metadata, Organization JSON-LD, skip link, global live region, motion provider. Root canonical is `/` at `:24`. |
| `app/public/page.tsx:1-382` | Rendered destination: metadata at `:25-30`, server data load at `:35-39`, main landmark at `:42-44`, native `<details>` at `:296-301`, “Why two numbers?” note at `:302-364`. |
| `lib/metadata.ts:8-42` | `pageMetadata()` builder; sets destination canonical and social URL to `/public` at `:26,31`. |
| `components/data/live-context.tsx:25,52-66,68-137,140-180,400-458` | Destination polling clock, refresh/pause controls, compact panel, source links, status announcements. |
| `lib/data/world-bank.ts:359-437` | Public aggregate data source behind `getLiveContext()`. |
| `app/api/context-data/route.ts:1-23` | Public JSON endpoint used by manual refresh and polling. |
| `proxy.ts:36-135,137-142` | Global CSP/auth proxy; matcher includes `/` but the public path receives no role redirect. |
| `components/marketing/nav.ts:8-12,34-66,87-91` and `components/marketing/site-header.tsx:26-180`, `site-footer.tsx:14-69`, `cta-band.tsx` | Destination home link, navigation, auth CTAs, closing CTA. `SITE.homeHref` is `/public`. |
| `components/interactive/animated-disclosure-list.tsx:50-129` | Destination disclosure toggle wiring used during the clean retest. |
| `reports/PROTOCOL.md`, `reports/SKILL-ASSIGNMENTS.md`, `reports/page-audits/INDEX.md` and all existing `reports/*.md` and `reports/page-audits/*.md` files | Reporting protocol, skill precedence, overlap control. All were read before finalizing. |

## Skills used

Precedence from `reports/SKILL-ASSIGNMENTS.md:5-13` was applied. Items 1–4 were not assigned to this critic, so the `better-*` evidence rules govern interface findings; accessibility is graded against WCAG, not preference.

| Skill | What it informed here |
|---|---|
| `unslop` | Checked that the root adds no duplicate copy or decorative layer; destination copy findings remain with `public.md`. |
| `better-interface` | Redirect as an entry path; destination hierarchy and CTA priority cross-check. |
| `better-layout` | Destination checks at 1440px, 390px and 320px, including horizontal overflow. |
| `better-ui` | Destination focus rings and compact-panel treatment cross-check. |
| `better-writing` | Route title/destination title consistency and “Why two numbers?” framing. |
| `better-typography` | Destination H1 sizing and heading-order cross-check. |
| `better-colors` | Destination contrast cross-check; no new contrast score is claimed here. |
| `frontend-a11y` | Skip target, landmarks, native `<details>`, `aria-expanded`/`aria-pressed` and `aria-controls`. |
| `better-accessibility` | WCAG 2.2.2 pause control, keyboard operation, and reduced-motion behavior. |
| `webapp-testing` | Isolated live Playwright pass against the running dev server. |
| `api-security-testing` | Boundary/authz checklist only; no Strix scan was run. |

## UI/UX findings

**Confirmed — no new finding unique to `/`.** The root response renders no page UI; every visual element in the destination is already owned by `reports/page-audits/public.md`. Live checks confirmed one `main#main-content`, one H1, a skip link whose target exists (`app/layout.tsx:129-134`), native disclosure behavior, and no horizontal overflow at 390px or 320px.

**Cross-referenced, not duplicated.** Destination UI issues remain owned by `public.md` and are not re-scored here:

| Owner | Severity | Source | Status |
|---|---|---|---|
| `public.md:43` | MED | `components/data/live-context.tsx:436-443` | Compact panel sends readers to `/about` although the note is below on the same page. |
| `public.md:45` | LOW | `app/public/page.tsx:79,83-84,155-158` | Value proposition repeated three times. |
| `public.md:47` | LOW | `app/public/page.tsx:102-104` | Hero photo credit lacks a solid backing chip. |
| `public.md:49` and `about.md:39` | Owner-scored | `app/public/page.tsx:261-262`, `animated-disclosure-list.tsx:77-78,90-93,117-119` | Invalid `aria-controls` IDREF with spaces; fix once in the shared component. |
| `public.md:51` | Verified | `app/public/page.tsx:75-80,296-364` | H1 clamp, labelled sections, key contrast values and 390px width were resolved in the current source. |

**Suspected — none.** No unverified destination UI defect is carried forward from this pass.

## Workflow findings

**Confirmed — LOW — `app/page.tsx:1-2`.** The permanent marketing home is reached with a temporary redirect. `redirect()` produces 307 (`redirect.md:12,52`), and the live request returned 307; internal links already use `/public` as home (`components/marketing/nav.ts:11,87-91`), while destination metadata canonicalises `/public` (`app/public/page.tsx:25-30`; `lib/metadata.ts:26`). Why it matters: 307 tells clients and search engines the move is temporary, which can delay consolidation of inbound signals between `/` and `/public` even though the destination is stable. Fix: import `permanentRedirect` from `next/navigation` and call `permanentRedirect('/public')` at `app/page.tsx:2` for a 308, or add an explicit 308 redirect in `next.config.ts`. The installed guide documents the 308 behavior at `permanentRedirect.md:11,49`.

**Verified — destination workflow.** The destination has no forms. Header, footer and closing CTAs point to the expected public/auth routes. In the isolated browser pass: the closed `<details>` hid its content from `innerText`; activating the summary changed `open` from `false` to `true`; `Refresh now` fired two `/api/context-data` requests with `cache: "no-store"` and updated the status to `Updated just now`; pause/resume toggled button text and `aria-pressed`; disclosure rows toggled `aria-expanded`; and the 390px mobile menu opened `marketing-mobile-nav` with seven links. There was no `/api/context-data` request on initial load.

**Resolved — do not re-raise.** The suspected HIGH “all interactivity inert” finding at `public.md:61` was retested after a clean dev-server restart. Refresh, pause, disclosures and mobile navigation all changed state as expected. It is not a live finding for `/` or `/public`.

**Cross-referenced, not duplicated.** Destination workflow issues remain owned by `public.md`: MED pause control hidden inside closed `<details>` (`public.md:55`), MED stale relative “checked just now” label (`public.md:57`), LOW closed-state `aria-controls` target (`public.md:59`), and LOW endpoint rate-limit question (`public.md:69`). Root canonical `/` at `app/layout.tsx:24` is not emitted on `/` because the redirect terminates rendering; destination canonical `/public` is the only rendered page canonical. No metadata conflict was found.

## Database/RLS findings

**Confirmed — no application data access on `/` itself.** `app/page.tsx:1-2` has no server action, query, mutation, API call, cookies/headers read, user input, or dynamic parameter. The global proxy matcher includes `/` (`proxy.ts:137-142`) and `proxy.ts:100-103` calls `supabase.auth.getUser()`, but `/` is neither protected nor an auth page (`proxy.ts:105-121`), so no role lookup, redirect, or user row is read on this path. CSP is applied at `proxy.ts:39-63`.

**Destination — public aggregate data only.** `getLiveContext()` at `app/public/page.tsx:36` resolves to public World Bank/WHO series through `lib/data/world-bank.ts:359-437`. `app/api/context-data/route.ts:15-22` returns aggregate JSON with `Cache-Control: public, s-maxage=3600`. No user-specific record, identifier, secret, or row-level data is rendered. There is no login gate, IDOR/BOLA surface, mass assignment, CSRF-bearing form, or RLS-dependent query on this route. This matches `public.md:67` and `about.md:71` and is cross-referenced rather than restated as a new defect.

**Suspected — none.** The only related concern, rate limiting on the public refresh endpoint, is already owned by `public.md:69`.

## Severity summary

| Severity | Confirmed | Suspected | Notes |
|---|---:|---:|---|
| HIGH | 0 | 0 | `public.md:61` was resolved by clean retest and is not carried forward. |
| MED | 0 | 0 | Destination MED findings stay with their owning reports. |
| LOW | 1 | 0 | Temporary 307 for the stable `/` → `/public` home alias. |
| Cross-referenced (not counted) | — | — | Destination UI/workflow/data findings owned by `public.md`, `about.md` and site-wide reports. |

## Recommended fixes

1. **LOW — route alias:** change `app/page.tsx:1-2` to use `permanentRedirect('/public')`, or add an explicit 308 redirect in `next.config.ts`. Keep `SITE.homeHref = "/public"` unchanged.
2. **No new UI, accessibility, or database fix is assigned to this report.** Apply destination fixes through the owners listed in `public.md:84-92`; do not re-score them under `/`.

## Notes/limitations

- Date: 2026-11-24. Role: one read-only critic; no child agents were spawned.
- The sole file written by this audit is `reports/page-audits/home.md`. `reports/page-audits/INDEX.md:9` still lists `/` as `pending`; the orchestrator owns that status change.
- Live verification used Playwright MCP in isolated context `home-route-critic-20261124` against the running `next dev` server. Observed: `/` → `307 /public`; `/public` → `200`; expected title, H1 and `main#main-content`; no initial non-static request; working refresh/pause/disclosure/mobile-menu interactions; seven mobile nav links; and no overflow at 320px.
- Repeated console errors were limited to dev HMR WebSocket handshake failures (`ws://127.0.0.1:3000/_next/hmr...`, `net::ERR_INVALID_HTTP_RESPONSE`). They are dev-server noise, not product findings.
- No production build was run while `next dev` was active. No build, typecheck, lint, or test command was run. Not verified here: production-build behavior, physical screen-reader announcement, 200% zoom, formal WCAG contrast measurement, Core Web Vitals, and visual inspection of every image.
- No form was submitted and no application data was created, updated, or deleted.
