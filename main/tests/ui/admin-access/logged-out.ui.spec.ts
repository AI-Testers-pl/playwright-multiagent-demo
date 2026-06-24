import { expect, test } from '../../../fixtures/pages.fixture';
import { AdminDashboardPage } from '../../../pages/AdminDashboardPage';

test.describe('Logged-out admin access UI tests', () => {
  test('should redirect logged-out user from admin area to login', async ({ page, loginPage }) => {
    // given
    const adminDashboardPage = new AdminDashboardPage(page);

    // when
    await adminDashboardPage.goto();

    // then
    await expect(page).toHaveURL(loginPage.url);
    await loginPage.verifyLoaded();
  });
});
