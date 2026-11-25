'use server';

/**
 * Premium Shortlist order actions — manual payment flow.
 * Founder creates an order + uploads a screenshot to private object storage;
 * admin confirms/rejects. Order rows live in Neon.
 */
import { revalidatePath } from 'next/cache';
import { Files } from 'files-sdk';
import { neon } from 'files-sdk/neon';
import { getUser } from '@/lib/auth';
import { STORAGE_BUCKETS } from '@/lib/constants';
import {
  getProfileRole,
  insertOrder,
  getOrder,
  setOrderScreenshot,
  setOrderStatus,
} from '@/lib/neon-data';
import { PACKAGES, type PackageId } from '@/config/payment';
import { ORDER_COPY } from '@/lib/order-status';
import { shortlistOrderSchema } from '@/lib/validators';
import { rateLimit } from '@/lib/rate-limit';

export interface OrderResult {
  ok: boolean;
  message: string;
}

const ALLOWED_IMAGE = ['image/png', 'image/jpeg', 'image/webp'];
const REVIEWABLE_STATUSES = ['pending', 'submitted'];

/** Payment proofs live in their own private bucket, separate from CVs. */
let proofFiles: Files | undefined;
function getProofFiles(): Files {
  if (!proofFiles) {
    proofFiles = new Files({
      adapter: neon({ bucket: STORAGE_BUCKETS.paymentScreenshots }),
    });
  }
  return proofFiles;
}

/** Fresh short-lived link for an admin to inspect an uploaded payment proof. */
export async function signPaymentProof(
  path: string,
  expiresIn: number
): Promise<string | null> {
  try {
    return await getProofFiles().url(path, { expiresIn });
  } catch (error) {
    console.error('[shortlist-order] Payment proof signed URL failed', error);
    return null;
  }
}

export async function createShortlistOrder(
  packageId: PackageId,
  projectId: string | null,
  amount: number | null
): Promise<OrderResult & { orderId?: string }> {
  const user = await getUser();
  if (!user) return { ok: false, message: 'Not signed in.' };

  const role = await getProfileRole(user.id);
  if (role !== 'founder') {
    return { ok: false, message: 'Only founders can order shortlists.' };
  }

  const { ok: withinLimit } = rateLimit(`order:${user.id}`, {
    limit: 10,
    windowMs: 60 * 1000,
  });
  if (!withinLimit) {
    return { ok: false, message: 'Too many orders. Wait a minute and try again.' };
  }

  if (!(packageId in PACKAGES)) {
    return { ok: false, message: 'Choose a package.' };
  }

  // Zod validation of the amount input
  const parsed = shortlistOrderSchema.safeParse({ amount });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'Enter a valid amount.' };
  }
  const { amount: validatedAmount } = parsed.data;

  const pkg = PACKAGES[packageId];

  // Validate the founder-declared amount against the package's advertised range.
  const match = pkg.priceRange.match(/[\d,]+/g);
  if (!match) {
    return { ok: false, message: 'Invalid package price range.' };
  }
  const rangeNumbers = match.map((n) => parseInt(n.replace(/,/g, ''), 10));
  const [rangeMin, rangeMax = rangeNumbers[0]] = rangeNumbers;

  const cleanAmount =
    validatedAmount != null && Number.isFinite(validatedAmount) && validatedAmount > 0
      ? validatedAmount
      : pkg.defaultAmount;

  if (cleanAmount < rangeMin || cleanAmount > rangeMax) {
    return {
      ok: false,
      message: `Amount must be between Nu ${rangeMin} and Nu ${rangeMax} for the ${pkg.name} package.`,
    };
  }

  let orderId: string;
  try {
    const row = await insertOrder({
      founderId: user.id,
      projectId: projectId || null,
      package: packageId,
      amount: cleanAmount,
    });
    orderId = row.id;
  } catch {
    return { ok: false, message: 'Could not create order. Try again.' };
  }

  revalidatePath('/founder/shortlists');
  revalidatePath('/admin/payments');
  return { ok: true, message: 'Order created. Upload your payment screenshot.', orderId };
}

export async function uploadPaymentScreenshot(
  orderId: string,
  formData: FormData
): Promise<OrderResult> {
  const user = await getUser();
  if (!user) return { ok: false, message: 'Not signed in.' };

  const file = formData.get('screenshot');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: 'Choose a screenshot first.' };
  }
  if (!ALLOWED_IMAGE.includes(file.type)) {
    return { ok: false, message: 'Use a PNG, JPG, or WEBP image.' };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, message: 'Image must be 5 MB or smaller.' };
  }

  // Order must belong to this founder and be payable
  const order = await getOrder(orderId);

  if (!order || order.founder_id !== user.id) {
    return { ok: false, message: 'Order not found.' };
  }
  if (order.status === 'confirmed') {
    return { ok: false, message: 'This order is already confirmed.' };
  }
  if (order.status === 'rejected') {
    return { ok: false, message: ORDER_COPY.orderRejected };
  }

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${user.id}/${orderId}.${ext}`;

  try {
    await getProofFiles().upload(path, file, { contentType: file.type });
  } catch {
    return { ok: false, message: 'Could not upload screenshot. Try again.' };
  }

  try {
    await setOrderScreenshot(orderId, path);
  } catch {
    return { ok: false, message: 'Screenshot uploaded. Could not update order status. Try again.' };
  }

  revalidatePath('/founder/shortlists');
  revalidatePath('/admin/payments');
  return { ok: true, message: 'Screenshot submitted. An admin will check it.' };
}

async function requireAdmin(): Promise<{ error: string | null }> {
  const user = await getUser();
  if (!user) return { error: 'Not signed in.' };

  const role = await getProfileRole(user.id);
  if (role !== 'admin') return { error: 'Admins only.' };

  return { error: null };
}

export async function confirmOrder(orderId: string): Promise<OrderResult> {
  const { error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const order = await getOrder(orderId);

  if (!order) return { ok: false, message: 'Order not found.' };
  if (!REVIEWABLE_STATUSES.includes(order.status)) {
    return { ok: false, message: 'This order can no longer be reviewed.' };
  }
  if (!order.screenshot_path) {
    return {
      ok: false,
      message: 'No payment screenshot yet. Ask the founder to upload one.',
    };
  }

  // A signed URL can be minted for a deleted object, so check that the object
  // still exists before confirming payment.
  let proofExists = false;
  try {
    proofExists = await getProofFiles().exists(order.screenshot_path);
  } catch (error) {
    console.error('[shortlist-order] Payment proof lookup failed', error);
  }

  if (!proofExists) {
    return {
      ok: false,
      message: 'Payment proof is unavailable. Ask the founder to upload it again.',
    };
  }

  const proof = await signPaymentProof(order.screenshot_path, 60);
  if (!proof) {
    return {
      ok: false,
      message: 'Payment proof is unavailable. Ask the founder to upload it again.',
    };
  }

  try {
    await setOrderStatus(orderId, 'confirmed', new Date().toISOString());
  } catch {
    return { ok: false, message: 'Could not confirm payment. Try again.' };
  }

  revalidatePath('/admin/payments');
  revalidatePath('/founder/shortlists');
  return {
    ok: true,
    message: ORDER_COPY.paymentConfirmed,
  };
}

export async function rejectOrder(orderId: string): Promise<OrderResult> {
  const { error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const order = await getOrder(orderId);
  if (!order) return { ok: false, message: 'Order not found.' };
  if (!REVIEWABLE_STATUSES.includes(order.status)) {
    return { ok: false, message: 'This order can no longer be reviewed.' };
  }

  try {
    await setOrderStatus(orderId, 'rejected');
  } catch {
    return { ok: false, message: 'Could not reject order. Try again.' };
  }

  revalidatePath('/admin/payments');
  revalidatePath('/founder/shortlists');
  return { ok: true, message: ORDER_COPY.orderReviewRejected };
}
