import { test } from '../../fixtures/auth.fixture';

test.describe('Home UI tests', () => {
  test('should open home page as authenticated user', async ({ homePage, authUser }) => {
    // given

    // when
    await homePage.goto();

    // then
    await homePage.verifyLoggedInUser(authUser);
  });

  test('should navigate with logged in header links', async ({
    authUser,
    cartPage,
    emailPage,
    homePage,
    llmPage,
    productsPage,
    profilePage,
    qrCodePage,
    trafficMonitorPage
  }) => {
    // given
    await homePage.goto();
    await homePage.header.verifyVisible(authUser);

    // when
    await homePage.header.productsLink.click();

    // then
    await productsPage.verifyLoaded();

    // when
    await homePage.header.emailLink.click();

    // then
    await emailPage.verifyLoaded();

    // when
    await homePage.header.qrCodeLink.click();

    // then
    await qrCodePage.verifyLoaded();

    // when
    await homePage.header.llmLink.click();

    // then
    await llmPage.verifyLoaded();

    // when
    await homePage.header.trafficMonitorLink.click();

    // then
    await trafficMonitorPage.verifyLoaded();

    // when
    await homePage.header.cartLink.click();

    // then
    await cartPage.verifyEmptyCartLoaded();

    // when
    await homePage.header.profileLink.click();

    // then
    await profilePage.verifyLoaded(authUser);

    // when
    await homePage.header.brandLink.click();

    // then
    await homePage.verifyLoggedInUser(authUser);
  });

  test('should logout from logged in header', async ({ authUser, homePage, loginPage }) => {
    // given
    await homePage.goto();
    await homePage.header.verifyVisible(authUser);

    // when
    await homePage.header.logoutButton.click();

    // then
    await loginPage.verifyLoaded();
  });

  test('should navigate with home page links', async ({
    authUser,
    homePage,
    llmPage,
    productsPage,
    profilePage,
    trafficMonitorPage
  }) => {
    // given
    await homePage.goto();

    // when
    await homePage.productsButton.click();

    // then
    await productsPage.verifyLoaded();

    // given
    await homePage.goto();

    // when
    await homePage.profileButton.click();

    // then
    await profilePage.verifyLoaded(authUser);

    // given
    await homePage.goto();

    // when
    await homePage.llmButton.click();

    // then
    await llmPage.verifyLoaded();

    // given
    await homePage.goto();

    // when
    await homePage.trafficButton.click();

    // then
    await trafficMonitorPage.verifyLoaded();
  });

});
