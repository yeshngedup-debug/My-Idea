import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveStudentProfile } from '@/app/actions/student-profile';
import { mockSupabaseClient, setMockUser } from '@/test/supabase.mock';
import { createClient } from '@/lib/supabase/server';

const mockedCreateClient = vi.mocked(createClient);

describe('saveStudentProfile', () => {
  let client: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  let chain: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  beforeEach(() => {
    ({ client, chain } = mockSupabaseClient());
    vi.clearAllMocks();
    // saveStudentProfile now rechecks the role server-side.
    chain.single.mockResolvedValue({ data: { role: 'student' }, error: null });
  });

  it('rejects when not signed in', async () => {
    setMockUser(client, null);
    const fd = new FormData();
    fd.set('full_name', 'Tashi Dorji');
    const result = await saveStudentProfile(fd);
    expect(result.ok).toBe(false);
    expect(result.message).toBe('Not signed in.');
  });

  it('rejects a non-student caller', async () => {
    setMockUser(client, { id: 'founder-uuid', email: 'x@y.com' });
    chain.single.mockResolvedValue({ data: { role: 'founder' }, error: null });
    const fd = new FormData();
    fd.set('full_name', 'Tashi Dorji');
    const result = await saveStudentProfile(fd);
    expect(result.ok).toBe(false);
    expect(result.message).toContain('Only students');
  });

  it('rejects empty full_name', async () => {
    setMockUser(client, { id: 'student-uuid', email: 'x@y.com' });
    const fd = new FormData();
    fd.set('full_name', '');
    const result = await saveStudentProfile(fd);
    expect(result.ok).toBe(false);
    expect(result.message).toContain('Full name is required.');
  });

  it('saves a valid profile', async () => {
    setMockUser(client, { id: 'student-uuid', email: 'tashi@college.bt' });
    chain.upsert.mockResolvedValue({ error: null });

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
    expect(chain.upsert).toHaveBeenCalledWith(
      {
        id: 'student-uuid',
        full_name: 'Tashi Dorji',
        college: 'Royal Thimphu College',
        course: 'BSc Computer Science',
        year: '3rd',
        skills: ['React', 'TypeScript'],
        bio: 'Final-year CS student looking for part-time work.',
        availability: 'weekdays',
        contact_email: 'tashi@college.bt',
        updated_at: expect.any(String),
      },
      { onConflict: 'id' },
    );
  });

  it('handles DB error gracefully', async () => {
    setMockUser(client, { id: 'student-uuid', email: 'x@y.com' });
    chain.upsert.mockResolvedValue({ error: { message: 'Duplicate entry' } });
    const fd = new FormData();
    fd.set('full_name', 'Tashi Dorji');
    const result = await saveStudentProfile(fd);
    expect(result.ok).toBe(false);
    expect(result.message).toContain('Duplicate entry');
  });

  it('verify createClient is called', async () => {
    setMockUser(client, { id: 'student-uuid', email: 'x@y.com' });
    chain.upsert.mockResolvedValue({ error: null });
    const fd = new FormData();
    fd.set('full_name', 'Tashi Dorji');

    await saveStudentProfile(fd);
    expect(mockedCreateClient).toHaveBeenCalled();
  });
});
