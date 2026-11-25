/**
 * Small shared values used across server actions, routes and client forms.
 * Config already owned by another module is re-exported, not duplicated.
 * This module is client-safe: it imports no server-only code.
 */
export {
  APP_URL,
  PASSWORD_RECOVERY_COOKIE,
  PASSWORD_RECOVERY_MAX_AGE_SECONDS,
} from '@/config/app';
export { PACKAGES } from '@/config/payment';

export const ROLES = ['student', 'founder', 'admin'] as const;
export type AppRole = (typeof ROLES)[number];

export const STORAGE_BUCKETS = {
  cvs: 'cvs',
  paymentScreenshots: 'payment-screenshots',
} as const;

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const CV_SIGNED_URL_TTL_SECONDS = 300;

export const PAYMENT_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;

/** Both the CV proxy and the project detail route reject non-UUID ids. */
export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const RATE_LIMITS = {
  login: { limit: 5, windowMs: 60 * 1000 },
  signup: { limit: 3, windowMs: 60 * 1000 },
  passwordResetRequest: { limit: 3, windowMs: 60 * 1000 },
  passwordReset: { limit: 3, windowMs: 60 * 1000 },
  order: { limit: 10, windowMs: 60 * 1000 },
} as const;
