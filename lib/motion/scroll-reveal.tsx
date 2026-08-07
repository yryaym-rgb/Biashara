'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { useScrollReveal } from '@/lib/motion/use-scroll-reveal';

export interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ScrollReveal({ className, children, ...props }: ScrollRevealProps) {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={cn('scroll-reveal', isVisible && 'scroll-reveal-visible', className)}
      {...props}
    >
      {children}
    </div>
  );
}
