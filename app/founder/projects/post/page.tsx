/**
 * Post a Project — server wrapper with an auth guard.
 * The interactive form lives in the client component.
 */
import { createClient } from '@/lib/supabase/server';
import { WorkspacePageHeading } from '@/components/layout/workspace-page-heading';
import { PostProjectForm } from './post-project-form';

export const metadata = { title: 'Post a Project | Bhutan Tech Connect' };

export default async function PostProjectPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
        <div className="mx-auto max-w-3xl">
          <WorkspacePageHeading
            eyebrow="Founder workspace"
            title="Post a Project"
            description="Please sign in to post a project."
          />
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-3xl space-y-7">
        <WorkspacePageHeading
          eyebrow="Founder workspace"
          title="Post a Project"
          description="Describe the work, set a budget and publish a clear brief."
        />
        <PostProjectForm />
      </div>
    </section>
  );
}
