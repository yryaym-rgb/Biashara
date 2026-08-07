import { MapPin } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui/button';
import { ListingThumb } from '@/components/marketplace/listing-thumb';
import { ListingPriceDisplay } from '@/components/marketplace/listing-price-display';
import {
  formatGradePurityLine,
  formatQuantityValue,
  getPrimaryPhoto,
} from '@/lib/marketplace/format';
import type { MarketplaceListingRow } from '@/lib/marketplace/queries';
import type { MineralId } from '@/lib/constants/minerals';

export interface ListingRowProps {
  listing: MarketplaceListingRow;
  locale: string;
}

export async function ListingRow({ listing, locale }: ListingRowProps) {
  const t = await getTranslations({ locale, namespace: 'platform.marketplace' });
  const tMinerals = await getTranslations({ locale, namespace: 'minerals' });
  const tUnits = await getTranslations({ locale, namespace: 'units' });

  const mineral = listing.mineral as MineralId;
  const photoPath = getPrimaryPhoto(listing);
  const gradeLine = formatGradePurityLine(listing.grade, listing.purity, locale);
  const quantityFormatted = formatQuantityValue(listing.quantity, locale);
  const unitLabel = tUnits(listing.unit);
  const sellerName = listing.seller?.company_name ?? t('sellerUnknown');

  return (
    <article
      className="flex flex-col gap-4 border-b border-border py-6 last:border-b-0 md:flex-row md:items-center md:gap-6"
    >
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <ListingThumb
          mineral={mineral}
          storagePath={photoPath}
          alt={listing.title}
        />

        <div className="min-w-0 flex-1">
          <h3 className="truncate">{listing.title}</h3>
          <p className="mt-1 text-[13px] text-muted">
            {tMinerals(mineral)}
            {gradeLine ? ` · ${gradeLine}` : ''}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4 shrink-0 text-brand-blue" strokeWidth={1.75} aria-hidden="true" />
              <span>
                {listing.origin_province}
                {listing.seller?.company_name ? ` · ${sellerName}` : ''}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-start gap-3 md:items-end md:text-right">
        <p className="text-[13px] text-muted">
          {t('quantityAvailable', { quantity: quantityFormatted, unit: unitLabel })}
        </p>

        <ListingPriceDisplay
          mineral={mineral}
          priceAmount={listing.price_amount}
          priceCurrency={listing.price_currency}
          priceType={listing.price_type}
          unit={listing.unit}
        />

        <Button asChild variant="primary" size="sm">
          <Link href={`/marketplace/${listing.id}`}>{t('viewDetails')}</Link>
        </Button>
      </div>
    </article>
  );
}
