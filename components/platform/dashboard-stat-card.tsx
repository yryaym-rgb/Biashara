import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

export interface DashboardStatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  className?: string;
}

export function DashboardStatCard({ label, value, icon: Icon, className }: DashboardStatCardProps) {
  return (
    <Card className={cn(className)}>
      <CardContent className="relative p-6">
        <div className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-button bg-bg-tint">
          <Icon className="h-5 w-5 text-brand-blue" strokeWidth={1.75} aria-hidden="true" />
        </div>
        <p className="text-[28px] font-bold tabular-nums text-ink">{value}</p>
        <p className="mt-1 text-[13px] text-muted">{label}</p>
      </CardContent>
    </Card>
  );
}
