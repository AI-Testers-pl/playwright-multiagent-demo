import { expect, type Locator, type Page } from '@playwright/test';

export class ToastAlert {
  readonly viewport: Locator;
  readonly title: Locator;
  readonly description: Locator;

  constructor(page: Page) {
    this.viewport = page.getByTestId('toast-viewport');
    this.title = page.getByTestId('toast-title');
    this.description = page.getByTestId('toast-description');
  }

  async verifyAlertSuccess(message: string) {
    await expect(this.title).toHaveText('Success');
    await expect(this.description).toHaveText(message);
  }

  async verifyAlert(title: string, message: string) {
    await expect(this.title).toHaveText(title);
    await expect(this.description).toHaveText(message);
  }

  async verifyAlertFailure(message: string) {
    await expect(this.title).toHaveText('Error');
    await expect(this.description).toHaveText(message);
  }
}
