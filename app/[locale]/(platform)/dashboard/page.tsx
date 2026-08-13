import { setRequestLocale, getTranslations } from 'next-intl/server';
import {
  ClipboardList,
  Eye,
  Inbox,
  Package,
  Send,
  Settings,
  ShoppingBag,
  Store,
  Tag,
  Truck,
  Wallet,
} from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { requireAuth, isCooperativeRole, isSellerRole } from '@/lib/rbac';
import { getProfile, getUser } from '@/lib/auth/session';
import { getUserKycDocuments } from '@/lib/admin/queries';
import {
  getBuyerDashboardStats,
  getDashboardActivityCounts,
  getDashboardRecentActivity,
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
  getDashboardPersona,
  getDashboardStatKeys,
  isNewDashboardAccount,
  shouldShowKycBanner,
  type CooperativeStatKey,
  type DashboardActivityCounts,
  type DashboardStatKey,
} from '@/lib/platform/dashboard';
import {
  accountAgeDays,
  computeTrustScore,
  isKycApprovedForTrust,
} from '@/lib/platform/trust-score';
import { safeQuery } from '@/lib/safe-query';
import { KycStatusBanner } from '@/components/platform/kyc-status-banner';
import { DashboardSalesChart } from '@/components/platform/dashboard-sales-chart';
import { DashboardRecentOrdersTable } from '@/components/platform/dashboard-recent-orders-table';
import { DashboardActionCenter } from '@/components/platform/dashboard-action-center';
import { DashboardMarketInsight } from '@/components/platform/dashboard-market-insight';
import { DashboardTradingMix } from '@/components/platform/dashboard-trading-mix';
import { DashboardExportButton } from '@/components/platform/dashboard-export-button';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/lib/utils/format';
import { formatRelativeTime } from '@/lib/utils/dates';

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
  const tOffers = await getTranslations({ locale, namespace: 'platform.offers' });
  const tOrders = await getTranslations({ locale, namespace: 'platform.orders' });
  const tListingStatus = await getTranslations({ locale, namespace: 'admin.listingStatus' });

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
    recentActivity,
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
    safeQuery('dashboard/recent-activity', () => getDashboardRecentActivity(profile.id, 10), []),
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

  const quickLinks = [
    { href: '/marketplace' as const, title: t('quickLinks.marketplace'), icon: Store },
    { href: '/offers' as const, title: t('quickLinks.offers'), icon: Tag },
    ...(isSeller
      ? [
          {
            href: (isCooperative ? '/lots' : '/settings') as '/lots' | '/settings',
            title: isCooperative ? t('quickLinks.lots') : t('quickLinks.listings'),
            icon: isCooperative ? Package : ShoppingBag,
          },
        ]
      : []),
    { href: '/settings' as const, title: t('quickLinks.settings'), icon: Settings },
  ];

  function formatActivityStatus(kind: string, status: string): string {
    if (kind === 'offer') {
      return tOffers(status as 'pending');
    }
    if (kind === 'order') {
      if (status === 'in_transit') {
        return tOrders('inTransit');
      }
      return tOrders(status as 'confirmed');
    }
    return tListingStatus(status as 'active');
  }

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

      <DashboardActionCenter items={actionCenterItems} locale={locale} />

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

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-[18px] font-semibold text-ink">
            {hasOrders ? t('recentOrders') : t('recentOffersFallback')}
          </h2>
          <DashboardExportButton />
        </div>
        <DashboardRecentOrdersTable
          rows={recentOrders}
          locale={locale}
          hasOrders={hasOrders}
          hideHeader
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-[18px]">{t('recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {recentActivity.length === 0 ? (
              <p className="text-[15px] text-body">{t('noActivity')}</p>
            ) : (
              <ul className="space-y-3">
                {recentActivity.map((event) => (
                  <li
                    key={event.id}
                    className="border-b border-border pb-3 last:border-b-0 last:pb-0"
                  >
                    <p className="text-[15px] text-ink">
                      {t(`activity.${event.kind}`, {
                        title: event.listingTitle || t('activity.untitled'),
                        status: formatActivityStatus(event.kind, event.status),
                      })}
                    </p>
                    <p className="mt-1 text-[13px] text-muted">
                      {formatRelativeTime(event.timestamp, locale)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          {quickLinks.map((link) => (
            <Link key={`${link.href}-${link.title}`} href={link.href} className="block">
              <Card hoverable className="h-full">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-button bg-bg-tint">
                    <link.icon
                      className="h-5 w-5 text-brand-blue"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  </div>
                  <span className="text-[18px] font-semibold text-ink">{link.title}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
