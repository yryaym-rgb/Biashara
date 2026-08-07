'use client';

import { useState, useTransition } from 'react';
import { useRouter } from '@/lib/i18n/navigation';
import { useTranslations } from 'next-intl';
import { approveListing, rejectListing } from '@/actions/admin/listings';
import { Button } from '@/components/ui/button';
import { RejectDialog } from '@/components/admin/reject-dialog';

export interface ListingModerationActionsProps {
  listingId: string;
  showActions: boolean;
}

export function ListingModerationActions({
  listingId,
  showActions,
}: ListingModerationActionsProps) {
  const t = useTranslations('admin.listingsModeration');
  const router = useRouter();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!showActions) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        loading={isPending}
        onClick={() => {
          startTransition(async () => {
            await approveListing({ listingId });
            router.refresh();
          });
        }}
      >
        {t('approve')}
      </Button>
      <Button
        size="sm"
        variant="secondary"
        className="text-danger"
        onClick={() => setRejectOpen(true)}
      >
        {t('reject')}
      </Button>
      <RejectDialog
        open={rejectOpen}
        title={t('rejectDialogTitle')}
        onClose={() => setRejectOpen(false)}
        onConfirm={async (reason) => {
          const result = await rejectListing({ listingId, reason });
          if (!result.error) {
            router.refresh();
          }
          return result;
        }}
      />
    </div>
  );
}
