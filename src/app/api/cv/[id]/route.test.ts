import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/cv/[id]/route';
import { mockAuthSession, mockStorage, setMockUser, storage } from '@tests/neon-auth.mock';
import { getProfileRole, getStudentProfile } from '@/lib/neon-data';

const mockedGetProfileRole = vi.mocked(getProfileRole);
const mockedGetStudentProfile = vi.mocked(getStudentProfile);

const VALID_ID = '123e4567-e89b-42d3-a456-426614174000';

function params(id: string): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id }) };
}

describe('GET /api/cv/[id]', () => {
  beforeEach(() => {
    mockAuthSession();
    mockStorage();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('rejects a non-UUID student ID before touching the database', async () => {
    const response = await GET(
      new Request('http://localhost/api/cv/not-a-uuid'),
      params('not-a-uuid')
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Invalid student ID.' });
    expect(mockedGetStudentProfile).not.toHaveBeenCalled();
  });

  it('returns a friendly error when Storage cannot sign a CV URL', async () => {
    setMockUser({ id: 'admin-uuid', email: 'admin@example.com' });
    mockedGetProfileRole.mockResolvedValue('admin');
    mockedGetStudentProfile.mockResolvedValue({ cv_path: 'student/cv.pdf' } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    storage.signCv.mockRejectedValueOnce(new Error('storage down'));

    const response = await GET(
      new Request(`http://localhost/api/cv/${VALID_ID}`),
      params(VALID_ID)
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: 'Could not open the CV right now. Try again later.',
    });
  });
});
