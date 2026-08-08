'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Users as UsersIcon } from 'lucide-react';
import type { UserGrowthPoint, VolumeGranularity } from '@/lib/admin/reports.logic';
import { resolveIntlLocale } from '@/lib/utils/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils/cn';

export interface AdminUserGrowthChartProps {
  dailyData: UserGrowthPoint[];
  weeklyData: UserGrowthPoint[];
}

const CHART_HEIGHT = 200;

export function AdminUserGrowthChart({ dailyData, weeklyData }: AdminUserGrowthChartProps) {
  const t = useTranslations('admin.reports.charts.userGrowth');
  const locale = useLocale();
  const [granularity, setGranularity] = useState<VolumeGranularity>('daily');

  const data = granularity === 'daily' ? dailyData : weeklyData;
  const showChart = data.length >= 2;

  const chartData = data.map((point) => ({
    ...point,
    label: new Intl.DateTimeFormat(resolveIntlLocale(locale), {
      day: 'numeric',
      month: 'short',
    }).format(new Date(`${point.period}T00:00:00Z`)),
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>{t('title')}</CardTitle>
        <div className="flex gap-1 rounded-button border border-border p-1">
          {(['daily', 'weekly'] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGranularity(g)}
              className={cn(
                'rounded-button px-3 py-1 text-[13px] font-semibold transition-colors',
                granularity === g
                  ? 'bg-bg-tint text-brand-blue underline decoration-brand-gold decoration-2 underline-offset-[6px]'
                  : 'text-muted hover:text-ink',
              )}
            >
              {t(`granularity.${g}`)}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {!showChart ? (
          <div style={{ minHeight: CHART_HEIGHT }}>
            <EmptyState
              icon={<UsersIcon className="h-6 w-6" strokeWidth={1.75} />}
              title={t('title')}
              description={t('empty')}
            />
          </div>
        ) : (
          <div
            className="w-full"
            style={{ height: CHART_HEIGHT }}
            role="img"
            aria-label={t('title')}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminUserGrowthFill" x1="0" y1="0" x2="0" y2="1">
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
                  yAxisId="left"
                  tick={{ fill: 'var(--muted)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: 'var(--muted)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const point = payload[0]?.payload as UserGrowthPoint & { label: string };
                    return (
                      <div className="rounded-card border border-border bg-bg px-3 py-2 card-shadow">
                        <p className="mb-1 text-[12px] text-muted">{point.label}</p>
                        <p className="tabular-nums text-[13px] text-ink">
                          {t('tooltipNew', { count: point.newUsers })}
                        </p>
                        <p className="tabular-nums text-[13px] text-ink">
                          {t('tooltipCumulative', { count: point.cumulativeUsers })}
                        </p>
                      </div>
                    );
                  }}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="cumulativeUsers"
                  stroke="var(--brand-blue)"
                  strokeWidth={2}
                  fill="url(#adminUserGrowthFill)"
                  dot={false}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="newUsers"
                  stroke="var(--brand-gold)"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
