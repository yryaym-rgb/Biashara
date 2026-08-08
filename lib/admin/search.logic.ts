/**
 * Admin global search logic — SEPARATE from lib/platform/command-palette.logic.ts.
 * No shared imports with the user-scoped command palette to keep RLS models independent.
 */

export type AdminSearchResultType = 'user' | 'listing' | 'order';

export interface AdminSearchResult {
  id: string;
  type: AdminSearchResultType;
  title: string;
  subtitle: string;
  href: string;
}

export interface AdminSearchGroupedResult {
  users: AdminSearchResult[];
  listings: AdminSearchResult[];
  orders: AdminSearchResult[];
}

const MIN_QUERY_LENGTH = 1;

export function normalizeAdminSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function isAdminSearchQueryValid(query: string): boolean {
  return normalizeAdminSearchQuery(query).length >= MIN_QUERY_LENGTH;
}

export function matchesAdminSearchQuery(text: string, query: string): boolean {
  const normalized = normalizeAdminSearchQuery(query);
  if (!normalized) {
    return false;
  }
  return text.toLowerCase().includes(normalized);
}

export function flattenAdminSearchResults(results: AdminSearchGroupedResult): AdminSearchResult[] {
  return [...results.users, ...results.listings, ...results.orders];
}

export function hasAdminSearchResults(results: AdminSearchGroupedResult): boolean {
  return flattenAdminSearchResults(results).length > 0;
}

/**
 * Admin search returns platform-wide results — no userId scoping field.
 * This is intentionally different from the user command palette which
 * requires userId on every result for defense-in-depth filtering.
 */
export function assertAdminSearchIsPlatformWide(results: AdminSearchResult[]): boolean {
  return results.every((result) => !('userId' in result));
}
