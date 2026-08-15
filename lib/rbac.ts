import { stripLocalePrefix } from '@/lib/i18n/pathname';
import type { Profile } from '@/lib/auth/session';
import type { UserRole } from '@/lib/validators/profile';
import type { Database } from '@/types/database.types';

type KycStatus = Database['public']['Enums']['kyc_status'];

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class KycRequiredError extends Error {
  constructor(message = 'KYC approval required') {
    super(message);
    this.name = 'KycRequiredError';
  }
}

export function requireAuth(profile: Profile | null): Profile {
  if (!profile) {
    throw new UnauthorizedError();
  }
  return profile;
}

export function requireRole(profile: Profile | null, roles: UserRole[]): Profile {
  const authed = requireAuth(profile);
  if (!roles.includes(authed.role as UserRole)) {
    throw new ForbiddenError();
  }
  return authed;
}

export function requireKycApproved(profile: Profile | null): Profile {
  const authed = requireAuth(profile);
  if (authed.kyc_status !== 'approved') {
    throw new KycRequiredError();
  }
  return authed;
}

export function isSellerRole(role: string): boolean {
  return role === 'seller' || role === 'cooperative';
}

export function isCooperativeRole(role: string): boolean {
  return role === 'cooperative';
}

type RouteGroup = 'marketing' | 'auth' | 'platform' | 'admin';

const PLATFORM_PREFIXES = [
  '/dashboard',
  '/marketplace',
  '/rfps',
  '/directory',
  '/offers',
  '/orders',
  '/messages',
  '/documents',
  '/contracts',
  '/payments',
  '/logistics',
  '/reports',
  '/settings',
  '/lots',
];

const AUTH_PREFIXES = ['/login', '/register', '/forgot-password', '/verify'];

/** Edge-safe constant-time string compare for middleware routing hints. */
function secureCompareStrings(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  let mismatch = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    const ca = i < a.length ? a.charCodeAt(i) : 0;
    const cb = i < b.length ? b.charCodeAt(i) : 0;
    mismatch |= ca ^ cb;
  }
  return mismatch === 0;
}

export function stripLocale(pathname: string): string {
  return stripLocalePrefix(pathname);
}

/** True when the first path segment matches ADMIN_GATE_SECRET (timing-safe). */
export function isAdminGatePath(pathname: string): boolean {
  const secret = process.env.ADMIN_GATE_SECRET;
  if (!secret) {
    return false;
  }
  const path = stripLocale(pathname);
  const firstSegment = path.split('/').filter(Boolean)[0];
  if (!firstSegment) {
    return false;
  }
  return secureCompareStrings(firstSegment, secret);
}

export function classifyRoute(pathname: string): RouteGroup {
  if (isAdminGatePath(pathname)) {
    return 'admin';
  }
  const path = stripLocale(pathname);

  if (PLATFORM_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) {
    return 'platform';
  }
  if (AUTH_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) {
    return 'auth';
  }
  return 'marketing';
}

export interface RouteAccessResult {
  allowed: boolean;
  redirectTo?: string;
  reason?: 'unauthenticated' | 'forbidden' | 'kyc_required';
}

/** Marketplace list and detail are public; creation requires authentication. */
export function isPublicMarketplaceRoute(pathname: string): boolean {
  const path = stripLocale(pathname);
  if (path === '/marketplace') {
    return true;
  }
  const detailMatch = /^\/marketplace\/([^/]+)$/.exec(path);
  if (!detailMatch) {
    return false;
  }
  const segment = detailMatch[1];
  if (!segment) {
    return false;
  }
  return segment !== 'new' && !segment.endsWith('edit');
}

/** RFP list and detail are public; creation requires authentication. */
export function isPublicRfpRoute(pathname: string): boolean {
  const path = stripLocale(pathname);
  if (path === '/rfps') {
    return true;
  }
  const detailMatch = /^\/rfps\/([^/]+)$/.exec(path);
  if (!detailMatch) {
    return false;
  }
  const segment = detailMatch[1];
  if (!segment) {
    return false;
  }
  return segment !== 'new';
}

/** Lot custody timelines are public when RLS allows read (e.g. linked active listing). */
export function isPublicLotDetailRoute(pathname: string): boolean {
  const path = stripLocale(pathname);
  const detailMatch = /^\/lots\/([^/]+)$/.exec(path);
  if (!detailMatch) {
    return false;
  }
  const segment = detailMatch[1];
  return Boolean(segment && segment !== 'new');
}

/** Directory list and profile pages are public; contact requires authentication. */
export function isPublicDirectoryRoute(pathname: string): boolean {
  const path = stripLocale(pathname);
  if (path === '/directory') {
    return true;
  }
  const detailMatch = /^\/directory\/([^/]+)$/.exec(path);
  if (!detailMatch) {
    return false;
  }
  const segment = detailMatch[1];
  return Boolean(segment);
}

/**
 * Single authorization surface for middleware route gating.
 * Returns redirect target when access is denied.
 */
export function canAccessRoute(
  pathname: string,
  profile: Profile | null,
  locale: string,
): RouteAccessResult {
  const group = classifyRoute(pathname);
  const localePrefix = locale === 'fr' ? '' : `/${locale}`;

  if (group === 'marketing') {
    return { allowed: true };
  }

  if (group === 'auth') {
    if (profile) {
      return { allowed: false, redirectTo: `${localePrefix}/dashboard` };
    }
    return { allowed: true };
  }

  if (group === 'platform' && isPublicMarketplaceRoute(pathname)) {
    return { allowed: true };
  }

  if (group === 'platform' && isPublicRfpRoute(pathname)) {
    return { allowed: true };
  }

  if (group === 'platform' && isPublicLotDetailRoute(pathname)) {
    return { allowed: true };
  }

  if (group === 'platform' && isPublicDirectoryRoute(pathname)) {
    return { allowed: true };
  }

  if (group === 'admin') {
    return { allowed: true };
  }

  if (!profile) {
    return {
      allowed: false,
      redirectTo: `${localePrefix}/login`,
      reason: 'unauthenticated',
    };
  }

  if (group === 'platform') {
    return { allowed: true };
  }

  return { allowed: true };
}

export function isKycApproved(status: KycStatus): boolean {
  return status === 'approved';
}
