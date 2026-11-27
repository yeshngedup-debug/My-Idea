/**
 * Admin Payments — confirm or reject shortlist orders.
 * Server loads orders + founder names + project titles + fresh screenshot
 * links, then hands them to the interactive PaymentsClient.
 *
 * All table reads/writes go through typed Neon helpers. Identity comes from
 * the session helper and payment proofs are opened through short-lived signed
 * links — never through a direct table call. A failed read is caught here so
 * the queue shows a retryable error instead of an unhandled server failure.
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
import { ErrorState } from '@/components/ui/empty-state';
import { PaymentsClient, type AdminOrder } from './payments-client';

export const metadata = { title: 'Payments | Admin' };

export default async function AdminPaymentsPage() {
  // Defense in depth: proxy.ts protects /admin/*, the page re-verifies the
  // role with the same Neon source of truth before it loads any order data.
  const user = await getUser();
  if (!user) redirect('/login');
  const role = await getProfileRole(user.id);
  if (role !== 'admin') redirect('/');

  let allOrders: Awaited<ReturnType<typeof listOrders>> = [];
  let loadError: string | null = null;
  try {
    allOrders = await listOrders();
  } catch (error) {
    // Logged on the server; the admin gets a retryable message, not a stack.
    console.error('[admin/payments] Failed to load orders', error);
    loadError = 'Could not load payment orders. Try again.';
  }

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
    <section>
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
          {loadError ? (
            <ErrorState
              headingLevel="h2"
              title="Could not load payment orders"
              description={loadError}
              action={
                <a
                  href="/admin/payments"
                  className="pressable inline-flex min-h-11 items-center justify-center rounded-md bg-[#ff0063] px-5 py-2.5 text-sm font-semibold text-[#000000] transition-colors duration-150 ease-[var(--ease-out)] motion-reduce:transition-none hover:bg-[#d40054] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c2004b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#eaf6f6]"
                >
                  Try again
                </a>
              }
            />
          ) : (
            <div className="rounded-xl border border-[#b9dede] bg-[#eaf6f6] p-4 sm:p-5">
              <PaymentsClient orders={orders} />
            </div>
          )}
        </PinnedHeadingSection>
      </div>
    </section>
  );
}
