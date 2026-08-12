'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { BarChart3, Check, LineChart, Radio } from 'lucide-react';
import { MINERALS } from '@/lib/constants/minerals';
import { MINERAL_DOT_CLASS } from '@/lib/prices/mineral-dots';
import { fetchPricesClient } from '@/lib/prices/fetch-client';
import { formatPricePerUnit } from '@/lib/utils/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

const STALE_TIME_MS = 15 * 60 * 1000;
const HIGHLIGHT_KEYS = ['livePricing', 'historicalTrends', 'transparentSourcing'] as const;

export function PillarMarketDataPanel() {
  const t = useTranslations('marketing.landing.infrastructure.pillars.marketData');
  const tMinerals = useTranslations('minerals');
  const tUnits = useTranslations('units');
  const locale = useLocale();

  const { data, isLoading } = useQuery({
    queryKey: ['prices', 'live'],
    queryFn: fetchPricesClient,
    staleTime: STALE_TIME_MS,
    refetchOnWindowFocus: false,
  });

  const spotMinerals = MINERALS.filter((m) => m.hasSpotPrice).slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-3">
        {HIGHLIGHT_KEYS.map((key) => (
          <li key={key} className="flex items-start gap-3">
            <span
              className={cn(
                'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-button',
                'bg-[color-mix(in_srgb,var(--brand-gold)_12%,transparent)]',
              )}
            >
              <Check className="h-3.5 w-3.5 text-brand-blue" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="text-[15px] font-semibold text-ink">{t(`highlights.${key}.title`)}</p>
              <p className="text-[13px] leading-snug text-muted">
                {t(`highlights.${key}.description`)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="rounded-card border border-border bg-bg-tint p-4">
        <div className="mb-3 flex items-center gap-2">
          <Radio className="h-4 w-4 text-brand-blue" strokeWidth={1.75} aria-hidden="true" />
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">
            {t('liveSnapshotLabel')}
          </p>
        </div>
        {isLoading ? (
          <p className="text-[13px] text-muted">{t('loadingPrices')}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {spotMinerals.map((mineral) => {
              const entry = data?.minerals.find((m) => m.mineral === mineral.id);
              const unitLabel = tUnits(mineral.defaultUnit);

              return (
                <li
                  key={mineral.id}
                  className="flex items-center justify-between gap-4 py-2 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={cn('h-2 w-2 shrink-0 rounded-full', MINERAL_DOT_CLASS[mineral.id])}
                      aria-hidden="true"
                    />
                    <span className="truncate text-[13px] font-semibold text-ink">
                      {tMinerals(mineral.id)}
                    </span>
                  </div>
                  <span className="shrink-0 tabular-nums text-[13px] text-ink">
                    {entry?.price != null
                      ? formatPricePerUnit(entry.price, entry.currency, unitLabel, locale)
                      : t('indicative')}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-4 border-t border-border pt-3">
          <Button asChild variant="ghost" size="sm" className="h-auto px-0 py-1">
            <Link href="/prices">{t('viewPricesCta')}</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-card border border-dashed border-border bg-bg p-4 opacity-80">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-brand-blue" strokeWidth={1.75} aria-hidden="true" />
              <p className="text-[15px] font-semibold text-ink">{t('aiSoon.title')}</p>
            </div>
            <p className="text-[13px] leading-snug text-body">{t('aiSoon.description')}</p>
          </div>
          <Badge variant="warning">{t('aiSoon.badge')}</Badge>
        </div>
        <div
          className="mt-4 flex h-16 items-center justify-center rounded-card bg-bg-tint"
          aria-hidden="true"
        >
          <LineChart className="h-8 w-8 text-muted opacity-40" strokeWidth={1.75} />
        </div>
      </div>
    </div>
  );
}
