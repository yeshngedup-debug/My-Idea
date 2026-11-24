/**
 * Mock Supabase client builder for testing server actions.
 * The returned client is fully chainable: client.from().select().eq().single()
 * works, and mock methods can be set on any chain link.
 */
import { createClient } from '@/lib/supabase/server';
import { vi } from 'vitest';

const mockedCreateClient = vi.mocked(createClient);

// Mock next/cache revalidatePath (no static generation store in tests)
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

function makeChain(overrides: Record<string, any> = {}) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const chain: any = { // eslint-disable-line @typescript-eslint/no-explicit-any
    select: vi.fn(() => chain),
    insert: vi.fn(() => chain),
    update: vi.fn(() => chain),
    delete: vi.fn(() => chain),
    upsert: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    is: vi.fn(() => chain),
    in: vi.fn(() => chain),
    not: vi.fn(() => chain),
    order: vi.fn(() => chain),
    maybeSingle: vi.fn(() => ({ data: null, error: null })),
    single: vi.fn(() => ({ data: null, error: null })),
    ...overrides,
  };
  return chain;
}

export function mockSupabaseClient(overrides: Record<string, any> = {}) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const chain = makeChain(overrides);

  const base: any = { // eslint-disable-line @typescript-eslint/no-explicit-any
    from: vi.fn(() => chain),
    rpc: vi.fn(() => ({ data: null, error: null })),
    ...overrides,
  };

  // storage mock
  base.storage = {
    from: vi.fn(() => ({
      upload: vi.fn(() => ({ error: null })),
      createSignedUrl: vi.fn(() => ({ data: { signedUrl: null }, error: null })),
    })),
  };

  // auth mock
  base.auth = {
    getUser: vi.fn(() => ({ data: { user: null }, error: null })),
    signInWithPassword: vi.fn(() => ({ data: null, error: null })),
    signUp: vi.fn(() => ({ data: null, error: null })),
    signOut: vi.fn(() => ({ error: null })),
  };

  mockedCreateClient.mockResolvedValue(base);
  return { client: base, chain };
}

export function setMockUser(client: any, user: { id: string; email?: string } | null) { // eslint-disable-line @typescript-eslint/no-explicit-any
  client.auth.getUser.mockResolvedValue({
    data: { user },
    error: user ? null : new Error('Not authenticated'),
  });
}
