import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { DrcMiningMap } from '@/components/marketing/drc-mining-map';
import { AfricanNetworkTeaser } from '@/components/marketing/african-network-teaser';
import { ScrollReveal } from '@/lib/motion/scroll-reveal';
import { getActiveListingCountsByProvince } from '@/lib/marketplace/queries';

export async function LandingMapSection() {
  const t = await getTranslations('marketing.landing.map');
  const listingCounts = await getActiveListingCountsByProvince();

  return (
    <section className="bg-bg-tint py-14 lg:py-24">
      <Container>
        <SectionHeading
          eyebrow={t('eyebrow')}
          title={t('title')}
          className="mb-8"
        />

        <ScrollReveal>
          <div className="flex flex-col items-center gap-8">
            <DrcMiningMap listingCounts={listingCounts} />
            <p className="max-w-2xl text-center text-[13px] text-muted">
              {t('cobaltFact')}
            </p>
            <div className="w-full max-w-3xl">
              <AfricanNetworkTeaser />
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
