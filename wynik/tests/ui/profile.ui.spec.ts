import { test, expect } from '../../fixtures/auth.fixture';

test.describe('Profile UI tests', () => {
  test('should show account details, prompt settings, and empty order history', async ({ authUser, profilePage }) => {
    // given

    // when
    await profilePage.goto();

    // then
    await profilePage.verifyLoaded(authUser);
    await profilePage.verifyPromptSectionLoaded();
    await profilePage.verifyEmptyOrderHistoryLoaded();
  });

  test('should update personal information and persist it after reload', async ({ authUser, profilePage }) => {
    // given
    const updatedUser = {
      email: `updated-${authUser.email}`,
      firstName: 'Updated',
      lastName: 'Profile'
    };
    await profilePage.goto();

    // when
    await profilePage.updatePersonalInformation(updatedUser);

    // then
    await profilePage.verifySuccessfulUserUpdate();
    await profilePage.verifyLoaded(updatedUser);
    await expect(profilePage.page).toHaveURL(profilePage.url);

    // when
    await profilePage.page.reload();

    // then
    await profilePage.verifyLoaded(updatedUser);
    await profilePage.header.verifyVisible({
      displayName: `${updatedUser.firstName} ${updatedUser.lastName}`
    });
  });

  test('should discard unsaved personal information edits after reload', async ({ authUser, profilePage, page }) => {
    // given
    const updateRequests: string[] = [];
    page.on('request', request => {
      if (request.url().endsWith(`/api/v1/users/${authUser.username}`) && request.method() === 'PUT') {
        updateRequests.push(request.url());
      }
    });
    await profilePage.goto();

    // when
    await profilePage.emailInput.fill(`unsaved-${authUser.email}`);
    await profilePage.firstNameInput.fill('Unsaved');
    await profilePage.lastNameInput.fill('Changes');
    await profilePage.page.reload();

    // then
    await expect(profilePage.page).toHaveURL(profilePage.url);
    await profilePage.verifyLoaded(authUser);
    await expect(profilePage.toast.viewport).toBeEmpty();
    expect(updateRequests).toHaveLength(0);
  });
});
