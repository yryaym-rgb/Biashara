import { ClipboardCheck, FileSearch, Handshake, Search } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { ScrollReveal } from '@/lib/motion/scroll-reveal';
import { cn } from '@/lib/utils/cn';

const STEP_KEYS = ['publish', 'kyc', 'negotiate', 'traceability'] as const;

type StepKey = (typeof STEP_KEYS)[number];

const STEP_ICONS: Record<StepKey, typeof Search> = {
  publish: Search,
  kyc: ClipboardCheck,
  negotiate: Handshake,
  traceability: FileSearch,
};

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
          <ol
            className={cn(
              'grid gap-8',
              'md:grid-cols-4 md:gap-4',
            )}
          >
            {STEP_KEYS.map((stepKey, index) => {
              const Icon = STEP_ICONS[stepKey];
              const isLast = index === STEP_KEYS.length - 1;

              return (
                <li
                  key={stepKey}
                  className={cn(
                    'relative flex flex-col gap-4',
                    !isLast &&
                      'md:after:absolute md:after:left-[calc(50%+28px)] md:after:right-0 md:after:top-[22px] md:after:h-px md:after:bg-border',
                  )}
                >
                  <div className="flex items-center gap-4 md:flex-col md:items-center md:text-center">
                  <div
                    className={cn(
                      'relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center rounded-button',
                      'bg-[color-mix(in_srgb,var(--brand-gold)_12%,transparent)]',
                      'md:after:absolute md:after:left-1/2 md:after:top-full md:after:z-[2]',
                      'md:after:h-2 md:after:w-2 md:after:-translate-x-1/2 md:after:translate-y-[calc(50%+6px)]',
                      'md:after:rounded-full md:after:bg-brand-gold md:after:content-[""]',
                    )}
                  >
                      <Icon className="h-5 w-5 text-brand-blue" strokeWidth={1.75} aria-hidden="true" />
                      <span
                        className={cn(
                          'absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center',
                          'rounded-full bg-brand-gold text-[11px] font-bold text-white',
                        )}
                        aria-hidden="true"
                      >
                        {index + 1}
                      </span>
                    </div>

                    <div className="flex min-w-0 flex-col gap-1 md:items-center">
                      <h3 className="text-[16px] font-semibold text-ink">
                        {t(`steps.${stepKey}.title`)}
                      </h3>
                      <p className="text-[13px] leading-snug text-muted">
                        {t(`steps.${stepKey}.description`)}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </ScrollReveal>
      </Container>
    </section>
  );
}
