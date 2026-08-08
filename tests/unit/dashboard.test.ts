import { describe, it, expect } from 'vitest';
import {
  getDashboardPersona,
  getDashboardStatKeys,
  getKycBannerTone,
  isNewDashboardAccount,
  shouldShowKycBanner,
} from '@/lib/platform/dashboard';

describe('dashboard KYC banner visibility', () => {
  it('hides the banner when KYC is approved', () => {
    expect(shouldShowKycBanner('approved')).toBe(false);
  });

  it('shows the banner for pending, rejected, and none statuses', () => {
    expect(shouldShowKycBanner('pending')).toBe(true);
    expect(shouldShowKycBanner('rejected')).toBe(true);
    expect(shouldShowKycBanner('none')).toBe(true);
  });

  it('maps KYC statuses to banner tones', () => {
    expect(getKycBannerTone('pending')).toBe('info');
    expect(getKycBannerTone('rejected')).toBe('warning');
    expect(getKycBannerTone('none')).toBe('neutral');
    expect(getKycBannerTone('approved')).toBe('neutral');
  });
});

describe('dashboard role-based stat cards', () => {
  it('returns four seller stat keys for seller and cooperative roles', () => {
    expect(getDashboardStatKeys('seller')).toEqual([
      'activeListings',
      'pendingOffersReceived',
      'ordersInProgress',
      'monthlyRevenue',
    ]);
    expect(getDashboardStatKeys('cooperative')).toEqual([
      'activeListings',
      'pendingOffersReceived',
      'ordersInProgress',
      'monthlyRevenue',
    ]);
    expect(getDashboardPersona('seller')).toBe('seller');
    expect(getDashboardPersona('cooperative')).toBe('seller');
  });

  it('returns three buyer stat keys for buyer and institution roles', () => {
    expect(getDashboardStatKeys('buyer')).toEqual([
      'pendingOffersSent',
      'ordersInProgress',
      'recentlyViewedListings',
    ]);
    expect(getDashboardStatKeys('institution')).toEqual([
      'pendingOffersSent',
      'ordersInProgress',
      'recentlyViewedListings',
    ]);
    expect(getDashboardPersona('buyer')).toBe('buyer');
    expect(getDashboardPersona('institution')).toBe('buyer');
  });
});

describe('dashboard new account detection', () => {
  it('detects brand-new accounts with no platform activity', () => {
    expect(
      isNewDashboardAccount({
        listings: 0,
        offers: 0,
        orders: 0,
        conversations: 0,
      }),
    ).toBe(true);
  });

  it('treats any real activity as an established account', () => {
    expect(
      isNewDashboardAccount({
        listings: 0,
        offers: 1,
        orders: 0,
        conversations: 0,
      }),
    ).toBe(false);
    expect(
      isNewDashboardAccount({
        listings: 0,
        offers: 0,
        orders: 0,
        conversations: 1,
      }),
    ).toBe(false);
  });
});
