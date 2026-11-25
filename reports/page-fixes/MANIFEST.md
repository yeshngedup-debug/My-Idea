# Per-page fix manifest

One agent owns each route below. The agent may **only edit the files listed for
its own route** plus its own report file. Everything else is read-only. This
prevents concurrent agents from clobbering each other.

The working tree is dirty and contains user work. Treat the current files as the
source of truth. Never run `git checkout`, `git reset`, `git stash`, or any
command that discards changes.

## Shared rules for every page agent

Before editing, read:

- `AGENTS.md` (Next.js 16 rules) and the relevant docs under
  `node_modules/next/dist/docs/01-app/` for the APIs you touch
  (especially `01-getting-started/03-layouts-and-pages.md`,
  `05-server-and-client-components.md`, `07-mutating-data.md`,
  `10-error-handling.md`).
- `design/brand-system.md`, `design/brand-guidelines.md`, `design/voice-guide.md`,
  `lib/design-tokens.ts`, `app/globals.css`.
- Your route's audit report in `reports/page-audits/` and the relevant sections
  of `reports/page-audits/CONSOLIDATED.md`. Audit findings are leads, not
  gospel: verify against the current file before acting. Reports may describe
  code that a previous fix pass already changed.

Work to do:

1. **UI / accessibility**: fix confirmed UI, layout, responsive, contrast,
   focus, naming, live-region, and status feedback issues in your owned files.
   Stay on the warm-paper / forest / vermilion / amber palette. Use existing
   tokens and components. No new dependencies, gradients, violet, emoji, or
   wholesale rewrites. Keep diffs small and purposeful.
2. **Workflow**: trace the page's interactions, server actions, redirects,
   status contracts, and empty/error/loading states. Fix bugs that live inside
   your owned files. If the bug lives in a shared file, do not edit it — record
   `file:line`, observed behavior, and the recommended fix in your report.
3. **Database**: verify the fields and queries this page relies on against
   `neon/schema.sql` and `lib/neon-data.ts`. Note stale status values, unbounded
   reads, missing indexes, ownership gaps, and copy that promises a rule the DB
   does not enforce. Do not edit DB files; record findings for the shared
   database agent.
4. **Report**: write `reports/page-fixes/<slug>.md` with:
   - files changed and a short bullet list of each change
   - checks performed (e.g. `npx eslint <owned files>`, source verification)
   - workflow findings routed to the workflow owner
   - database findings routed to the database owner
   - anything you deliberately did not change and why

Do not run a full `next build`, `npm test`, or a dev server; the orchestrator
runs those once at the end. Do not edit `MANIFEST.md` or another agent's report.

## File ownership

| Slug | Route | Audit | Owned files |
|---|---|---|---|
| `home` | `/` | `home.md` | `app/page.tsx` |
| `login` | `/login` | `login.md` | `app/(auth)/login/page.tsx`, `components/auth/login-form.tsx` |
| `signup` | `/signup` | `signup.md` | `app/(auth)/signup/page.tsx`, `components/auth/signup-form.tsx` |
| `about` | `/about` | `about.md` | `app/about/page.tsx` |
| `contact` | `/contact` | `contact.md` | `app/contact/page.tsx` |
| `faq` | `/faq` | `faq.md` | `app/faq/page.tsx` |
| `how-it-works` | `/how-it-works` | `how-it-works.md` | `app/how-it-works/page.tsx` |
| `privacy` | `/privacy` | `privacy.md` | `app/privacy/page.tsx` |
| `terms` | `/terms` | `terms.md` | `app/terms/page.tsx` |
| `public` | `/public` | `public.md` | `app/public/page.tsx` |
| `for-founders` | `/for-founders` | `for-founders.md` | `app/for-founders/page.tsx` |
| `for-students` | `/for-students` | `for-students.md` | `app/for-students/page.tsx` |
| `founder-overview` | `/founder` | `founder-overview.md` | `app/founder/page.tsx` |
| `founder-browse-projects` | `/founder/browse-projects` | `founder-browse-projects.md` | `app/founder/browse-projects/page.tsx`, `app/founder/browse-projects/browse-projects-client.tsx`, `app/founder/browse-projects/loading.tsx` |
| `founder-browse-students` | `/founder/browse-students` | `founder-browse-students.md` | `app/founder/browse-students/page.tsx`, `app/founder/browse-students/browse-client.tsx` |
| `founder-profile` | `/founder/profile` | `founder-profile.md` | `app/founder/profile/page.tsx`, `app/founder/profile/profile-client.tsx`, `app/founder/profile/profile-details.tsx`, `app/founder/profile/actions.ts`, `app/founder/profile/loading.tsx` |
| `founder-projects` | `/founder/projects` | `founder-projects.md` | `app/founder/projects/page.tsx`, `app/founder/projects/projects-client.tsx`, `app/founder/projects/error.tsx`, `app/founder/projects/loading.tsx` |
| `founder-projects-post` | `/founder/projects/post` | `founder-projects-post.md` | `app/founder/projects/post/page.tsx`, `app/founder/projects/post/post-project-form.tsx` |
| `founder-project-detail` | `/founder/projects/[id]` | `founder-project-detail.md` | `app/founder/projects/[id]/page.tsx`, `app/founder/projects/[id]/project-detail-client.tsx`, `app/founder/projects/[id]/error.tsx`, `app/founder/projects/[id]/loading.tsx` |
| `founder-shortlists` | `/founder/shortlists` | `founder-shortlists.md` | `app/founder/shortlists/page.tsx`, `app/founder/shortlists/shortlists-client.tsx`, `app/founder/shortlists/agreement/route.ts` |
| `founder-student-detail` | `/founder/students/[id]` | `founder-student-detail.md` | `app/founder/students/[id]/page.tsx`, `app/founder/students/[id]/shortlist-button.tsx` |
| `student-overview` | `/student` | `student-overview.md` | `app/student/page.tsx` |
| `student-applications` | `/student/applications` | `student-applications.md` | `app/student/applications/page.tsx`, `app/student/applications/applications-client.tsx` |
| `student-profile` | `/student/profile` | `student-profile.md` | `app/student/profile/page.tsx`, `app/student/profile/profile-form.tsx` |
| `student-projects` | `/student/projects` | `student-projects.md` | `app/student/projects/page.tsx`, `app/student/projects/projects-client.tsx` |
| `student-project-detail` | `/student/projects/[id]` | `student-project-detail.md` | `app/student/projects/[id]/page.tsx` |
| `admin-overview` | `/admin` | `admin-overview.md` | `app/admin/page.tsx`, `app/admin/admin-charts.tsx` |
| `admin-payments` | `/admin/payments` | `admin-payments.md` | `app/admin/payments/page.tsx`, `app/admin/payments/payments-client.tsx` |
| `admin-projects` | `/admin/projects` | `admin-projects.md` | `app/admin/projects/page.tsx`, `app/admin/projects/projects-client.tsx` |
| `admin-students` | `/admin/students` | `admin-students.md` | `app/admin/students/page.tsx`, `app/admin/students/admin-students-client.tsx` |

## Shared owners (phase 2, after all page reports exist)

- **Workflow owner**: `app/actions/*.ts` (except `app/founder/profile/actions.ts`),
  `app/api/**`, `proxy.ts`, their tests, and any server-side authorization or
  state-transition fix.
- **Database owner**: `lib/neon-data.ts`, `neon/schema.sql`, `supabase/**`,
  `scripts/neon-*.mjs`, and query/index/data-integrity fixes.
- **Design-system owner**: all other files under `components/**`,
  `app/globals.css`, `lib/design-tokens.ts`, `app/layout.tsx`, shared layouts,
  shared loading/error boundaries. This includes
  `components/marketing/site-header.tsx`,
  `components/interactive/segmented-control.tsx`,
  `components/ui/status-timeline.tsx`, `components/data/live-context.tsx`,
  `components/founder/live-order-status.tsx`,
  `components/interactive/animated-disclosure-list.tsx`,
  `components/auth/auth-shell.module.css`, and `components/auth/styles.ts`.
