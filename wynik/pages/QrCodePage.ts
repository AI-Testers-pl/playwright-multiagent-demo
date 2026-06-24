import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class QrCodePage extends BasePage {
  readonly qrCodePage: Locator;
  readonly title: Locator;
  readonly generator: Locator;
  readonly textInput: Locator;
  readonly generateButton: Locator;
  readonly clearButton: Locator;

  constructor(page: Page) {
    super(page, '/qr');
    this.qrCodePage = this.byTestId('qr-code-page');
    this.title = this.byTestId('qr-code-title');
    this.generator = this.byTestId('qr-generator');
    this.textInput = this.byTestId('qr-text-input');
    this.generateButton = this.byTestId('qr-generate-button');
    this.clearButton = this.byTestId('qr-clear-button');
  }

  async verifyLoaded() {
    await this.verifyUrl();
    await expect(this.qrCodePage).toBeVisible();
    await expect(this.title).toHaveText('QR Code Generator');
    await expect(this.generator).toBeVisible();
    await expect(this.textInput).toBeVisible();
    await expect(this.generateButton).toBeVisible();
    await expect(this.clearButton).toBeVisible();
  }
}
