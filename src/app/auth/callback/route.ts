/**
 * Post-auth landing for Neon Managed Better Auth.
 *
 * Password-reset links arrive with a `token` query parameter. We park that
 * token in a short-lived httpOnly cookie and hand control to the reset form;
 * the token is never exposed to client JavaScript or placed in the URL again.
 * Normal sign-in links resolve the role from Neon and route to a dashboard.
 * The request Host header is never trusted as a redirect source.
 */
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { getProfileRole } from '@/lib/neon-data';
import { APP_URL, PASSWORD_RECOVERY_MAX_AGE_SECONDS } from '@/config/app';

const RESET_TOKEN_COOKIE = 'btc-reset-token';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (token) {
    const response = NextResponse.redirect(new URL('/reset-password', APP_URL));
    response.cookies.set(RESET_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: APP_URL.startsWith('https:'),
      sameSite: 'lax',
      path: '/',
      maxAge: PASSWORD_RECOVERY_MAX_AGE_SECONDS,
    });
    return response;
  }

  const { data } = await auth.getSession();
  const user = data?.user;
  if (!user) {
    return NextResponse.redirect(new URL('/login?error=invalid', APP_URL));
  }

  let role: string | null = null;
  try {
    role = await getProfileRole(user.id);
  } catch {
    // Fall back to the student dashboard if the role lookup fails.
  }

  const dest = role === 'founder' ? '/founder' : role === 'admin' ? '/admin' : '/student';
  const response = NextResponse.redirect(new URL(dest, APP_URL));
  response.cookies.delete(RESET_TOKEN_COOKIE);
  return response;
}

export { RESET_TOKEN_COOKIE };
