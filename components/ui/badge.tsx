import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export type StatusChipVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: StatusChipVariant;
}

const variantStyles: Record<StatusChipVariant, string> = {
  success: 'bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-success',
  danger: 'bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-danger',
  warning: 'bg-[color-mix(in_srgb,var(--brand-gold)_12%,transparent)] text-brand-gold-dark',
  info: 'bg-[color-mix(in_srgb,var(--brand-blue)_12%,transparent)] text-brand-blue',
  neutral: 'bg-[color-mix(in_srgb,var(--muted)_12%,transparent)] text-muted',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'neutral', ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-[6px] px-2 py-1 text-[12px] font-semibold',
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  ),
);

Badge.displayName = 'Badge';
