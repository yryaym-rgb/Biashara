'use client';

import { useLocale, useTranslations } from 'next-intl';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Filter as FilterIcon } from 'lucide-react';
import type { FunnelSegment } from '@/lib/admin/reports.logic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { formatNumber } from '@/lib/utils/format';

export interface AdminFunnelChartProps {
  title: string;
  segments: FunnelSegment[];
  statusNamespace: 'admin.kycStatus' | 'admin.listingStatus';
  emptyDescription: string;
}

export function AdminFunnelChart({
  title,
  segments,
  statusNamespace,
  emptyDescription,
}: AdminFunnelChartProps) {
  const tStatus = useTranslations(statusNamespace);
  const locale = useLocale();

  const total = segments.reduce((sum, s) => sum + s.count, 0);
  const chartData = segments.map((segment) => ({
    status: segment.status,
    label: tStatus(segment.status as 'none'),
    count: segment.count,
  }));

  const hasData = total > 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <EmptyState
            icon={<FilterIcon className="h-5 w-5" strokeWidth={1.75} />}
            title={title}
            description={emptyDescription}
            className="py-8"
          />
        ) : (
          <div className="w-full" style={{ height: 200 }} role="img" aria-label={title}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="var(--border)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: 'var(--muted)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ fill: 'var(--muted)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={100}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const point = payload[0]?.payload as { label: string; count: number };
                    return (
                      <div className="rounded-card border border-border bg-bg px-3 py-2 card-shadow">
                        <p className="text-[13px] font-semibold text-ink">{point.label}</p>
                        <p className="tabular-nums text-[13px] text-muted">
                          {formatNumber(point.count, locale)}
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="count" fill="var(--brand-blue)" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
