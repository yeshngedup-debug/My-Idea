/**
 * Feature flags derived from the environment variables already documented in
 * .env.example. All values are plain booleans; no feature is on by accident.
 */
import { PAYMENT_CONFIGURED } from '@/config/payment';

function isEnabledValue(value: string | undefined): boolean {
  return value === '1' || value?.toLowerCase() === 'true';
}

export const features = {
  /** Dev-only measurement panel; the root layout applies the same two checks. */
  mesurer:
    process.env.NODE_ENV === 'development' &&
    isEnabledValue(process.env.NEXT_PUBLIC_MESURER_ENABLED),
  /** Live payment status needs only the public realtime URL to subscribe. */
  neonRealtime: Boolean(process.env.NEXT_PUBLIC_NEON_REALTIME_URL?.trim()),
  /** Manual payments are disabled until both destinations are configured. */
  payments: PAYMENT_CONFIGURED,
} as const;

export type FeatureFlag = keyof typeof features;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return features[flag];
}
