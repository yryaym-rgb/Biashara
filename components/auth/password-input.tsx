'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';

export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  hint?: string;
  error?: string;
  showLabel: string;
  hideLabel: string;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showLabel, hideLabel, label, hint, error, id, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);
    const generatedId = React.useId();
    const inputId = id ?? generatedId;

    return (
      <div className="relative">
        <Input
          ref={ref}
          id={inputId}
          type={visible ? 'text' : 'password'}
          label={label}
          hint={hint}
          error={error}
          className={cn('pr-12', className)}
          {...props}
        />
        <button
          type="button"
          className="absolute right-1 top-[34px] flex min-h-10 min-w-10 items-center justify-center rounded-button text-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          tabIndex={-1}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          )}
        </button>
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
