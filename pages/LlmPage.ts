import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LlmPage extends BasePage {
  readonly llmPage: Locator;
  readonly title: Locator;
  readonly modeGrid: Locator;
  readonly generateCard: Locator;
  readonly chatCard: Locator;
  readonly toolsCard: Locator;

  constructor(page: Page) {
    super(page, '/llm');
    this.llmPage = this.byTestId('llm-page');
    this.title = this.byTestId('llm-title');
    this.modeGrid = this.byTestId('llm-mode-grid');
    this.generateCard = this.byTestId('llm-mode-card-generate');
    this.chatCard = this.byTestId('llm-mode-card-chat');
    this.toolsCard = this.byTestId('llm-mode-card-tools');
  }

  async verifyLoaded() {
    await this.verifyUrl();
    await expect(this.llmPage).toBeVisible();
    await expect(this.title).toHaveText('Orchestrate generate, chat, and tool flows in one cockpit');
    await expect(this.modeGrid).toBeVisible();
    await expect(this.generateCard).toBeVisible();
    await expect(this.chatCard).toBeVisible();
    await expect(this.toolsCard).toBeVisible();
  }
}
