/**
 * Founder Profile — real identity fields and a quiet summary of own projects.
 * No invented avatar/company fields; identity comes from the session.
 */
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { getProfile, getProfileRole, listProjectsByFounder } from '@/lib/neon-data';
import { PinnedHeadingSection } from '@/components/layout/pinned-heading-section';
import { WorkspacePageHeading } from '@/components/layout/workspace-page-heading';
import { PROJECT_STATUS_LABEL } from '@/lib/status-labels';
import { ProfileClient } from './profile-client';
import { ProfileDetails, type ProjectCount } from './profile-details';

export const metadata = { title: 'My Profile' };

const STATUSES = [
  { value: 'open', label: PROJECT_STATUS_LABEL.open },
  { value: 'in_progress', label: PROJECT_STATUS_LABEL.in_progress },
  { value: 'review', label: PROJECT_STATUS_LABEL.review },
  { value: 'completed', label: PROJECT_STATUS_LABEL.completed },
];

export default async function FounderProfilePage() {
  const user = await getUser();

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

  // The profile record owns this date; getProfile() has already normalized it.
  const accountCreated = new Date(profile.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const fullName = profile.full_name?.trim() || '';

  return (
    <section>
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
              accountCreated={accountCreated}
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
