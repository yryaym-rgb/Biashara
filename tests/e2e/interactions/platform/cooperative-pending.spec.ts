import { expect, test } from '@playwright/test';
import { visitAndAssertClean } from '../../helpers/console-monitor';
import { visitSettingsTab } from '../../helpers/interactions';

test.describe('cooperative-pending interactions', () => {
  test('cooperative-pending settings has no cooperative sites form', async ({ page }) => {
    await visitSettingsTab(page, 'profile');
    await expect(page.getByRole('heading', { name: 'Sites miniers' })).not.toBeVisible();
  });

  test('cooperative-pending cannot access lots creation', async ({ page }) => {
    await visitAndAssertClean(page, '/lots', /Mes lots|Accès refusé/);
    await visitAndAssertClean(page, '/lots/new', /Créer un lot|Accès refusé/);
  });

  test('cooperative-pending kyc tab shows pending status', async ({ page }) => {
    await visitSettingsTab(page, 'kyc');
    await expect(page.getByText(/en attente|pending|vérification/i).first()).toBeVisible();
  });
});
