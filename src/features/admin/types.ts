/**
 * Public types for the admin feature, derived from the action results and
 * the Neon row shapes those actions read and write.
 */
import type { z } from 'zod';
import type {
  OrderRow,
  ProjectRow,
  Role,
  StudentProfileRow,
} from '@/lib/neon-data';
import type { AdminResult, ShortlistTextResult } from './actions';
import type { generateShortlistInputSchema, packageIdSchema } from './schemas';

export type { AdminResult, ShortlistTextResult, Role, OrderRow, ProjectRow, StudentProfileRow };

export type AdminPackageId = z.infer<typeof packageIdSchema>;
export type GenerateShortlistInput = z.infer<typeof generateShortlistInputSchema>;

/** A student as it appears on the admin ranking screen. */
export type AdminStudentRow = StudentProfileRow;

/** Fields the shortlist text actually renders from a student row. */
export type ShortlistStudent = Pick<
  StudentProfileRow,
  | 'id'
  | 'full_name'
  | 'college'
  | 'course'
  | 'year'
  | 'rank'
  | 'verified'
  | 'skills'
  | 'availability'
  | 'contact_email'
  | 'cv_path'
>;

/** Founder option shown in the shortlist generator. */
export type FounderOption = { id: string; full_name: string | null };
