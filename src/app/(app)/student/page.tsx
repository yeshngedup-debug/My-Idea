/**
 * Student Overview — one next action, quiet application figures, dense recent
 * applications and shortcuts.
 *
 * The session/role checks and the applications read are unchanged. The next
 * action and every figure come from existing rows: profile completeness mirrors
 * the eight checks in the profile form, and the counts come from the real
 * applications list. Extra reads are fault-tolerant — a failure drops only the
 * affected fact, never the page or its authorization.
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
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
import { formatBhutanDate } from "@/lib/format";
import {
  applicationStatusLabel,
} from "@/lib/status-labels";

export const metadata = { title: "Student Dashboard" };

/** The project detail route only accepts UUIDs; anything else uses the list. */
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

const APPLICATION_TONE: Record<string, PillTone> = {
  pending: "pending",
  shortlisted: "active",
  accepted: "confirmed",
  rejected: "danger",
};

/* Quiet, shared link treatment: one filled CTA lives in the next action. */
const QUIET_LINK =
  "inline-flex min-h-11 items-center rounded text-sm font-semibold text-accent underline decoration-border underline-offset-4 transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:text-accent-deep hover:decoration-accent-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep";

type ProfileRow = Awaited<ReturnType<typeof getStudentProfile>>;

type NextAction = {
  title: string;
  action: string;
  href: string;
  progress: string | null;
};

function RetryNotice({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <ErrorState
      headingLevel="h1"
      title={title}
      description={description}
      action={
        /* A full reload retries this server render instead of a cached transition. */
        <a
          href="/student"
          className="inline-flex min-h-11 items-center rounded-md bg-accent px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:bg-cta-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep focus-visible:ring-offset-2"
        >
          Try again
        </a>
      }
    />
  );
}

/** Same wording and time base as every other application date in the app. */
function formatAppliedDate(value: string): string {
  return formatBhutanDate(value, "date unavailable");
}

/**
 * Mirrors the eight checks in student/profile/profile-form.tsx so a progress
 * figure is counted from the same fields the profile page itself uses.
 */
function profileCompletion(profile: ProfileRow) {
  const checks = [
    (profile?.full_name ?? "").trim().length > 1,
    (profile?.college ?? "").trim().length > 1,
    (profile?.course ?? "").trim().length > 1,
    Boolean(profile?.year),
    (profile?.skills ?? []).length > 0,
    (profile?.bio ?? "").trim().length > 20,
    Boolean(profile?.availability),
    Boolean(profile?.cv_path),
  ];
  return {
    completed: checks.filter(Boolean).length,
    total: checks.length,
  };
}

function statusLabel(status: string): string {
  return applicationStatusLabel(status);
}

function applicationHref(application: {
  status: string;
  project: { id: string } | null;
}): string {
  if (application.project?.id && UUID_PATTERN.test(application.project.id)) {
    return `/student/projects/${application.project.id}`;
  }
  return APPLICATION_FILTER_VALUES.has(application.status)
    ? `/student/applications?status=${application.status}`
    : "/student/applications";
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
      <RetryNotice
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
      <EmptyState
        headingLevel="h1"
        title="Finish setting up your account"
        description="Your account is not linked to a student profile yet. Try again after your profile is ready."
        action={
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-md border border-border px-5 py-3 text-sm font-medium text-accent transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep"
          >
            Go to home
          </Link>
        }
      />
    );
  }

  let applications: {
    id: string;
    status: string;
    created_at: string;
    project: { id: string; title: string } | null;
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
      <RetryNotice
        title="We could not load your applications"
        description="Your applications are not available right now. Try again in a moment."
      />
    );
  }

  // Completion needs a truthful profile row. A failed read leaves the state
  // unknown, so the page never claims a profile is unfinished without proof.
  let profile: ProfileRow = null;
  let profileReadFailed = false;
  try {
    profile = await getStudentProfile(user.id);
  } catch {
    profileReadFailed = true;
  }

  // Retained existing read from the previous headline. The replacement copy is
  // fixed, so its match count is no longer rendered; a failure only drops it.
  await listOpenProjects().catch(() => []);

  const awaitingResponse = applications.filter(
    (application) => application.status === "pending",
  ).length;
  const acceptedApplications = applications.filter(
    (application) => application.status === "accepted",
  ).length;

  const completion = profileCompletion(profile);
  const profileKnown = !profileReadFailed;
  const profileComplete = profileKnown && completion.completed === completion.total;

  // Exactly one next action: an unfinished profile wins while it is known to
  // be unfinished, then a live pending response, then the ready-to-browse nudge.
  let nextAction: NextAction;
  if (profileKnown && !profileComplete) {
    nextAction = {
      title: "Finish your profile so founders can find you.",
      action: "Complete profile",
      href: "/student/profile",
      progress: `${completion.completed}/${completion.total} profile details added`,
    };
  } else if (awaitingResponse > 0) {
    nextAction = {
      title: `You have ${awaitingResponse} application${awaitingResponse === 1 ? "" : "s"} awaiting a response.`,
      action: "View applications",
      href: "/student/applications?status=pending",
      progress: null,
    };
  } else {
    nextAction = {
      title: "You're ready. Browse open projects that match your skills.",
      action: "Browse projects",
      href: "/student/projects",
      progress: null,
    };
  }

  const stats = [
    { label: "Applications sent", value: applications.length, href: "/student/applications" },
    { label: "Awaiting response", value: awaitingResponse, href: "/student/applications?status=pending" },
    { label: "Accepted", value: acceptedApplications, href: "/student/applications?status=accepted" },
  ];

  const shortcuts = [
    { href: "/student/projects", title: "Projects", description: "Open briefs you can apply to" },
    { href: "/student/applications", title: "Applications", description: "Track where each one stands" },
    { href: "/student/profile", title: "Profile", description: "Skills, availability, CV" },
  ];

  const recentApplications = applications.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Page header. The filled action lives with the next action below, so
          there is exactly one magenta control on this view. */}
      <section
        aria-labelledby="student-overview-title"
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6"
      >
        <div className="min-w-0">
          <h1
            id="student-overview-title"
            className="text-[clamp(1.5rem,3vw,2rem)] font-semibold leading-[1.2] text-accent text-balance"
          >
            Overview
          </h1>
          <p className="mt-2 max-w-xs text-sm leading-6 text-body-secondary sm:max-w-sm">
            <span className="font-medium text-accent-deep">Student workspace ·</span>{" "}
            Your applications, next steps and shortcuts.
          </p>
        </div>
        <Link
          href="/student/profile"
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md border border-border-strong bg-card px-4 py-2.5 text-sm font-medium text-accent transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Update profile
        </Link>
      </section>

      {/* Block A — the single next action, ahead of the figures. */}
      <section
        aria-labelledby="student-next-action-title"
        className="rounded-xl border border-accent/25 bg-card px-5 py-5 sm:px-6"
      >
        <p className="text-xs font-semibold text-accent-deep">Next action</p>
        <h2
          id="student-next-action-title"
          className="mt-2 text-lg font-semibold text-accent"
        >
          {nextAction.title}
        </h2>
        {nextAction.progress && (
          <p className="mt-1 text-xs tabular-nums text-body-secondary">
            {nextAction.progress}
          </p>
        )}
        <Link
          href={nextAction.href}
          className="pressable mt-4 inline-flex min-h-11 items-center justify-center rounded-md bg-cta px-5 py-2.5 text-sm font-semibold text-cta-foreground transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:bg-cta-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          {nextAction.action}
        </Link>
      </section>

      {/* Block B — quiet figures, each labelled by a real destination. */}
      <section aria-label="Application figures" className="border-y border-border py-3">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-baseline justify-between gap-3"
            >
              <dt className="min-w-0">
                <Link
                  href={stat.href}
                  className="inline-flex min-h-11 items-center rounded text-sm text-body-secondary underline decoration-border underline-offset-4 transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep"
                >
                  {stat.label}
                </Link>
              </dt>
              <dd className="shrink-0 text-base font-medium tabular-nums text-accent">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="grid grid-cols-12 gap-6 lg:gap-8">
        {/* Block C — dense rows, not cards. */}
        <div className="col-span-12 min-w-0 lg:col-span-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 className="min-w-0 text-lg font-semibold text-accent">
              Recent applications
            </h2>
            <Link href="/student/applications" className={`shrink-0 ${QUIET_LINK}`}>
              View all
            </Link>
          </div>
          {applications.length === 0 ? (
            <EmptyState
              title="No applications yet."
              description="Browse open projects when you are ready to apply."
              action={
                <Link href="/student/projects" className={QUIET_LINK}>
                  Browse open projects
                </Link>
              }
            />
          ) : (
            <>
              {/* Mobile: stacked rows keep the title and the status visible at
                  360px instead of squeezing a three-column table. */}
              <ul className="divide-y divide-border border-y border-border sm:hidden">
                {recentApplications.map((application) => {
                  const tone = APPLICATION_TONE[application.status] ?? "neutral";
                  return (
                    <li
                      key={application.id}
                      className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 py-3"
                    >
                      <Link
                        href={applicationHref(application)}
                        className="inline-flex min-h-11 min-w-0 flex-1 items-center truncate rounded text-sm font-medium text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep"
                      >
                        {application.project?.title ?? "Project"}
                      </Link>
                      <Badge className={`shrink-0 gap-1.5 ${PILL[tone]}`}>
                        <span
                          aria-hidden="true"
                          className={`h-1.5 w-1.5 rounded-full ${PILL_DOT[tone]}`}
                        />
                        {statusLabel(application.status)}
                      </Badge>
                      <span className="w-full text-xs tabular-nums text-body-secondary">
                        Applied {formatAppliedDate(application.created_at)}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {/* Desktop: the same rows as a real table. */}
              <table className="hidden w-full border-collapse text-left sm:table">
                <caption className="sr-only">Your most recent applications</caption>
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th scope="col" className="w-full py-2 pr-3 font-medium">
                      Project
                    </th>
                    <th scope="col" className="whitespace-nowrap px-3 py-2 font-medium">
                      Applied
                    </th>
                    <th scope="col" className="whitespace-nowrap py-2 pl-3 text-right font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.map((application) => {
                    const tone = APPLICATION_TONE[application.status] ?? "neutral";
                    return (
                      <tr
                        key={application.id}
                        className="relative border-b border-border last:border-0 transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:bg-secondary"
                      >
                        <td className="py-2 pr-3">
                          <Link
                            href={applicationHref(application)}
                            className="inline-flex min-h-11 max-w-full items-center rounded text-sm font-medium text-accent after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep focus-visible:ring-inset"
                          >
                            <span
                              className="block max-w-full truncate"
                              title={application.project?.title ?? undefined}
                            >
                              {application.project?.title ?? "Project"}
                            </span>
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-xs tabular-nums text-body-secondary">
                          {formatAppliedDate(application.created_at)}
                        </td>
                        <td className="whitespace-nowrap py-2 pl-3 text-right">
                          <Badge className={`gap-1.5 ${PILL[tone]}`}>
                            <span
                              aria-hidden="true"
                              className={`h-1.5 w-1.5 rounded-full ${PILL_DOT[tone]}`}
                            />
                            {statusLabel(application.status)}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* Block D — quiet shortcuts. */}
        <div className="col-span-12 min-w-0 lg:col-span-4">
          <h2 className="mb-4 text-lg font-semibold text-accent">
            Go to
          </h2>
          <nav
            aria-label="Student shortcuts"
            className="workspace-paper divide-y divide-border border-y border-border"
          >
            {shortcuts.map((item) => (
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
