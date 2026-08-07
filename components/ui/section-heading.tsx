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
    <div className={cn('flex max-w-3xl flex-col gap-4', className)}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <HeadingTag>{title}</HeadingTag>
      {subtitle ? <p className="text-base text-body">{subtitle}</p> : null}
    </div>
  );
}
