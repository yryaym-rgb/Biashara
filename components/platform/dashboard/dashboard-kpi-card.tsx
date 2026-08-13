import type { LucideIcon } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

export interface DashboardKpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  zeroSubLabel?: string;
  href?: string;
  className?: string;
}

export function DashboardKpiCard({
  label,
  value,
  icon: Icon,
  zeroSubLabel,
  href,
  className,
}: DashboardKpiCardProps) {
  const numericValue = typeof value === 'number' ? value : Number.parseFloat(String(value));
  const isZero = !Number.isNaN(numericValue) && numericValue === 0;
  const subLabel = isZero && zeroSubLabel ? zeroSubLabel : label;

  const content = (
    <Card className={cn(href ? 'transition-shadow duration-150 hover:shadow-[0_8px_24px_rgba(14,42,71,0.10)] hover:-translate-y-0.5' : undefined, className)}>
      <CardContent className="relative p-6">
        <div className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-button bg-bg-tint">
          <Icon className="h-5 w-5 text-brand-blue" strokeWidth={1.75} aria-hidden="true" />
        </div>
        <p className="text-[28px] font-bold tabular-nums text-ink">{value}</p>
        <p className="mt-1 text-[13px] text-muted">{subLabel}</p>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block no-underline">
        {content}
      </Link>
    );
  }

  return content;
}
