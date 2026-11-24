/**
 * Founder Profile — real identity fields and a quiet summary of own projects.
 * No invented avatar/company fields; identity comes from the session.
 */
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProfile, getProfileRole, listProjectsByFounder } from '@/lib/neon-data';
import { PinnedHeadingSection } from '@/components/layout/pinned-heading-section';
import { WorkspacePageHeading } from '@/components/layout/workspace-page-heading';
import { ProfileClient } from './profile-client';
import { ProfileDetails, type ProjectCount } from './profile-details';

export const metadata = { title: 'My Profile | Bhutan Tech Connect' };

const STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'review', label: 'In review' },
  { value: 'completed', label: 'Completed' },
];

export default async function FounderProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const role = await getProfileRole(user.id);
  if (role !== 'founder') redirect('/');

  const profile = await getProfile(user.id);
  if (!profile) redirect('/');

  const projects = await listProjectsByFounder(user.id);
  const counts: ProjectCount[] = STATUSES.map((item) => ({
    ...item,
    count: projects.filter((project) => project.status === item.value).length,
  }));

  // The profile row has no helper exposing created_at; the account creation
  // date is the real member-since value available without editing lib/**.
  const memberSince = new Date(user.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const fullName = profile.full_name?.trim() || '';

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-4xl">
        <PinnedHeadingSection
          heading={
            <WorkspacePageHeading
              eyebrow="Founder workspace"
              title="My Profile"
              description="Your account details and a summary of the briefs you posted."
            />
          }
          split="lg:grid-cols-[0.3fr_0.7fr]"
        >
          <div className="space-y-6 pb-10">
            <ProfileDetails
              fullName={fullName}
              role={profile.role}
              memberSince={memberSince}
              total={projects.length}
              counts={counts}
            />
            <ProfileClient fullName={fullName} />
          </div>
        </PinnedHeadingSection>
      </div>
    </section>
  );
}
