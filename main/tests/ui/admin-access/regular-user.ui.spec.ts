import { expect, test } from '../../../fixtures/auth.fixture';
import { AdminDashboardPage } from '../../../pages/AdminDashboardPage';

test.describe('Regular user admin access UI tests', () => {
  test('should hide admin navigation and redirect from admin area for regular user', async ({ page }) => {
    // given
    const adminDashboardPage = new AdminDashboardPage(page);
    await adminDashboardPage.gotoHome();

    // when
    await adminDashboardPage.goto();

    // then
    await expect(page).toHaveURL(adminDashboardPage.homeUrl);
    await adminDashboardPage.verifyAdminNavigationHidden();
    await adminDashboardPage.verifyNotLoaded();
  });
});
