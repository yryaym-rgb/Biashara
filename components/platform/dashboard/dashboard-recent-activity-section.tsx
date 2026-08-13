import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import type { DashboardRecentRow } from '@/lib/platform/queries';
import { DashboardRecentOrdersTable } from '@/components/platform/dashboard-recent-orders-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface DashboardRecentActivitySectionProps {
  rows: DashboardRecentRow[];
  hasOrders: boolean;
  locale: string;
}

export async function DashboardRecentActivitySection({
  rows,
  hasOrders,
  locale,
}: DashboardRecentActivitySectionProps) {
  const t = await getTranslations({ locale, namespace: 'platform.dashboard.recentActivitySection' });

  const viewAllHref = hasOrders ? '/orders' : '/offers';

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 pb-4">
        <CardTitle className="text-[18px]">{t('title')}</CardTitle>
        {rows.length > 0 ? (
          <Link
            href={viewAllHref}
            className="text-[13px] font-semibold text-brand-blue transition-colors hover:text-brand-blue-dark"
          >
            {t('viewAll')}
          </Link>
        ) : null}
      </CardHeader>
      <CardContent className="pt-0">
        {rows.length === 0 ? (
          <div className="flex flex-col items-start gap-6 rounded-button border border-border bg-bg-tint px-6 py-8 sm:px-8 sm:py-12">
            <p className="text-[15px] text-body">{t('empty')}</p>
            <Button asChild variant="secondary">
              <Link href="/marketplace">
                {t('exploreCta')}
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              </Link>
            </Button>
          </div>
        ) : (
          <DashboardRecentOrdersTable
            rows={rows}
            locale={locale}
            hasOrders={hasOrders}
            hideHeader
            bare
          />
        )}
      </CardContent>
    </Card>
  );
}
