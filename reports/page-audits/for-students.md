# Page audit — `/for-students`

Date: 2026-11-24. Role: read-only critic (`reports/PROTOCOL.md`). The only file written is this report. No product source, config, schema, test, or existing report was edited. Uncommitted working-tree changes were treated as authoritative; `app/for-students/page.tsx` itself is unmodified in `git status`.

## Scope and method

- Audited route: `app/for-students/page.tsx` (336 lines), plus the shared components it renders: `components/marketing/guides/guide-hero.tsx`, `components/marketing/guides/primitives.tsx`, `components/marketing/{site-header,site-footer,cta-band}.tsx`, `components/ui/{motion,photo-credit}.tsx`, `components/marketing/nav.ts`, `lib/metadata.ts`, `app/layout.tsx`.
- Claims traced into the data layer: `app/actions/{auth,projects,student-profile}.ts`, `lib/neon-data.ts`, `app/api/cv/[id]/route.ts`, `supabase/schema.sql`, `supabase/migrations/*.sql`, and `README.md`.
- Skills loaded and applied, with `reports/SKILL-ASSIGNMENTS.md` precedence (items 1–4 not assigned here, so the `better-*` evidence rules govern): `unslop`, `better-interface`, `better-layout`, `better-ui`, `better-writing`, `frontend-a11y`, `better-accessibility`, `webapp-testing`, `security-review`, `api-security-testing` (loaded from `C:\Users\DELL\.config\opencode\skills\strix\api-security-testing\SKILL.md`; the others from `~/.config/opencode/skills/<id>/SKILL.md`). `better-writing` governed copy judgement; `frontend-a11y` + `better-accessibility` governed WCAG checks; `webapp-testing` governed the runtime attempt; `security-review` + `api-security-testing` governed the authorization/data-layer trace.
- Reference docs read: `design/voice-guide.md`, `design/brand-guidelines.md`, `README.md`, installed Next.js docs (`app/getting-started/layouts-and-pages.mdx`, metadata/OG image, image optimization).

**Runtime limitation:** no dev server answered on `127.0.0.1:3000` or `:3001`, so Playwright MCP could not drive the page. This is a static audit of the current source. I did not start a server (only this report may be written) and did not run `npm run build` while a dev server might be starting. Desktop/mobile runtime evidence is taken from earlier reports and cited below rather than re-created. This model also cannot view image files, so hero-photo alt text could not be checked against the actual image.

## Confirmed findings

### F1 — MEDIUM — “Complete before you apply” is stated as a rule but is not enforced

- **Where:** `app/for-students/page.tsx:169` (“Fill in every field before you apply”), `:184` (“Complete before you apply”), and `:86` (“Send one application per project. Your profile and CV go with it.”).
- **Evidence chain:** the apply path checks only role, project openness, and duplicate applications — `app/actions/projects.ts:103-135` (`getProfileRole`, `project.status !== 'open'`, PostgreSQL `23505` handling at `:125-126`). The insert writes only `student_id`, `project_id`, `status` (`lib/neon-data.ts:380-393`; schema at `supabase/schema.sql:84-91`). The Apply button is disabled only for `applied || applying` (`app/student/projects/projects-client.tsx:165-166`). No check reads profile completeness or `cv_path` anywhere in the apply path.
- **Why it matters:** a student can sign up (`app/actions/auth.ts:85-137` creates an empty profile by default), skip the profile entirely, and apply successfully. The founder then receives an application whose profile and CV are missing, contradicting both the instruction on this page and the promise that the profile and CV accompany the application. `security-review` treats this as a workflow/trust-boundary gap: the marketing contract is not backed by a server-side invariant, so client changes or direct action calls bypass it.
- **Fix (choose one):** (a) enforce it in `applyToProject` — before `insertApplication`, load the student row and require all `profileFields` (`page.tsx:61-69`) plus a non-null `cv_path`, returning e.g. `Complete your profile and add a PDF CV before applying.`; or (b) if incompleteness is intentionally allowed, change the copy at `:169`/`:184`/`:86` to guidance rather than a gate, e.g. “A complete profile and CV help founders decide.” Option (a) matches the page's promise and the founder experience; prefer it.

No other confirmed findings. The remaining page content, layout, accessibility, metadata, and links are clean or covered by earlier reports (see below).

## Suspected — not counted as findings; need runtime confirmation

- **S1 — LOW (alt text):** `app/for-students/page.tsx:114` gives the hero image the alt “Young Bhutanese people in gho and kira working together at computers”, while the image is a credited Wikimedia stock photo (`page.tsx:115`, `components/ui/photo-credit.tsx:8-12`). I could not view `public/images/bhutanese-students.jpg` (this model has no image input), so I cannot confirm the photo depicts people at computers. If it does not, the alt misdescribes the image for screen-reader users (`frontend-a11y`). Verify the file, then tighten or generalize the alt.
- **S2 — LOW (returning-user CTA):** all three primary actions target `/signup` (`page.tsx:111`, `:171`, `:329`). A student who is already signed in and revisits this guide is sent to a signup form; `signUp` with an existing email returns the “exists” error (`app/actions/auth.ts:117-118`). I could not confirm the rendered outcome without an authenticated browser session, and this may be an intentional marketing default. If it is not, link signed-in students to `/student/profile` instead.

## Verified accurate — data-layer tracing (no finding)

| Claim on the page | Evidence | Verdict |
|---|---|---|
| Create a student account; no paywall implied (`page.tsx:111`, `:327-330`) | `app/actions/auth.ts:85-137` creates every user as `student` server-side (`:111`), with no payment step; `components/auth/signup-form.tsx` is a plain form. | Accurate |
| “PDF only, up to 5 MB, stored privately” (`page.tsx:68`, `:218-222`) | `app/actions/student-profile.ts:96-100` checks `application/pdf` and `5 * 1024 * 1024`; upload goes to the `cvs` bucket (`:105-107`); access is only through signed URLs in `app/api/cv/[id]/route.ts:50-56,84-92` with authorization at `:36-81`. `README.md:9` documents private Storage. | Accurate |
| “budget range, and deadline” before applying (`page.tsx:81`, `:316-318`) | `app/student/projects/projects-client.tsx:69-76,138,156` and `app/student/projects/[id]/page.tsx:62-77` render `budget_min`/`budget_max` and `deadline`. | Accurate |
| “one application per project” (`page.tsx:86`) | `supabase/schema.sql:90` `unique (student_id, project_id)`; duplicate is caught and messaged in `app/actions/projects.ts:125-126`. | Accurate |
| Statuses “pending to shortlisted, accepted, or rejected” (`page.tsx:91`) | `supabase/schema.sql:88` CHECK constraint; `app/actions/projects.ts:138` `APPLICATION_STATUSES`. | Accurate |
| “founders update project and applicant status” (`page.tsx:317-318`) | `app/actions/projects.ts:140-212` (`setProjectStatus`, `updateApplicationStatus`), owner-checked; RLS in `supabase/migrations/20261026000000_fix_projects_rls.sql:11,56`. | Accurate |
| “Your profile and CV go with it” (`page.tsx:86`) | The application references the student; the CV proxy grants the founder access on `hasApplicationToFounderProject` (`app/api/cv/[id]/route.ts:63`), so profile + CV are reachable with the application. Subject to F1 when the profile is empty. | Accurate in structure; see F1 |
| Metadata (`page.tsx:27-32`) | `lib/metadata.ts:23-41` sets canonical and Open Graph to the relative path; `app/layout.tsx:16` supplies `metadataBase = https://bhutantech.bt`, so they resolve to `https://bhutantech.bt/for-students`. `public/og-image.png` exists. | Accurate |
| CTA/internal links (`page.tsx:111-112`, `:171`, `:320`, `:329`) | `/signup` exists at `app/(auth)/signup/page.tsx`; `/how-it-works` and `/faq` exist and are shared nav routes (`components/marketing/nav.ts`). External credit links are registered in `components/ui/photo-credit.tsx:7-23`. | Accurate |

## UI and accessibility — static review, no new findings

- Landmark and heading structure: one `h1` from `components/marketing/guides/guide-hero.tsx:40`, five chapter `h2`s (`page.tsx:121,162,231,262,309`), item `h3`s (`:145,286`); `main#main-content` at `:99-102` is the skip target.
- Decorative icons are hidden from assistive tech (`page.tsx:138,194,210,288`); the numbered `<ol>` at `:274-303` carries real list semantics.
- Visible focus rings on every link/button (`guide-hero.tsx:9-10,49-61`; `components/marketing/guides/primitives.tsx`; `components/marketing/cta-band.tsx:37-44`).
- Responsive layout by construction: `px-5 sm:px-8 lg:px-12`, grids collapse below `lg` (`page.tsx:159,259`), `text-balance` headings, `overflow-x-clip` on `main` (`:101`).
- Text contrast: `#56645c` on `#f5f2ea` ≈ 5.6:1 and on `#fffefa` ≈ 6.2:1; `#b23c26` on `#f5f2ea` ≈ 5.3:1 — all AA for normal text, consistent with `reports/brand-tokens.md`.
- Runtime checks already passed elsewhere are **not** re-reported per `reports/PROTOCOL.md` rule 2: 320px/375px have no horizontal overflow and reduced-motion `Reveal` is static (`reports/accessibility-critic.md`); desktop sticky headings pin and release correctly and mobile reflow is clean (`reports/visual-recheck.md`); component relevance and per-page facts were already verified (`reports/component-relevance-audit.md`, `reports/content-integrity.md`); older bento/ledger issues in `reports/visual-critic.md` were superseded by the recheck.

## Overlap references

`reports/accessibility-critic.md`, `reports/visual-recheck.md`, `reports/visual-critic.md`, `reports/component-relevance-audit.md`, `reports/content-integrity.md`, `reports/copy-critic.md`, `reports/performance-seo.md`, `reports/brand-tokens.md`, `reports/orchestrator.md`, `reports/page-audits/INDEX.md`. F1 is new: none of those reports traces the profile-completeness claim to the apply action.

## Bottom line

One confirmed MEDIUM workflow/claim mismatch (F1), two LOW items that need runtime/image confirmation (S1, S2), and no confirmed visual, accessibility, metadata, link, or data-authorization defects on this route.
