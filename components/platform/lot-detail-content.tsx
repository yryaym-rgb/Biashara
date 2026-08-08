import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { LotCustodySection } from '@/components/platform/lot-custody-section';
import { formatDate, formatDateTime } from '@/lib/utils/dates';
import type { LotDetail } from '@/lib/platform/lots';
import type { MineralId } from '@/lib/constants/minerals';

export interface LotDetailContentProps {
  lot: LotDetail;
  canEdit: boolean;
  locale: string;
}

export async function LotDetailContent({ lot, canEdit, locale }: LotDetailContentProps) {
  const t = await getTranslations({ locale, namespace: 'platform.lots.detail' });
  const tMinerals = await getTranslations({ locale, namespace: 'minerals' });
  const tStages = await getTranslations({ locale, namespace: 'platform.lots.custody.stages' });

  const mineral = lot.mineral as MineralId | null;
  const site = lot.cooperative_site;

  return (
    <Container className="pb-16 md:pb-24">
      <div className="pt-8">
        <Button asChild variant="ghost" size="sm" className="mb-6 h-auto px-0 py-1">
          <Link href={canEdit ? '/lots' : '/marketplace'}>
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            {t('back')}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[34px] font-bold leading-tight text-ink">{lot.lot_code}</h1>
            {lot.current_stage ? (
              <Badge variant="info">{tStages(lot.current_stage)}</Badge>
            ) : null}
          </div>
          <p className="text-[13px] text-muted">{t('selfReportedNotice')}</p>
        </div>

        <dl className="grid gap-4 rounded-card border border-border p-6 sm:grid-cols-2">
          <div>
            <dt className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">
              {t('mineral')}
            </dt>
            <dd className="mt-1 text-[15px] text-body">
              {mineral ? tMinerals(mineral) : t('notProvided')}
            </dd>
          </div>
          <div>
            <dt className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">
              {t('initialWeight')}
            </dt>
            <dd className="mt-1 text-[15px] tabular-nums text-body">
              {lot.initial_weight_kg != null
                ? t('weightValue', { weight: lot.initial_weight_kg })
                : t('notProvided')}
            </dd>
          </div>
          <div>
            <dt className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">
              {t('extractionDate')}
            </dt>
            <dd className="mt-1 text-[15px] text-body">
              {lot.extraction_date
                ? formatDate(lot.extraction_date, locale)
                : t('notProvided')}
            </dd>
          </div>
          <div>
            <dt className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">
              {t('site')}
            </dt>
            <dd className="mt-1 text-[15px] text-body">
              {site
                ? t('siteValue', {
                    name: site.site_name,
                    zea: site.zea_reference,
                    province: site.province,
                  })
                : t('notProvided')}
            </dd>
          </div>
          <div>
            <dt className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">
              {t('createdAt')}
            </dt>
            <dd className="mt-1 text-[15px] text-body">
              {formatDateTime(lot.created_at, locale)}
            </dd>
          </div>
          {lot.listing_id ? (
            <div>
              <dt className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">
                {t('linkedListing')}
              </dt>
              <dd className="mt-1">
                <Link
                  href={`/marketplace/${lot.listing_id}`}
                  className="text-[15px] text-brand-blue underline-offset-2 hover:underline"
                >
                  {t('viewListing')}
                </Link>
              </dd>
            </div>
          ) : null}
        </dl>

        {lot.notes ? (
          <div>
            <h2 className="text-[18px] font-semibold text-ink">{t('notes')}</h2>
            <p className="mt-2 whitespace-pre-wrap text-[15px] text-body">{lot.notes}</p>
          </div>
        ) : null}

        <LotCustodySection
          lotId={lot.id}
          events={lot.custody_events}
          canEdit={canEdit}
          locale={locale}
        />
      </div>
    </Container>
  );
}
