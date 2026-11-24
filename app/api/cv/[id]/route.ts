/**
 * CV proxy route — GET /api/cv/[id]
 *
 * Founders/admins can download a student's CV only when there is a
 * legitimate relationship: the student has applied to one of the
 * founder's projects, or the student is on one of the founder's
 * shortlists AND the founder holds a confirmed paid order. Admins
 * retain unrestricted access.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['founder', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: sp } = await supabase
    .from('student_profiles')
    .select('cv_path')
    .eq('id', id)
    .single();

  if (!sp?.cv_path) {
    return NextResponse.json({ error: 'CV not found' }, { status: 404 });
  }

  // Admins can download any CV.
  if (profile.role === 'admin') {
    const { data: signed } = await supabase.storage
      .from('cvs')
      .createSignedUrl(sp.cv_path, 300);
    if (!signed?.signedUrl) {
      return NextResponse.json({ error: 'Could not generate CV link' }, { status: 500 });
    }
    return NextResponse.redirect(signed.signedUrl);
  }

  // Founders: an application to one of their projects is enough. A
  // shortlist row alone is NOT — the founder must also hold a confirmed
  // paid order (mirrors the storage RLS policy added in
  // 20261124000000_close_security_bypasses.sql).
  let hasRelationship = false;

  const { data: founderProjects } = await supabase
    .from('projects')
    .select('id')
    .eq('founder_id', user.id);

  const founderProjectIds = (founderProjects ?? []).map((p) => p.id as string);

  if (founderProjectIds.length > 0) {
    const { data: application } = await supabase
      .from('applications')
      .select('id')
      .eq('student_id', id)
      .in('project_id', founderProjectIds)
      .limit(1);
    hasRelationship = (application?.length ?? 0) > 0;
  }

  if (!hasRelationship) {
    const { data: orders } = await supabase
      .from('shortlist_orders')
      .select('project_id')
      .eq('founder_id', user.id)
      .eq('status', 'confirmed');

    const generalUnlocked = (orders ?? []).some((o) => o.project_id == null);
    const confirmedProjectIds = (orders ?? [])
      .map((o) => o.project_id)
      .filter((p): p is string => p != null);

    if (generalUnlocked || confirmedProjectIds.length > 0) {
      let query = supabase
        .from('shortlists')
        .select('id')
        .eq('student_id', id)
        .eq('founder_id', user.id);

      if (!generalUnlocked) {
        query = query.in('project_id', confirmedProjectIds);
      }

      const { data: shortlist } = await query.limit(1);
      hasRelationship = (shortlist?.length ?? 0) > 0;
    }
  }

  if (!hasRelationship) {
    return NextResponse.json({ error: 'No relationship with this student' }, { status: 403 });
  }

  const { data: signed } = await supabase.storage
    .from('cvs')
    .createSignedUrl(sp.cv_path, 300);

  if (!signed?.signedUrl) {
    return NextResponse.json({ error: 'Could not generate CV link' }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
