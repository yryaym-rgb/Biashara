import { test } from '@playwright/test';
import { visitAndAssertClean } from './helpers/console-monitor';

test.describe('platform smoke', () => {
  test('dashboard', async ({ page }) => {
    await visitAndAssertClean(page, '/dashboard', 'Tableau de bord');
  });

  test('marketplace new listing', async ({ page }) => {
    await visitAndAssertClean(page, '/marketplace/new', 'Publier une annonce');
  });

  test('offers', async ({ page }) => {
    await visitAndAssertClean(page, '/offers', 'Mes offres');
  });

  test('orders', async ({ page }) => {
    await visitAndAssertClean(page, '/orders', 'Mes commandes');
  });

  test('messages', async ({ page }) => {
    await visitAndAssertClean(page, '/messages', 'Messagerie');
  });

  test('settings profile tab', async ({ page }) => {
    await visitAndAssertClean(page, '/settings', 'Paramètres');
  });

  test('settings security tab', async ({ page }) => {
    await visitAndAssertClean(page, '/settings?tab=security', 'Paramètres');
  });

  test('settings kyc tab', async ({ page }) => {
    await visitAndAssertClean(page, '/settings?tab=kyc', 'Paramètres');
  });

  test('settings listings tab', async ({ page }) => {
    await visitAndAssertClean(page, '/settings?tab=listings', 'Paramètres');
  });

  test('notifications', async ({ page }) => {
    await visitAndAssertClean(page, '/notifications', 'Notifications');
  });

  test('lots', async ({ page }) => {
    await visitAndAssertClean(page, '/lots', /Mes lots|Accès refusé/);
  });

  test('lots new', async ({ page }) => {
    await visitAndAssertClean(page, '/lots/new', /Créer un lot|Accès refusé/);
  });

  test('documents', async ({ page }) => {
    await visitAndAssertClean(page, '/documents', 'Documents');
  });
});
