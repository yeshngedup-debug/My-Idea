/**
 * Public types for the projects feature, derived from the action results and
 * the Neon project/application row shapes.
 */
import type {
  ApplicationRow,
  NewProject,
  OpenProjectRow,
  ProjectRow,
  Role,
} from '@/lib/neon-data';
import type { ProjectResult } from './actions';
import type { ApplicationStatus, ProjectStatus } from './schemas';

export type {
  ProjectResult,
  ProjectRow,
  OpenProjectRow,
  ApplicationRow,
  NewProject,
  Role,
  ProjectStatus,
  ApplicationStatus,
};

export type ProjectId = ProjectRow['id'];
export type ApplicationId = ApplicationRow['id'];
export type StudentId = ApplicationRow['student_id'];

/** The minimal project record used on student cards and founder lists. */
export type ProjectSummary = Pick<
  ProjectRow,
  'id' | 'title' | 'description' | 'duration' | 'work_mode' | 'budget_min' | 'budget_max' | 'status'
>;

/** The minimal applicant record returned in a founder's project view. */
export type ApplicantSummary = Pick<ApplicationRow, 'id' | 'student_id' | 'status'> & {
  student: ApplicationRow['student'];
};
