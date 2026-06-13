import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class TrafficMonitorPage extends BasePage {
  readonly trafficMonitorPage: Locator;
  readonly title: Locator;
  readonly connectionStatus: Locator;
  readonly statusContainer: Locator;
  readonly eventsTitle: Locator;
  readonly clearButton: Locator;

  constructor(page: Page) {
    super(page, '/traffic');
    this.trafficMonitorPage = this.byTestId('traffic-monitor-page');
    this.title = this.byTestId('traffic-title');
    this.connectionStatus = this.byTestId('traffic-connection-status');
    this.statusContainer = this.byTestId('traffic-status-container');
    this.eventsTitle = this.byTestId('traffic-events-title');
    this.clearButton = this.byTestId('traffic-clear-button');
  }

  async verifyLoaded() {
    await this.verifyUrl();
    await expect(this.trafficMonitorPage).toBeVisible();
    await expect(this.title).toHaveText('Traffic Monitor');
    await expect(this.connectionStatus).toBeVisible();
    await expect(this.statusContainer).toBeVisible();
    await expect(this.eventsTitle).toHaveText('Recent Traffic Events');
    await expect(this.clearButton).toBeVisible();
  }
}
