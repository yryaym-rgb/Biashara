import { setRequestLocale, getTranslations } from 'next-intl/server';
import {
  ClipboardList,
  Eye,
  Inbox,
  Package,
  Send,
  Tag,
  Truck,
  Wallet,
} from 'lucide-react';
import {
  getBuyerDashboardStats,
  getDashboardActivityCounts,
  getDashboardRecentOrders,
  getSellerDashboardStats,
  getSellerSalesVolumeByDay,
  type BuyerDashboardStats,
  type SellerDashboardStats,
} from '@/lib/platform/queries';
import { getCooperativeDashboardStats } from '@/lib/platform/dashboard/cooperative-stats';
import { getDashboardGreetingName } from '@/lib/platform/dashboard/greeting';
import { getActionCenterItems } from '@/lib/platform/action-center';
import { getMarketInsightForUser } from '@/lib/platform/market-insight';
import { getTradingMixForUser } from '@/lib/platform/trading-mix';
import { getTrustScoreForUser } from '@/lib/platform/trust-score-queries';
import { getSuggestedListingsForUser } from '@/lib/platform/suggestions';
import {
  getDashboardStatKeys,
  isNewDashboardAccount,
  shouldShowKycBanner,
  type CooperativeStatKey,
  type DashboardActivityCounts,
  type DashboardStatKey,
} from '@/lib/platform/dashboard';
import { requireAuth, isCooperativeRole, isSellerRole } from '@/lib/rbac';
import { getProfile, getUser } from '@/lib/auth/session';
import { getUserKycDocuments } from '@/lib/admin/queries';
import {
  accountAgeDays,
  computeTrustScore,
  isKycApprovedForTrust,
} from '@/lib/platform/trust-score';
import { safeQuery } from '@/lib/safe-query';
import { KycStatusBanner } from '@/components/platform/kyc-status-banner';
import { DashboardSalesChart } from '@/components/platform/dashboard-sales-chart';
import { DashboardActionCenter } from '@/components/platform/dashboard-action-center';
import { DashboardMarketInsight } from '@/components/platform/dashboard-market-insight';
import { DashboardTradingMix } from '@/components/platform/dashboard-trading-mix';
import { DashboardTrustScore } from '@/components/platform/dashboard-header';
import { DashboardSuggestions } from '@/components/platform/dashboard-suggestions';
import {
  DashboardComplianceComingSoon,
  DashboardEscrowComingSoon,
  DashboardRecommendationsComingSoon,
} from '@/components/platform/dashboard-coming-soon';
import { DashboardGreetingBar } from '@/components/platform/dashboard/dashboard-greeting-bar';
import { DashboardKpiGrid, type DashboardKpiItem } from '@/components/platform/dashboard/dashboard-kpi-grid';
import { DashboardOnboardingBanner } from '@/components/platform/dashboard/dashboard-onboarding-banner';
import { DashboardMarketPulse } from '@/components/platform/dashboard/dashboard-market-pulse';
import { DashboardRecentActivitySection } from '@/components/platform/dashboard/dashboard-recent-activity-section';
import { DashboardQuickActions } from '@/components/platform/dashboard/dashboard-quick-actions';
import { formatCurrency, formatNumber } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';

const EMPTY_ACTIVITY_COUNTS: DashboardActivityCounts = {
  listings: 0,
  offers: 0,
  orders: 0,
  conversations: 0,
};

const ZERO_SELLER_STATS: SellerDashboardStats = {
  activeListings: 0,
  pendingOffersReceived: 0,
  ordersInProgress: 0,
  monthlyRevenue: 0,
};

const ZERO_BUYER_STATS: BuyerDashboardStats = {
  pendingOffersSent: 0,
  ordersInProgress: 0,
  recentlyViewedListings: 0,
};

const ZERO_COOPERATIVE_STATS = {
  lots: 0,
  offers: 0,
  openPurchaseRequests: 0,
  ordersInProgress: 0,
};

const STAT_ICONS = {
  activeListings: Package,
  pendingOffersReceived: Inbox,
  ordersInProgress: Truck,
  monthlyRevenue: Wallet,
  pendingOffersSent: Send,
  recentlyViewedListings: Eye,
  lots: Package,
  offers: Tag,
  openPurchaseRequests: ClipboardList,
} as const satisfies Record<DashboardStatKey, typeof Package>;

const COOPERATIVE_KPI_HREFS: Record<CooperativeStatKey, '/lots' | '/offers' | '/rfps' | '/orders'> = {
  lots: '/lots',
  offers: '/offers',
  openPurchaseRequests: '/rfps',
  ordersInProgress: '/orders',
};

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = requireAuth(await getProfile());
  const user = await getUser();
  const isCooperative = isCooperativeRole(profile.role);
  const isSeller = isSellerRole(profile.role);

  const t = await getTranslations({ locale, namespace: 'platform.dashboard' });
  const tCommon = await getTranslations({ locale, namespace: 'admin.common' });

  const greetingName = getDashboardGreetingName(
    profile.company_name,
    user?.email ?? null,
    tCommon('unknownUser'),
  );

  const trustScoreFallback = computeTrustScore({
    kycApproved: isKycApprovedForTrust(profile.kyc_status),
    completedOrderCount: 0,
    disputedOrderCount: 0,
    accountAgeDays: accountAgeDays(profile.created_at),
  });

  const [
    activityCounts,
    kycDocuments,
    sellerStats,
    buyerStats,
    cooperativeStats,
    salesVolume,
    recentOrders,
    actionCenterItems,
    marketInsight,
    tradingMix,
    trustScore,
    suggestions,
  ] = await Promise.all([
    safeQuery('dashboard/activity-counts', () => getDashboardActivityCounts(profile.id), EMPTY_ACTIVITY_COUNTS),
    shouldShowKycBanner(profile.kyc_status)
      ? safeQuery('dashboard/kyc-documents', () => getUserKycDocuments(profile.id), [])
      : Promise.resolve([]),
    isSeller && !isCooperative
      ? safeQuery('dashboard/seller-stats', () => getSellerDashboardStats(profile.id), ZERO_SELLER_STATS)
      : Promise.resolve(null),
    !isSeller
      ? safeQuery('dashboard/buyer-stats', () => getBuyerDashboardStats(profile.id), ZERO_BUYER_STATS)
      : Promise.resolve(null),
    isCooperative
      ? safeQuery(
          'dashboard/cooperative-stats',
          () => getCooperativeDashboardStats(profile.id),
          ZERO_COOPERATIVE_STATS,
        )
      : Promise.resolve(null),
    isSeller
      ? safeQuery('dashboard/sales-volume', () => getSellerSalesVolumeByDay(profile.id), [])
      : Promise.resolve([]),
    safeQuery('dashboard/recent-orders', () => getDashboardRecentOrders(profile.id, 8), []),
    safeQuery('dashboard/action-center', () => getActionCenterItems(profile.id), []),
    safeQuery('dashboard/market-insight', () => getMarketInsightForUser(profile.id), null),
    safeQuery('dashboard/trading-mix', () => getTradingMixForUser(profile.id), []),
    safeQuery(
      'dashboard/trust-score',
      () => getTrustScoreForUser(profile.id, profile.kyc_status, profile.created_at),
      trustScoreFallback,
    ),
    safeQuery('dashboard/suggestions', () => getSuggestedListingsForUser(profile.id), []),
  ]);

  const showOnboardingBanner = isNewDashboardAccount(activityCounts);
  const rejectedDocumentTypes = kycDocuments
    .filter((doc) => doc.status === 'rejected')
    .map((doc) => doc.type);

  const statKeys = getDashboardStatKeys(profile.role);
  const hasOrders = recentOrders.some((row) => row.kind === 'order');

  const statValues: Record<DashboardStatKey, string | number> = {
    activeListings: sellerStats?.activeListings ?? 0,
    pendingOffersReceived: sellerStats?.pendingOffersReceived ?? 0,
    ordersInProgress: isCooperative
      ? (cooperativeStats?.ordersInProgress ?? 0)
      : isSeller
        ? (sellerStats?.ordersInProgress ?? 0)
        : (buyerStats?.ordersInProgress ?? 0),
    monthlyRevenue: sellerStats
      ? formatCurrency(sellerStats.monthlyRevenue, 'USD', locale)
      : formatCurrency(0, 'USD', locale),
    pendingOffersSent: buyerStats?.pendingOffersSent ?? 0,
    recentlyViewedListings: buyerStats?.recentlyViewedListings ?? 0,
    lots: cooperativeStats?.lots ?? 0,
    offers: cooperativeStats?.offers ?? 0,
    openPurchaseRequests: cooperativeStats?.openPurchaseRequests ?? 0,
  };

  const kpiItems: DashboardKpiItem[] = statKeys.map((key) => {
    const rawValue = statValues[key];
    const value =
      key === 'monthlyRevenue' ? rawValue : formatNumber(rawValue as number, locale);

    return {
      key,
      label: t(`stats.${key}`),
      value,
      icon: STAT_ICONS[key as keyof typeof STAT_ICONS],
      zeroSubLabel: t(`stats.zero.${key}`),
      href: isCooperative ? COOPERATIVE_KPI_HREFS[key as CooperativeStatKey] : undefined,
    };
  });

  return (
    <div className="w-full space-y-6">
      <DashboardGreetingBar
        displayName={greetingName}
        role={profile.role}
        kycStatus={profile.kyc_status}
      />

      {shouldShowKycBanner(profile.kyc_status) ? (
        <KycStatusBanner
          locale={locale}
          kycStatus={profile.kyc_status}
          rejectedDocumentTypes={rejectedDocumentTypes}
        />
      ) : null}

      <DashboardActionCenter
        items={actionCenterItems}
        kycApproved={profile.kyc_status === 'approved'}
        locale={locale}
      />

      <DashboardKpiGrid items={kpiItems} />

      {showOnboardingBanner ? (
        <DashboardOnboardingBanner
          locale={locale}
          role={profile.role}
          kycApproved={profile.kyc_status === 'approved'}
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardMarketPulse />
        <DashboardTrustScore trustScore={trustScore} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardTradingMix segments={tradingMix} />
        <div className="grid gap-4">
          <DashboardEscrowComingSoon />
          <DashboardRecommendationsComingSoon />
        </div>
      </div>

      <DashboardMarketInsight insight={marketInsight} />

      <DashboardComplianceComingSoon />

      {suggestions.length > 0 ? (
        <DashboardSuggestions groups={suggestions} locale={locale} />
      ) : null}

      {isSeller ? <DashboardSalesChart data={salesVolume} /> : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <DashboardRecentActivitySection
            rows={recentOrders}
            hasOrders={hasOrders}
            locale={locale}
          />
        </div>
        <DashboardQuickActions
          locale={locale}
          role={profile.role}
          kycApproved={profile.kyc_status === 'approved'}
        />
      </div>
    </div>
  );
}
