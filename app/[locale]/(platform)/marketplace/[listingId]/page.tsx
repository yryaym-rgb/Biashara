import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getProfile } from '@/lib/auth/session';
import { ListingDetailContent } from '@/components/marketplace/listing-detail-content';
import { getListingById } from '@/lib/marketplace/queries';

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ locale: string; listingId: string }>;
}) {
  const { locale, listingId } = await params;
  setRequestLocale(locale);

  const listing = await getListingById(listingId);
  if (!listing) {
    notFound();
  }

  const profile = await getProfile();

  return <ListingDetailContent listing={listing} profile={profile} locale={locale} />;
}
