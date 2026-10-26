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
    <>
        <div className="hidden lg:block mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter">My Profile</h1>
          <p className="text-white/50 mt-1">Complete your profile so founders can find and shortlist you.</p>
        </div>

        <ProfileForm initial={initial} cvUrl={cvUrl} />
      </>
  );
}
