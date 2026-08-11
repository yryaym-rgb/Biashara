import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { requireAdminPage } from '@/lib/admin/session';
import { adminMiningEventsPath } from '@/lib/admin/path';
import { MiningEventForm } from '@/components/admin/mining-event-form';

export default async function AdminMiningEventNewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdminPage();

  const t = await getTranslations({ locale, namespace: 'admin.miningEvents' });

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div>
        <Link
          href={adminMiningEventsPath()}
          className="mb-4 inline-block text-[13px] font-semibold text-brand-blue hover:text-brand-blue-dark"
        >
          {t('backToList')}
        </Link>
        <h1>{t('createTitle')}</h1>
      </div>

      <MiningEventForm mode="create" cancelHref={adminMiningEventsPath()} />
    </div>
  );
}
