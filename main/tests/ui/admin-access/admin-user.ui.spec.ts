import { test } from '../../../fixtures/admin.fixture';

test.describe('Admin access UI tests', () => {
  test('should show and open admin area for admin user', async ({ adminDashboardPage }) => {
    // given
    await adminDashboardPage.gotoHome();
    await adminDashboardPage.verifyAdminNavigationVisible();

    // when
    await adminDashboardPage.openFromNavigation();

    // then
    await adminDashboardPage.verifyLoaded();
  });
});
