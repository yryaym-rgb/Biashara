import { BrainCircuit, LineChart, Lock, ShieldCheck, Truck } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { HeroImage } from '@/components/marketing/hero-image';
import { LandingCredibilitySection } from '@/components/marketing/landing-credibility-section';
import { LandingCtaBand } from '@/components/marketing/landing-cta-band';
import { LandingHowItWorksSection } from '@/components/marketing/landing-how-it-works-section';
import { LandingMapSection } from '@/components/marketing/landing-map-section';
import { LandingPricesSection } from '@/components/marketing/landing-prices-section';
import { HeroQuickSearch } from '@/components/marketing/hero-quick-search';
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
      <section className="relative bg-bg pb-12 lg:pb-16">
        <Container className="pt-10 lg:pt-16">
          <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="relative z-[2] flex flex-col gap-4">
              <p className="eyebrow flex items-center gap-2">
                <span className="hero-live-dot" aria-hidden="true" />
                {t('eyebrow')}
              </p>

              <h1 className="text-[36px] font-bold leading-[1.1] text-ink min-[481px]:text-[56px]">
                <span className="hero-line hero-line-1 block">{t('heroLine1')}</span>
                <span className="hero-line hero-line-2 block">{t('heroLine2')}</span>
                <span className="hero-line hero-line-3 block text-brand-gold">{t('heroLine3')}</span>
              </h1>

              <p className="max-w-[34rem] text-base text-body">{t('subtitle')}</p>

              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                <Button asChild variant="primary" className="hero-cta-shimmer w-full sm:w-auto">
                  <Link href="/marketplace">{t('ctaMarketplace')}</Link>
                </Button>
                <Button asChild variant="ghost" className="w-full sm:w-auto">
                  <Link href="#">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-bg-tint"
                      aria-hidden="true"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3.5 w-3.5 fill-brand-blue"
                        aria-hidden="true"
                      >
                        <path d="M9 7.5v9l7.5-4.5L9 7.5z" />
                      </svg>
                    </span>
                    {t('ctaVideo')}
                  </Link>
                </Button>
              </div>

              <HeroQuickSearch />
            </div>

            <HeroImage
              imageAlt={t('heroImageAlt')}
              placeholderLabel={t('heroImagePlaceholder')}
            />
          </div>
        </Container>

        <Container className="relative z-[1] mt-4">
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

      <LandingHowItWorksSection />
      <LandingPricesSection />
      <LandingCredibilitySection />
      <LandingMapSection />
      <LandingCtaBand />
    </>
  );
}
