'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations, useLocale } from 'next-intl';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { MINERALS, type MineralId } from '@/lib/constants/minerals';
import { MINERAL_DOT_CLASS } from '@/lib/prices/mineral-dots';
import { fetchPricesClient } from '@/lib/prices/fetch-client';
import type { PriceHistoryResponse } from '@/lib/prices/types';
import { Link } from '@/lib/i18n/navigation';
import { formatPricePerUnit } from '@/lib/utils/format';
import { formatKinshasaTime } from '@/lib/utils/dates';
import { cn } from '@/lib/utils/cn';

const STALE_TIME_MS = 15 * 60 * 1000;
const REFETCH_INTERVAL_MS = 15 * 60 * 1000;
const TICKER_BAND_HEIGHT_PX = 44;
const SCROLL_THRESHOLD_PX = 8;
/** Reserved width for the fixed last-updated overlay (sm+). */
const TICKER_TIMESTAMP_OVERLAY_MIN_PX = 252;

/** One full marquee cycle — frozen at 40s (within the 35–45s spec). */
export const TICKER_MARQUEE_CYCLE_SECONDS = 40;

type TickerScrollState = {
  tickerVisible: boolean;
  prefersReducedMotion: boolean;
};

let tickerScrollState: TickerScrollState = {
  tickerVisible: true,
  prefersReducedMotion: false,
};

const tickerScrollSubscribers = new Set<() => void>();
let tickerScrollListenerAttached = false;

function setTickerScrollState(partial: Partial<TickerScrollState>) {
  tickerScrollState = { ...tickerScrollState, ...partial };
  tickerScrollSubscribers.forEach((notify) => notify());
}

function ensureTickerScrollListener() {
  if (tickerScrollListenerAttached || typeof window === 'undefined') {
    return;
  }

  tickerScrollListenerAttached = true;

  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const syncPreference = () => {
    const prefersReducedMotion = media.matches;
    setTickerScrollState({
      prefersReducedMotion,
      tickerVisible: prefersReducedMotion ? true : tickerScrollState.tickerVisible,
    });
  };

  syncPreference();
  media.addEventListener('change', syncPreference);

  let lastScrollY = window.scrollY;
  let ticking = false;

  function onScroll() {
    if (tickerScrollState.prefersReducedMotion) {
      return;
    }

    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY;
      let nextVisible = tickerScrollState.tickerVisible;

      if (currentY <= TICKER_BAND_HEIGHT_PX) {
        nextVisible = true;
      } else if (delta > SCROLL_THRESHOLD_PX) {
        nextVisible = false;
      } else if (delta < -SCROLL_THRESHOLD_PX) {
        nextVisible = true;
      }

      if (nextVisible !== tickerScrollState.tickerVisible) {
        setTickerScrollState({ tickerVisible: nextVisible });
      }

      lastScrollY = currentY;
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
}

function formatChangeLabel(change: number): string {
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

async function fetchPriceHistory(mineral: MineralId): Promise<PriceHistoryResponse> {
  const response = await fetch(`/api/prices?history=1&mineral=${mineral}`);
  if (!response.ok) {
    throw new Error('history_fetch_failed');
  }
  return response.json() as Promise<PriceHistoryResponse>;
}

/** Exported for unit tests — delta renders only when API provides a numeric change. */
export function shouldShowChange(change: number | null | undefined): boolean {
  return change !== undefined && change !== null;
}

/** Exported for unit tests — sparkline needs at least two real history points. */
export function shouldShowSparkline(historyLength: number): boolean {
  return historyLength >= 2;
}

/** Exported for unit tests — positive deltas use market-live, negative use danger. */
export function getDeltaColorClass(change: number): string {
  return change >= 0 ? 'text-market-live' : 'text-danger';
}

/** Exported for unit tests — deep-link href for each commodity block. */
export function getTickerMineralHref(mineralId: MineralId): `/prices?mineral=${MineralId}` {
  return `/prices?mineral=${mineralId}`;
}

/** Exported for unit tests — formats HH:MM in Africa/Kinshasa regardless of viewer timezone. */
export { formatKinshasaTime } from '@/lib/utils/dates';

/** Exported for unit tests — coltan/diamond never receive fabricated spot prices. */
export function isIndicativeTickerMineral(
  mineralId: MineralId,
  isIndicative?: boolean,
): boolean {
  if (isIndicative !== undefined) {
    return isIndicative;
  }
  return mineralId === 'coltan' || mineralId === 'diamond';
}

export function useTickerScrollVisibility() {
  const [, rerender] = React.useReducer((count: number) => count + 1, 0);

  React.useEffect(() => {
    ensureTickerScrollListener();
    tickerScrollSubscribers.add(rerender);
    return () => {
      tickerScrollSubscribers.delete(rerender);
    };
  }, []);

  return {
    tickerVisible: tickerScrollState.prefersReducedMotion
      ? true
      : tickerScrollState.tickerVisible,
    prefersReducedMotion: tickerScrollState.prefersReducedMotion,
  };
}

interface TickerItemData {
  mineralId: MineralId;
  price: number | null;
  currency: string;
  unitLabel: string;
  isIndicative: boolean;
  change?: number | null;
}

interface TickerItemProps extends TickerItemData {
  locale: string;
}

function TickerSparkline({
  mineralId,
  enabled,
}: {
  mineralId: MineralId;
  enabled: boolean;
}) {
  const { data } = useQuery({
    queryKey: ['prices', 'history', mineralId, 'ticker'],
    queryFn: () => fetchPriceHistory(mineralId),
    staleTime: STALE_TIME_MS,
    enabled,
  });

  const history = data?.history ?? [];
  if (!shouldShowSparkline(history.length)) {
    return null;
  }

  return (
    <div className="mt-3 h-12 w-full" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history}>
          <Line
            type="monotone"
            dataKey="price"
            stroke="var(--brand-gold)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function TickerHoverCard({
  mineralId,
  price,
  currency,
  unitLabel,
  change,
  locale,
}: {
  mineralId: MineralId;
  price: number;
  currency: string;
  unitLabel: string;
  change?: number | null;
  locale: string;
}) {
  const t = useTranslations('marketing.landing.ticker');
  const tMinerals = useTranslations('minerals');

  return (
    <div
      className={cn(
        'pointer-events-none absolute bottom-full left-1/2 z-[70] mb-2 hidden w-56 -translate-x-1/2 md:block',
        'rounded-card border border-border bg-bg p-4 card-shadow',
      )}
    >
      <p className="text-[13px] font-semibold text-ink">{tMinerals(mineralId)}</p>
      <p className="mt-1 tabular-nums text-[18px] font-semibold text-ink">
        {formatPricePerUnit(price, currency, unitLabel, locale)}
      </p>
      {shouldShowChange(change) ? (
        <p
          className={cn(
            'mt-1 text-[13px] font-semibold tabular-nums',
            getDeltaColorClass(change as number),
          )}
        >
          {formatChangeLabel(change as number)}{' '}
          {(change as number) >= 0 ? '▲' : '▼'}
        </p>
      ) : null}
      <TickerSparkline mineralId={mineralId} enabled />
      <span className="mt-3 inline-block text-[13px] font-semibold text-brand-blue">
        {t('viewQuote')}
      </span>
    </div>
  );
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
  const t = useTranslations('marketing.landing.ticker');
  const tMinerals = useTranslations('minerals');
  const showChange = shouldShowChange(change);
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Link
      href={getTickerMineralHref(mineralId)}
      className={cn(
        'group relative inline-flex shrink-0 items-center gap-2 px-5 text-[13px] no-underline',
        'min-w-[132px]',
        'text-white hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold',
      )}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
    >
      {isOpen && !isIndicative && price !== null ? (
        <TickerHoverCard
          mineralId={mineralId}
          price={price}
          currency={currency}
          unitLabel={unitLabel}
          change={change}
          locale={locale}
        />
      ) : null}

      <span
        className={cn('h-2 w-2 shrink-0 rounded-full', MINERAL_DOT_CLASS[mineralId])}
        aria-hidden="true"
      />
      <span className="font-semibold uppercase tracking-[0.04em]">
        {tMinerals(mineralId)}
      </span>

      {isIndicative || price === null ? (
        <span
          className="rounded-[4px] bg-[color:color-mix(in_srgb,var(--ink)_40%,transparent)] px-1 py-px text-[9px] font-medium uppercase tracking-[0.04em] text-[color:color-mix(in_srgb,var(--white)_50%,transparent)]"
          title={t('indicativeLegend')}
        >
          {t('indicativeShort')}
        </span>
      ) : (
        <>
          <span className="text-[14px] font-semibold tabular-nums text-brand-gold">
            {formatPricePerUnit(price, currency, unitLabel, locale)}
          </span>
          {showChange ? (
            <span
              className={cn(
                'text-[11px] font-medium tabular-nums',
                getDeltaColorClass(change as number),
              )}
            >
              {formatChangeLabel(change as number)} {(change as number) >= 0 ? '▲' : '▼'}
            </span>
          ) : null}
        </>
      )}
    </Link>
  );
}

function TickerMarquee({
  items,
  locale,
}: {
  items: TickerItemData[];
  locale: string;
}) {
  return (
    <div className="price-ticker-marquee group min-w-0 flex-1 overflow-hidden">
      <div className="price-ticker-track flex w-max items-center">
        <div className="flex shrink-0 items-center">
          {items.map((item) => (
            <TickerItem key={item.mineralId} {...item} locale={locale} />
          ))}
        </div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {items.map((item) => (
            <TickerItem key={`dup-${item.mineralId}`} {...item} locale={locale} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TickerStaticRow({
  items,
  locale,
}: {
  items: TickerItemData[];
  locale: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center overflow-x-auto">
      {items.map((item) => (
        <TickerItem key={item.mineralId} {...item} locale={locale} />
      ))}
    </div>
  );
}

export function LandingPriceTicker() {
  const locale = useLocale();
  const t = useTranslations('marketing.landing.ticker');
  const tUnits = useTranslations('units');
  const { tickerVisible, prefersReducedMotion } = useTickerScrollVisibility();

  const { data, isLoading, dataUpdatedAt } = useQuery({
    queryKey: ['prices', 'live'],
    queryFn: fetchPricesClient,
    staleTime: STALE_TIME_MS,
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchOnWindowFocus: false,
  });

  const orderedMinerals = MINERALS.map((m) => m.id);

  const items: TickerItemData[] = orderedMinerals.map((mineralId) => {
    const entry = data?.minerals.find((m) => m.mineral === mineralId);
    const unit = entry?.unit ?? MINERALS.find((m) => m.id === mineralId)?.defaultUnit ?? 'MT';
    return {
      mineralId,
      price: entry?.price ?? null,
      currency: entry?.currency ?? 'USD',
      unitLabel: tUnits(unit as 'MT' | 'oz' | 'kg' | 'carat'),
      isIndicative: isIndicativeTickerMineral(mineralId, entry?.isIndicative),
      change: entry?.change,
    };
  });

  const lastUpdatedIso = data?.cachedAt ?? (dataUpdatedAt ? new Date(dataUpdatedAt).toISOString() : null);
  const lastUpdatedLabel =
    lastUpdatedIso !== null ? formatKinshasaTime(lastUpdatedIso, locale) : null;
  const hasIndicativeItems = items.some((item) => item.isIndicative);

  return (
    <div
      className="relative z-[60] shrink-0"
      style={{ height: TICKER_BAND_HEIGHT_PX }}
      aria-hidden={!tickerVisible}
    >
      <div
        className={cn(
          'fixed left-0 right-0 top-0 z-[60] bg-brand-blue-dark',
          'motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out',
          !tickerVisible && 'motion-safe:-translate-y-full',
        )}
        role="region"
        aria-label={t('ariaLabel')}
      >
        <div className="relative" style={{ height: TICKER_BAND_HEIGHT_PX }}>
          <div
            className="mx-auto flex h-full max-w-content items-center gap-4 px-4 md:gap-5 md:px-6 sm:pr-[var(--ticker-timestamp-overlay-min)]"
            style={
              {
                '--ticker-timestamp-overlay-min': `${TICKER_TIMESTAMP_OVERLAY_MIN_PX}px`,
              } as React.CSSProperties
            }
          >
            <div className="flex shrink-0 items-center gap-2.5 pr-1">
              <span
                className={cn(
                  'h-2 w-2 rounded-full bg-market-live',
                  !prefersReducedMotion && 'ticker-live-dot',
                )}
                aria-hidden="true"
              />
              <span className="whitespace-nowrap text-[13px] font-bold uppercase tracking-[0.14em] text-white">
                {t('liveLabel')}
              </span>
            </div>

            <div
              className="hidden h-5 w-px shrink-0 bg-[color:color-mix(in_srgb,var(--white)_28%,transparent)] sm:block"
              aria-hidden="true"
            />

            {isLoading ? (
              <div className="flex min-w-0 flex-1 items-center justify-center">
                <span className="skeleton-shimmer h-3 w-48 rounded" aria-hidden="true" />
              </div>
            ) : prefersReducedMotion ? (
              <TickerStaticRow items={items} locale={locale} />
            ) : (
              <TickerMarquee items={items} locale={locale} />
            )}
          </div>

          <div
            className={cn(
              'absolute right-0 top-0 z-10 hidden h-full min-w-[var(--ticker-timestamp-overlay-min)] items-center sm:flex',
              'bg-[linear-gradient(to_right,color-mix(in_srgb,var(--brand-blue-dark)_0%,transparent),var(--brand-blue-dark)_40px,var(--brand-blue-dark))]',
              'pl-8 pr-4 md:pr-6',
            )}
            style={
              {
                '--ticker-timestamp-overlay-min': `${TICKER_TIMESTAMP_OVERLAY_MIN_PX}px`,
              } as React.CSSProperties
            }
          >
            <div className="flex flex-col items-end gap-0.5">
              {lastUpdatedLabel ? (
                <p className="whitespace-nowrap text-[10px] leading-none text-[color:color-mix(in_srgb,var(--white)_45%,transparent)]">
                  {t('lastUpdated', { time: lastUpdatedLabel })}
                </p>
              ) : null}
              {hasIndicativeItems ? (
                <p
                  className="whitespace-nowrap text-[10px] leading-none text-[color:color-mix(in_srgb,var(--white)_40%,transparent)]"
                  title={t('indicativeLegend')}
                >
                  {t('indicativeLegend')}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
