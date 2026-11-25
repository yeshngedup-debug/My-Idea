/**
 * Zod schemas for shortlist-order inputs.
 *
 * The amount rule already lives in the shared validators and is used by
 * `createShortlistOrder`; re-export it instead of duplicating it. The file
 * schema mirrors the screenshot checks the upload action performs.
 */
import { z } from 'zod';
import { PACKAGES, type PackageId } from '@/config/payment';

export { shortlistOrderSchema } from '@/lib/validators';

export const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;
export const ALLOWED_SCREENSHOT_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
] as const;

export const packageIdSchema = z.enum(
  Object.keys(PACKAGES) as [PackageId, ...PackageId[]]
);

/** Status values allowed by the `shortlist_orders` table and the actions. */
export const orderStatusSchema = z.enum([
  'pending',
  'submitted',
  'confirmed',
  'rejected',
]);

/** Admin confirm/reject may only act on orders still awaiting review. */
export const reviewableOrderStatusSchema = z.enum(['pending', 'submitted']);

export const paymentScreenshotSchema = z
  .object({
    screenshot: z.custom<File>(
      (value) => typeof File !== 'undefined' && value instanceof File && value.size > 0,
      'Choose a screenshot first.'
    ),
  })
  .superRefine((value, ctx) => {
    const file = value.screenshot;
    if (typeof File === 'undefined' || !(file instanceof File)) return; // base check already reported
    if (
      !ALLOWED_SCREENSHOT_TYPES.includes(
        file.type as (typeof ALLOWED_SCREENSHOT_TYPES)[number]
      )
    ) {
      ctx.addIssue({ code: 'custom', message: 'Use a PNG, JPG, or WEBP image.' });
    }
    if (file.size > MAX_SCREENSHOT_BYTES) {
      ctx.addIssue({ code: 'custom', message: 'Image must be 5 MB or smaller.' });
    }
  });

export type PaymentScreenshotType = (typeof ALLOWED_SCREENSHOT_TYPES)[number];
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type ReviewableOrderStatus = z.infer<typeof reviewableOrderStatusSchema>;
