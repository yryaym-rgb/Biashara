import { expect, test } from '@playwright/test';
import { visitAndAssertClean } from '../helpers/console-monitor';
import {
  closeMobileNav,
  openMobileNav,
  switchLanguage,
  withPageMonitor,
} from '../helpers/interactions';

test.describe('marketing interactions', () => {
  test('navbar links navigate cleanly', async ({ page }) => {
    await visitAndAssertClean(page, '/', 'Le terminal des matières premières.');

    await withPageMonitor(page, async () => {
      const links = [
        { name: 'Place de marché', heading: 'Place de marché' },
        { name: 'Cotations', heading: 'Cotations des matières premières' },
        { name: 'Annuaire', heading: 'Annuaire' },
        { name: 'Ressources', heading: 'Comprendre le commerce minier en RDC' },
        { name: 'À propos', heading: 'À propos de BIASHARA' },
      ];

      for (const link of links) {
        await page.getByRole('link', { name: link.name }).first().click();
        await page.getByRole('heading', { name: link.heading }).first().waitFor({ state: 'visible' });
      }
    });
  });

  test('language switcher toggles locale', async ({ page }) => {
    await visitAndAssertClean(page, '/', 'Le terminal des matières premières.');

    await withPageMonitor(page, async () => {
      await switchLanguage(page, 'EN');
      await expect(page.getByRole('heading', { name: 'The commodities terminal.' })).toBeVisible();

      await switchLanguage(page, 'FR');
      await expect(page.getByRole('heading', { name: 'Le terminal des matières premières.' })).toBeVisible();
    });
  });

  test('mobile drawer opens and closes', async ({ page }) => {
    await visitAndAssertClean(page, '/', 'Le terminal des matières premières.');

    await withPageMonitor(page, async () => {
      await openMobileNav(page);
      await page.getByRole('link', { name: 'Place de marché' }).click();
      await page.getByRole('heading', { name: 'Place de marché' }).waitFor({ state: 'visible' });

      await page.goto('/');
      await openMobileNav(page);
      await closeMobileNav(page);
    });
  });

  test('hero search submits to marketplace', async ({ page }) => {
    await visitAndAssertClean(page, '/', 'Le terminal des matières premières.');

    await withPageMonitor(page, async () => {
      await page.getByLabel('Rechercher un minerai, une région…').fill('cobalt');
      await page.getByRole('button', { name: 'Rechercher' }).click();
      await page.waitForURL(/\/marketplace\?q=cobalt/);
      await page.getByRole('heading', { name: 'Place de marché' }).waitFor({ state: 'visible' });
    });
  });

  test('DRC map province link navigates to marketplace', async ({ page }) => {
    await visitAndAssertClean(page, '/', 'Le terminal des matières premières.');

    await withPageMonitor(page, async () => {
      const provinceLink = page.getByRole('link', { name: /Voir les annonces de/ }).first();
      await provinceLink.scrollIntoViewIfNeeded();
      await provinceLink.click();
      await page.waitForURL(/\/marketplace\?province=/);
      await page.getByRole('heading', { name: 'Place de marché' }).waitFor({ state: 'visible' });
    });
  });

  test('hero live prices panel is visible', async ({ page }) => {
    await visitAndAssertClean(page, '/', 'Le terminal des matières premières.');

    await withPageMonitor(page, async () => {
      await expect(
        page.getByRole('region', { name: 'Cotations minérales en direct dans le héros' }),
      ).toBeVisible();
      await expect(page.getByText('Marché en direct')).toBeVisible();
    });
  });
});

test.describe('auth page interactions', () => {
  test('login tabs switch without errors', async ({ page }) => {
    await visitAndAssertClean(page, '/login', 'Content de vous revoir !');

    await withPageMonitor(page, async () => {
      await page.getByRole('tab', { name: 'Connexion avec OTP' }).click();
      await expect(page.getByRole('tab', { name: 'Connexion avec OTP' })).toHaveAttribute(
        'aria-selected',
        'true',
      );

      await page.getByRole('tab', { name: 'Connexion', exact: true }).click();
      await expect(page.getByLabel('Mot de passe', { exact: true })).toBeVisible();
    });
  });

  test('register step 1 form fields are interactive', async ({ page }) => {
    await visitAndAssertClean(page, '/register', 'Créer un compte');

    await withPageMonitor(page, async () => {
      await page.getByLabel('Nom complet').fill('Test Acheteur E2E');
      await page.getByLabel('Adresse e-mail').fill('new-user@biashara.test');
      await page.getByLabel('Mot de passe', { exact: true }).fill('TestPassword123!');
      await page.getByLabel('Confirmer le mot de passe').fill('TestPassword123!');
      await page.getByLabel('Type de compte').selectOption('buyer');
      await page.getByRole('checkbox').check();
    });
  });

  test('forgot password form submits', async ({ page }) => {
    await visitAndAssertClean(page, '/forgot-password', 'Mot de passe oublié');

    await withPageMonitor(page, async () => {
      await page.getByLabel('Adresse e-mail').fill('test@example.com');
      await page.getByRole('button', { name: 'Envoyer le lien de réinitialisation' }).click();
      await page.getByRole('status').waitFor({ state: 'visible' });
    });
  });

  test('verify page shows error state for invalid link', async ({ page }) => {
    await withPageMonitor(page, async () => {
      await page.goto('/verify');
      await page.getByRole('heading', { name: 'Lien invalide ou expiré' }).waitFor({ state: 'visible' });
    });
  });
});
