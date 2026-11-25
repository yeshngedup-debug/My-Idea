/**
 * Typed admin data access. Every function delegates to an existing
 * `@/lib/neon-data` helper — no SQL and no new database client here.
 */
import {
  getProfile,
  getProfileRole,
  getProject,
  listAdminStudents,
  listAllProjects,
  listAllProjectsWithDetails,
  listFounderOrders,
  listFounderProfiles,
  listRoleCounts,
  listStudentProfiles,
  replaceAdminShortlist,
  setStudentRank,
  setStudentVerified,
} from '@/lib/neon-data';
import type {
  FounderOption,
  OrderRow,
  ProjectRow,
  Role,
  StudentProfileRow,
} from './types';

/** Gate every admin action through the Neon role mirror. */
export async function loadAdminRole(userId: string): Promise<Role | null> {
  return getProfileRole(userId);
}

export async function loadProfile(id: string) {
  return getProfile(id);
}

export async function loadProject(id: string) {
  return getProject(id);
}

export async function loadStudentsByIds(ids: string[]): Promise<StudentProfileRow[]> {
  return listStudentProfiles(ids);
}

export async function loadAllStudents(): Promise<StudentProfileRow[]> {
  return listAdminStudents();
}

export async function loadFounders(): Promise<FounderOption[]> {
  return listFounderProfiles();
}

export async function loadRoleCounts(): Promise<{ role: string; count: number }[]> {
  return listRoleCounts();
}

export async function loadProjects(): Promise<ProjectRow[]> {
  return listAllProjectsWithDetails();
}

export async function loadProjectOptions(): Promise<
  { id: string; title: string; founder_id: string }[]
> {
  return listAllProjects();
}

export async function loadFounderOrders(founderId: string): Promise<OrderRow[]> {
  return listFounderOrders(founderId);
}

export async function writeStudentRank(
  studentId: string,
  rank: number | null
): Promise<void> {
  await setStudentRank(studentId, rank);
}

export async function writeStudentVerified(
  studentId: string,
  verified: boolean
): Promise<void> {
  await setStudentVerified(studentId, verified);
}

/** Only admin-sourced rows in the given scope are replaced. */
export async function writeAdminShortlist(
  founderId: string,
  projectId: string | null,
  studentIds: string[]
): Promise<void> {
  await replaceAdminShortlist(founderId, projectId, studentIds);
}
