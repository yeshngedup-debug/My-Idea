/**
 * Founder Premium Shortlists — manual payment MVP.
 * Packages, payment instructions, screenshot upload, order status,
 * and the unlocked shortlist once the admin confirms payment.
 */
import { createClient } from '@/lib/supabase/server';
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
    const { data: o } = await supabase
      .from('shortlist_orders')
      .select('id, package, amount, status, screenshot_path, project_id, created_at')
      .eq('founder_id', user.id)
      .order('created_at', { ascending: false });

    orders = (o as unknown as OrderRow[]) ?? [];

    // Projects owned by this founder (for attaching an order to a project)
    const { data: p } = await supabase
      .from('projects')
      .select('id, title')
      .eq('founder_id', user.id)
      .order('created_at', { ascending: false });

    projects = (p as { id: string; title: string }[]) ?? [];

    // Unlocked content: admin-generated shortlist rows for this founder
    const hasConfirmed = orders.some((o) => o.status === 'confirmed');
    if (hasConfirmed) {
      const { data: sl } = await supabase
        .from('shortlists')
        .select('id, student_id, status, project_id')
        .eq('founder_id', user.id)
        .order('created_at', { ascending: true });

      const rows = sl ?? [];
      const ids = rows.map((r) => r.student_id as string);

      if (ids.length > 0) {
        const { data: sps } = await supabase
          .from('student_profiles')
          .select('id, full_name, college, course, year, skills, availability, contact_email, cv_path')
          .in('id', ids);

        const byId = new Map((sps ?? []).map((s) => [s.id as string, s]));
        const mapped: (ShortlistStudent | null)[] = rows.map((r) => {
          const sp = byId.get(r.student_id as string) as
            | Record<string, unknown>
            | undefined;
          if (!sp) return null;
          const item: ShortlistStudent = {
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
          };
          return item;
        });
        students = mapped.filter((s): s is ShortlistStudent => s !== null);
      }
    }
  }

  return (
    <ShortlistsClient orders={orders} students={students} projects={projects} />
  );
}
