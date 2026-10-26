/**
 * Admin — Payments: confirm or reject shortlist orders.
 * Server loads orders + founder names + screenshot links.
 */
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { PaymentsClient, type AdminOrder } from './payments-client';

export const metadata = { title: 'Payments | Admin | Bhutan Tech Connect' };

export default async function AdminPaymentsPage() {
  const supabase = await createClient();

  let orders: AdminOrder[] = [];

  const { data: o } = await supabase
    .from('shortlist_orders')
    .select('id, founder_id, project_id, package, amount, status, screenshot_path, created_at')
    .order('created_at', { ascending: false });

  const rows = (o as unknown as AdminOrder[]) ?? [];

  // Founder names + project titles + fresh screenshot links
  const founderIds = [...new Set(rows.map((r) => r.founder_id))];
  const projectIds = [...new Set(rows.map((r) => r.project_id).filter((v): v is string => !!v))];

  // Founder names + project titles are independent — one round-trip
  const [fpRes, pjRes] = await Promise.all([
    founderIds.length
      ? supabase.from('profiles').select('id, full_name').in('id', founderIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string | null }[] }),
    projectIds.length
      ? supabase.from('projects').select('id, title').in('id', projectIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
  ]);

  const founderNames = new Map(
    (fpRes.data ?? []).map((f) => [f.id as string, f.full_name as string | null])
  );
  const projectTitles = new Map((pjRes.data ?? []).map((p) => [p.id as string, p.title as string]));

  for (const row of rows) {
    if (row.screenshot_path) {
      const { data: signed } = await supabase.storage
        .from('payment-screenshots')
        .createSignedUrl(row.screenshot_path, 60 * 60);
      (row as AdminOrder).screenshotUrl = signed?.signedUrl ?? null;
    }
    row.founderName = founderNames.get(row.founder_id) ?? null;
    row.projectTitle = row.project_id ? projectTitles.get(row.project_id) ?? null : null;
    orders.push(row);
  }

  return (
    <>
        <div className="hidden lg:block mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter">Payments</h2>
          <p className="text-white/50 mt-1">
            Verify manual bank / mBoB transfers and unlock founder shortlists.
          </p>
        </div>

        <PaymentsClient orders={orders} />
      </>
  );
}
