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

  test('should redirect regular user from admin product management to home', async ({ page }) => {
    // given
    const adminDashboardPage = new AdminDashboardPage(page);
    await adminDashboardPage.gotoHome();

    // when
    await page.goto(`${adminDashboardPage.url}/products`, { waitUntil: 'domcontentloaded' });

    // then
    await expect(page).toHaveURL(adminDashboardPage.homeUrl);
    await adminDashboardPage.verifyAdminNavigationHidden();
  });
});
