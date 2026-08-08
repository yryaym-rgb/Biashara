import type { Database } from '@/types/database.types';
import type { StatusChipVariant } from '@/components/ui/badge';

type KycStatus = Database['public']['Enums']['kyc_status'];
type UserRole = Database['public']['Enums']['user_role'];
type ListingStatus = Database['public']['Enums']['listing_status'];
type OfferStatus = Database['public']['Enums']['offer_status'];
type OrderStatus = Database['public']['Enums']['order_status'];

export function kycStatusVariant(status: KycStatus): StatusChipVariant {
  switch (status) {
    case 'approved':
      return 'success';
    case 'rejected':
      return 'danger';
    case 'pending':
      return 'warning';
    default:
      return 'neutral';
  }
}

export function roleVariant(role: UserRole): StatusChipVariant {
  switch (role) {
    case 'admin':
      return 'info';
    case 'seller':
    case 'cooperative':
      return 'success';
    case 'institution':
      return 'warning';
    default:
      return 'neutral';
  }
}

export function listingStatusVariant(status: ListingStatus): StatusChipVariant {
  switch (status) {
    case 'active':
      return 'success';
    case 'rejected':
      return 'danger';
    case 'pending_review':
      return 'warning';
    case 'sold':
      return 'info';
    default:
      return 'neutral';
  }
}

export function offerStatusVariant(status: OfferStatus): StatusChipVariant {
  switch (status) {
    case 'accepted':
      return 'success';
    case 'declined':
    case 'expired':
      return 'danger';
    case 'pending':
      return 'warning';
    case 'countered':
      return 'info';
    default:
      return 'neutral';
  }
}

export function orderStatusVariant(status: OrderStatus): StatusChipVariant {
  switch (status) {
    case 'delivered':
      return 'success';
    case 'in_transit':
      return 'warning';
    case 'disputed':
      return 'danger';
    case 'cancelled':
      return 'neutral';
    case 'confirmed':
    case 'processing':
      return 'info';
    default:
      return 'neutral';
  }
}

export function displayName(companyName: string | null, fallback: string): string {
  return companyName?.trim() || fallback;
}
