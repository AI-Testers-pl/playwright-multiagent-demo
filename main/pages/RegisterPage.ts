import { expect, type Locator, type Page } from '@playwright/test';
import { ToastAlert } from '../components/ToastAlert';
import type { RegisterDto } from '../types/auth';
import { BasePage } from './BasePage';

const SUCCESSFUL_REGISTRATION_MESSAGE = 'Registration successful! You can now log in.';
const USERNAME_ALREADY_EXISTS_TOAST = 'Username already exists';

export class RegisterPage extends BasePage {
  readonly toast: ToastAlert;
  readonly registerPage: Locator;
  readonly title: Locator;
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly submitButton: Locator;
  readonly loginButton: Locator;
  readonly usernameError: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly firstNameError: Locator;
  readonly lastNameError: Locator;

  constructor(page: Page) {
    super(page, '/register');
    this.toast = new ToastAlert(page);
    this.registerPage = this.byTestId('register-page');
    this.title = this.byTestId('register-title');
    this.usernameInput = this.byTestId('register-username-input');
    this.emailInput = this.byTestId('register-email-input');
    this.passwordInput = this.byTestId('register-password-input');
    this.firstNameInput = this.byTestId('register-firstname-input');
    this.lastNameInput = this.byTestId('register-lastname-input');
    this.submitButton = this.byTestId('register-submit-button');
    this.loginButton = this.byTestId('register-login-link');
    this.usernameError = this.byTestId('register-username-error');
    this.emailError = this.byTestId('register-email-error');
    this.passwordError = this.byTestId('register-password-error');
    this.firstNameError = this.byTestId('register-firstname-error');
    this.lastNameError = this.byTestId('register-lastname-error');
  }

  async register(user: RegisterDto) {
    await this.usernameInput.fill(user.username);
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.submitButton.click();
  }

  async submit() {
    await this.submitButton.click();
  }

  async clickLoginButton() {
    await this.loginButton.click();
  }

  async verifySuccessfulRegistrationToast() {
    await this.toast.verifyAlertSuccess(SUCCESSFUL_REGISTRATION_MESSAGE);
  }

  async verifyUsernameAlreadyExistsToast() {
    await this.toast.verifyAlertFailure(USERNAME_ALREADY_EXISTS_TOAST);
  }

  async verifyErrorToastVisible() {
    await expect(this.toast.title).toHaveText('Error');
  }

  async verifyRequiredFieldErrors() {
    await expect(this.usernameError).toHaveText('Username is required');
    await expect(this.emailError).toHaveText('Email is required');
    await expect(this.passwordError).toHaveText('Password is required');
    await expect(this.firstNameError).toHaveText('First name is required');
    await expect(this.lastNameError).toHaveText('Last name is required');
  }

  async verifyNoToast() {
    await expect(this.toast.viewport).toBeEmpty();
  }
}
