'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import {
  MINING_EVENT_CATEGORIES,
  type MiningEventCategory,
} from '@/lib/constants/mining-events';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface CalendarCategoryTabsProps {
  activeCategory?: MiningEventCategory;
}

export function CalendarCategoryTabs({ activeCategory }: CalendarCategoryTabsProps) {
  const t = useTranslations('marketing.calendar');
  const router = useRouter();
  const activeValue = activeCategory ?? 'all';

  function buildHref(category: MiningEventCategory | 'all'): string {
    if (category === 'all') {
      return '/calendar';
    }
    return `/calendar?category=${category}`;
  }

  function handleChange(value: string) {
    router.push(buildHref(value as MiningEventCategory | 'all'));
  }

  return (
    <Tabs value={activeValue} onValueChange={handleChange}>
      <TabsList className="gap-8">
        <TabsTrigger value="all">{t('tabAll')}</TabsTrigger>
        {MINING_EVENT_CATEGORIES.map((category) => (
          <TabsTrigger key={category} value={category}>
            {t(`categories.${category}`)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
