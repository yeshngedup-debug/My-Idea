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
    <div className="min-h-screen bg-[#0c0b10] text-white">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#0c0b10]/90 backdrop-blur-md border-b border-white/10 px-4 h-14 flex items-center gap-3">
        <Link
          href="/founder/projects"
          aria-label="Back to my projects"
          className="p-2 -ml-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-base font-extrabold tracking-tight">Post a Project</h1>
      </header>

      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-white/[0.03] backdrop-blur-xl border-r border-white/10 flex-col p-6 z-30">
        <Link href="/founder" className="text-lg font-extrabold tracking-tight mb-8">
          Post a Project
        </Link>
        <Link
          href="/founder/projects"
          className="px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          Back to my projects
        </Link>
      </aside>

      <main className="px-4 py-6 sm:px-6 lg:ml-72 lg:px-10 lg:py-10 max-w-2xl mx-auto lg:max-w-none lg:mx-0">
        <div className="hidden lg:block mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter">Post a Project</h1>
          <p className="text-white/50 mt-1">Describe the work. Students apply within days.</p>
        </div>

        <PostProjectForm />
      </main>
    </div>
  );
}
