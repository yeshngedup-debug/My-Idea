import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getUser, getUserRole, requireRole, requireUser } from '@/lib/auth';
import { getProfileRole, NeonDataError } from '@/lib/neon-data';
import { AuthenticationError, AuthorizationError } from '@/lib/errors';
import {
  auth,
  mockAuthSession,
  setMockSessionError,
  setMockUser,
} from '@tests/neon-auth.mock';

beforeEach(() => {
  vi.mocked(getProfileRole).mockReset();
  // Restore the fail-closed, signed-out defaults before every case.
  mockAuthSession();
});

describe('getUser', () => {
  it('returns null when there is no session', async () => {
    await expect(getUser()).resolves.toBeNull();
    expect(auth.getSession).toHaveBeenCalledTimes(1);
  });

  it('maps the verified session user to the public shape', async () => {
    setMockUser({ id: 'u1', email: 'ada@example.com', name: 'Ada' });

    await expect(getUser()).resolves.toEqual({
      id: 'u1',
      email: 'ada@example.com',
      name: 'Ada',
    });
  });

  it('returns a null name when the provider user has no name field', async () => {
    setMockUser({ id: 'u2', email: 'no-name@example.com' });

    await expect(getUser()).resolves.toEqual({
      id: 'u2',
      email: 'no-name@example.com',
      name: null,
    });
  });

  it('preserves an explicit null name from the provider', async () => {
    setMockUser({ id: 'u3', email: 'null-name@example.com', name: null });

    await expect(getUser()).resolves.toEqual({
      id: 'u3',
      email: 'null-name@example.com',
      name: null,
    });
  });

  it('fails closed when the session lookup reports an error', async () => {
    setMockSessionError({ code: 'session_expired', message: 'Session expired' });

    await expect(getUser()).resolves.toBeNull();
  });

  it('fails closed when the provider returns no session data at all', async () => {
    auth.getSession.mockResolvedValueOnce({ data: null, error: { message: 'provider down' } });

    await expect(getUser()).resolves.toBeNull();
  });
});

describe('requireUser', () => {
  it('returns the verified user when signed in', async () => {
    setMockUser({ id: 'u1', email: 'ada@example.com', name: 'Ada' });

    await expect(requireUser()).resolves.toEqual({
      id: 'u1',
      email: 'ada@example.com',
      name: 'Ada',
    });
  });

  it('throws AuthenticationError when signed out', async () => {
    await expect(requireUser()).rejects.toBeInstanceOf(AuthenticationError);
    await expect(requireUser()).rejects.toMatchObject({
      message: 'Not signed in.',
      code: 'auth/unauthenticated',
      status: 401,
    });
  });

  it('throws AuthenticationError when the session lookup fails', async () => {
    setMockSessionError({ message: 'Session expired' });

    await expect(requireUser()).rejects.toBeInstanceOf(AuthenticationError);
  });
});

describe('getUserRole', () => {
  it('returns the role stored in Neon', async () => {
    vi.mocked(getProfileRole).mockResolvedValue('admin');

    await expect(getUserRole('u1')).resolves.toBe('admin');
    expect(getProfileRole).toHaveBeenCalledWith('u1');
  });

  it('returns null when the profile has no role', async () => {
    vi.mocked(getProfileRole).mockResolvedValue(null);

    await expect(getUserRole('missing')).resolves.toBeNull();
  });

  it('propagates a Neon data failure instead of granting a fallback role', async () => {
    const failure = new NeonDataError('database is down', 'db-unavailable');
    vi.mocked(getProfileRole).mockRejectedValue(failure);

    await expect(getUserRole('u1')).rejects.toBe(failure);
  });
});

describe('requireRole', () => {
  it('returns the user and role for a single allowed role', async () => {
    setMockUser({ id: 'u1', email: 'student@example.com', name: 'Student' });
    vi.mocked(getProfileRole).mockResolvedValue('student');

    await expect(requireRole('student')).resolves.toEqual({
      user: { id: 'u1', email: 'student@example.com', name: 'Student' },
      role: 'student',
    });
    expect(getProfileRole).toHaveBeenCalledWith('u1');
  });

  it('accepts a role from a readonly list of allowed roles', async () => {
    setMockUser({ id: 'u2', email: 'founder@example.com' });
    vi.mocked(getProfileRole).mockResolvedValue('founder');

    await expect(requireRole(['student', 'founder'] as const)).resolves.toEqual({
      user: { id: 'u2', email: 'founder@example.com', name: null },
      role: 'founder',
    });
  });

  it('throws AuthorizationError when the role is not allowed', async () => {
    setMockUser({ id: 'u3', email: 'student@example.com' });
    vi.mocked(getProfileRole).mockResolvedValue('student');

    await expect(requireRole('admin')).rejects.toBeInstanceOf(AuthorizationError);
    await expect(requireRole('admin')).rejects.toMatchObject({
      message: 'You do not have access to this resource.',
      code: 'auth/forbidden',
      status: 403,
    });
  });

  it('throws AuthorizationError when Neon has no role for the user', async () => {
    setMockUser({ id: 'u4', email: 'unknown@example.com' });
    vi.mocked(getProfileRole).mockResolvedValue(null);

    await expect(requireRole(['student', 'founder', 'admin'])).rejects.toBeInstanceOf(
      AuthorizationError
    );
  });

  it('throws AuthenticationError before looking up a role when signed out', async () => {
    await expect(requireRole('admin')).rejects.toBeInstanceOf(AuthenticationError);
    expect(getProfileRole).not.toHaveBeenCalled();
  });

  it('propagates a Neon role-lookup failure so callers fail closed', async () => {
    const failure = new NeonDataError('role table unavailable', 'db-down');
    setMockUser({ id: 'u5', email: 'founder@example.com' });
    vi.mocked(getProfileRole).mockRejectedValue(failure);

    await expect(requireRole('founder')).rejects.toBe(failure);
  });
});
