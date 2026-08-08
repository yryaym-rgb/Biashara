import { expect, type Page } from '@playwright/test';

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export async function loginThroughUi(
  page: Page,
  {
    email,
    password,
    expectedPath = /\/dashboard$/,
  }: {
    email: string;
    password: string;
    expectedPath?: RegExp;
  },
) {
  await page.goto('/login');
  await page.getByRole('heading', { name: 'Content de vous revoir !' }).waitFor();
  await page.getByLabel('Adresse e-mail').fill(email);
  await page.getByLabel('Mot de passe', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.waitForURL(expectedPath);
  await expect(page.getByRole('heading', { name: 'Tableau de bord' }).first()).toBeVisible();
}

export async function loginAdminThroughUi(
  page: Page,
  {
    gateSecret,
    passphrase,
    email,
    password,
  }: {
    gateSecret: string;
    passphrase: string;
    email: string;
    password: string;
  },
) {
  await page.goto(`/${gateSecret}`);
  await page.getByRole('heading', { name: 'Accès administration' }).waitFor();
  await page.getByLabel('Phrase de passe').fill(passphrase);
  await page.getByRole('button', { name: 'Accéder' }).click();

  await page.getByRole('heading', { name: 'Connexion administration' }).waitFor();
  await page.getByLabel('Identifiant').fill(email);
  await page.getByLabel('Mot de passe', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Se connecter' }).click();

  await expect(page.getByText('Administration', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tableau de bord' }).first()).toBeVisible();
}
