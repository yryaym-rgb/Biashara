import { getTranslations } from 'next-intl/server';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { PublicActivityFeed } from '@/components/activity/public-activity-feed';
import { ScrollReveal } from '@/lib/motion/scroll-reveal';

export async function LandingActivitySection() {
  const t = await getTranslations('activityFeed.landing');

  return (
    <section className="bg-bg-tint py-14 lg:py-24">
      <Container>
        <SectionHeading
          eyebrow={t('eyebrow')}
          title={t('title')}
          subtitle={t('subtitle')}
          className="mb-8"
        />

        <ScrollReveal>
          <Card className="overflow-hidden p-6 md:p-8">
            <PublicActivityFeed variant="section" />
          </Card>
        </ScrollReveal>
      </Container>
    </section>
  );
}
