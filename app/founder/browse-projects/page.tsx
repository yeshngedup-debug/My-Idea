/**
 * Browse Projects — a founder-only, read-only view of other founders' briefs.
 *
 * Own projects are filtered out: the view is intentionally "others' projects
 * and ideas". All rows come from existing Neon helpers; no founder ID is
 * accepted from the browser and no other role can reach this page.
 */
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  getProfileRole,
  listAllProjectsWithDetails,
  listProfilesByIds,
} from '@/lib/neon-data';
import { PinnedHeadingSection } from '@/components/layout/pinned-heading-section';
import { WorkspacePageHeading } from '@/components/layout/workspace-page-heading';
import { BrowseProjectsClient, type OtherProject } from './browse-projects-client';

export const metadata = { title: 'Browse Projects | Bhutan Tech Connect' };

export default async function BrowseProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const role = await getProfileRole(user.id);
  if (role !== 'founder') redirect('/');

  const rows = await listAllProjectsWithDetails();
  const others = rows.filter((row) => row.founder_id !== user.id);
  const founderIds = [...new Set(others.map((row) => row.founder_id))];
  const profiles = founderIds.length > 0 ? await listProfilesByIds(founderIds) : [];
  const names = new Map(profiles.map((profile) => [profile.id, profile.full_name]));

  const projects: OtherProject[] = others.map((row) => ({
    id: row.id,
    founderName: names.get(row.founder_id)?.trim() || 'Founder',
    title: row.title,
    description: row.description,
    skills: row.required_skills,
    budgetMin: row.budget_min,
    budgetMax: row.budget_max,
    duration: row.duration,
    workMode: row.work_mode,
    deadline: row.deadline,
    status: row.status,
    createdAt: row.created_at,
  }));

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <PinnedHeadingSection
          heading={
            <WorkspacePageHeading
              eyebrow="Founder workspace"
              title="Browse Projects"
              description="Real briefs posted by other founders, in one quiet ledger."
            />
          }
        >
          <BrowseProjectsClient projects={projects} />
        </PinnedHeadingSection>
      </div>
    </section>
  );
}
