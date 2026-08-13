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
import type { PriceHistoryResponse, PriceTimeframe } from '@/lib/prices/types';
import { PRICE_TIMEFRAME_DAYS } from '@/lib/prices/types';
import { formatPricePerUnit, resolveIntlLocale } from '@/lib/utils/format';
import { useChartReady } from '@/lib/hooks/use-chart-ready';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils/cn';

const STALE_TIME_MS = 15 * 60 * 1000;
const CHART_HEIGHT = 280;
const TIMEFRAMES: PriceTimeframe[] = ['1W', '1M', '3M', '1Y', 'ALL'];

async function fetchPriceHistory(mineral: MineralId): Promise<PriceHistoryResponse> {
  const response = await fetch(`/api/prices?history=1&mineral=${mineral}`);
  if (!response.ok) {
    throw new Error('history_fetch_failed');
  }
  return response.json() as Promise<PriceHistoryResponse>;
}

function filterHistoryByTimeframe(
  history: PriceHistoryResponse['history'],
  timeframe: PriceTimeframe,
): PriceHistoryResponse['history'] {
  if (timeframe === 'ALL' || history.length === 0) {
    return history;
  }

  const days = PRICE_TIMEFRAME_DAYS[timeframe];
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  return history.filter((point) => point.date >= cutoffStr);
}

function hasEnoughDataForTimeframe(
  history: PriceHistoryResponse['history'],
  timeframe: PriceTimeframe,
): boolean {
  const filtered = filterHistoryByTimeframe(history, timeframe);
  return filtered.length >= 2;
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
      <p className="tabular-nums text-[15px] font-semibold text-ink">
        {formatPricePerUnit(point.value, point.payload.currency, unitLabel, locale)}
      </p>
    </div>
  );
}

export interface MineralPriceChartProps {
  mineralId: MineralId;
  title?: string;
  className?: string;
  chartHeight?: number;
  translationNamespace?: 'marketing.landing.prices' | 'marketing.prices';
}

export function MineralPriceChart({
  mineralId,
  title,
  className,
  chartHeight = CHART_HEIGHT,
  translationNamespace = 'marketing.landing.prices',
}: MineralPriceChartProps) {
  const t = useTranslations(translationNamespace);
  const tUnits = useTranslations('units');
  const locale = useLocale();
  const chartReady = useChartReady();
  const [timeframe, setTimeframe] = React.useState<PriceTimeframe>('1M');
  const mineral = getMineralById(mineralId);
  const unitLabel = tUnits(mineral.defaultUnit);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['prices', 'history', mineralId],
    queryFn: () => fetchPriceHistory(mineralId),
    staleTime: STALE_TIME_MS,
    refetchOnWindowFocus: false,
    enabled: mineral.hasSpotPrice,
  });

  const history = React.useMemo(() => data?.history ?? [], [data?.history]);
  const filtered = filterHistoryByTimeframe(history, timeframe);
  const showChart = mineral.hasSpotPrice && filtered.length >= 2;

  React.useEffect(() => {
    setTimeframe('1M');
  }, [mineralId]);

  React.useEffect(() => {
    if (!history.length) return;
    if (!hasEnoughDataForTimeframe(history, timeframe)) {
      const firstAvailable = TIMEFRAMES.find((tf) => hasEnoughDataForTimeframe(history, tf));
      if (firstAvailable && firstAvailable !== timeframe) {
        setTimeframe(firstAvailable);
      }
    }
  }, [history, timeframe]);

  const chartData = filtered.map((point) => ({
    date: point.date,
    price: point.price,
    currency: point.currency,
    label: new Intl.DateTimeFormat(resolveIntlLocale(locale), {
      day: 'numeric',
      month: 'short',
    }).format(new Date(`${point.date}T00:00:00Z`)),
  }));

  const gradientId = `goldAreaFill-${mineralId}`;

  return (
    <Card className={cn('flex h-full flex-col', className)}>
      <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
        {title ? (
          <CardTitle className="text-[18px] font-semibold text-ink">{title}</CardTitle>
        ) : null}
        <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as PriceTimeframe)}>
          <TabsList className="gap-4 border-0">
            {TIMEFRAMES.map((tf) => {
              const disabled = !hasEnoughDataForTimeframe(history, tf);
              return (
                <TabsTrigger
                  key={tf}
                  value={tf}
                  disabled={disabled}
                  disabledTooltip={disabled ? t('timeframeSoon') : undefined}
                  className="pb-2 text-[13px]"
                >
                  {t(`timeframes.${tf}`)}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col pt-0">
        {!mineral.hasSpotPrice ? (
          <div style={{ minHeight: chartHeight }}>
            <EmptyState
              icon={<LineChartIcon className="h-6 w-6" strokeWidth={1.75} />}
              title={t('historyEmptyTitle')}
              description={t('indicativeHistory')}
            />
          </div>
        ) : isLoading ? (
          <Skeleton className="w-full rounded-card" style={{ height: chartHeight }} />
        ) : isError || !showChart ? (
          <div style={{ minHeight: chartHeight }}>
            <EmptyState
              icon={<LineChartIcon className="h-6 w-6" strokeWidth={1.75} />}
              title={t('historyEmptyTitle')}
              description={t('historyEmptyDescription')}
            />
          </div>
        ) : (
          <div
            className="w-full min-w-0"
            style={{ height: chartHeight }}
            role="img"
            aria-label={t('chartAria', { mineral: mineralId })}
          >
            {chartReady ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand-gold)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="var(--brand-gold)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: 'var(--muted)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: 'var(--muted)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={56}
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
                  activeDot={{ r: 4, fill: 'var(--brand-gold)', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
