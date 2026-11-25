/**
 * Public types for the payments feature, derived from the order actions and
 * the Neon / Realtime order row shapes.
 */
import type { PackageId } from '@/config/payment';
import type { OrderRow, Role } from '@/lib/neon-data';
import type { LiveOrderRow } from '@/lib/neon-realtime';
import type { OrderResult } from './actions';
import type { OrderStatus } from './schemas';

export type { OrderResult, OrderRow, LiveOrderRow, PackageId, OrderStatus, Role };

export type OrderId = OrderRow['id'];
export type FounderId = OrderRow['founder_id'];

export type CreateShortlistOrderInput = {
  packageId: PackageId;
  projectId: string | null;
  amount: number | null;
};

/** Result of a successful order creation, including the new row id. */
export type CreatedOrderResult = OrderResult & { orderId?: string };
