/**
 * Public types for the users feature, derived from the profile action result
 * and the Neon student-profile row shapes.
 */
import type {
  BrowseStudentRow,
  Role,
  StudentProfileInput,
  StudentProfileRow,
} from '@/lib/neon-data';
import type { SaveResult } from './actions';

export type {
  SaveResult,
  Role,
  StudentProfileRow,
  StudentProfileInput,
  BrowseStudentRow,
};

export type StudentId = StudentProfileRow['id'];

/** Values accepted by the profile form before zod preprocessing. */
export type StudentProfileFormInput = {
  full_name: string;
  college?: string;
  course?: string;
  year?: string;
  availability?: string;
  skills: string | string[];
  bio?: string;
};

/** A profile row narrowed to the fields stored in one atomic save. */
export type StudentProfileWrite = StudentProfileInput;
