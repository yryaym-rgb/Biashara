'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations, useLocale } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { MINERALS, type MineralId } from '@/lib/constants/minerals';
import { MINERAL_DOT_CLASS } from '@/lib/prices/mineral-dots';
import type { PricesResponse } from '@/lib/prices/types';
import { formatPricePerUnit } from '@/lib/utils/format';
import { formatRelativeTime } from '@/lib/utils/dates';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MineralPriceChart } from '@/components/marketing/mineral-price-chart';
import { cn } from '@/lib/utils/cn';

const STALE_TIME_MS = 15 * 60 * 1000;
const REFETCH_INTERVAL_MS = 15 * 60 * 1000;

async function fetchPrices(): Promise<PricesResponse> {
  const response = await fetch('/api/prices');
  if (!response.ok) {
    throw new Error('prices_fetch_failed');
  }
  return response.json() as Promise<PricesResponse>;
}

function formatChangeBadge(change: number): string {
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

function TableRowSkeleton() {
  return (
    <tr className="border-b border-border">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-2.5 w-2.5 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </td>
      <td className="px-4 py-4">
        <Skeleton className="ml-auto h-5 w-28" />
      </td>
      <td className="hidden px-4 py-4 sm:table-cell">
        <Skeleton className="h-5 w-16" />
      </td>
      <td className="hidden px-4 py-4 md:table-cell">
        <Skeleton className="h-4 w-20" />
      </td>
    </tr>
  );
}

export function PricesPageContent() {
  const t = useTranslations('marketing.prices');
  const tMinerals = useTranslations('minerals');
  const tUnits = useTranslations('units');
  const locale = useLocale();
  const [selectedMineral, setSelectedMineral] = React.useState<MineralId>('copper');
  const previousPricesRef = React.useRef<Record<string, number | null>>({});
  const isInitialLoadRef = React.useRef(true);
  const [pulsingMinerals, setPulsingMinerals] = React.useState<Set<MineralId>>(
    () => new Set(),
  );

  const { data, isLoading, isError, refetch, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ['prices', 'live'],
    queryFn: fetchPrices,
    staleTime: STALE_TIME_MS,
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchOnWindowFocus: false,
  });

  React.useEffect(() => {
    if (!data?.minerals) return;

    if (isInitialLoadRef.current) {
      for (const entry of data.minerals) {
        previousPricesRef.current[entry.mineral] = entry.price;
      }
      isInitialLoadRef.current = false;
      return;
    }

    const changed: MineralId[] = [];
    for (const entry of data.minerals) {
      const prev = previousPricesRef.current[entry.mineral];
      if (prev !== entry.price && entry.price !== null) {
        changed.push(entry.mineral);
      }
      previousPricesRef.current[entry.mineral] = entry.price;
    }

    if (changed.length > 0) {
      setPulsingMinerals(new Set(changed));
    }
  }, [dataUpdatedAt, data]);

  const handlePulseEnd = React.useCallback((mineralId: MineralId) => {
    setPulsingMinerals((current) => {
      const next = new Set(current);
      next.delete(mineralId);
      return next;
    });
  }, []);

  const orderedMinerals = MINERALS.map((m) => m.id);

  return (
    <div className="flex flex-col gap-12">
      <div className="overflow-hidden rounded-card border border-border bg-bg card-shadow">
        {isError ? (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <p className="text-[15px] text-body">{t('error')}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void refetch()}
              loading={isFetching}
            >
              {t('retry')}
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse">
              <thead>
                <tr className="bg-bg-tint">
                  <th className="px-4 py-3 text-left text-[13px] font-semibold uppercase tracking-wide text-muted">
                    {t('table.mineral')}
                  </th>
                  <th className="px-4 py-3 text-right text-[13px] font-semibold uppercase tracking-wide text-muted">
                    {t('table.price')}
                  </th>
                  <th className="hidden px-4 py-3 text-right text-[13px] font-semibold uppercase tracking-wide text-muted sm:table-cell">
                    {t('table.change')}
                  </th>
                  <th className="hidden px-4 py-3 text-right text-[13px] font-semibold uppercase tracking-wide text-muted md:table-cell">
                    {t('table.updated')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? orderedMinerals.map((id) => <TableRowSkeleton key={id} />)
                  : orderedMinerals.map((mineralId) => {
                      const entry = data?.minerals.find((m) => m.mineral === mineralId);
                      if (!entry) return null;

                      const unitLabel = tUnits(
                        entry.unit as 'MT' | 'oz' | 'kg' | 'carat',
                      );
                      const isSelected = selectedMineral === mineralId;
                      const isPulsing = pulsingMinerals.has(mineralId);

                      return (
                        <tr
                          key={mineralId}
                          className={cn(
                            'cursor-pointer border-b border-border last:border-b-0 motion-safe:transition-colors motion-safe:duration-150',
                            isSelected && 'bg-bg-tint',
                            isPulsing && 'price-pulse',
                          )}
                          onClick={() => setSelectedMineral(mineralId)}
                          onAnimationEnd={() => {
                            if (isPulsing) handlePulseEnd(mineralId);
                          }}
                          aria-selected={isSelected}
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <span
                                className={cn(
                                  'h-2.5 w-2.5 shrink-0 rounded-full',
                                  MINERAL_DOT_CLASS[mineralId],
                                )}
                                aria-hidden="true"
                              />
                              <span className="text-[15px] font-semibold text-ink">
                                {tMinerals(mineralId)}
                              </span>
                              {isSelected ? (
                                <ChevronDown
                                  className="h-4 w-4 text-brand-blue"
                                  strokeWidth={1.75}
                                  aria-hidden="true"
                                />
                              ) : null}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            {entry.isIndicative || entry.price === null ? (
                              <span className="text-[13px] text-muted">{t('indicative')}</span>
                            ) : (
                              <span className="tabular-nums text-[15px] font-semibold text-ink">
                                {formatPricePerUnit(
                                  entry.price,
                                  entry.currency,
                                  unitLabel,
                                  locale,
                                )}
                              </span>
                            )}
                          </td>
                          <td className="hidden px-4 py-4 text-right sm:table-cell">
                            {entry.change !== undefined && entry.change !== null ? (
                              <Badge variant={entry.change >= 0 ? 'success' : 'danger'}>
                                {formatChangeBadge(entry.change)}
                              </Badge>
                            ) : (
                              <span className="text-[13px] text-muted">—</span>
                            )}
                          </td>
                          <td className="hidden px-4 py-4 text-right md:table-cell">
                            <span className="text-[13px] text-muted">
                              {formatRelativeTime(entry.fetchedAt, locale)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <Tabs
          value={selectedMineral}
          onValueChange={(value) => setSelectedMineral(value as MineralId)}
        >
          <TabsList className="gap-4">
            {orderedMinerals.map((mineralId) => (
              <TabsTrigger key={mineralId} value={mineralId} className="text-[13px]">
                {tMinerals(mineralId)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <MineralPriceChart
          key={selectedMineral}
          mineralId={selectedMineral}
          title={t('chartTitle', { mineral: tMinerals(selectedMineral) })}
          translationNamespace="marketing.prices"
        />
      </div>
    </div>
  );
}
