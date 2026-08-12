import { defineConfig, devices } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { E2E_ACCOUNT_FIXTURES, E2E_ADMIN_FIXTURE } from './tests/e2e/fixtures/accounts';

function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (!existsSync(envPath)) {
    return;
  }

  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separator = trimmed.indexOf('=');
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const authDir = path.join(__dirname, 'tests/e2e/.auth');
const serverMode = process.env.PLAYWRIGHT_SERVER_MODE ?? 'production';

const webServerCommand =
  serverMode === 'dev'
    ? 'npm run dev'
    : process.env.PLAYWRIGHT_WEB_SERVER_COMMAND ?? 'npm run start';

const webServer =
  serverMode === 'dev'
    ? {
        command: webServerCommand,
        url: 'http://localhost:3000/api/health',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          ...process.env,
          ALLOW_NAVBAR_FIXTURE: '1',
        },
      }
    : {
        command: webServerCommand,
        url: 'http://localhost:3000/api/health',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          ...process.env,
          ALLOW_NAVBAR_FIXTURE: '1',
        },
      };

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 90_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'guest',
      testMatch: /(marketing|auth-pages|console-guard|navbar-overlap)\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'guest-interactions',
      testMatch: /interactions\/guest\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    ...E2E_ACCOUNT_FIXTURES.map((fixture) => ({
      name: fixture.role,
      testMatch: new RegExp(
        `interactions/platform/(shared|${fixture.role.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\.spec\\.ts${
          fixture.role === 'seller' ? '|platform\\.spec\\.ts' : ''
        }`,
      ),
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(authDir, fixture.storageFile),
      },
    })),
    {
      name: 'admin',
      testMatch: /(admin\.spec\.ts|interactions\/admin\.spec\.ts)/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(authDir, E2E_ADMIN_FIXTURE.storageFile),
      },
    },
  ],
  webServer,
});
