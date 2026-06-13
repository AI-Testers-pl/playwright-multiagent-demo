import { test, expect } from '../../fixtures/pages.fixture';
import type { LoginDto } from '../../types/auth';
import { ADMIN_PASSWORD, ADMIN_USER } from '../../config/constants';

test.describe('Login UI tests', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('should successfully login with valid credentials', async ({ homePage, loginPage }) => {
    // given
    const credentials: LoginDto = {
      username: ADMIN_USER.username,
      password: ADMIN_USER.password
    };

    // when
    await loginPage.login(credentials);

    // then
    await homePage.verifyLoggedInUser(ADMIN_USER);
  });

  test('should show error for empty password', async ({ page, loginPage }) => {
    // given
    const credentials = {
      username: ADMIN_USER.username,
      password: ''
    };

    // when
    await loginPage.login(credentials);

    // then
    await expect(page).toHaveURL(loginPage.url);
    await expect(loginPage.passwordError).toHaveText('Password is required');
    await expect(loginPage.toast.viewport).toBeEmpty();
  });

  test('should show error for invalid credentials', async ({ page, loginPage }) => {
    // given
    const credentials: LoginDto = {
      username: 'invaliduser',
      password: 'invalidpassword'
    };

    // when
    await loginPage.login(credentials);

    // then
    await expect(page).toHaveURL(loginPage.url);
    await loginPage.toast.verifyAlertFailure('Invalid username/password');
  });

  test('should navigate to register page when register button is clicked', async ({ page, loginPage, registerPage }) => {
    // given
    // when
    await loginPage.clickRegisterButton();

    // then
    await expect(page).toHaveURL(registerPage.url);
    await expect(registerPage.registerPage).toBeVisible();
    await expect(registerPage.title).toHaveText('Create your account');
  });

  test('should navigate to register page when register link is clicked', async ({ page, loginPage, registerPage }) => {
    // given
    // when
    await loginPage.clickRegisterLink();

    // then
    await expect(page).toHaveURL(registerPage.url);
    await expect(registerPage.registerPage).toBeVisible();
    await expect(registerPage.title).toHaveText('Create your account');
  });

  test('should have proper form validation for short username', async ({ page, loginPage }) => {
    // given
    const credentials = {
      username: 'abc',
      password: ADMIN_PASSWORD
    };

    // when
    await loginPage.login(credentials);

    // then
    await expect(page).toHaveURL(loginPage.url);
    await expect(loginPage.usernameError).toHaveText('Username must be at least 4 characters');
    await expect(loginPage.toast.viewport).toBeEmpty();
  });

}); 
