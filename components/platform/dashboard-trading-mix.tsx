'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { PieChart as PieChartIcon } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { TradingMixSegment } from '@/lib/platform/trading-mix';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { useChartReady } from '@/lib/hooks/use-chart-ready';
import { formatNumber } from '@/lib/utils/format';

const SEGMENT_COLORS = [
  'var(--brand-blue)',
  'var(--brand-gold)',
  'var(--brand-blue-dark)',
  'var(--success)',
  'var(--body)',
  'var(--muted)',
];

export interface DashboardTradingMixProps {
  segments: TradingMixSegment[];
}

interface MixTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { mineralLabel: string; count: number };
  }>;
  locale: string;
  ordersLabel: string;
}

function MixTooltip({ active, payload, locale, ordersLabel }: MixTooltipProps) {
  if (!active || !payload?.length) return null;

  const point = payload[0];
  if (!point) return null;

  return (
    <div className="rounded-card border border-border bg-bg px-3 py-2 card-shadow">
      <p className="text-[13px] font-semibold text-ink">{point.payload.mineralLabel}</p>
      <p className="tabular-nums text-[13px] text-muted">
        {formatNumber(point.value, locale)} {ordersLabel}
      </p>
    </div>
  );
}

const CHART_SIZE = 160;

export function DashboardTradingMix({ segments }: DashboardTradingMixProps) {
  const t = useTranslations('platform.dashboard.tradingMix');
  const tMinerals = useTranslations('minerals');
  const locale = useLocale();
  const chartReady = useChartReady();

  const chartData = segments.map((segment, index) => ({
    mineral: segment.mineral,
    mineralLabel: tMinerals(segment.mineral),
    count: segment.count,
    fill: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
  }));

  const totalOrders = segments.reduce((sum, segment) => sum + segment.count, 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-[18px]">{t('title')}</CardTitle>
          {segments.length > 0 ? (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-button bg-bg-tint">
              <PieChartIcon
                className="h-5 w-5 text-brand-blue"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {segments.length === 0 ? (
          <EmptyState
            icon={<PieChartIcon className="h-5 w-5" strokeWidth={1.75} />}
            title={t('emptyTitle')}
            description={t('emptyDescription')}
            className="py-8"
          />
        ) : (
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div
              className="shrink-0 min-w-0"
              style={{ width: CHART_SIZE, height: CHART_SIZE }}
              role="img"
              aria-label={t('chartLabel')}
            >
              {chartReady ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="count"
                      nameKey="mineralLabel"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {chartData.map((entry) => (
                        <Cell key={entry.mineral} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<MixTooltip locale={locale} ordersLabel={t('orders')} />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : null}
            </div>

            <ul className="flex-1 space-y-2">
              {chartData.map((entry) => {
                const percent = totalOrders > 0 ? (entry.count / totalOrders) * 100 : 0;
                return (
                  <li key={entry.mineral} className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 shrink-0 rounded-[4px]"
                      style={{ backgroundColor: entry.fill }}
                      aria-hidden="true"
                    />
                    <span className="flex-1 text-[15px] text-ink">{entry.mineralLabel}</span>
                    <span className="tabular-nums text-[13px] text-muted">
                      {formatNumber(Math.round(percent), locale)}%
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
