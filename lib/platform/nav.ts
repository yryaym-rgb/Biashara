import type { Database } from '@/types/database.types';
import { isSellerRole } from '@/lib/rbac';

export type PlatformNavKey =
  | 'dashboard'
  | 'marketplace'
  | 'offers'
  | 'listings'
  | 'orders'
  | 'messages'
  | 'documents'
  | 'settings';

export type PlatformNavSectionKey = 'main' | 'supplyChain' | 'company';

export interface PlatformNavItem {
  key: PlatformNavKey;
  href:
    | '/dashboard'
    | '/marketplace'
    | '/offers'
    | '/settings'
    | '/orders'
    | '/messages'
    | '/documents';
}

export interface PlatformNavSection {
  key: PlatformNavSectionKey;
  items: PlatformNavItem[];
}

export function getPlatformNavSections(
  role: Database['public']['Enums']['user_role'],
): PlatformNavSection[] {
  const main: PlatformNavItem[] = [
    { key: 'dashboard', href: '/dashboard' },
    { key: 'marketplace', href: '/marketplace' },
    { key: 'orders', href: '/orders' },
    { key: 'offers', href: '/offers' },
    { key: 'messages', href: '/messages' },
  ];

  const supplyChain: PlatformNavItem[] = [];

  if (isSellerRole(role)) {
    supplyChain.push({ key: 'listings', href: '/settings' });
  }

  supplyChain.push({ key: 'documents', href: '/documents' });

  const company: PlatformNavItem[] = [{ key: 'settings', href: '/settings' }];

  return [
    { key: 'main', items: main },
    { key: 'supplyChain', items: supplyChain },
    { key: 'company', items: company },
  ];
}

/** @deprecated Use getPlatformNavSections */
export function getPlatformNavItems(
  role: Database['public']['Enums']['user_role'],
): PlatformNavItem[] {
  return getPlatformNavSections(role).flatMap((section) => section.items);
}

export type PlatformPageKey =
  | 'dashboard'
  | 'marketplace'
  | 'offers'
  | 'orders'
  | 'messages'
  | 'notifications'
  | 'settings'
  | 'documents'
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
  messages: 'platform.messages.title',
  notifications: 'notifications.title',
  settings: 'platform.settings.title',
  documents: 'platform.documents.title',
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
  if (pathname === '/messages' || pathname.startsWith('/messages/')) {
    return 'messages';
  }
  if (pathname === '/notifications' || pathname.startsWith('/notifications/')) {
    return 'notifications';
  }
  if (pathname === '/documents' || pathname.startsWith('/documents/')) {
    return 'documents';
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
