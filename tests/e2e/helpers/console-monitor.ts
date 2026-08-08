import type { Page, ConsoleMessage } from '@playwright/test';

const IGNORED_CONSOLE_PATTERNS = [
  /Download the React DevTools/i,
  /Failed to load resource: the server responded with a status of 404/i,
];

export interface ConsoleMonitor {
  assertClean: () => void;
  dispose: () => void;
}

export function attachConsoleMonitor(page: Page): ConsoleMonitor {
  const errors: string[] = [];
  const pageErrors: string[] = [];

  const onConsole = (message: ConsoleMessage) => {
    if (message.type() !== 'error') {
      return;
    }

    const text = message.text();
    if (IGNORED_CONSOLE_PATTERNS.some((pattern) => pattern.test(text))) {
      return;
    }

    errors.push(text);
  };

  const onPageError = (error: Error) => {
    pageErrors.push(error.message);
  };

  page.on('console', onConsole);
  page.on('pageerror', onPageError);

  return {
    assertClean() {
      if (errors.length > 0 || pageErrors.length > 0) {
        const details = [
          ...errors.map((entry) => `console.error: ${entry}`),
          ...pageErrors.map((entry) => `pageerror: ${entry}`),
        ].join('\n');
        throw new Error(`Unexpected browser errors on ${page.url()}:\n${details}`);
      }
    },
    dispose() {
      page.off('console', onConsole);
      page.off('pageerror', onPageError);
    },
  };
}

export async function visitAndAssertClean(
  page: Page,
  path: string,
  heading: string | RegExp,
  options?: { waitMs?: number },
) {
  const monitor = attachConsoleMonitor(page);

  try {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: heading }).first().waitFor({ state: 'visible' });
    await page.waitForTimeout(options?.waitMs ?? 750);
    monitor.assertClean();
  } finally {
    monitor.dispose();
  }
}
