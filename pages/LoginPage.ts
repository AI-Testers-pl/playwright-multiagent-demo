import { expect, type Locator, type Page } from '@playwright/test';
import { ToastAlert } from '../components/ToastAlert';
import type { LoginDto } from '../types/auth';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly toast: ToastAlert;
  readonly loginPage: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly usernameError: Locator;
  readonly passwordError: Locator;
  readonly registerButton: Locator;
  readonly registerLink: Locator;

  constructor(page: Page) {
    super(page, '/login');
    this.toast = new ToastAlert(page);
    this.loginPage = this.byTestId('login-page');
    this.usernameInput = this.byTestId('login-username-input');
    this.passwordInput = this.byTestId('login-password-input');
    this.submitButton = this.byTestId('login-submit-button');
    this.usernameError = this.byTestId('login-username-error');
    this.passwordError = this.byTestId('login-password-error');
    this.registerButton = this.byTestId('login-register-link');
    this.registerLink = this.byTestId('register-link');
  }

  async verifyLoaded() {
    await this.verifyUrl();
    await expect(this.loginPage).toBeVisible();
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async login(credentials: LoginDto) {
    await this.usernameInput.fill(credentials.username);
    await this.passwordInput.fill(credentials.password);
    await this.submitButton.click();
  }

  async clickRegisterButton() {
    await this.registerButton.click();
  }

  async clickRegisterLink() {
    await this.registerLink.click();
  }
}
