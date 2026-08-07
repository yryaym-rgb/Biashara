import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('skeleton-shimmer rounded-button', className)}
      {...props}
    />
  );
}
