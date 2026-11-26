/**
 * Founder Dashboard: the next action first, then project health, recent
 * projects and shortcuts.
 *
 * The session/role checks and the project read are unchanged. The applicant
 * figure is a read-only count from the existing per-project helper so the
 * headline is real; a failure removes only the number, never the page.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from '@/lib/auth';
import {
  getProfileRole,
  listProjectApplicants,
  listProjectsByFounder,
} from "@/lib/neon-data";
import { WorkspaceHero } from "@/components/layout/workspace-hero";
import { WorkspaceStats } from "@/components/layout/workspace-stats";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Founder Dashboard" };

const BHUTAN_TZ = "Asia/Thimphu";

/* Status pills use the project's semantic tokens, not one-off hex values. */
const PILL = {
  open: "border-border bg-secondary text-secondary-foreground",
  pending: "border-accent-deep/30 bg-accent-deep/10 text-accent-deep",
  active: "border-primary/30 bg-primary/10 text-primary",
  confirmed: "border-primary bg-primary text-primary-foreground",
  danger: "border-destructive/30 bg-destructive/10 text-accent-deep",
  neutral: "border-border bg-muted text-muted-foreground",
} as const;

const PILL_DOT = {
  open: "bg-accent-deep",
  pending: "bg-accent-deep",
  active: "bg-primary",
  confirmed: "bg-primary-foreground",
  danger: "bg-accent-deep",
  neutral: "bg-muted-foreground",
} as const;

type PillTone = keyof typeof PILL;

const PROJECT_TONE: Record<string, PillTone> = {
  open: "open",
  in_progress: "active",
  review: "pending",
  completed: "confirmed",
};

const PROJECT_LABEL: Record<string, string> = {
  in_progress: "In progress",
  review: "In review",
};

const ROW_LINK =
  "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded py-3.5 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep";

/** Render dates in Bhutan time, adding the year for projects from other years. */
function formatPostedDate(iso: string): string {
  const date = new Date(iso);
  const yearFormatter = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    timeZone: BHUTAN_TZ,
  });
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    timeZone: BHUTAN_TZ,
  };
  if (yearFormatter.format(date) !== yearFormatter.format(new Date())) {
    options.year = "numeric";
  }
  return new Intl.DateTimeFormat("en-GB", options).format(date);
}

function statusLabel(status: string): string {
  return (
    PROJECT_LABEL[status] ??
    status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")
  );
}

export default async function FounderDashboard() {
  const user = await getUser();

  if (!user) redirect("/login");

  // Identity comes from the session, and the role is re-read from the database
  // on every request — the same check the other founder pages perform.
  const role = await getProfileRole(user.id);
  if (role !== "founder") redirect("/");

  const rows = await listProjectsByFounder(user.id);
  const projects = rows.map((p) => ({
    id: p.id,
    title: p.title,
    status: p.status,
    created_at: p.created_at,
  }));

  // Additional read-only data for the action headline. A failed project read
  // is ignored for the count; the page keeps all of its existing behaviour.
  let newApplicants: number | null = null;
  try {
    const applicantLists = await Promise.all(
      projects.map((project) =>
        listProjectApplicants(project.id).catch(() => []),
      ),
    );
    newApplicants = applicantLists
      .flat()
      .filter((applicant) => applicant.status === "pending").length;
  } catch {
    newApplicants = null;
  }

  const openProjects = projects.filter(
    (project) => project.status === "open",
  ).length;
  const inProgressProjects = projects.filter(
    (project) => project.status === "in_progress",
  ).length;

  const stats = [
    { label: "Projects posted", value: projects.length, detail: null },
    { label: "Open projects", value: openProjects, detail: null },
    { label: "In progress", value: inProgressProjects, detail: null },
  ];

  const heroTitle =
    newApplicants === null
      ? "See who's applying to your projects"
      : newApplicants === 0
        ? "No new applicants to review"
        : `${newApplicants} new applicant${newApplicants === 1 ? "" : "s"} to review`;
  const heroDescription =
    newApplicants === 0
      ? "Open a project to read applications as soon as students apply."
      : "Open a project to read each application and move candidates forward.";

  return (
    <div className="space-y-8">
      <WorkspaceHero
        eyebrow="Founder workspace"
        title={heroTitle}
        description={heroDescription}
      >
        <Link
          href="/founder/projects"
          className="pressable inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-cta px-5 py-3 text-sm font-semibold text-cta-foreground transition-colors hover:bg-cta-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          Review applicants
        </Link>
        <Link
          href="/founder/projects/post"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-primary-foreground/35 px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#66bfbf]"
        >
          Post a project
        </Link>
      </WorkspaceHero>

      <WorkspaceStats stats={stats} />

      <section className="grid grid-cols-12 gap-6 lg:gap-8">
        <div className="col-span-12 min-w-0 lg:col-span-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-tight text-primary">
              Recent projects
            </h2>
            {projects.length > 0 && (
              <Link
                href="/founder/projects"
                className="inline-flex min-h-11 shrink-0 items-center rounded text-sm font-semibold text-primary hover:text-accent-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep"
              >
                View all
              </Link>
            )}
          </div>
          {projects.length === 0 ? (
            <EmptyState
              title="Post a brief to meet students"
              description="A clear scope and budget help students understand where they can contribute. Applicants will show up on the project page."
              action={
                <Link
                  href="/founder/projects/post"
                  className="inline-flex min-h-11 items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#d40054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep focus-visible:ring-offset-2"
                >
                  Create your first project
                </Link>
              }
            />
          ) : (
            <div className="divide-y divide-border border-y border-border">
              {projects.slice(0, 5).map((project) => {
                const tone = PROJECT_TONE[project.status] ?? "neutral";
                return (
                  <div key={project.id}>
                    <Link
                      href={`/founder/projects/${project.id}`}
                      className={ROW_LINK}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-primary">
                          {project.title}
                        </span>
                        <span className="mt-0.5 block text-xs tabular-nums text-body-secondary">
                          Posted {formatPostedDate(project.created_at)}
                        </span>
                      </span>
                      <Badge className={`shrink-0 gap-1.5 ${PILL[tone]}`}>
                        <span
                          aria-hidden="true"
                          className={`h-1.5 w-1.5 rounded-full ${PILL_DOT[tone]}`}
                        />
                        {statusLabel(project.status)}
                      </Badge>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="col-span-12 min-w-0 lg:col-span-4">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-primary">
            Go to
          </h2>
          <nav aria-label="Founder shortcuts" className="workspace-paper divide-y divide-border border-y border-border">
            {[
              { href: "/founder/browse-students", title: "Find talent", description: "Browse student profiles with CVs" },
              { href: "/founder/projects", title: "View applicants", description: "Open a brief to review its applicants" },
              { href: "/founder/shortlists", title: "Track shortlists", description: "Check payment and shortlist progress" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col gap-0.5 rounded py-3.5 text-sm font-medium text-primary transition-colors hover:text-accent-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep"
              >
                {item.title}
                <span className="text-xs font-normal text-body-secondary">
                  {item.description}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </section>
    </div>
  );
}
