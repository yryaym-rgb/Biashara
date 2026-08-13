'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations, useLocale } from 'next-intl';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { LineChart as LineChartIcon } from 'lucide-react';
import type { MineralId } from '@/lib/constants/minerals';
import { getMineralById } from '@/lib/constants/minerals';
import type { PriceHistoryResponse } from '@/lib/prices/types';
import { PRICE_TIMEFRAME_DAYS } from '@/lib/prices/types';
import { formatPricePerUnit, resolveIntlLocale } from '@/lib/utils/format';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useChartReady } from '@/lib/hooks/use-chart-ready';

const STALE_TIME_MS = 15 * 60 * 1000;
const CHART_HEIGHT = 120;
const DEFAULT_MINERAL: MineralId = 'copper';

async function fetchPriceHistory(mineral: MineralId): Promise<PriceHistoryResponse> {
  const response = await fetch(`/api/prices?history=1&mineral=${mineral}`);
  if (!response.ok) {
    throw new Error('history_fetch_failed');
  }
  return response.json() as Promise<PriceHistoryResponse>;
}

function filterHistoryOneMonth(history: PriceHistoryResponse['history']) {
  const days = PRICE_TIMEFRAME_DAYS['1M'];
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return history.filter((point) => point.date >= cutoffStr);
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { date: string; currency: string } }>;
  locale: string;
  unitLabel: string;
}

function ChartTooltip({ active, payload, locale, unitLabel }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const point = payload[0];
  if (!point) return null;

  const dateLabel = new Intl.DateTimeFormat(resolveIntlLocale(locale), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${point.payload.date}T00:00:00Z`));

  return (
    <div className="rounded-card border border-border bg-bg px-3 py-2 card-shadow">
      <p className="mb-1 text-[12px] text-muted">{dateLabel}</p>
      <p className="tabular-nums text-[13px] font-semibold text-ink">
        {formatPricePerUnit(point.value, point.payload.currency, unitLabel, locale)}
      </p>
    </div>
  );
}

export function PillarMiniPriceChart() {
  const t = useTranslations('marketing.landing.prices');
  const tUnits = useTranslations('units');
  const locale = useLocale();
  const chartReady = useChartReady();
  const mineral = getMineralById(DEFAULT_MINERAL);
  const unitLabel = tUnits(mineral.defaultUnit);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['prices', 'history', DEFAULT_MINERAL],
    queryFn: () => fetchPriceHistory(DEFAULT_MINERAL),
    staleTime: STALE_TIME_MS,
    refetchOnWindowFocus: false,
    enabled: mineral.hasSpotPrice,
  });

  const history = data?.history ?? [];
  const filtered = filterHistoryOneMonth(history);
  const showChart = mineral.hasSpotPrice && filtered.length >= 2;
  const gradientId = `pillarMiniGoldFill-${DEFAULT_MINERAL}`;

  const chartData = filtered.map((point) => ({
    date: point.date,
    price: point.price,
    currency: point.currency,
    label: new Intl.DateTimeFormat(resolveIntlLocale(locale), {
      day: 'numeric',
      month: 'short',
    }).format(new Date(`${point.date}T00:00:00Z`)),
  }));

  if (!mineral.hasSpotPrice) {
    return (
      <div
        className="flex items-center justify-center rounded-card border border-border bg-bg px-4"
        style={{ minHeight: CHART_HEIGHT }}
      >
        <p className="text-[13px] text-muted">{t('indicativeHistory')}</p>
      </div>
    );
  }

  if (isLoading) {
    return <Skeleton className="w-full rounded-card" style={{ height: CHART_HEIGHT }} />;
  }

  if (isError || !showChart) {
    return (
      <div
        className="flex items-center justify-center rounded-card border border-border bg-bg px-4"
        style={{ minHeight: CHART_HEIGHT }}
      >
        <EmptyState
          icon={<LineChartIcon className="h-5 w-5" strokeWidth={1.75} />}
          title={t('historyEmptyTitle')}
          description={t('historyEmptyDescription')}
          className="py-4"
        />
      </div>
    );
  }

  return (
    <div
      className="w-full min-w-0 rounded-card border border-border bg-bg px-2 py-3"
      style={{ height: CHART_HEIGHT + 24 }}
      role="img"
      aria-label={t('chartAria', { mineral: DEFAULT_MINERAL })}
    >
      {chartReady ? (
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand-gold)" stopOpacity={0.2} />
              <stop offset="100%" stopColor="var(--brand-gold)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--muted)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: 'var(--muted)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={40}
            tickFormatter={(value: number) =>
              new Intl.NumberFormat(resolveIntlLocale(locale), {
                notation: 'compact',
                maximumFractionDigits: 1,
              }).format(value)
            }
          />
          <Tooltip content={<ChartTooltip locale={locale} unitLabel={unitLabel} />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke="var(--brand-gold)"
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 3, fill: 'var(--brand-gold)', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      ) : null}
    </div>
  );
}
