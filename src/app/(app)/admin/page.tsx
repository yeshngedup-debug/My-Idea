/**
 * Admin Dashboard — the next review first, then platform overview stats and
 * recent payment orders.
 *
 * Server-only: every number on this page comes from a typed Neon helper and
 * the visuals in ./admin-charts derive from the same rows. No client motion
 * wrapper is used here, so the page hydrates no JS and its figures are always
 * present (including in reduced-motion mode and full-page captures).
 */
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from '@/lib/auth';
import {
  getProfileRole,
  listRoleCounts,
  listProjectStatuses,
  listAllProjectsWithDetails,
  listOrders,
} from "@/lib/neon-data";
import { WorkspaceStats } from "@/components/layout/workspace-stats";
import { Badge } from "@/components/ui/badge";
import {
  AdminChartDefs,
  RoleDonut,
  ProjectStageBars,
  ActivityTrend,
} from "./admin-charts";

export const metadata = { title: "Admin Dashboard" };

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

const ORDER_TONE: Record<string, PillTone> = {
  submitted: "active",
  pending: "pending",
  confirmed: "confirmed",
  rejected: "danger",
};

const ORDER_LABEL: Record<string, string> = {
  submitted: "Verifying payment",
  pending: "Awaiting payment",
};

const ORDER_ROW =
  "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 border-b border-border py-3.5 last:border-0";

/** Defense in depth: proxy.ts protects the route, the page re-checks the role. */
async function requireAdminPage(): Promise<void> {
  const user = await getUser();
  if (!user) redirect("/login");

  // A failed role lookup must fail the render, never fall back to a role.
  const role = await getProfileRole(user.id);
  if (role !== "admin") redirect("/");
}

function orderSummary(order: {
  package: string;
  amount: number | null;
  created_at: string;
}): string {
  const amount =
    typeof order.amount === "number" && Number.isFinite(order.amount)
      ? ` · Nu ${order.amount.toLocaleString("en-IN")}`
      : "";
  const date = new Date(order.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  return `${order.package === "full" ? "Full Support" : "Basic"} shortlist${amount} · ${date}`;
}

function orderLabel(status: string): string {
  return (
    ORDER_LABEL[status] ??
    status.charAt(0).toUpperCase() + status.slice(1)
  );
}

export default async function AdminDashboard() {
  await requireAdminPage();

  const overview = await Promise.all([
    listRoleCounts(),
    listProjectStatuses(),
    listAllProjectsWithDetails(),
    listOrders(),
  ]).then(
    ([profileCounts, projectStatuses, projectRows, allOrders]) => ({
      ok: true as const,
      profileCounts,
      projectStatuses,
      projectRows,
      allOrders,
    }),
    (error: unknown) => ({ ok: false as const, error }),
  );

  if (!overview.ok) {
    // Logged on the server; the admin gets a retryable message, not a stack.
    console.error("[admin] Failed to load platform overview", overview.error);
    return (
      <section
        aria-label="Platform overview unavailable"
        className="rounded-2xl border border-destructive/25 bg-destructive/10 px-6 py-10"
      >
        <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-primary text-balance">
          Platform overview
        </h1>
        <p role="alert" className="mt-3 max-w-lg text-sm leading-6 text-ink-soft">
          Could not load platform overview. Try again in a moment.
        </p>
        <a
          href="/admin"
          className="mt-4 inline-flex min-h-9 items-center rounded border border-border px-4 text-sm font-semibold text-primary hover:text-accent-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep"
        >
          Try again
        </a>
      </section>
    );
  }

  const { profileCounts, projectStatuses, projectRows, allOrders } = overview;
  const countByRole = (role: string) =>
    profileCounts.find((row) => row.role === role)?.count ?? 0;
  const students = countByRole("student");
  const founders = countByRole("founder");
  const admins = countByRole("admin");
  const otherMembers = profileCounts
    .filter(
      (row) =>
        row.role !== "student" &&
        row.role !== "founder" &&
        row.role !== "admin",
    )
    .reduce((sum, row) => sum + Math.max(0, row.count), 0);
  const totalUsers = profileCounts.reduce(
    (sum, row) => sum + Math.max(0, row.count),
    0,
  );
  const memberBreakdown = [
    `${founders} founders`,
    `${students} students`,
    ...(admins > 0 ? [`${admins} admins`] : []),
    ...(otherMembers > 0 ? [`${otherMembers} other`] : []),
  ].join(" · ");
  const totalProjects = projectStatuses.length;
  const openProjects = projectStatuses.filter((status) => status === "open").length;
  const orders = allOrders;
  const pendingOrders = orders.filter(
    (order) => order.status === "submitted" || order.status === "pending",
  );
  const verifying = pendingOrders.length;
  // listOrders is newest-first; the longest-waiting row is the next to review.
  const nextOrder = pendingOrders[pendingOrders.length - 1] ?? null;

  const stats = [
    {
      label: "Total members",
      value: totalUsers,
      detail: memberBreakdown,
    },
    {
      label: "Open projects",
      value: openProjects,
      detail: `${totalProjects} projects total`,
    },
    {
      label: "Payments to review",
      value: verifying,
      detail: "Awaiting review",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Local hero: CSS background instead of next/image keeps this route
          free of client-side image machinery (and its hydration warning). */}
      <section
        aria-label="Platform operations"
        className="relative isolate overflow-hidden rounded-2xl border border-primary/10 bg-primary px-6 py-8 text-primary-foreground sm:px-9 sm:py-10"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-cover bg-center opacity-35 brightness-[0.65] saturate-110"
          style={{ backgroundImage: "url('/images/bhutanese-community.jpg')" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0b2e2e] via-[#0b2e2e]/90 to-[#0b2e2e]/70"
        />
        <div className="relative z-10 min-w-0 max-w-3xl">
          <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-white text-balance">
            {nextOrder ? "Review the next payment" : "Platform overview"}
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-primary-foreground/75 sm:text-base">
            <span className="font-medium text-[#66bfbf]/90">Platform operations ·</span>{" "}
            {nextOrder
              ? `${verifying} payment${verifying === 1 ? "" : "s"} waiting. Start with the longest-waiting order below.`
              : "Members, projects and payment reviews at a glance."}
          </p>
        </div>
        <div className="relative z-10 mt-8 border-t border-primary-foreground/15 pt-3 sm:absolute sm:bottom-5 sm:right-6 sm:mt-0 sm:border-0 sm:pt-0">
          {/* Admin dashboard carries no photo credit; attribution lives in the
              site footer. */}
        </div>
      </section>

      <WorkspaceStats stats={stats} />

      <AdminChartDefs />
      <section aria-label="Platform data visuals" className="space-y-4">
        <h2 className="sr-only">Platform data by role, stage and month</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <RoleDonut counts={profileCounts} />
          <ProjectStageBars statuses={projectStatuses} />
        </div>
        <ActivityTrend
          projectDates={projectRows.map((p) => p.created_at)}
          orderDates={allOrders.map((o) => o.created_at)}
        />
      </section>

      {nextOrder ? (
        <section
          role="status"
          className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-xl border border-accent-deep/30 bg-accent-deep/10 px-5 py-4"
        >
          <div className="min-w-0">
            <p className="text-xs font-semibold text-accent-deep">
              Next payment to review
            </p>
            <p className="mt-1 break-words text-sm font-medium text-primary">
              {orderSummary(nextOrder)}
            </p>
            {verifying > 1 && (
              <p className="mt-0.5 text-xs text-body-secondary">
                {verifying - 1} more waiting behind this one
              </p>
            )}
          </div>
          <Link
            href="/admin/payments"
            className="pressable inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#d40054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep focus-visible:ring-offset-2"
          >
            Review payment
          </Link>
        </section>
      ) : (
        <p
          role="status"
          className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm text-body-secondary"
        >
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
          All caught up — no payments are waiting for review.
        </p>
      )}

      <section className="grid grid-cols-12 gap-6 lg:gap-8">
        <div className="col-span-12 min-w-0 lg:col-span-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-tight text-primary">
              Recent payment orders
            </h2>
            <Link
              href="/admin/payments"
              className="inline-flex min-h-11 shrink-0 items-center rounded text-sm font-semibold text-primary hover:text-accent-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep"
            >
              All orders
            </Link>
          </div>
          {orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-10">
              <h3 className="text-base font-semibold text-primary">
                No orders to review yet
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-body-secondary">
                Founder shortlist payments will appear here once they submit a
                screenshot for checking.
              </p>
              <Link
                href="/admin/payments"
                className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#d40054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep focus-visible:ring-offset-2"
              >
                Open payments
              </Link>
            </div>
          ) : (
            <div className="border-y border-border">
              {orders.slice(0, 5).map((order) => {
                const tone = ORDER_TONE[order.status] ?? "neutral";
                return (
                  <div key={order.id} className={ORDER_ROW}>
                    <div className="min-w-0">
                      <p className="break-words text-sm font-medium tabular-nums text-primary">
                        {orderSummary(order)}
                      </p>
                    </div>
                    <Badge className={`justify-self-end gap-1.5 ${PILL[tone]}`}>
                      <span
                        aria-hidden="true"
                        className={`h-1.5 w-1.5 rounded-full ${PILL_DOT[tone]}`}
                      />
                      {orderLabel(order.status)}
                    </Badge>
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
          <nav
            aria-label="Admin shortcuts"
            className="workspace-paper divide-y divide-border border-y border-border"
          >
            {[
              {
                href: "/admin/students",
                title: "Verify students",
                description: "Rank and verify profiles",
              },
              {
                href: "/admin/payments",
                title: "Confirm payment",
                description: "Confirm or reject orders",
              },
              {
                href: "/admin/projects",
                title: "Review projects",
                description: "Review all listings",
              },
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
