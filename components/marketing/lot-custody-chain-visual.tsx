'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';

const CHAIN_STEP_KEYS = ['mine', 'cooperative', 'control', 'transport', 'buyer'] as const;

export function LotCustodyChainVisual() {
  const t = useTranslations('marketing.landing.infrastructure.pillars.traceability.chain');

  return (
    <ol
      className={cn(
        'grid gap-4',
        'min-[481px]:grid-cols-5 min-[481px]:gap-2',
      )}
      aria-label={t('ariaLabel')}
    >
      {CHAIN_STEP_KEYS.map((stepKey, index) => {
        const isLast = index === CHAIN_STEP_KEYS.length - 1;

        return (
          <li
            key={stepKey}
            className={cn(
              'relative flex flex-col items-center gap-2 text-center',
              !isLast &&
                'min-[481px]:after:absolute min-[481px]:after:left-[calc(50%+20px)] min-[481px]:after:right-0 min-[481px]:after:top-[18px] min-[481px]:after:h-px min-[481px]:after:bg-border',
            )}
          >
            <div
              className={cn(
                'relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-button',
                'bg-[color-mix(in_srgb,var(--brand-blue)_12%,transparent)]',
                'min-[481px]:after:absolute min-[481px]:after:left-1/2 min-[481px]:after:top-full',
                'min-[481px]:after:z-[2] min-[481px]:after:h-2 min-[481px]:after:w-2',
                'min-[481px]:after:-translate-x-1/2 min-[481px]:after:translate-y-[calc(50%+4px)]',
                'min-[481px]:after:rounded-full min-[481px]:after:bg-brand-blue min-[481px]:after:content-[""]',
              )}
            >
              <span className="text-[12px] font-semibold tabular-nums text-brand-blue">
                {index + 1}
              </span>
            </div>
            <p className="text-[12px] font-semibold leading-snug text-ink">
              {t(stepKey)}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
