/**
 * App-wide public configuration.
 *
 * APP_URL is used for allow-listed auth redirects and generated CV links. It
 * must come from a configured public site URL or a fixed fallback — never from
 * the request Host header, which an attacker can control.
 */
const FALLBACK_APP_URL = 'https://myidea-virid.vercel.app';

function isLocalOrigin(value: string): boolean {
  try {
    return ['localhost', '127.0.0.1', '0.0.0.0'].includes(new URL(value).hostname);
  } catch {
    return false;
  }
}

function resolveAppUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim();

  // A localhost value is useful in dev but wrong in a deployed sitemap,
  // canonical tag or auth redirect. Ignore it in production.
  const usable = configured && !(process.env.NODE_ENV === 'production' && isLocalOrigin(configured));
  if (usable) {
    try {
      const parsed = new URL(configured);
      const isHttp = parsed.protocol === 'http:' || parsed.protocol === 'https:';
      const hasCredentials = Boolean(parsed.username || parsed.password);
      if (isHttp && !hasCredentials) return parsed.origin;
    } catch {
      // Invalid configuration falls through to the deployment origin.
    }
  }

  // Vercel injects VERCEL_URL automatically; use it when no public URL is set.
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.trim().replace(/^https?:\/\//, '')}`;
  }

  return FALLBACK_APP_URL;
}

export const APP_URL = resolveAppUrl();

/** Short-lived marker set by the auth callback after a recovery exchange. */
export const PASSWORD_RECOVERY_COOKIE = 'btc-password-recovery';
export const PASSWORD_RECOVERY_MAX_AGE_SECONDS = 15 * 60;

export const APP_CONTACT = {
  // Production sets CONTACT_EMAIL to the real mailbox; the fallback is an
  // explicit placeholder, never an old domain that looks authoritative.
  email: process.env.CONTACT_EMAIL?.trim() || 'hello@example.com',
  name: 'Bhutan Tech Connect',
};
