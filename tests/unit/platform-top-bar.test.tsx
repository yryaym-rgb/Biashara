import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { PlatformTopBar } from '@/components/platform/platform-top-bar';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const labels: Record<string, string> = {
      cooperative: 'Coopérative',
    };
    return labels[key] ?? key;
  },
}));

vi.mock('@/actions/auth', () => ({
  logoutAction: vi.fn(),
}));

vi.mock('@/components/admin/admin-shell', () => ({
  AdminMenuButton: ({ label }: { label: string }) => <button type="button">{label}</button>,
}));

vi.mock('@/components/platform/command-palette', () => ({
  CommandPaletteTrigger: () => (
    <button type="button" aria-label="Ouvrir la recherche">
      Search
    </button>
  ),
}));

vi.mock('@/components/platform/notification-bell', () => ({
  NotificationBell: () => <button type="button">Notifications</button>,
}));

vi.mock('@/components/platform/user-avatar-menu', () => ({
  UserAvatarMenu: ({ email }: { email: string | null }) => (
    <button type="button" aria-label="Menu utilisateur">
      Avatar {email}
    </button>
  ),
}));

vi.mock('@/components/auth/logout-confirm-dialog', () => ({
  LogoutConfirmDialog: () => null,
}));

const baseProps = {
  pageTitle: 'Tableau de bord',
  companyName: 'Coop Minière',
  email: 'user@example.com',
  role: 'cooperative' as const,
  locale: 'fr',
  onMenuClick: vi.fn(),
  menuButtonLabel: 'Ouvrir le menu',
  recentNotifications: [],
  unreadNotificationsCount: 2,
};

describe('PlatformTopBar', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows page title and role badge without prominent email or display name', () => {
    render(<PlatformTopBar {...baseProps} />);

    expect(screen.getByRole('heading', { name: 'Tableau de bord' })).toBeInTheDocument();
    expect(screen.getByText(/Coopérative/)).toBeInTheDocument();
    expect(screen.queryByText('user@example.com')).not.toBeInTheDocument();
    expect(screen.queryByText('Coop Minière')).not.toBeInTheDocument();
  });

  it('search trigger is the command palette trigger', () => {
    render(<PlatformTopBar {...baseProps} />);
    expect(screen.getByRole('button', { name: 'Ouvrir la recherche' })).toBeInTheDocument();
  });
});
