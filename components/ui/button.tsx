import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Slot } from '@/components/ui/slot';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline-light';
export type ButtonSize = 'md' | 'sm';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  asChild?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'gold-gradient text-[color:var(--white)] hover:bg-none hover:bg-brand-gold-dark motion-safe:transition-colors motion-safe:duration-150',
  secondary:
    'bg-bg text-ink border border-border hover:bg-bg-tint motion-safe:transition-colors motion-safe:duration-150',
  ghost:
    'bg-transparent text-brand-blue hover:text-brand-blue-dark motion-safe:transition-colors motion-safe:duration-150',
  'outline-light':
    'bg-transparent text-[color:var(--white)] border border-[color:color-mix(in_srgb,var(--white)_60%,transparent)] hover:bg-[color:color-mix(in_srgb,var(--white)_10%,transparent)] motion-safe:transition-colors motion-safe:duration-150',
};

const sizeStyles: Record<ButtonSize, string> = {
  md: 'h-11 px-[22px] text-[15px]',
  sm: 'h-9 px-4 text-[15px]',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      asChild = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;

    return (
      <Comp
        ref={asChild ? undefined : ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-button font-semibold',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...(asChild ? {} : { disabled: isDisabled })}
        aria-busy={loading || undefined}
        aria-disabled={asChild && isDisabled ? true : undefined}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  },
);

Button.displayName = 'Button';
