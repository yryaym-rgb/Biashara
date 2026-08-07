import { getAdminGateSecret } from '@/lib/admin/gate';

/**
 * Build an admin path segment (without locale prefix).
 * Never hardcode `/admin/...` in application code — use this helper.
 */
export function adminPath(...segments: string[]): string {
  const gate = getAdminGateSecret();
  const parts = ['admin', gate, ...segments.filter(Boolean)];
  return `/${parts.join('/')}`;
}

export function adminUsersPath(userId?: string): string {
  return userId ? adminPath('users', userId) : adminPath('users');
}

export function adminKycReviewPath(): string {
  return adminPath('kyc-review');
}

export function adminListingsModerationPath(listingId?: string): string {
  return listingId
    ? adminPath('listings-moderation', listingId)
    : adminPath('listings-moderation');
}

export function adminAuditLogPath(): string {
  return adminPath('audit-log');
}
