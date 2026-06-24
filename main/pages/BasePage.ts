import { expect, type Locator, type Page } from '@playwright/test';
import { APP_BASE_URL } from '../config/constants';

export abstract class BasePage {
  protected constructor(
    readonly page: Page,
    readonly path: string
  ) {}

  get url(): string {
    return `${APP_BASE_URL}${this.path}`;
  }

  async goto() {
    await this.page.goto(this.url, { waitUntil: 'domcontentloaded' });
  }

  async verifyUrl() {
    await expect(this.page).toHaveURL(this.url);
  }

  protected byTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }
}
