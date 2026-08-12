import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export type ConnectedChainStep = {
  id: string;
  label: ReactNode;
  node: ReactNode;
  description?: ReactNode;
};

type ConnectedChainVisualProps = {
  steps: ConnectedChainStep[];
  ariaLabel: string;
  columnCount?: 5 | 6;
  tint?: 'gold' | 'blue';
};

const HORIZONTAL_GRID: Record<5 | 6, string> = {
  5: 'min-[481px]:grid-cols-5 min-[481px]:gap-2',
  6: 'lg:grid-cols-6 lg:gap-2',
};

const HORIZONTAL_CONNECTOR: Record<5 | 6, string> = {
  5: 'min-[481px]:after:absolute min-[481px]:after:left-[calc(50%+20px)] min-[481px]:after:right-0 min-[481px]:after:top-[18px] min-[481px]:after:h-px min-[481px]:after:bg-border',
  6: 'lg:after:absolute lg:after:left-[calc(50%+20px)] lg:after:right-0 lg:after:top-[18px] lg:after:h-px lg:after:bg-border',
};

const HORIZONTAL_DOT: Record<5 | 6, string> = {
  5: 'min-[481px]:after:absolute min-[481px]:after:left-1/2 min-[481px]:after:top-full min-[481px]:after:z-[2] min-[481px]:after:h-2 min-[481px]:after:w-2 min-[481px]:after:-translate-x-1/2 min-[481px]:after:translate-y-[calc(50%+4px)] min-[481px]:after:rounded-full min-[481px]:after:content-[""]',
  6: 'lg:after:absolute lg:after:left-1/2 lg:after:top-full lg:after:z-[2] lg:after:h-2 lg:after:w-2 lg:after:-translate-x-1/2 lg:after:translate-y-[calc(50%+4px)] lg:after:rounded-full lg:after:content-[""]',
};

const NODE_TINT: Record<'gold' | 'blue', string> = {
  gold: 'bg-[color-mix(in_srgb,var(--brand-gold)_12%,transparent)]',
  blue: 'bg-[color-mix(in_srgb,var(--brand-blue)_12%,transparent)]',
};

const DOT_COLOR: Record<'gold' | 'blue', string> = {
  gold: 'after:bg-brand-gold',
  blue: 'after:bg-brand-blue',
};

export function ConnectedChainVisual({
  steps,
  ariaLabel,
  columnCount = 5,
  tint = 'blue',
}: ConnectedChainVisualProps) {
  return (
    <ol
      className={cn('grid gap-4', HORIZONTAL_GRID[columnCount])}
      aria-label={ariaLabel}
    >
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <li
            key={step.id}
            className={cn(
              'relative flex flex-col items-center gap-2 text-center',
              !isLast && HORIZONTAL_CONNECTOR[columnCount],
            )}
          >
            <div
              className={cn(
                'relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-button',
                NODE_TINT[tint],
                HORIZONTAL_DOT[columnCount],
                DOT_COLOR[tint],
              )}
            >
              {step.node}
            </div>
            <p className="text-[12px] font-semibold leading-snug text-ink">{step.label}</p>
            {step.description ? (
              <p className="text-[13px] leading-snug text-muted">{step.description}</p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
