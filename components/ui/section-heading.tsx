import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
  as?: 'h1' | 'h2';
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  className,
  as: HeadingTag = 'h2',
}: SectionHeadingProps) {
  return (
    <div className={cn('flex min-w-0 max-w-3xl flex-col gap-4', className)}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <HeadingTag className="min-w-0 break-words">{title}</HeadingTag>
      {subtitle ? <p className="min-w-0 break-words text-base text-body">{subtitle}</p> : null}
    </div>
  );
}
