/**
 * Student Dashboard: the next action first, then applications health, recent
 * applications and shortcuts.
 *
 * The session and role checks and the applications read are unchanged. The
 * skill-match figure comes from an additional read-only query so the headline
 * is never a made-up number; if that query fails, the page simply falls back
 * to action-led copy without a count.
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from '@/lib/auth';
import {
  getProfileRole,
  getStudentProfile,
  listOpenProjects,
  listStudentApplications,
  type Role,
} from "@/lib/neon-data";
import { WorkspaceHero } from "@/components/layout/workspace-hero";
import { WorkspaceStats } from "@/components/layout/workspace-stats";
import { Badge } from "@/components/ui/badge";
import {
  Reveal,
  StaggerGroup,
  StaggerItem,
} from "@/components/ui/motion";

export const metadata = { title: "Student Dashboard | Bhutan Tech Connect" };

const BHUTAN_TIME_ZONE = "Asia/Thimphu";

// Keep in sync with the applications list allow-list at
// app/student/applications/page.tsx:17-23 and
// app/student/applications/applications-client.tsx:27-35.
const APPLICATION_FILTER_VALUES = new Set([
  "all",
  "pending",
  "shortlisted",
  "accepted",
  "rejected",
]);

const ROLE_HOME: Partial<Record<Role, string>> = {
  founder: "/founder",
  admin: "/admin",
};

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

const APPLICATION_TONE: Record<string, PillTone> = {
  pending: "pending",
  shortlisted: "active",
  accepted: "confirmed",
  rejected: "danger",
};

const ROW_LINK =
  "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded py-3.5 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep";

function WorkspaceNotice({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section
      aria-labelledby="student-notice-title"
      className="rounded-2xl border border-border bg-card px-6 py-10 sm:px-9"
    >
      <h1
        id="student-notice-title"
        className="text-[clamp(1.75rem,4vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-primary text-balance"
      >
        {title}
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-body-secondary sm:text-base">
        {description}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {/* A full reload, not a cached client transition, retries this server render. */}
        <a
          href="/student"
          className="inline-flex min-h-11 items-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#244b3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep focus-visible:ring-offset-2"
        >
          Try again
        </a>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-lg border border-border px-5 py-3 text-sm font-medium text-primary transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep"
        >
          Go to home
        </Link>
      </div>
    </section>
  );
}

function formatAppliedDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "date unavailable";

  const yearFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: BHUTAN_TIME_ZONE,
    year: "numeric",
  });
  const sameYear =
    yearFormatter.format(date) === yearFormatter.format(new Date());

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: BHUTAN_TIME_ZONE,
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  }).format(date);
}

export default async function StudentDashboard() {
  const user = await getUser();

  if (!user) redirect("/login");

  // Identity and role come from the verified session and Neon, never from a
  // URL param. The proxy checks the same rule; this is defense in depth for
  // the data read below.
  let role: Role | null;
  try {
    role = await getProfileRole(user.id);
  } catch {
    return (
      <WorkspaceNotice
        title="We could not check your account"
        description="Your account details are not available right now. Try again in a moment."
      />
    );
  }

  if (role && role !== "student") {
    redirect(ROLE_HOME[role] ?? "/");
  }

  if (!role) {
    return (
      <WorkspaceNotice
        title="Finish setting up your account"
        description="Your account is not linked to a student profile yet. Try again after your profile is ready."
      />
    );
  }

  let applications: {
    id: string;
    status: string;
    created_at: string;
    project: { title: string } | null;
  }[];
  try {
    const appRows = await listStudentApplications(user.id);
    applications = appRows.map((a) => ({
      id: a.id,
      status: a.status,
      created_at: a.created_at,
      project: a.project,
    }));
  } catch {
    return (
      <WorkspaceNotice
        title="We could not load your applications"
        description="Your applications are not available right now. Try again in a moment."
      />
    );
  }

  // Additional read-only data for the action headline. A failure here does not
  // fail the page or change any of the authorization checks above.
  let skillMatchCount: number | null = null;
  try {
    const [profile, openProjects] = await Promise.all([
      getStudentProfile(user.id),
      listOpenProjects(),
    ]);
    const skills = new Set(
      (profile?.skills ?? [])
        .map((skill) => skill.trim().toLowerCase())
        .filter(Boolean),
    );
    skillMatchCount = openProjects.filter((project) =>
      (project.required_skills ?? []).some((skill) =>
        skills.has(skill.trim().toLowerCase()),
      ),
    ).length;
  } catch {
    // Keep the action-led headline; drop only the number.
    skillMatchCount = null;
  }

  const awaitingResponse = applications.filter(
    (application) => application.status === "pending",
  ).length;
  const acceptedApplications = applications.filter(
    (application) => application.status === "accepted",
  ).length;

  const stats = [
    { label: "Applications sent", value: applications.length, detail: null },
    { label: "Awaiting response", value: awaitingResponse, detail: null },
    { label: "Accepted", value: acceptedApplications, detail: null },
  ];

  const heroTitle =
    skillMatchCount === null
      ? "Find work that fits your skills"
      : skillMatchCount === 0
        ? "No open brief matches your skills yet"
        : `${skillMatchCount} project${skillMatchCount === 1 ? "" : "s"} match your skills`;
  const heroDescription =
    skillMatchCount === 0
      ? "Add your skills to see better matches, or browse every open brief."
      : "Open a brief, check the scope, then apply with your profile and CV.";

  const statusLabel = (status: string) =>
    status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div className="space-y-8">
      <Reveal>
        <WorkspaceHero
          eyebrow="Student workspace"
          title={heroTitle}
          description={heroDescription}
        >
          <Link
            href="/student/projects"
            className="pressable inline-flex min-h-11 items-center rounded-lg bg-cta px-5 py-3 text-sm font-semibold text-cta-foreground transition-colors hover:bg-cta-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            Browse projects
          </Link>
          <Link
            href="/student/profile"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-primary-foreground/35 px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            {skillMatchCount === 0 ? "Complete profile" : "Update profile"}
          </Link>
        </WorkspaceHero>
      </Reveal>

      <Reveal>
        <WorkspaceStats stats={stats} />
      </Reveal>

      <section className="grid grid-cols-12 gap-6 lg:gap-8">
        <div className="col-span-12 min-w-0 lg:col-span-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 className="min-w-0 text-lg font-semibold tracking-tight text-primary">
              Recent applications
            </h2>
            {applications.length > 0 && (
              <Link
                href="/student/applications"
                className="inline-flex min-h-11 shrink-0 items-center rounded text-sm font-semibold text-primary hover:text-accent-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep"
              >
                View all
              </Link>
            )}
          </div>
          {applications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-10">
              <h3 className="text-base font-semibold text-primary">
                Your first application starts here
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-body-secondary">
                Each brief you apply to will appear here with its current
                status, so you can see where you stand at a glance.
              </p>
              <Link
                href="/student/projects"
                className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#244b3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep focus-visible:ring-offset-2"
              >
                Browse open projects
              </Link>
            </div>
          ) : (
            <StaggerGroup className="divide-y divide-border border-y border-border">
              {applications.slice(0, 5).map((application) => {
                const tone = APPLICATION_TONE[application.status] ?? "neutral";
                return (
                  <StaggerItem key={application.id}>
                    <Link
                      href={
                        APPLICATION_FILTER_VALUES.has(application.status)
                          ? `/student/applications?status=${application.status}`
                          : "/student/applications"
                      }
                      className={ROW_LINK}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-primary">
                          {application.project?.title ?? "Project"}
                        </span>
                        <span className="mt-0.5 block text-xs tabular-nums text-body-secondary">
                          Applied {formatAppliedDate(application.created_at)}
                        </span>
                      </span>
                      <Badge className={`shrink-0 gap-1.5 ${PILL[tone]}`}>
                        <span
                          aria-hidden="true"
                          className={`h-1.5 w-1.5 rounded-full ${PILL_DOT[tone]}`}
                        />
                        {statusLabel(application.status)}
                      </Badge>
                    </Link>
                  </StaggerItem>
                );
              })}
            </StaggerGroup>
          )}
        </div>

        <div className="col-span-12 min-w-0 lg:col-span-4">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-primary">
            Go to
          </h2>
          <nav aria-label="Student shortcuts" className="workspace-paper divide-y divide-border border-y border-border">
            {[
              { href: "/student/projects", title: "Browse projects", description: "Open briefs you can apply to" },
              { href: "/student/applications", title: "Track applications", description: "See where each one stands" },
              { href: "/student/profile", title: "Complete profile", description: "Keep your details and CV current" },
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
