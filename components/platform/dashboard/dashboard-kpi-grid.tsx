import type { LucideIcon } from 'lucide-react';
import { DashboardKpiCard } from '@/components/platform/dashboard/dashboard-kpi-card';

export interface DashboardKpiItem {
  key: string;
  label: string;
  value: string | number;
  icon: LucideIcon;
  zeroSubLabel?: string;
  href?: string;
}

export interface DashboardKpiGridProps {
  items: DashboardKpiItem[];
}

export function DashboardKpiGrid({ items }: DashboardKpiGridProps) {
  return (
    <div
      className={
        items.length === 3
          ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3'
          : 'grid gap-4 sm:grid-cols-2 xl:grid-cols-4'
      }
    >
      {items.map((item) => (
        <DashboardKpiCard
          key={item.key}
          label={item.label}
          value={item.value}
          icon={item.icon}
          zeroSubLabel={item.zeroSubLabel}
          href={item.href}
        />
      ))}
    </div>
  );
}
