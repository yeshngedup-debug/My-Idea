/**
 * Admin Dashboard — platform overview stats and recent payment orders.
 */
import Link from "next/link";
import {
  listRoleCounts,
  listProjectStatuses,
  listOrders,
} from "@/lib/neon-data";
import { WorkspaceHero } from "@/components/layout/workspace-hero";
import { Badge } from "@/components/ui/badge";
import {
  HoverLift,
  Reveal,
  StaggerGroup,
  StaggerItem,
} from "@/components/ui/motion";

export const metadata = { title: "Admin Dashboard | Bhutan Tech Connect" };

export default async function AdminDashboard() {
  const [profileCounts, projectStatuses, allOrders] = await Promise.all([
    listRoleCounts(),
    listProjectStatuses(),
    listOrders(),
  ]);

  const profiles = profileCounts.flatMap((c) => Array<string>(c.count).fill(c.role));
  const projects = projectStatuses.map((status) => ({ status }));
  const orders = allOrders;

  const totalUsers = profiles.length;
  const students = profiles.filter((role) => role === "student").length;
  const founders = profiles.filter((role) => role === "founder").length;
  const openProjects = projects.filter((p) => p.status === "open").length;
  const verifying = orders.filter((o) => o.status === "submitted").length;

  const stats = [
    {
      label: "Total members",
      value: totalUsers,
      detail: `${founders} founders · ${students} students`,
    },
    {
      label: "Student accounts",
      value: students,
      detail: null,
    },
    {
      label: "Open projects",
      value: openProjects,
      detail: `${projects.length} projects total`,
    },
    {
      label: "Payments to review",
      value: verifying,
      detail: "Awaiting confirmation",
    },
  ];

  return (
    <div className="space-y-8">
      <Reveal>
        <WorkspaceHero
          eyebrow="Platform operations"
          title="Platform overview"
          description="Members, projects and payments."
        />
      </Reveal>

      <Reveal>
        <dl className="border-t border-[#17352b]/10">
          {stats.map(({ label, value, detail }, index) => (
            <div
              key={label}
              className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[#17352b]/10 py-4"
            >
              <dt className="text-sm text-[#657069]">
                {label}
                {detail && (
                  <span className="mt-1 block text-xs text-[#657069] sm:mt-0 sm:ml-2 sm:inline">
                    {detail}
                  </span>
                )}
              </dt>
              <dd
                className={`tabular-nums tracking-tight text-[#17352b] ${
                  index === 0 ? "text-3xl font-semibold" : "text-xl font-medium"
                }`}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>

      {verifying > 0 && (
        <Reveal>
          <div
            role="status"
            className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3.5 text-sm text-[#17352b]"
          >
            <span>
              {verifying} payment{verifying === 1 ? "" : "s"} waiting for
              verification.
            </span>
            <Link
              href="/admin/payments"
              className="inline-flex shrink-0 items-center text-sm font-semibold text-[#b23c26] hover:text-[#17352b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] rounded"
            >
              Review payments
            </Link>
          </div>
        </Reveal>
      )}

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="min-w-0">
          <h3 className="mb-4 text-lg font-semibold tracking-tight text-[#17352b]">
            Recent payment orders
          </h3>
          {orders.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#ded8cb] bg-[#fffefa] px-6 py-8 text-sm text-[#657069]">
              No orders yet. Founder payments will appear here for review.
            </p>
          ) : (
            <StaggerGroup className="space-y-2.5">
              {orders.slice(0, 5).map((order) => (
                <StaggerItem key={order.id}>
                  <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-xl border border-[#ded8cb] bg-[#fffefa] px-4 py-3.5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#17352b]">
                        {order.package === "full" ? "Full Support" : "Basic"} shortlist
                        {order.amount != null
                          ? ` · Nu ${order.amount.toLocaleString("en-IN")}`
                          : ""}
                      </p>
                      <p className="mt-1 text-xs text-[#657069]">
                        {new Date(order.created_at).toLocaleDateString(
                          "en-GB",
                          { day: "numeric", month: "short" },
                        )}
                      </p>
                    </div>
                    <Badge className="capitalize border-[#ded8cb] bg-[#f5f2ea] text-[#17352b]">
                      {order.status}
                    </Badge>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          )}
        </div>

        <div className="min-w-0">
          <h3 className="mb-4 text-lg font-semibold tracking-tight text-[#17352b]">
            Quick links
          </h3>
          <StaggerGroup className="grid grid-flow-dense gap-px overflow-hidden rounded-xl border border-[#17352b]/10 bg-[#17352b]/10">
            {[
              { href: "/admin/students", title: "Students", description: "Rank and verify profiles" },
              { href: "/admin/payments", title: "Payments", description: "Confirm or reject orders" },
              { href: "/admin/projects", title: "Projects", description: "Review all listings" },
            ].map((item) => (
              <StaggerItem key={item.href} className="bg-[#fffefa]">
                <HoverLift>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between gap-3 px-4 py-4 text-sm font-semibold text-[#17352b] transition-colors hover:bg-[#f5f2ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26]"
                  >
                    <span>
                      {item.title}
                      <span className="mt-1 block text-xs font-normal text-[#657069]">
                        {item.description}
                      </span>
                    </span>
                  </Link>
                </HoverLift>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>
    </div>
  );
}
