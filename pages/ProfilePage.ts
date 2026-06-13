import { expect, type Locator, type Page } from '@playwright/test';
import { LoggedInHeader } from '../components/LoggedInHeader';
import { ToastAlert } from '../components/ToastAlert';
import { BasePage } from './BasePage';

const USER_UPDATE_SUCCESS_MESSAGE = 'User information updated successfully';

export class ProfilePage extends BasePage {
  readonly header: LoggedInHeader;
  readonly toast: ToastAlert;
  readonly profilePage: Locator;
  readonly title: Locator;
  readonly userSection: Locator;
  readonly userTitle: Locator;
  readonly editForm: Locator;
  readonly emailInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly submitButton: Locator;
  readonly promptSection: Locator;
  readonly promptTitle: Locator;
  readonly systemPromptInput: Locator;
  readonly systemPromptSubmitButton: Locator;
  readonly toolPromptInput: Locator;
  readonly toolPromptSubmitButton: Locator;
  readonly ordersSection: Locator;
  readonly orderListTitle: Locator;
  readonly orderStatusFilter: Locator;
  readonly emptyOrdersMessage: Locator;

  constructor(page: Page) {
    super(page, '/profile');
    this.header = new LoggedInHeader(page);
    this.toast = new ToastAlert(page);
    this.profilePage = this.byTestId('profile-page');
    this.title = this.byTestId('profile-title');
    this.userSection = this.byTestId('profile-user-section');
    this.userTitle = this.byTestId('profile-user-title');
    this.editForm = this.byTestId('user-edit-form');
    this.emailInput = this.byTestId('user-edit-email-input');
    this.firstNameInput = this.byTestId('user-edit-firstName-input');
    this.lastNameInput = this.byTestId('user-edit-lastName-input');
    this.submitButton = this.byTestId('user-edit-submit');
    this.promptSection = this.byTestId('profile-prompt-section');
    this.promptTitle = this.byTestId('profile-prompt-title');
    this.systemPromptInput = this.byTestId('profile-prompt-input');
    this.systemPromptSubmitButton = this.byTestId('profile-prompt-submit');
    this.toolPromptInput = this.byTestId('profile-tool-prompt-input');
    this.toolPromptSubmitButton = this.byTestId('profile-tool-prompt-submit');
    this.ordersSection = this.byTestId('profile-orders-section');
    this.orderListTitle = this.byTestId('order-list-title');
    this.orderStatusFilter = this.byTestId('order-list-status-filter');
    this.emptyOrdersMessage = this.byTestId('order-list-empty');
  }

  async verifyLoaded(user: { email: string; firstName: string; lastName: string }) {
    await this.verifyUrl();
    await expect(this.profilePage).toBeVisible();
    await expect(this.title).toHaveText('Profile');
    await expect(this.profilePage.getByText(`${user.firstName} ${user.lastName}`, { exact: true })).toBeVisible();
    await expect(this.profilePage.getByText(user.email, { exact: true })).toBeVisible();
    await expect(this.userSection).toBeVisible();
    await expect(this.userTitle).toHaveText('Personal Information');
    await expect(this.editForm).toBeVisible();
    await expect(this.emailInput).toHaveValue(user.email);
    await expect(this.firstNameInput).toHaveValue(user.firstName);
    await expect(this.lastNameInput).toHaveValue(user.lastName);
    await expect(this.submitButton).toBeVisible();
  }

  async updatePersonalInformation(user: { email: string; firstName: string; lastName: string }) {
    await this.emailInput.fill(user.email);
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.submitButton.click();
  }

  async verifySuccessfulUserUpdate() {
    await this.toast.verifyAlertSuccess(USER_UPDATE_SUCCESS_MESSAGE);
  }

  async verifyPromptSectionLoaded() {
    await expect(this.promptSection).toBeVisible();
    await expect(this.promptTitle).toHaveText('System Prompts');
    await expect(this.systemPromptInput).toBeVisible();
    await expect(this.systemPromptSubmitButton).toBeVisible();
    await expect(this.toolPromptInput).toBeVisible();
    await expect(this.toolPromptSubmitButton).toBeVisible();
  }

  async verifyEmptyOrderHistoryLoaded() {
    await expect(this.ordersSection).toBeVisible();
    await expect(this.orderListTitle).toHaveText('Your Orders');
    await expect(this.orderStatusFilter).toBeVisible();
    await expect(this.orderStatusFilter).toHaveValue('ALL');
    await expect(this.emptyOrdersMessage).toHaveText("You don't have any orders yet.");
  }
}
