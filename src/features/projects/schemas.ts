/**
 * Zod schemas for project and application inputs.
 *
 * `createProjectSchema` already lives in the shared validators module and is
 * used verbatim by `createProject`; re-export it rather than duplicating the
 * rules. The status enums below mirror the constants checked in the actions.
 */
import { z } from 'zod';

export { createProjectSchema } from '@/lib/validators';

export const projectStatusSchema = z.enum([
  'open',
  'in_progress',
  'review',
  'completed',
]);

export const applicationStatusSchema = z.enum([
  'pending',
  'shortlisted',
  'accepted',
  'rejected',
]);

export const projectIdSchema = z.string().min(1, 'Choose a project.');
export const applicationIdSchema = z.string().min(1, 'Choose an application.');

export type ProjectStatus = z.infer<typeof projectStatusSchema>;
export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;
