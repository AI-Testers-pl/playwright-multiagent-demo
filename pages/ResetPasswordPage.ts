import { expect, type Locator, type Page } from '@playwright/test';
import { ToastAlert } from '../components/ToastAlert';
import { BasePage } from './BasePage';

const PASSWORD_RESET_ENDPOINT = '/api/v1/users/password/reset';
const INVALID_TOKEN_MESSAGE = 'Invalid password reset token';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class ResetPasswordPage extends BasePage {
  readonly toast: ToastAlert;
  readonly resetPage: Locator;
  readonly title: Locator;
  readonly subtitle: Locator;
  readonly tokenInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly backToLoginButton: Locator;

  constructor(page: Page) {
    super(page, '/reset');
    this.toast = new ToastAlert(page);
    this.resetPage = this.byTestId('reset-page');
    this.title = this.byTestId('reset-title');
    this.subtitle = this.byTestId('reset-subtitle');
    this.tokenInput = this.byTestId('reset-token-input');
    this.passwordInput = this.byTestId('reset-password-input');
    this.confirmPasswordInput = this.byTestId('reset-confirm-password-input');
    this.submitButton = this.byTestId('reset-submit-button');
    this.backToLoginButton = this.byTestId('reset-back-to-login');
  }

  static isResetPasswordRequest(url: string) {
    return url.endsWith(PASSWORD_RESET_ENDPOINT);
  }

  getUrlWithToken(token: string) {
    return `${this.url}?token=${encodeURIComponent(token)}`;
  }

  async gotoWithToken(token: string) {
    await this.page.goto(this.getUrlWithToken(token));
  }

  async verifyLoaded() {
    await expect(this.page).toHaveURL(new RegExp(`^${escapeRegExp(this.url)}(?:\\?.*)?$`));
    await expect(this.resetPage).toBeVisible();
    await expect(this.title).toHaveText('Reset password');
    await expect(this.subtitle).toHaveText('Choose a new password for your account.');
    await expect(this.tokenInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.confirmPasswordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
    await expect(this.backToLoginButton).toBeVisible();
  }

  async resetPassword(passwords: { token: string; newPassword: string; confirmPassword: string }) {
    await this.tokenInput.fill(passwords.token);
    await this.passwordInput.fill(passwords.newPassword);
    await this.confirmPasswordInput.fill(passwords.confirmPassword);
    await this.submitButton.click();
  }

  async clickBackToLogin() {
    await this.backToLoginButton.click();
  }

  async verifyInvalidTokenError() {
    await this.toast.verifyAlert('Reset failed', INVALID_TOKEN_MESSAGE);
  }
}
