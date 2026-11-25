/**
 * Typed environment contract built on Zod for the all-Neon stack.
 *
 * `@/lib/env` stays the canonical validator: it runs at client creation time
 * and produces a human-readable list of missing variables. This module
 * re-exports it unchanged and adds schema-based checks for new code.
 * Nothing is parsed at module load, so builds can collect route config without
 * secrets present.
 */
import { z } from 'zod';
import { validateEnv as validateLegacyEnv } from '@/lib/env';

export { validateEnv, assertNoDemoUsers, APP_URL } from '@/lib/env';

const requiredText = z.string().trim().min(1);
const optionalEmail = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.email().optional()
);

export const envSchema = z.object({
  NEON_AUTH_BASE_URL: z.url(),
  NEON_AUTH_COOKIE_SECRET: z.string().min(32),
  DATABASE_URL: requiredText,
  NEXT_PUBLIC_APP_URL: z.url().optional(),
  CONTACT_EMAIL: optionalEmail,
  NEXT_PUBLIC_MESURER_ENABLED: z.enum(['0', '1']).optional(),
  NEXT_PUBLIC_NEON_REALTIME_URL: z.url().optional(),
  NEON_REALTIME_SECRET: requiredText.optional(),
  NEON_BRANCH_ID: requiredText.optional(),
  NEON_FUNCTION_HOST_SUFFIX: requiredText.optional(),
  // Injected by `neon deploy` / `neon env pull`; do not hardcode these.
  AWS_ACCESS_KEY_ID: requiredText.optional(),
  AWS_SECRET_ACCESS_KEY: requiredText.optional(),
  AWS_ENDPOINT_URL_S3: z.url().optional(),
  AWS_REGION: requiredText.optional(),
});

export type Env = z.infer<typeof envSchema>;

/** Validate values only; issue paths are listed, never the values themselves. */
export function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const fields = result.error.issues
      .map((issue) => issue.path.join('.'))
      .filter(Boolean)
      .join(', ');
    throw new Error(`Invalid environment variables: ${fields}. See .env.example.`);
  }
  return result.data;
}

/** Legacy required-variable check first, then typed parsing. */
export function validateEnvSchema(): Env {
  validateLegacyEnv();
  return parseEnv();
}
