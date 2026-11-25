# Per-page audit index

One read-only agent per route. Each agent checks UI design + accessibility, workflow, and database/data layer, then writes `reports/page-audits/<slug>.md`. No product source is edited by these agents.

Status legend: `pending` → `done` (updated after the agent reports back).

Consolidated rollup: `CONSOLIDATED.md` (totals, HIGH master list, and prioritized fix plan).

| Route | Report | Status |
|---|---|---|
| `/` | `home.md` | done |
| `/login` | `login.md` | done |
| `/signup` | `signup.md` | done |
| `/about` | `about.md` | done |
| `/contact` | `contact.md` | done |
| `/faq` | `faq.md` | done |
| `/how-it-works` | `how-it-works.md` | done |
| `/privacy` | `privacy.md` | done |
| `/terms` | `terms.md` | done |
| `/public` | `public.md` | done |
| `/for-founders` | `for-founders.md` | done |
| `/for-students` | `for-students.md` | done |
| `/founder` | `founder-overview.md` | done |
| `/founder/browse-projects` | `founder-browse-projects.md` | done |
| `/founder/browse-students` | `founder-browse-students.md` | done |
| `/founder/profile` | `founder-profile.md` | done |
| `/founder/projects` | `founder-projects.md` | done |
| `/founder/projects/post` | `founder-projects-post.md` | done |
| `/founder/projects/[id]` | `founder-project-detail.md` | done |
| `/founder/shortlists` | `founder-shortlists.md` | done |
| `/founder/students/[id]` | `founder-student-detail.md` | done |
| `/student` | `student-overview.md` | done |
| `/student/applications` | `student-applications.md` | done |
| `/student/profile` | `student-profile.md` | done |
| `/student/projects` | `student-projects.md` | done |
| `/student/projects/[id]` | `student-project-detail.md` | done |
| `/admin` | `admin-overview.md` | done |
| `/admin/payments` | `admin-payments.md` | done |
| `/admin/projects` | `admin-projects.md` | done |
| `/admin/students` | `admin-students.md` | done |
