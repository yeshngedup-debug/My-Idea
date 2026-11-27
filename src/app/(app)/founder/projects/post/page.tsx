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
import { EmptyState } from '@/components/ui/empty-state';
import { PostProjectForm } from './post-project-form';

export const metadata = { title: 'Post a Project' };

const LOGIN_LINK =
  'pressable inline-flex min-h-11 items-center justify-center rounded-lg bg-cta px-4 py-2 text-sm font-semibold text-cta-foreground transition-colors hover:bg-cta-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export default async function PostProjectPage() {
  const user = await getUser();

  return (
    <section>
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
            <EmptyState
              headingLevel="h2"
              title="Sign in to post a project"
              description="Only signed-in founders can publish a brief."
              action={
                <Link href="/login" className={LOGIN_LINK}>
                  Log in
                </Link>
              }
            />
          )}
        </PinnedHeadingSection>
      </div>
    </section>
  );
}
