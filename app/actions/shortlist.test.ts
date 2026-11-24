import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestShortlist } from '@/app/actions/shortlist';
import { mockSupabaseClient, setMockUser } from '@/test/supabase.mock';
import { createClient } from '@/lib/supabase/server';

const mockedCreateClient = vi.mocked(createClient);

describe('requestShortlist', () => {
  let client: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  let chain: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  const asFounder = () => {
    setMockUser(client, { id: 'founder-uuid', email: 'x@y.com' });
    chain.single
      .mockResolvedValueOnce({ data: { role: 'founder' }, error: null }) // caller
      .mockResolvedValueOnce({ data: { role: 'student' }, error: null }); // target
  };

  beforeEach(() => {
    ({ client, chain } = mockSupabaseClient());
    vi.clearAllMocks();
    client.rpc.mockResolvedValue({ data: { id: 'shortlist-id' }, error: null });
  });

  it('rejects when not signed in', async () => {
    setMockUser(client, null);
    const result = await requestShortlist('student-uuid');
    expect(result.ok).toBe(false);
    expect(result.message).toBe('Not signed in.');
  });

  it('rejects when user is not a founder', async () => {
    setMockUser(client, { id: 'founder-uuid', email: 'x@y.com' });
    chain.single.mockResolvedValue({ data: { role: 'student' }, error: null });
    const result = await requestShortlist('student-uuid');
    expect(result.ok).toBe(false);
    expect(result.message).toBe('Only founders can shortlist students.');
  });

  it('rejects when target is not a student', async () => {
    setMockUser(client, { id: 'founder-uuid', email: 'x@y.com' });
    chain.single
      .mockResolvedValueOnce({ data: { role: 'founder' }, error: null }) // caller
      .mockResolvedValueOnce({ data: { role: 'founder' }, error: null }); // target
    const result = await requestShortlist('founder-uuid');
    expect(result.ok).toBe(false);
    expect(result.message).toBe('Student not found.');
  });

  it('creates the shortlist through the checked RPC', async () => {
    asFounder();
    const result = await requestShortlist('student-uuid');

    expect(result.ok).toBe(true);
    expect(result.message).toBe('Shortlist request sent.');
    expect(client.rpc).toHaveBeenCalledWith('request_shortlist', {
      p_student_id: 'student-uuid',
      p_project_id: null,
    });
  });

  it('reports a missing relationship without leaking internals', async () => {
    asFounder();
    client.rpc.mockResolvedValue({
      data: null,
      error: { message: 'No relationship with this student' },
    });

    const result = await requestShortlist('student-uuid');

    expect(result.ok).toBe(false);
    expect(result.message).toContain('once a premium shortlist is confirmed');
  });

  it('returns error message for other DB errors', async () => {
    asFounder();
    client.rpc.mockResolvedValue({
      data: null,
      error: { code: '42P01', message: 'relation does not exist' },
    });

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
