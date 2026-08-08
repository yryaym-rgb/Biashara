import { defineConfig, devices } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

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

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 60_000,
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
      testMatch: /(marketing|auth-pages|console-guard)\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'platform',
      testMatch: /platform\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(authDir, 'user.json'),
      },
    },
    {
      name: 'admin',
      testMatch: /admin\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(authDir, 'admin.json'),
      },
    },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000/api/health',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
