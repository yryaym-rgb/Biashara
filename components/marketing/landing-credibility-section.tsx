import { getTranslations } from 'next-intl/server';
import { ShieldCheck, Languages, PackageSearch } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { ScrollReveal } from '@/lib/motion/scroll-reveal';
import { cn } from '@/lib/utils/cn';

const PROBLEM_KEYS = ['opaquePrices', 'limitedTrust', 'complexChains'] as const;

type ProblemKey = (typeof PROBLEM_KEYS)[number];

const CREDIBILITY_KEYS = ['kyc', 'traceability', 'bilingual'] as const;

type CredibilityKey = (typeof CREDIBILITY_KEYS)[number];

const CREDIBILITY_ICONS: Record<CredibilityKey, typeof ShieldCheck> = {
  kyc: ShieldCheck,
  traceability: PackageSearch,
  bilingual: Languages,
};

const CREDIBILITY_TINT: Record<CredibilityKey, 'gold' | 'blue'> = {
  kyc: 'blue',
  traceability: 'gold',
  bilingual: 'blue',
};

const PROBLEM_TINT: Record<ProblemKey, 'gold' | 'blue'> = {
  opaquePrices: 'gold',
  limitedTrust: 'blue',
  complexChains: 'gold',
};

function ProblemNumber({
  number,
  tint,
}: {
  number: string;
  tint: 'gold' | 'blue';
}) {
  return (
    <span
      className={cn(
        'text-[48px] font-bold leading-none tabular-nums',
        tint === 'gold' ? 'text-brand-gold' : 'text-brand-blue',
      )}
      aria-hidden="true"
    >
      {number}
    </span>
  );
}

function CredibilityIcon({ itemKey }: { itemKey: CredibilityKey }) {
  const Icon = CREDIBILITY_ICONS[itemKey];
  const tint = CREDIBILITY_TINT[itemKey];

  return (
    <div
      className={cn(
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-button',
        tint === 'gold'
          ? 'bg-[color-mix(in_srgb,var(--brand-gold)_12%,transparent)]'
          : 'bg-[color-mix(in_srgb,var(--brand-blue)_12%,transparent)]',
      )}
    >
      <Icon className="h-6 w-6 text-brand-blue" strokeWidth={1.75} aria-hidden="true" />
    </div>
  );
}

export async function LandingCredibilitySection() {
  const t = await getTranslations('marketing.landing.credibility');

  return (
    <section className="bg-bg py-14 lg:py-24">
      <Container>
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} className="mb-12" />

        <div className="mb-12 flex flex-col gap-6">
          {PROBLEM_KEYS.map((problemKey) => (
            <ScrollReveal key={problemKey}>
              <article className="rounded-card border border-border bg-bg p-6 card-shadow lg:p-8">
                <div className="flex items-start gap-4">
                  <ProblemNumber
                    number={t(`problems.${problemKey}.number`)}
                    tint={PROBLEM_TINT[problemKey]}
                  />
                  <div className="flex min-w-0 flex-col gap-3">
                    <p className="eyebrow">{t(`problems.${problemKey}.tag`)}</p>
                    <p className="text-[18px] font-semibold leading-snug text-ink">
                      {t(`problems.${problemKey}.statement`)}
                    </p>
                  </div>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <p className="mb-12 text-center text-[34px] font-bold leading-tight text-ink">
            {t('pivot')}
          </p>
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-3">
          {CREDIBILITY_KEYS.map((itemKey) => (
            <ScrollReveal key={itemKey}>
              <Card hoverable className="h-full p-6">
                <div className="flex flex-col gap-4">
                  <CredibilityIcon itemKey={itemKey} />
                  <h3 className="text-[16px] font-semibold text-ink">
                    {t(`items.${itemKey}.title`)}
                  </h3>
                  <p className="text-[13px] leading-snug text-muted">
                    {t(`items.${itemKey}.description`)}
                  </p>
                </div>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
