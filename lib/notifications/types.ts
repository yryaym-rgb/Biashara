import type { Database } from '@/types/database.types';

export type NotificationType = Database['public']['Enums']['notification_type'];

export type KycNotificationPayload = {
  action: 'approved' | 'rejected';
  documentType: Database['public']['Enums']['kyc_document_type'];
  reason?: string;
};

export type ListingNotificationPayload = {
  action: 'approved' | 'rejected';
  listingId: string;
  title: string;
  reason?: string;
};

export type OfferNotificationPayload = {
  action: 'received' | 'accepted' | 'declined' | 'countered';
  offerId: string;
  listingTitle: string;
};

export type OrderNotificationPayload = {
  action: 'status_changed' | 'disputed';
  orderId: string;
  status?: Database['public']['Enums']['order_status'];
  reason?: string;
};

export type RfpNotificationPayload = {
  action: 'bid_received' | 'bid_selected' | 'bid_rejected';
  rfpId: string;
  mineral: Database['public']['Enums']['mineral_type'];
  bidId: string;
};

export type SystemNotificationPayload = {
  action: 'pending_kyc' | 'pending_listing';
  href: string;
  documentType?: string;
  applicantName?: string;
  listingId?: string;
  listingTitle?: string;
};

export type NotificationPayload =
  | KycNotificationPayload
  | ListingNotificationPayload
  | OfferNotificationPayload
  | OrderNotificationPayload
  | RfpNotificationPayload
  | SystemNotificationPayload;

export type NotificationRow = Database['public']['Tables']['notifications']['Row'];
