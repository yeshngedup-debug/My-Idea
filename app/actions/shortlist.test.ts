import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestShortlist } from '@/app/actions/shortlist';
import { mockSupabaseClient, setMockUser } from '@/test/supabase.mock';
import { createClient } from '@/lib/supabase/server';
import {
  getProfileRole,
  requestShortlist as createShortlistRow,
  NeonDataError,
} from '@/lib/neon-data';

const mockedCreateClient = vi.mocked(createClient);
const mockedGetProfileRole = vi.mocked(getProfileRole);
const mockedCreateShortlistRow = vi.mocked(createShortlistRow);

describe('requestShortlist', () => {
  let client: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  const asFounder = () => {
    setMockUser(client, { id: 'founder-uuid', email: 'x@y.com' });
    mockedGetProfileRole
      .mockResolvedValueOnce('founder') // caller
      .mockResolvedValueOnce('student'); // target
  };

  beforeEach(() => {
    ({ client } = mockSupabaseClient());
    vi.clearAllMocks();
    mockedCreateShortlistRow.mockResolvedValue();
  });

  it('rejects when not signed in', async () => {
    setMockUser(client, null);
    const result = await requestShortlist('student-uuid');
    expect(result.ok).toBe(false);
    expect(result.message).toBe('Not signed in.');
  });

  it('rejects when user is not a founder', async () => {
    setMockUser(client, { id: 'founder-uuid', email: 'x@y.com' });
    mockedGetProfileRole.mockResolvedValue('student');
    const result = await requestShortlist('student-uuid');
    expect(result.ok).toBe(false);
    expect(result.message).toBe('Only founders can shortlist students.');
  });

  it('rejects when target is not a student', async () => {
    setMockUser(client, { id: 'founder-uuid', email: 'x@y.com' });
    mockedGetProfileRole
      .mockResolvedValueOnce('founder') // caller
      .mockResolvedValueOnce('founder'); // target
    const result = await requestShortlist('founder-uuid');
    expect(result.ok).toBe(false);
    expect(result.message).toBe('Student not found.');
  });

  it('creates the shortlist through the checked helper', async () => {
    asFounder();
    const result = await requestShortlist('student-uuid');

    expect(result.ok).toBe(true);
    expect(result.message).toBe('Shortlist request sent.');
    expect(mockedCreateShortlistRow).toHaveBeenCalledWith(
      'founder-uuid',
      'student-uuid',
      null
    );
  });

  it('reports a missing relationship without leaking internals', async () => {
    asFounder();
    mockedCreateShortlistRow.mockRejectedValueOnce(
      new NeonDataError('No relationship with this student')
    );

    const result = await requestShortlist('student-uuid');

    expect(result.ok).toBe(false);
    expect(result.message).toContain('once a premium shortlist is confirmed');
  });

  it('returns error message for other DB errors', async () => {
    asFounder();
    mockedCreateShortlistRow.mockRejectedValueOnce(
      new NeonDataError('relation does not exist', '42P01')
    );

    const result = await requestShortlist('student-uuid');

    expect(result.ok).toBe(false);
    expect(result.message).toContain('relation does not exist');
  });

  it('verify createClient is called', async () => {
    asFounder();
    await requestShortlist('student-uuid');
    expect(mockedCreateClient).toHaveBeenCalled();
  });
});
