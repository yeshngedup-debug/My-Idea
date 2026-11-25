'use server';

/**
 * Student profile server actions — save profile fields + upload CV to
 * private object storage. Profile rows themselves live in Neon.
 */
import { revalidatePath } from 'next/cache';
import { getUser } from '@/lib/auth';
import { uploadCv as uploadCvFile } from '@/lib/storage';
import { getSql } from '@/lib/neon';
import {
  getProfileRole,
  getStudentProfile,
  setStudentProfileCv,
} from '@/lib/neon-data';
import { saveStudentProfileSchema } from '@/lib/validators';

export interface SaveResult {
  ok: boolean;
  message: string;
}

export async function saveStudentProfile(formData: FormData): Promise<SaveResult> {
  const user = await getUser();
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

  // The two Neon helpers are independent queries, so calling them in sequence
  // can leave the student profile updated while profiles.full_name stays
  // stale. Use one non-interactive transaction for both writes.
  try {
    const sql = getSql();
    const [studentRows, profileRows] = (await sql.transaction((txn) => [
      txn`
        insert into public.student_profiles
          (id, full_name, college, course, year, skills, bio, availability,
           contact_email, updated_at)
        values
          (${row.id}, ${row.full_name}, ${row.college}, ${row.course},
           ${row.year}, ${row.skills}::text[], ${row.bio},
           ${row.availability}, ${row.contact_email}, ${row.updated_at})
        on conflict (id) do update set
          full_name = excluded.full_name,
          college = excluded.college,
          course = excluded.course,
          year = excluded.year,
          skills = excluded.skills,
          bio = excluded.bio,
          availability = excluded.availability,
          contact_email = excluded.contact_email,
          updated_at = excluded.updated_at
        returning id
      `,
      txn`
        update public.profiles
        set full_name = ${full_name}, updated_at = now()
        where id = ${user.id}
        returning id
      `,
    ])) as unknown as Array<Array<{ id: string }>>;

    if (!studentRows?.length || !profileRows?.length) {
      throw new Error('Profile write did not affect both tables');
    }
  } catch (error) {
    console.error('[student-profile] Could not save profile', error);
    return { ok: false, message: 'Could not save profile. Try again.' };
  }

  revalidatePath('/student/profile');
  revalidatePath('/student');
  return { ok: true, message: 'Profile saved.' };
}

export async function uploadCv(formData: FormData): Promise<SaveResult> {
  const user = await getUser();
  if (!user) return { ok: false, message: 'Not signed in.' };

  const role = await getProfileRole(user.id);
  if (role !== 'student') {
    return { ok: false, message: 'Only students can upload a CV.' };
  }

  const file = formData.get('cv');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: 'Choose a PDF first.' };
  }
  if (file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) {
    return { ok: false, message: 'Use a PDF file.' };
  }
  const header = new TextDecoder().decode(await file.slice(0, 5).arrayBuffer());
  if (header !== '%PDF-') {
    return { ok: false, message: 'Use a valid PDF file.' };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, message: 'PDF must be 5 MB or smaller.' };
  }

  const uploadId =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  let path: string;
  try {
    path = await uploadCvFile(user.id, file, uploadId);
  } catch {
    return { ok: false, message: 'Could not upload CV. Try again.' };
  }

  // Storage and Neon cannot be changed in one transaction. Upload to a
  // per-attempt path first, then publish that exact path in Neon. A failed
  // Neon write leaves only an unreferenced object; the previously linked CV
  // remains the one founders can open. Signed URLs are never persisted; the
  // /api/cv/[id] proxy mints a fresh one for each authorized request.
  try {
    await setStudentProfileCv(user.id, path, new Date().toISOString());
    const saved = await getStudentProfile(user.id);
    if (saved?.cv_path !== path) {
      throw new Error('CV path was not persisted');
    }
  } catch (error) {
    console.error('[student-profile] Could not save CV link', error);
    return {
      ok: false,
      message:
        'The CV file was uploaded, but the profile link could not be saved. Try again.',
    };
  }

  revalidatePath('/student/profile');
  return { ok: true, message: 'CV uploaded.' };
}
