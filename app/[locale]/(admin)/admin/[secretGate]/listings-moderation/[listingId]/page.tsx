import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { ArrowLeft } from 'lucide-react';
import { getProfile } from '@/lib/auth/session';
import { requireAdminPage } from '@/lib/admin/session';
import { getListingById } from '@/lib/marketplace/queries';
import { ListingDetailContent } from '@/components/marketplace/listing-detail-content';
import { ListingModerationActions } from '@/components/admin/listing-moderation-actions';
import { adminListingsModerationPath } from '@/lib/admin/path';
import { Button } from '@/components/ui/button';

export default async function AdminListingDetailPage({
  params,
}: {
  params: Promise<{ locale: string; listingId: string }>;
}) {
  const { locale, listingId } = await params;
  setRequestLocale(locale);
  await requireAdminPage();

  const listing = await getListingById(listingId);
  if (!listing) {
    notFound();
  }

  const profile = await getProfile();

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-[1200px]">
        <Button asChild variant="ghost" size="sm" className="mb-4 h-auto px-0 py-1">
          <Link href={adminListingsModerationPath()}>
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </Button>
        <ListingModerationActions
          listingId={listing.id}
          showActions={listing.status === 'pending_review'}
        />
      </div>
      <ListingDetailContent listing={listing} profile={profile} locale={locale} />
    </div>
  );
}
