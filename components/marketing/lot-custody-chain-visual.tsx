'use client';

import { useTranslations } from 'next-intl';
import { ConnectedChainVisual } from '@/components/marketing/connected-chain-visual';

const CHAIN_STEP_KEYS = ['mine', 'cooperative', 'control', 'transport', 'buyer'] as const;

export function LotCustodyChainVisual() {
  const t = useTranslations('marketing.landing.infrastructure.pillars.traceability.chain');

  return (
    <ConnectedChainVisual
      ariaLabel={t('ariaLabel')}
      columnCount={5}
      tint="blue"
      steps={CHAIN_STEP_KEYS.map((stepKey, index) => ({
        id: stepKey,
        label: t(stepKey),
        node: (
          <span className="text-[12px] font-semibold tabular-nums text-brand-blue">
            {index + 1}
          </span>
        ),
      }))}
    />
  );
}
