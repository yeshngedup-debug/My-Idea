'use server';

/**
 * Student profile server actions — save profile fields + upload CV to
 * Supabase Storage. Profile rows themselves live in Neon.
 */
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  getProfileRole,
  upsertStudentProfile,
  updateProfileFullName,
  setStudentProfileCv,
} from '@/lib/neon-data';
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

  const role = await getProfileRole(user.id);
  if (role !== 'student') {
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

  try {
    await upsertStudentProfile(row);
    // Keep profiles.full_name in sync
    await updateProfileFullName(user.id, full_name);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'database error';
    return { ok: false, message: `Could not save profile: ${message}` };
  }

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

  const role = await getProfileRole(user.id);
  if (role !== 'student') {
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
  try {
    await setStudentProfileCv(user.id, path, new Date().toISOString());
  } catch {
    return { ok: false, message: 'CV uploaded. Could not save the link. Try again.' };
  }

  revalidatePath('/student/profile');
  return { ok: true, message: 'CV uploaded.' };
}
