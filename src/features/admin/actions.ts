'use server';

/**
 * Admin student-management actions — manual ranking, verification,
 * and shortlist generation for a founder/project.
 */
import { revalidatePath } from 'next/cache';
import { APP_URL } from '@/lib/env';
import { getUser } from '@/lib/auth';
import { PACKAGES, type PackageId } from '@/config/payment';
import {
  getProfileRole,
  getProfile,
  setStudentRank as setRankRow,
  setStudentVerified as setVerifiedRow,
  listStudentProfiles,
  listFounderOrders,
  getProject,
  replaceAdminShortlist,
  type OrderRow,
} from '@/lib/neon-data';

export interface AdminResult {
  ok: boolean;
  message: string;
}

export interface ShortlistTextResult extends AdminResult {
  text?: string;
}

async function requireAdmin(): Promise<{ error: string | null }> {
  const user = await getUser();
  if (!user) return { error: 'Not signed in.' };

  const role = await getProfileRole(user.id);
  if (role !== 'admin') return { error: 'Admins only.' };

  return { error: null };
}

function isPackageId(value: string): value is PackageId {
  return Object.prototype.hasOwnProperty.call(PACKAGES, value);
}

/** Resolve the paid package from the founder's confirmed order history. */
function resolveOrderedPackage(
  orders: OrderRow[],
  projectId: string | null
): PackageId | null {
  const confirmed = orders.filter(
    (order) => order.status === 'confirmed' && isPackageId(order.package)
  );
  const exact = projectId
    ? confirmed.filter((order) => order.project_id === projectId)
    : confirmed.filter((order) => order.project_id === null);
  // A general confirmed order also applies when the admin generates a
  // project-specific shortlist; project orders take precedence.
  const order = exact[0] ?? confirmed.find((candidate) => candidate.project_id === null);
  if (!order || !isPackageId(order.package)) return null;
  return order.package;
}

/** Set a student's manual rank (null clears it). */
export async function setStudentRank(
  studentId: string,
  rank: number | null
): Promise<AdminResult> {
  const { error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const clean = rank != null && Number.isFinite(rank) && rank >= 1 ? Math.floor(rank) : null;

  try {
    await setRankRow(studentId, clean);
  } catch {
    return { ok: false, message: 'Could not save rank. Try again.' };
  }

  revalidatePath('/admin/students');
  revalidatePath('/admin');
  return { ok: true, message: 'Rank saved.' };
}

/** Toggle a student's verified flag. */
export async function setStudentVerified(
  studentId: string,
  verified: boolean
): Promise<AdminResult> {
  const { error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  try {
    await setVerifiedRow(studentId, verified);
  } catch {
    return { ok: false, message: 'Could not update verification. Try again.' };
  }

  revalidatePath('/admin/students');
  revalidatePath('/founder/browse-students');
  return { ok: true, message: verified ? 'Student verified.' : 'Verification removed.' };
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
  const { error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  if (!founderId) return { ok: false, message: 'Choose a founder.' };
  if (studentIds.length === 0) return { ok: false, message: 'Select at least one student.' };

  let founder;
  let project;
  try {
    founder = await getProfile(founderId);
    if (!founder || founder.role !== 'founder') {
      return { ok: false, message: 'Choose a valid founder.' };
    }
    project = projectId ? await getProject(projectId) : null;
    if (projectId && (!project || project.founder_id !== founderId)) {
      return { ok: false, message: 'Choose one of this founder’s projects.' };
    }
  } catch {
    return { ok: false, message: 'Could not verify the founder and project. Try again.' };
  }

  let packageId: PackageId | null;
  try {
    packageId = resolveOrderedPackage(await listFounderOrders(founderId), projectId);
  } catch {
    return { ok: false, message: 'Could not verify the ordered package. Try again.' };
  }
  // No confirmed order with a known package (legacy/admin-only shortlist):
  // generation stays available, but no package size promise is claimed here.

  let rows;
  try {
    rows = await listStudentProfiles(studentIds);
  } catch {
    return { ok: false, message: 'Could not load selected students.' };
  }
  if (rows.length === 0) {
    return { ok: false, message: 'Could not load selected students.' };
  }

  // Manual rank order first, then unranked
  const ordered = [...rows].sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999));

  if (packageId) {
    const pkg = PACKAGES[packageId];
    if (ordered.length < pkg.minStudents || ordered.length > pkg.maxStudents) {
      return {
        ok: false,
        message: `${pkg.name} shortlists must include ${pkg.minStudents}–${pkg.maxStudents} students. You selected ${ordered.length}.`,
      };
    }
  }

  // CV links via the /api/cv/[id] proxy — never expire, unlike signed URLs.
  // Use the configured APP_URL, never a spoofable Host header.
  const cvLinkFor = (row: (typeof rows)[number]) =>
    row.cv_path ? `${APP_URL}/api/cv/${row.id}` : '-';

  // Context was verified above: founder role + project ownership.
  let projectTitle = 'General shortlist';
  if (project?.title) projectTitle = project.title;

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

  // Persist: replace this founder's ADMIN-sourced entries for the SAME
  // project only. Founder-requested rows are never wiped by regeneration.
  try {
    await replaceAdminShortlist(founderId, projectId, ordered.map((s) => s.id));
  } catch {
    return { ok: false, message: 'Could not save shortlist. Try again.' };
  }

  revalidatePath('/founder/shortlists');
  revalidatePath('/admin/students');
  return { ok: true, message: 'Shortlist ready.', text: lines.join('\n') };
}
