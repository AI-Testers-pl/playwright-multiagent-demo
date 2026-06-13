import { expect, type Locator, type Page } from '@playwright/test';
import { ToastAlert } from '../components/ToastAlert';
import { BasePage } from './BasePage';

const RESET_REQUEST_SUCCESS_MESSAGE = 'If the account exists, we sent password reset instructions.';
const PASSWORD_FORGOT_ENDPOINT = '/api/v1/users/password/forgot';

export class ForgotPasswordPage extends BasePage {
  readonly toast: ToastAlert;
  readonly forgotPage: Locator;
  readonly title: Locator;
  readonly subtitle: Locator;
  readonly identifierInput: Locator;
  readonly submitButton: Locator;
  readonly backToLoginButton: Locator;

  constructor(page: Page) {
    super(page, '/forgot-password');
    this.toast = new ToastAlert(page);
    this.forgotPage = this.byTestId('forgot-page');
    this.title = this.byTestId('forgot-title');
    this.subtitle = this.byTestId('forgot-subtitle');
    this.identifierInput = this.byTestId('forgot-identifier-input');
    this.submitButton = this.byTestId('forgot-submit-button');
    this.backToLoginButton = this.byTestId('forgot-back-to-login');
  }

  static isForgotPasswordRequest(url: string) {
    return url.endsWith(PASSWORD_FORGOT_ENDPOINT);
  }

  async verifyLoaded() {
    await this.verifyUrl();
    await expect(this.forgotPage).toBeVisible();
    await expect(this.title).toHaveText('Forgot password');
    await expect(this.subtitle).toHaveText('Enter your username or e-mail and we will send a password reset link.');
    await expect(this.identifierInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
    await expect(this.backToLoginButton).toBeVisible();
  }

  async requestReset(identifier: string) {
    await this.identifierInput.fill(identifier);
    await this.submitButton.click();
  }

  async clickBackToLogin() {
    await this.backToLoginButton.click();
  }

  async verifySuccessfulResetRequest() {
    await this.toast.verifyAlert('Check your email', RESET_REQUEST_SUCCESS_MESSAGE);
  }
}
