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

  const { data: fp } = founderIds.length
    ? await supabase.from('profiles').select('id, full_name').in('id', founderIds)
    : { data: [] };
  const { data: pj } = projectIds.length
    ? await supabase.from('projects').select('id, title').in('id', projectIds)
    : { data: [] };

  const founderNames = new Map((fp ?? []).map((f) => [f.id as string, f.full_name as string | null]));
  const projectTitles = new Map((pj ?? []).map((p) => [p.id as string, p.title as string]));

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
    <div className="min-h-screen bg-[#0c0b10] text-white">
      <header className="lg:hidden sticky top-0 z-40 bg-[#0c0b10]/90 backdrop-blur-md border-b border-white/10 px-4 h-14 flex items-center gap-3">
        <Link
          href="/admin"
          aria-label="Back to admin dashboard"
          className="p-2 -ml-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <span className="text-sm font-semibold">Back</span>
        </Link>
        <h1 className="text-base font-extrabold tracking-tight">Payments</h1>
      </header>

      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-white/[0.03] backdrop-blur-xl border-r border-white/10 flex-col p-6 z-30">
        <h1 className="text-lg font-extrabold tracking-tight mb-8">Payments</h1>
        <Link
          href="/admin"
          className="px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          Back to dashboard
        </Link>
      </aside>

      <main className="px-4 py-6 sm:px-6 lg:ml-72 lg:px-10 lg:py-10 max-w-3xl mx-auto lg:max-w-none lg:mx-0">
        <div className="hidden lg:block mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter">Payments</h2>
          <p className="text-white/50 mt-1">
            Verify manual bank / mBoB transfers and unlock founder shortlists.
          </p>
        </div>

        <PaymentsClient orders={orders} />
      </main>
    </div>
  );
}
