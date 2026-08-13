import { describe, it, expect } from 'vitest';
import {
  getCooperativeStatKeys,
  getDashboardKpiHref,
  getDashboardPrimaryQuickActionKeys,
  getDashboardStatKeys,
  getKycBannerTone,
  isBuyerDashboardRole,
  isNewDashboardAccount,
  shouldAlwaysShowDashboardKpis,
  shouldShowOnboardingBanner,
  shouldShowKycBanner,
} from '@/lib/platform/dashboard';
import { getDashboardGreetingName } from '@/lib/platform/dashboard/greeting';
import { isMarketPulsePriceAvailable } from '@/lib/platform/dashboard/market-pulse';

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
  it('returns four cooperative stat keys for cooperative role', () => {
    expect(getCooperativeStatKeys()).toEqual([
      'lots',
      'offers',
      'openPurchaseRequests',
      'ordersInProgress',
    ]);
    expect(getDashboardStatKeys('cooperative')).toEqual([
      'lots',
      'offers',
      'openPurchaseRequests',
      'ordersInProgress',
    ]);
  });

  it('returns four seller stat keys for seller role', () => {
    expect(getDashboardStatKeys('seller')).toEqual([
      'activeListings',
      'pendingOffersReceived',
      'ordersInProgress',
      'monthlyRevenue',
    ]);
  });

  it('returns three buyer stat keys for buyer and institution roles', () => {
    expect(getDashboardStatKeys('buyer')).toEqual([
      'pendingOffersSent',
      'activePurchaseRequests',
      'ordersInProgress',
    ]);
    expect(getDashboardStatKeys('institution')).toEqual([
      'pendingOffersSent',
      'activePurchaseRequests',
      'ordersInProgress',
    ]);
  });

  it('treats institution as a buyer-dashboard role', () => {
    expect(isBuyerDashboardRole('buyer')).toBe(true);
    expect(isBuyerDashboardRole('institution')).toBe(true);
    expect(isBuyerDashboardRole('seller')).toBe(false);
    expect(isBuyerDashboardRole('cooperative')).toBe(false);
  });

  it('returns role-appropriate KPI deep links', () => {
    expect(getDashboardKpiHref('buyer', 'activePurchaseRequests')).toBe('/rfps');
    expect(getDashboardKpiHref('institution', 'pendingOffersSent')).toBe('/offers');
    expect(getDashboardKpiHref('seller', 'activeListings')).toBe('/settings?tab=listings');
    expect(getDashboardKpiHref('seller', 'monthlyRevenue')).toBe('/orders');
    expect(getDashboardKpiHref('cooperative', 'lots')).toBe('/lots');
    expect(getDashboardKpiHref('cooperative', 'monthlyRevenue')).toBeUndefined();
  });

  it('returns role-appropriate primary quick action keys', () => {
    expect(getDashboardPrimaryQuickActionKeys('buyer')).toEqual(['explore', 'publish-rfp']);
    expect(getDashboardPrimaryQuickActionKeys('institution')).toEqual(['explore', 'publish-rfp']);
    expect(getDashboardPrimaryQuickActionKeys('seller')).toEqual(['publish-listing', 'explore']);
    expect(getDashboardPrimaryQuickActionKeys('cooperative')).toEqual(['publish-lot', 'explore']);
  });

  it('keeps seller and cooperative dashboards distinct from buyer KPI sets', () => {
    const sellerKeys = getDashboardStatKeys('seller');
    const buyerKeys = getDashboardStatKeys('buyer');
    const cooperativeKeys = getDashboardStatKeys('cooperative');

    expect(sellerKeys).not.toContain('lots');
    expect(sellerKeys).not.toContain('activePurchaseRequests');
    expect(buyerKeys).not.toContain('activeListings');
    expect(buyerKeys).not.toContain('monthlyRevenue');
    expect(cooperativeKeys).toContain('lots');
    expect(cooperativeKeys).not.toContain('monthlyRevenue');
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
    expect(
      shouldShowOnboardingBanner({
        listings: 0,
        offers: 0,
        orders: 0,
        conversations: 0,
      }),
    ).toBe(true);
  });

  it('treats any real activity as an established account for onboarding banner', () => {
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

describe('dashboard always-show KPIs behavior', () => {
  it('always renders KPI cards regardless of account age', () => {
    expect(shouldAlwaysShowDashboardKpis()).toBe(true);
  });

  it('does not use new-account detection to hide KPIs', () => {
    const newAccount = {
      listings: 0,
      offers: 0,
      orders: 0,
      conversations: 0,
    };
    expect(isNewDashboardAccount(newAccount)).toBe(true);
    expect(shouldAlwaysShowDashboardKpis()).toBe(true);
  });
});

describe('dashboard greeting name', () => {
  it('prefers company name when set', () => {
    expect(getDashboardGreetingName('Coop Minière du Katanga', 'user@example.com', 'Inconnu')).toBe(
      'Coop Minière du Katanga',
    );
  });

  it('falls back to email local-part when company name is empty', () => {
    expect(getDashboardGreetingName(null, 'cooperative@biashara.cd', 'Inconnu')).toBe('cooperative');
    expect(getDashboardGreetingName('  ', 'cooperative@biashara.cd', 'Inconnu')).toBe('cooperative');
  });
});

describe('dashboard market pulse helpers', () => {
  it('treats null and undefined prices as unavailable', () => {
    expect(isMarketPulsePriceAvailable(null)).toBe(false);
    expect(isMarketPulsePriceAvailable(undefined)).toBe(false);
    expect(isMarketPulsePriceAvailable(42.5)).toBe(true);
  });
});
