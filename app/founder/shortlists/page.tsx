/**
 * Founder Premium Shortlists — manual payment MVP.
 * Packages, payment instructions, screenshot upload and order status
 * are handled by the client component; this page owns data loading.
 */
import { createClient } from "@/lib/supabase/server";
import {
  listFounderOrders,
  listProjectsByFounder,
  listFounderShortlists,
  listStudentProfiles,
} from "@/lib/neon-data";
import { sealFounderOrders, type LiveOrderRow } from "@/lib/neon-realtime";
import { PinnedHeadingSection } from "@/components/layout/pinned-heading-section";
import { WorkspacePageHeading } from "@/components/layout/workspace-page-heading";
import { LiveOrderStatus } from "@/components/founder/live-order-status";
import { StatusTimeline, ORDER_STEPS } from "@/components/ui/status-timeline";
import {
  ShortlistsClient,
  type OrderRow,
  type ShortlistStudent,
} from "./shortlists-client";

export const metadata = { title: "Premium Shortlist | Bhutan Tech Connect" };

export default async function FounderShortlistsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let orders: OrderRow[] = [];
  let students: ShortlistStudent[] = [];
  let projects: { id: string; title: string }[] = [];
  let live: {
    sealedQuery: Awaited<ReturnType<typeof sealFounderOrders>>;
    initialData: LiveOrderRow[];
    url: string;
  } | null = null;

  if (user) {
    // Orders and projects are independent — one round-trip.
    const [orderRows, projectRows] = await Promise.all([
      listFounderOrders(user.id),
      listProjectsByFounder(user.id),
    ]);

    orders = orderRows.map((o) => ({
      id: o.id,
      package: o.package,
      amount: o.amount,
      status: o.status,
      screenshot_path: o.screenshot_path,
      project_id: o.project_id,
      created_at: o.created_at,
    }));
    projects = projectRows.map((p) => ({ id: p.id, title: p.title }));

    const realtimeUrl = process.env.NEXT_PUBLIC_NEON_REALTIME_URL;
    if (realtimeUrl) {
      try {
        const sealedQuery = await sealFounderOrders(user.id);
        live = {
          sealedQuery,
          initialData: orderRows.map((o) => ({
            id: o.id,
            status: o.status,
            package: o.package,
            project_id: o.project_id,
            created_at: o.created_at,
          })),
          url: realtimeUrl,
        };
      } catch (error) {
        // Degrade to the server-loaded rows, but never hide the failure.
        console.warn(
          '[founder/shortlists] Live order status unavailable; showing server-loaded status.',
          error,
        );
      }
    }

    // A general order (no project) unlocks all rows; a project-specific
    // order unlocks only that project's shortlist rows.
    const confirmedProjectIds = new Set(
      orders
        .filter((o) => o.status === "confirmed" && o.project_id)
        .map((o) => o.project_id as string),
    );
    const generalUnlocked = orders.some(
      (o) => o.status === "confirmed" && !o.project_id,
    );

    if (generalUnlocked || confirmedProjectIds.size > 0) {
      const shortlistRows = await listFounderShortlists(user.id);

      const rows = shortlistRows.filter(
        (r) =>
          generalUnlocked ||
          (r.project_id != null && confirmedProjectIds.has(r.project_id)),
      );
      const ids = [...new Set(rows.map((r) => r.student_id))];

      if (ids.length > 0) {
        const sps = await listStudentProfiles(ids);
        const byId = new Map(sps.map((s) => [s.id, s]));
        students = rows.flatMap((r) => {
          const sp = byId.get(r.student_id);
          if (!sp) return [];
          return [
            {
              shortlistId: r.id,
              projectId: r.project_id,
              id: r.student_id,
              full_name: sp.full_name,
              college: sp.college,
              course: sp.course,
              year: sp.year,
              skills: sp.skills ?? [],
              availability: sp.availability,
              contact_email: sp.contact_email,
              cv_path: sp.cv_path,
            },
          ];
        });
      }
    }
  }

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <PinnedHeadingSection
          heading={
            <WorkspacePageHeading
              eyebrow="Founder workspace"
              title="Premium Shortlist"
              description="Choose a package, track payment and read your shortlist."
            />
          }
          split="lg:grid-cols-[0.2fr_0.8fr]"
        >
          {orders.length > 0 && (
            <div className="mb-6">
              <StatusTimeline
                steps={ORDER_STEPS}
                status={orders[0].status}
                label="Payment process for your latest order"
                compact
              />
            </div>
          )}

          {live ? (
            <div className="mb-6">
              <LiveOrderStatus
                key={live.sealedQuery.queryFingerprint}
                sealedQuery={live.sealedQuery}
                initialData={live.initialData}
                realtimeUrl={live.url}
              />
            </div>
          ) : null}

          <ShortlistsClient
            orders={orders}
            students={students}
            projects={projects}
          />
        </PinnedHeadingSection>
      </div>
    </section>
  );
}
