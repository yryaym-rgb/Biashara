import { setRequestLocale } from 'next-intl/server';
import { requireAuth } from '@/lib/rbac';
import { getProfile } from '@/lib/auth/session';
import { getReceivedOfferChains, getSentOfferChains } from '@/lib/platform/offers';
import { OffersPageContent } from '@/components/platform/offers-page-content';
import { Container } from '@/components/ui/container';

export default async function OffersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = requireAuth(await getProfile());
  const rawSearchParams = await searchParams;
  const tabParam = rawSearchParams.tab;
  const initialTab = tabParam === 'received' ? 'received' : 'sent';

  const [sentChains, receivedChains] = await Promise.all([
    getSentOfferChains(profile.id),
    getReceivedOfferChains(profile.id),
  ]);

  return (
    <Container>
      <OffersPageContent
        sentChains={sentChains}
        receivedChains={receivedChains}
        userId={profile.id}
        initialTab={initialTab}
      />
    </Container>
  );
}
