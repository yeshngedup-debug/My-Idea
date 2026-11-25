/**
 * Zod schemas for founder shortlist inputs.
 *
 * `requestShortlist` relies on server-side role and relationship checks;
 * the only client-controllable value is the student ID, which must be
 * present. The other schemas describe values read back from Neon rows.
 */
import { z } from 'zod';

export const studentIdSchema = z.string().min(1, 'Student not found.');
export const founderIdSchema = z.string().min(1, 'Choose a founder.');
export const projectIdSchema = z.string().min(1).nullable();

export const requestShortlistInputSchema = z.object({
  studentId: studentIdSchema,
});

/** Values stored in `public.shortlists.source`. */
export const shortlistSourceSchema = z.enum(['founder', 'admin']);

/** Values stored in `public.shortlists.status`. */
export const shortlistStatusSchema = z.enum(['requested', 'contacted', 'hired', 'rejected']);

export type RequestShortlistInput = z.infer<typeof requestShortlistInputSchema>;
export type ShortlistSource = z.infer<typeof shortlistSourceSchema>;
export type ShortlistStatus = z.infer<typeof shortlistStatusSchema>;
