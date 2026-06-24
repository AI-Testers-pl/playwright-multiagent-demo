import type { Page } from '@playwright/test';
import { LoginClient } from '../http-clients/LoginClient';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import type { AuthUser } from '../types/auth';
import { enablePlaywrightUiStyleSnapshots } from './base.fixture';
import { test as base } from './pages.fixture';

interface AdminFixtures {
  adminDashboardPage: AdminDashboardPage;
  adminUser: AuthUser;
  page: Page;
}

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const test = base.extend<AdminFixtures>({
  adminDashboardPage: async ({ page }, use) => {
    await use(new AdminDashboardPage(page));
  },

  adminUser: async ({ request }, use) => {
    // given
    const loginClient = new LoginClient(request);
    const credentials = {
      username: requireEnv('ADMIN_USERNAME'),
      password: requireEnv('ADMIN_PASSWORD')
    };

    // when
    const loginResponse = await loginClient.loginSuccessfully(credentials);

    // then
    await use({
      username: loginResponse.username,
      email: loginResponse.email,
      firstName: loginResponse.firstName,
      lastName: loginResponse.lastName,
      displayName: `${loginResponse.firstName} ${loginResponse.lastName}`,
      roles: loginResponse.roles,
      token: loginResponse.token,
      refreshToken: loginResponse.refreshToken
    });
  },

  page: async ({ page, adminUser }, use) => {
    await enablePlaywrightUiStyleSnapshots(page);

    await page.addInitScript(({ token, refreshToken }) => {
      window.localStorage.setItem('token', token);
      window.localStorage.setItem('refreshToken', refreshToken);
    }, {
      token: adminUser.token,
      refreshToken: adminUser.refreshToken
    });

    await use(page);
  }
});

export { expect } from '@playwright/test';
