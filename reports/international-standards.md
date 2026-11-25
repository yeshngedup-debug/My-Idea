# International standards audit — Bhutan Tech Connect

Date: 2026-11-25. Read-only audit. No product source was edited; the only file
written is this report. Prior audit/fix reports were used as leads, then
cross-checked against current source.

## Scope and verification key

Checked: semantic landmarks and headings, skip links, keyboard focus, visible
focus, WCAG 2.2 AA contrast and target size, reduced motion, forms/errors, ARIA,
international copy/locale/timezone/currency readiness, translation-safe layout,
responsive class structure, content truthfulness, error/empty/loading/offline
states, performance basics, privacy/consent, and destructive-action guards.

- **Verified from source** — directly provable in the files cited below.
- **Needs runtime check** — plausible from class structure or composition, but
  not proven without driving the running app at 320/768/1440 px.
- **Already fixed in current diff** — the current source contains the fix;
  retained here so it is not re-reported as open.

Totals: **10 open issues verified from source**, **6 ranked runtime checks**,
**7 items already fixed in the current diff**.

## A. Ranked open issues — verified from source

### A1 — High — Payment confirmation says “unlocked”, product rules say “wait for admin”

- **Evidence:** `app/actions/shortlist-order.ts:213` returns “Payment confirmed.
  Shortlist unlocked.”; `app/founder/shortlists/shortlists-client.tsx:463` says
  the ranked shortlist appears only “as soon as the admin finalizes it”. Public
  copy agrees with the slower flow at `app/how-it-works/page.tsx:112` and
  `app/for-founders/page.tsx:135`.
- **Why internationally:** a founder in another time zone can read the success
  message as immediate delivery, then wait for an unstated manual step. This
  undermines trust in payment and fulfilment claims.
- **Recommendation:** make one source of truth: either release on confirmation
  or change the message to “Payment confirmed. An admin will finalize your
  shortlist.” State the manual step and expected window in public copy.
- **Owner:** Product + Founder UX + Operations.

### A2 — High — Package size and support promises are not enforced in code

- **Evidence:** `config/payment.ts:17` promises “Ranked shortlist of 3–5
  students”; `config/payment.ts:30` promises “5–10 students”;
  `config/payment.ts:31-33` promises availability pre-check, admin-led
  introductions, and one replacement. The generator validates only a non-empty
  array at `app/actions/admin-students.ts:87-95`; none of those package promises
  is checked in the generation path.
- **Why internationally:** paid-package claims become unenforceable when buyers
  compare plans across borders and assume the published limits are contractual.
- **Recommendation:** pass the ordered package id into generation, enforce the
  min/max count, and only advertise the replacement/intro features once a
  tracked workflow exists.
- **Owner:** Product + Backend + Legal.

### A3 — High — Rejected payment order is a dead end

- **Evidence:** `app/actions/shortlist-order.ts:136-137` tells the founder “Ask
  an admin to reopen it.” Admin review is limited to `pending` and `submitted`
  at `app/admin/payments/payments-client.tsx:73-75`; no reopen action exists in
  the order actions.
- **Why internationally:** a rejected payer has no self-service recovery path
  and must rely on an email conversation across time zones to continue.
- **Recommendation:** add an explicit admin reopen action or change the message
  to “Create a new order” and link to the order form.
- **Owner:** Backend + Product.

### A4 — Medium — Public package marketing outpaces the paused payment configuration

- **Evidence:** public package cards show prices/features at
  `app/for-founders/page.tsx:373-407`, including “Delivered within 2 working
  days” from `config/payment.ts:20`. Payments are disabled by design at
  `config/payment.ts:60-62`, and the pause notice exists only in the founder
  workspace at `app/founder/shortlists/shortlists-client.tsx:242-246`.
- **Why internationally:** an international founder can see a price and delivery
  promise before discovering that new orders are paused; this reads as a stale
  or misleading commercial offer.
- **Recommendation:** add the same paused-payment notice beside public package
  pricing, or hide price CTAs until real bank/mBoB details are published. Treat
  “2 working days” as an operational SLA, not a static feature string.
- **Owner:** Marketing + Product + Operations.

### A5 — Medium — Visible “Local time” label fails AA contrast

- **Evidence:** `components/layout/workspace-clock.tsx:38` renders 10 px
  `#8d948e` text on `#f5f2ea`; computed ratio is about **2.78:1**, below the
  WCAG 2.2 AA 4.5:1 minimum for normal text.
- **Why internationally:** the label that disambiguates the Thimphu time readout
  is the hardest part to read, especially on low-quality displays or in bright
  environments.
- **Recommendation:** use a token with at least 4.5:1, for example `#657069`
  (about 4.61:1 on `#f5f2ea`), or remove the label and rely on the accessible
  name at line 41.
- **Owner:** Design System + Frontend.

### A6 — Medium — Locale, timezone, and currency formatting is inconsistent

- **Evidence:** admin payment dates are fixed `en-GB` + `UTC` at
  `app/admin/payments/payments-client.tsx:50-70`; generated shortlist dates use
  local `en-GB` with no zone at `app/actions/admin-students.ts:145`; World Bank
  figures use `en-US` grouping at `lib/data/world-bank.ts:202-206`; founder
  amounts use `Nu` with `en-IN` grouping at
  `app/founder/shortlists/shortlists-client.tsx:333`; workspace clock uses
  `Asia/Thimphu` at `components/layout/workspace-clock.tsx:11-20`.
- **Why internationally:** mixed grouping conventions, an unexplained `Nu`
  prefix, and zone-less dates make deadlines, payments, and statistics ambiguous
  to non-Bhutanese readers.
- **Recommendation:** centralise formatters: label `Nu` as Bhutanese ngultrum on
  first use, pair every timestamp with an explicit zone, and choose one grouping
  convention per locale. Keep UTC where hydration stability requires it, but
  label it consistently.
- **Owner:** Frontend + Data/i18n.

### A7 — Medium — Account recovery and deletion are manual email flows with no SLA

- **Evidence:** login builds a `mailto:` password-help link at
  `app/(auth)/login/page.tsx:39-41`; the form says “Email us for password help”
  at `components/auth/login-form.tsx:157-162`; deletion asks users to email and
  only says “reply to confirm” at `app/privacy/page.tsx:172-183`.
- **Why internationally:** manual recovery across time zones can strand users,
  and a data-deletion promise without a response window is difficult to honour
  consistently under privacy regimes.
- **Recommendation:** ship self-service password reset; for deletion, publish a
  response deadline, verification steps, and what order records are retained
  and why.
- **Owner:** Auth + Legal/Support.

### A8 — Medium — No app-level offline or reconnect state found

- **Evidence:** the only degraded-state copy found is the refresh-specific note
  at `components/data/live-context.tsx:230-237` (“Auto-refresh temporarily
  unavailable”). No service worker, `navigator.onLine` handling, or global
  offline banner exists in the source.
- **Why internationally:** users on intermittent mobile or cross-border links
  can see stale dashboards or failed submissions without being told whether the
  action succeeded.
- **Recommendation:** add a global offline/reconnect notice, disable or queue
  mutating actions while offline, and preserve form input on failed submissions.
- **Owner:** Platform + Frontend.

### A9 — Low — Idiomatic, time-relative error copy

- **Evidence:** `app/(auth)/login/page.tsx:19-20` says “Wait a minute and try
  again.”
- **Why internationally:** literal translations turn this into a strange exact
  one-minute promise; the real rate-limit window may not be one minute.
- **Recommendation:** use “Try again in a moment.” or expose the actual retry
  window from the server.
- **Owner:** Content + i18n.

### A10 — Low — English-only metadata has no language alternates

- **Evidence:** `app/layout.tsx:65-67` sets `lang="en" dir="ltr"`;
  `app/layout.tsx:24-28` sets a canonical and `og:locale` of `en_BT`, but no
  language alternates or `hreflang` are present.
- **Why internationally:** this is acceptable while the site is English-only,
  but there is no metadata contract for adding Dzongkha or other localized
  routes later.
- **Recommendation:** document the current English-only decision; add
  `alternates.languages` and a locale switcher when translated routes ship.
- **Owner:** SEO + i18n.

## B. Ranked checks needing runtime verification

### B1 — High — 320/768/1440 overflow and sticky-stack behaviour

- **Evidence to drive:** mobile workspace navigation scrolls horizontally at
  `components/layout/workspace-nav.tsx:57`; sticky cards are gated to `768px+`
  and no-preference motion at `app/globals.css:141-146`; stacked-card offsets
  are set at `components/motion/stacked-cards.tsx:102-109`.
- **Why internationally:** long translated nav labels and stacked marketing
  cards are the most likely places for horizontal overflow or trapped focus.
- **Check:** drive every marketing and workspace route at 320, 768, and 1440 px;
  assert no document-level horizontal scroll and all sticky links remain
  tabbable.
- **Owner:** Frontend QA.

### B2 — Medium — Rendered contrast and focus rings on photographic/dark surfaces

- **Evidence to drive:** low-opacity text on dark green at
  `components/marketing/cta-band.tsx:39-47`; white overlay copy on photographs
  at `components/layout/workspace-hero.tsx:35-36`; 12 px photo-credit links at
  `components/ui/photo-credit.tsx:39-56`.
- **Why internationally:** computed CSS opacity over images can fail contrast
  even when the underlying hex token passes.
- **Check:** sample computed styles and screenshot contrast in the running app;
  tab through each surface and confirm a visible focus ring.
- **Owner:** Accessibility + Design.

### B3 — Medium — Translation-safe layout

- **Evidence to drive:** narrow heading widths such as `max-w-[14ch]` at
  `app/contact/page.tsx:62`; `whitespace-nowrap` on the shared button at
  `components/ui/button.tsx:21`; large clamped display type at
  `components/marketing/cta-band.tsx:43`.
- **Why internationally:** German, Dzongkha, or long legal labels can break or
  truncate these fixed-width/nowrap areas.
- **Check:** inject 2–3× length pseudo-localised strings and verify wrapping,
  clipping, and tap targets at 320 px.
- **Owner:** i18n + Design.

### B4 — Medium — Client bundle, hydration, and layout shift

- **Evidence to drive:** global client `MotionProvider` at `app/layout.tsx:137`;
  clock placeholder then timed update at
  `components/layout/workspace-clock.tsx:27-44`; client motion primitives in
  `components/ui/motion.tsx:1`.
- **Why internationally:** users on slower mobile networks are most exposed to
  hydration delay and the `--:--` → time shift.
- **Check:** run a production build, review first-load JS per route, and measure
  CLS with throttled mobile CPU/network.
- **Owner:** Performance + Frontend.

### B5 — Medium — Error, empty, loading, and offline states in real navigation

- **Evidence to drive:** error boundary at `app/error.tsx:19-38`; static loading
  skeleton at `components/layout/workspace-loading.tsx:15`; payment empty state
  at `app/admin/payments/payments-client.tsx:198-213`.
- **Why internationally:** source shows reasonable copy, but only runtime can
  prove these states appear after failed/slow requests and preserve user input.
- **Check:** force API failures, slow responses, empty lists, expired sessions,
  and offline mode; assert the visible copy, focus, and retry paths.
- **Owner:** QA + Frontend.

### B6 — Low — Final DOM ARIA and heading order

- **Evidence to drive:** skip link and live region at `app/layout.tsx:129-136`;
  auth shell dynamically chooses `h1`/`p` at
  `components/auth/auth-shell.tsx:20-26`; disclosure state at
  `components/interactive/animated-disclosure-list.tsx:99-129`.
- **Why internationally:** screen-reader users rely on the composed DOM, not the
  source component boundary.
- **Check:** snapshot headings and landmarks on each route; verify one `h1`,
  ordered `h2`/`h3`, and correct `aria-expanded`/`aria-controls` pairing.
- **Owner:** Accessibility QA.

## C. Already fixed in the current diff

- **C1 — Terms claims corrected.** “Shortlists are delivered after payment is
  confirmed” at `app/terms/page.tsx:162-163`; unsupported suspension language
  replaced by a report-abuse instruction at `app/terms/page.tsx:189`.
- **C2 — Payment proof actually verified.** Signed URL availability is checked
  before confirmation at `app/actions/shortlist-order.ts:193-203`; a missing
  proof now blocks confirmation.
- **C3 — Destructive reject action guarded.** Focus moves into the inline guard
  and returns to the trigger at `app/admin/payments/payments-client.tsx:110-121`;
  the confirmation panel, Escape handling, and 44 px buttons are at
  `app/admin/payments/payments-client.tsx:326-359`.
- **C4 — Live refresh controls always reachable.** Keyboard-operable refresh and
  pause controls use `min-h-11` at `components/data/live-context.tsx:146-171`
  and render in the compact panel at
  `components/data/live-context.tsx:415-421`.
- **C5 — Sticky and reduced-motion fallbacks.** Sticky stacking is limited to
  desktop/no-preference motion at `app/globals.css:141-146`; reduced-motion,
  reduced-transparency, and higher-contrast overrides are at
  `app/globals.css:148-189`.
- **C6 — Compact statistics note anchor.** The compact panel links to the note
  at `components/data/live-context.tsx:443-447`, and the public page supplies a
  visible target at `app/public/page.tsx:307-310`; the full-panel target is at
  `components/data/live-context.tsx:272-274`.
- **C7 — Password-help address resolved server-side.** The `mailto:` value is
  built on the server at `app/(auth)/login/page.tsx:39-41` instead of shipping a
  client-side config import.

## D. Source-verified passes worth preserving

- **Language and metadata:** `lang`/`dir` at `app/layout.tsx:65-67`; canonical
  and OpenGraph locale at `app/layout.tsx:24-28`; manual duplicate tags were
  removed at `app/layout.tsx:72-73`.
- **Landmarks and skip link:** skip link at `app/layout.tsx:128-134`; main
  landmark at `components/auth/auth-shell.tsx:24-26` and across public/legal
  pages; polite global live region at `app/layout.tsx:135-136`.
- **Forms:** signup validation announces errors with `role="alert"`, links them
  with `aria-describedby`, and focuses the first invalid field at
  `components/auth/signup-form.tsx:130-136,157-302`.
- **Target size:** common small links use `min-h-6` (24 px) at
  `components/marketing/site-footer.tsx:12`,
  `components/ui/photo-credit.tsx:45,54`, and
  `components/auth/login-form.tsx:159`; no source-confirmed WCAG 2.2 AA target
  violation was found.
- **Motion and layout:** reduced-motion and transparency fallbacks at
  `app/globals.css:148-189`; anchor scroll padding at `app/globals.css:79-82`.
- **Privacy/consent:** no analytics or tracking scripts were found; auth cookies
  are handled in `proxy.ts:71-98`. Authorship/licences are not guessed: the
  explicit Wikimedia registry is at `components/ui/photo-credit.tsx:7-23` with
  a safe “See source” fallback at lines 32-36.
- **Loading/empty copy:** static loading shape at
  `components/layout/workspace-loading.tsx:1-15`; empty payment queue with a
  recovery action at `app/admin/payments/payments-client.tsx:198-213`.

## Method note

`git diff --check` was run during the audit; it reported no whitespace errors,
only the repository’s LF→CRLF working-copy warnings. No source, config, test,
schema, or other report file was modified.
