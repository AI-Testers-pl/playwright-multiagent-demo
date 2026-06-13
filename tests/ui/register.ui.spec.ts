import { expect, test } from '../../fixtures/pages.fixture';
import { RegisterClient } from '../../http-clients/RegisterClient';
import { createRegisterUser } from '../../generators/userGenerator';

test.describe('Register UI tests', () => {
  test('should register a new user and allow immediate login', async ({ page, homePage, loginPage, registerPage }) => {
    // given
    const user = createRegisterUser();
    await registerPage.goto();

    // when
    await registerPage.register(user);

    // then
    await expect(page).toHaveURL(loginPage.url);
    await registerPage.verifySuccessfulRegistrationToast();

    // when
    await loginPage.login({
      username: user.username,
      password: user.password
    });

    // then
    await homePage.verifyLoggedInUser({
      displayName: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      email: user.email
    });
  });

  test('should show error for already used username', async ({ page, registerPage, request }) => {
    // given
    const registerClient = new RegisterClient(request);
    const existingUser = createRegisterUser();
    await registerClient.createUser(existingUser);
    const userWithExistingUsername = {
      ...createRegisterUser(),
      username: existingUser.username
    };
    await registerPage.goto();

    // when
    await registerPage.register(userWithExistingUsername);

    // then
    await expect(page).toHaveURL(registerPage.url);
    await registerPage.verifyUsernameAlreadyExistsToast();
  });

  test('should show error for already used email', async ({ page, registerPage, request }) => {
    // given
    const registerClient = new RegisterClient(request);
    const existingUser = createRegisterUser();
    await registerClient.createUser(existingUser);
    const userWithExistingEmail = {
      ...createRegisterUser(),
      email: existingUser.email
    };
    await registerPage.goto();

    // when
    await registerPage.register(userWithExistingEmail);

    // then
    await expect(page).toHaveURL(registerPage.url);
    await registerPage.verifyErrorToastVisible();
  });

  test('should show validation errors for empty required fields', async ({ page, registerPage }) => {
    // given
    const signupRequests: string[] = [];
    page.on('request', request => {
      if (RegisterClient.isSignupRequest(request.url())) {
        signupRequests.push(request.url());
      }
    });
    await registerPage.goto();

    // when
    await registerPage.submit();

    // then
    await expect(page).toHaveURL(registerPage.url);
    await registerPage.verifyRequiredFieldErrors();
    await registerPage.verifyNoToast();
    expect(signupRequests).toHaveLength(0);
  });
});
