import { test, expect } from '../../../fixtures/pages.fixture';
import { ResetPasswordPage } from '../../../pages/ResetPasswordPage';

test.describe('Reset password UI tests', () => {
  test('should prefill reset token from the URL', async ({ resetPasswordPage, page }) => {
    // given
    const token = 'ui-invalid-token';

    // when
    await resetPasswordPage.gotoWithToken(token);

    // then
    await expect(page).toHaveURL(resetPasswordPage.getUrlWithToken(token));
    await resetPasswordPage.verifyLoaded();
    await expect(resetPasswordPage.tokenInput).toHaveValue(token);
  });

  test('should show an error for an invalid reset token', async ({ resetPasswordPage, page }) => {
    // given
    const token = 'ui-invalid-token';
    await resetPasswordPage.gotoWithToken(token);

    // when
    const resetPasswordResponse = page.waitForResponse(response =>
      ResetPasswordPage.isResetPasswordRequest(response.url()) &&
      response.request().method() === 'POST'
    );
    await resetPasswordPage.resetPassword({
      token,
      newPassword: 'ResetPassword123!',
      confirmPassword: 'ResetPassword123!'
    });

    // then
    expect((await resetPasswordResponse).status()).toBe(400);
    await expect(page).toHaveURL(resetPasswordPage.getUrlWithToken(token));
    await resetPasswordPage.verifyInvalidTokenError();
  });

  test('should navigate back to login', async ({ loginPage, page, resetPasswordPage }) => {
    // given
    await resetPasswordPage.gotoWithToken('ui-invalid-token');

    // when
    await resetPasswordPage.clickBackToLogin();

    // then
    await expect(page).toHaveURL(loginPage.url);
    await loginPage.verifyLoaded();
  });
});
