import { LayoutDashboard, Briefcase, Search, Star } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { createClient } from '@/lib/supabase/server';

export default async function FounderLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from('profiles').select('full_name').eq('id', user.id).single()
    : { data: null };

  return (
    <DashboardShell
      role="founder"
      title="Founder Dashboard"
      userName={profile?.full_name ?? user?.user_metadata?.full_name ?? null}
      nav={[
        { href: '/founder', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/founder/projects', label: 'My Projects', icon: Briefcase },
        { href: '/founder/browse-students', label: 'Browse Students', icon: Search },
        { href: '/founder/shortlists', label: 'Shortlists', icon: Star },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
