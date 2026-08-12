'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { MINERALS, type MineralId } from '@/lib/constants/minerals';
import { MINERAL_DOT_CLASS } from '@/lib/prices/mineral-dots';
import { fetchPricesClient } from '@/lib/prices/fetch-client';
import { formatPricePerUnit } from '@/lib/utils/format';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';

const STALE_TIME_MS = 15 * 60 * 1000;
const REFETCH_INTERVAL_MS = 15 * 60 * 1000;

function formatChangeBadge(change: number): string {
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

interface HeroPriceCellProps {
  mineralId: MineralId;
  price: number | null;
  currency: string;
  unitLabel: string;
  isIndicative: boolean;
  change?: number | null;
  isPulsing: boolean;
  onPulseEnd: () => void;
}

function HeroPriceCell({
  mineralId,
  price,
  currency,
  unitLabel,
  isIndicative,
  change,
  isPulsing,
  onPulseEnd,
}: HeroPriceCellProps) {
  const t = useTranslations('marketing.landing.prices');
  const tMinerals = useTranslations('minerals');
  const locale = useLocale();

  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-1 rounded-button px-3 py-3',
        'border border-[color-mix(in_srgb,var(--white)_10%,transparent)]',
        'bg-[color-mix(in_srgb,var(--brand-blue-dark)_35%,transparent)]',
        isPulsing && 'price-pulse',
      )}
      onAnimationEnd={() => {
        if (isPulsing) onPulseEnd();
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn('h-2 w-2 shrink-0 rounded-full', MINERAL_DOT_CLASS[mineralId])}
          aria-hidden="true"
        />
        <span className="truncate text-[13px] font-semibold uppercase tracking-[0.06em] text-white">
          {tMinerals(mineralId)}
        </span>
      </div>

      {isIndicative || price === null ? (
        <span className="text-[12px] text-[color-mix(in_srgb,var(--white)_72%,transparent)]">
          {t('indicative')}
        </span>
      ) : (
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="tabular-nums text-[18px] font-bold leading-none text-brand-gold min-[768px]:text-[20px]">
            {formatPricePerUnit(price, currency, unitLabel, locale)}
          </span>
          {change !== undefined && change !== null ? (
            <Badge variant={change >= 0 ? 'success' : 'danger'} className="tabular-nums">
              {formatChangeBadge(change)}
            </Badge>
          ) : null}
        </div>
      )}
    </div>
  );
}

function HeroPricesSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 min-[768px]:grid-cols-3 min-[1024px]:grid-cols-6">
      {MINERALS.map((mineral) => (
        <div
          key={mineral.id}
          className="skeleton-shimmer h-[72px] rounded-button border border-[color-mix(in_srgb,var(--white)_10%,transparent)]"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export function HeroLivePricesPanel() {
  const t = useTranslations('marketing.landing.heroLivePrices');
  const tUnits = useTranslations('units');
  const previousPricesRef = React.useRef<Record<string, number | null>>({});
  const isInitialLoadRef = React.useRef(true);
  const [pulsingMinerals, setPulsingMinerals] = React.useState<Set<MineralId>>(() => new Set());

  const { data, isLoading, isError, dataUpdatedAt } = useQuery({
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
    <div
      className={cn(
        'w-full rounded-card border border-[color-mix(in_srgb,var(--white)_14%,transparent)]',
        'bg-[color-mix(in_srgb,var(--brand-blue-dark)_82%,transparent)] p-4 backdrop-blur-md',
        'shadow-[0_8px_32px_rgba(14,42,71,0.28)] min-[768px]:p-5',
      )}
      role="region"
      aria-label={t('ariaLabel')}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="hero-live-dot" aria-hidden="true" />
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white">
            {t('label')}
          </p>
        </div>
        <Link
          href="/prices"
          className="text-[13px] font-semibold text-brand-gold hover:text-[color-mix(in_srgb,var(--brand-gold)_85%,white)] motion-safe:transition-colors motion-safe:duration-150"
        >
          {t('viewAll')}
        </Link>
      </div>

      {isLoading ? (
        <HeroPricesSkeleton />
      ) : isError ? (
        <p className="text-[14px] text-[color-mix(in_srgb,var(--white)_78%,transparent)]">
          {t('error')}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 min-[768px]:grid-cols-3 min-[1024px]:grid-cols-6">
          {orderedMinerals.map((mineralId) => {
            const entry = data?.minerals.find((m) => m.mineral === mineralId);
            const unit = entry?.unit ?? MINERALS.find((m) => m.id === mineralId)?.defaultUnit ?? 'MT';

            return (
              <HeroPriceCell
                key={mineralId}
                mineralId={mineralId}
                price={entry?.price ?? null}
                currency={entry?.currency ?? 'USD'}
                unitLabel={tUnits(unit as 'MT' | 'oz' | 'kg' | 'carat')}
                isIndicative={
                  entry?.isIndicative ?? (mineralId === 'coltan' || mineralId === 'diamond')
                }
                change={entry?.change}
                isPulsing={pulsingMinerals.has(mineralId)}
                onPulseEnd={() => handlePulseEnd(mineralId)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
