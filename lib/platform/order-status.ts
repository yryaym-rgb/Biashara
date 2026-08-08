import type { Database } from '@/types/database.types';

export type OrderStatus = Database['public']['Enums']['order_status'];

export const NORMAL_ORDER_STATUSES = [
  'confirmed',
  'processing',
  'in_transit',
  'delivered',
] as const satisfies readonly OrderStatus[];

export type NormalOrderStatus = (typeof NORMAL_ORDER_STATUSES)[number];

export const TERMINAL_ORDER_STATUSES = ['cancelled', 'disputed'] as const satisfies readonly OrderStatus[];

export function isTerminalOrderStatus(status: OrderStatus): boolean {
  return status === 'cancelled' || status === 'disputed' || status === 'delivered';
}

export function isDisputableOrderStatus(status: OrderStatus): boolean {
  return !isTerminalOrderStatus(status);
}

export function getNextOrderStatus(status: OrderStatus): NormalOrderStatus | null {
  switch (status) {
    case 'confirmed':
      return 'processing';
    case 'processing':
      return 'in_transit';
    case 'in_transit':
      return 'delivered';
    default:
      return null;
  }
}

export function canSellerProgressStatus(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus,
): boolean {
  const expectedNext = getNextOrderStatus(currentStatus);
  return expectedNext !== null && expectedNext === nextStatus;
}

export function getNormalStatusIndex(status: OrderStatus): number {
  if (status === 'cancelled' || status === 'disputed') {
    return -1;
  }
  return NORMAL_ORDER_STATUSES.indexOf(status as NormalOrderStatus);
}

export function formatOrderReference(orderId: string): string {
  return orderId.replace(/-/g, '').slice(0, 8).toUpperCase();
}
