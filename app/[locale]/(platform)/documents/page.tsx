import { setRequestLocale, getTranslations } from 'next-intl/server';
import { requireAuth } from '@/lib/rbac';
import { getProfile } from '@/lib/auth/session';
import { getUserDocuments } from '@/lib/platform/documents';
import { DocumentsPageContent } from '@/components/platform/documents-page-content';
import { Container } from '@/components/ui/container';

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = requireAuth(await getProfile());
  const t = await getTranslations({ locale, namespace: 'platform.documents' });
  const documents = await getUserDocuments(profile.id);

  return (
    <Container>
      <div className="space-y-6">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
            {t('eyebrow')}
          </p>
          <h2 className="mt-2 text-[34px] font-bold text-ink">{t('title')}</h2>
          <p className="mt-2 text-[15px] text-body">{t('subtitle')}</p>
        </div>
        <DocumentsPageContent documents={documents} locale={locale} />
      </div>
    </Container>
  );
}
