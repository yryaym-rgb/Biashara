import { test as setup } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { E2E_ACCOUNT_FIXTURES, E2E_ADMIN_FIXTURE } from './fixtures/accounts';
import { loginAdminThroughUi, loginThroughUi, requireEnv } from './helpers/auth';

const authDir = path.join(__dirname, '.auth');

for (const fixture of E2E_ACCOUNT_FIXTURES) {
  setup(`authenticate ${fixture.role}`, async ({ page }) => {
    fs.mkdirSync(authDir, { recursive: true });

    await loginThroughUi(page, {
      email: requireEnv(fixture.emailEnv),
      password: requireEnv(fixture.passwordEnv),
    });

    await page.context().storageState({ path: path.join(authDir, fixture.storageFile) });
  });
}

setup('authenticate admin user', async ({ page }) => {
  fs.mkdirSync(authDir, { recursive: true });

  await loginAdminThroughUi(page, {
    gateSecret: requireEnv('ADMIN_GATE_SECRET'),
    passphrase: requireEnv('ADMIN_PASSPHRASE'),
    email: requireEnv(E2E_ADMIN_FIXTURE.emailEnv),
    password: requireEnv(E2E_ADMIN_FIXTURE.passwordEnv),
  });

  await page.context().storageState({ path: path.join(authDir, E2E_ADMIN_FIXTURE.storageFile) });
});
