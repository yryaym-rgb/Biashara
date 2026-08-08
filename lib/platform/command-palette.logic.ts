export type CommandPaletteResultType = 'listing' | 'offer' | 'order' | 'conversation';

export interface CommandPaletteResult {
  id: string;
  type: CommandPaletteResultType;
  title: string;
  subtitle: string;
  href: string;
  userId: string;
}

export interface CommandPaletteSearchResult {
  listings: CommandPaletteResult[];
  offers: CommandPaletteResult[];
  orders: CommandPaletteResult[];
  conversations: CommandPaletteResult[];
}

const MIN_QUERY_LENGTH = 1;

export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function isSearchQueryValid(query: string): boolean {
  return normalizeSearchQuery(query).length >= MIN_QUERY_LENGTH;
}

export function matchesSearchQuery(text: string, query: string): boolean {
  const normalized = normalizeSearchQuery(query);
  if (!normalized) {
    return false;
  }
  return text.toLowerCase().includes(normalized);
}

/**
 * Ensures every search result belongs to the authenticated user.
 */
export function assertResultsScopedToUser(
  results: CommandPaletteResult[],
  userId: string,
): boolean {
  return results.every((result) => result.userId === userId);
}

export function flattenSearchResults(results: CommandPaletteSearchResult): CommandPaletteResult[] {
  return [
    ...results.listings,
    ...results.offers,
    ...results.orders,
    ...results.conversations,
  ];
}

export function hasSearchResults(results: CommandPaletteSearchResult): boolean {
  return flattenSearchResults(results).length > 0;
}

/**
 * Rejects results that do not belong to the requesting user.
 * Defense-in-depth filter applied after query assembly.
 */
export function filterResultsForUser(
  results: CommandPaletteResult[],
  userId: string,
): CommandPaletteResult[] {
  return results.filter((result) => result.userId === userId);
}
