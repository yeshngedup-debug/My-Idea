# Page audit — `/terms`

Date: 2026-11-24. Role: single read-only critic; no child agents. No product source,
config, schema, test, or existing report was edited. The only file written is this
report. `app/terms/page.tsx` has an uncommitted working-tree change at `:208`; that
change is authoritative and is reflected in every citation below.
`reports/page-audits/INDEX.md:17` still records this page as `pending`; the
orchestrator owns marking it `done`.

## Route

`/terms` — public, static Terms of Use page. Source: `app/terms/page.tsx:1-220`.
It renders one `h1` (`:58-63`), five named sections (`:29-35`, `:89-213`), an
on-page anchor nav (`:69-85`), a back-home link (`:44-49`), and one mailto link
(`:204-211`). No fetch, server action, route handler, or database call exists on
this route.

## Files traced

| File | Why |
|---|---|
| `app/terms/page.tsx:1-220` | Audited route: metadata `:7-14`, mount animation `:16-27`, chapters `:29-35`, header/back link `:42-54`, title `:56-65`, nav `:67-85`, body `:87-214`. |
| `config/app.ts:5` | Source of `APP_CONTACT.email` used by the mailto at `app/terms/page.tsx:207-211`. |
| `app/layout.tsx:15-39,128-137` | Global metadata title template and skip link to `#main-content`, which matches `app/terms/page.tsx:39`. |
| `app/page.tsx:1-2` | `/` redirects to `/public`, so the "Back to home" link at `app/terms/page.tsx:45` resolves to a real page. |
| `proxy.ts:42` | CSP allows `style-src 'self' 'unsafe-inline'`; the inline `<style>` at `app/terms/page.tsx:40` is not blocked. |
| `app/founder/shortlists/shortlists-client.tsx:346-348`, `app/founder/shortlists/agreement/route.ts:60-61` | Verify the "template is provided in the founder dashboard" claim at `app/terms/page.tsx:135-136`. |
| `design/voice-guide.md`, `design/brand-guidelines.md`, `README.md` | Voice, brand, and product-fact grounding. |
| `reports/PROTOCOL.md`, `reports/SKILL-ASSIGNMENTS.md` | Audit rules and skill precedence. |
| `reports/performance-seo.md`, `reports/accessibility-critic.md`, `reports/content-integrity.md`, `reports/copy-critic.md`, `reports/component-relevance-audit.md` | Existing owners of overlapping findings; read before finalising. |

All 16 top-level `reports/*.md` files and all 11 `reports/page-audits/*.md` files
were read before this report was written.

## Skills used

Loaded and applied with `reports/SKILL-ASSIGNMENTS.md` precedence: `unslop`,
`better-interface`, `better-ui`, `better-layout`, `design-taste-frontend`,
`apple-design`, `better-writing`, `better-typography`, `frontend-a11y`,
`better-accessibility`, `animate`, and `api-security-testing` (read from
`C:\Users\DELL\.config\opencode\skills\strix\api-security-testing\SKILL.md`).
Repo guidance: `design/voice-guide.md`, `design/brand-guidelines.md`. Next.js
docs read: `css-in-js.md`, `metadata-and-og-images.md`. Runtime verification used
Playwright MCP.

## UI/UX findings

### Confirmed

No finding reached the HIGH, MEDIUM, or LOW reporting bar.

Verified passing:

- Runtime `GET /terms` returned 200; document title was
  `Terms of Use | Bhutan Tech Connect`, matching the template at
  `app/layout.tsx:17-20` and the page title at `app/terms/page.tsx:8`.
- One `h1` and exactly five `h2` headings render; each section has a matching
  `aria-labelledby` (`app/terms/page.tsx:89-96,118-125,145-152,172-179,193-200`).
- The nav at `app/terms/page.tsx:69-85` is labelled `On this page`; all five
  `#` targets resolve. Clicking `#premium-shortlists` set the hash and showed the
  section heading in view.
- No horizontal overflow at 1440×900 (`scrollWidth == clientWidth == 1425`) or
  375×812 (`scrollWidth == clientWidth == 360`). The only off-viewport elements
  belonged to the dev Mesurer toolbar/Next portal and were excluded.
- Tab order was skip link → back-home → five nav anchors → mailto. Every stop
  matched `:focus-visible` and showed the same visible ring: 2px cream offset plus
  4px `#b23c26`. The mailto target measured 32px high on desktop and 28px high on
  mobile after the current `min-h-6` change at `app/terms/page.tsx:208`; that
  clears the WCAG 2.5.8 24×24 minimum. It was not clicked.
- With `prefers-reduced-motion: reduce`, the `legal-mount` headings report
  `animation-name: none`; the no-preference path runs 240ms transform/opacity only
  (`app/terms/page.tsx:16-27`). This agrees with
  `reports/performance-seo.md:140` and `reports/accessibility-critic.md:42`.
- No console errors/warnings, failed requests, or API/auth/data requests occurred.

### Suspected

None. No visual or interaction concern was strong enough to report without a
concrete defect.

## Workflow findings

### Confirmed

- Back-home link (`app/terms/page.tsx:44-49`) points to `/`; `app/page.tsx:1-2`
  redirects that to `/public`. The path is valid.
- All in-page anchors (`app/terms/page.tsx:76-81`) work and their ids exist
  (`app/terms/page.tsx:90,119,146,173,194`).
- The contact link (`app/terms/page.tsx:206-211`) resolves to
  `mailto:hello@bhutantech.bt` from `config/app.ts:5`. Its visible text is an
  email address, so the action is self-describing.
- The founder-template claim (`app/terms/page.tsx:135-136`) is backed by a real
  dashboard download at `app/founder/shortlists/shortlists-client.tsx:346-348`
  and a PDF route at `app/founder/shortlists/agreement/route.ts:60-61`. It is not
  a `/terms` defect.

### Suspected

None. No broken task path, dead control, or misleading affordance was found.

## Database/RLS findings

### Confirmed

`/terms` has no database, API, auth, or RLS surface. The route imports only
`next/link` and `APP_CONTACT` (`app/terms/page.tsx:4-5`); no server action,
`fetch`, Supabase/Neon client, or table access is reachable from this page.
Therefore there is no route-local SQL, authorisation, or row-level-security
finding to report. Table-wide RLS issues remain with their owning reports and
are not duplicated here.

### Suspected

None.

## Severity summary

| Severity | Confirmed | Suspected |
|---|---:|---:|
| HIGH | 0 | 0 |
| MEDIUM | 0 | 0 |
| LOW | 0 | 0 |

No new finding is added. This page is in good shape for an MVP legal page.

## Recommended fixes

None required for `/terms`.

- Keep the current mailto class change at `app/terms/page.tsx:208`; it improves
  the inline target and should not be reverted.
- Do not duplicate existing owners: canonical/OG/SEO and reduced-motion notes
  belong to `reports/performance-seo.md:140`; contrast/WCAG/motion belong to
  `reports/accessibility-critic.md:41-42`; legal text and link integrity belong
  to `reports/content-integrity.md:48-50,63-66`; copy voice and typography belong
  to `reports/copy-critic.md:8,23,44`; component relevance is already recorded in
  `reports/component-relevance-audit.md:36`.
- Earlier reports cite pre-edit line numbers for this page (for example
  `terms:75`, `terms:171`, `terms:220`). Use the current worktree line numbers in
  this report when acting on those notes.

## Notes/limitations

- Runtime checks used `next dev` on `localhost:3000` in a fresh isolated
  Playwright context. They are not production CWV or field data.
- The mailto link was inspected by `href` and rendered geometry only; it was not
  clicked, so no mail client was opened.
- No physical screen reader was used; structure and focus statements are DOM,
  ARIA, and computed-style based.
- Dev-only Next portal and Mesurer toolbar nodes were excluded from overflow and
  tab-order checks because they are not part of the page under audit.
- `app/terms/page.tsx:40` uses an inline `<style>`; `proxy.ts:42` permits it, and
  no CSP console error appeared. This is noted for completeness, not as a defect.
- Read-only constraint held: only `reports/page-audits/terms.md` was written;
  `reports/page-audits/INDEX.md` was not edited.
