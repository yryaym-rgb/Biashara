import { Users } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { EmptyState } from '@/components/ui/empty-state';

export interface DirectoryEmptyStateProps {
  locale: string;
  filtered?: boolean;
}

export async function DirectoryEmptyState({
  locale,
  filtered = false,
}: DirectoryEmptyStateProps) {
  const t = await getTranslations({ locale, namespace: 'platform.directory' });

  return (
    <EmptyState
      icon={<Users className="h-5 w-5" strokeWidth={1.75} />}
      title={filtered ? t('emptyFiltered') : t('empty')}
      description={filtered ? t('emptyFilteredDescription') : t('emptyDescription')}
      className="py-16"
    />
  );
}
