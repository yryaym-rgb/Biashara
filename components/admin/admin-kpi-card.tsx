import type { LucideIcon } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { AdminKpiSparkline } from '@/components/admin/admin-kpi-sparkline';
import type { WeeklySnapshotPoint } from '@/lib/admin/dashboard-kpis.logic';
import { formatNumber } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

export interface AdminKpiCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  href: string;
  locale: string;
  trendPercent: number | null;
  sparkline: WeeklySnapshotPoint[];
  hasSparkline: boolean;
  sparklineAriaLabel: string;
  trendAriaLabel?: string;
  className?: string;
}

function formatTrendLabel(trendPercent: number): string {
  const sign = trendPercent > 0 ? '+' : '';
  return `${sign}${trendPercent.toFixed(1)}%`;
}

function getTrendChipClass(trendPercent: number): string {
  if (trendPercent > 0) {
    return 'bg-[color-mix(in_srgb,var(--market-live)_12%,transparent)] text-market-live';
  }
  if (trendPercent < 0) {
    return 'bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-danger';
  }
  return 'bg-bg-tint text-muted';
}

export function AdminKpiCard({
  label,
  value,
  icon: Icon,
  href,
  locale,
  trendPercent,
  sparkline,
  hasSparkline,
  sparklineAriaLabel,
  trendAriaLabel,
  className,
}: AdminKpiCardProps) {
  const content = (
    <Card
      hoverable
      className={cn(
        'h-full transition-shadow duration-150 hover:shadow-[0_8px_24px_rgba(14,42,71,0.10)] hover:-translate-y-0.5',
        className,
      )}
    >
      <CardContent className="relative p-6">
        <div className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-button bg-bg-tint">
          <Icon className="h-5 w-5 text-brand-blue" strokeWidth={1.75} aria-hidden="true" />
        </div>

        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>

        <p className="mt-2 text-[34px] font-bold tabular-nums leading-none text-ink">
          {formatNumber(value, locale)}
        </p>

        {trendPercent !== null ? (
          <span
            className={cn(
              'mt-3 inline-flex rounded-[6px] px-2 py-0.5 text-[12px] font-semibold tabular-nums',
              getTrendChipClass(trendPercent),
            )}
            aria-label={trendAriaLabel ?? formatTrendLabel(trendPercent)}
          >
            {formatTrendLabel(trendPercent)}
          </span>
        ) : null}

        {hasSparkline ? (
          <AdminKpiSparkline data={sparkline} ariaLabel={sparklineAriaLabel} />
        ) : null}
      </CardContent>
    </Card>
  );

  return (
    <Link href={href} className="block no-underline">
      {content}
    </Link>
  );
}
