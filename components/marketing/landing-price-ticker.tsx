'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations, useLocale } from 'next-intl';
import { MINERALS, type MineralId } from '@/lib/constants/minerals';
import { MINERAL_DOT_CLASS } from '@/lib/prices/mineral-dots';
import { fetchPricesClient } from '@/lib/prices/fetch-client';
import { formatPricePerUnit } from '@/lib/utils/format';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';

const STALE_TIME_MS = 15 * 60 * 1000;
const REFETCH_INTERVAL_MS = 15 * 60 * 1000;
const REDUCED_CYCLE_MS = 4000;

function formatChangeBadge(change: number): string {
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

interface TickerItemProps {
  mineralId: MineralId;
  price: number | null;
  currency: string;
  unitLabel: string;
  isIndicative: boolean;
  change?: number | null;
  locale: string;
}

function TickerItem({
  mineralId,
  price,
  currency,
  unitLabel,
  isIndicative,
  change,
  locale,
}: TickerItemProps) {
  const t = useTranslations('marketing.landing.prices');
  const tMinerals = useTranslations('minerals');

  return (
    <span className="inline-flex shrink-0 items-center gap-2 px-6 text-[13px]">
      <span
        className={cn('h-2 w-2 shrink-0 rounded-full', MINERAL_DOT_CLASS[mineralId])}
        aria-hidden="true"
      />
      <span className="font-semibold text-white">{tMinerals(mineralId)}</span>
      {isIndicative || price === null ? (
        <span className="text-[color:color-mix(in_srgb,var(--white)_70%,transparent)]">
          {t('indicative')}
        </span>
      ) : (
        <>
          <span className="tabular-nums font-semibold text-brand-gold">
            {formatPricePerUnit(price, currency, unitLabel, locale)}
          </span>
          {change !== undefined && change !== null ? (
            <Badge
              variant={change >= 0 ? 'success' : 'danger'}
              className="tabular-nums"
            >
              {formatChangeBadge(change)}
            </Badge>
          ) : null}
        </>
      )}
    </span>
  );
}

function TickerMarquee({
  items,
  locale,
}: {
  items: Array<{
    mineralId: MineralId;
    price: number | null;
    currency: string;
    unitLabel: string;
    isIndicative: boolean;
    change?: number | null;
  }>;
  locale: string;
}) {
  return (
    <div className="price-ticker-marquee group flex overflow-hidden">
      <div className="price-ticker-track flex shrink-0 items-center">
        {items.map((item) => (
          <TickerItem key={item.mineralId} {...item} locale={locale} />
        ))}
      </div>
      <div className="price-ticker-track flex shrink-0 items-center" aria-hidden="true">
        {items.map((item) => (
          <TickerItem key={`dup-${item.mineralId}`} {...item} locale={locale} />
        ))}
      </div>
    </div>
  );
}

function TickerReducedCycle({
  items,
  locale,
}: {
  items: Array<{
    mineralId: MineralId;
    price: number | null;
    currency: string;
    unitLabel: string;
    isIndicative: boolean;
    change?: number | null;
  }>;
  locale: string;
}) {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (items.length <= 1) return;

    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, REDUCED_CYCLE_MS);

    return () => window.clearInterval(interval);
  }, [items.length]);

  const item = items[index];
  if (!item) return null;

  return (
    <div className="flex h-10 items-center justify-center px-4">
      <TickerItem {...item} locale={locale} />
    </div>
  );
}

export function LandingPriceTicker() {
  const locale = useLocale();
  const t = useTranslations('marketing.landing.ticker');
  const tUnits = useTranslations('units');
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(media.matches);
    const handler = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['prices', 'live'],
    queryFn: fetchPricesClient,
    staleTime: STALE_TIME_MS,
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchOnWindowFocus: false,
  });

  const orderedMinerals = MINERALS.map((m) => m.id);

  const items = orderedMinerals.map((mineralId) => {
    const entry = data?.minerals.find((m) => m.mineral === mineralId);
    const unit = entry?.unit ?? MINERALS.find((m) => m.id === mineralId)?.defaultUnit ?? 'MT';
    return {
      mineralId,
      price: entry?.price ?? null,
      currency: entry?.currency ?? 'USD',
      unitLabel: tUnits(unit as 'MT' | 'oz' | 'kg' | 'carat'),
      isIndicative: entry?.isIndicative ?? (mineralId === 'coltan' || mineralId === 'diamond'),
      change: entry?.change,
    };
  });

  return (
    <div
      className="sticky top-0 z-[60] h-10 overflow-hidden bg-brand-blue-dark"
      role="region"
      aria-label={t('ariaLabel')}
    >
      {isLoading ? (
        <div className="flex h-10 items-center justify-center">
          <span className="skeleton-shimmer h-3 w-48 rounded" aria-hidden="true" />
        </div>
      ) : prefersReducedMotion ? (
        <TickerReducedCycle items={items} locale={locale} />
      ) : (
        <TickerMarquee items={items} locale={locale} />
      )}
    </div>
  );
}
