import { describe, it, expect } from 'vitest';
import {
  buildActionCenterItems,
  summarizeActionCenterItems,
  hasActionCenterAlerts,
} from '@/lib/platform/action-center.logic';

const USER_A = '00000000-0000-0000-0000-000000000001';
const USER_B = '00000000-0000-0000-0000-000000000002';

describe('buildActionCenterItems', () => {
  it('returns an empty list when nothing needs attention', () => {
    expect(
      buildActionCenterItems({
        pendingOffers: [],
        disputedOrders: [],
        rejectedKycDocuments: [],
        rejectedListings: [],
      }),
    ).toEqual([]);
  });

  it('prioritizes disputed orders above pending offers', () => {
    const items = buildActionCenterItems({
      pendingOffers: [
        {
          offerId: 'offer-1',
          listingTitle: 'Cobalt lot',
          counterpartName: 'Buyer Co',
        },
      ],
      disputedOrders: [
        {
          orderId: 'order-1',
          listingTitle: 'Copper shipment',
          counterpartName: 'Seller Co',
        },
      ],
      rejectedKycDocuments: [],
      rejectedListings: [],
    });

    expect(items).toHaveLength(2);
    expect(items[0]?.type).toBe('disputed_order');
    expect(items[0]?.href).toBe('/orders/order-1');
    expect(items[1]?.type).toBe('pending_offer');
    expect(items[1]?.href).toBe('/offers?tab=received');
  });

  it('includes rejected KYC documents and listings', () => {
    const items = buildActionCenterItems({
      pendingOffers: [],
      disputedOrders: [],
      rejectedKycDocuments: ['id_card', 'mining_permit'],
      rejectedListings: [{ listingId: 'listing-1', title: 'Gold ore batch' }],
    });

    expect(items).toHaveLength(3);
    expect(items.map((item) => item.type)).toEqual([
      'rejected_kyc',
      'rejected_kyc',
      'rejected_listing',
    ]);
    expect(items[0]?.href).toBe('/settings?tab=kyc');
    expect(items[2]?.href).toBe('/settings');
  });

  it('scopes action item links to the user own entities', () => {
    const items = buildActionCenterItems({
      pendingOffers: [],
      disputedOrders: [
        {
          orderId: USER_A,
          listingTitle: 'My order',
          counterpartName: 'Other party',
        },
      ],
      rejectedKycDocuments: [],
      rejectedListings: [{ listingId: USER_A, title: 'My listing' }],
    });

    expect(items.every((item) => !item.href.includes(USER_B))).toBe(true);
    expect(items[0]?.href).toBe(`/orders/${USER_A}`);
    expect(items[1]?.href).toBe('/settings');
  });
});

describe('summarizeActionCenterItems', () => {
  it('aggregates item counts by type', () => {
    const items = buildActionCenterItems({
      pendingOffers: [
        { offerId: 'o1', listingTitle: 'A', counterpartName: 'B' },
        { offerId: 'o2', listingTitle: 'C', counterpartName: 'D' },
      ],
      disputedOrders: [{ orderId: 'ord-1', listingTitle: 'E', counterpartName: 'F' }],
      rejectedKycDocuments: ['id_card'],
      rejectedListings: [],
    });

    expect(summarizeActionCenterItems(items)).toEqual({
      pendingOffersCount: 2,
      disputedOrdersCount: 1,
      rejectedKycCount: 1,
      rejectedListingsCount: 0,
    });
    expect(hasActionCenterAlerts(summarizeActionCenterItems(items))).toBe(true);
  });

  it('reports no alerts when summary counts are zero', () => {
    const summary = summarizeActionCenterItems([]);
    expect(summary).toEqual({
      pendingOffersCount: 0,
      disputedOrdersCount: 0,
      rejectedKycCount: 0,
      rejectedListingsCount: 0,
    });
    expect(hasActionCenterAlerts(summary)).toBe(false);
  });
});
