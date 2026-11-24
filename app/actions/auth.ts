'use server';

/**
 * Auth server actions — login, signup, logout.
 * After login, redirects to the dashboard matching the user's role.
 *
 * Security: role is NEVER accepted from client FormData during signup.
 * Every new user is created as 'student' by default; roles are assigned
 * server-side by an admin (or via the Supabase SQL editor). The
 * on_auth_user_created trigger reads role from raw_user_meta_data but
 * ignores any client-supplied role — see lib/supabase/server.ts and the
 * prevent_role_change trigger.
 */
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getProfileRole, ensureProfile, syncProfileRole } from '@/lib/neon-data';
import { rateLimit } from '@/lib/rate-limit';

type Role = 'student' | 'founder' | 'admin';

/** Include the client IP so spraying many email addresses cannot bypass the limit. */
async function rateLimitKey(action: string, email: string): Promise<string> {
  const h = await headers();
  const ip = (h.get('x-forwarded-for') ?? h.get('x-real-ip') ?? 'unknown')
    .split(',')[0]
    .trim();
  return `${action}:${ip}:${email.toLowerCase()}`;
}

export async function login(formData: FormData) {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    redirect('/login?error=missing');
  }

  // Rate limit login attempts per IP + email (brute-force protection).
  const { ok } = rateLimit(await rateLimitKey('login', email), { limit: 5, windowMs: 60 * 1000 });
  if (!ok) {
    redirect('/login?error=rate-limited');
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect('/login?error=invalid');
  }

  // Mirror the identity provider's current role/full name into Neon so a
  // Supabase-only role change cannot leave stale elevated access in app code.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single();
    const role = (profile?.role === 'admin' || profile?.role === 'founder'
      ? profile.role
      : 'student') as 'student' | 'founder' | 'admin';
    try {
      await syncProfileRole(
        user.id,
        (profile?.full_name as string | null) ?? null,
        role,
      );
    } catch {
      // Keep the login usable; middleware still checks the Neon role on every
      // request and will fail closed if the profile is absent.
    }
  }

  redirect(await dashboardPathForCurrentUser(supabase));
}

export async function signup(formData: FormData) {
  const firstName = String(formData.get('firstName') ?? '').trim();
  const lastName = String(formData.get('lastName') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password || password.length < 6) {
    redirect('/signup?error=invalid');
  }

  // Rate limit signup attempts per IP + email (abuse protection).
  const { ok } = rateLimit(await rateLimitKey('signup', email), { limit: 3, windowMs: 60 * 1000 });
  if (!ok) {
    redirect('/signup?error=rate-limited');
  }

  const supabase = await createClient();

  // Role is assigned server-side as 'student' by default. The client
  // may send a 'role' field, but it is intentionally ignored here to
  // prevent self-service role escalation (C3).
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: 'student',
        full_name: [firstName, lastName].filter(Boolean).join(' '),
      },
    },
  });

  if (error) {
    redirect('/signup?error=exists');
  }

  // Email confirmation disabled in Supabase: a session comes back
  // immediately — go straight to the dashboard instead of a dead
  // "check your email" step.
  if (data.session && data.user) {
    // The Supabase trigger creates the auth-side profile; mirror the
    // server-assigned student role into Neon so lookups agree.
    try {
      await ensureProfile(data.user.id, [firstName, lastName].filter(Boolean).join(' ') || null);
    } catch {
      // The profile also gets mirrored on the next identity sync.
    }
    redirect(await dashboardPathForCurrentUser(supabase));
  }

  // Profile row is created automatically by the on_auth_user_created trigger.
  redirect('/login?message=check-email');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

/** Resolve the correct dashboard path from the profiles table. */
async function dashboardPathForCurrentUser(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return '/login';

  let role: Role | null = null;
  try {
    role = await getProfileRole(user.id);
  } catch {
    // A transient Neon outage must not turn a valid login into a 500.
  }

  switch (role as Role | undefined) {
    case 'founder':
      return '/founder';
    case 'admin':
      return '/admin';
    case 'student':
    default:
      return '/student';
  }
}
