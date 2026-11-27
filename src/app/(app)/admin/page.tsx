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
import { EmptyState, ErrorState } from "@/components/ui/empty-state";
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
  "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 border-b border-border py-3 last:border-0";

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
      <section aria-label="Platform overview unavailable">
        <h1 className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-semibold leading-[1.15] text-accent text-balance">
          Platform overview
        </h1>
        <ErrorState
          className="mt-5"
          headingLevel="h2"
          title="Could not load platform overview"
          description="Try again in a moment."
          action={
            <Link
              href="/admin"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-card px-5 py-2.5 text-sm font-semibold text-accent transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:text-accent-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep focus-visible:ring-offset-2"
            >
              Try again
            </Link>
          }
        />
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
      {/* Header band: a heading and a purpose line, no decorative panel. */}
      <section aria-labelledby="admin-overview-title">
        <p className="text-xs font-medium text-body-secondary">Platform operations</p>
        <h1
          id="admin-overview-title"
          className="mt-1.5 text-[clamp(1.5rem,3.5vw,2.25rem)] font-semibold leading-[1.15] text-foreground text-balance"
        >
          Platform overview
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-body-secondary">
          {nextOrder
            ? `${verifying} payment${verifying === 1 ? "" : "s"} waiting. Start with the longest-waiting order below.`
            : "Members, projects and payment reviews at a glance."}
        </p>
      </section>

      {/* The review queue comes before the platform figures. */}
      {nextOrder ? (
        <section
          aria-labelledby="admin-next-review-title"
          className="rounded-xl border border-border bg-card px-5 py-4"
        >
          <p className="text-xs font-semibold text-destructive">
            Next payment to review
          </p>
          <h2
            id="admin-next-review-title"
            className="mt-1 break-words text-sm font-medium text-accent"
          >
            {orderSummary(nextOrder)}
          </h2>
          {verifying > 1 && (
            <p className="mt-0.5 text-xs text-body-secondary">
              {verifying - 1} more waiting behind this one
            </p>
          )}
          <Link
            href="/admin/payments"
            className="pressable mt-3 inline-flex min-h-11 items-center justify-center rounded-md bg-cta px-4 py-2.5 text-sm font-semibold text-cta-foreground transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:bg-cta-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            Review payment
          </Link>
        </section>
      ) : (
        <p className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm text-body-secondary">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-cta" />
          All caught up — no payments are waiting for review.
        </p>
      )}

      <WorkspaceStats stats={stats} />

      <AdminChartDefs />
      <section aria-labelledby="admin-visuals-title" className="space-y-4">
        <h2
          id="admin-visuals-title"
          className="text-lg font-semibold text-accent"
        >
          Platform data
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <RoleDonut counts={profileCounts} />
          <ProjectStageBars statuses={projectStatuses} />
        </div>
        <ActivityTrend
          projectDates={projectRows.map((p) => p.created_at)}
          orderDates={allOrders.map((o) => o.created_at)}
        />
      </section>

      <section className="grid grid-cols-12 gap-6 lg:gap-8">
        <div className="col-span-12 min-w-0 lg:col-span-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 className="text-lg font-semibold text-accent">
              Recent payment orders
            </h2>
            <Link
              href="/admin/payments"
              className="inline-flex min-h-11 shrink-0 items-center rounded text-sm font-semibold text-accent transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:text-accent-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-deep"
            >
              All orders
            </Link>
          </div>
          {orders.length === 0 ? (
            <EmptyState
              title="No orders to review yet"
              description="Founder shortlist payments will appear here once they submit a screenshot for checking."
              action={
                <Link
                  href="/admin/payments"
                  className="pressable inline-flex min-h-11 items-center justify-center rounded-md bg-cta px-5 py-2.5 text-sm font-semibold text-cta-foreground transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:bg-cta-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                >
                  Open payments
                </Link>
              }
            />
          ) : (
            <div className="border-y border-border">
              {orders.slice(0, 5).map((order) => {
                const tone = ORDER_TONE[order.status] ?? "neutral";
                return (
                  <div key={order.id} className={ORDER_ROW}>
                    <div className="min-w-0">
                      <p className="break-words text-sm font-medium tabular-nums text-accent">
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
          <h2 className="mb-4 text-lg font-semibold text-accent">
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
