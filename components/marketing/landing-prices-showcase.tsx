'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations, useLocale } from 'next-intl';
import { MINERALS, type MineralId } from '@/lib/constants/minerals';
import { MINERAL_DOT_CLASS } from '@/lib/prices/mineral-dots';
import { fetchPricesClient } from '@/lib/prices/fetch-client';
import { formatPricePerUnit } from '@/lib/utils/format';
import { MineralPriceChart } from '@/components/marketing/mineral-price-chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from '@/lib/i18n/navigation';
import { cn } from '@/lib/utils/cn';

const STALE_TIME_MS = 15 * 60 * 1000;
const REFETCH_INTERVAL_MS = 15 * 60 * 1000;
const SHOWCASE_CHART_HEIGHT = 360;

function formatChangeLabel(change: number): string {
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

function getDeltaChipClass(change: number): string {
  return change >= 0
    ? 'bg-[color-mix(in_srgb,var(--market-live)_12%,transparent)] text-market-live'
    : 'bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-danger';
}

function MineralMiniCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-2.5 w-2.5 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-5 w-16" />
      </CardContent>
    </Card>
  );
}

interface MineralMiniCardProps {
  mineralId: MineralId;
  price: number | null;
  currency: string;
  unit: string;
  isIndicative: boolean;
  change?: number | null;
  isSelected: boolean;
  onSelect: () => void;
}

function MineralMiniCard({
  mineralId,
  price,
  currency,
  unit,
  isIndicative,
  change,
  isSelected,
  onSelect,
}: MineralMiniCardProps) {
  const t = useTranslations('marketing.landing.prices');
  const tMinerals = useTranslations('minerals');
  const tUnits = useTranslations('units');
  const locale = useLocale();

  const unitLabel = tUnits(unit as 'MT' | 'oz' | 'kg' | 'carat');
  const showChange = change !== undefined && change !== null;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className="group w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
    >
      <Card
        className={cn(
          'h-full motion-safe:transition-[box-shadow,transform] motion-safe:duration-150 motion-safe:ease-out',
          'group-hover:card-shadow-hover group-hover:-translate-y-0.5',
          isSelected && 'ring-2 ring-brand-blue ring-offset-2 ring-offset-bg-tint',
        )}
      >
        <CardContent className="flex flex-col gap-2 p-4">
          <div className="flex items-center gap-2">
            <span
              className={cn('h-2.5 w-2.5 shrink-0 rounded-full', MINERAL_DOT_CLASS[mineralId])}
              aria-hidden="true"
            />
            <span className="text-[15px] font-semibold text-ink">{tMinerals(mineralId)}</span>
          </div>

          {isIndicative || price === null ? (
            <p className="text-[13px] text-muted">{t('indicative')}</p>
          ) : (
            <>
              <p className="tabular-nums text-[28px] font-bold leading-tight text-ink">
                {formatPricePerUnit(price, currency, unitLabel, locale)}
              </p>
              {showChange ? (
                <span
                  className={cn(
                    'inline-flex w-fit items-center rounded-[6px] px-2 py-1 text-[12px] font-semibold tabular-nums',
                    getDeltaChipClass(change),
                  )}
                >
                  {formatChangeLabel(change)}
                </span>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </button>
  );
}

export function LandingPricesShowcase() {
  const t = useTranslations('marketing.landing.prices');
  const tMinerals = useTranslations('minerals');
  const [selectedMineral, setSelectedMineral] = React.useState<MineralId>('copper');

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['prices', 'live'],
    queryFn: fetchPricesClient,
    staleTime: STALE_TIME_MS,
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchOnWindowFocus: false,
  });

  const orderedMinerals = MINERALS.map((m) => m.id);

  return (
    <div className="flex flex-col gap-12 lg:gap-16">
      <div className="flex flex-col gap-6">
        <h3 className="text-[18px] font-semibold text-ink">{t('miniCardsTitle')}</h3>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {orderedMinerals.map((id) => (
              <MineralMiniCardSkeleton key={id} />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-card border border-border bg-bg px-6 py-12 text-center card-shadow">
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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {orderedMinerals.map((mineralId) => {
              const entry = data?.minerals.find((m) => m.mineral === mineralId);
              if (!entry) return null;

              return (
                <MineralMiniCard
                  key={mineralId}
                  mineralId={mineralId}
                  price={entry.price}
                  currency={entry.currency}
                  unit={entry.unit}
                  isIndicative={entry.isIndicative}
                  change={entry.change}
                  isSelected={selectedMineral === mineralId}
                  onSelect={() => setSelectedMineral(mineralId)}
                />
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h3 className="text-[18px] font-semibold text-ink">{t('trendSectionTitle')}</h3>
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
        </div>

        <MineralPriceChart
          key={selectedMineral}
          mineralId={selectedMineral}
          title={t('chartTitle', { mineral: tMinerals(selectedMineral) })}
          chartHeight={SHOWCASE_CHART_HEIGHT}
          translationNamespace="marketing.landing.prices"
        />
      </div>

      <div className="flex justify-center lg:justify-start">
        <Button asChild variant="ghost" className="h-auto px-0 py-1">
          <Link href="/prices">{t('viewAll')}</Link>
        </Button>
      </div>
    </div>
  );
}
