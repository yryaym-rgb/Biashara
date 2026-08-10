import { describe, it, expect } from 'vitest';
import {
  activityLookbackCutoff,
  assertPublicActivityFeedAnonymized,
  buildPublicActivityFeed,
  kycLookbackCutoff,
  PUBLIC_ACTIVITY_EMPTY_THRESHOLD,
} from '@/lib/activity/public-feed.logic';

describe('buildPublicActivityFeed', () => {
  it('merges and sorts events newest first', () => {
    const result = buildPublicActivityFeed({
      listings: [
        {
          id: 'listing-1',
          mineral: 'cobalt',
          origin_province: 'Lualaba',
          created_at: '2026-08-08T10:00:00.000Z',
        },
      ],
      rfps: [
        {
          id: 'rfp-1',
          mineral: 'copper',
          created_at: '2026-08-09T12:00:00.000Z',
        },
      ],
      orders: [
        {
          id: 'order-1',
          created_at: '2026-08-10T08:00:00.000Z',
          listing: { mineral: 'gold' },
        },
      ],
      verifiedAccounts: [],
    });

    expect(result.events.map((event) => event.kind)).toEqual([
      'order_completed',
      'rfp_posted',
      'listing_published',
    ]);
  });

  it('marks the feed empty when fewer than three events exist', () => {
    const result = buildPublicActivityFeed({
      listings: [
        {
          id: 'listing-1',
          mineral: 'cobalt',
          origin_province: 'Lualaba',
          created_at: '2026-08-10T08:00:00.000Z',
        },
      ],
      rfps: [
        {
          id: 'rfp-1',
          mineral: 'copper',
          created_at: '2026-08-09T12:00:00.000Z',
        },
      ],
      orders: [],
      verifiedAccounts: [],
      emptyThreshold: PUBLIC_ACTIVITY_EMPTY_THRESHOLD,
    });

    expect(result.events).toHaveLength(2);
    expect(result.isEmpty).toBe(true);
  });

  it('includes verified accounts only when province is known', () => {
    const result = buildPublicActivityFeed({
      listings: [],
      rfps: [],
      orders: [],
      verifiedAccounts: [
        {
          id: 'user-1',
          role: 'seller',
          province: 'Lualaba',
          updated_at: '2026-08-10T08:00:00.000Z',
        },
        {
          id: 'user-2',
          role: 'buyer',
          province: null,
          updated_at: '2026-08-10T09:00:00.000Z',
        },
      ],
    });

    expect(result.events).toHaveLength(1);
    expect(result.events[0]?.kind).toBe('account_verified');
    expect(result.events[0]?.role).toBe('seller');
    expect(result.events[0]?.province).toBe('Lualaba');
  });
});

describe('assertPublicActivityFeedAnonymized', () => {
  it('accepts anonymized feed payloads', () => {
    const payload = buildPublicActivityFeed({
      listings: [
        {
          id: 'listing-1',
          mineral: 'cobalt',
          origin_province: 'Lualaba',
          created_at: '2026-08-10T08:00:00.000Z',
        },
        {
          id: 'listing-2',
          mineral: 'copper',
          origin_province: 'Haut-Katanga',
          created_at: '2026-08-09T08:00:00.000Z',
        },
      ],
      rfps: [
        {
          id: 'rfp-1',
          mineral: 'gold',
          created_at: '2026-08-08T08:00:00.000Z',
        },
      ],
      orders: [],
      verifiedAccounts: [],
    });

    expect(() => assertPublicActivityFeedAnonymized(payload)).not.toThrow();
    expect(() => assertPublicActivityFeedAnonymized(payload.events)).not.toThrow();
  });

  it('rejects payloads that leak identifying fields', () => {
    expect(() =>
      assertPublicActivityFeedAnonymized({
        events: [
          {
            id: 'listing-1',
            kind: 'listing_published',
            timestamp: '2026-08-10T08:00:00.000Z',
            mineral: 'cobalt',
            province: 'Lualaba',
            company_name: 'Secret Mining Co',
          },
        ],
        isEmpty: false,
      }),
    ).toThrow(/forbidden field/i);

    expect(() =>
      assertPublicActivityFeedAnonymized({
        events: [
          {
            id: 'listing-1',
            kind: 'listing_published',
            timestamp: '2026-08-10T08:00:00.000Z',
            mineral: 'cobalt',
            province: 'Lualaba',
            quantity: 500,
          },
        ],
        isEmpty: false,
      }),
    ).toThrow(/forbidden field/i);

    expect(() =>
      assertPublicActivityFeedAnonymized({
        events: [
          {
            id: 'listing-1',
            kind: 'listing_published',
            timestamp: '2026-08-10T08:00:00.000Z',
            mineral: 'cobalt',
            province: 'Lualaba',
            price_amount: 42000,
          },
        ],
        isEmpty: false,
      }),
    ).toThrow(/forbidden field/i);
  });
});

describe('activity feed lookback helpers', () => {
  it('computes stable lookback cutoffs', () => {
    const now = new Date('2026-08-10T12:00:00.000Z');

    expect(activityLookbackCutoff(now)).toBe('2026-07-11T12:00:00.000Z');
    expect(kycLookbackCutoff(now)).toBe('2026-08-09T12:00:00.000Z');
  });
});
