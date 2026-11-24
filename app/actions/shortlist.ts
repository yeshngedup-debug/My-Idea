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

  // Creation is handled by a SECURITY DEFINER RPC: direct INSERTs are not
  // permitted by RLS. The RPC rechecks the role and requires a real
  // relationship (an application, or a confirmed paid order).
  const { error } = await supabase.rpc('request_shortlist', {
    p_student_id: studentId,
    p_project_id: null,
  });

  if (error) {
    const detail = error.message ?? '';
    if (detail.includes('No relationship')) {
      return {
        ok: false,
        message: 'Shortlist students who applied to your projects, or any student once a premium shortlist is confirmed.',
      };
    }
    return { ok: false, message: `Shortlist request failed: ${detail}` };
  }

  revalidatePath('/founder/browse-students');
  revalidatePath('/founder/shortlists');
  return { ok: true, message: 'Shortlist request sent.' };
}
