import { getTranslations } from 'next-intl/server';
import { DrcMiningMap } from '@/components/marketing/drc-mining-map';
import { getActiveListingCountsByProvince } from '@/lib/marketplace/queries';
import { getCooperativeCountsByProvince } from '@/lib/admin/dashboard-map';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface AdminDrcActivityPanelProps {
  listingCounts: Record<string, number>;
  cooperativeCounts: Record<string, number>;
  locale: string;
}

export async function AdminDrcActivityPanel({
  listingCounts,
  cooperativeCounts,
  locale,
}: AdminDrcActivityPanelProps) {
  const t = await getTranslations({ locale, namespace: 'admin.dashboard.drcMap' });

  return (
    <Card>
      <CardHeader className="pb-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
          {t('eyebrow')}
        </p>
        <CardTitle>{t('title')}</CardTitle>
        <p className="text-[14px] text-body">{t('subtitle')}</p>
      </CardHeader>
      <CardContent>
        <DrcMiningMap
          listingCounts={listingCounts}
          cooperativeCounts={cooperativeCounts}
          variant="light"
          mode="admin"
        />
      </CardContent>
    </Card>
  );
}

export async function fetchAdminDrcMapData() {
  const [listingCounts, cooperativeCounts] = await Promise.all([
    getActiveListingCountsByProvince(),
    getCooperativeCountsByProvince(),
  ]);

  return { listingCounts, cooperativeCounts };
}
