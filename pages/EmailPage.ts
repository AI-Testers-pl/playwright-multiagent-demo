import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class EmailPage extends BasePage {
  readonly emailPage: Locator;
  readonly title: Locator;
  readonly form: Locator;
  readonly toInput: Locator;
  readonly subjectInput: Locator;
  readonly messageInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page, '/email');
    this.emailPage = this.byTestId('email-page');
    this.title = this.byTestId('email-page-title');
    this.form = this.byTestId('email-form');
    this.toInput = this.byTestId('email-to-input');
    this.subjectInput = this.byTestId('email-subject-input');
    this.messageInput = this.byTestId('email-message-input');
    this.submitButton = this.byTestId('email-submit-button');
  }

  async verifyLoaded() {
    await this.verifyUrl();
    await expect(this.emailPage).toBeVisible();
    await expect(this.title).toHaveText('Send Email');
    await expect(this.form).toBeVisible();
    await expect(this.toInput).toBeVisible();
    await expect(this.subjectInput).toBeVisible();
    await expect(this.messageInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }
}
