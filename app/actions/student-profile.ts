'use server';

/**
 * Student profile server actions — save profile fields + upload CV to Storage.
 */
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { saveStudentProfileSchema } from '@/lib/validators';

export interface SaveResult {
  ok: boolean;
  message: string;
}

export async function saveStudentProfile(formData: FormData): Promise<SaveResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'Not signed in.' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'student') {
    return { ok: false, message: 'Only students can save a profile.' };
  }

  const raw = {
    full_name: String(formData.get('full_name') ?? '').trim(),
    college: String(formData.get('college') ?? '').trim(),
    course: String(formData.get('course') ?? '').trim(),
    year: String(formData.get('year') ?? ''),
    availability: String(formData.get('availability') ?? ''),
    skills: String(formData.get('skills') ?? ''),
    bio: String(formData.get('bio') ?? '').trim(),
  };

  const parsed = saveStudentProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'Check the form and try again.' };
  }

  const { full_name, college, course, year, availability, skills, bio } = parsed.data;

  const row = {
    id: user.id,
    full_name,
    college: college || null,
    course: course || null,
    year: year || null,
    skills,
    bio: bio || null,
    availability: availability || null,
    contact_email: user.email ?? null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('student_profiles')
    .upsert(row, { onConflict: 'id' });

  if (error) return { ok: false, message: `Could not save profile: ${error.message}` };

  // Keep profiles.full_name in sync
  await supabase.from('profiles').update({ full_name: full_name }).eq('id', user.id);

  revalidatePath('/student/profile');
  revalidatePath('/student');
  return { ok: true, message: 'Profile saved.' };
}

export async function uploadCv(formData: FormData): Promise<SaveResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'Not signed in.' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'student') {
    return { ok: false, message: 'Only students can upload a CV.' };
  }

  const file = formData.get('cv');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: 'Choose a PDF first.' };
  }
  if (file.type !== 'application/pdf') {
    return { ok: false, message: 'Use a PDF file.' };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, message: 'PDF must be 5 MB or smaller.' };
  }

  const path = `${user.id}/cv.pdf`;

  const { error: uploadError } = await supabase.storage
    .from('cvs')
    .upload(path, file, { upsert: true, contentType: 'application/pdf' });

  if (uploadError) return { ok: false, message: 'Could not upload CV. Try again.' };

  // Store only the storage path — signed URLs expire (1 hour), so they must
  // never be persisted. CVs are opened via the /api/cv/[id] proxy, which
  // creates a fresh signed URL on demand.
  const { error: dbError } = await supabase
    .from('student_profiles')
    .upsert(
      {
        id: user.id,
        cv_path: path,
        cv_url: null, // legacy column, deliberately kept empty
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

  if (dbError) return { ok: false, message: 'CV uploaded. Could not save the link. Try again.' };

  revalidatePath('/student/profile');
  return { ok: true, message: 'CV uploaded.' };
}
