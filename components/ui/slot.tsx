import * as React from 'react';
import { cn } from '@/lib/utils/cn';

interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export function Slot({ children, className, ...props }: SlotProps) {
  if (!React.isValidElement(children)) {
    return null;
  }

  const child = children as React.ReactElement<{
    className?: string;
  }>;

  return React.cloneElement(child, {
    ...props,
    ...child.props,
    className: cn(className, child.props.className),
  });
}
