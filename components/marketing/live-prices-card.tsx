'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { MINERALS, type MineralId } from '@/lib/constants/minerals';
import { MINERAL_DOT_CLASS } from '@/lib/prices/mineral-dots';
import { fetchPricesClient } from '@/lib/prices/fetch-client';
import { formatPricePerUnit } from '@/lib/utils/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils/cn';

const STALE_TIME_MS = 15 * 60 * 1000;
const REFETCH_INTERVAL_MS = 15 * 60 * 1000;
const ROW_HEIGHT_CLASS = 'h-12';

function formatChangeBadge(change: number): string {
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

function PriceRowSkeleton() {
  return (
    <div className={cn('flex items-center justify-between gap-4', ROW_HEIGHT_CLASS)}>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Skeleton className="h-2.5 w-2.5 shrink-0 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-5 w-28" />
    </div>
  );
}

interface PriceRowProps {
  mineralId: MineralId;
  price: number | null;
  currency: string;
  unit: string;
  isIndicative: boolean;
  change?: number | null;
  isPulsing: boolean;
  onPulseEnd: () => void;
}

function PriceRow({
  mineralId,
  price,
  currency,
  unit,
  isIndicative,
  change,
  isPulsing,
  onPulseEnd,
}: PriceRowProps) {
  const t = useTranslations('marketing.landing.prices');
  const tMinerals = useTranslations('minerals');
  const tUnits = useTranslations('units');
  const locale = useLocale();

  const unitLabel = tUnits(unit as 'MT' | 'oz' | 'kg' | 'carat');

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-button px-2 -mx-2',
        ROW_HEIGHT_CLASS,
        isPulsing && 'price-pulse',
      )}
      onAnimationEnd={() => {
        if (isPulsing) onPulseEnd();
      }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span
          className={cn('h-2.5 w-2.5 shrink-0 rounded-full', MINERAL_DOT_CLASS[mineralId])}
          aria-hidden="true"
        />
        <span className="truncate text-[15px] font-semibold text-ink">
          {tMinerals(mineralId)}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isIndicative || price === null ? (
          <span className="text-[13px] text-muted">{t('indicative')}</span>
        ) : (
          <>
            <span className="tabular-nums text-[15px] text-ink">
              {formatPricePerUnit(price, currency, unitLabel, locale)}
            </span>
            {change !== undefined && change !== null ? (
              <Badge variant={change >= 0 ? 'success' : 'danger'}>
                {formatChangeBadge(change)}
              </Badge>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

export function LivePricesCard() {
  const t = useTranslations('marketing.landing.prices');
  const previousPricesRef = React.useRef<Record<string, number | null>>({});
  const isInitialLoadRef = React.useRef(true);
  const [pulsingMinerals, setPulsingMinerals] = React.useState<Set<MineralId>>(
    () => new Set(),
  );

  const { data, isLoading, isError, refetch, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ['prices', 'live'],
    queryFn: fetchPricesClient,
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
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-[18px] font-semibold text-ink">
          {t('liveCardTitle')}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-0 pt-0">
        {isLoading ? (
          <div className="flex flex-col divide-y divide-border">
            {orderedMinerals.map((id) => (
              <PriceRowSkeleton key={id} />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8 text-center">
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
          <div className="flex flex-col divide-y divide-border">
            {orderedMinerals.map((mineralId) => {
              const entry = data?.minerals.find((m) => m.mineral === mineralId);
              if (!entry) return null;

              return (
                <PriceRow
                  key={mineralId}
                  mineralId={mineralId}
                  price={entry.price}
                  currency={entry.currency}
                  unit={entry.unit}
                  isIndicative={entry.isIndicative}
                  change={entry.change}
                  isPulsing={pulsingMinerals.has(mineralId)}
                  onPulseEnd={() => handlePulseEnd(mineralId)}
                />
              );
            })}
          </div>
        )}

        <div className="mt-6 border-t border-border pt-4">
          <Button asChild variant="ghost" size="sm" className="h-auto px-0 py-1">
            <Link href="/prices">{t('viewAll')}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
