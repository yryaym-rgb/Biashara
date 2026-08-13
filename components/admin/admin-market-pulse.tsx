'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { fetchPricesClient } from '@/lib/prices/fetch-client';
import { MINERAL_DOT_CLASS } from '@/lib/prices/mineral-dots';
import { ADMIN_MARKET_PULSE_MINERALS } from '@/lib/admin/market-pulse';
import {
  getDeltaColorClass,
  isIndicativeTickerMineral,
  shouldShowChange,
} from '@/components/marketing/landing-price-ticker';
import { formatPricePerUnit } from '@/lib/utils/format';
import { formatKinshasaTime } from '@/lib/utils/dates';
import { cn } from '@/lib/utils/cn';

const STALE_TIME_MS = 15 * 60 * 1000;
const REFETCH_INTERVAL_MS = 15 * 60 * 1000;

function formatChangeLabel(change: number): string {
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

export interface AdminMarketPulseProps {
  reportsHref: string;
}

export function AdminMarketPulse({ reportsHref }: AdminMarketPulseProps) {
  const locale = useLocale();
  const t = useTranslations('admin.dashboard.marketPulse');
  const tTicker = useTranslations('marketing.landing.ticker');
  const tMinerals = useTranslations('minerals');
  const tUnits = useTranslations('units');

  const { data, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ['prices', 'admin-market-pulse'],
    queryFn: fetchPricesClient,
    staleTime: STALE_TIME_MS,
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchOnWindowFocus: false,
  });

  const lastUpdatedIso =
    data?.cachedAt ?? (dataUpdatedAt ? new Date(dataUpdatedAt).toISOString() : null);
  const lastUpdatedLabel =
    lastUpdatedIso !== null ? formatKinshasaTime(lastUpdatedIso, locale) : null;

  return (
    <section
      className="rounded-card border border-border bg-bg p-6 card-shadow"
      aria-label={t('eyebrow')}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="h-2 w-2 rounded-full bg-market-live ticker-live-dot"
            aria-hidden="true"
          />
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
            {t('eyebrow')}
          </p>
        </div>
          {lastUpdatedLabel ? (
            <p className="mt-2 text-[13px] text-muted">
              {t('lastUpdated', { time: lastUpdatedLabel })}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/prices"
            className="text-[13px] font-semibold text-brand-blue no-underline hover:text-brand-blue-dark"
          >
            {t('viewPrices')}
          </Link>
          <Link
            href={reportsHref}
            className="text-[13px] font-semibold text-brand-blue no-underline hover:text-brand-blue-dark"
          >
            {t('viewReports')}
          </Link>
        </div>
      </div>

      {isLoading ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ADMIN_MARKET_PULSE_MINERALS.map((mineralId) => (
            <li
              key={mineralId}
              className="rounded-button border border-border bg-bg-tint p-4"
            >
              <span className="skeleton-shimmer block h-4 w-24 rounded" aria-hidden="true" />
              <span className="skeleton-shimmer mt-2 block h-6 w-32 rounded" aria-hidden="true" />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ADMIN_MARKET_PULSE_MINERALS.map((mineralId) => {
            const entry = data?.minerals.find((row) => row.mineral === mineralId);
            const unit = entry?.unit ?? 'MT';
            const isIndicative = isIndicativeTickerMineral(mineralId, entry?.isIndicative);
            const price = entry?.price ?? null;
            const showChange = shouldShowChange(entry?.change);

            return (
              <li
                key={mineralId}
                className="rounded-button border border-border bg-bg-tint p-4"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn('h-2 w-2 shrink-0 rounded-full', MINERAL_DOT_CLASS[mineralId])}
                    aria-hidden="true"
                  />
                  <span className="text-[13px] font-semibold text-ink">
                    {tMinerals(mineralId)}
                  </span>
                  {isIndicative ? (
                    <span
                      className="rounded-[4px] bg-[color-mix(in_srgb,var(--ink)_12%,transparent)] px-1.5 py-px text-[9px] font-semibold uppercase tracking-[0.04em] text-muted"
                      title={tTicker('indicativeLegend')}
                    >
                      {tTicker('indicativeShort')}
                    </span>
                  ) : null}
                </div>

                {isIndicative ? (
                  <p className="mt-2 text-[13px] text-muted">{tTicker('indicative')}</p>
                ) : price === null ? (
                  <p className="mt-2 text-[15px] text-muted">{t('unavailable')}</p>
                ) : (
                  <div className="mt-2 flex flex-wrap items-baseline gap-2">
                    <p className="tabular-nums text-[20px] font-bold text-ink">
                      {formatPricePerUnit(
                        price,
                        entry?.currency ?? 'USD',
                        tUnits(unit),
                        locale,
                      )}
                    </p>
                    {showChange ? (
                      <span
                        className={cn(
                          'text-[12px] font-semibold tabular-nums',
                          getDeltaColorClass(entry!.change as number),
                        )}
                      >
                        {formatChangeLabel(entry!.change as number)}
                      </span>
                    ) : null}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
