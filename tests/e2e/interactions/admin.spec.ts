import { expect, test } from '@playwright/test';
import { requireEnv } from '../helpers/auth';
import { visitAndAssertClean } from '../helpers/console-monitor';
import { withPageMonitor } from '../helpers/interactions';

const gateSecret = () => requireEnv('ADMIN_GATE_SECRET');

test.describe('admin interactions', () => {
  test('admin dashboard and navigation', async ({ page }) => {
    await visitAndAssertClean(page, `/${gateSecret()}`, 'Tableau de bord');

    await withPageMonitor(page, async () => {
      const navLinks = [
        { path: 'users', heading: 'Utilisateurs' },
        { path: 'kyc-review', heading: 'Vérification KYC' },
        { path: 'listings-moderation', heading: 'Modération des annonces' },
        { path: 'reports', heading: 'Rapports de plateforme' },
        { path: 'audit-log', heading: "Journal d'audit" },
      ];

      for (const link of navLinks) {
        await page.goto(`/${gateSecret()}/${link.path}`);
        await page.getByRole('heading', { name: link.heading }).waitFor({ state: 'visible' });
      }
    });
  });

  test('admin users search and filters', async ({ page }) => {
    await visitAndAssertClean(page, `/${gateSecret()}/users`, 'Utilisateurs');

    await withPageMonitor(page, async () => {
      await page.getByLabel('Rechercher par nom ou entreprise…').fill('E2E');
      await page.getByLabel('Filtrer par rôle').selectOption('cooperative');
      await page.getByLabel('Filtrer par statut KYC').selectOption('pending');
      await page.getByRole('button', { name: 'Appliquer' }).click();
      await page.waitForURL(/role=cooperative/);
    });
  });

  test('admin kyc review tabs', async ({ page }) => {
    await visitAndAssertClean(page, `/${gateSecret()}/kyc-review`, 'Vérification KYC');

    await withPageMonitor(page, async () => {
      await page.getByRole('link', { name: 'Approuvés' }).click();
      await page.waitForURL(/tab=approved/);
      await page.getByRole('link', { name: 'Rejetés' }).click();
      await page.waitForURL(/tab=rejected/);
      await page.getByRole('link', { name: 'En attente' }).click();
      await page.waitForURL(/tab=pending/);
    });
  });

  test('admin listings moderation tabs', async ({ page }) => {
    await visitAndAssertClean(page, `/${gateSecret()}/listings-moderation`, 'Modération des annonces');

    await withPageMonitor(page, async () => {
      await page.getByRole('link', { name: 'Actives' }).click();
      await page.waitForURL(/tab=active/);
      await page.getByRole('link', { name: 'Rejetées' }).click();
      await page.waitForURL(/tab=rejected/);
      await page.getByRole('link', { name: 'En attente' }).click();
      await page.waitForURL(/tab=pending_review/);
    });
  });

  test('admin reports exports', async ({ page }) => {
    await visitAndAssertClean(page, `/${gateSecret()}/reports`, 'Rapports de plateforme');

    await withPageMonitor(page, async () => {
      const exports = [
        'Utilisateurs / profils',
        'Annonces',
        'Commandes',
        "Journal d'audit",
        'Rapport de plateforme (PDF)',
      ];

      for (const name of exports) {
        const downloadPromise = page.waitForEvent('download');
        await page.getByRole('button', { name }).click();
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toBeTruthy();
      }
    });
  });

  test('admin global search', async ({ page }) => {
    await visitAndAssertClean(page, `/${gateSecret()}`, 'Tableau de bord');

    await withPageMonitor(page, async () => {
      const searchInput = page.getByPlaceholder(/Rechercher/i);
      if (await searchInput.isVisible()) {
        await searchInput.fill('E2E');
        await page.waitForTimeout(500);
      }
    });
  });
});
