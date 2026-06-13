import { expect, type Locator, type Page } from '@playwright/test';
import { APP_BASE_URL } from '../config/constants';
import { BasePage } from './BasePage';

export class AdminDashboardPage extends BasePage {
  readonly adminNavigationLink: Locator;
  readonly adminDashboardPage: Locator;
  readonly title: Locator;
  readonly metrics: Locator;
  readonly manageProductsLink: Locator;
  readonly viewOrdersLink: Locator;

  constructor(page: Page) {
    super(page, '/admin');
    this.adminNavigationLink = this.byTestId('desktop-menu-admin');
    this.adminDashboardPage = this.byTestId('admin-dashboard-page');
    this.title = this.byTestId('admin-dashboard-title');
    this.metrics = this.byTestId('admin-dashboard-metrics');
    this.manageProductsLink = this.byTestId('admin-dashboard-products-link');
    this.viewOrdersLink = this.byTestId('admin-dashboard-orders-link');
  }

  get homeUrl(): string {
    return APP_BASE_URL;
  }

  async gotoHome() {
    await this.page.goto(this.homeUrl);
  }

  async openFromNavigation() {
    await this.adminNavigationLink.click();
  }

  async verifyAdminNavigationVisible() {
    await expect(this.adminNavigationLink).toBeVisible();
  }

  async verifyAdminNavigationHidden() {
    await expect(this.adminNavigationLink).toBeHidden();
  }

  async verifyLoaded() {
    await this.verifyUrl();
    await expect(this.adminDashboardPage).toBeVisible();
    await expect(this.title).toHaveText('Admin Dashboard');
    await expect(this.metrics).toBeVisible();
    await expect(this.manageProductsLink).toBeVisible();
    await expect(this.viewOrdersLink).toBeVisible();
  }

  async verifyNotLoaded() {
    await expect(this.adminDashboardPage).toBeHidden();
  }
}
