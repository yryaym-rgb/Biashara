import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { HeroGallery } from '@/components/marketing/hero-gallery';
import { getAvailableHeroGallerySlides } from '@/lib/marketing/hero-gallery-slides';
import { LandingActivitySection } from '@/components/marketing/landing-activity-section';
import { LandingCredibilitySection } from '@/components/marketing/landing-credibility-section';
import { LandingCtaBand } from '@/components/marketing/landing-cta-band';
import { LandingHowItWorksSection } from '@/components/marketing/landing-how-it-works-section';
import { LandingInfrastructureSection } from '@/components/marketing/landing-infrastructure-section';
import { LandingMapSection } from '@/components/marketing/landing-map-section';
import { LandingPricesSection } from '@/components/marketing/landing-prices-section';
import { HeroQuickSearch } from '@/components/marketing/hero-quick-search';

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('marketing.landing');
  const heroGallerySlides = getAvailableHeroGallerySlides(locale);

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

            <HeroGallery
              slides={heroGallerySlides}
              placeholderLabel={t('heroImagePlaceholder')}
            />
          </div>
        </Container>
      </section>

      <LandingInfrastructureSection />
      <LandingHowItWorksSection />
      <LandingPricesSection />
      <LandingActivitySection />
      <LandingCredibilitySection />
      <LandingMapSection />
      <LandingCtaBand />
    </>
  );
}
