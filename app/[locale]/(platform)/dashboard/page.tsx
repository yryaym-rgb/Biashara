import { setRequestLocale, getTranslations } from 'next-intl/server';
import {
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
import { requireAuth, isSellerRole } from '@/lib/rbac';
import { getProfile } from '@/lib/auth/session';
import { getUserKycDocuments } from '@/lib/admin/queries';
import {
  getBuyerDashboardStats,
  getDashboardActivityCounts,
  getDashboardRecentActivity,
  getDashboardRecentOrders,
  getSellerDashboardStats,
  getSellerSalesVolumeByDay,
} from '@/lib/platform/queries';
import {
  getDashboardPersona,
  getDashboardStatKeys,
  isNewDashboardAccount,
  shouldShowKycBanner,
  type DashboardStatKey,
} from '@/lib/platform/dashboard';
import { KycStatusBanner } from '@/components/platform/kyc-status-banner';
import { DashboardStatCard } from '@/components/platform/dashboard-stat-card';
import { DashboardWelcomePanel } from '@/components/platform/dashboard-welcome-panel';
import { DashboardSalesChart } from '@/components/platform/dashboard-sales-chart';
import { DashboardRecentOrdersTable } from '@/components/platform/dashboard-recent-orders-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { formatCurrency, formatNumber } from '@/lib/utils/format';
import { formatRelativeTime } from '@/lib/utils/dates';

const STAT_ICONS: Record<DashboardStatKey, typeof Package> = {
  activeListings: Package,
  pendingOffersReceived: Inbox,
  ordersInProgress: Truck,
  monthlyRevenue: Wallet,
  pendingOffersSent: Send,
  recentlyViewedListings: Eye,
};

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = requireAuth(await getProfile());
  const persona = getDashboardPersona(profile.role);
  const isSeller = isSellerRole(profile.role);

  const t = await getTranslations({ locale, namespace: 'platform.dashboard' });
  const tOffers = await getTranslations({ locale, namespace: 'platform.offers' });
  const tOrders = await getTranslations({ locale, namespace: 'platform.orders' });
  const tListingStatus = await getTranslations({ locale, namespace: 'admin.listingStatus' });

  const [
    activityCounts,
    recentActivity,
    kycDocuments,
    sellerStats,
    buyerStats,
    salesVolume,
    recentOrders,
  ] = await Promise.all([
    getDashboardActivityCounts(profile.id),
    getDashboardRecentActivity(profile.id, 10),
    shouldShowKycBanner(profile.kyc_status) ? getUserKycDocuments(profile.id) : Promise.resolve([]),
    isSeller ? getSellerDashboardStats(profile.id) : Promise.resolve(null),
    !isSeller ? getBuyerDashboardStats(profile.id) : Promise.resolve(null),
    isSeller ? getSellerSalesVolumeByDay(profile.id) : Promise.resolve([]),
    getDashboardRecentOrders(profile.id, 8),
  ]);

  const isNewAccount = isNewDashboardAccount(activityCounts);
  const rejectedDocumentTypes = kycDocuments
    .filter((doc) => doc.status === 'rejected')
    .map((doc) => doc.type);

  const statKeys = getDashboardStatKeys(profile.role);
  const hasOrders = recentOrders.some((row) => row.kind === 'order');

  const statValues: Record<DashboardStatKey, string | number> = {
    activeListings: sellerStats?.activeListings ?? 0,
    pendingOffersReceived: sellerStats?.pendingOffersReceived ?? 0,
    ordersInProgress: isSeller
      ? (sellerStats?.ordersInProgress ?? 0)
      : (buyerStats?.ordersInProgress ?? 0),
    monthlyRevenue: sellerStats
      ? formatCurrency(sellerStats.monthlyRevenue, 'USD', locale)
      : formatCurrency(0, 'USD', locale),
    pendingOffersSent: buyerStats?.pendingOffersSent ?? 0,
    recentlyViewedListings: buyerStats?.recentlyViewedListings ?? 0,
  };

  const quickLinks = [
    { href: '/marketplace' as const, title: t('quickLinks.marketplace'), icon: Store },
    { href: '/offers' as const, title: t('quickLinks.offers'), icon: Tag },
    ...(isSeller
      ? [{ href: '/settings' as const, title: t('quickLinks.listings'), icon: ShoppingBag }]
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
    <Container>
      <div className="space-y-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
          {t('eyebrow')}
        </p>

        {shouldShowKycBanner(profile.kyc_status) ? (
          <KycStatusBanner
            locale={locale}
            kycStatus={profile.kyc_status}
            rejectedDocumentTypes={rejectedDocumentTypes}
          />
        ) : null}

        {isNewAccount ? (
          <DashboardWelcomePanel
            locale={locale}
            persona={persona}
            kycApproved={profile.kyc_status === 'approved'}
          />
        ) : (
          <div
            className={
              statKeys.length === 3
                ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3'
                : 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4'
            }
          >
            {statKeys.map((key) => (
              <DashboardStatCard
                key={key}
                label={t(`stats.${key}`)}
                value={
                  key === 'monthlyRevenue'
                    ? statValues[key]
                    : formatNumber(statValues[key] as number, locale)
                }
                icon={STAT_ICONS[key]}
              />
            ))}
          </div>
        )}

        {!isNewAccount ? (
          <>
            {isSeller ? <DashboardSalesChart data={salesVolume} /> : null}

            <DashboardRecentOrdersTable
              rows={recentOrders}
              locale={locale}
              hasOrders={hasOrders}
            />
          </>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('recentActivity')}</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-[15px] text-body">{t('noActivity')}</p>
              ) : (
                <ul className="space-y-4">
                  {recentActivity.map((event) => (
                    <li
                      key={event.id}
                      className="border-b border-border pb-4 last:border-b-0 last:pb-0"
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
                  <CardContent className="flex items-center gap-4 p-6">
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
    </Container>
  );
}
