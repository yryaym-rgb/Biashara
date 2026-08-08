import { test as setup } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { loginAdminThroughUi, loginThroughUi, requireEnv } from './helpers/auth';

const authDir = path.join(__dirname, '.auth');

setup('authenticate platform user', async ({ page }) => {
  fs.mkdirSync(authDir, { recursive: true });

  await loginThroughUi(page, {
    email: requireEnv('E2E_USER_EMAIL'),
    password: requireEnv('E2E_USER_PASSWORD'),
  });

  await page.context().storageState({ path: path.join(authDir, 'user.json') });
});

setup('authenticate admin user', async ({ page }) => {
  fs.mkdirSync(authDir, { recursive: true });

  await loginAdminThroughUi(page, {
    gateSecret: requireEnv('ADMIN_GATE_SECRET'),
    passphrase: requireEnv('ADMIN_PASSPHRASE'),
    email: requireEnv('E2E_ADMIN_EMAIL'),
    password: requireEnv('E2E_ADMIN_PASSWORD'),
  });

  await page.context().storageState({ path: path.join(authDir, 'admin.json') });
});
