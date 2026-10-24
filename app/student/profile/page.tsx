/**
 * Student Profile — server component.
 * Loads the student's profile row and renders the client form.
 * Mobile-first: full-width on phones, dashboard sidebar only on lg+.
 */
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ProfileForm, type StudentProfileData } from './profile-form';

export const metadata = { title: 'My Profile | Bhutan Tech Connect' };

export default async function StudentProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initial: StudentProfileData = {
    full_name: null,
    college: null,
    course: null,
    year: null,
    skills: [],
    bio: null,
    availability: null,
    cv_path: null,
  };

  let cvUrl: string | null = null;

  if (user) {
    const { data } = await supabase
      .from('student_profiles')
      .select('full_name, college, course, year, skills, bio, availability, cv_path')
      .eq('id', user.id)
      .single();

    if (data) {
      initial = {
        full_name: data.full_name,
        college: data.college,
        course: data.course,
        year: data.year,
        skills: data.skills ?? [],
        bio: data.bio,
        availability: data.availability,
        cv_path: data.cv_path,
      };
    } else if (user.user_metadata?.full_name) {
      initial = { ...initial, full_name: String(user.user_metadata.full_name) };
    }

    // Fresh signed URL so the student can open their own CV
    if (initial.cv_path) {
      const { data: signed } = await supabase.storage
        .from('cvs')
        .createSignedUrl(initial.cv_path, 60 * 60);
      cvUrl = signed?.signedUrl ?? null;
    }
  }

  return (
    <div className="min-h-screen bg-[#0c0b10] text-white">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#0c0b10]/90 backdrop-blur-md border-b border-white/10 px-4 h-14 flex items-center gap-3">
        <Link
          href="/student"
          aria-label="Back to dashboard"
          className="p-2 -ml-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-base font-extrabold tracking-tight">My Profile</h1>
      </header>

      {/* Dashboard sidebar (desktop only) */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-white/[0.03] backdrop-blur-xl border-r border-white/10 flex-col p-6 z-30">
        <Link href="/student" className="text-lg font-extrabold tracking-tight mb-8">
          My Profile
        </Link>
        <Link
          href="/student"
          className="px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          Back to dashboard
        </Link>
      </aside>

      {/* Content: full width on mobile, indented on desktop */}
      <main className="px-4 py-6 sm:px-6 lg:ml-72 lg:px-10 lg:py-10 max-w-2xl mx-auto lg:max-w-none lg:mx-0">
        <div className="hidden lg:block mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter">My Profile</h1>
          <p className="text-white/50 mt-1">Complete your profile so founders can find and shortlist you.</p>
        </div>

        <ProfileForm initial={initial} cvUrl={cvUrl} />
      </main>
    </div>
  );
}
