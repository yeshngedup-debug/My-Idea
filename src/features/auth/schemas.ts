/**
 * Zod schemas for the auth forms.
 *
 * The server actions currently validate inline (FormData is read with
 * String(...) and checked directly). These schemas mirror those exact rules
 * so Client Components can validate before dispatch without importing a
 * server action. They intentionally do NOT accept a `role` field: signup
 * assigns 'student' on the server only.
 */
import { z } from 'zod';

/** Same pattern the login, signup and recovery actions use. */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MAX_EMAIL_LENGTH = 254;
export const MIN_PASSWORD_LENGTH = 6;
/** Reset-password action enforces the upper bound; signup only enforces the minimum. */
export const MAX_PASSWORD_LENGTH = 128;
export const MAX_FULL_NAME_LENGTH = 80;
export const MAX_NAME_PART_LENGTH = 80;

export const emailSchema = z
  .string()
  .trim()
  .max(MAX_EMAIL_LENGTH, 'Email is too long.')
  .regex(EMAIL_PATTERN, 'Enter a valid email address.');

/** Signup rule: minimum length, no upper bound in the action. */
export const signupPasswordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);

/** Reset-password rule: the action rejects both shorter and longer values. */
export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Use between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters.`)
  .max(MAX_PASSWORD_LENGTH, `Use between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters.`);

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required.'),
  password: z.string().min(1, 'Password is required.'),
});

export const signupSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, 'First name is required.')
      .max(MAX_NAME_PART_LENGTH, `First name must be ${MAX_NAME_PART_LENGTH} characters or fewer.`),
    lastName: z
      .string()
      .trim()
      .min(1, 'Last name is required.')
      .max(MAX_NAME_PART_LENGTH, `Last name must be ${MAX_NAME_PART_LENGTH} characters or fewer.`),
    email: emailSchema,
    password: signupPasswordSchema,
  })
  .refine(
    (value) =>
      [value.firstName, value.lastName].filter(Boolean).join(' ').length <= MAX_FULL_NAME_LENGTH,
    {
      message: `First and last names together must be ${MAX_FULL_NAME_LENGTH} characters or fewer.`,
      path: ['lastName'],
    }
  );

/** Non-enumerating recovery request: only the address is validated. */
export const passwordResetRequestSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Both password entries must match.',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
