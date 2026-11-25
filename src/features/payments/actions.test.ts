import { describe, it, expect, vi, beforeEach } from 'vitest';

// Payment proofs live in their own private bucket, wired through files-sdk.
const { proofFiles } = vi.hoisted(() => ({
  proofFiles: {
    upload: vi.fn(async () => undefined),
    exists: vi.fn(async () => false),
    url: vi.fn(async () => 'https://example.test/payment-proof'),
  },
}));

vi.mock('files-sdk', () => ({
  Files: vi.fn(function FilesMock(this: unknown) {
    return proofFiles;
  }),
}));
vi.mock('files-sdk/neon', () => ({ neon: vi.fn(() => ({})) }));

import {
  confirmOrder,
  createShortlistOrder,
  rejectOrder,
  uploadPaymentScreenshot,
} from '@/features/payments/actions';
import { auth, mockAuthSession, setMockUser } from '@tests/neon-auth.mock';
import { ORDER_COPY } from '@/lib/order-status';
import {
  getOrder,
  getProfileRole,
  insertOrder,
  setOrderStatus,
} from '@/lib/neon-data';

const mockedGetSession = vi.mocked(auth.getSession);
const mockedGetProfileRole = vi.mocked(getProfileRole);
const mockedInsertOrder = vi.mocked(insertOrder);
const mockedGetOrder = vi.mocked(getOrder);
const mockedSetOrderStatus = vi.mocked(setOrderStatus);

describe('createShortlistOrder', () => {
  beforeEach(() => {
    mockAuthSession();
    vi.clearAllMocks();
    mockedInsertOrder.mockResolvedValue({ id: 'order-id' });
  });

  it('rejects when not signed in', async () => {
    setMockUser(null);
    const result = await createShortlistOrder('basic', null, null);
    expect(result.ok).toBe(false);
    expect(result.message).toBe('Not signed in.');
  });

  it('rejects when user is not a founder', async () => {
    setMockUser({ id: 'user-uuid', email: 'x@y.com' });
    mockedGetProfileRole.mockResolvedValue('student');
    const result = await createShortlistOrder('basic', null, null);
    expect(result.ok).toBe(false);
    expect(result.message).toBe('Only founders can order shortlists.');
  });

  it('rejects invalid package', async () => {
    setMockUser({ id: 'founder-uuid', email: 'x@y.com' });
    mockedGetProfileRole.mockResolvedValue('founder');
    const result = await createShortlistOrder('premium' as any, null, null); // eslint-disable-line @typescript-eslint/no-explicit-any
    expect(result.ok).toBe(false);
    expect(result.message).toBe('Choose a package.');
  });

  it('rejects amount below package range', async () => {
    setMockUser({ id: 'founder-uuid', email: 'x@y.com' });
    mockedGetProfileRole.mockResolvedValue('founder');
    const result = await createShortlistOrder('basic', null, 100); // basic range is 500-1000
    expect(result.ok).toBe(false);
    expect(result.message).toContain('between Nu 500 and Nu 1000');
  });

  it('rejects amount above package range', async () => {
    setMockUser({ id: 'founder-uuid', email: 'x@y.com' });
    mockedGetProfileRole.mockResolvedValue('founder');
    const result = await createShortlistOrder('basic', null, 5000); // basic range is 500-1000
    expect(result.ok).toBe(false);
    expect(result.message).toContain('between Nu 500 and Nu 1000');
  });

  it('creates order with default amount when amount not provided', async () => {
    setMockUser({ id: 'founder-uuid', email: 'x@y.com' });
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
    setMockUser({ id: 'founder-uuid', email: 'x@y.com' });
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

  it('verify the session is read', async () => {
    setMockUser({ id: 'founder-uuid', email: 'x@y.com' });
    mockedGetProfileRole.mockResolvedValue('founder');

    await createShortlistOrder('basic', null, null);
    expect(mockedGetSession).toHaveBeenCalled();
  });
});

describe('payment review guards', () => {
  beforeEach(() => {
    mockAuthSession();
    vi.clearAllMocks();
    mockedSetOrderStatus.mockResolvedValue();
    proofFiles.upload.mockResolvedValue(undefined);
    proofFiles.exists.mockResolvedValue(false);
    proofFiles.url.mockResolvedValue('https://example.test/payment-proof');
  });

  const asFounder = () => setMockUser({ id: 'founder-uuid', email: 'x@y.com' });
  const asAdmin = () => {
    setMockUser({ id: 'admin-uuid', email: 'admin@example.com' });
    mockedGetProfileRole.mockResolvedValue('admin');
  };

  it('blocks uploads to a rejected order', async () => {
    asFounder();
    mockedGetOrder.mockResolvedValue({
      id: 'order-id',
      founder_id: 'founder-uuid',
      status: 'rejected',
      screenshot_path: null,
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    const formData = new FormData();
    formData.set('screenshot', new File(['proof'], 'proof.png', { type: 'image/png' }));

    const result = await uploadPaymentScreenshot('order-id', formData);

    expect(result.ok).toBe(false);
    expect(result.message).toBe(ORDER_COPY.orderRejected);
    expect(mockedSetOrderStatus).not.toHaveBeenCalled();
  });

  it('reports the manual next step when an order is confirmed', async () => {
    asAdmin();
    mockedGetOrder.mockResolvedValue({
      id: 'order-id',
      status: 'submitted',
      screenshot_path: 'founder-id/order-id.png',
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    proofFiles.exists.mockResolvedValue(true);

    const result = await confirmOrder('order-id');

    expect(result.ok).toBe(true);
    expect(result.message).toBe(ORDER_COPY.paymentConfirmed);
    expect(proofFiles.url).toHaveBeenCalledWith('founder-id/order-id.png', {
      expiresIn: expect.any(Number),
    });
    expect(mockedSetOrderStatus).toHaveBeenCalledWith(
      'order-id',
      'confirmed',
      expect.any(String),
    );
  });

  it('does not confirm when the proof object has been deleted', async () => {
    asAdmin();
    mockedGetOrder.mockResolvedValue({
      id: 'order-id',
      status: 'submitted',
      screenshot_path: 'founder-id/order-id.png',
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    proofFiles.exists.mockResolvedValue(false);

    const result = await confirmOrder('order-id');

    expect(result.ok).toBe(false);
    expect(result.message).toBe(
      'Payment proof is unavailable. Ask the founder to upload it again.',
    );
    expect(proofFiles.url).not.toHaveBeenCalled();
    expect(mockedSetOrderStatus).not.toHaveBeenCalled();
  });

  it('does not allow confirming an already confirmed order', async () => {
    asAdmin();
    mockedGetOrder.mockResolvedValue({
      id: 'order-id',
      status: 'confirmed',
      screenshot_path: 'founder-id/order-id.png',
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const result = await confirmOrder('order-id');

    expect(result.ok).toBe(false);
    expect(result.message).toBe('This order can no longer be reviewed.');
    expect(mockedSetOrderStatus).not.toHaveBeenCalled();
  });

  it('does not allow rejecting an already rejected order', async () => {
    asAdmin();
    mockedGetOrder.mockResolvedValue({
      id: 'order-id',
      status: 'rejected',
      screenshot_path: null,
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const result = await rejectOrder('order-id');

    expect(result.ok).toBe(false);
    expect(result.message).toBe('This order can no longer be reviewed.');
    expect(mockedSetOrderStatus).not.toHaveBeenCalled();
  });

  it('points admins to the founder self-service recovery path after rejection', async () => {
    asAdmin();
    mockedGetOrder.mockResolvedValue({
      id: 'order-id',
      status: 'submitted',
      screenshot_path: 'founder-id/order-id.png',
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    const result = await rejectOrder('order-id');

    expect(result.ok).toBe(true);
    expect(result.message).toBe(ORDER_COPY.orderReviewRejected);
    expect(mockedSetOrderStatus).toHaveBeenCalledWith('order-id', 'rejected');
  });
});
