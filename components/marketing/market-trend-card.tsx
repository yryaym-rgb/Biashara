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
import type { PriceHistoryResponse, PriceTimeframe } from '@/lib/prices/types';
import { PRICE_TIMEFRAME_DAYS } from '@/lib/prices/types';
import { formatPricePerUnit } from '@/lib/utils/format';
import { resolveIntlLocale } from '@/lib/utils/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils/cn';

const STALE_TIME_MS = 15 * 60 * 1000;
const CHART_HEIGHT = 240;
const TIMEFRAMES: PriceTimeframe[] = ['1W', '1M', '3M', '1Y', 'ALL'];

async function fetchPriceHistory(): Promise<PriceHistoryResponse> {
  const response = await fetch('/api/prices?history=1');
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

export function MarketTrendCard() {
  const t = useTranslations('marketing.landing.prices');
  const tUnits = useTranslations('units');
  const locale = useLocale();
  const [timeframe, setTimeframe] = React.useState<PriceTimeframe>('1M');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['prices', 'history'],
    queryFn: fetchPriceHistory,
    staleTime: STALE_TIME_MS,
    refetchOnWindowFocus: false,
  });

  const history = data?.history;
  const filtered = filterHistoryByTimeframe(history ?? [], timeframe);
  const showChart = filtered.length >= 2;
  const unitLabel = tUnits('MT');

  React.useEffect(() => {
    if (!history?.length) return;
    if (!hasEnoughDataForTimeframe(history, timeframe)) {
      const firstAvailable = TIMEFRAMES.find((tf) =>
        hasEnoughDataForTimeframe(history, tf),
      );
      if (firstAvailable) {
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

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-[18px] font-semibold text-ink">
          {t('trendCardTitle')}
        </CardTitle>
        <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as PriceTimeframe)}>
          <TabsList className="gap-4 border-0">
            {TIMEFRAMES.map((tf) => {
              const disabled = !hasEnoughDataForTimeframe(history ?? [], tf);
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
        {isLoading ? (
          <Skeleton className="w-full rounded-card" style={{ height: CHART_HEIGHT }} />
        ) : isError || !showChart ? (
          <div style={{ minHeight: CHART_HEIGHT }}>
            <EmptyState
              icon={<LineChartIcon className="h-6 w-6" strokeWidth={1.75} />}
              title={t('historyEmptyTitle')}
              description={t('historyEmptyDescription')}
            />
          </div>
        ) : (
          <div
            className={cn('w-full')}
            style={{ height: CHART_HEIGHT }}
            role="img"
            aria-label={t('trendChartAria')}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldAreaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="var(--brand-gold)"
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="100%"
                      stopColor="var(--brand-gold)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="var(--border)"
                  vertical={false}
                />
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
                <Tooltip
                  content={<ChartTooltip locale={locale} unitLabel={unitLabel} />}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="var(--brand-gold)"
                  strokeWidth={2}
                  fill="url(#goldAreaFill)"
                  dot={false}
                  activeDot={{ r: 4, fill: 'var(--brand-gold)', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
