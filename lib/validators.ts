/**
 * Zod validation schemas for server-action inputs.
 * All FormData entering a server action should be parsed through one
 * of these schemas so validation is centralised, typed, and testable.
 */
import { z } from 'zod';

const DURATIONS = ['1 week', '2 weeks', '1 month', '2 months', '3 months'] as const;
const WORK_MODES = ['remote', 'onsite'] as const;
const YEARS = ['1st', '2nd', '3rd', '4th', 'Graduate'] as const;
const AVAILABILITY = ['weekdays', 'weekends', 'evenings', 'full_time', 'flexible'] as const;

/** Shared skill list: max 15, each trimmed non-empty string. */
const skills = z
  .string()
  .transform((raw) =>
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 15)
  )
  .or(z.array(z.string()).max(15));

export const createProjectSchema = z
  .object({
    title: z.string().min(5, 'Title must be at least 5 characters.'),
    description: z.string()
      .min(20, 'Description must be at least 20 characters.')
      .max(2000, 'Description must be at most 2000 characters.'),
    duration: z.enum(DURATIONS, 'Choose a duration.'),
    workMode: z.enum(WORK_MODES).default('remote'),
    deadline: z.string().optional().or(z.literal('')),
    budgetMin: z.coerce.number().positive('Budget minimum must be positive.'),
    budgetMax: z.coerce.number().positive('Budget maximum must be positive.'),
    skills,
  })
  .refine((data) => data.budgetMin <= data.budgetMax, {
    message: 'Budget minimum cannot exceed maximum.',
    path: ['budgetMin'],
  });

export const saveStudentProfileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required.'),
  college: z.string().optional(),
  course: z.string().optional(),
  year: z.enum(YEARS).optional().or(z.literal('')),
  availability: z.enum(AVAILABILITY).optional().or(z.literal('')),
  skills,
  bio: z.string().max(600, 'Bio must be at most 600 characters.').optional(),
});

export const shortlistOrderSchema = z.object({
  amount: z
    .preprocess((val) => (val == null ? undefined : Number(val)), z.number().positive().optional()),
});
