import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/env', () => ({
  APP_URL: 'http://localhost:3000',
  validateEnv: vi.fn(),
  assertNoDemoUsers: vi.fn(),
}));

import { generateShortlist } from '@/features/admin/actions';
import { auth, mockAuthSession, setMockUser } from '@tests/neon-auth.mock';
import {
  getProfile,
  getProfileRole,
  getProject,
  listFounderOrders,
  listStudentProfiles,
  replaceAdminShortlist,
} from '@/lib/neon-data';

const mockedGetSession = vi.mocked(auth.getSession);
const mockedGetProfileRole = vi.mocked(getProfileRole);
const mockedGetProfile = vi.mocked(getProfile);
const mockedGetProject = vi.mocked(getProject);
const mockedListFounderOrders = vi.mocked(listFounderOrders);
const mockedListStudentProfiles = vi.mocked(listStudentProfiles);
const mockedReplaceAdminShortlist = vi.mocked(replaceAdminShortlist);

describe('generateShortlist', () => {
  const asAdmin = () => {
    setMockUser({ id: 'admin-uuid', email: 'admin@example.com' });
    mockedGetProfileRole.mockResolvedValue('admin');
  };

  beforeEach(() => {
    mockAuthSession();
    vi.clearAllMocks();
    mockedListFounderOrders.mockResolvedValue([]);
    mockedListStudentProfiles.mockResolvedValue([
      { id: 'student-id', full_name: 'Tashi Dorji' },
    ] as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    mockedReplaceAdminShortlist.mockResolvedValue();
  });

  it('rejects a founder ID that belongs to a student', async () => {
    asAdmin();
    mockedGetProfile.mockResolvedValue({ id: 'not-founder', role: 'student' } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const result = await generateShortlist(['student-id'], 'not-founder', null);

    expect(result.ok).toBe(false);
    expect(result.message).toBe('Choose a valid founder.');
    expect(mockedReplaceAdminShortlist).not.toHaveBeenCalled();
  });

  it('rejects a project that belongs to another founder', async () => {
    asAdmin();
    mockedGetProfile.mockResolvedValue({ id: 'founder-id', role: 'founder' } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    mockedGetProject.mockResolvedValue({ id: 'project-id', founder_id: 'other-founder' } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const result = await generateShortlist(['student-id'], 'founder-id', 'project-id');

    expect(result.ok).toBe(false);
    expect(result.message).toBe('Choose one of this founder’s projects.');
    expect(mockedReplaceAdminShortlist).not.toHaveBeenCalled();
  });

  it('saves a shortlist when no confirmed package order exists', async () => {
    asAdmin();
    mockedGetProfile.mockResolvedValue({ id: 'founder-id', role: 'founder' } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    mockedGetProject.mockResolvedValue({
      id: 'project-id',
      founder_id: 'founder-id',
      title: 'Founder project',
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const result = await generateShortlist(['student-id'], 'founder-id', 'project-id');

    expect(result.ok).toBe(true);
    expect(mockedListFounderOrders).toHaveBeenCalledWith('founder-id');
    expect(mockedReplaceAdminShortlist).toHaveBeenCalledWith(
      'founder-id',
      'project-id',
      ['student-id']
    );
    expect(mockedGetSession).toHaveBeenCalled();
  });

  it.each([
    [2, 'Basic shortlists must include 3–5 students. You selected 2.'],
    [6, 'Basic shortlists must include 3–5 students. You selected 6.'],
  ])('enforces the confirmed Basic package size for %i students', async (count, message) => {
    asAdmin();
    mockedGetProfile.mockResolvedValue({ id: 'founder-id', role: 'founder' } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    mockedListFounderOrders.mockResolvedValue([
      {
        id: 'order-id',
        status: 'confirmed',
        package: 'basic',
        project_id: null,
      },
    ] as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    const studentIds = Array.from({ length: count }, (_, index) => `student-${index + 1}`);
    mockedListStudentProfiles.mockResolvedValue(
      studentIds.map((id) => ({ id, full_name: id })) as any // eslint-disable-line @typescript-eslint/no-explicit-any
    );

    const result = await generateShortlist(studentIds, 'founder-id', null);

    expect(result.ok).toBe(false);
    expect(result.message).toBe(message);
    expect(mockedReplaceAdminShortlist).not.toHaveBeenCalled();
  });

  it('enforces the confirmed Full package upper bound', async () => {
    asAdmin();
    mockedGetProfile.mockResolvedValue({ id: 'founder-id', role: 'founder' } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    mockedListFounderOrders.mockResolvedValue([
      {
        id: 'order-id',
        status: 'confirmed',
        package: 'full',
        project_id: null,
      },
    ] as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    const studentIds = Array.from({ length: 11 }, (_, index) => `student-${index + 1}`);
    mockedListStudentProfiles.mockResolvedValue(
      studentIds.map((id) => ({ id, full_name: id })) as any // eslint-disable-line @typescript-eslint/no-explicit-any
    );

    const result = await generateShortlist(studentIds, 'founder-id', null);

    expect(result.ok).toBe(false);
    expect(result.message).toBe('Full Support shortlists must include 5–10 students. You selected 11.');
    expect(mockedReplaceAdminShortlist).not.toHaveBeenCalled();
  });

  it('allows a confirmed order with an unknown legacy package without a size rule', async () => {
    asAdmin();
    mockedGetProfile.mockResolvedValue({ id: 'founder-id', role: 'founder' } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    mockedListFounderOrders.mockResolvedValue([
      {
        id: 'legacy-order-id',
        status: 'confirmed',
        package: 'legacy',
        project_id: null,
      },
    ] as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const result = await generateShortlist(['student-id'], 'founder-id', null);

    expect(result.ok).toBe(true);
    expect(mockedReplaceAdminShortlist).toHaveBeenCalledWith(
      'founder-id',
      null,
      ['student-id']
    );
  });
});
