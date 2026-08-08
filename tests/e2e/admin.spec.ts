import { test } from '@playwright/test';
import { requireEnv } from './helpers/auth';
import { visitAndAssertClean } from './helpers/console-monitor';

const gateSecret = () => requireEnv('ADMIN_GATE_SECRET');

test.describe('admin smoke', () => {
  test('dashboard', async ({ page }) => {
    await visitAndAssertClean(page, `/${gateSecret()}`, 'Tableau de bord');
  });

  test('users', async ({ page }) => {
    await visitAndAssertClean(page, `/${gateSecret()}/users`, 'Utilisateurs');
  });

  test('kyc review', async ({ page }) => {
    await visitAndAssertClean(page, `/${gateSecret()}/kyc-review`, 'Vérification KYC');
  });

  test('listings moderation', async ({ page }) => {
    await visitAndAssertClean(page, `/${gateSecret()}/listings-moderation`, 'Modération des annonces');
  });

  test('reports', async ({ page }) => {
    await visitAndAssertClean(page, `/${gateSecret()}/reports`, 'Rapports de plateforme');
  });

  test('audit log', async ({ page }) => {
    await visitAndAssertClean(page, `/${gateSecret()}/audit-log`, "Journal d'audit");
  });
});
