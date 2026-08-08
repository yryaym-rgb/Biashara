import { getAdminGateSecret } from '@/lib/admin/gate';

/**
 * Build an admin path segment (without locale prefix).
 * Uses only the gate secret — no literal route hints.
 */
export function adminPath(...segments: string[]): string {
  const gate = getAdminGateSecret();
  const parts = [gate, ...segments.filter(Boolean)];
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

export function adminReportsPath(): string {
  return adminPath('reports');
}
