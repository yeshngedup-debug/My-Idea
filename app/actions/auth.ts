'use server';

/**
 * Auth server actions — login, signup, logout.
 * After login, redirects to the dashboard matching the user's role.
 */
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type Role = 'student' | 'founder' | 'admin';

export async function login(formData: FormData) {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    redirect('/login?error=missing');
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect('/login?error=invalid');
  }

  redirect(await dashboardPathForCurrentUser(supabase));
}

export async function signup(formData: FormData) {
  const firstName = String(formData.get('firstName') ?? '').trim();
  const lastName = String(formData.get('lastName') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const roleInput = String(formData.get('role') ?? 'student');
  const role: Role = roleInput === 'founder' ? 'founder' : 'student';

  if (!email || !password || password.length < 6) {
    redirect('/signup?error=invalid');
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        full_name: [firstName, lastName].filter(Boolean).join(' '),
      },
    },
  });

  if (error) {
    redirect('/signup?error=exists');
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  switch (profile?.role as Role | undefined) {
    case 'founder':
      return '/founder';
    case 'admin':
      return '/admin';
    case 'student':
    default:
      return '/student';
  }
}
