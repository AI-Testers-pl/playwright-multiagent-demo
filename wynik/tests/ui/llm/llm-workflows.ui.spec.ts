import { test } from '../../../fixtures/auth.fixture';
import { LlmChatPage } from '../../../pages/LlmChatPage';
import { LlmGeneratePage } from '../../../pages/LlmGeneratePage';
import { LlmPage } from '../../../pages/LlmPage';
import { LlmToolsPage } from '../../../pages/LlmToolsPage';

test.describe('LLM workflow UI tests', () => {
  test('should navigate from LLM overview to each workflow', async ({ page }) => {
    // given
    const llmPage = new LlmPage(page);
    const generatePage = new LlmGeneratePage(page);
    const chatPage = new LlmChatPage(page);
    const toolsPage = new LlmToolsPage(page);
    await llmPage.goto();
    await llmPage.verifyLoaded();

    // when
    await llmPage.openGenerate();

    // then
    await generatePage.verifyLoaded();

    // when
    await generatePage.goBackToOverview();
    await llmPage.verifyLoaded();
    await llmPage.openChat();

    // then
    await chatPage.verifyLoaded();

    // when
    await chatPage.goBackToOverview();
    await llmPage.verifyLoaded();
    await llmPage.openTools();

    // then
    await toolsPage.verifyLoaded();
  });

  test('should configure and prepare a single prompt generation request', async ({ page }) => {
    // given
    const generatePage = new LlmGeneratePage(page);
    const prompt = 'Return a one sentence smoke-test answer.';
    await generatePage.goto();
    await generatePage.verifyLoaded();
    await generatePage.verifyDefaultSettings('0.80');

    // when
    await generatePage.setModel('qwen3.5:2b');
    await generatePage.enableThinking();
    await generatePage.fillPrompt(prompt);

    // then
    await generatePage.verifyReadyToGenerate(prompt);
  });

  test('should show chat guidance and enable sending when a message is entered', async ({ page }) => {
    // given
    const chatPage = new LlmChatPage(page);
    const message = 'What should I check before testing checkout?';
    await chatPage.goto();
    await chatPage.verifyLoaded();
    await chatPage.verifyDefaultSettings('0.80');
    await chatPage.verifySystemPrompt();

    // when
    await chatPage.typeMessage(message);

    // then
    await chatPage.verifyReadyToSend(message);
  });

  test('should expose catalog tool context and enable tool chat input', async ({ page }) => {
    // given
    const toolsPage = new LlmToolsPage(page);
    const message = 'List two available catalog products.';
    await toolsPage.goto();
    await toolsPage.verifyLoaded();
    await toolsPage.verifyDefaultSettings('0.40');
    await toolsPage.verifyToolDefinitions();
    await toolsPage.verifySystemPrompt();

    // when
    await toolsPage.typeMessage(message);

    // then
    await toolsPage.verifyReadyToSend(message);
  });
});
