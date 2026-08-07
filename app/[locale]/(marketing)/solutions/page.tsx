import {
  Building2,
  Globe2,
  Handshake,
  Ship,
  type LucideIcon,
} from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { Badge } from '@/components/ui/badge';
import { LandingCtaBand } from '@/components/marketing/landing-cta-band';
import { ScrollReveal } from '@/lib/motion/scroll-reveal';
import { cn } from '@/lib/utils/cn';

const AUDIENCE_KEYS = ['cooperatives', 'traders', 'exporters', 'buyers'] as const;
type AudienceKey = (typeof AUDIENCE_KEYS)[number];

const AUDIENCE_ICONS: Record<AudienceKey, LucideIcon> = {
  cooperatives: Building2,
  traders: Handshake,
  exporters: Ship,
  buyers: Globe2,
};

const AUDIENCE_TINT: Record<AudienceKey, 'gold' | 'blue'> = {
  cooperatives: 'gold',
  traders: 'blue',
  exporters: 'gold',
  buyers: 'blue',
};

const CAPABILITY_KEYS = ['capability1', 'capability2', 'capability3'] as const;
type CapabilityKey = (typeof CAPABILITY_KEYS)[number];

const COMING_SOON: Record<AudienceKey, Record<CapabilityKey, boolean>> = {
  cooperatives: { capability1: false, capability2: false, capability3: true },
  traders: { capability1: false, capability2: false, capability3: false },
  exporters: { capability1: false, capability2: false, capability3: true },
  buyers: { capability1: false, capability2: false, capability3: false },
};

function AudienceIcon({ audienceKey }: { audienceKey: AudienceKey }) {
  const Icon = AUDIENCE_ICONS[audienceKey];
  const tint = AUDIENCE_TINT[audienceKey];

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

export default async function SolutionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('marketing.solutions');

  return (
    <>
      <section className="bg-bg py-14 lg:py-24">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow={t('eyebrow')}
            title={t('title')}
            subtitle={t('subtitle')}
            className="mb-12"
          />

          <div className="grid gap-6 md:grid-cols-2">
            {AUDIENCE_KEYS.map((audienceKey) => (
              <ScrollReveal key={audienceKey}>
                <Card hoverable className="h-full p-6">
                  <div className="flex flex-col gap-4">
                    <AudienceIcon audienceKey={audienceKey} />
                    <div>
                      <h3 className="text-[18px] font-semibold text-ink">
                        {t(`audiences.${audienceKey}.title`)}
                      </h3>
                      <p className="mt-1 text-[13px] text-muted">
                        {t(`audiences.${audienceKey}.forWhom`)}
                      </p>
                    </div>
                    <ul className="flex flex-col gap-3">
                      {CAPABILITY_KEYS.map((capKey) => (
                          <li
                            key={capKey}
                            className="flex items-start justify-between gap-3 text-[15px] text-body"
                          >
                            <span>{t(`audiences.${audienceKey}.${capKey}.label`)}</span>
                            {COMING_SOON[audienceKey][capKey] ? (
                              <Badge variant="warning" className="shrink-0">
                                {t('comingSoon')}
                              </Badge>
                            ) : null}
                          </li>
                        ))}
                    </ul>
                  </div>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </section>

      <LandingCtaBand
        namespace="marketing.solutions.cta"
        primaryHref="/register"
        showSecondary={false}
      />
    </>
  );
}
