'use server';

/**
 * Auth server actions — login, signup, logout, and self-service password
 * recovery. After login, redirects to the dashboard matching the user's role.
 *
 * Security: role is NEVER accepted from client FormData during signup.
 * Every new account gets the server-assigned student profile in Neon; elevated
 * roles are granted by an admin there. The auth provider never receives a
 * client-supplied role.
 *
 * Password recovery never reveals whether an email has an account: valid
 * requests always redirect to the same `sent` query contract.
 */
import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { auth } from '@/lib/auth/server';
import { getUser } from '@/lib/auth';
import { getProfileRole, ensureProfile } from '@/lib/neon-data';
import { rateLimit } from '@/lib/rate-limit';
import { APP_URL } from '@/config/app';
import { RESET_TOKEN_COOKIE } from '@/app/auth/callback/route';
import {
  EMAIL_PATTERN,
  MAX_EMAIL_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  signupSchema,
} from '@/features/auth/schemas';

type Role = 'student' | 'founder' | 'admin';

/** The auth provider reports duplicate signups and weak passwords differently across versions. */
function signupErrorToken(error: { code?: string; message?: string }): string {
  const code = error.code?.toLowerCase() ?? '';
  const message = error.message?.toLowerCase() ?? '';

  if (
    code === '23505' ||
    code === 'user_already_exists' ||
    message.includes('already') ||
    message.includes('duplicate') ||
    message.includes('registered')
  ) {
    return 'exists';
  }

  if (
    code === 'weak_password' ||
    code === 'validation_failed' ||
    message.includes('weak') ||
    message.includes('invalid') ||
    message.includes('password')
  ) {
    return 'invalid';
  }

  // The signup page already renders a generic message for unknown tokens.
  return 'unknown';
}

/** Provider error codes live in different fields depending on the failure. */
function errorCode(error: unknown): string | number | undefined {
  const detail = error as { code?: string; status?: number } | null;
  return detail?.code ?? detail?.status;
}

/** The rightmost forwarded hop is set by the nearest trusted proxy; the leftmost value can be spoofed. */
async function rateLimitKey(action: string, email: string): Promise<string> {
  const h = await headers();
  const hops = (h.get('x-forwarded-for') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const ip = hops.at(-1) ?? h.get('x-real-ip')?.trim() ?? 'unknown';
  return `${action}:${ip}:${email.trim().toLowerCase()}`;
}

function isValidEmail(email: string): boolean {
  return email.length <= MAX_EMAIL_LENGTH && EMAIL_PATTERN.test(email);
}

function isValidPassword(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH && password.length <= MAX_PASSWORD_LENGTH;
}

async function resetTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(RESET_TOKEN_COOKIE)?.value ?? null;
}

async function clearResetTokenCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(RESET_TOKEN_COOKIE);
}

export async function login(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    redirect('/login?error=missing');
  }

  // Rate limit login attempts per IP + email (brute-force protection).
  const { ok } = rateLimit(await rateLimitKey('login', email), { limit: 5, windowMs: 60 * 1000 });
  if (!ok) {
    redirect('/login?error=rate-limited');
  }

  const { data, error } = await auth.signIn.email({ email, password });
  // Use the user from the sign-in response directly. A second getSession()
  // read in the same Server Action is not reliable once cookies are written.
  const user = data?.user;
  if (error || !user) {
    redirect('/login?error=invalid');
  }

  // Neon is the source of truth for roles. A failed or missing role lookup
  // fails closed: end the session instead of rendering a stale dashboard.
  let role: Role | null = null;
  try {
    role = await getProfileRole(user.id);
  } catch (error) {
    console.error('[auth] Could not read the role on login', error);
    await auth.signOut();
    redirect('/login?error=profile-sync');
  }

  if (!role) {
    await auth.signOut();
    redirect('/login?error=profile-sync');
  }

  const resolved: Role =
    role === 'admin' || role === 'founder' ? role : 'student';
  redirect(resolved === 'admin' ? '/admin' : resolved === 'founder' ? '/founder' : '/student');
}

export async function signup(formData: FormData) {
  const firstName = String(formData.get('firstName') ?? '').trim();
  const lastName = String(formData.get('lastName') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  const parsed = signupSchema.safeParse({ firstName, lastName, email, password });
  if (!parsed.success) {
    redirect('/signup?error=invalid');
  }

  const {
    firstName: validFirstName,
    lastName: validLastName,
    email: validEmail,
    password: validPassword,
  } = parsed.data;
  const fullName = [validFirstName, validLastName].filter(Boolean).join(' ');

  // Rate limit signup attempts per IP + email (abuse protection).
  const { ok } = rateLimit(await rateLimitKey('signup', validEmail), { limit: 3, windowMs: 60 * 1000 });
  if (!ok) {
    redirect('/signup?error=rate-limited');
  }

  // No 'role' is ever read from FormData: every new account is a student.
  const { data, error } = await auth.signUp.email({
    email: validEmail,
    name: fullName,
    password: validPassword,
  });

  if (error) {
    redirect(`/signup?error=${signupErrorToken(error)}`);
  }

  if (data?.user) {
    // Mirror the server-assigned student role into Neon so role lookups and
    // dashboards agree. A failed mirror can be retried on the next login.
    try {
      await ensureProfile(data.user.id, fullName || null);
    } catch (error) {
      // The profile also gets mirrored on a later identity sync, and role
      // lookups fail closed until then. Surface the failure in server logs.
      console.error('[auth] Could not mirror the new profile into Neon', error);
    }
    redirect(await dashboardPathForCurrentUser(data.user.id));
  }

  redirect('/login?message=check-email');
}

/**
 * Ask the auth provider to email a recovery link. The redirect is pinned to
 * APP_URL and then through our callback; no request-controlled URL is accepted.
 */
export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();

  if (!isValidEmail(email)) {
    redirect('/forgot-password?error=invalid');
  }

  const { ok } = rateLimit(await rateLimitKey('password-reset-request', email), {
    limit: 3,
    windowMs: 60 * 1000,
  });
  if (!ok) {
    redirect('/forgot-password?error=rate-limited');
  }

  const { error } = await auth.requestPasswordReset({
    email,
    redirectTo: `${APP_URL}/auth/callback`,
  });

  if (error) {
    // Log only the provider code: the response must stay identical whether
    // the account exists or not, and the message may contain user input.
    console.error('[auth] Password reset request failed', { code: errorCode(error) });
  }

  redirect('/forgot-password?sent=1');
}

/** Set a new password only for a verified recovery token. */
export async function resetPassword(formData: FormData) {
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  if (!isValidPassword(password) || password !== confirmPassword) {
    redirect('/reset-password?error=invalid');
  }

  // The short-lived callback cookie carries the recovery token. It is never
  // exposed to client JavaScript, and its presence proves this form was
  // reached from a recovery link rather than an ordinary login.
  const token = await resetTokenFromCookie();
  if (!token) {
    redirect('/forgot-password?error=session');
  }

  const user = await getUser();
  const { ok } = rateLimit(await rateLimitKey('password-reset', user?.email ?? ''), {
    limit: 3,
    windowMs: 60 * 1000,
  });
  if (!ok) {
    redirect('/reset-password?error=rate-limited');
  }

  const { error } = await auth.resetPassword({ newPassword: password, token });
  if (error) {
    console.error('[auth] Password update failed', { code: errorCode(error) });
    redirect('/reset-password?error=invalid');
  }

  await clearResetTokenCookie();
  await auth.signOut();
  redirect('/login?message=password-updated');
}

export async function logout() {
  await auth.signOut();
  redirect('/login');
}

/** Resolve the correct dashboard path without guessing a role on failure. */
async function dashboardPathForCurrentUser(userId: string): Promise<string> {
  let role: Role | null = null;
  try {
    role = await getProfileRole(userId);
  } catch (error) {
    console.error('[auth] Could not resolve the dashboard role', error);
  }

  if (role === 'founder') return '/founder';
  if (role === 'admin') return '/admin';
  if (role === 'student') return '/student';

  // No trustworthy role means no dashboard. Sign out so the proxy cannot
  // resolve a stale role from Neon on the next request.
  try {
    await auth.signOut();
  } catch (error) {
    // The login redirect still ends the signup flow, but a failed sign-out
    // leaves a session behind and must be visible in server logs.
    console.error('[auth] Could not sign out after a failed role lookup', error);
  }
  return '/login?error=profile-sync';
}
