/**
 * Typed project reads. Every function delegates to an existing
 * `@/lib/neon-data` helper — no SQL and no new database client here.
 * Writes stay in ./actions.ts where authorization and revalidation live.
 */
import {
  getApplication,
  getProfileRole,
  getProject,
  hasApplicationToFounderProject,
  listAllApplicationStudentIds,
  listAllProjects,
  listAllProjectsWithDetails,
  listOpenProjects,
  listProjectApplicants,
  listProjectStatuses,
  listProjectsByFounder,
  listStudentApplications,
  listStudentAppliedProjectIds,
} from '@/lib/neon-data';
import type {
  ApplicationRow,
  OpenProjectRow,
  ProjectRow,
  Role,
} from './types';

export async function loadUserRole(userId: string): Promise<Role | null> {
  return getProfileRole(userId);
}

export async function loadProject(id: string): Promise<ProjectRow | null> {
  return getProject(id);
}

export async function loadOpenProjects(): Promise<OpenProjectRow[]> {
  return listOpenProjects();
}

export async function loadFounderProjects(founderId: string): Promise<ProjectRow[]> {
  return listProjectsByFounder(founderId);
}

export async function loadAllProjects(): Promise<ProjectRow[]> {
  return listAllProjectsWithDetails();
}

export async function loadProjectOptions(): Promise<
  { id: string; title: string; founder_id: string }[]
> {
  return listAllProjects();
}

export async function loadProjectStatuses(): Promise<string[]> {
  return listProjectStatuses();
}

export async function loadApplication(id: string) {
  return getApplication(id);
}

export async function loadProjectApplicants(projectId: string): Promise<ApplicationRow[]> {
  return listProjectApplicants(projectId);
}

export async function loadStudentApplications(studentId: string): Promise<ApplicationRow[]> {
  return listStudentApplications(studentId);
}

export async function loadStudentAppliedProjectIds(studentId: string): Promise<string[]> {
  return listStudentAppliedProjectIds(studentId);
}

export async function loadAllApplicantStudentIds(): Promise<string[]> {
  return listAllApplicationStudentIds();
}

/** Relationship check reused by the founder shortlist flow. */
export async function hasAppliedToFounderProject(
  studentId: string,
  founderId: string
): Promise<boolean> {
  return hasApplicationToFounderProject(studentId, founderId);
}
