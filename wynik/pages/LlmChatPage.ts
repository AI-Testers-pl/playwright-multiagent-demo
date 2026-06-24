import { expect, type Locator, type Page } from '@playwright/test';
import { LlmModePage } from './LlmModePage';

export class LlmChatPage extends LlmModePage {
  readonly chatPage: Locator;
  readonly settingsPanel: Locator;
  readonly systemPrompt: Locator;
  readonly systemPromptContent: Locator;
  readonly chatInput: Locator;
  readonly sendButton: Locator;

  constructor(page: Page) {
    super(page, '/llm/chat', 'llm-chat-mode', 'Conversational assistant');
    this.chatPage = this.byTestId('ollama-chat-page');
    this.settingsPanel = this.byTestId('chat-settings-panel');
    this.systemPrompt = this.byTestId('chat-system-prompt');
    this.systemPromptContent = this.byTestId('chat-system-prompt-content');
    this.chatInput = this.byTestId('chat-input');
    this.sendButton = this.byTestId('chat-send-button');
  }

  override async verifyLoaded() {
    await super.verifyLoaded();
    await expect(this.chatPage).toBeVisible();
    await expect(this.settingsPanel).toBeVisible();
    await expect(this.systemPrompt).toBeVisible();
    await expect(this.chatInput).toBeVisible();
    await expect(this.sendButton).toBeDisabled();
  }

  async verifySystemPrompt() {
    await expect(this.systemPromptContent).toContainText('You are an engineering copilot');
    await expect(this.systemPromptContent).toContainText('Ask clarifying questions');
  }

  async typeMessage(message: string) {
    await this.chatInput.fill(message);
  }

  async verifyReadyToSend(message: string) {
    await expect(this.chatInput).toHaveValue(message);
    await expect(this.sendButton).toBeEnabled();
  }
}
