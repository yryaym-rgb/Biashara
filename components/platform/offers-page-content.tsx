'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/lib/i18n/navigation';
import { OffersTabPanel } from '@/components/platform/offer-chain-card';
import type { OfferChain } from '@/lib/platform/offer-chain';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils/cn';

export interface OffersPageContentProps {
  sentChains: OfferChain[];
  receivedChains: OfferChain[];
  userId: string;
  initialTab: 'sent' | 'received';
}

export function OffersPageContent({
  sentChains,
  receivedChains,
  userId,
  initialTab,
}: OffersPageContentProps) {
  const t = useTranslations('platform.offers');
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <Tabs
        value={initialTab}
        onValueChange={(value) => {
          const params = new URLSearchParams();
          params.set('tab', value);
          router.replace(`${pathname}?${params.toString()}`);
        }}
      >
        <TabsList className="gap-6 border-0">
          <TabsTrigger value="sent" className="pb-2 text-[15px]">
            {t('tabs.sent')}
          </TabsTrigger>
          <TabsTrigger value="received" className="pb-2 text-[15px]">
            {t('tabs.received')}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className={cn(initialTab !== 'sent' && 'hidden')}>
        <OffersTabPanel
          chains={sentChains}
          tab="sent"
          userId={userId}
          emptyTitle={t('tabs.sent')}
          emptyDescription={t('emptySent')}
        />
      </div>

      <div className={cn(initialTab !== 'received' && 'hidden')}>
        <OffersTabPanel
          chains={receivedChains}
          tab="received"
          userId={userId}
          emptyTitle={t('tabs.received')}
          emptyDescription={t('emptyReceived')}
        />
      </div>
    </div>
  );
}
