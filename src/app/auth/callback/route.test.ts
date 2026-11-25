import { describe, it, expect, vi, beforeEach } from 'vitest';

const { redirectMock } = vi.hoisted(() => ({
  redirectMock: vi.fn((url: URL) => ({
    url,
    cookies: { set: vi.fn(), delete: vi.fn() },
  })),
}));

vi.mock('next/server', () => ({ NextResponse: { redirect: redirectMock } }));

import { GET, RESET_TOKEN_COOKIE } from '@/app/auth/callback/route';
import { APP_URL, PASSWORD_RECOVERY_MAX_AGE_SECONDS } from '@/config/app';
import { getProfileRole } from '@/lib/neon-data';
import { auth, mockAuthSession, setMockUser } from '@tests/neon-auth.mock';

function callbackRequest(query = ''): Request {
  // A hostile Host must never influence the redirect target.
  return new Request(`http://attacker.example/auth/callback${query}`);
}

function lastRedirect(): {
  url: URL;
  cookies: { set: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
} {
  return redirectMock.mock.results.at(-1)?.value as {
    url: URL;
    cookies: { set: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  };
}

describe('GET /auth/callback', () => {
  beforeEach(() => {
    mockAuthSession();
    vi.clearAllMocks();
    vi.mocked(getProfileRole).mockResolvedValue('student');
  });

  it('parks a recovery token in a short-lived cookie on the configured origin', async () => {
    const response = await GET(callbackRequest('?token=reset-token-123'));
    const redirect = lastRedirect();

    expect(auth.getSession).not.toHaveBeenCalled();
    expect(redirect.url.origin).toBe(new URL(APP_URL).origin);
    expect(redirect.url.pathname).toBe('/reset-password');
    expect(redirect.cookies.set).toHaveBeenCalledWith(
      RESET_TOKEN_COOKIE,
      'reset-token-123',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: PASSWORD_RECOVERY_MAX_AGE_SECONDS,
      })
    );
    expect(response).toBeDefined();
  });

  it('routes a signed-in callback to the role dashboard without setting the recovery marker', async () => {
    setMockUser({ id: 'user-2', email: 'user@example.com', name: 'User' });
    vi.mocked(getProfileRole).mockResolvedValue('founder');

    await GET(callbackRequest());

    const redirect = lastRedirect();
    expect(redirect.url.origin).toBe(new URL(APP_URL).origin);
    expect(redirect.url.pathname).toBe('/founder');
    expect(redirect.cookies.set).not.toHaveBeenCalled();
    expect(redirect.cookies.delete).toHaveBeenCalledWith(RESET_TOKEN_COOKIE);
  });

  it('fails closed to login when there is no session', async () => {
    setMockUser(null);

    await GET(callbackRequest());

    const redirect = lastRedirect();
    expect(redirect.url.origin).toBe(new URL(APP_URL).origin);
    expect(redirect.url.pathname).toBe('/login');
    expect(redirect.url.searchParams.get('error')).toBe('invalid');
  });
});
