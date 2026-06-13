import { test as base, type Page } from '@playwright/test';
import { APP_BASE_URL } from '../config/constants';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function enablePlaywrightUiStyleSnapshots(page: Page) {
  const stylesheetsUrl = new RegExp(`^${escapeRegExp(APP_BASE_URL)}/assets/.*\\.css(?:\\?.*)?$`);

  await page.route(stylesheetsUrl, async route => {
    const response = await route.fetch();

    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        'access-control-allow-origin': '*'
      }
    });
  });
}

export const test = base.extend({
  page: async ({ page }, use) => {
    await enablePlaywrightUiStyleSnapshots(page);

    await use(page);
  }
});

export { expect } from '@playwright/test';
