'use server';

/**
 * Student profile server actions — save profile fields + upload CV to Storage.
 */
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface SaveResult {
  ok: boolean;
  message: string;
}

const AVAILABILITY = ['weekdays', 'weekends', 'evenings', 'full_time', 'flexible'] as const;
const YEARS = ['1st', '2nd', '3rd', '4th', 'Graduate'] as const;

export async function saveStudentProfile(formData: FormData): Promise<SaveResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'Not signed in.' };

  const fullName = String(formData.get('full_name') ?? '').trim();
  const college = String(formData.get('college') ?? '').trim();
  const course = String(formData.get('course') ?? '').trim();
  const yearRaw = String(formData.get('year') ?? '');
  const year = (YEARS as readonly string[]).includes(yearRaw) ? yearRaw : null;
  const availabilityRaw = String(formData.get('availability') ?? '');
  const availability = (AVAILABILITY as readonly string[]).includes(availabilityRaw)
    ? availabilityRaw
    : null;
  const skills = String(formData.get('skills') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 15);
  const bio = String(formData.get('bio') ?? '').trim().slice(0, 600);

  if (!fullName) return { ok: false, message: 'Full name is required.' };

  const row = {
    id: user.id,
    full_name: fullName,
    college: college || null,
    course: course || null,
    year,
    skills,
    bio: bio || null,
    availability,
    contact_email: user.email ?? null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('student_profiles')
    .upsert(row, { onConflict: 'id' });

  if (error) return { ok: false, message: `Save failed: ${error.message}` };

  // Keep profiles.full_name in sync
  await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id);

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

  const file = formData.get('cv');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: 'Choose a PDF first.' };
  }
  if (file.type !== 'application/pdf') {
    return { ok: false, message: 'Only PDF files are allowed.' };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, message: 'PDF must be 5 MB or smaller.' };
  }

  const path = `${user.id}/cv.pdf`;

  const { error: uploadError } = await supabase.storage
    .from('cvs')
    .upload(path, file, { upsert: true, contentType: 'application/pdf' });

  if (uploadError) return { ok: false, message: `Upload failed: ${uploadError.message}` };

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

  if (dbError) return { ok: false, message: `Upload saved but link failed: ${dbError.message}` };

  revalidatePath('/student/profile');
  return { ok: true, message: 'CV uploaded.' };
}
