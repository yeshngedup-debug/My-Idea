/**
 * Admin Payments — confirm or reject shortlist orders.
 * Server loads orders + founder names + project titles + fresh screenshot
 * links, then hands them to the interactive PaymentsClient.
 *
 * All table reads/writes go through typed Neon helpers. Identity comes from
 * the session helper and payment proofs are opened through short-lived signed
 * links — never through a direct table call.
 */
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { signPaymentProof } from '@/features/payments/actions';
import {
  getProfileRole,
  listOrders,
  listProfilesByIds,
  listAllProjects,
} from '@/lib/neon-data';
import { PinnedHeadingSection } from '@/components/layout/pinned-heading-section';
import { WorkspacePageHeading } from '@/components/layout/workspace-page-heading';
import { PaymentsClient, type AdminOrder } from './payments-client';

export const metadata = { title: 'Payments | Admin | Bhutan Tech Connect' };

export default async function AdminPaymentsPage() {
  // Defense in depth: proxy.ts protects /admin/*, the page re-verifies the
  // role with the same Neon source of truth before it loads any order data.
  const user = await getUser();
  if (!user) redirect('/login');
  const role = await getProfileRole(user.id);
  if (role !== 'admin') redirect('/');

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
      let screenshotError = false;
      if (row.screenshot_path) {
        screenshotUrl = await signPaymentProof(row.screenshot_path, 3600);
        // Failures are logged in the helper and surfaced in the UI.
        if (!screenshotUrl) screenshotError = true;
      }
      return {
        ...row,
        founderName: founderNames.get(row.founder_id) ?? null,
        projectTitle: row.project_id
          ? projectTitles.get(row.project_id) ?? null
          : null,
        screenshotUrl,
        screenshotError,
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
