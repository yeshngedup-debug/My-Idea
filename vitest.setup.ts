import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock next/cache revalidatePath (no static generation store in tests)
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock Supabase server client for all tests (auth + storage only)
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

// Application data now lives in Neon. Auto-mock every helper so a test that
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
