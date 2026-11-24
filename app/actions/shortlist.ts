'use server';

/**
 * Shortlist actions — founders request/shortlist students.
 * The old SECURITY DEFINER RPC is reproduced in application code in
 * lib/neon-data.ts, including the relationship and idempotency checks.
 */
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getProfileRole, requestShortlist as createShortlistRow, NeonDataError } from '@/lib/neon-data';

export interface ShortlistResult {
  ok: boolean;
  message: string;
}

export async function requestShortlist(studentId: string): Promise<ShortlistResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'Not signed in.' };

  const role = await getProfileRole(user.id);
  if (role !== 'founder') {
    return { ok: false, message: 'Only founders can shortlist students.' };
  }

  // Make sure the target actually is a student
  const targetRole = await getProfileRole(studentId);
  if (targetRole !== 'student') {
    return { ok: false, message: 'Student not found.' };
  }

  try {
    await createShortlistRow(user.id, studentId, null);
  } catch (error) {
    const detail = error instanceof Error ? error.message : '';
    if (detail.includes('No relationship')) {
      return {
        ok: false,
        message: 'Shortlist students who applied to your projects, or any student once a premium shortlist is confirmed.',
      };
    }
    if (error instanceof NeonDataError && error.code === '23505') {
      return { ok: true, message: 'Shortlist request sent.' };
    }
    return { ok: false, message: `Shortlist request failed: ${detail}` };
  }

  revalidatePath('/founder/browse-students');
  revalidatePath('/founder/shortlists');
  return { ok: true, message: 'Shortlist request sent.' };
}
