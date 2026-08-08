import { setRequestLocale, getTranslations } from 'next-intl/server';
import { requireAdminPage } from '@/lib/admin/session';
import { getAdminAlerts } from '@/lib/admin/alerts';
import {
  getPlatformDisputeRateTrend,
  getPlatformKycFunnel,
  getPlatformListingFunnel,
  getPlatformMineralDistribution,
  getPlatformTransactionVolume,
  getPlatformUserGrowth,
} from '@/lib/admin/reports-queries';
import { AdminAlertsCard } from '@/components/admin/admin-alerts-card';
import { AdminExportCenter } from '@/components/admin/admin-export-center';
import { AdminDisputeRateChart } from '@/components/admin/reports/dispute-rate-chart';
import { AdminFunnelChart } from '@/components/admin/reports/funnel-chart';
import { AdminMineralDistributionChart } from '@/components/admin/reports/mineral-distribution-chart';
import { AdminTransactionVolumeChart } from '@/components/admin/reports/transaction-volume-chart';
import { AdminUserGrowthChart } from '@/components/admin/reports/user-growth-chart';

export default async function AdminReportsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdminPage();

  const t = await getTranslations({ locale, namespace: 'admin.reports' });
  const tCharts = await getTranslations({ locale, namespace: 'admin.reports.charts' });

  const [
    alerts,
    dailyVolume,
    weeklyVolume,
    mineralDistribution,
    dailyUserGrowth,
    weeklyUserGrowth,
    kycFunnel,
    listingFunnel,
    dailyDisputeRate,
    weeklyDisputeRate,
  ] = await Promise.all([
    getAdminAlerts(),
    getPlatformTransactionVolume('daily'),
    getPlatformTransactionVolume('weekly'),
    getPlatformMineralDistribution(),
    getPlatformUserGrowth('daily'),
    getPlatformUserGrowth('weekly'),
    getPlatformKycFunnel(),
    getPlatformListingFunnel(),
    getPlatformDisputeRateTrend('daily'),
    getPlatformDisputeRateTrend('weekly'),
  ]);

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
          {t('eyebrow')}
        </p>
        <h1 className="mt-2">{t('title')}</h1>
        <p className="mt-2 text-[16px] text-body">{t('description')}</p>
      </div>

      <AdminAlertsCard items={alerts} locale={locale} />

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminTransactionVolumeChart dailyData={dailyVolume} weeklyData={weeklyVolume} />
        <AdminMineralDistributionChart segments={mineralDistribution} />
      </div>

      <AdminUserGrowthChart dailyData={dailyUserGrowth} weeklyData={weeklyUserGrowth} />

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminFunnelChart
          title={tCharts('kycFunnel.title')}
          segments={kycFunnel}
          statusNamespace="admin.kycStatus"
          emptyDescription={tCharts('kycFunnel.empty')}
        />
        <AdminFunnelChart
          title={tCharts('listingFunnel.title')}
          segments={listingFunnel}
          statusNamespace="admin.listingStatus"
          emptyDescription={tCharts('listingFunnel.empty')}
        />
      </div>

      <AdminDisputeRateChart dailyData={dailyDisputeRate} weeklyData={weeklyDisputeRate} />

      <AdminExportCenter />
    </div>
  );
}
