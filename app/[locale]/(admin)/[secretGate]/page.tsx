import { setRequestLocale, getTranslations } from 'next-intl/server';
import {
  ClipboardList,
  FileCheck,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { requireAdminPage } from '@/lib/admin/session';
import { getDashboardStats, type DashboardStats } from '@/lib/admin/queries';
import { getAdminLiveActivityFeed } from '@/lib/admin/dashboard-activity';
import { getAdminKycIntelligence } from '@/lib/admin/dashboard-kyc-intelligence';
import { getAdminModerationPreview } from '@/lib/admin/dashboard-moderation-preview';
import {
  getAdminDashboardKpiMetrics,
  type AdminDashboardKpiKey,
  type AdminDashboardKpiMetric,
} from '@/lib/admin/dashboard-kpis';
import { safeQuery } from '@/lib/safe-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminMarketPulse } from '@/components/admin/admin-market-pulse';
import { AdminKpiGrid, type AdminKpiGridItem } from '@/components/admin/admin-kpi-grid';
import { AdminLiveActivityPanel } from '@/components/admin/admin-live-activity-panel';
import { AdminKycIntelligencePanel } from '@/components/admin/admin-kyc-intelligence-panel';
import { AdminModerationPreviewPanel } from '@/components/admin/admin-moderation-preview-panel';
import {
  AdminDrcActivityPanel,
  fetchAdminDrcMapData,
} from '@/components/admin/admin-drc-activity-panel';
import { AdminEcosystemPanel } from '@/components/admin/admin-ecosystem-panel';
import { AdminPlatformHealthPanel } from '@/components/admin/admin-platform-health-panel';
import { getEcosystemCounts } from '@/lib/admin/dashboard-ecosystem';
import { checkPlatformHealth } from '@/lib/admin/platform-health';
import {
  adminAuditLogPath,
  adminKycReviewPath,
  adminListingsModerationPath,
  adminReportsPath,
  adminUsersPath,
} from '@/lib/admin/path';

const ZERO_DASHBOARD_STATS: DashboardStats = {
  pendingKycDocuments: 0,
  pendingListings: 0,
  verifiedUsers: 0,
  activeListings: 0,
  pendingUsers: 0,
};

const ZERO_ECOSYSTEM_COUNTS = {
  cooperative: 0,
  seller: 0,
  buyer: 0,
  institution: 0,
};

const ZERO_PLATFORM_HEALTH = {
  systems: [
    { key: 'api' as const, status: 'unavailable' as const },
    { key: 'database' as const, status: 'unavailable' as const },
    { key: 'auth' as const, status: 'unavailable' as const },
    { key: 'storage' as const, status: 'unavailable' as const },
  ],
  checkedAt: new Date(0).toISOString(),
};

const ZERO_KPI_METRICS: AdminDashboardKpiMetric[] = [
  { key: 'users', value: 0, trendPercent: null, sparkline: [], hasSparkline: false },
  { key: 'activeListings', value: 0, trendPercent: null, sparkline: [], hasSparkline: false },
  { key: 'pendingKyc', value: 0, trendPercent: null, sparkline: [], hasSparkline: false },
  { key: 'purchaseRequests', value: 0, trendPercent: null, sparkline: [], hasSparkline: false },
];

const KPI_ICONS: Record<AdminDashboardKpiKey, typeof Users> = {
  users: Users,
  activeListings: FileCheck,
  pendingKyc: ShieldCheck,
  purchaseRequests: ClipboardList,
};

const KPI_HREFS: Record<AdminDashboardKpiKey, string> = {
  users: adminUsersPath(),
  activeListings: adminListingsModerationPath(),
  pendingKyc: adminKycReviewPath(),
  purchaseRequests: adminReportsPath(),
};

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdminPage();

  const t = await getTranslations({ locale, namespace: 'admin.dashboard' });

  const [stats, liveActivity, kycIntelligence, moderationPreview, kpiBundle, drcMapData, ecosystemCounts, platformHealth] =
    await Promise.all([
    safeQuery('admin/dashboard/stats', () => getDashboardStats(), ZERO_DASHBOARD_STATS),
    safeQuery('admin/dashboard/live-activity', () => getAdminLiveActivityFeed(), []),
    safeQuery('admin/dashboard/kyc-intelligence', () => getAdminKycIntelligence(), {
      funnel: {
        pending: 0,
        needsReview: 0,
        verified: 0,
        rejected: 0,
        total: 0,
        verifiedPercent: 0,
      },
      oldestPending: [],
    }),
    safeQuery('admin/dashboard/moderation-preview', () => getAdminModerationPreview(), {
      pendingCount: 0,
      recentPending: [],
    }),
    safeQuery('admin/dashboard/kpis', () => getAdminDashboardKpiMetrics(), {
      metrics: ZERO_KPI_METRICS,
    }),
    safeQuery('admin/dashboard/drc-map', () => fetchAdminDrcMapData(), {
      listingCounts: {},
      cooperativeCounts: {},
    }),
    safeQuery('admin/dashboard/ecosystem', () => getEcosystemCounts(), ZERO_ECOSYSTEM_COUNTS),
    safeQuery('admin/dashboard/platform-health', () => checkPlatformHealth(), ZERO_PLATFORM_HEALTH),
  ]);

  const quickLinks = [
    {
      href: adminUsersPath(),
      title: t('quickLinks.users'),
      pending: stats.pendingUsers,
    },
    {
      href: adminKycReviewPath(),
      title: t('quickLinks.kycReview'),
      pending: stats.pendingKycDocuments,
    },
    {
      href: adminListingsModerationPath(),
      title: t('quickLinks.listingsModeration'),
      pending: stats.pendingListings,
    },
    {
      href: adminAuditLogPath(),
      title: t('quickLinks.auditLog'),
      pending: 0,
    },
  ];

  const kpiItems: AdminKpiGridItem[] = kpiBundle.metrics.map((metric) => ({
    key: metric.key,
    label: t(`stats.${metric.key}`),
    value: metric.value,
    icon: KPI_ICONS[metric.key],
    href: KPI_HREFS[metric.key],
    trendPercent: metric.trendPercent,
    sparkline: metric.sparkline,
    hasSparkline: metric.hasSparkline,
    sparklineAriaLabel: t('sparklineAria', { label: t(`stats.${metric.key}`) }),
    trendAriaLabel:
      metric.trendPercent !== null
        ? t('trendAria', {
            label: t(`stats.${metric.key}`),
            value: `${metric.trendPercent > 0 ? '+' : ''}${metric.trendPercent.toFixed(1)}%`,
          })
        : undefined,
  }));

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
          {t('eyebrow')}
        </p>
        <h1 className="mt-2">{t('title')}</h1>
      </div>

      <AdminMarketPulse reportsHref={adminReportsPath()} />

      <AdminKpiGrid items={kpiItems} locale={locale} />

      <AdminLiveActivityPanel events={liveActivity} locale={locale} />

      <div className="grid gap-8 lg:grid-cols-2">
        <AdminKycIntelligencePanel
          funnel={kycIntelligence.funnel}
          oldestPending={kycIntelligence.oldestPending}
          locale={locale}
        />
        <AdminModerationPreviewPanel preview={moderationPreview} locale={locale} />
      </div>

      <AdminDrcActivityPanel
        listingCounts={drcMapData.listingCounts}
        cooperativeCounts={drcMapData.cooperativeCounts}
        locale={locale}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <AdminEcosystemPanel counts={ecosystemCounts} locale={locale} />
        <AdminPlatformHealthPanel health={platformHealth} locale={locale} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href} className="block">
            <Card hoverable className="h-full">
              <CardContent className="flex items-center justify-between p-6">
                <span className="text-[18px] font-semibold text-ink">{link.title}</span>
                {link.pending > 0 ? (
                  <Badge variant="warning">{link.pending}</Badge>
                ) : null}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
