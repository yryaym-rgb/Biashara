import { setRequestLocale } from 'next-intl/server';
import { requireAuth } from '@/lib/rbac';
import { getProfile } from '@/lib/auth/session';
import { getNotificationsPage } from '@/lib/notifications/queries';
import { NotificationsPageContent } from '@/components/platform/notifications-page-content';
import { Container } from '@/components/ui/container';

function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw ?? '1', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export default async function NotificationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const profile = requireAuth(await getProfile());
  const rawSearchParams = await searchParams;
  const page = parsePage(rawSearchParams.page);

  const { notifications, total, totalPages } = await getNotificationsPage(profile.id, page);

  return (
    <Container>
      <NotificationsPageContent
        notifications={notifications}
        total={total}
        page={page}
        totalPages={totalPages}
        locale={locale}
      />
    </Container>
  );
}
