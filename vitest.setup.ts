import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock next/cache revalidatePath (no static generation store in tests)
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

/**
 * Global Neon Auth (Managed Better Auth) mock.
 *
 * Tests configure the current user through `tests/neon-auth.mock.ts`
 * (`mockAuthSession` / `setMockUser`). The defaults below fail closed: no
 * signed-in user, and no auth write succeeds unless a test opts in.
 */
vi.mock('@/lib/auth/server', () => ({
  auth: {
    getSession: vi.fn(async () => ({ data: { user: null }, error: null })),
    signIn: {
      email: vi.fn(async () => ({ data: { user: null }, error: null })),
    },
    signUp: {
      email: vi.fn(async () => ({ data: { user: null, session: null }, error: null })),
    },
    signOut: vi.fn(async () => ({ data: null, error: null })),
    requestPasswordReset: vi.fn(async () => ({ data: null, error: null })),
    resetPassword: vi.fn(async () => ({ data: null, error: null })),
  },
}));

/**
 * Private files now live in Neon Object Storage. Auto-mock every helper so a
 * test that forgets to set a return value fails loudly instead of reaching the
 * network. Pure helpers (for example `cvObjectPath`) keep their real behaviour.
 */
vi.mock('@/lib/storage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/storage')>();
  const unavailable = (name: string) => () =>
    Promise.reject(new Error(`${name} is not configured in this test`));

  const helpers: Record<string, unknown> = {
    uploadCv: vi.fn(unavailable('uploadCv')),
    signCv: vi.fn(unavailable('signCv')),
    removeCv: vi.fn(unavailable('removeCv')),
    cvFileExists: vi.fn(async () => false),
  };

  return new Proxy({ ...actual, ...helpers }, {
    get(target, property, receiver) {
      if (typeof property !== 'string' || property === 'then' || property === 'default') {
        return Reflect.get(target, property, receiver);
      }
      if (property in target) return Reflect.get(target, property, receiver);
      // A storage helper added later is auto-mocked, also fail-closed.
      const fn = vi.fn(unavailable(property));
      (target as Record<string, unknown>)[property] = fn;
      return fn;
    },
  });
});

// Application data lives in Neon. Auto-mock every helper so a test that
// forgets to set a return value fails loudly instead of hitting the network.
vi.mock('@/lib/neon-data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/neon-data')>();
  const mocked: Record<string, unknown> = { NeonDataError: actual.NeonDataError };
  for (const [key, value] of Object.entries(actual)) {
    if (key !== 'NeonDataError' && typeof value === 'function') {
      mocked[key] = vi.fn();
    }
  }
  return mocked;
});
