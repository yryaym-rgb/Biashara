import { BrainCircuit, LineChart, Lock, ShieldCheck, Truck } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { LandingActivityBand } from '@/components/marketing/landing-activity-band';
import { LandingCredibilitySection } from '@/components/marketing/landing-credibility-section';
import { LandingCtaBand } from '@/components/marketing/landing-cta-band';
import { LandingGrowthStatsSection } from '@/components/marketing/landing-growth-stats-section';
import { LandingHero } from '@/components/marketing/landing-hero';
import { LandingHowItWorksSection } from '@/components/marketing/landing-how-it-works-section';
import { LandingMapSection } from '@/components/marketing/landing-map-section';
import { LandingPricesSection } from '@/components/marketing/landing-prices-section';
import { ScrollReveal } from '@/lib/motion/scroll-reveal';
import { cn } from '@/lib/utils/cn';

const FEATURE_KEYS = [
  'priceTransparency',
  'blockchainTraceability',
  'securePayments',
  'smartLogistics',
  'aiMarketIntelligence',
] as const;

type FeatureKey = (typeof FEATURE_KEYS)[number];

const FEATURE_ICONS: Record<FeatureKey, typeof LineChart> = {
  priceTransparency: LineChart,
  blockchainTraceability: ShieldCheck,
  securePayments: Lock,
  smartLogistics: Truck,
  aiMarketIntelligence: BrainCircuit,
};

const FEATURE_ICON_TINT: Record<FeatureKey, 'gold' | 'blue'> = {
  priceTransparency: 'gold',
  blockchainTraceability: 'blue',
  securePayments: 'gold',
  smartLogistics: 'blue',
  aiMarketIntelligence: 'gold',
};

function FeatureIcon({ featureKey }: { featureKey: FeatureKey }) {
  const Icon = FEATURE_ICONS[featureKey];
  const tint = FEATURE_ICON_TINT[featureKey];

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

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('marketing.landing');

  return (
    <>
      <LandingHero />
      <LandingActivityBand />

      <section className="bg-bg-tint py-12 lg:py-16">
        <Container>
          <ScrollReveal>
            <Card className="overflow-hidden">
              <div
                className={cn(
                  'grid grid-cols-1 gap-0',
                  'min-[481px]:grid-cols-2',
                  'md:grid-cols-5 md:divide-x md:divide-border',
                )}
              >
                {FEATURE_KEYS.map((featureKey) => (
                  <div
                    key={featureKey}
                    className={cn(
                      'flex flex-col items-center gap-3 px-4 py-8 text-center sm:px-6',
                      'max-[480px]:border-b border-border last:max-[480px]:border-b-0',
                      'min-[481px]:max-md:[&:nth-child(odd)]:border-r min-[481px]:max-md:border-b border-border',
                      'min-[481px]:max-md:[&:nth-last-child(-n+2)]:border-b-0',
                      'min-[481px]:max-md:[&:nth-child(even)]:border-r-0',
                      'min-[481px]:max-md:[&:last-child]:border-r-0',
                    )}
                  >
                    <FeatureIcon featureKey={featureKey} />
                    <h3 className="text-[15px] font-semibold leading-snug text-ink">
                      {t(`features.${featureKey}.title`)}
                    </h3>
                    <p className="text-[13px] leading-snug text-muted">
                      {t(`features.${featureKey}.description`)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </ScrollReveal>
        </Container>
      </section>

      <LandingGrowthStatsSection />
      <LandingHowItWorksSection />
      <LandingPricesSection />
      <LandingCredibilitySection />
      <LandingMapSection />
      <LandingCtaBand />
    </>
  );
}
