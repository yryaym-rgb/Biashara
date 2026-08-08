import 'server-only';

import { createClient } from '@/lib/supabase/server';
import {
  assertAdminSearchIsPlatformWide,
  flattenAdminSearchResults,
  isAdminSearchQueryValid,
  matchesAdminSearchQuery,
  normalizeAdminSearchQuery,
  type AdminSearchGroupedResult,
  type AdminSearchResult,
} from '@/lib/admin/search.logic';
import { adminListingsModerationPath, adminUsersPath } from '@/lib/admin/path';

export type {
  AdminSearchGroupedResult,
  AdminSearchResult,
  AdminSearchResultType,
} from '@/lib/admin/search.logic';

export {
  assertAdminSearchIsPlatformWide,
  flattenAdminSearchResults,
  hasAdminSearchResults,
  isAdminSearchQueryValid,
  matchesAdminSearchQuery,
  normalizeAdminSearchQuery,
} from '@/lib/admin/search.logic';

const RESULTS_PER_GROUP = 5;

function ilikePattern(query: string): string {
  const escaped = query.replace(/[%_\\]/g, '\\$&');
  return `%${escaped}%`;
}

export async function searchAdminPlatformData(query: string): Promise<AdminSearchGroupedResult> {
  const normalized = normalizeAdminSearchQuery(query);
  if (!isAdminSearchQueryValid(normalized)) {
    return { users: [], listings: [], orders: [] };
  }

  const pattern = ilikePattern(normalized);
  const supabase = await createClient();

  const [usersRes, listingsRes, ordersRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, company_name, role')
      .or(`company_name.ilike.${pattern},id.ilike.${pattern}`)
      .limit(RESULTS_PER_GROUP),
    supabase
      .from('listings')
      .select('id, title, mineral, status')
      .or(`title.ilike.${pattern},mineral.ilike.${pattern},id.ilike.${pattern}`)
      .limit(RESULTS_PER_GROUP),
    supabase
      .from('orders')
      .select(
        `
          id,
          status,
          buyer:profiles!orders_buyer_id_fkey(company_name),
          seller:profiles!orders_seller_id_fkey(company_name),
          listing:listings(title, mineral)
        `,
      )
      .limit(RESULTS_PER_GROUP * 2),
  ]);

  const errors = [usersRes.error, listingsRes.error, ordersRes.error].filter(Boolean);
  if (errors.length > 0) {
    throw new Error(errors[0]!.message);
  }

  const users: AdminSearchResult[] = (usersRes.data ?? []).map((row) => ({
    id: row.id,
    type: 'user' as const,
    title: row.company_name?.trim() || row.id.slice(0, 8),
    subtitle: row.role,
    href: adminUsersPath(row.id),
  }));

  const listings: AdminSearchResult[] = (listingsRes.data ?? []).map((row) => ({
    id: row.id,
    type: 'listing' as const,
    title: row.title,
    subtitle: row.mineral,
    href: adminListingsModerationPath(row.id),
  }));

  const orderResults: AdminSearchResult[] = [];

  for (const row of ordersRes.data ?? []) {
    const listing = Array.isArray(row.listing) ? row.listing[0] : row.listing;
    const buyer = Array.isArray(row.buyer) ? row.buyer[0] : row.buyer;
    const seller = Array.isArray(row.seller) ? row.seller[0] : row.seller;
    const title = listing?.title ?? '';
    const mineral = (listing?.mineral ?? '') as string;
    const buyerName = buyer?.company_name?.trim() || '';
    const sellerName = seller?.company_name?.trim() || '';
    const refShort = row.id.slice(0, 8);

    if (
      matchesAdminSearchQuery(title, normalized) ||
      matchesAdminSearchQuery(mineral, normalized) ||
      matchesAdminSearchQuery(buyerName, normalized) ||
      matchesAdminSearchQuery(sellerName, normalized) ||
      matchesAdminSearchQuery(row.id, normalized) ||
      matchesAdminSearchQuery(refShort, normalized)
    ) {
      orderResults.push({
        id: row.id,
        type: 'order',
        title: title || refShort,
        subtitle: `${buyerName} / ${sellerName}`.trim() || row.status,
        href: adminUsersPath(),
      });
    }
  }

  const results: AdminSearchGroupedResult = {
    users,
    listings,
    orders: orderResults.slice(0, RESULTS_PER_GROUP),
  };

  const flat = flattenAdminSearchResults(results);
  if (!assertAdminSearchIsPlatformWide(flat)) {
    throw new Error('Admin search results failed platform-wide validation');
  }

  return results;
}
