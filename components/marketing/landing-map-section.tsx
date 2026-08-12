import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { DrcMiningMap } from '@/components/marketing/drc-mining-map';
import { AfricanNetworkWaitlist } from '@/components/marketing/african-network-waitlist';
import { ScrollReveal } from '@/lib/motion/scroll-reveal';
import { getActiveListingCountsByProvince } from '@/lib/marketplace/queries';

export async function LandingMapSection() {
  const t = await getTranslations('marketing.landing.map');
  const listingCounts = await getActiveListingCountsByProvince();

  return (
    <section className="bg-brand-blue-dark py-14 lg:py-24">
      <Container>
        <div className="mb-12 flex max-w-3xl flex-col gap-4">
          <p className="eyebrow text-[color:color-mix(in_srgb,var(--white)_60%,transparent)]">
            {t('eyebrow')}
          </p>
          <h2 className="text-[34px] font-bold leading-[1.2] text-[color:var(--white)]">
            {t('title')}
          </h2>
          <p className="text-base text-[color:color-mix(in_srgb,var(--white)_75%,transparent)]">
            {t('subtitle')}
          </p>
        </div>

        <ScrollReveal>
          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-16">
            <div className="flex flex-col items-center gap-6">
              <DrcMiningMap listingCounts={listingCounts} variant="dark" />
              <p className="max-w-xl text-center text-[13px] text-[color:color-mix(in_srgb,var(--white)_65%,transparent)]">
                {t('cobaltFact')}
              </p>
            </div>

            <div className="w-full">
              <AfricanNetworkWaitlist />
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
