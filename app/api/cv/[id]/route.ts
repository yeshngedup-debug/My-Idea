/**
 * CV proxy route — GET /api/cv/[id]
 *
 * Founders/admins can download a student's CV only when there is a
 * legitimate relationship: the student has applied to one of the
 * founder's projects, or the student is on one of the founder's
 * shortlists AND the founder holds a confirmed paid order. Admins
 * retain unrestricted access.
 *
 * Supabase Storage signs the URL; Neon holds the authorization rows.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getProfileRole,
  getStudentProfile,
  hasApplicationToFounderProject,
  listConfirmedOrderProjectIds,
  hasShortlistWithOrder,
} from '@/lib/neon-data';

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

  const role = await getProfileRole(user.id);

  if (!role || !['founder', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const studentProfile = await getStudentProfile(id);

  if (!studentProfile?.cv_path) {
    return NextResponse.json({ error: 'CV not found' }, { status: 404 });
  }

  // Admins can download any CV.
  if (role === 'admin') {
    const { data: signed } = await supabase.storage
      .from('cvs')
      .createSignedUrl(studentProfile.cv_path, 300);
    if (!signed?.signedUrl) {
      return NextResponse.json({ error: 'Could not generate CV link' }, { status: 500 });
    }
    return NextResponse.redirect(signed.signedUrl);
  }

  // Founders: an application to one of their projects is enough. A
  // shortlist row alone is NOT — the founder must also hold a confirmed
  // paid order (mirrors the storage RLS policy added in
  // 20261124000000_close_security_bypasses.sql).
  let hasRelationship = await hasApplicationToFounderProject(id, user.id);

  if (!hasRelationship) {
    const orders = await listConfirmedOrderProjectIds(user.id);
    const generalUnlocked = orders.some((o) => o.projectId == null);
    const confirmedProjectIds = orders
      .map((o) => o.projectId)
      .filter((p): p is string => p != null);

    hasRelationship = await hasShortlistWithOrder(
      user.id,
      id,
      generalUnlocked,
      confirmedProjectIds
    );
  }

  if (!hasRelationship) {
    return NextResponse.json({ error: 'No relationship with this student' }, { status: 403 });
  }

  const { data: signed } = await supabase.storage
    .from('cvs')
    .createSignedUrl(studentProfile.cv_path, 300);

  if (!signed?.signedUrl) {
    return NextResponse.json({ error: 'Could not generate CV link' }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
