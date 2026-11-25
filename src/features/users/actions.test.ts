import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveStudentProfile, uploadCv } from '@/features/users/actions';
import {
  auth,
  mockAuthSession,
  mockStorage,
  setMockUser,
  storage,
  uploadedCvPath,
} from '@tests/neon-auth.mock';
import {
  getProfileRole,
  getStudentProfile,
  setStudentProfileCv,
} from '@/lib/neon-data';

const mockedGetSql = vi.hoisted(() => vi.fn());
vi.mock('@/lib/neon', () => ({ getSql: mockedGetSql }));

const mockedGetSession = vi.mocked(auth.getSession);
const mockedGetProfileRole = vi.mocked(getProfileRole);
const mockedGetStudentProfile = vi.mocked(getStudentProfile);
const mockedSetStudentProfileCv = vi.mocked(setStudentProfileCv);

describe('saveStudentProfile', () => {
  let transaction: ReturnType<typeof vi.fn>;
  let queries: unknown[];

  beforeEach(() => {
    mockAuthSession();
    vi.clearAllMocks();
    queries = [];
    transaction = vi.fn(async (buildQueries: (txn: unknown) => unknown[]) => {
      const txn = vi.fn((...args: unknown[]) => args);
      queries = buildQueries(txn) as unknown[];
      return [
        [{ id: 'student-uuid' }],
        [{ id: 'student-uuid' }],
      ];
    });
    mockedGetSql.mockReturnValue({ transaction });
    // saveStudentProfile rechecks the role server-side.
    mockedGetProfileRole.mockResolvedValue('student');
  });

  it('rejects when not signed in', async () => {
    setMockUser(null);
    const fd = new FormData();
    fd.set('full_name', 'Tashi Dorji');
    const result = await saveStudentProfile(fd);
    expect(result.ok).toBe(false);
    expect(result.message).toBe('Not signed in.');
  });

  it('rejects a non-student caller', async () => {
    setMockUser({ id: 'founder-uuid', email: 'x@y.com' });
    mockedGetProfileRole.mockResolvedValue('founder');
    const fd = new FormData();
    fd.set('full_name', 'Tashi Dorji');
    const result = await saveStudentProfile(fd);
    expect(result.ok).toBe(false);
    expect(result.message).toContain('Only students');
  });

  it('rejects empty full_name', async () => {
    setMockUser({ id: 'student-uuid', email: 'x@y.com' });
    const fd = new FormData();
    fd.set('full_name', '');
    const result = await saveStudentProfile(fd);
    expect(result.ok).toBe(false);
    expect(result.message).toContain('Full name is required.');
  });

  it('saves a valid profile', async () => {
    setMockUser({ id: 'student-uuid', email: 'tashi@college.bt' });

    const fd = new FormData();
    fd.set('full_name', 'Tashi Dorji');
    fd.set('college', 'Royal Thimphu College');
    fd.set('course', 'BSc Computer Science');
    fd.set('year', '3rd');
    fd.set('availability', 'weekdays');
    fd.set('skills', 'React, TypeScript');
    fd.set('bio', 'Final-year CS student looking for part-time work.');

    const result = await saveStudentProfile(fd);

    expect(result.ok).toBe(true);
    expect(result.message).toBe('Profile saved.');
    expect(mockedGetSql).toHaveBeenCalled();
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(queries).toHaveLength(2);
  });

  it('rejects a partial transaction instead of reporting success', async () => {
    setMockUser({ id: 'student-uuid', email: 'x@y.com' });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    transaction.mockResolvedValueOnce([[{ id: 'student-uuid' }], []]);
    const fd = new FormData();
    fd.set('full_name', 'Tashi Dorji');

    const result = await saveStudentProfile(fd);

    expect(result.ok).toBe(false);
    expect(result.message).toBe('Could not save profile. Try again.');
  });

  it('handles DB error without leaking driver text', async () => {
    setMockUser({ id: 'student-uuid', email: 'x@y.com' });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    transaction.mockRejectedValueOnce(new Error('Duplicate entry'));
    const fd = new FormData();
    fd.set('full_name', 'Tashi Dorji');
    const result = await saveStudentProfile(fd);
    expect(result.ok).toBe(false);
    expect(result.message).toBe('Could not save profile. Try again.');
    expect(result.message).not.toContain('Duplicate entry');
  });

  it('verify the session is read', async () => {
    setMockUser({ id: 'student-uuid', email: 'x@y.com' });
    const fd = new FormData();
    fd.set('full_name', 'Tashi Dorji');

    await saveStudentProfile(fd);
    expect(mockedGetSession).toHaveBeenCalled();
  });
});

describe('uploadCv', () => {
  beforeEach(() => {
    mockAuthSession();
    mockStorage();
    vi.clearAllMocks();
    mockedGetProfileRole.mockResolvedValue('student');
    mockedSetStudentProfileCv.mockResolvedValue();
    mockedGetStudentProfile.mockResolvedValue(null);
    setMockUser({ id: 'student-uuid', email: 'tashi@college.bt' });
  });

  it('rejects a mislabelled non-PDF before uploading', async () => {
    const formData = new FormData();
    formData.set('cv', new File(['not a pdf'], 'cv.pdf', { type: 'application/pdf' }));

    const result = await uploadCv(formData);

    expect(result.ok).toBe(false);
    expect(result.message).toBe('Use a valid PDF file.');
    expect(storage.uploadCv).not.toHaveBeenCalled();
  });

  it('uploads to a per-attempt path and publishes only that path', async () => {
    const formData = new FormData();
    formData.set('cv', new File(['%PDF-1.4 sample'], 'cv.pdf', { type: 'application/pdf' }));
    mockedGetStudentProfile.mockImplementation(async () => ({
      cv_path: await uploadedCvPath(),
    }) as never);

    const result = await uploadCv(formData);

    const uploadedPath = await uploadedCvPath();
    const [userId, file] = storage.uploadCv.mock.calls[0] as [string, File];
    expect(result.ok).toBe(true);
    expect(result.message).toBe('CV uploaded.');
    expect(userId).toBe('student-uuid');
    expect(file).toBeInstanceOf(File);
    expect(uploadedPath).toMatch(/^student-uuid\/cv-.+\.pdf$/);
    expect(mockedSetStudentProfileCv).toHaveBeenCalledWith(
      'student-uuid',
      uploadedPath,
      expect.any(String)
    );
    expect(mockedGetStudentProfile).toHaveBeenCalledWith('student-uuid');
  });

  it('does not publish a CV when the Neon write fails', async () => {
    const formData = new FormData();
    formData.set('cv', new File(['%PDF-1.4 sample'], 'cv.pdf', { type: 'application/pdf' }));
    mockedSetStudentProfileCv.mockRejectedValueOnce(new Error('db down'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await uploadCv(formData);

    expect(result.ok).toBe(false);
    expect(result.message).toBe(
      'The CV file was uploaded, but the profile link could not be saved. Try again.'
    );
    expect(result.message).not.toContain('db down');
    expect(storage.uploadCv).toHaveBeenCalledTimes(1);
    expect(mockedGetStudentProfile).not.toHaveBeenCalled();
  });

  it('does not report success when the stored path does not match', async () => {
    const formData = new FormData();
    formData.set('cv', new File(['%PDF-1.4 sample'], 'cv.pdf', { type: 'application/pdf' }));
    mockedGetStudentProfile.mockResolvedValue({
      cv_path: 'student-uuid/older-cv.pdf',
    } as never);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await uploadCv(formData);

    expect(result.ok).toBe(false);
    expect(result.message).toContain('profile link could not be saved');
  });

  it('does not touch Neon when the Storage upload fails', async () => {
    const formData = new FormData();
    formData.set('cv', new File(['%PDF-1.4 sample'], 'cv.pdf', { type: 'application/pdf' }));
    storage.uploadCv.mockRejectedValueOnce(new Error('storage down'));

    const result = await uploadCv(formData);

    expect(result.ok).toBe(false);
    expect(result.message).toBe('Could not upload CV. Try again.');
    expect(mockedSetStudentProfileCv).not.toHaveBeenCalled();
  });
});
