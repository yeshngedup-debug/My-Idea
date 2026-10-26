import { LayoutDashboard, GraduationCap, Briefcase, Wallet } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { createClient } from '@/lib/supabase/server';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from('profiles').select('full_name').eq('id', user.id).single()
    : { data: null };

  return (
    <DashboardShell
      role="admin"
      title="Admin Dashboard"
      userName={profile?.full_name ?? user?.user_metadata?.full_name ?? null}
      nav={[
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/students', label: 'Students', icon: GraduationCap },
        { href: '/admin/projects', label: 'Projects', icon: Briefcase },
        { href: '/admin/payments', label: 'Payments', icon: Wallet },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
