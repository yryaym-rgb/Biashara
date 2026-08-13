'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { fetchPricesClient } from '@/lib/prices/fetch-client';
import { MINERAL_DOT_CLASS } from '@/lib/prices/mineral-dots';
import {
  DASHBOARD_MARKET_PULSE_MINERALS,
  isMarketPulsePriceAvailable,
} from '@/lib/platform/dashboard/market-pulse';
import { formatPricePerUnit } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

const STALE_TIME_MS = 15 * 60 * 1000;
const REFETCH_INTERVAL_MS = 15 * 60 * 1000;

export function DashboardMarketPulse() {
  const locale = useLocale();
  const t = useTranslations('platform.dashboard.marketPulse');
  const tMinerals = useTranslations('minerals');
  const tUnits = useTranslations('units');

  const { data, isLoading } = useQuery({
    queryKey: ['prices', 'dashboard-market-pulse'],
    queryFn: fetchPricesClient,
    staleTime: STALE_TIME_MS,
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="rounded-card border border-border bg-bg p-6 card-shadow">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full bg-market-live ticker-live-dot"
            aria-hidden="true"
          />
          <h3 className="text-[18px] font-semibold text-ink">{t('title')}</h3>
        </div>
        <Link
          href="/prices"
          className="text-[13px] font-semibold text-brand-blue no-underline hover:text-brand-blue-dark"
        >
          {t('viewAll')}
        </Link>
      </div>

      {isLoading ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {DASHBOARD_MARKET_PULSE_MINERALS.map((mineralId) => (
            <li key={mineralId} className="rounded-button border border-border bg-bg-tint p-4">
              <span className="skeleton-shimmer block h-4 w-24 rounded" aria-hidden="true" />
              <span className="skeleton-shimmer mt-2 block h-6 w-32 rounded" aria-hidden="true" />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {DASHBOARD_MARKET_PULSE_MINERALS.map((mineralId) => {
            const entry = data?.minerals.find((row) => row.mineral === mineralId);
            const unit = entry?.unit ?? 'MT';
            const priceAvailable = isMarketPulsePriceAvailable(entry?.price);

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
                </div>
                {priceAvailable ? (
                  <p className="mt-2 tabular-nums text-[20px] font-bold text-ink">
                    {formatPricePerUnit(entry!.price!, entry!.currency, tUnits(unit), locale)}
                  </p>
                ) : (
                  <p className="mt-2 text-[15px] text-muted">{t('unavailable')}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
