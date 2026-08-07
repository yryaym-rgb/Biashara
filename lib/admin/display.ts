import type { Database } from '@/types/database.types';
import type { StatusChipVariant } from '@/components/ui/badge';

type KycStatus = Database['public']['Enums']['kyc_status'];
type UserRole = Database['public']['Enums']['user_role'];
type ListingStatus = Database['public']['Enums']['listing_status'];

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

export function displayName(companyName: string | null, fallback: string): string {
  return companyName?.trim() || fallback;
}
