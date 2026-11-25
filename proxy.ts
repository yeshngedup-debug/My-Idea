/**
 * Next.js 16 Proxy — CSP headers and role-based route protection.
 *
 * Identity comes from Neon Managed Better Auth; roles come from Neon Postgres.
 * Both are checked before any protected data is read. A failed or unknown role
 * lookup never grants access to another role's area.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/server';
import { getProfileRole } from '@/lib/neon-data';

const ROLE_HOME: Record<string, string> = {
  student: '/student',
  founder: '/founder',
  admin: '/admin',
};

const PROTECTED_PREFIXES = ['/student', '/founder', '/admin'];

type RoleLookup = { role: string | null; ok: boolean };

async function lookupRole(userId: string): Promise<RoleLookup> {
  try {
    return { role: await getProfileRole(userId), ok: true };
  } catch {
    return { role: null, ok: false };
  }
}

const ownsPath = (pathname: string, home: string) =>
  pathname === home || pathname.startsWith(`${home}/`);

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV === 'development';
  const contentSecurityPolicy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    `connect-src 'self' https://*.neon.tech wss://*.neon.tech${isDev ? ' http://localhost:3000 ws://localhost:*' : ''}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicy);

  const nextWithCsp = () => {
    const nextResponse = NextResponse.next({ request: { headers: requestHeaders } });
    nextResponse.headers.set('Content-Security-Policy', contentSecurityPolicy);
    return nextResponse;
  };

  const response = nextWithCsp();

  const redirectWithCsp = (url: URL) => {
    const redirectResponse = NextResponse.redirect(url);
    redirectResponse.headers.set('Content-Security-Policy', contentSecurityPolicy);
    for (const cookie of response.cookies.getAll()) {
      redirectResponse.cookies.set(cookie);
    }
    return redirectResponse;
  };

  // Managed Auth validates the session and refreshes its own cookies.
  const { data } = await auth.getSession();
  const user = data?.user;

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');

  if (isProtected && !user) {
    return redirectWithCsp(new URL('/login', request.url));
  }

  if (isAuthPage && user) {
    const { role, ok } = await lookupRole(user.id);
    if (!ok) return response;
    const home = role ? ROLE_HOME[role] : undefined;
    return redirectWithCsp(new URL(home ?? '/', request.url));
  }

  if (isProtected && user) {
    const { role, ok } = await lookupRole(user.id);
    if (!ok || !role) return response;
    const home = ROLE_HOME[role];
    if (!home || !ownsPath(pathname, home)) {
      return redirectWithCsp(new URL(home ?? '/', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|webmanifest|txt|xml)$|public/.*|images/.*).*)',
  ],
};
