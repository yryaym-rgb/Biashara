'use client';

import { useLocale, useTranslations } from 'next-intl';
import { LineChart, TrendingDown, TrendingUp } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts';
import type { MarketInsight } from '@/lib/platform/market-insight';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { formatNumber } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

export interface DashboardMarketInsightProps {
  insight: MarketInsight | null;
}

const SPARKLINE_HEIGHT = 48;

export function DashboardMarketInsight({ insight }: DashboardMarketInsightProps) {
  const t = useTranslations('platform.dashboard.marketInsight');
  const tMinerals = useTranslations('minerals');
  const locale = useLocale();

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-[18px]">{t('title')}</CardTitle>
          {insight ? (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-button bg-bg-tint">
              {insight.percentChange >= 0 ? (
                <TrendingUp
                  className="h-5 w-5 text-success"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              ) : (
                <TrendingDown
                  className="h-5 w-5 text-danger"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              )}
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {!insight ? (
          <EmptyState
            icon={<LineChart className="h-5 w-5" strokeWidth={1.75} />}
            title={t('emptyTitle')}
            description={t('emptyDescription')}
            className="py-8"
          />
        ) : (
          <div className="space-y-4">
            <p className="text-[15px] text-body">
              {t('insight', {
                mineral: tMinerals(insight.mineral),
                change: formatNumber(Math.abs(insight.percentChange), locale),
                direction: insight.percentChange >= 0 ? t('up') : t('down'),
              })}
            </p>
            <div
              className="w-full"
              style={{ height: SPARKLINE_HEIGHT }}
              role="img"
              aria-label={t('sparklineLabel', { mineral: tMinerals(insight.mineral) })}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={insight.sparkline} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="insightSparkFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--brand-gold)" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="var(--brand-gold)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <YAxis hide domain={['dataMin', 'dataMax']} />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="var(--brand-gold)"
                    strokeWidth={2}
                    fill="url(#insightSparkFill)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p
              className={cn(
                'text-[20px] font-bold tabular-nums',
                insight.percentChange >= 0 ? 'text-success' : 'text-danger',
              )}
            >
              {insight.percentChange >= 0 ? '+' : ''}
              {formatNumber(insight.percentChange, locale)}%
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
