import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export abstract class LlmModePage extends BasePage {
  readonly root: Locator;
  readonly title: Locator;
  readonly backLink: Locator;
  readonly workspace: Locator;
  readonly modelInput: Locator;
  readonly temperatureLabel: Locator;
  readonly temperatureSlider: Locator;
  readonly thinkingLabel: Locator;
  readonly thinkingCheckbox: Locator;

  protected constructor(
    page: Page,
    path: string,
    rootTestId: string,
    titleText: string
  ) {
    super(page, path);
    this.root = this.byTestId(rootTestId);
    this.title = page.getByRole('heading', { name: titleText });
    this.backLink = this.byTestId('llm-back-link');
    this.workspace = this.byTestId('llm-mode-workspace');
    this.modelInput = this.byTestId('model-input');
    this.temperatureLabel = this.byTestId('temperature-label');
    this.temperatureSlider = this.byTestId('temperature-slider');
    this.thinkingLabel = this.byTestId('thinking-label');
    this.thinkingCheckbox = this.byTestId('thinking-checkbox');
  }

  async verifyLoaded() {
    await this.verifyUrl();
    await expect(this.root).toBeVisible();
    await expect(this.title).toBeVisible();
    await expect(this.backLink).toHaveText('Back to overview');
    await expect(this.workspace).toBeVisible();
  }

  async verifyDefaultSettings(expectedTemperature: string) {
    await expect(this.modelInput).toHaveValue('qwen3.5:2b');
    await expect(this.temperatureLabel).toHaveText(`Temperature: ${expectedTemperature}`);
    await expect(this.temperatureSlider).toHaveValue(String(Number(expectedTemperature)));
    await expect(this.thinkingCheckbox).not.toBeChecked();
  }

  async setModel(model: string) {
    await this.modelInput.fill(model);
  }

  async enableThinking() {
    await this.thinkingCheckbox.focus();
    await this.thinkingCheckbox.press('Space');
    await expect(this.thinkingCheckbox).toBeChecked();
  }

  async goBackToOverview() {
    await this.backLink.click();
  }
}
