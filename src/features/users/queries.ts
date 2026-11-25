/**
 * Typed student-profile reads/writes. Thin wrappers over existing
 * `@/lib/neon-data` helpers — no SQL and no new database client here.
 * The atomic profile save stays in ./actions.ts because it uses one
 * transaction across two tables.
 */
import {
  getProfileRole,
  getStudentProfile,
  listAdminStudents,
  listBrowseableStudents,
  listStudentApplications,
  listStudentAppliedProjectIds,
  listStudentProfiles,
  setStudentProfileCv,
  upsertStudentProfile,
} from '@/lib/neon-data';
import type { ApplicationRow } from '@/lib/neon-data';
import type {
  BrowseStudentRow,
  Role,
  StudentProfileInput,
  StudentProfileRow,
} from './types';

export async function loadUserRole(userId: string): Promise<Role | null> {
  return getProfileRole(userId);
}

export async function loadStudentProfile(id: string): Promise<StudentProfileRow | null> {
  return getStudentProfile(id);
}

export async function loadStudentProfiles(ids: string[]): Promise<StudentProfileRow[]> {
  return listStudentProfiles(ids);
}

export async function loadBrowseableStudents(): Promise<BrowseStudentRow[]> {
  return listBrowseableStudents();
}

export async function loadAllStudents(): Promise<StudentProfileRow[]> {
  return listAdminStudents();
}

export async function loadStudentApplications(studentId: string): Promise<ApplicationRow[]> {
  return listStudentApplications(studentId);
}

export async function loadStudentAppliedProjectIds(studentId: string): Promise<string[]> {
  return listStudentAppliedProjectIds(studentId);
}

/** Publish a storage path as the student's current CV. */
export async function writeStudentCv(
  studentId: string,
  cvPath: string,
  updatedAt: string
): Promise<void> {
  await setStudentProfileCv(studentId, cvPath, updatedAt);
}

/** Non-transactional profile write for callers that only touch one table. */
export async function writeStudentProfile(input: StudentProfileInput): Promise<void> {
  await upsertStudentProfile(input);
}
