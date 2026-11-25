/**
 * Zod schemas for admin student-management inputs.
 *
 * The actions check a small set of conditions inline (non-empty IDs, a
 * positive finite rank, a non-empty selection, and the confirmed package's
 * size range). These schemas encode those same rules for reuse and testing.
 */
import { z } from 'zod';
import { PACKAGES, type PackageId } from '@/config/payment';

export const studentIdSchema = z.string().min(1, 'Choose a student.');
export const founderIdSchema = z.string().min(1, 'Choose a founder.');
export const projectIdSchema = z.string().min(1).nullable();

/** The action normalises non-positive / non-finite ranks to null. */
export const studentRankSchema = z.number().finite().nullable();

/** Package keys are the only ones the app knows how to size-check. */
export const packageIdSchema = z.enum(
  Object.keys(PACKAGES) as [PackageId, ...PackageId[]]
);

export const setStudentRankInputSchema = z.object({
  studentId: studentIdSchema,
  rank: studentRankSchema,
});

export const setStudentVerifiedInputSchema = z.object({
  studentId: studentIdSchema,
  verified: z.boolean(),
});

export const generateShortlistInputSchema = z.object({
  studentIds: z.array(studentIdSchema).min(1, 'Select at least one student.'),
  founderId: founderIdSchema,
  projectId: projectIdSchema,
});

/** Package-specific size rule used by `generateShortlist`. */
export function shortlistSizeSchema(packageId: PackageId) {
  const { name, minStudents, maxStudents } = PACKAGES[packageId];
  return z
    .number()
    .int()
    .min(minStudents, `${name} shortlists must include at least ${minStudents} students.`)
    .max(maxStudents, `${name} shortlists must include at most ${maxStudents} students.`);
}

export type SetStudentRankInput = z.infer<typeof setStudentRankInputSchema>;
export type SetStudentVerifiedInput = z.infer<typeof setStudentVerifiedInputSchema>;
export type GenerateShortlistInput = z.infer<typeof generateShortlistInputSchema>;
export type AdminPackageId = z.infer<typeof packageIdSchema>;
