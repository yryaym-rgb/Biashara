import 'server-only';

import { createClient } from '@/lib/supabase/server';
import {
  adminLiveActivityLookbackCutoff,
  buildAdminLiveActivityFeed,
  ADMIN_LIVE_ACTIVITY_LIMIT,
  type AdminLiveActivityEvent,
} from '@/lib/admin/dashboard-activity.logic';

export type { AdminLiveActivityEvent, AdminLiveActivityKind } from '@/lib/admin/dashboard-activity.logic';

export async function getAdminLiveActivityFeed(
  limit = ADMIN_LIVE_ACTIVITY_LIMIT,
): Promise<AdminLiveActivityEvent[]> {
  const supabase = await createClient();
  const lookback = adminLiveActivityLookbackCutoff();

  const [
    verifiedRes,
    kycRes,
    listingsRes,
    rfpsRes,
    offersRes,
    ordersRes,
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, company_name, role, updated_at')
      .eq('kyc_status', 'approved')
      .gte('updated_at', lookback)
      .order('updated_at', { ascending: false })
      .limit(ADMIN_LIVE_ACTIVITY_LIMIT * 2),
    supabase
      .from('kyc_documents')
      .select(
        `
          id,
          user_id,
          created_at,
          applicant:profiles!kyc_documents_user_id_fkey(company_name)
        `,
      )
      .eq('status', 'pending')
      .gte('created_at', lookback)
      .order('created_at', { ascending: false })
      .limit(ADMIN_LIVE_ACTIVITY_LIMIT * 4),
    supabase
      .from('listings')
      .select(
        `
          id,
          mineral,
          origin_province,
          title,
          status,
          created_at,
          updated_at,
          seller:profiles!listings_seller_id_fkey(company_name)
        `,
      )
      .in('status', ['pending_review', 'active'])
      .gte('created_at', lookback)
      .order('created_at', { ascending: false })
      .limit(ADMIN_LIVE_ACTIVITY_LIMIT * 3),
    supabase
      .from('rfps')
      .select(
        `
          id,
          mineral,
          created_at,
          buyer:profiles!rfps_buyer_id_fkey(company_name)
        `,
      )
      .gte('created_at', lookback)
      .order('created_at', { ascending: false })
      .limit(ADMIN_LIVE_ACTIVITY_LIMIT * 2),
    supabase
      .from('offers')
      .select(
        `
          id,
          updated_at,
          buyer:profiles!offers_buyer_id_fkey(company_name),
          listing:listings(mineral, title)
        `,
      )
      .eq('status', 'accepted')
      .gte('updated_at', lookback)
      .order('updated_at', { ascending: false })
      .limit(ADMIN_LIVE_ACTIVITY_LIMIT * 2),
    supabase
      .from('orders')
      .select(
        `
          id,
          disputed_at,
          created_at,
          listing:listings(title, mineral)
        `,
      )
      .eq('status', 'disputed')
      .gte('created_at', lookback)
      .order('disputed_at', { ascending: false })
      .limit(ADMIN_LIVE_ACTIVITY_LIMIT),
  ]);

  const errors = [
    verifiedRes.error,
    kycRes.error,
    listingsRes.error,
    rfpsRes.error,
    offersRes.error,
    ordersRes.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new Error(errors[0]!.message);
  }

  return buildAdminLiveActivityFeed({
    verifiedProfiles: verifiedRes.data ?? [],
    kycSubmitted: (kycRes.data ?? []).map((row) => ({
      id: row.id,
      user_id: row.user_id,
      created_at: row.created_at,
      applicant: (row.applicant as { company_name: string | null } | null) ?? null,
    })),
    listings: (listingsRes.data ?? []).map((row) => ({
      id: row.id,
      mineral: row.mineral,
      origin_province: row.origin_province,
      title: row.title,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      seller: (row.seller as { company_name: string | null } | null) ?? null,
    })),
    rfps: (rfpsRes.data ?? []).map((row) => ({
      id: row.id,
      mineral: row.mineral,
      created_at: row.created_at,
      buyer: (row.buyer as { company_name: string | null } | null) ?? null,
    })),
    offersAccepted: (offersRes.data ?? []).map((row) => {
      const listing = Array.isArray(row.listing) ? row.listing[0] : row.listing;
      return {
        id: row.id,
        updated_at: row.updated_at,
        buyer: (row.buyer as { company_name: string | null } | null) ?? null,
        listing: listing
          ? { mineral: listing.mineral, title: listing.title }
          : null,
      };
    }),
    ordersDisputed: (ordersRes.data ?? []).map((row) => {
      const listing = Array.isArray(row.listing) ? row.listing[0] : row.listing;
      return {
        id: row.id,
        disputed_at: row.disputed_at,
        created_at: row.created_at,
        listing: listing
          ? { title: listing.title, mineral: listing.mineral }
          : null,
      };
    }),
    limit,
  });
}
