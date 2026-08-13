import type { LucideIcon } from 'lucide-react';
import type { AdminDashboardKpiKey } from '@/lib/admin/dashboard-kpis';
import { AdminKpiCard } from '@/components/admin/admin-kpi-card';

export interface AdminKpiGridItem {
  key: AdminDashboardKpiKey;
  label: string;
  value: number;
  icon: LucideIcon;
  href: string;
  trendPercent: number | null;
  sparkline: Array<{ period: string; value: number }>;
  hasSparkline: boolean;
  sparklineAriaLabel: string;
  trendAriaLabel?: string;
}

export interface AdminKpiGridProps {
  items: AdminKpiGridItem[];
  locale: string;
}

export function AdminKpiGrid({ items, locale }: AdminKpiGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <AdminKpiCard
          key={item.key}
          label={item.label}
          value={item.value}
          icon={item.icon}
          href={item.href}
          locale={locale}
          trendPercent={item.trendPercent}
          sparkline={item.sparkline}
          hasSparkline={item.hasSparkline}
          sparklineAriaLabel={item.sparklineAriaLabel}
          trendAriaLabel={item.trendAriaLabel}
        />
      ))}
    </div>
  );
}
