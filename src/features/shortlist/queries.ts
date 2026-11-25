/**
 * Typed shortlist data access. Thin wrappers over `@/lib/neon-data`; the
 * relationship/idempotency rules stay in the shared helper and in ./actions.
 */
import {
  getProfileRole,
  getShortlist,
  hasApplicationToFounderProject,
  hasShortlistWithOrder,
  listBrowseableStudents,
  listConfirmedOrderProjectIds,
  listFounderShortlists,
  listShortlistedStudentIds,
  requestShortlist,
} from '@/lib/neon-data';
import type { BrowseStudentRow, Role } from '@/lib/neon-data';
import type { ShortlistRow } from './types';

export async function loadUserRole(userId: string): Promise<Role | null> {
  return getProfileRole(userId);
}

/** Insert (or make idempotently requested) a founder-sourced shortlist row. */
export async function writeFounderShortlist(
  founderId: string,
  studentId: string,
  projectId: string | null
): Promise<void> {
  await requestShortlist(founderId, studentId, projectId);
}

export async function loadShortlist(
  founderId: string,
  studentId: string
): Promise<{ id: string } | null> {
  return getShortlist(founderId, studentId);
}

export async function loadShortlistedStudentIds(
  founderId: string
): Promise<string[]> {
  return listShortlistedStudentIds(founderId);
}

export async function loadFounderShortlists(
  founderId: string
): Promise<ShortlistRow[]> {
  return listFounderShortlists(founderId);
}

export async function loadBrowseableStudents(): Promise<BrowseStudentRow[]> {
  return listBrowseableStudents();
}

export async function loadConfirmedOrderProjects(
  founderId: string
): Promise<{ projectId: string | null }[]> {
  return listConfirmedOrderProjectIds(founderId);
}

/** Relationship check for a student who applied to one of the founder's projects. */
export async function hasAppliedToFounderProject(
  studentId: string,
  founderId: string
): Promise<boolean> {
  return hasApplicationToFounderProject(studentId, founderId);
}

/** Unlock check combining a confirmed general order with project orders. */
export async function hasShortlistAccess(
  founderId: string,
  studentId: string,
  generalUnlocked: boolean,
  confirmedProjectIds: string[]
): Promise<boolean> {
  return hasShortlistWithOrder(
    founderId,
    studentId,
    generalUnlocked,
    confirmedProjectIds
  );
}
