import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { pickPrimaryProvince } from '@/lib/directory/filters';
import {
  activityLookbackCutoff,
  buildPublicActivityFeed,
  kycLookbackCutoff,
  PUBLIC_ACTIVITY_FEED_LIMIT,
} from '@/lib/activity/public-feed.logic';
import type { PublicActivityFeedResponse } from '@/lib/activity/public-feed.types';
import type { Database } from '@/types/database.types';

type UserRole = Database['public']['Enums']['user_role'];

const PUBLIC_FEED_ROLES: UserRole[] = ['buyer', 'seller', 'cooperative', 'institution'];

async function getProvincesForUsers(userIds: string[]): Promise<Map<string, string | null>> {
  const result = new Map<string, string | null>();
  if (userIds.length === 0) {
    return result;
  }

  const admin = createAdminClient();

  const [listingsRes, sitesRes] = await Promise.all([
    admin.from('listings').select('seller_id, origin_province').in('seller_id', userIds),
    admin
      .from('cooperative_sites')
      .select('cooperative_id, province')
      .in('cooperative_id', userIds),
  ]);

  if (listingsRes.error) {
    throw new Error(listingsRes.error.message);
  }
  if (sitesRes.error) {
    throw new Error(sitesRes.error.message);
  }

  const provincesByUser = new Map<string, string[]>();

  function appendProvince(userId: string, province: string | null | undefined) {
    if (!province) {
      return;
    }
    const existing = provincesByUser.get(userId) ?? [];
    existing.push(province);
    provincesByUser.set(userId, existing);
  }

  for (const listing of listingsRes.data ?? []) {
    appendProvince(listing.seller_id, listing.origin_province);
  }

  for (const site of sitesRes.data ?? []) {
    appendProvince(site.cooperative_id, site.province);
  }

  for (const userId of userIds) {
    result.set(userId, pickPrimaryProvince(provincesByUser.get(userId) ?? []));
  }

  return result;
}

export async function getPublicActivityFeed(): Promise<PublicActivityFeedResponse> {
  const admin = createAdminClient();
  const lookback = activityLookbackCutoff();
  const kycCutoff = kycLookbackCutoff();

  const [listingsRes, rfpsRes, ordersRes, profilesRes] = await Promise.all([
    admin
      .from('listings')
      .select('id, mineral, origin_province, created_at')
      .eq('status', 'active')
      .gte('created_at', lookback)
      .order('created_at', { ascending: false })
      .limit(PUBLIC_ACTIVITY_FEED_LIMIT),
    admin
      .from('rfps')
      .select('id, mineral, created_at')
      .gte('created_at', lookback)
      .order('created_at', { ascending: false })
      .limit(PUBLIC_ACTIVITY_FEED_LIMIT),
    admin
      .from('orders')
      .select(
        `
          id,
          created_at,
          listing:listings(mineral)
        `,
      )
      .eq('status', 'delivered')
      .gte('created_at', lookback)
      .order('created_at', { ascending: false })
      .limit(PUBLIC_ACTIVITY_FEED_LIMIT),
    admin
      .from('profiles')
      .select('id, role, updated_at')
      .eq('kyc_status', 'approved')
      .in('role', PUBLIC_FEED_ROLES)
      .gte('updated_at', kycCutoff)
      .order('updated_at', { ascending: false })
      .limit(PUBLIC_ACTIVITY_FEED_LIMIT),
  ]);

  const errors = [listingsRes.error, rfpsRes.error, ordersRes.error, profilesRes.error].filter(
    Boolean,
  );
  if (errors.length > 0) {
    throw new Error(errors[0]!.message);
  }

  const verifiedProfiles = profilesRes.data ?? [];
  const provincesByUser = await getProvincesForUsers(verifiedProfiles.map((profile) => profile.id));

  const orders = (ordersRes.data ?? []).map((order) => {
    const listing = Array.isArray(order.listing) ? order.listing[0] : order.listing;
    return {
      id: order.id,
      created_at: order.created_at,
      listing: listing ? { mineral: listing.mineral } : null,
    };
  });

  const verifiedAccounts = verifiedProfiles
    .filter((profile): profile is typeof profile & { role: Exclude<UserRole, 'admin'> } =>
      PUBLIC_FEED_ROLES.includes(profile.role),
    )
    .map((profile) => ({
      id: profile.id,
      role: profile.role,
      province: provincesByUser.get(profile.id) ?? null,
      updated_at: profile.updated_at,
    }));

  return buildPublicActivityFeed({
    listings: listingsRes.data ?? [],
    rfps: rfpsRes.data ?? [],
    orders,
    verifiedAccounts,
  });
}
