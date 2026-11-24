'use server';

/**
 * Premium Shortlist order actions — manual payment flow.
 * Founder creates order + uploads screenshot; admin confirms/rejects.
 */
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { PACKAGES, type PackageId } from '@/config/payment';
import { shortlistOrderSchema } from '@/lib/validators';
import { rateLimit } from '@/lib/rate-limit';

export interface OrderResult {
  ok: boolean;
  message: string;
}

const ALLOWED_IMAGE = ['image/png', 'image/jpeg', 'image/webp'];

export async function createShortlistOrder(
  packageId: PackageId,
  projectId: string | null,
  amount: number | null
): Promise<OrderResult & { orderId?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: 'Not signed in.' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'founder') {
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

  const { data, error } = await supabase
    .from('shortlist_orders')
    .insert({
      founder_id: user.id,
      project_id: projectId || null,
      package: packageId,
      amount: cleanAmount,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error) return { ok: false, message: 'Could not create order. Try again.' };

  revalidatePath('/founder/shortlists');
  revalidatePath('/admin/payments');
  return { ok: true, message: 'Order created. Upload your payment screenshot.', orderId: data.id };
}

export async function uploadPaymentScreenshot(
  orderId: string,
  formData: FormData
): Promise<OrderResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
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
  const { data: order } = await supabase
    .from('shortlist_orders')
    .select('id, founder_id, status')
    .eq('id', orderId)
    .single();

  if (!order || order.founder_id !== user.id) {
    return { ok: false, message: 'Order not found.' };
  }
  if (order.status === 'confirmed') {
    return { ok: false, message: 'This order is already confirmed.' };
  }

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${user.id}/${orderId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('payment-screenshots')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) return { ok: false, message: 'Could not upload screenshot. Try again.' };

  const { error: dbError } = await supabase
    .from('shortlist_orders')
    .update({ screenshot_path: path, status: 'submitted' })
    .eq('id', orderId);

  if (dbError) return { ok: false, message: 'Screenshot uploaded. Could not update order status. Try again.' };

  revalidatePath('/founder/shortlists');
  revalidatePath('/admin/payments');
  return { ok: true, message: 'Screenshot submitted. An admin will check it.' };
}

async function requireAdmin(): Promise<{ supabase: Awaited<ReturnType<typeof createClient>>; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, error: 'Not signed in.' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') return { supabase, error: 'Admins only.' };

  return { supabase, error: null };
}

export async function confirmOrder(orderId: string): Promise<OrderResult> {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  // Never confirm a payment without proof
  const { data: order } = await supabase
    .from('shortlist_orders')
    .select('screenshot_path')
    .eq('id', orderId)
    .single();

  if (!order) return { ok: false, message: 'Order not found.' };
  if (!order.screenshot_path) {
    return {
      ok: false,
      message: 'No payment screenshot yet. Ask the founder to upload one.',
    };
  }

  const { error: dbError } = await supabase
    .from('shortlist_orders')
    .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
    .eq('id', orderId);

  if (dbError) return { ok: false, message: 'Could not confirm payment. Try again.' };

  revalidatePath('/admin/payments');
  revalidatePath('/founder/shortlists');
  return { ok: true, message: 'Payment confirmed. Shortlist unlocked.' };
}

export async function rejectOrder(orderId: string): Promise<OrderResult> {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false, message: error };

  const { error: dbError } = await supabase
    .from('shortlist_orders')
    .update({ status: 'rejected' })
    .eq('id', orderId);

  if (dbError) return { ok: false, message: 'Could not reject order. Try again.' };

  revalidatePath('/admin/payments');
  revalidatePath('/founder/shortlists');
  return { ok: true, message: 'Order rejected.' };
}
