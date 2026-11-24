/**
 * Student Profile — server component.
 * Loads the student's profile row (plus a fresh CV signed URL) and renders
 * the editable client form.
 */
import { createClient } from '@/lib/supabase/server';
import { getStudentProfile } from '@/lib/neon-data';
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
    const data = await getStudentProfile(user.id);

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

    // Signed URLs expire after an hour, so always mint a fresh one.
    if (initial.cv_path) {
      const { data: signed } = await supabase.storage
        .from('cvs')
        .createSignedUrl(initial.cv_path, 60 * 60);
      cvUrl = signed?.signedUrl ?? null;
    }
  }

  return (
    <section className="px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight text-[#17352b] sm:text-3xl">
          My Profile
        </h1>
        <ProfileForm initial={initial} cvUrl={cvUrl} />
      </div>
    </section>
  );
}
