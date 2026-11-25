/**
 * App-wide public configuration.
 *
 * APP_URL is used for allow-listed auth redirects and generated CV links. It
 * must come from a configured public site URL or a fixed fallback — never from
 * the request Host header, which an attacker can control.
 */
const FALLBACK_APP_URL = 'https://bhutantech.bt';

function resolveAppUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) return FALLBACK_APP_URL;

  try {
    const parsed = new URL(configured);
    const isHttp = parsed.protocol === 'http:' || parsed.protocol === 'https:';
    const hasCredentials = Boolean(parsed.username || parsed.password);
    if (isHttp && !hasCredentials) return parsed.origin;
  } catch {
    // Invalid configuration falls back to the known public origin.
  }

  return FALLBACK_APP_URL;
}

export const APP_URL = resolveAppUrl();

/** Short-lived marker set by the auth callback after a recovery exchange. */
export const PASSWORD_RECOVERY_COOKIE = 'btc-password-recovery';
export const PASSWORD_RECOVERY_MAX_AGE_SECONDS = 15 * 60;

export const APP_CONTACT = {
  email: process.env.CONTACT_EMAIL ?? 'hello@bhutantech.bt',
  name: 'Bhutan Tech Connect',
};
