import { describe, it, expect, vi, beforeEach } from 'vitest';
import { revalidatePath } from 'next/cache';
import { requestShortlist } from '@/features/shortlist/actions';
import { auth, mockAuthSession, setMockUser } from '@tests/neon-auth.mock';
import {
  getProfileRole,
  requestShortlist as createShortlistRow,
  NeonDataError,
} from '@/lib/neon-data';

const mockedGetSession = vi.mocked(auth.getSession);
const mockedGetProfileRole = vi.mocked(getProfileRole);
const mockedCreateShortlistRow = vi.mocked(createShortlistRow);

describe('requestShortlist', () => {
  const asFounder = () => {
    setMockUser({ id: 'founder-uuid', email: 'x@y.com' });
    mockedGetProfileRole
      .mockResolvedValueOnce('founder') // caller
      .mockResolvedValueOnce('student'); // target
  };

  beforeEach(() => {
    mockAuthSession();
    vi.clearAllMocks();
    mockedCreateShortlistRow.mockResolvedValue();
  });

  it('rejects when not signed in', async () => {
    setMockUser(null);
    const result = await requestShortlist('student-uuid');
    expect(result.ok).toBe(false);
    expect(result.message).toBe('Not signed in.');
  });

  it('rejects when user is not a founder', async () => {
    setMockUser({ id: 'founder-uuid', email: 'x@y.com' });
    mockedGetProfileRole.mockResolvedValue('student');
    const result = await requestShortlist('student-uuid');
    expect(result.ok).toBe(false);
    expect(result.message).toBe('Only founders can shortlist students.');
  });

  it('rejects when target is not a student', async () => {
    setMockUser({ id: 'founder-uuid', email: 'x@y.com' });
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

  it('does not leak driver errors for unexpected DB failures', async () => {
    asFounder();
    mockedCreateShortlistRow.mockRejectedValueOnce(
      new NeonDataError('relation does not exist', '42P01')
    );

    const result = await requestShortlist('student-uuid');

    expect(result.ok).toBe(false);
    expect(result.message).toBe('Could not send shortlist request. Please try again.');
    expect(result.message).not.toContain('relation does not exist');
  });

  it('revalidates the detail path for an already-shortlisted student', async () => {
    asFounder();
    mockedCreateShortlistRow.mockRejectedValueOnce(new NeonDataError('duplicate', '23505'));

    const result = await requestShortlist('student-uuid');

    expect(result.ok).toBe(true);
    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith('/founder/students/student-uuid');
  });

  it('verify the session is read', async () => {
    asFounder();
    await requestShortlist('student-uuid');
    expect(mockedGetSession).toHaveBeenCalled();
  });
});
