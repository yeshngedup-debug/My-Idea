/**
 * CV proxy route — GET /api/cv/[id]
 *
 * Founders/admins can download a student's CV only when there is a
 * legitimate relationship: the student has applied to one of the
 * founder's projects, or the student is on one of the founder's
 * shortlists AND the founder holds a confirmed paid order. Admins
 * retain unrestricted access.
 *
 * The storage helper signs the URL; Neon holds the authorization rows.
 */
import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { signCv } from '@/lib/storage';
import {
  getProfileRole,
  getStudentProfile,
  hasApplicationToFounderProject,
  listConfirmedOrderProjectIds,
  hasShortlistWithOrder,
} from '@/lib/neon-data';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function redirectToSignedCv(cvPath: string) {
  let signed: string;
  try {
    signed = await signCv(cvPath);
  } catch (error) {
    console.error('[cv] Could not create a signed CV URL', error);
    return NextResponse.json(
      { error: 'Could not open the CV right now. Try again later.' },
      { status: 502 }
    );
  }

  return NextResponse.redirect(signed);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: 'Invalid student ID.' }, { status: 400 });
  }

  const user = await getUser();
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
    return redirectToSignedCv(studentProfile.cv_path);
  }

  // Founders: an application to one of their projects is enough. A
  // shortlist row alone is NOT — the founder must also hold a confirmed
  // paid order (the same relationship rule the signed-URL policy enforced).
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

  return redirectToSignedCv(studentProfile.cv_path);
}
