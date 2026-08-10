import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { CooperativeSitesForm } from '@/components/platform/cooperative-sites-form';

const refreshMock = vi.fn();

vi.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string, values?: Record<string, unknown>) => {
    if (namespace === 'platform.settings.cooperativeSites') {
      const labels: Record<string, string> = {
        title: 'Sites miniers',
        description: 'Gérez vos sites.',
        siteLabel: `Site ${values?.index ?? ''}`,
        siteName: 'Nom du site',
        zeaReference: 'Référence ZEA',
        zeaHint: 'Hint',
        province: 'Province',
        removeSite: 'Supprimer',
        addSite: 'Ajouter un site',
        submit: 'Enregistrer',
        success: 'Enregistré',
        error: 'Erreur',
        forbidden: 'Interdit',
      };
      return labels[key] ?? key;
    }
    return key;
  },
}));

vi.mock('@/lib/i18n/navigation', () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

vi.mock('@/actions/lots', () => ({
  saveCooperativeSitesAction: vi.fn(),
}));

describe('CooperativeSitesForm', () => {
  beforeEach(() => {
    refreshMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders one empty draft row with a stable sentinel id when no initial sites', () => {
    render(<CooperativeSitesForm initialSites={[]} />);

    expect(screen.getByText('Sites miniers')).toBeInTheDocument();
    expect(screen.getByText('Site 1')).toBeInTheDocument();
    expect(screen.getByText('Nom du site')).toBeInTheDocument();
  });

  it('maps existing cooperative sites into editable rows', () => {
    render(
      <CooperativeSitesForm
        initialSites={[
          {
            id: 'site-abc',
            cooperative_id: 'coop-1',
            site_name: 'Kolwezi Nord',
            zea_reference: 'ZEA-001',
            province: 'Lualaba',
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
          },
        ]}
      />,
    );

    expect(screen.getByDisplayValue('Kolwezi Nord')).toBeInTheDocument();
    expect(screen.getByDisplayValue('ZEA-001')).toBeInTheDocument();
  });

  it('adds a second site row when clicking add site', () => {
    render(<CooperativeSitesForm initialSites={[]} />);

    fireEvent.click(screen.getByRole('button', { name: 'Ajouter un site' }));

    expect(screen.getByText('Site 1')).toBeInTheDocument();
    expect(screen.getByText('Site 2')).toBeInTheDocument();
    expect(screen.getAllByText('Nom du site')).toHaveLength(2);
  });
});
