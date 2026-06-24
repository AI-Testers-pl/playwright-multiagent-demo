import { test as base, type Page } from '@playwright/test';
import { APP_BASE_URL } from '../config/constants';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function enablePlaywrightUiStyleSnapshots(page: Page) {
  const stylesheetsUrl = new RegExp(`^${escapeRegExp(APP_BASE_URL)}/assets/.*\\.css(?:\\?.*)?$`);

  await page.route(stylesheetsUrl, async route => {
    try {
      const response = await route.fetch({ timeout: 15_000 });

      await route.fulfill({
        response,
        headers: {
          ...response.headers(),
          'access-control-allow-origin': '*'
        }
      });
    } catch {
      await route.continue().catch(() => undefined);
    }
  });
}

export const test = base.extend({
  page: async ({ page }, use) => {
    await enablePlaywrightUiStyleSnapshots(page);

    await use(page);
  }
});

export { expect } from '@playwright/test';
