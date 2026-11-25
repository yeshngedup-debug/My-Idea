'use server';

/**
 * Shortlist actions — founders request/shortlist students.
 * The old SECURITY DEFINER RPC is reproduced in application code in
 * lib/neon-data.ts, including the relationship and idempotency checks.
 */
import { revalidatePath } from 'next/cache';
import { getUser } from '@/lib/auth';
import { getProfileRole, requestShortlist as createShortlistRow, NeonDataError } from '@/lib/neon-data';

export interface ShortlistResult {
  ok: boolean;
  message: string;
}

export async function requestShortlist(studentId: string): Promise<ShortlistResult> {
  const user = await getUser();
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
      // Idempotent success: the row already exists, so fall through to revalidation.
    } else {
      console.error('[shortlist] Could not create shortlist row', error);
      return {
        ok: false,
        message: 'Could not send shortlist request. Please try again.',
      };
    }
  }

  revalidatePath('/founder/browse-students');
  revalidatePath('/founder/shortlists');
  revalidatePath(`/founder/students/${studentId}`);
  return { ok: true, message: 'Shortlist request sent.' };
}
