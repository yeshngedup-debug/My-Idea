/**
 * Public types for the shortlist feature, derived from the action result and
 * the Neon shortlist row shape.
 */
import type { ShortlistRow } from '@/lib/neon-data';
import type { ShortlistResult } from './actions';
import type {
  RequestShortlistInput,
  ShortlistSource,
  ShortlistStatus,
} from './schemas';

export type { ShortlistResult, ShortlistRow, ShortlistSource, ShortlistStatus };

export type { RequestShortlistInput };

export type ShortlistId = ShortlistRow['id'];
export type StudentId = ShortlistRow['student_id'];
export type FounderId = ShortlistRow['founder_id'];

/** The scope a shortlist belongs to: general (project_id null) or per-project. */
export type ShortlistScope = Pick<
  ShortlistRow,
  'founder_id' | 'student_id' | 'project_id' | 'source'
>;
