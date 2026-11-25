/**
 * Post a Project — server wrapper with an auth guard.
 * The interactive form lives in the client component. Auth is the only use of
 * the session here; the new project row is written by the server action through
 * the typed Neon helper.
 */
import Link from 'next/link';
import { getUser } from '@/lib/auth';
import { PinnedHeadingSection } from '@/components/layout/pinned-heading-section';
import { WorkspacePageHeading } from '@/components/layout/workspace-page-heading';
import { PostProjectForm } from './post-project-form';

export const metadata = { title: 'Post a Project | Bhutan Tech Connect' };

const LOGIN_LINK =
  'pressable inline-flex min-h-11 items-center justify-center rounded-lg bg-[#17352b] px-4 py-2 text-sm font-semibold text-[#fffefa] transition-colors hover:bg-[#244b3e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b23c26] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f2ea]';

export default async function PostProjectPage() {
  const user = await getUser();

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <PinnedHeadingSection
          heading={
            <WorkspacePageHeading
              eyebrow="Founder workspace"
              title="Post a Project"
              description={
                user
                  ? 'Describe the work, set a budget and publish a clear brief.'
                  : 'Please sign in to post a project.'
              }
            />
          }
        >
          {user ? (
            <PostProjectForm />
          ) : (
            <div className="rounded-2xl border border-dashed border-[#ded8cb] bg-[#fffefa] p-10 text-center">
              <p className="text-sm text-[#56645c]">
                Only signed-in founders can publish a brief.
              </p>
              <Link href="/login" className={`${LOGIN_LINK} mt-6`}>
                Log in
              </Link>
            </div>
          )}
        </PinnedHeadingSection>
      </div>
    </section>
  );
}
