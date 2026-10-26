import { LayoutDashboard, Briefcase, FileText, User } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { createClient } from '@/lib/supabase/server';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from('profiles').select('full_name').eq('id', user.id).single()
    : { data: null };

  return (
    <DashboardShell
      role="student"
      title="Student Dashboard"
      userName={profile?.full_name ?? user?.user_metadata?.full_name ?? null}
      nav={[
        { href: '/student', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/student/projects', label: 'Projects', icon: Briefcase },
        { href: '/student/applications', label: 'Applications', icon: FileText },
        { href: '/student/profile', label: 'Profile', icon: User },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
