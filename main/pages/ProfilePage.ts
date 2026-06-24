import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProfilePage extends BasePage {
  readonly profilePage: Locator;
  readonly title: Locator;
  readonly userSection: Locator;
  readonly userTitle: Locator;
  readonly editForm: Locator;
  readonly emailInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page, '/profile');
    this.profilePage = this.byTestId('profile-page');
    this.title = this.byTestId('profile-title');
    this.userSection = this.byTestId('profile-user-section');
    this.userTitle = this.byTestId('profile-user-title');
    this.editForm = this.byTestId('user-edit-form');
    this.emailInput = this.byTestId('user-edit-email-input');
    this.firstNameInput = this.byTestId('user-edit-firstName-input');
    this.lastNameInput = this.byTestId('user-edit-lastName-input');
    this.submitButton = this.byTestId('user-edit-submit');
  }

  async verifyLoaded(user: { email: string; firstName: string; lastName: string }) {
    await this.verifyUrl();
    await expect(this.profilePage).toBeVisible();
    await expect(this.title).toHaveText('Profile');
    await expect(this.userSection).toBeVisible();
    await expect(this.userTitle).toHaveText('Personal Information');
    await expect(this.editForm).toBeVisible();
    await expect(this.emailInput).toHaveValue(user.email);
    await expect(this.firstNameInput).toHaveValue(user.firstName);
    await expect(this.lastNameInput).toHaveValue(user.lastName);
    await expect(this.submitButton).toBeVisible();
  }
}
