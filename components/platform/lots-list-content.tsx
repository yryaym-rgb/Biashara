import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { PackageSearch, AlertCircle } from 'lucide-react';
import type { LotListItem } from '@/lib/platform/lots.types';
import type { MineralId } from '@/lib/constants/minerals';

export interface LotsListContentProps {
  lots: LotListItem[];
  locale: string;
  loadError?: boolean;
}

export async function LotsListContent({ lots, locale, loadError = false }: LotsListContentProps) {
  const t = await getTranslations({ locale, namespace: 'platform.lots' });
  const tMinerals = await getTranslations({ locale, namespace: 'minerals' });
  const tStages = await getTranslations({ locale, namespace: 'platform.lots.custody.stages' });

  if (loadError) {
    return (
      <EmptyState
        icon={<AlertCircle className="h-5 w-5" strokeWidth={1.75} />}
        title={t('loadErrorTitle')}
        description={t('loadErrorDescription')}
      />
    );
  }

  if (lots.length === 0) {
    return (
      <EmptyState
        icon={<PackageSearch className="h-5 w-5" strokeWidth={1.75} />}
        title={t('emptyTitle')}
        description={t('emptyDescription')}
        action={
          <Button asChild variant="primary">
            <Link href="/lots/new">{t('createCta')}</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-card border border-border">
      <table className="min-w-full text-left">
        <thead className="bg-bg-tint">
          <tr>
            <th className="px-4 py-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">
              {t('table.code')}
            </th>
            <th className="px-4 py-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">
              {t('table.mineral')}
            </th>
            <th className="px-4 py-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">
              {t('table.stage')}
            </th>
            <th className="px-4 py-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">
              {t('table.checkpoints')}
            </th>
            <th className="px-4 py-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">
              {t('table.actions')}
            </th>
          </tr>
        </thead>
        <tbody>
          {lots.map((lot) => (
            <tr key={lot.id} className="border-t border-border">
              <td className="px-4 py-4 text-[15px] font-semibold text-ink">{lot.lot_code}</td>
              <td className="px-4 py-4 text-[15px] text-body">
                {lot.mineral ? tMinerals(lot.mineral as MineralId) : '—'}
              </td>
              <td className="px-4 py-4">
                {lot.current_stage ? (
                  <Badge variant="info">{tStages(lot.current_stage)}</Badge>
                ) : (
                  <span className="text-[15px] text-muted">—</span>
                )}
              </td>
              <td className="px-4 py-4 text-[15px] tabular-nums text-body">
                {lot.custody_event_count}
              </td>
              <td className="px-4 py-4">
                <Button asChild variant="primary" size="sm">
                  <Link href={`/lots/${lot.id}`}>{t('viewDetail')}</Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
