import { expect, type Locator, type Page } from '@playwright/test';
import { LoggedInHeader } from '../components/LoggedInHeader';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly header: LoggedInHeader;
  readonly homePage: Locator;
  readonly welcomeTitle: Locator;
  readonly userEmail: Locator;
  readonly productsButton: Locator;
  readonly usersButton: Locator;
  readonly profileButton: Locator;
  readonly llmButton: Locator;
  readonly trafficButton: Locator;

  constructor(page: Page) {
    super(page, '/');
    this.header = new LoggedInHeader(page);
    this.homePage = this.byTestId('home-page');
    this.welcomeTitle = this.byTestId('home-welcome-title');
    this.userEmail = this.byTestId('home-user-email');
    this.productsButton = this.byTestId('home-products-button');
    this.usersButton = this.byTestId('home-users-button');
    this.profileButton = this.byTestId('home-profile-button');
    this.llmButton = this.byTestId('home-llm-button');
    this.trafficButton = this.byTestId('home-traffic-button');
  }

  async verifyLoggedInUser(user: { displayName: string; firstName: string; email: string }) {
    await this.verifyUrl();
    await expect(this.homePage).toBeVisible();
    await expect(this.welcomeTitle).toHaveText(`Welcome, ${user.firstName}!`);
    await expect(this.userEmail).toHaveText(user.email);
    await this.header.verifyVisible(user);
  }
}
