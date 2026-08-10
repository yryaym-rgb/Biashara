'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/lib/i18n/navigation';
import { MINERAL_IDS, type MineralId } from '@/lib/constants/minerals';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface RfpCategoryTabsProps {
  activeMineral?: MineralId;
  baseSearchParams: Record<string, string>;
}

export function RfpCategoryTabs({ activeMineral, baseSearchParams }: RfpCategoryTabsProps) {
  const t = useTranslations('platform.rfps');
  const tMinerals = useTranslations('minerals');
  const router = useRouter();
  const activeValue = activeMineral ?? 'all';

  function buildHref(mineral: MineralId | 'all'): string {
    const params = new URLSearchParams(baseSearchParams);
    if (mineral === 'all') {
      params.delete('mineral');
    } else {
      params.set('mineral', mineral);
    }
    params.delete('page');
    const query = params.toString();
    return query ? `/rfps?${query}` : '/rfps';
  }

  function handleChange(value: string) {
    router.push(buildHref(value as MineralId | 'all'));
  }

  return (
    <Tabs value={activeValue} onValueChange={handleChange}>
      <TabsList className="gap-8">
        <TabsTrigger value="all">{t('tabAll')}</TabsTrigger>
        {MINERAL_IDS.map((mineral) => (
          <TabsTrigger key={mineral} value={mineral}>
            {tMinerals(mineral)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
