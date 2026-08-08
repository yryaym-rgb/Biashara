import type { Database } from '@/types/database.types';
import { isSellerRole } from '@/lib/rbac';

export type PlatformNavKey =
  | 'dashboard'
  | 'marketplace'
  | 'offers'
  | 'listings'
  | 'orders'
  | 'settings';

export interface PlatformNavItem {
  key: PlatformNavKey;
  href: '/dashboard' | '/marketplace' | '/offers' | '/settings' | '/orders';
}

export function getPlatformNavItems(
  role: Database['public']['Enums']['user_role'],
): PlatformNavItem[] {
  const items: PlatformNavItem[] = [
    { key: 'dashboard', href: '/dashboard' },
    { key: 'marketplace', href: '/marketplace' },
    { key: 'offers', href: '/offers' },
  ];

  if (isSellerRole(role)) {
    items.push({ key: 'listings', href: '/settings' });
  }

  items.push({ key: 'orders', href: '/orders' });
  items.push({ key: 'settings', href: '/settings' });

  return items;
}

export type PlatformPageKey =
  | 'dashboard'
  | 'marketplace'
  | 'offers'
  | 'orders'
  | 'settings'
  | 'contracts'
  | 'payments'
  | 'logistics'
  | 'reports'
  | 'marketplaceNew'
  | 'marketplaceDetail';

const PAGE_TITLE_KEYS: Record<PlatformPageKey, string> = {
  dashboard: 'platform.dashboard.title',
  marketplace: 'platform.marketplace.title',
  offers: 'platform.offers.title',
  orders: 'platform.orders.title',
  settings: 'platform.settings.title',
  contracts: 'platform.contracts.title',
  payments: 'platform.payments.title',
  logistics: 'platform.logistics.title',
  reports: 'platform.reports.title',
  marketplaceNew: 'platform.marketplace.new.title',
  marketplaceDetail: 'platform.marketplace.title',
};

export function resolvePlatformPageKey(pathname: string): PlatformPageKey {
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    return 'dashboard';
  }
  if (pathname === '/marketplace/new') {
    return 'marketplaceNew';
  }
  if (pathname.startsWith('/marketplace/')) {
    return 'marketplaceDetail';
  }
  if (pathname === '/marketplace' || pathname.startsWith('/marketplace')) {
    return 'marketplace';
  }
  if (pathname === '/offers' || pathname.startsWith('/offers/')) {
    return 'offers';
  }
  if (pathname === '/orders' || pathname.startsWith('/orders/')) {
    return 'orders';
  }
  if (pathname === '/settings' || pathname.startsWith('/settings/')) {
    return 'settings';
  }
  if (pathname === '/contracts' || pathname.startsWith('/contracts/')) {
    return 'contracts';
  }
  if (pathname === '/payments' || pathname.startsWith('/payments/')) {
    return 'payments';
  }
  if (pathname === '/logistics' || pathname.startsWith('/logistics/')) {
    return 'logistics';
  }
  if (pathname === '/reports' || pathname.startsWith('/reports/')) {
    return 'reports';
  }
  return 'dashboard';
}

export function getPlatformPageTitleKey(pathname: string): string {
  return PAGE_TITLE_KEYS[resolvePlatformPageKey(pathname)];
}
