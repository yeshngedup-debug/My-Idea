import { describe, it, expect, vi, beforeEach } from 'vitest';

const { redirectMock, headersMock, cookiesMock, cookieStore } = vi.hoisted(() => ({
  redirectMock: vi.fn((url: string): never => {
    throw new Error(`REDIRECT:${url}`);
  }),
  headersMock: vi.fn(),
  cookiesMock: vi.fn(),
  cookieStore: { get: vi.fn(), delete: vi.fn() },
}));

vi.mock('next/navigation', () => ({ redirect: redirectMock }));
vi.mock('next/headers', () => ({ headers: headersMock, cookies: cookiesMock }));

import { signup, requestPasswordReset, resetPassword } from '@/features/auth/actions';
import { APP_URL } from '@/config/app';
import { auth, mockAuthSession, setMockUser } from '@tests/neon-auth.mock';

// Cookie set by the Neon Auth callback around a password-recovery token.
const RESET_TOKEN_COOKIE = 'btc-reset-token';

function signupForm(email: string, firstName = 'Tashi'): FormData {
  const formData = new FormData();
  formData.set('firstName', firstName);
  formData.set('lastName', 'Dorji');
  formData.set('email', email);
  formData.set('password', 'password123');
  return formData;
}

function emailForm(email: string): FormData {
  const formData = new FormData();
  formData.set('email', email);
  return formData;
}

function passwordForm(password: string, confirmPassword = password): FormData {
  const formData = new FormData();
  formData.set('password', password);
  formData.set('confirmPassword', confirmPassword);
  return formData;
}

function setRecoveryCookie(value?: string): void {
  cookieStore.get.mockImplementation((name: string) =>
    name === RESET_TOKEN_COOKIE && value
      ? { name, value }
      : undefined
  );
}

async function expectRedirect(action: () => Promise<unknown>, url: string): Promise<void> {
  await expect(action()).rejects.toThrow(`REDIRECT:${url}`);
}

describe('signup', () => {
  beforeEach(() => {
    mockAuthSession();
    vi.clearAllMocks();
    headersMock.mockResolvedValue(new Headers({ 'x-forwarded-for': '1.1.1.1' }));
    cookiesMock.mockResolvedValue(cookieStore);
    cookieStore.get.mockReturnValue(undefined);
  });

  it('maps a duplicate Neon Auth error to exists', async () => {
    auth.signUp.email.mockResolvedValue({
      data: null,
      error: {
        code: 'user_already_exists',
        status: 409,
        statusText: 'Conflict',
        message: 'User already exists',
      },
    });

    await expectRedirect(
      () => signup(signupForm('duplicate@example.com')),
      '/signup?error=exists'
    );
  });

  it('maps a weak-password error to invalid', async () => {
    auth.signUp.email.mockResolvedValue({
      data: null,
      error: {
        code: 'weak_password',
        status: 400,
        statusText: 'Bad Request',
        message: 'Password is too weak.',
      },
    });

    await expectRedirect(
      () => signup(signupForm('weak@example.com')),
      '/signup?error=invalid'
    );
  });

  it('uses the generic fallback for an unknown Neon Auth error', async () => {
    auth.signUp.email.mockResolvedValue({
      data: null,
      error: {
        code: 'internal_error',
        status: 500,
        statusText: 'Internal Server Error',
        message: 'Unexpected failure.',
      },
    });

    await expectRedirect(
      () => signup(signupForm('unknown@example.com')),
      '/signup?error=unknown'
    );
  });

  it('rejects a combined full name longer than 80 characters', async () => {
    await expectRedirect(
      () => signup(signupForm('longname@example.com', 'a'.repeat(81))),
      '/signup?error=invalid'
    );
    expect(auth.signUp.email).not.toHaveBeenCalled();
  });

  it('rejects a malformed email before calling Neon Auth', async () => {
    await expectRedirect(
      () => signup(signupForm('not-an-email')),
      '/signup?error=invalid'
    );
    expect(auth.signUp.email).not.toHaveBeenCalled();
  });

  it('rejects an email longer than 254 characters before calling Neon Auth', async () => {
    await expectRedirect(
      () => signup(signupForm(`${'a'.repeat(250)}@b.co`)),
      '/signup?error=invalid'
    );
    expect(auth.signUp.email).not.toHaveBeenCalled();
  });
});

describe('requestPasswordReset', () => {
  beforeEach(() => {
    mockAuthSession();
    vi.clearAllMocks();
    headersMock.mockResolvedValue(new Headers({ 'x-forwarded-for': '2.2.2.2' }));
    cookiesMock.mockResolvedValue(cookieStore);
    cookieStore.get.mockReturnValue(undefined);
  });

  it('uses the configured app origin as the only reset redirect target', async () => {
    await expectRedirect(
      () => requestPasswordReset(emailForm('recovery-happy@example.com')),
      '/forgot-password?sent=1'
    );

    expect(auth.requestPasswordReset).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'recovery-happy@example.com',
        redirectTo: `${APP_URL}/auth/callback`,
      })
    );
  });

  it('returns the same success response when Neon Auth reports an error', async () => {
    auth.requestPasswordReset.mockResolvedValue({
      data: null,
      error: {
        code: 'internal_error',
        status: 500,
        statusText: 'Internal Server Error',
        message: 'Account not found',
      },
    });

    await expectRedirect(
      () => requestPasswordReset(emailForm('recovery-provider-error@example.com')),
      '/forgot-password?sent=1'
    );
  });

  it('rejects invalid email input before calling Neon Auth', async () => {
    await expectRedirect(
      () => requestPasswordReset(emailForm('not-an-email')),
      '/forgot-password?error=invalid'
    );

    expect(auth.requestPasswordReset).not.toHaveBeenCalled();
  });

  it('rate limits repeated requests by IP and email', async () => {
    const email = 'recovery-rate-limit@example.com';
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await expectRedirect(
        () => requestPasswordReset(emailForm(email)),
        '/forgot-password?sent=1'
      );
    }

    await expectRedirect(
      () => requestPasswordReset(emailForm(email)),
      '/forgot-password?error=rate-limited'
    );
    expect(auth.requestPasswordReset).toHaveBeenCalledTimes(3);
  });
});

describe('resetPassword', () => {
  beforeEach(() => {
    mockAuthSession();
    vi.clearAllMocks();
    headersMock.mockResolvedValue(new Headers({ 'x-forwarded-for': '3.3.3.3' }));
    cookiesMock.mockResolvedValue(cookieStore);
    cookieStore.delete.mockReturnValue(undefined);
    setMockUser({ id: 'user-1', email: 'reset-happy@example.com' });
  });

  it('rejects a password update without the recovery token cookie', async () => {
    setRecoveryCookie(undefined);

    await expectRedirect(
      () => resetPassword(passwordForm('newpassword')),
      '/forgot-password?error=session'
    );
    expect(auth.resetPassword).not.toHaveBeenCalled();
  });

  it('rejects a mismatched confirmation before checking the session', async () => {
    setRecoveryCookie('1');

    await expectRedirect(
      () => resetPassword(passwordForm('newpassword', 'different')),
      '/reset-password?error=invalid'
    );
    expect(auth.resetPassword).not.toHaveBeenCalled();
  });

  it('updates the password, clears recovery state, and ends the session', async () => {
    setRecoveryCookie('1');

    await expectRedirect(
      () => resetPassword(passwordForm('newpassword')),
      '/login?message=password-updated'
    );

    // Better Auth names the field `newPassword`; assert the submitted value
    // without pinning the provider's argument key.
    const payload = auth.resetPassword.mock.calls[0]?.[0] as Record<string, unknown> | undefined;
    expect(Object.values(payload ?? {})).toContain('newpassword');
    expect(cookieStore.delete).toHaveBeenCalledWith(RESET_TOKEN_COOKIE);
    expect(auth.signOut).toHaveBeenCalled();
  });

  it('rate limits repeated password updates', async () => {
    setRecoveryCookie('1');
    setMockUser({ id: 'user-rate', email: 'reset-rate-limit@example.com' });

    for (let attempt = 0; attempt < 3; attempt += 1) {
      await expectRedirect(
        () => resetPassword(passwordForm('newpassword')),
        '/login?message=password-updated'
      );
    }

    await expectRedirect(
      () => resetPassword(passwordForm('newpassword')),
      '/reset-password?error=rate-limited'
    );
    expect(auth.resetPassword).toHaveBeenCalledTimes(3);
  });
});
