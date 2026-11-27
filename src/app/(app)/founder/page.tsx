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
import { formatBhutanDate } from "@/lib/format";
import { projectStatusLabel } from "@/lib/status-labels";

export const metadata = { title: "Founder Dashboard" };

/* Status pills use the project's semantic tokens, not one-off hex values. */
const PILL = {
  open: "border-border bg-secondary text-secondary-foreground",
  pending: "border-accent-deep/30 bg-accent-deep/10 text-accent-deep",
  active: "border-accent/30 bg-accent/10 text-accent",
  confirmed: "border-accent bg-accent text-primary-foreground",
  danger: "border-destructive/30 bg-destructive/10 text-accent-deep",
  neutral: "border-border bg-muted text-muted-foreground",
} as const;

const PILL_DOT = {
  open: "bg-accent-deep",
  pending: "bg-accent-deep",
  active: "bg-accent",
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

const ROW_LINK =
  "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded py-3 transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep";

/** Same wording and time base as every other project date in the app. */
function formatPostedDate(iso: string): string {
  return formatBhutanDate(iso, "date unavailable");
}

function statusLabel(status: string): string {
  return projectStatusLabel(status);
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
  let pendingByProject = new Map<string, number>();
  try {
    const applicantLists = await Promise.all(
      projects.map((project) =>
        listProjectApplicants(project.id).catch(() => []),
      ),
    );
    newApplicants = applicantLists
      .flat()
      .filter((applicant) => applicant.status === "pending").length;
    pendingByProject = new Map(
      projects.map((project, index) => [
        project.id,
        (applicantLists[index] ?? []).filter(
          (applicant) => applicant.status === "pending",
        ).length,
      ]),
    );
  } catch {
    newApplicants = null;
    pendingByProject = new Map();
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

  // Exactly one next action: applicants to review wins, then a missing brief,
  // then posting another project.
  const nextAction =
    newApplicants !== null && newApplicants > 0
      ? {
          title: `${newApplicants} new applicant${newApplicants === 1 ? "" : "s"} to review`,
          description:
            "Open a project to read each application and move candidates forward.",
          action: "Review applicants",
          href: "/founder/projects",
        }
      : projects.length === 0
        ? {
            title: "Post a brief to meet students",
            description:
              "A clear scope and budget help students understand where they can contribute. Applicants will show up on the project page.",
            action: "Post a project",
            href: "/founder/projects/post",
          }
        : {
            title: "No new applicants to review",
            description:
              "Post another brief or browse student profiles that already have a CV.",
            action: "Post a project",
            href: "/founder/projects/post",
          };

  const secondaryAction =
    nextAction.href === "/founder/projects/post"
      ? { label: "Find talent", href: "/founder/browse-students" }
      : { label: "Post a project", href: "/founder/projects/post" };

  return (
    <div className="space-y-8">
      <WorkspaceHero
        eyebrow="Founder workspace"
        title="Founder dashboard"
        description="Your briefs, applicants and the next step to take."
      />

      {/* Block A — the single next action, ahead of the figures. */}
      <section
        aria-labelledby="founder-next-action-title"
        className="rounded-xl border border-accent/25 bg-card px-5 py-5 sm:px-6"
      >
        <p className="text-xs font-semibold text-accent-deep">Next action</p>
        <h2
          id="founder-next-action-title"
          className="mt-2 text-lg font-semibold text-accent"
        >
          {nextAction.title}
        </h2>
        <p className="mt-1 max-w-xl text-sm leading-6 text-body-secondary">
          {nextAction.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={nextAction.href}
            className="pressable inline-flex min-h-11 items-center justify-center rounded-md bg-cta px-5 py-2.5 text-sm font-semibold text-cta-foreground transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:bg-cta-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            {nextAction.action}
          </Link>
          <Link
            href={secondaryAction.href}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-border-strong bg-card px-5 py-2.5 text-sm font-semibold text-accent transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            {secondaryAction.label}
          </Link>
        </div>
      </section>

      <WorkspaceStats stats={stats} />

      <section className="grid grid-cols-12 gap-6 lg:gap-8">
        <div className="col-span-12 min-w-0 lg:col-span-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 className="text-lg font-semibold text-accent">
              Recent projects
            </h2>
            {projects.length > 0 && (
              <Link
                href="/founder/projects"
                className="inline-flex min-h-11 shrink-0 items-center rounded text-sm font-semibold text-accent transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:text-accent-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep"
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
                  className="pressable inline-flex min-h-11 items-center justify-center rounded-md border border-border-strong bg-card px-5 py-2.5 text-sm font-semibold text-accent transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                >
                  Create your first project
                </Link>
              }
            />
          ) : (
            <div className="divide-y divide-border border-y border-border">
              {projects.slice(0, 5).map((project) => {
                const tone = PROJECT_TONE[project.status] ?? "neutral";
                const pending = pendingByProject.get(project.id) ?? 0;
                return (
                  <div key={project.id}>
                    <Link
                      href={`/founder/projects/${project.id}`}
                      className={ROW_LINK}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-accent">
                          {project.title}
                        </span>
                        <span className="mt-0.5 block text-xs tabular-nums text-body-secondary">
                          Posted {formatPostedDate(project.created_at)}
                          {pending > 0
                            ? ` · ${pending} to review`
                            : ""}
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
          <h2 className="mb-4 text-lg font-semibold text-accent">
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
                className="flex min-h-11 flex-col justify-center gap-0.5 rounded py-3 text-sm font-medium text-accent transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:text-accent-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep"
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
