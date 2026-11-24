/**
 * Next.js 16 Proxy — role-based route protection.
 *
 * Convention: proxy.ts at project root, named export `proxy`
 * (the `middleware.ts` convention is deprecated in Next.js 16; see
 * node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md).
 *
 * Rules:
 *   /student/*  -> role "student" only
 *   /founder/*  -> role "founder" only
 *   /admin/*    -> role "admin" only
 *   /login, /signup -> logged-in users are bounced to their dashboard
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const ROLE_HOME: Record<string, string> = {
  student: '/student',
  founder: '/founder',
  admin: '/admin',
};

const PROTECTED_PREFIXES = ['/student', '/founder', '/admin'];

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV === 'development';
  const contentSecurityPolicy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    'img-src \'self\' data: https:',
    `connect-src 'self' https://*.supabase.co${isDev ? ' http://127.0.0.1:54321 http://localhost:54321 http://host.docker.internal:54321 ws://localhost:* ws://127.0.0.1:*' : ''}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicy);

  const nextWithCsp = () => {
    const nextResponse = NextResponse.next({
      request: { headers: requestHeaders },
    });
    nextResponse.headers.set('Content-Security-Policy', contentSecurityPolicy);
    return nextResponse;
  };

  let response = nextWithCsp();

  /**
   * Redirects must carry the cookies refreshed by `getUser()`; returning a
   * bare NextResponse.redirect() used to drop them and cause logout loops.
   */
  const redirectWithCsp = (url: URL) => {
    const redirectResponse = NextResponse.redirect(url);
    redirectResponse.headers.set('Content-Security-Policy', contentSecurityPolicy);
    for (const cookie of response.cookies.getAll()) {
      redirectResponse.cookies.set(cookie);
    }
    return redirectResponse;
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          requestHeaders.set('cookie', request.cookies.toString());
          response = nextWithCsp();
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: getUser() (not getSession()) — validates the JWT with Supabase.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage =
    pathname.startsWith('/login') || pathname.startsWith('/signup');

  // Not logged in -> anything protected goes to login
  if (isProtected && !user) {
    return redirectWithCsp(new URL('/login', request.url));
  }

  // Logged in on an auth page -> send to their dashboard
  if (isAuthPage && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    return redirectWithCsp(
      new URL(ROLE_HOME[profile?.role ?? 'student'], request.url)
    );
  }

  // Logged in but in someone else's area -> bounce to their own dashboard
  if (isProtected && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role ?? 'student';
    const home = ROLE_HOME[role] ?? '/student';

    const ownsArea = pathname.startsWith(home);
    if (!ownsArea) {
      return redirectWithCsp(new URL(home, request.url));
    }
  }

  return response;
}

export const config = {
  // Skip static assets, images, favicons, robots.txt and sitemap.xml:
  // none of them need a Supabase auth round-trip.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|webmanifest|txt|xml)$|public/.*|images/.*).*)',
  ],
};
