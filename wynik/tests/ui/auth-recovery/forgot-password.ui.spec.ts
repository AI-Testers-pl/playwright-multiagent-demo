import { test, expect } from '../../../fixtures/pages.fixture';
import { createRegisterUser } from '../../../generators/userGenerator';
import { RegisterClient } from '../../../http-clients/RegisterClient';
import { ForgotPasswordPage } from '../../../pages/ForgotPasswordPage';

test.describe('Forgot password UI tests', () => {
  test('should request a password reset with a neutral success response', async ({
    forgotPasswordPage,
    page,
    request
  }) => {
    // given
    const registerClient = new RegisterClient(request);
    const user = createRegisterUser();
    await registerClient.createUser(user);
    await forgotPasswordPage.goto();

    // when
    const forgotPasswordResponse = page.waitForResponse(response =>
      ForgotPasswordPage.isForgotPasswordRequest(response.url()) &&
      response.request().method() === 'POST'
    );
    await forgotPasswordPage.requestReset(user.email);

    // then
    expect((await forgotPasswordResponse).status()).toBe(202);
    await expect(page).toHaveURL(forgotPasswordPage.url);
    await forgotPasswordPage.verifySuccessfulResetRequest();
  });

  test('should navigate back to login', async ({ forgotPasswordPage, loginPage, page }) => {
    // given
    await forgotPasswordPage.goto();

    // when
    await forgotPasswordPage.clickBackToLogin();

    // then
    await expect(page).toHaveURL(loginPage.url);
    await loginPage.verifyLoaded();
  });
});
