import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createShortlistOrder } from '@/app/actions/shortlist-order';
import { mockSupabaseClient, setMockUser } from '@/test/supabase.mock';
import { createClient } from '@/lib/supabase/server';
import { getProfileRole, insertOrder } from '@/lib/neon-data';

const mockedCreateClient = vi.mocked(createClient);
const mockedGetProfileRole = vi.mocked(getProfileRole);
const mockedInsertOrder = vi.mocked(insertOrder);

describe('createShortlistOrder', () => {
  let client: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  beforeEach(() => {
    ({ client } = mockSupabaseClient());
    vi.clearAllMocks();
    mockedInsertOrder.mockResolvedValue({ id: 'order-id' });
  });

  it('rejects when not signed in', async () => {
    setMockUser(client, null);
    const result = await createShortlistOrder('basic', null, null);
    expect(result.ok).toBe(false);
    expect(result.message).toBe('Not signed in.');
  });

  it('rejects when user is not a founder', async () => {
    setMockUser(client, { id: 'user-uuid', email: 'x@y.com' });
    mockedGetProfileRole.mockResolvedValue('student');
    const result = await createShortlistOrder('basic', null, null);
    expect(result.ok).toBe(false);
    expect(result.message).toBe('Only founders can order shortlists.');
  });

  it('rejects invalid package', async () => {
    setMockUser(client, { id: 'founder-uuid', email: 'x@y.com' });
    mockedGetProfileRole.mockResolvedValue('founder');
    const result = await createShortlistOrder('premium' as any, null, null); // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(result.ok).toBe(false);
    expect(result.message).toBe('Choose a package.');
  });

  it('rejects amount below package range', async () => {
    setMockUser(client, { id: 'founder-uuid', email: 'x@y.com' });
    mockedGetProfileRole.mockResolvedValue('founder');
    const result = await createShortlistOrder('basic', null, 100); // basic range is 500-1000
    expect(result.ok).toBe(false);
    expect(result.message).toContain('between Nu 500 and Nu 1000');
  });

  it('rejects amount above package range', async () => {
    setMockUser(client, { id: 'founder-uuid', email: 'x@y.com' });
    mockedGetProfileRole.mockResolvedValue('founder');
    const result = await createShortlistOrder('basic', null, 5000); // basic range is 500-1000
    expect(result.ok).toBe(false);
    expect(result.message).toContain('between Nu 500 and Nu 1000');
  });

  it('creates order with default amount when amount not provided', async () => {
    setMockUser(client, { id: 'founder-uuid', email: 'x@y.com' });
    mockedGetProfileRole.mockResolvedValue('founder');

    const result = await createShortlistOrder('basic', null, null);

    expect(result.ok).toBe(true);
    expect(result.orderId).toBe('order-id');
    expect(mockedInsertOrder).toHaveBeenCalledWith({
      founderId: 'founder-uuid',
      projectId: null,
      package: 'basic',
      amount: 750, // defaultAmount for basic
    });
  });

  it('creates order with provided amount when within range', async () => {
    setMockUser(client, { id: 'founder-uuid', email: 'x@y.com' });
    mockedGetProfileRole.mockResolvedValue('founder');

    const result = await createShortlistOrder('full', 'project-uuid', 1800); // full range 1000-2000

    expect(result.ok).toBe(true);
    expect(mockedInsertOrder).toHaveBeenCalledWith({
      founderId: 'founder-uuid',
      projectId: 'project-uuid',
      package: 'full',
      amount: 1800,
    });
  });

  it('verify createClient is called', async () => {
    setMockUser(client, { id: 'founder-uuid', email: 'x@y.com' });
    mockedGetProfileRole.mockResolvedValue('founder');

    await createShortlistOrder('basic', null, null);
    expect(mockedCreateClient).toHaveBeenCalled();
  });
});
