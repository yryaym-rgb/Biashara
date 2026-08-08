import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { ListingGallery } from '@/components/marketplace/listing-gallery';
import { ListingPriceDisplay } from '@/components/marketplace/listing-price-display';
import { OfferForm } from '@/components/marketplace/offer-form';
import { ContactSellerPanel } from '@/components/marketplace/contact-seller-panel';
import { LotTraceabilityBadge } from '@/components/marketplace/lot-traceability-badge';
import { SellerCard } from '@/components/marketplace/seller-card';
import {
  formatGradePurityLine,
  formatQuantityValue,
} from '@/lib/marketplace/format';
import type { MarketplaceListingRow } from '@/lib/marketplace/queries';
import type { Profile } from '@/lib/auth/session';
import type { MineralId } from '@/lib/constants/minerals';
import { isKycApproved } from '@/lib/rbac';

export interface ListingDetailContentProps {
  listing: MarketplaceListingRow;
  profile: Profile | null;
  locale: string;
}

export async function ListingDetailContent({
  listing,
  profile,
  locale,
}: ListingDetailContentProps) {
  const t = await getTranslations({ locale, namespace: 'platform.marketplace.detail' });
  const tMinerals = await getTranslations({ locale, namespace: 'minerals' });
  const tUnits = await getTranslations({ locale, namespace: 'units' });

  const mineral = listing.mineral as MineralId;
  const gradeLine = formatGradePurityLine(listing.grade, listing.purity, locale);
  const quantityFormatted = formatQuantityValue(listing.quantity, locale);
  const unitLabel = tUnits(listing.unit);

  const canInteract =
    profile && isKycApproved(profile.kyc_status) && profile.id !== listing.seller_id;

  const loginHref = `/login?redirect=${encodeURIComponent(`/marketplace/${listing.id}`)}`;

  return (
    <Container className="pb-16 md:pb-24">
      <div className="pt-8">
        <Button asChild variant="ghost" size="sm" className="mb-6 h-auto px-0 py-1">
          <Link href="/marketplace">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            {t('back')}
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ListingGallery
          photos={listing.listing_photos ?? []}
          mineral={mineral}
          title={listing.title}
        />

        <div className="flex flex-col gap-6">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">
              {tMinerals(mineral)}
            </p>
            <h1 className="mt-2 text-[34px] font-bold leading-tight text-ink">{listing.title}</h1>
            {gradeLine ? (
              <p className="mt-2 text-[13px] text-muted">{gradeLine}</p>
            ) : null}
            {listing.lot_traceability ? (
              <div className="mt-3">
                <LotTraceabilityBadge
                  lotId={listing.lot_traceability.id}
                  lotCode={listing.lot_traceability.lot_code}
                  locale={locale}
                />
              </div>
            ) : null}
          </div>

          <ListingPriceDisplay
            mineral={mineral}
            priceAmount={listing.price_amount}
            priceCurrency={listing.price_currency}
            priceType={listing.price_type}
            unit={listing.unit}
            size="lg"
          />

          <div className="flex flex-col gap-2 text-base text-body">
            <p>
              <span className="font-semibold text-ink">{t('quantity')}: </span>
              {quantityFormatted} {unitLabel}
            </p>
            <p>
              <span className="font-semibold text-ink">{t('origin')}: </span>
              {listing.origin_province}
            </p>
          </div>

          {listing.certifications.length > 0 ? (
            <div className="flex flex-col gap-2">
              <span className="font-semibold text-ink">{t('certifications')}</span>
              <div className="flex flex-wrap gap-2">
                {listing.certifications.map((cert) => (
                  <Badge key={cert} variant="info">{cert}</Badge>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <h2 className="mb-2 text-[18px] font-semibold text-ink">{t('description')}</h2>
            <p className="text-base text-body whitespace-pre-wrap">{listing.description}</p>
          </div>

          <SellerCard seller={listing.seller} locale={locale} />

          <div className="flex flex-col gap-4">
            {canInteract ? (
              <>
                <OfferForm listingId={listing.id} maxQuantity={listing.quantity} />
                <ContactSellerPanel listingId={listing.id} />
              </>
            ) : profile ? (
              profile.id === listing.seller_id ? null : (
                <Button asChild variant="secondary">
                  <Link href="/settings">{t('loginToOffer')}</Link>
                </Button>
              )
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="primary">
                  <Link href={loginHref}>{t('loginToOffer')}</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href={loginHref}>{t('loginToContact')}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
