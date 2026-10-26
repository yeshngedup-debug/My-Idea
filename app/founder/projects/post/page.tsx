/**
 * Post a Project — server wrapper. Mobile-first like the profile page:
 * full-width on phones, sidebar only on lg+.
 */
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PostProjectForm } from './post-project-form';

export const metadata = { title: 'Post a Project | Bhutan Tech Connect' };

export default function PostProjectPage() {
  return (
    <>
        <div className="hidden lg:block mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter">Post a Project</h1>
          <p className="text-white/50 mt-1">Describe the work. Students apply within days.</p>
        </div>

        <PostProjectForm />
      </>
  );
}
