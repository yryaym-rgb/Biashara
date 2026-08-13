'use client';

import { Line, LineChart, ResponsiveContainer } from 'recharts';
import type { WeeklySnapshotPoint } from '@/lib/admin/dashboard-kpis.logic';

const SPARKLINE_HEIGHT = 40;

export interface AdminKpiSparklineProps {
  data: WeeklySnapshotPoint[];
  ariaLabel: string;
}

export function AdminKpiSparkline({ data, ariaLabel }: AdminKpiSparklineProps) {
  if (data.length < 2) {
    return null;
  }

  return (
    <div
      className="mt-4 h-10 w-full"
      role="img"
      aria-label={ariaLabel}
    >
      <ResponsiveContainer width="100%" height={SPARKLINE_HEIGHT}>
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
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
