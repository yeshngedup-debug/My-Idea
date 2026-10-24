'use server';

/**
 * Premium Shortlist order actions — manual payment flow.
 * Founder creates order + uploads screenshot; admin confirms/rejects.
 */
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { PACKAGES, type PackageId } from '@/config/payment';

export interface OrderResult {
  ok: boolean;
  message: string;
}

const ALLOWED_IMAGE = ['image/png', 'image/jpeg', 'image/webp'];

export async function createShortlistOrder(
  packageId: string,
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

  if (!(packageId in PACKAGES)) {
    return { ok: false, message: 'Choose a package.' };
  }

  const pkg = PACKAGES[packageId as PackageId];
  const cleanAmount =
    amount != null && Number.isFinite(amount) && amount > 0 ? amount : pkg.defaultAmount;

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

  if (error) return { ok: false, message: `Order failed: ${error.message}` };

  revalidatePath('/founder/shortlists');
  revalidatePath('/admin/payments');
  return { ok: true, message: 'Order created.', orderId: data.id };
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
    return { ok: false, message: 'Only PNG, JPG, or WEBP images are allowed.' };
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

  if (uploadError) return { ok: false, message: `Upload failed: ${uploadError.message}` };

  const { error: dbError } = await supabase
    .from('shortlist_orders')
    .update({ screenshot_path: path, status: 'submitted' })
    .eq('id', orderId);

  if (dbError) return { ok: false, message: `Upload saved but status failed: ${dbError.message}` };

  revalidatePath('/founder/shortlists');
  revalidatePath('/admin/payments');
  return { ok: true, message: 'Screenshot submitted. Admin will verify shortly.' };
}

async function requireAdmin() {
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

  const { error: dbError } = await supabase
    .from('shortlist_orders')
    .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
    .eq('id', orderId);

  if (dbError) return { ok: false, message: `Failed: ${dbError.message}` };

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

  if (dbError) return { ok: false, message: `Failed: ${dbError.message}` };

  revalidatePath('/admin/payments');
  revalidatePath('/founder/shortlists');
  return { ok: true, message: 'Order rejected.' };
}
