import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock next/cache revalidatePath (no static generation store in tests)
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Mock Supabase server client for all tests
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));
