'use server';

/**
 * Admin student-management actions — manual ranking, verification,
 * and shortlist generation for a founder/project.
 */
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export interface AdminResult {
  ok: boolean;
  message: string;
}

export interface ShortlistTextResult extends AdminResult {
  text?: string;
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, error: 'Not signed in.' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') return { supabase, error: 'Admins only.' };

  return { supabase, error: null };
}

/** Set a student's manual rank (null clears it). */
export async function setStudentRank(
  studentId: string,
  rank: number | null
): Promise<AdminResult> {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const clean = rank != null && Number.isFinite(rank) && rank >= 1 ? Math.floor(rank) : null;

  const { error: dbError } = await supabase
    .from('student_profiles')
    .update({ rank: clean })
    .eq('id', studentId);

  if (dbError) return { ok: false, message: `Failed: ${dbError.message}` };

  revalidatePath('/admin/students');
  revalidatePath('/admin');
  return { ok: true, message: 'Rank saved.' };
}

/** Toggle a student's verified flag. */
export async function setStudentVerified(
  studentId: string,
  verified: boolean
): Promise<AdminResult> {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const { error: dbError } = await supabase
    .from('student_profiles')
    .update({ verified })
    .eq('id', studentId);

  if (dbError) return { ok: false, message: `Failed: ${dbError.message}` };

  revalidatePath('/admin/students');
  revalidatePath('/founder/browse-students');
  return { ok: true, message: verified ? 'Marked verified.' : 'Marked not verified.' };
}

/**
 * Generate a ranked shortlist text for a founder (+ optional project),
 * save it to the shortlists table, and return the text for copy/download.
 */
export async function generateShortlist(
  studentIds: string[],
  founderId: string,
  projectId: string | null
): Promise<ShortlistTextResult> {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  if (!founderId) return { ok: false, message: 'Choose a founder.' };
  if (studentIds.length === 0) return { ok: false, message: 'Select at least one student.' };

  const { data: rows, error: fetchError } = await supabase
    .from('student_profiles')
    .select('id, full_name, college, course, year, skills, availability, rank, verified, contact_email, cv_path')
    .in('id', studentIds);

  if (fetchError || !rows || rows.length === 0) {
    return { ok: false, message: 'Could not load selected students.' };
  }

  type Row = (typeof rows)[number];

  // Manual rank order first, then unranked
  const ordered = ([...rows] as Row[]).sort(
    (a, b) => (a.rank ?? 9999) - (b.rank ?? 9999)
  );

  // CV links via the /api/cv/[id] proxy — never expire, unlike signed URLs.
  const headerList = await headers();
  const proto = headerList.get('x-forwarded-proto') ?? 'http';
  const host = headerList.get('host') ?? 'localhost:3000';
  const origin = `${proto}://${host}`;
  const cvLinkFor = (row: Row) => (row.cv_path ? `${origin}/api/cv/${row.id}` : '-');

  // Context: founder name, project title
  const { data: founder } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', founderId)
    .single();

  let projectTitle = 'General shortlist';
  if (projectId) {
    const { data: project } = await supabase
      .from('projects')
      .select('title')
      .eq('id', projectId)
      .single();
    if (project?.title) projectTitle = project.title;
  }

  const AVAILABILITY: Record<string, string> = {
    weekdays: 'Weekdays',
    weekends: 'Weekends',
    evenings: 'Evenings',
    full_time: 'Full time',
    flexible: 'Flexible',
  };

  const lines: string[] = [
    `SHORTLIST - ${projectTitle}`,
    `Founder: ${founder?.full_name ?? founderId}`,
    `Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`,
    `Students: ${ordered.length}`,
    '',
  ];

  ordered.forEach((s, i) => {
    lines.push(
      `${i + 1}. ${s.full_name ?? 'Unnamed'}`,
      `   ${s.college ?? 'College not set'}${s.course ? ` - ${s.course}` : ''}${s.year ? ` (${s.year} year)` : ''}`,
      `   Rank: ${s.rank ?? '-'} | ${s.verified ? 'Verified' : 'Not verified'}`,
      `   Skills: ${(s.skills ?? []).join(', ') || 'None listed'}`,
      `   Availability: ${s.availability ? (AVAILABILITY[s.availability] ?? s.availability) : '-'}`,
      `   Contact: ${s.contact_email ?? '-'}`,
      `   CV: ${cvLinkFor(s)}`,
      ''
    );
  });

  // Persist: replace this founder's entries for the SAME project only, so
  // regenerating one project never wipes another project's shortlist.
  let staleRows = supabase
    .from('shortlists')
    .delete()
    .eq('founder_id', founderId)
    .in('student_id', ordered.map((s) => s.id));
  staleRows = projectId
    ? staleRows.eq('project_id', projectId)
    : staleRows.is('project_id', null);

  const { error: delError } = await staleRows;

  if (delError) return { ok: false, message: `Failed to update shortlist: ${delError.message}` };

  const { error: insError } = await supabase.from('shortlists').insert(
    ordered.map((s) => ({
      founder_id: founderId,
      student_id: s.id,
      project_id: projectId,
      status: 'requested',
    }))
  );

  if (insError) return { ok: false, message: `Failed to save shortlist: ${insError.message}` };

  revalidatePath('/founder/shortlists');
  revalidatePath('/admin/students');
  return { ok: true, message: 'Shortlist generated.', text: lines.join('\n') };
}
