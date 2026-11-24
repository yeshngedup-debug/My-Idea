/**
 * Post a Project — server wrapper with an auth guard.
 * The interactive form lives in the client component.
 */
import { createClient } from '@/lib/supabase/server';
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
          <h1 className="text-2xl font-semibold tracking-tight text-[#17352b] sm:text-3xl">
            Post a Project
          </h1>
          <p className="mt-2 text-sm text-[#657069]">Please sign in to post a project.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight text-[#17352b] sm:text-3xl">
          Post a Project
        </h1>
        <PostProjectForm />
      </div>
    </section>
  );
}
