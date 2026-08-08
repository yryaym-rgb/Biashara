'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { kycStatusVariant, listingStatusVariant } from '@/lib/admin/display';
import type { Database } from '@/types/database.types';

type KycDocument = Database['public']['Tables']['kyc_documents']['Row'];
type Listing = Database['public']['Tables']['listings']['Row'];
type KycStatus = Database['public']['Enums']['kyc_status'];

export interface SettingsKycPanelProps {
  kycStatus: KycStatus;
  rejectedDocuments: KycDocument[];
}

export function SettingsKycPanel({ kycStatus, rejectedDocuments }: SettingsKycPanelProps) {
  const t = useTranslations('platform.settings');
  const tKyc = useTranslations('kyc');
  const tKycStatus = useTranslations('admin.kycStatus');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('kyc')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge variant={kycStatusVariant(kycStatus)}>
            {tKycStatus(kycStatus)}
          </Badge>
          <p className="text-[15px] text-body">
            {kycStatus === 'approved'
              ? t('kycApproved')
              : kycStatus === 'rejected'
                ? t('kycRejected')
                : t('kycPending')}
          </p>
        </div>

        {rejectedDocuments.length > 0 ? (
          <div className="space-y-3 rounded-card border border-border bg-bg-tint p-4">
            {rejectedDocuments.map((doc) => (
              <div key={doc.id}>
                <p className="text-[15px] font-semibold text-ink">{tKyc(doc.type)}</p>
                {doc.rejection_reason ? (
                  <p className="mt-1 text-[13px] text-danger">{doc.rejection_reason}</p>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export interface SettingsListingsPanelProps {
  listings: Listing[];
}

export function SettingsListingsPanel({ listings }: SettingsListingsPanelProps) {
  const t = useTranslations('platform.settings');
  const tListingStatus = useTranslations('admin.listingStatus');

  if (listings.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('myListings')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="border-b border-border pb-4 last:border-b-0 last:pb-0"
          >
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[15px] font-semibold text-ink">{listing.title}</p>
              <Badge variant={listingStatusVariant(listing.status)}>
                {tListingStatus(listing.status)}
              </Badge>
            </div>
            {listing.status === 'rejected' && listing.rejection_reason ? (
              <p className="mt-2 text-[13px] text-danger">{listing.rejection_reason}</p>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
