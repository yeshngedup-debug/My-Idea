/**
 * Founder Premium Shortlists — manual payment MVP.
 * Packages, payment instructions, screenshot upload and order status
 * are handled by the client component; this page owns data loading.
 */
import { createClient } from '@/lib/supabase/server';
import { StatusTimeline, ORDER_STEPS } from '@/components/ui/status-timeline';
import { ShortlistsClient, type OrderRow, type ShortlistStudent } from './shortlists-client';

export const metadata = { title: 'Premium Shortlist | Bhutan Tech Connect' };

export default async function FounderShortlistsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let orders: OrderRow[] = [];
  let students: ShortlistStudent[] = [];
  let projects: { id: string; title: string }[] = [];

  if (user) {
    // Orders and projects are independent — one round-trip.
    const [oRes, pRes] = await Promise.all([
      supabase
        .from('shortlist_orders')
        .select('id, package, amount, status, screenshot_path, project_id, created_at')
        .eq('founder_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('projects')
        .select('id, title')
        .eq('founder_id', user.id)
        .order('created_at', { ascending: false }),
    ]);

    orders = (oRes.data as unknown as OrderRow[]) ?? [];
    projects = (pRes.data as { id: string; title: string }[]) ?? [];

    // A general order (no project) unlocks all rows; a project-specific
    // order unlocks only that project's shortlist rows.
    const confirmedProjectIds = new Set(
      orders
        .filter((o) => o.status === 'confirmed' && o.project_id)
        .map((o) => o.project_id as string)
    );
    const generalUnlocked = orders.some(
      (o) => o.status === 'confirmed' && !o.project_id
    );

    if (generalUnlocked || confirmedProjectIds.size > 0) {
      const { data: sl } = await supabase
        .from('shortlists')
        .select('id, student_id, status, project_id')
        .eq('founder_id', user.id)
        .order('created_at', { ascending: true });

      const rows = (sl ?? []).filter(
        (r) =>
          generalUnlocked ||
          (r.project_id != null && confirmedProjectIds.has(r.project_id as string))
      );
      const ids = [...new Set(rows.map((r) => r.student_id as string))];

      if (ids.length > 0) {
        const { data: sps } = await supabase
          .from('student_profiles')
          .select('id, full_name, college, course, year, skills, availability, contact_email, cv_path')
          .in('id', ids);

        const byId = new Map((sps ?? []).map((s) => [s.id as string, s]));
        students = rows.flatMap((r) => {
          const sp = byId.get(r.student_id as string) as
            | Record<string, unknown>
            | undefined;
          if (!sp) return [];
          return [{
            shortlistId: r.id as string,
            projectId: (r.project_id as string | null) ?? null,
            id: r.student_id as string,
            full_name: (sp.full_name as string | null) ?? null,
            college: (sp.college as string | null) ?? null,
            course: (sp.course as string | null) ?? null,
            year: (sp.year as string | null) ?? null,
            skills: (sp.skills as string[] | null) ?? [],
            availability: (sp.availability as string | null) ?? null,
            contact_email: (sp.contact_email as string | null) ?? null,
            cv_path: (sp.cv_path as string | null) ?? null,
          }];
        });
      }
    }
  }

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-semibold tracking-tight text-[#17352b] sm:text-3xl">
          Premium Shortlist
        </h2>

        {orders.length > 0 && (
          <div className="mt-6">
            <StatusTimeline
              steps={ORDER_STEPS}
              status={orders[0].status}
              label="Payment process for your latest order"
              compact
            />
          </div>
        )}

        <ShortlistsClient orders={orders} students={students} projects={projects} />
      </div>
    </section>
  );
}
