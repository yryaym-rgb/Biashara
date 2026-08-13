/** Route definitions for platform-wide responsive audit. */

export interface StaticRoute {
  path: string;
  label: string;
  /** Guest-accessible without authentication */
  guest?: boolean;
  /** Only test for specific roles (omit = all authenticated roles) */
  roles?: string[];
  /** Skip on mobile if page requires desktop layout */
  skipMobile?: boolean;
}

export interface DynamicRoute {
  label: string;
  listPath: string;
  linkPattern: RegExp;
  roles?: string[];
  guest?: boolean;
}

export const MARKETING_ROUTES: StaticRoute[] = [
  { path: '/', label: 'home', guest: true },
  { path: '/prices', label: 'prices', guest: true },
  { path: '/solutions', label: 'solutions', guest: true },
  { path: '/resources', label: 'resources', guest: true },
  { path: '/about', label: 'about', guest: true },
  { path: '/calendar', label: 'calendar', guest: true },
];

export const AUTH_ROUTES: StaticRoute[] = [
  { path: '/login', label: 'login', guest: true },
  { path: '/register', label: 'register-step-1', guest: true },
  { path: '/register?step=2', label: 'register-step-2', guest: true },
  { path: '/register?step=3', label: 'register-step-3', guest: true },
  { path: '/forgot-password', label: 'forgot-password', guest: true },
];

export const PLATFORM_STATIC_ROUTES: StaticRoute[] = [
  { path: '/dashboard', label: 'dashboard' },
  { path: '/marketplace', label: 'marketplace', guest: true },
  { path: '/marketplace/new', label: 'marketplace-new', roles: ['seller', 'cooperative-approved'] },
  { path: '/offers', label: 'offers' },
  { path: '/orders', label: 'orders' },
  { path: '/messages', label: 'messages' },
  { path: '/settings', label: 'settings-profile' },
  { path: '/settings?tab=security', label: 'settings-security' },
  { path: '/settings?tab=kyc', label: 'settings-kyc' },
  { path: '/settings?tab=listings', label: 'settings-listings', roles: ['seller', 'cooperative-approved'] },
  { path: '/lots', label: 'lots', roles: ['cooperative-approved', 'cooperative-pending'] },
  { path: '/lots/new', label: 'lots-new', roles: ['cooperative-approved'] },
  { path: '/rfps', label: 'rfps' },
  { path: '/rfps/new', label: 'rfps-new', roles: ['buyer'] },
  { path: '/directory', label: 'directory' },
  { path: '/documents', label: 'documents' },
  { path: '/notifications', label: 'notifications' },
];

export const PLATFORM_DYNAMIC_ROUTES: DynamicRoute[] = [
  {
    label: 'marketplace-detail',
    listPath: '/marketplace',
    linkPattern: /\/marketplace\/[0-9a-f-]{36}/i,
    guest: true,
  },
  {
    label: 'order-detail',
    listPath: '/orders',
    linkPattern: /\/orders\/[0-9a-f-]{36}/i,
  },
  {
    label: 'lot-detail',
    listPath: '/lots',
    linkPattern: /\/lots\/[0-9a-f-]{36}/i,
    roles: ['cooperative-approved', 'cooperative-pending'],
  },
  {
    label: 'rfp-detail',
    listPath: '/rfps',
    linkPattern: /\/rfps\/[0-9a-f-]{36}/i,
  },
  {
    label: 'directory-profile',
    listPath: '/directory',
    linkPattern: /\/directory\/[0-9a-f-]{36}/i,
  },
];

export const ADMIN_STATIC_ROUTES: StaticRoute[] = [
  { path: '', label: 'admin-dashboard', roles: ['admin'] },
  { path: '/users', label: 'admin-users', roles: ['admin'] },
  { path: '/kyc-review', label: 'admin-kyc-review', roles: ['admin'] },
  { path: '/listings-moderation', label: 'admin-listings-moderation', roles: ['admin'] },
  { path: '/mining-events', label: 'admin-calendar', roles: ['admin'] },
  { path: '/reports', label: 'admin-reports', roles: ['admin'] },
  { path: '/audit-log', label: 'admin-audit-log', roles: ['admin'] },
];

export const PLATFORM_ROLES = [
  'buyer',
  'seller',
  'cooperative-approved',
  'cooperative-pending',
] as const;

export type PlatformAuditRole = typeof PLATFORM_ROLES[number] | 'guest' | 'admin';

export function routeAppliesToRole(route: StaticRoute | DynamicRoute, role: PlatformAuditRole): boolean {
  if (role === 'guest') return route.guest === true;
  if (role === 'admin') return route.roles?.includes('admin') ?? false;
  if (!route.roles) return true;
  return route.roles.includes(role);
}
