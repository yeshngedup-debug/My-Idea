'use server';

/**
 * Shortlist actions — founders request/shortlist students.
 */
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'founder') {
    return { ok: false, message: 'Only founders can shortlist students.' };
  }

  // Make sure the target actually is a student
  const { data: target } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', studentId)
    .single();
  if (!target || target.role !== 'student') {
    return { ok: false, message: 'Student not found.' };
  }

  const { error } = await supabase
    .from('shortlists')
    .upsert(
      { founder_id: user.id, student_id: studentId, status: 'requested' },
      { onConflict: 'founder_id,student_id', ignoreDuplicates: false }
    );

  if (error) return { ok: false, message: `Failed: ${error.message}` };

  revalidatePath('/founder/browse-students');
  revalidatePath('/founder/shortlists');
  return { ok: true, message: 'Shortlist request sent.' };
}
