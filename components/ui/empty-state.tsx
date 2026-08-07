import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-4 py-12 text-center',
        className,
      )}
    >
      <div
        className="mb-4 flex h-11 w-11 items-center justify-center rounded-button bg-bg-tint text-brand-blue"
        aria-hidden="true"
      >
        {icon}
      </div>
      <h3 className="mb-2">{title}</h3>
      <p className="mb-6 max-w-md text-base text-body">{description}</p>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
