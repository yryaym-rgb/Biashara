import {
  ClipboardCheck,
  FileSearch,
  Globe,
  Handshake,
  Pickaxe,
  Search,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { ConnectedChainVisual } from '@/components/marketing/connected-chain-visual';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { ScrollReveal } from '@/lib/motion/scroll-reveal';

const STEP_KEYS = ['ore', 'publish', 'kyc', 'negotiate', 'traceability', 'globalMarket'] as const;

type StepKey = (typeof STEP_KEYS)[number];

const FUNCTIONAL_STEP_KEYS = ['publish', 'kyc', 'negotiate', 'traceability'] as const;

const STEP_ICONS: Record<StepKey, typeof Search> = {
  ore: Pickaxe,
  publish: Search,
  kyc: ClipboardCheck,
  negotiate: Handshake,
  traceability: FileSearch,
  globalMarket: Globe,
};

function isFunctionalStep(stepKey: StepKey): stepKey is (typeof FUNCTIONAL_STEP_KEYS)[number] {
  return (FUNCTIONAL_STEP_KEYS as readonly string[]).includes(stepKey);
}

export async function LandingHowItWorksSection() {
  const t = await getTranslations('marketing.landing.howItWorks');

  return (
    <section className="bg-bg py-14 lg:py-24">
      <Container>
        <SectionHeading
          eyebrow={t('eyebrow')}
          title={t('title')}
          className="mb-12"
        />

        <ScrollReveal>
          <ConnectedChainVisual
            ariaLabel={t('chainAriaLabel')}
            columnCount={6}
            tint="gold"
            steps={STEP_KEYS.map((stepKey) => {
              const Icon = STEP_ICONS[stepKey];

              return {
                id: stepKey,
                label: t(`steps.${stepKey}.title`),
                description: isFunctionalStep(stepKey)
                  ? t(`steps.${stepKey}.description`)
                  : undefined,
                node: (
                  <Icon className="h-4 w-4 text-brand-blue" strokeWidth={1.75} aria-hidden="true" />
                ),
              };
            })}
          />
        </ScrollReveal>
      </Container>
    </section>
  );
}
