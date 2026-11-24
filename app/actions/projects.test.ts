import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProject } from '@/app/actions/projects';
import { mockSupabaseClient, setMockUser } from '@/test/supabase.mock';
import { createClient } from '@/lib/supabase/server';

const mockedCreateClient = vi.mocked(createClient);

describe('createProject', () => {
  let client: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  let chain: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  beforeEach(() => {
    ({ client, chain } = mockSupabaseClient());
    vi.clearAllMocks();
  });

  it('rejects when not signed in', async () => {
    setMockUser(client, null);
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
    setMockUser(client, { id: 'user-uuid', email: 'x@y.com' });
    chain.single.mockResolvedValue({ data: { role: 'student' }, error: null });
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
    setMockUser(client, { id: 'founder-uuid', email: 'x@y.com' });
    chain.single.mockResolvedValue({ data: { role: 'founder' }, error: null });
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
    setMockUser(client, { id: 'founder-uuid', email: 'x@y.com' });
    chain.single.mockResolvedValue({ data: { role: 'founder' }, error: null });
    chain.insert.mockResolvedValue({ data: [{ id: 'project-id' }], error: null });

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
    expect(chain.insert).toHaveBeenCalledWith({
      title: 'Build a landing page',
      description:
        'A simple landing page for my startup with a contact form.',
      founder_id: 'founder-uuid',
      required_skills: ['React', 'Tailwind'],
      duration: '1 month',
      budget_min: 500,
      budget_max: 1000,
      work_mode: 'remote',
      deadline: null,
      status: 'open',
    });
  });

  it('rejects budget min greater than max', async () => {
    setMockUser(client, { id: 'founder-uuid', email: 'x@y.com' });
    chain.single.mockResolvedValue({ data: { role: 'founder' }, error: null });
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

  it('verify createClient is called', async () => {
    setMockUser(client, { id: 'founder-uuid', email: 'x@y.com' });
    chain.single.mockResolvedValue({ data: { role: 'founder' }, error: null });
    chain.insert.mockResolvedValue({ data: [{ id: 'id' }], error: null });
    const fd = new FormData();
    fd.set('title', 'Valid Title');
    fd.set('description', 'A valid description that is long enough.');
    fd.set('duration', '1 month');
    fd.set('budget_min', '500');
    fd.set('budget_max', '1000');
    fd.set('skills', '');

    await createProject(fd);
    expect(mockedCreateClient).toHaveBeenCalled();
  });
});
