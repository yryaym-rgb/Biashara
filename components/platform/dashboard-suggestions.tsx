import { getTranslations } from 'next-intl/server';
import { ListingRow } from '@/components/marketplace/listing-row';
import type { SuggestionGroup } from '@/lib/platform/suggestions';

export interface DashboardSuggestionsProps {
  groups: SuggestionGroup[];
  locale: string;
}

export async function DashboardSuggestions({ groups, locale }: DashboardSuggestionsProps) {
  const t = await getTranslations({ locale, namespace: 'platform.dashboard.suggestions' });
  const tMinerals = await getTranslations({ locale, namespace: 'minerals' });

  return (
    <div className="space-y-8">
      <h2 className="text-[18px] font-semibold text-ink">{t('title')}</h2>
      {groups.map((group) => (
        <div key={group.mineral} className="space-y-4">
          <p className="text-[15px] text-body">
            {t('reason', { mineral: tMinerals(group.mineral) })}
          </p>
          <div className="rounded-card border border-border bg-bg card-shadow">
            {group.listings.map((listing) => (
              <div key={listing.id} className="px-6">
                <ListingRow listing={listing} locale={locale} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
