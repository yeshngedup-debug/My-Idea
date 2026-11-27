/**
 * Founder Premium Shortlists — manual payment MVP.
 * Packages, payment instructions, screenshot upload and order status
 * are handled by the client component; this page owns data loading.
 */
import { getUser } from '@/lib/auth';
import {
  listFounderOrders,
  listProjectsByFounder,
  listFounderShortlists,
  listStudentProfiles,
} from "@/lib/neon-data";
import { sealFounderOrders, type LiveOrderRow } from "@/lib/neon-realtime";
import { PinnedHeadingSection } from "@/components/layout/pinned-heading-section";
import { WorkspacePageHeading } from "@/components/layout/workspace-page-heading";
import { LiveOrderStatus } from "@/features/payments/components/live-order-status";
import { ErrorState } from "@/components/ui/empty-state";
import {
  LiveShortlistRefresh,
  ShortlistsClient,
  type OrderRow,
  type ShortlistStudent,
} from "./shortlists-client";

export const metadata = { title: "Premium Shortlist" };

/** Server-rendered time only: this text is not hydrated on the client. */
function formatLastUpdated(): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Thimphu",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

export default async function FounderShortlistsPage() {
  const user = await getUser();

  let orders: OrderRow[] = [];
  let students: ShortlistStudent[] = [];
  let projects: { id: string; title: string }[] = [];
  let live: {
    sealedQuery: Awaited<ReturnType<typeof sealFounderOrders>>;
    initialData: LiveOrderRow[];
    url: string;
  } | null = null;
  let liveUnavailable = false;

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
        liveUnavailable = true;
        console.warn(
          '[founder/shortlists] Live order status unavailable; showing server-loaded status.',
          error,
        );
      }
    } else {
      liveUnavailable = true;
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
    <section>
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
          {liveUnavailable && (
            <ErrorState
              className="mb-6"
              title="Live status unavailable"
              description={`Last updated ${formatLastUpdated()} · server-loaded order status is still shown.`}
              action={
                // Full reload, matching the other retry controls in the workspace.
                <a
                  href="/founder/shortlists"
                  className="inline-flex min-h-11 items-center rounded-lg bg-cta px-5 py-3 text-sm font-semibold text-cta-foreground transition-colors hover:bg-cta-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Refresh
                </a>
              }
            />
          )}

          {live ? (
            <div className="mb-6">
              <LiveOrderStatus
                key={live.sealedQuery.queryFingerprint}
                sealedQuery={live.sealedQuery}
                initialData={live.initialData}
                realtimeUrl={live.url}
              />
              <LiveShortlistRefresh
                key={`refresh-${live.sealedQuery.queryFingerprint}`}
                sealedQuery={live.sealedQuery}
                initialData={live.initialData}
                realtimeUrl={live.url}
                confirmedOrderIds={orders
                  .filter((o) => o.status === "confirmed")
                  .map((o) => o.id)}
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
