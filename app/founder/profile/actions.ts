'use server';

/**
 * Founder profile server action. Identity always comes from the session;
 * no profile ID is accepted from the browser.
 */
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getProfileRole, updateProfileFullName } from '@/lib/neon-data';

const fullNameSchema = z
  .string()
  .trim()
  .min(2, 'Enter a name of at least 2 characters.')
  .max(100, 'Name must be at most 100 characters.');

export interface ProfileResult {
  ok: boolean;
  message: string;
}

export async function updateFounderName(formData: FormData): Promise<ProfileResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'Not signed in.' };

  const role = await getProfileRole(user.id);
  if (role !== 'founder') return { ok: false, message: 'Only founders can edit this profile.' };

  const parsed = fullNameSchema.safeParse(String(formData.get('full_name') ?? ''));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'Check the name and try again.' };
  }

  try {
    await updateProfileFullName(user.id, parsed.data);
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'database error';
    return { ok: false, message: `Could not save your name: ${detail}` };
  }

  revalidatePath('/founder/profile');
  revalidatePath('/founder');
  return { ok: true, message: 'Name saved.' };
}
