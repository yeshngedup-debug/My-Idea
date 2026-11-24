/**
 * Admin Payments — confirm or reject shortlist orders.
 * Server loads orders + founder names + project titles + fresh screenshot
 * links, then hands them to the interactive PaymentsClient.
 */
import { createClient } from '@/lib/supabase/server';
import { listOrders, listProfilesByIds, listAllProjects } from '@/lib/neon-data';
import { PinnedHeadingSection } from '@/components/layout/pinned-heading-section';
import { WorkspacePageHeading } from '@/components/layout/workspace-page-heading';
import { PaymentsClient, type AdminOrder } from './payments-client';

export const metadata = { title: 'Payments | Admin | Bhutan Tech Connect' };

export default async function AdminPaymentsPage() {
  const supabase = await createClient();
  const allOrders = await listOrders();

  const rows: AdminOrder[] = allOrders.map((o) => ({
    id: o.id,
    founder_id: o.founder_id,
    project_id: o.project_id,
    package: o.package,
    amount: o.amount,
    status: o.status,
    screenshot_path: o.screenshot_path,
    created_at: o.created_at,
  }));

  // Batch-load display names — never issue a lookup on an empty list.
  const founderIds = [...new Set(rows.map((r) => r.founder_id))];
  const projectIds = [
    ...new Set(rows.map((r) => r.project_id).filter((v): v is string => !!v)),
  ];

  const [founders, projects] = await Promise.all([
    founderIds.length ? listProfilesByIds(founderIds) : Promise.resolve([]),
    projectIds.length ? listAllProjects() : Promise.resolve([]),
  ]);

  const founderNames = new Map(founders.map((f) => [f.id, f.full_name]));
  const projectTitles = new Map(projects.map((p) => [p.id, p.title]));

  // Each proof needs a fresh short-lived signed URL (1 hour).
  const orders: AdminOrder[] = await Promise.all(
    rows.map(async (row) => {
      let screenshotUrl: string | null = null;
      if (row.screenshot_path) {
        const { data: signed } = await supabase.storage
          .from('payment-screenshots')
          .createSignedUrl(row.screenshot_path, 3600);
        screenshotUrl = signed?.signedUrl ?? null;
      }
      return {
        ...row,
        founderName: founderNames.get(row.founder_id) ?? null,
        projectTitle: row.project_id
          ? projectTitles.get(row.project_id) ?? null
          : null,
        screenshotUrl,
      };
    }),
  );

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <PinnedHeadingSection
          heading={
            <WorkspacePageHeading
              eyebrow="Admin workspace"
              title="Payments"
              description="Verify proof of payment, then confirm or reject each order."
            />
          }
        >
          <div className="rounded-2xl border border-[#ded8cb] bg-[#f5f2ea] p-4 sm:p-6">
            <PaymentsClient orders={orders} />
          </div>
        </PinnedHeadingSection>
      </div>
    </section>
  );
}
