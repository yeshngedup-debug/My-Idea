'use server';

/**
 * Founder profile server action. Identity always comes from the session;
 * no profile ID is accepted from the browser.
 */
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import { getProfileRole, updateProfileFullName, type Role } from '@/lib/neon-data';

const fullNameSchema = z
  .string()
  .trim()
  .min(2, 'Enter a name of at least 2 characters.')
  .max(100, 'Name must be at most 100 characters.');

export interface ProfileResult {
  ok: boolean;
  message: string;
  /** Marks a message that describes the submitted name, not a save failure. */
  fieldError?: boolean;
}

export async function updateFounderName(formData: FormData): Promise<ProfileResult> {
  const user = await getUser();
  if (!user) return { ok: false, message: 'Not signed in.' };

  let role: Role | null;
  try {
    role = await getProfileRole(user.id);
  } catch (error) {
    console.error('[founder/profile] Could not verify founder role', error);
    return { ok: false, message: 'Could not verify your profile. Please try again.' };
  }
  if (role !== 'founder') return { ok: false, message: 'Only founders can edit this profile.' };

  const submitted = formData.get('full_name');
  if (typeof submitted !== 'string') {
    return { ok: false, message: 'Enter a name and try again.', fieldError: true };
  }

  const parsed = fullNameSchema.safeParse(submitted);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? 'Check the name and try again.',
      fieldError: true,
    };
  }

  try {
    await updateProfileFullName(user.id, parsed.data);
  } catch (error) {
    // Keep the detail in the server log; never echo a driver error to the UI.
    console.error('[founder/profile] Could not save display name', error);
    return { ok: false, message: 'Could not save your name. Please try again.' };
  }

  revalidatePath('/founder/profile');
  revalidatePath('/founder');
  return { ok: true, message: 'Name saved.' };
}
