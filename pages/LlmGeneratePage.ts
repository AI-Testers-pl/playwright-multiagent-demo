import { expect, type Locator, type Page } from '@playwright/test';
import { LlmModePage } from './LlmModePage';

export class LlmGeneratePage extends LlmModePage {
  readonly generatePage: Locator;
  readonly settingsPanel: Locator;
  readonly promptInput: Locator;
  readonly generateButton: Locator;

  constructor(page: Page) {
    super(page, '/llm/generate', 'llm-generate-mode', 'Single prompt generation');
    this.generatePage = this.byTestId('ollama-generate-page');
    this.settingsPanel = this.byTestId('generate-settings-panel');
    this.promptInput = this.byTestId('prompt-input');
    this.generateButton = this.byTestId('generate-button');
  }

  override async verifyLoaded() {
    await super.verifyLoaded();
    await expect(this.generatePage).toBeVisible();
    await expect(this.settingsPanel).toBeVisible();
    await expect(this.promptInput).toBeVisible();
    await expect(this.generateButton).toBeDisabled();
  }

  async fillPrompt(prompt: string) {
    await this.promptInput.fill(prompt);
  }

  async verifyReadyToGenerate(prompt: string) {
    await expect(this.promptInput).toHaveValue(prompt);
    await expect(this.generateButton).toBeEnabled();
  }
}
