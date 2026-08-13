import { expect, test } from '@playwright/test';
import { visitAndAssertClean } from '../../helpers/console-monitor';
import { visitSettingsTab, withPageMonitor } from '../../helpers/interactions';

test.describe('seller-specific interactions', () => {
  test('seller dashboard shows seller KPIs and quick actions', async ({ page }) => {
    await visitAndAssertClean(page, '/dashboard', 'Tableau de bord');

    await expect(page.getByText('Mes annonces actives')).toBeVisible();
    await expect(page.getByText('Offres reçues en attente')).toBeVisible();
    await expect(page.getByText('Commandes en cours')).toBeVisible();
    await expect(page.getByText('Chiffre d\'affaires ce mois')).toBeVisible();
    await expect(page.getByText('Demandes d\'achat actives')).not.toBeVisible();
    await expect(page.getByText('Mes lots')).not.toBeVisible();

    await expect(page.getByRole('link', { name: /Publier une annonce/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Explorer le marché/ })).toBeVisible();
  });

  test('seller can access new listing form', async ({ page }) => {
    await visitAndAssertClean(page, '/marketplace/new', 'Publier une annonce');

    await withPageMonitor(page, async () => {
      await page.getByLabel('Minerai').selectOption('cobalt');
      await page.getByLabel('Titre de l\'annonce').fill('E2E Test Cobalt Lot');
      await page.getByLabel('Description').fill('Annonce de test créée par la suite e2e Playwright.');
      await page.getByLabel('Quantité').fill('10');
      await page.getByLabel('Unité').selectOption('MT');
      await page.getByLabel('Province d\'origine').selectOption({ index: 1 });
    });
  });

  test('seller settings listings tab is visible', async ({ page }) => {
    await visitSettingsTab(page, 'listings');
    await expect(page.getByRole('tab', { name: 'Mes annonces' })).toHaveAttribute('aria-selected', 'true');
  });

  test('seller settings has no cooperative sites form', async ({ page }) => {
    await visitAndAssertClean(page, '/settings', 'Paramètres');
    await expect(page.getByRole('heading', { name: 'Sites miniers' })).not.toBeVisible();
  });

  test('seller cannot access lots', async ({ page }) => {
    await visitAndAssertClean(page, '/lots', /Mes lots|Accès refusé/);
  });
});
