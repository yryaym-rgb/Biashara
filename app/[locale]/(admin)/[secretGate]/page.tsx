import { setRequestLocale, getTranslations } from 'next-intl/server';
import {
  ClipboardList,
  FileCheck,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { requireAdminPage } from '@/lib/admin/session';
import {
  getDashboardStats,
  getRecentAuditActivity,
  type DashboardStats,
} from '@/lib/admin/queries';
import {
  getAdminDashboardKpiMetrics,
  type AdminDashboardKpiKey,
  type AdminDashboardKpiMetric,
} from '@/lib/admin/dashboard-kpis';
import { safeQuery } from '@/lib/safe-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminMarketPulse } from '@/components/admin/admin-market-pulse';
import { AdminKpiGrid, type AdminKpiGridItem } from '@/components/admin/admin-kpi-grid';
import {
  adminAuditLogPath,
  adminKycReviewPath,
  adminListingsModerationPath,
  adminReportsPath,
  adminUsersPath,
} from '@/lib/admin/path';
import { formatRelativeTime } from '@/lib/utils/dates';
import { displayName } from '@/lib/admin/display';

const ZERO_DASHBOARD_STATS: DashboardStats = {
  pendingKycDocuments: 0,
  pendingListings: 0,
  verifiedUsers: 0,
  activeListings: 0,
  pendingUsers: 0,
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
  const tActivity = await getTranslations({ locale, namespace: 'admin.auditLog' });
  const tCommon = await getTranslations({ locale, namespace: 'admin.common' });

  const [stats, activity, kpiBundle] = await Promise.all([
    safeQuery('admin/dashboard/stats', () => getDashboardStats(), ZERO_DASHBOARD_STATS),
    safeQuery('admin/dashboard/activity', () => getRecentAuditActivity(10), []),
    safeQuery('admin/dashboard/kpis', () => getAdminDashboardKpiMetrics(), {
      metrics: ZERO_KPI_METRICS,
    }),
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

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('recentActivity')}</CardTitle>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <p className="text-[15px] text-body">{t('noActivity')}</p>
            ) : (
              <ul className="space-y-4">
                {activity.map((entry) => (
                  <li
                    key={entry.id}
                    className="border-b border-border pb-4 last:border-b-0 last:pb-0"
                  >
                    <p className="text-[15px] text-ink">
                      <span className="font-semibold">
                        {displayName(entry.actor_name, tCommon('unknownActor'))}
                      </span>{' '}
                      {tActivity(`actions.${entry.action}` as 'actions.insert')}{' '}
                      <span className="text-body">
                        {tActivity(`entities.${entry.entity}` as 'entities.listings')}
                      </span>
                    </p>
                    <p className="mt-1 text-[13px] text-muted">
                      {formatRelativeTime(entry.created_at, locale)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
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
    </div>
  );
}
