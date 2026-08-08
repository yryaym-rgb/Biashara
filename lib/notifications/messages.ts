import type { NotificationPayload, NotificationRow } from '@/lib/notifications/types';

export type NotificationMessageKey =
  | 'kycApproved'
  | 'kycRejected'
  | 'listingApproved'
  | 'listingRejected'
  | 'newOffer'
  | 'offerAccepted'
  | 'offerDeclined'
  | 'offerCountered'
  | 'orderStatusChanged'
  | 'orderDisputed';

export interface NotificationContent {
  messageKey: NotificationMessageKey;
  values: Record<string, string>;
  href: string;
}

export function getNotificationContent(
  type: NotificationRow['type'],
  payload: NotificationPayload,
): NotificationContent {
  switch (type) {
    case 'kyc': {
      const kyc = payload as Extract<NotificationPayload, { documentType: string }>;
      return {
        messageKey: kyc.action === 'approved' ? 'kycApproved' : 'kycRejected',
        values: { documentType: kyc.documentType },
        href: '/settings?tab=kyc',
      };
    }
    case 'listing': {
      const listing = payload as Extract<NotificationPayload, { listingId: string; title: string }>;
      return {
        messageKey: listing.action === 'approved' ? 'listingApproved' : 'listingRejected',
        values: { title: listing.title },
        href: '/settings?tab=listings',
      };
    }
    case 'offer': {
      const offer = payload as Extract<NotificationPayload, { offerId: string; listingTitle: string }>;
      const messageKey: NotificationMessageKey =
        offer.action === 'received'
          ? 'newOffer'
          : offer.action === 'accepted'
            ? 'offerAccepted'
            : offer.action === 'declined'
              ? 'offerDeclined'
              : 'offerCountered';
      return {
        messageKey,
        values: { title: offer.listingTitle },
        href: '/offers',
      };
    }
    case 'order': {
      const order = payload as Extract<NotificationPayload, { orderId: string }>;
      if (order.action === 'disputed') {
        return {
          messageKey: 'orderDisputed',
          values: {},
          href: `/orders/${order.orderId}`,
        };
      }
      return {
        messageKey: 'orderStatusChanged',
        values: { status: order.status ?? 'confirmed' },
        href: `/orders/${order.orderId}`,
      };
    }
    default:
      return {
        messageKey: 'orderStatusChanged',
        values: {},
        href: '/dashboard',
      };
  }
}
