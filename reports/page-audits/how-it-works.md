# Page audit — `/how-it-works`

Date: 2026-11-24. Role: read-only critic (`reports/PROTOCOL.md`). The only file written is this report. No product source, config, schema, test, or existing report was edited. Uncommitted working-tree changes were treated as authoritative. `reports/page-audits/how-it-works.md` did not exist before this audit; `reports/page-audits/INDEX.md:15` still lists `/how-it-works` as `pending`, which the orchestrator owns.

## Scope and method

- Audited route: `app/how-it-works/page.tsx` (368 lines), plus rendering dependencies traced through `components/marketing/site-header.tsx`, `site-footer.tsx`, `cta-band.tsx`, `guides/guide-hero.tsx`, `guides/primitives.tsx`, `components/ui/motion.tsx`, `components/ui/photo-credit.tsx`, `components/marketing/nav.ts`, `components/motion/{chapter-progress,pinned-scroll-chapter,_shared}.ts`, `lib/metadata.ts`, and `app/layout.tsx`.
- Claim verification went into `app/actions/{auth,projects,shortlist,shortlist-order,admin-students}.ts`, `app/api/cv/[id]/route.ts`, `app/founder/projects/post/post-project-form.tsx`, `app/founder/shortlists/shortlists-client.tsx`, `app/student/profile/profile-form.tsx`, `app/student/applications/applications-client.tsx`, `lib/validators.ts`, `config/payment.ts`, and `neon/schema.sql`.
- Skills loaded and applied under `reports/SKILL-ASSIGNMENTS.md` precedence: `unslop`, `better-interface`, `better-layout`, `better-ui`, `better-writing`, `frontend-a11y`, `better-accessibility`, `webapp-testing`, `security-review`, and `api-security-testing`. Sources: `~/.config/opencode/skills/<id>/SKILL.md` for the first nine; `C:\Users\DELL\.config\opencode\skills\strix\api-security-testing\SKILL.md` for the last. `better-interface` governed severity and evidence; `better-writing` governed claims; `frontend-a11y` + `better-accessibility` governed semantic/WCAG review; `webapp-testing` governed the browser drive; `security-review` + `api-security-testing` governed the auth/data-layer trace.
- Reference docs read: `reports/PROTOCOL.md`, `reports/SKILL-ASSIGNMENTS.md`, `reports/page-audits/INDEX.md`, every existing `reports/*.md`, every existing `reports/page-audits/*.md`, `design/voice-guide.md`, `design/brand-guidelines.md`, and `README.md`.
- No Next.js API was written, so no source-changing Next.js guidance was needed.

**Runtime method:** Playwright MCP drove `http://localhost:3000/how-it-works` in an isolated context named `howitworks-audit`. `127.0.0.1:3000` refused connections while the dev server listened on `::`, so `localhost` was used. The drive verified rendered headings and landmarks, skip link, the five “On this page” anchors, image alts and credits, internal link targets, metadata, and no horizontal overflow at 375px and 1440px (`scrollWidth === clientWidth`). Console output contained only five HMR `ERR_INVALID_HTTP_RESPONSE` errors for `/_next/hmr`; no application errors. I did not start a server, run `npm run build`, run tests, or spawn child agents. Browser snapshots were auto-saved by Playwright MCP under `.playwright-mcp/`.

## Ranked findings

| # | Severity | Class | Domain | Location | Finding | Fix |
|---|---|---|---|---|---|---|
| F1 | **MED** | Confirmed | Workflow / writing | `app/how-it-works/page.tsx:46`, `:66-69` | Founder brief says skills and deadline are set/required; the form and schema allow both to be blank. | Make them required in form and schema, or relabel them optional. |
| F2 | **MED** | Confirmed | Workflow / writing | `app/how-it-works/page.tsx:52`, `:77` | Student profile/CV is described as part of applying; the save action requires only `full_name` and the apply action checks no profile completeness. | Enforce completeness before apply, or change the copy to guidance. |
| F3 | **MED** | Confirmed | CTA / role | `app/how-it-works/page.tsx:358-363` | Founder-oriented closing CTA links to student signup. | Link founders to `/contact` for access, or rewrite the CTA for students. |
| F4 | **MED** | Confirmed | Privacy / data access | `app/how-it-works/page.tsx:88-89` | CV access is wider than “tied to a confirmed order”: founders with an application to their project can open a CV. | State the real access paths, or tighten the route if that access is unintended. |
| F5 | **MED** | Confirmed | Workflow / writing | `app/how-it-works/page.tsx:111-112` | Page implies the ranked shortlist is available immediately after payment confirmation; founder UI says it appears after admin finalization. | Add the admin-finalization step to the copy. |
| S1 | **LOW** | Suspected | Writing / status | `app/how-it-works/page.tsx:92-93` | “Students see the same status” is not supported by the student applications view. | Add order status to the student view, or clarify that application status is separate. |
| S2 | **LOW** | Suspected | Environment-dependent claim | `app/how-it-works/page.tsx:84-85` | Payment instructions are unconditional, but payment destinations default to empty and new orders are gated off. | Source the copy from `PAYMENT_CONFIGURED`, or qualify it. |

No HIGH finding fired: no confirmed security bypass, data loss, blocked core task, or inaccessible primary content on this route.

## Confirmed findings

### F1 — MEDIUM — Founder brief overstates what the form requires

- **Where:** `app/how-it-works/page.tsx:46` (“The founder sets the required skills … and a deadline”) and `:66-69` (“The required skills”, “A deadline”).
- **Evidence chain:** `lib/validators.ts:14-23` accepts a skill list but does not require at least one entry; `:25-37` makes `deadline` optional. The form's completion checklist at `app/founder/projects/post/post-project-form.tsx:43-55` omits both fields. `app/founder/projects/post/post-project-form.tsx:143` labels “Required skills” without a required marker, and `:258-266` explicitly says the deadline is “Optional”.
- **Why it matters:** the page promises a shared, scoped brief with required skills and a deadline. A founder can publish a project with neither, so the student promise at `app/how-it-works/page.tsx:75-76` (“scope and the required skills”, “budget range and the deadline”) can be false. `better-writing` treats this as a product-fact mismatch, not a style issue.
- **Fix:** either (a) add `skills.min(1)` and a required `deadline` to `createProjectSchema`, add both to the form checklist at `post-project-form.tsx:43-55`, mark the controls required, and remove “Optional” at `:266`; or (b) if optionality is intended, rewrite `page.tsx:46`/`:66-69` as “can add” and move both items into an optional column. Option (a) matches the page's promise.

### F2 — MEDIUM — Complete student profile + CV is described as the path to apply, but is not enforced

- **Where:** `app/how-it-works/page.tsx:52` (“The student adds skills, a short bio, availability, and a PDF CV. Then they apply…”) and `:77` (“apply to with a complete profile and CV”).
- **Evidence chain:** `lib/validators.ts:43-51` requires only `full_name`; college, course, year, availability, skills, and bio are optional. `app/student/profile/profile-form.tsx:79-97` treats those fields plus CV as completion items, but completion is advisory. CV is a separate PDF-only upload at `profile-form.tsx:129-150` and `:186-220`. The apply action checks role, project openness, and duplicate applications only (`app/actions/projects.ts:103-135`); it never checks profile completeness or `cv_path`.
- **Why it matters:** students can apply with an empty profile and no CV, yet the page tells founders that applications come from a complete profile. This is the same root gap already owned for `/for-students` at `reports/page-audits/for-students.md:16-21`; it is included here because `/how-it-works` makes the same promise at different lines and is the route under audit.
- **Fix:** prefer enforcing the promise in `applyToProject` before `insertApplication`: load the student row, require the fields listed at `profile-form.tsx:81-88` plus a non-null `cv_path`, and return a clear message. If incomplete applications are intentionally allowed, rewrite `page.tsx:52`/`:77` to “A complete profile and CV help founders decide” and stop presenting completeness as the default path.

### F3 — MEDIUM — Closing CTA asks founders to bring a brief, then creates a student account

- **Where:** `app/how-it-works/page.tsx:358-363` — title “Start with one clear project”, lead “Bring a focused brief and meet students ready to build.”, action “Create student account” to `/signup`.
- **Evidence chain:** `app/actions/auth.ts:103-112` assigns every signup the `student` role and intentionally ignores any client role field. The founder-facing guide uses `/contact` with “Ask for founder access” at `app/for-founders/page.tsx:174`, and the page itself separates those audiences at `app/how-it-works/page.tsx:352-354` with “For founders”.
- **Why it matters:** a founder who follows the closing CTA lands in student signup and cannot post the brief the same section invites them to bring. `better-writing` flags the action label as misleading; `security-review` notes that the role cannot be corrected client-side by design.
- **Fix:** change `page.tsx:361-362` to `{ href: "/contact", label: "Ask for founder access" }` to match the founder-oriented lead, or change the lead/action to a student CTA, e.g. “Ready to build? Create a student account.” Do not add a client role switch to signup.

### F4 — MEDIUM — “CVs stay private” claim is narrower than the actual access rule

- **Where:** `app/how-it-works/page.tsx:88-89` — “opened through a checked link with access tied to a confirmed order.”
- **Evidence chain:** `app/api/cv/[id]/route.ts:48-57` gives admins unrestricted access through signed URLs. For founders, `:59-82` first allows access when the student applied to one of the founder's projects (`:63`); only if there is no such relationship does it check confirmed orders and shortlist rows (`:65-78`). Links are signed for 300 seconds (`:84-92`). `config/payment.ts:52` and `app/actions/shortlist-order.ts:156-193` confirm the admin payment-confirmation step, but they do not gate all CV reads.
- **Why it matters:** the page gives students a false sense that a confirmed paid order is the only founder path to their CV. The access is still checked and signed, so this is not an authorization defect; it is a privacy-description defect (`better-writing`, `security-review`).
- **Fix:** rewrite `page.tsx:89` to match the route, e.g. “Student CVs live in a private store and open only through short-lived checked links for admins, founders connected to an application, or founders with a confirmed shortlist order.” If the intended product rule is strictly “confirmed order only”, remove or gate the `hasApplicationToFounderProject` path at `route.ts:59-63` and add a test, but that would also change the application-review workflow.

### F5 — MEDIUM — After-shortlist copy skips admin finalization

- **Where:** `app/how-it-works/page.tsx:111-112` — “Once the order is confirmed, the ranked shortlist becomes available…”
- **Evidence chain:** `app/founder/shortlists/shortlists-client.tsx:304-307` tells an unlocked founder, “Payment confirmed. Your ranked shortlist will appear here as soon as the admin finalizes it.” Admin review/rank/verified actions exist at `app/actions/admin-students.ts:29-80` and `:86-161`; shortlist-order statuses are constrained in `neon/schema.sql:81`. The page itself acknowledges admin ranking at `app/how-it-works/page.tsx:107-108`, but `:112` collapses confirmation and release into one moment.
- **Why it matters:** a founder who pays expects an immediately visible shortlist. The UI adds an admin-finalization step, so the page sets the wrong expectation at the moment of payment. This is distinct from the live unlock-badge defect owned at `reports/page-audits/founder-shortlists.md:70`.
- **Fix:** change `page.tsx:112` to “Once the order is confirmed, an admin finalizes and ranks the shortlist; then the founder can review the selected students.” Keep `:107-108` as the first step or merge the two rows to avoid duplication.

## Suspected — not counted as findings; need product clarification or runtime confirmation

### S1 — LOW — “Students see the same status” is ambiguous and unsupported as written

- **Where:** `app/how-it-works/page.tsx:92-93` — “Orders stay pending until a person reviews the proof. Students see the same status in their applications.”
- `app/student/applications/applications-client.tsx:25-38` filters and labels only the application statuses `pending`, `shortlisted`, `accepted`, and `rejected`; `app/student/applications/page.tsx:26-31` maps `listStudentApplications` rows. No shortlist-order status or admin payment-confirmation status is rendered there.
- If “same status” means the order's pending/confirmed state, the claim is unsupported. If it means the separate application status, the sentence is misleading in a paragraph about payment confirmation. I could not confirm intent from the source.
- **Fix:** if order status should be visible to students, add it to `ApplicationsClient` from the order table; otherwise change the sentence to “Application status stays separate: pending, shortlisted, accepted, or rejected.” This is a copy/runtime clarification, not a defect count.

### S2 — LOW — Payment instructions are environment-dependent

- **Where:** `app/how-it-works/page.tsx:84-85` describes bank or mBoB transfer as the available payment path.
- `config/payment.ts:40-51` defaults both account number and mBoB number to empty strings, and `:60-62` defines `PAYMENT_CONFIGURED` as false until both are set. `reports/content-integrity.md:36` records that the shortlists UI gates new orders on this flag. Production may supply the values through environment variables, so the rendered pages can be accurate in deployment but inaccurate in a fresh local/default environment.
- **Fix:** gate the copy on the same flag used by the shortlists UI, or add “when payment details are configured” to `page.tsx:85`. Do not hardcode destination numbers into the page.

## Verified accurate / no new finding

| Area | Evidence | Verdict |
|---|---|---|
| Metadata | `app/how-it-works/page.tsx:24-29` uses `pageMetadata`; `lib/metadata.ts:23-41` and `app/layout.tsx:16` resolve canonical/OG to `https://bhutantech.bt/how-it-works`. Playwright returned title `How it works | Bhutan Tech Connect`, canonical/og URL `https://bhutantech.bt/how-it-works`, the expected description, and Organization JSON-LD. | Accurate. `reports/performance-seo.md:89-103` is stale here: current `app/layout.tsx:71-74` says manual duplicate title/description were removed, and the browser saw one title/description. |
| Internal links | `page.tsx:133-134`, `:262`, `:352-354`, and `:361` point to `/signup`, `/for-students`, `/faq`, `/for-founders`; all are registered in `components/marketing/nav.ts` and resolve in the browser. Findings F3 applies to the closing CTA's audience, not link validity. | Links resolve. |
| Chapter anchors | `guideChapters` at `page.tsx:97-103` matches rendered ids at `:142-144`, `:192`, `:234`, `:269`, and `:306`. `components/motion/chapter-progress.tsx:30-33` looks up those ids; Playwright confirmed all five anchors. | Accurate. |
| Heading/semantics | One `h1` from `components/marketing/guides/guide-hero.tsx:40`; five chapter `h2`s in `page.tsx`; item `h3`s at `:171`, `:216`, `:295`, `:333`; `main#main-content` at `:124` is the skip target. Decorative icons are `aria-hidden` at `:178-183`. | No new finding. |
| Focus and motion | Visible focus rings come from `guide-hero.tsx:9-10` and `cta-band.tsx:37-44`. `components/motion/pinned-scroll-chapter.tsx:39` pins only on desktop with no-preference; `components/motion/chapter-progress.tsx:9-13` keeps active state as plain text. Reduced-motion behavior is already covered by `reports/accessibility-critic.md`. | No new finding. |
| Responsive rendering | Playwright at 375px and 1440px found `scrollWidth === clientWidth`; grids collapse from `sm`/`lg`. Reflow/overflow checks are also owned by `reports/accessibility-critic.md:41` and `reports/visual-recheck.md`. | No new finding. |
| Photo credits | `page.tsx:135-137` and `:236-263` use registered Commons files; `components/ui/photo-credit.tsx:8-12` maps `Bhutanese_youth.jpg` to Doctor 17 / CC BY-SA 4.0 and `:18-22` maps `Bhutanese_Girls_in_National_Dress.jpg` to Christopher J. Fynn / CC BY-SA 3.0. The 11px credit typography issue is already owned at `reports/cold-eyes.md:22`. | No new finding. |
| Payment/admin protections | Admin-only payment confirmation with screenshot exists at `app/actions/shortlist-order.ts:156-193`; founders cannot confirm their own orders. Application and order statuses match `neon/schema.sql:39`, `:69`, `:81` and `app/actions/projects.ts:137-189`. F4 and S2 narrow the copy; the underlying protections are accurate and already traced in `reports/content-integrity.md:36-44`. | Accurate with copy caveats. |
| Data-layer authorization posture | `neon/schema.sql:3-4` explicitly has no RLS; authorization is enforced in application code. The app-only pattern is already owned by `reports/page-audits/founder-shortlists.md:92` (D1) and is not re-reported as a new route defect. | Reference only. |

## Overlap references

Per `reports/PROTOCOL.md`, repeated issues are referenced rather than duplicated:

- `reports/page-audits/for-students.md:16-21` owns the profile-completeness/apply gap; F2 restates the `/how-it-works` promise and fix at this route's lines only.
- `reports/page-audits/founder-shortlists.md:70` owns W1 (live unlock badge does not unlock server-rendered UI); F5 is the separate copy omission of admin finalization. `reports/page-audits/founder-shortlists.md:92` owns D1 (app-only authorization/no RLS).
- `reports/visual-recheck.md:25` owns the repeated left-heading/numbered-list pattern, including `/how-it-works:129` and `:292-308`; `reports/visual-critic.md:28` owns the earlier bento/ledger recipe. No duplicate UI finding is added here.
- `reports/copy-critic.md:24` owns the earlier vague-headline finding; the current page uses concrete audience language at `page.tsx:128-129` and `:198`. F3 is a CTA-audience mismatch, not a repeat of that headline issue.
- `reports/accessibility-critic.md:17,41` owns contrast and 320px/375px reflow; `reports/content-integrity.md:38-44` owns broader source-of-truth checks; `reports/brand-tokens.md:12` owns remaining token/easing cleanup.
- `reports/performance-seo.md:89-103` duplicate-metadata claim is stale against current `app/layout.tsx:71-74` and the browser result above.

## Limitations

- Playwright verified the unauthenticated public view only. Founder and student dashboard states were checked in source/actions, not in an authenticated browser session, so S1 and the runtime effect of F1/F2/F5 are partly static.
- Production environment values for `NEXT_PUBLIC_PAYMENT_ACCOUNT_NUMBER` and `NEXT_PUBLIC_PAYMENT_MBOB_NUMBER` were not available; S2 is therefore suspected rather than confirmed.
- Image alt wording was checked in the rendered DOM, not by visual inspection against the underlying photo content; no new alt finding is asserted.
- No build, test suite, schema migration, or server restart was run. Uncommitted user changes were left untouched.

## Bottom line

Five confirmed MEDIUM copy/workflow/privacy mismatches on `/how-it-works`, two LOW items needing product clarification, and no new HIGH, metadata, link, semantic, responsive, or console defect. The page's structure and shared shell are sound; the fixes are mostly small copy edits, except F1/F2 where server-side enforcement would make the copy true.
