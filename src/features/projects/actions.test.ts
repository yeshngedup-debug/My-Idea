import { describe, it, expect, vi, beforeEach } from 'vitest';
import { revalidatePath } from 'next/cache';
import {
  createProject,
  updateApplicationStatus,
  updateProjectStatus,
} from '@/features/projects/actions';
import { auth, mockAuthSession, setMockUser } from '@tests/neon-auth.mock';
import {
  getApplication,
  getProfileRole,
  getProject,
  insertProject,
  listProjectApplicants,
  updateApplicationStatus as updateApplicationStatusRow,
  updateProjectStatus as updateProjectStatusRow,
} from '@/lib/neon-data';

const mockedGetSession = vi.mocked(auth.getSession);
const mockedRevalidatePath = vi.mocked(revalidatePath);
const mockedGetProfileRole = vi.mocked(getProfileRole);
const mockedInsertProject = vi.mocked(insertProject);
const mockedGetApplication = vi.mocked(getApplication);
const mockedGetProject = vi.mocked(getProject);
const mockedListProjectApplicants = vi.mocked(listProjectApplicants);
const mockedUpdateApplicationStatusRow = vi.mocked(updateApplicationStatusRow);
const mockedUpdateProjectStatusRow = vi.mocked(updateProjectStatusRow);

function localDateInputValue(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function projectForm(deadline = ''): FormData {
  const fd = new FormData();
  fd.set('title', 'Build a landing page');
  fd.set('description', 'A simple landing page for my startup with a contact form.');
  fd.set('duration', '1 month');
  fd.set('work_mode', 'remote');
  fd.set('deadline', deadline);
  fd.set('budget_min', '500');
  fd.set('budget_max', '1000');
  fd.set('skills', 'React, Tailwind');
  return fd;
}

describe('createProject', () => {
  beforeEach(() => {
    mockAuthSession();
    vi.clearAllMocks();
    mockedInsertProject.mockResolvedValue({ id: 'project-id' });
  });

  it('rejects when not signed in', async () => {
    setMockUser(null);
    const fd = new FormData();
    fd.set('title', 'Valid Title');
    fd.set('description', 'A valid description that is long enough.');
    fd.set('duration', '1 month');
    fd.set('budget_min', '500');
    fd.set('budget_max', '1000');
    fd.set('skills', '');
    const result = await createProject(fd);
    expect(result.ok).toBe(false);
    expect(result.message).toBe('Not signed in.');
  });

  it('rejects when user is not a founder', async () => {
    setMockUser({ id: 'user-uuid', email: 'x@y.com' });
    mockedGetProfileRole.mockResolvedValue('student');
    const fd = new FormData();
    fd.set('title', 'Valid Title');
    fd.set('description', 'A valid description that is long enough.');
    fd.set('duration', '1 month');
    fd.set('budget_min', '500');
    fd.set('budget_max', '1000');
    fd.set('skills', '');
    const result = await createProject(fd);
    expect(result.ok).toBe(false);
    expect(result.message).toBe('Only founders can post projects.');
  });

  it('rejects invalid form data', async () => {
    setMockUser({ id: 'founder-uuid', email: 'x@y.com' });
    mockedGetProfileRole.mockResolvedValue('founder');
    const fd = new FormData();
    fd.set('title', 'Hi'); // too short
    fd.set('description', 'Too short');
    fd.set('duration', '1 month');
    fd.set('budget_min', '500');
    fd.set('budget_max', '1000');
    fd.set('skills', '');
    const result = await createProject(fd);
    expect(result.ok).toBe(false);
    expect(result.message).toContain('Title must be at least 5 characters.');
  });

  it('creates a project with valid data', async () => {
    setMockUser({ id: 'founder-uuid', email: 'x@y.com' });
    mockedGetProfileRole.mockResolvedValue('founder');

    const fd = new FormData();
    fd.set('title', 'Build a landing page');
    fd.set('description', 'A simple landing page for my startup with a contact form.');
    fd.set('duration', '1 month');
    fd.set('work_mode', 'remote');
    fd.set('deadline', '');
    fd.set('budget_min', '500');
    fd.set('budget_max', '1000');
    fd.set('skills', 'React, Tailwind');

    const result = await createProject(fd);

    expect(result.ok).toBe(true);
    expect(result.message).toBe('Project posted.');
    expect(mockedInsertProject).toHaveBeenCalledWith({
      title: 'Build a landing page',
      description: 'A simple landing page for my startup with a contact form.',
      founderId: 'founder-uuid',
      requiredSkills: ['React', 'Tailwind'],
      duration: '1 month',
      budgetMin: 500,
      budgetMax: 1000,
      workMode: 'remote',
      deadline: null,
    });
  });

  it('accepts a date-only deadline for the current local day west of UTC', async () => {
    const originalTimeZone = process.env.TZ;
    process.env.TZ = 'America/Los_Angeles';

    try {
      setMockUser({ id: 'founder-uuid', email: 'x@y.com' });
      mockedGetProfileRole.mockResolvedValue('founder');
      const today = localDateInputValue();

      const result = await createProject(projectForm(today));

      expect(result.ok).toBe(true);
      expect(mockedInsertProject).toHaveBeenCalledWith(
        expect.objectContaining({ deadline: today })
      );
    } finally {
      if (originalTimeZone === undefined) delete process.env.TZ;
      else process.env.TZ = originalTimeZone;
    }
  });

  it('rejects budget min greater than max', async () => {
    setMockUser({ id: 'founder-uuid', email: 'x@y.com' });
    mockedGetProfileRole.mockResolvedValue('founder');
    const fd = new FormData();
    fd.set('title', 'Valid Title');
    fd.set('description', 'A valid description that is long enough.');
    fd.set('duration', '1 month');
    fd.set('budget_min', '2000');
    fd.set('budget_max', '1000');
    fd.set('skills', '');
    const result = await createProject(fd);
    expect(result.ok).toBe(false);
    expect(result.message).toContain('Budget minimum cannot exceed maximum.');
  });

  it('verify the session is read', async () => {
    setMockUser({ id: 'founder-uuid', email: 'x@y.com' });
    mockedGetProfileRole.mockResolvedValue('founder');
    const fd = new FormData();
    fd.set('title', 'Valid Title');
    fd.set('description', 'A valid description that is long enough.');
    fd.set('duration', '1 month');
    fd.set('budget_min', '500');
    fd.set('budget_max', '1000');
    fd.set('skills', '');

    await createProject(fd);
    expect(mockedGetSession).toHaveBeenCalled();
  });
});

describe('updateApplicationStatus', () => {
  const asOwner = (currentStatus: string) => {
    setMockUser({ id: 'founder-uuid', email: 'x@y.com' });
    mockedGetApplication.mockResolvedValue({ id: 'application-id', project_id: 'project-id' } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    mockedGetProject.mockResolvedValue({ id: 'project-id', founder_id: 'founder-uuid' } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    mockedListProjectApplicants.mockResolvedValue([
      { id: 'application-id', status: currentStatus },
    ] as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  };

  beforeEach(() => {
    mockAuthSession();
    vi.clearAllMocks();
    mockedUpdateApplicationStatusRow.mockResolvedValue(true);
  });

  it('allows pending to shortlisted', async () => {
    asOwner('pending');

    const result = await updateApplicationStatus('application-id', 'shortlisted');

    expect(result.ok).toBe(true);
    expect(mockedUpdateApplicationStatusRow).toHaveBeenCalledWith(
      'application-id',
      'shortlisted'
    );
  });

  it('rejects skipping pending to accepted', async () => {
    asOwner('pending');

    const result = await updateApplicationStatus('application-id', 'accepted');

    expect(result.ok).toBe(false);
    expect(result.message).toBe('That applicant status change is not allowed.');
    expect(mockedUpdateApplicationStatusRow).not.toHaveBeenCalled();
  });

  it('rejects reopening a rejected application', async () => {
    asOwner('rejected');

    const result = await updateApplicationStatus('application-id', 'shortlisted');

    expect(result.ok).toBe(false);
    expect(mockedUpdateApplicationStatusRow).not.toHaveBeenCalled();
  });

  it('reports a stale failure and refreshes paths when no row changed', async () => {
    asOwner('pending');
    mockedUpdateApplicationStatusRow.mockResolvedValue(false);

    const result = await updateApplicationStatus('application-id', 'shortlisted');

    expect(result).toEqual({
      ok: false,
      message: 'Could not update applicant status. Refresh and try again.',
    });
    expect(mockedRevalidatePath).toHaveBeenCalledWith('/founder/projects/project-id');
    expect(mockedRevalidatePath).toHaveBeenCalledWith('/student/applications');
  });
});

describe('updateProjectStatus', () => {
  const asOwner = () => {
    setMockUser({ id: 'founder-uuid', email: 'x@y.com' });
    mockedGetProject.mockResolvedValue({
      id: 'project-id',
      founder_id: 'founder-uuid',
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  };

  beforeEach(() => {
    mockAuthSession();
    vi.clearAllMocks();
    mockedUpdateProjectStatusRow.mockResolvedValue(true);
  });

  it('reports success when a row was updated', async () => {
    asOwner();

    const result = await updateProjectStatus('project-id', 'in_progress');

    expect(result).toEqual({ ok: true, message: 'Project status updated.' });
    expect(mockedUpdateProjectStatusRow).toHaveBeenCalledWith(
      'project-id',
      'founder-uuid',
      'in_progress'
    );
  });

  it('reports a stale failure and refreshes paths when no row changed', async () => {
    asOwner();
    mockedUpdateProjectStatusRow.mockResolvedValue(false);

    const result = await updateProjectStatus('project-id', 'in_progress');

    expect(result).toEqual({
      ok: false,
      message: 'Could not update project status. Refresh and try again.',
    });
    expect(mockedRevalidatePath).toHaveBeenCalledWith('/founder/projects/project-id');
    expect(mockedRevalidatePath).toHaveBeenCalledWith('/student/projects');
  });
});
