/**
 * Typed order reads. Thin wrappers over the existing Neon helpers and the
 * Realtime sealing helper — no SQL and no new database client here.
 * All mutation authorization stays in ./actions.ts.
 */
import {
  getOrder,
  getProfileRole,
  listConfirmedOrderProjectIds,
  listFounderOrders,
  listOrders,
} from '@/lib/neon-data';
import { sealFounderOrders } from '@/lib/neon-realtime';
import type { SealedLiveQuery } from '@neon/realtime/client';
import type { LiveOrderRow, OrderRow, Role } from './types';

export async function loadUserRole(userId: string): Promise<Role | null> {
  return getProfileRole(userId);
}

export async function loadOrder(id: string): Promise<OrderRow | null> {
  return getOrder(id);
}

export async function loadAllOrders(): Promise<OrderRow[]> {
  return listOrders();
}

export async function loadFounderOrders(founderId: string): Promise<OrderRow[]> {
  return listFounderOrders(founderId);
}

export async function loadConfirmedOrderProjectIds(
  founderId: string
): Promise<{ projectId: string | null }[]> {
  return listConfirmedOrderProjectIds(founderId);
}

/** Seal a founder-scoped live query for the Realtime client. */
export async function sealOrdersForFounder(
  founderId: string
): Promise<SealedLiveQuery<LiveOrderRow>> {
  return sealFounderOrders(founderId);
}
