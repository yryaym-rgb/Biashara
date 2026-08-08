import type { Database } from '@/types/database.types';

export type ShipmentStatus = Database['public']['Enums']['shipment_status'];

export const NORMAL_SHIPMENT_STATUSES = [
  'pending',
  'picked_up',
  'in_transit',
  'customs',
  'delivered',
] as const satisfies readonly ShipmentStatus[];

export type NormalShipmentStatus = (typeof NORMAL_SHIPMENT_STATUSES)[number];

export function getNextShipmentStatus(status: ShipmentStatus): NormalShipmentStatus | null {
  switch (status) {
    case 'pending':
      return 'picked_up';
    case 'picked_up':
      return 'in_transit';
    case 'in_transit':
      return 'customs';
    case 'customs':
      return 'delivered';
    default:
      return null;
  }
}

export function canSellerProgressShipmentStatus(
  currentStatus: ShipmentStatus,
  nextStatus: ShipmentStatus,
): boolean {
  if (nextStatus === 'exception') {
    return currentStatus !== 'exception';
  }

  if (currentStatus === 'exception' || currentStatus === 'delivered') {
    return false;
  }

  const expectedNext = getNextShipmentStatus(currentStatus);
  return expectedNext !== null && expectedNext === nextStatus;
}

export function getShipmentProgressOptions(
  currentStatus: ShipmentStatus,
): ShipmentStatus[] {
  const options: ShipmentStatus[] = [];

  const nextNormal = getNextShipmentStatus(currentStatus);
  if (nextNormal) {
    options.push(nextNormal);
  }

  if (currentStatus !== 'exception' && currentStatus !== 'delivered') {
    options.push('exception');
  }

  return options;
}
