import 'server-only';

import { createClient } from '@/lib/supabase/server';
import {
  assertResultsScopedToUser,
  filterResultsForUser,
  flattenSearchResults,
  hasSearchResults,
  isSearchQueryValid,
  matchesSearchQuery,
  normalizeSearchQuery,
  type CommandPaletteResult,
  type CommandPaletteSearchResult,
} from '@/lib/platform/command-palette.logic';

export type {
  CommandPaletteResult,
  CommandPaletteResultType,
  CommandPaletteSearchResult,
} from '@/lib/platform/command-palette.logic';

export {
  assertResultsScopedToUser,
  flattenSearchResults,
  hasSearchResults,
  isSearchQueryValid,
  matchesSearchQuery,
  normalizeSearchQuery,
} from '@/lib/platform/command-palette.logic';

const RESULTS_PER_GROUP = 5;

function ilikePattern(query: string): string {
  const escaped = query.replace(/[%_\\]/g, '\\$&');
  return `%${escaped}%`;
}

export async function searchPlatformData(
  userId: string,
  query: string,
): Promise<CommandPaletteSearchResult> {
  const normalized = normalizeSearchQuery(query);
  if (!isSearchQueryValid(normalized)) {
    return { listings: [], offers: [], orders: [], conversations: [] };
  }

  const pattern = ilikePattern(normalized);
  const supabase = await createClient();

  const [listingsRes, buyerOffersRes, sellerOffersRes, buyerOrdersRes, sellerOrdersRes, conversationsRes] =
    await Promise.all([
      supabase
        .from('listings')
        .select('id, title, mineral')
        .eq('seller_id', userId)
        .or(`title.ilike.${pattern},mineral.ilike.${pattern}`)
        .limit(RESULTS_PER_GROUP),
      supabase
        .from('offers')
        .select(
          `
            id,
            listing:listings(title, mineral, seller:profiles!listings_seller_id_fkey(company_name))
          `,
        )
        .eq('buyer_id', userId)
        .limit(RESULTS_PER_GROUP * 2),
      supabase
        .from('offers')
        .select(
          `
            id,
            buyer:profiles!offers_buyer_id_fkey(company_name),
            listing:listings!inner(title, mineral, seller_id)
          `,
        )
        .eq('listing.seller_id', userId)
        .limit(RESULTS_PER_GROUP * 2),
      supabase
        .from('orders')
        .select(
          `
            id,
            buyer:profiles!orders_buyer_id_fkey(company_name),
            seller:profiles!orders_seller_id_fkey(company_name),
            listing:listings(title, mineral)
          `,
        )
        .eq('buyer_id', userId)
        .limit(RESULTS_PER_GROUP * 2),
      supabase
        .from('orders')
        .select(
          `
            id,
            buyer:profiles!orders_buyer_id_fkey(company_name),
            seller:profiles!orders_seller_id_fkey(company_name),
            listing:listings(title, mineral)
          `,
        )
        .eq('seller_id', userId)
        .limit(RESULTS_PER_GROUP * 2),
      supabase
        .from('conversations')
        .select(
          `
            id,
            buyer_id,
            seller_id,
            listing:listings(title),
            buyer:profiles!conversations_buyer_id_fkey(company_name),
            seller:profiles!conversations_seller_id_fkey(company_name)
          `,
        )
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .limit(RESULTS_PER_GROUP * 2),
    ]);

  const errors = [
    listingsRes.error,
    buyerOffersRes.error,
    sellerOffersRes.error,
    buyerOrdersRes.error,
    sellerOrdersRes.error,
    conversationsRes.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new Error(errors[0]!.message);
  }

  const listings: CommandPaletteResult[] = (listingsRes.data ?? []).map((row) => ({
    id: row.id,
    type: 'listing' as const,
    title: row.title,
    subtitle: row.mineral,
    href: `/marketplace/${row.id}`,
    userId,
  }));

  const offerResults: CommandPaletteResult[] = [];

  for (const row of buyerOffersRes.data ?? []) {
    const listing = Array.isArray(row.listing) ? row.listing[0] : row.listing;
    const seller = listing?.seller
      ? Array.isArray(listing.seller)
        ? listing.seller[0]
        : listing.seller
      : null;
    const mineral = (listing?.mineral ?? '') as string;
    const counterpart = seller?.company_name?.trim() || '';
    const title = listing?.title ?? '';

    if (
      matchesSearchQuery(title, normalized) ||
      matchesSearchQuery(mineral, normalized) ||
      matchesSearchQuery(counterpart, normalized)
    ) {
      offerResults.push({
        id: row.id,
        type: 'offer',
        title,
        subtitle: counterpart || mineral,
        href: '/offers?tab=sent',
        userId,
      });
    }
  }

  for (const row of sellerOffersRes.data ?? []) {
    const listing = Array.isArray(row.listing) ? row.listing[0] : row.listing;
    const buyer = Array.isArray(row.buyer) ? row.buyer[0] : row.buyer;
    const mineral = (listing?.mineral ?? '') as string;
    const counterpart = buyer?.company_name?.trim() || '';
    const title = listing?.title ?? '';

    if (
      matchesSearchQuery(title, normalized) ||
      matchesSearchQuery(mineral, normalized) ||
      matchesSearchQuery(counterpart, normalized)
    ) {
      offerResults.push({
        id: row.id,
        type: 'offer',
        title,
        subtitle: counterpart || mineral,
        href: '/offers?tab=received',
        userId,
      });
    }
  }

  const orderResults: CommandPaletteResult[] = [];

  const pushOrder = (
    row: NonNullable<typeof buyerOrdersRes.data>[number],
    role: 'buyer' | 'seller',
  ) => {
    const listing = Array.isArray(row.listing) ? row.listing[0] : row.listing;
    const buyer = Array.isArray(row.buyer) ? row.buyer[0] : row.buyer;
    const seller = Array.isArray(row.seller) ? row.seller[0] : row.seller;
    const counterpart =
      role === 'buyer'
        ? seller?.company_name?.trim() || ''
        : buyer?.company_name?.trim() || '';
    const title = listing?.title ?? '';
    const mineral = (listing?.mineral ?? '') as string;
    const refShort = row.id.slice(0, 8);

    if (
      matchesSearchQuery(title, normalized) ||
      matchesSearchQuery(mineral, normalized) ||
      matchesSearchQuery(counterpart, normalized) ||
      matchesSearchQuery(row.id, normalized) ||
      matchesSearchQuery(refShort, normalized)
    ) {
      orderResults.push({
        id: row.id,
        type: 'order',
        title: title || refShort,
        subtitle: counterpart || mineral,
        href: `/orders/${row.id}`,
        userId,
      });
    }
  };

  for (const row of buyerOrdersRes.data ?? []) {
    pushOrder(row, 'buyer');
  }
  for (const row of sellerOrdersRes.data ?? []) {
    pushOrder(row, 'seller');
  }

  const conversationResults: CommandPaletteResult[] = [];

  for (const row of conversationsRes.data ?? []) {
    const listing = Array.isArray(row.listing) ? row.listing[0] : row.listing;
    const buyer = Array.isArray(row.buyer) ? row.buyer[0] : row.buyer;
    const seller = Array.isArray(row.seller) ? row.seller[0] : row.seller;
    const counterpart =
      row.buyer_id === userId
        ? seller?.company_name?.trim() || ''
        : buyer?.company_name?.trim() || '';
    const title = listing?.title ?? '';

    if (matchesSearchQuery(counterpart, normalized) || matchesSearchQuery(title, normalized)) {
      conversationResults.push({
        id: row.id,
        type: 'conversation',
        title: counterpart || title,
        subtitle: title,
        href: `/messages?conversation=${row.id}`,
        userId,
      });
    }
  }

  const dedupeById = <T extends { id: string }>(items: T[]): T[] =>
    Array.from(new Map(items.map((item) => [item.id, item])).values());

  const results: CommandPaletteSearchResult = {
    listings: filterResultsForUser(listings, userId).slice(0, RESULTS_PER_GROUP),
    offers: filterResultsForUser(dedupeById(offerResults), userId).slice(0, RESULTS_PER_GROUP),
    orders: filterResultsForUser(dedupeById(orderResults), userId).slice(0, RESULTS_PER_GROUP),
    conversations: filterResultsForUser(conversationResults, userId).slice(0, RESULTS_PER_GROUP),
  };

  const flat = flattenSearchResults(results);
  if (!assertResultsScopedToUser(flat, userId)) {
    throw new Error('Search results failed user scoping validation');
  }

  return results;
}
