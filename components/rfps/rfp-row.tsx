import { Calendar, MapPin } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui/button';
import { formatQuantityValue } from '@/lib/marketplace/format';
import { formatRfpTargetPriceRange } from '@/lib/rfps/queries';
import type { RfpRow } from '@/lib/rfps/queries';
import type { MineralId } from '@/lib/constants/minerals';
import { formatDate } from '@/lib/utils/dates';

export interface RfpRowCardProps {
  rfp: RfpRow;
  locale: string;
}

export async function RfpRowCard({ rfp, locale }: RfpRowCardProps) {
  const t = await getTranslations({ locale, namespace: 'platform.rfps' });
  const tMinerals = await getTranslations({ locale, namespace: 'minerals' });
  const tUnits = await getTranslations({ locale, namespace: 'units' });

  const mineral = rfp.mineral as MineralId;
  const quantityFormatted = formatQuantityValue(rfp.quantity, locale);
  const unitLabel = tUnits(rfp.unit);
  const priceRange = formatRfpTargetPriceRange(
    rfp.target_price_min,
    rfp.target_price_max,
    t('negotiable'),
  );
  const deadline = formatDate(rfp.deadline, locale);
  const buyerName = rfp.buyer?.company_name ?? t('buyerUnknown');

  return (
    <article className="flex flex-col gap-4 border-b border-border py-6 last:border-b-0 md:flex-row md:items-center md:gap-6">
      <div className="min-w-0 flex-1">
        <h3 className="text-[18px] font-semibold text-ink">{tMinerals(mineral)}</h3>
        <p className="mt-2 line-clamp-2 text-base text-body">{rfp.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4 shrink-0 text-brand-blue" strokeWidth={1.75} aria-hidden="true" />
            {buyerName}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4 shrink-0 text-brand-blue" strokeWidth={1.75} aria-hidden="true" />
            {t('deadlineLabel', { date: deadline })}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-start gap-3 md:items-end md:text-right">
        <p className="text-[13px] text-muted">
          {t('quantityRequested', { quantity: quantityFormatted, unit: unitLabel })}
        </p>
        <p className="text-[20px] font-bold tabular-nums text-ink">
          {priceRange}
        </p>
        <Button asChild variant="primary" size="sm">
          <Link href={`/rfps/${rfp.id}`}>{t('viewDetails')}</Link>
        </Button>
      </div>
    </article>
  );
}
