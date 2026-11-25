/**
 * Shared Neon Auth + Neon Object Storage mocks for unit tests.
 *
 * `vitest.setup.ts` installs the module mocks with fail-closed defaults. This
 * module gives tests a controllable handle on them:
 *
 *   mockAuthSession({ id: 'u1', email: 'x@y.com' });  // signed in
 *   setMockUser(null);                                // signed out
 *   auth.signUp.email.mockRejectedValueOnce(error);    // provider failure
 *   mockStorage();                                    // successful file ops
 *
 * Keeping the auth error contract here means tests assert on app behaviour
 * (authorization, redirects, safe messages) rather than on a provider client.
 */
import { vi } from 'vitest';
import { auth as authServer } from '@/lib/auth/server';
import * as storageModule from '@/lib/storage';

type MockFn = ReturnType<typeof vi.fn>;

export interface MockUser {
  id: string;
  email: string;
  name?: string | null;
}

export interface MockAuthError {
  code?: string;
  status?: number;
  statusText?: string;
  message?: string;
}

export interface MockAuth {
  getSession: MockFn;
  signIn: { email: MockFn };
  signUp: { email: MockFn };
  signOut: MockFn;
  requestPasswordReset: MockFn;
  resetPassword: MockFn;
  [key: string]: unknown;
}

export interface MockStorage {
  uploadCv: MockFn;
  signCv: MockFn;
  removeCv: MockFn;
  cvFileExists: MockFn;
  [key: string]: unknown;
}

export const auth = authServer as unknown as MockAuth;
export const storage = storageModule as unknown as MockStorage;

/** Restore the fail-closed defaults installed by vitest.setup.ts. */
export function resetAuthMocks(): void {
  auth.getSession.mockResolvedValue({ data: { user: null }, error: null });
  auth.signIn.email.mockResolvedValue({ data: { user: null }, error: null });
  auth.signUp.email.mockResolvedValue({ data: { user: null, session: null }, error: null });
  auth.signOut.mockResolvedValue({ data: null, error: null });
  auth.requestPasswordReset.mockResolvedValue({ data: null, error: null });
  auth.resetPassword.mockResolvedValue({ data: null, error: null });
}

/** Set the user returned by `auth.getSession()` (and therefore `getUser()`). */
export function setMockUser(user: MockUser | null): MockUser | null {
  auth.getSession.mockResolvedValue({ data: { user }, error: null });
  return user;
}

/** Force a provider/session lookup failure so callers must fail closed. */
export function setMockSessionError(error: MockAuthError | null): void {
  auth.getSession.mockResolvedValue({ data: { user: null }, error });
}

/**
 * Start one test from a clean, signed-in (or explicitly signed-out) session.
 * Returns the auth handle so tests can override individual methods.
 */
export function mockAuthSession(user: MockUser | null = null): MockAuth {
  resetAuthMocks();
  setMockUser(user);
  return auth;
}

/** Restore the fail-closed storage defaults. */
export function resetStorageMocks(): void {
  const unavailable = (name: string) => () =>
    Promise.reject(new Error(`${name} is not configured in this test`));
  storage.uploadCv.mockImplementation(unavailable('uploadCv'));
  storage.signCv.mockImplementation(unavailable('signCv'));
  storage.removeCv.mockImplementation(unavailable('removeCv'));
  storage.cvFileExists.mockResolvedValue(false);
}

/** Opt in to successful private-file operations for a test. */
export function mockStorage(signedUrl = 'https://storage.test/signed'): MockStorage {
  storage.uploadCv.mockImplementation(async (userId: string, _file: File, uploadId: string) =>
    storageModule.cvObjectPath(userId, uploadId)
  );
  storage.signCv.mockResolvedValue(signedUrl);
  storage.removeCv.mockResolvedValue(undefined);
  storage.cvFileExists.mockResolvedValue(true);
  return storage;
}

/** Path published by the nth `uploadCv` call, as resolved by mockStorage(). */
export async function uploadedCvPath(callIndex = 0): Promise<string> {
  const result = storage.uploadCv.mock.results[callIndex];
  if (!result) throw new Error(`uploadCv was not called (call ${callIndex})`);
  return await (result.value as Promise<string>);
}
