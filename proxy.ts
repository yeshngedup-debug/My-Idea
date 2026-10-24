/**
 * Proxy (formerly Middleware) — role-based route protection.
 *
 * Next.js 16 convention: proxy.ts at project root, named export `proxy`.
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
  let response = NextResponse.next({ request: { headers: request.headers } });

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
          response = NextResponse.next({
            request: { headers: request.headers },
          });
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
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Logged in on an auth page -> send to their dashboard
  if (isAuthPage && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    return NextResponse.redirect(
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
      return NextResponse.redirect(new URL(home, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/.*).*)'],
};
