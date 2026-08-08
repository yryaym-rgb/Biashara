'use client';

import { useLocale, useTranslations } from 'next-intl';
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
import type { SalesVolumePoint } from '@/lib/platform/queries';
import { formatCurrency, resolveIntlLocale } from '@/lib/utils/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { date: string } }>;
  locale: string;
}

function ChartTooltip({ active, payload, locale }: ChartTooltipProps) {
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
        {formatCurrency(point.value, 'USD', locale)}
      </p>
    </div>
  );
}

export interface DashboardSalesChartProps {
  data: SalesVolumePoint[];
}

const CHART_HEIGHT = 200;

export function DashboardSalesChart({ data }: DashboardSalesChartProps) {
  const t = useTranslations('platform.dashboard');
  const locale = useLocale();
  const showChart = data.length >= 2;

  const chartData = data.map((point) => ({
    ...point,
    label: new Intl.DateTimeFormat(resolveIntlLocale(locale), {
      day: 'numeric',
      month: 'short',
    }).format(new Date(`${point.date}T00:00:00Z`)),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('salesOverview')}</CardTitle>
      </CardHeader>
      <CardContent>
        {!showChart ? (
          <div style={{ minHeight: CHART_HEIGHT }}>
            <EmptyState
              icon={<LineChartIcon className="h-6 w-6" strokeWidth={1.75} />}
              title={t('salesOverview')}
              description={t('salesChartEmpty')}
            />
          </div>
        ) : (
          <div
            className="w-full"
            style={{ height: CHART_HEIGHT }}
            role="img"
            aria-label={t('salesOverview')}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashboardSalesFill" x1="0" y1="0" x2="0" y2="1">
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
                <Tooltip content={<ChartTooltip locale={locale} />} />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="var(--brand-gold)"
                  strokeWidth={2}
                  fill="url(#dashboardSalesFill)"
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
