import { test, expect } from '@playwright/test';
import { DashboardPage } from '../../../pages/dashboard/dashboard.page';
import { LoginPage } from '../../../pages/login/login.page';
import { env } from '../../../utils/env';

test.describe('Dashboard Module — Permission-based Visibility', () => {
  test('standard user should see user panel but not admin panel', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(env.loginUser, env.loginPassword);

    const dashboard = new DashboardPage(page);
    await dashboard.navigate();
    await dashboard.waitForWidgetsLoaded();

    expect(await dashboard.isUserPanelVisible()).toBeTruthy();
    expect(await dashboard.isAdminPanelVisible()).toBeFalsy();
  });

  test('admin user should see admin-only controls when mocked', async ({ page }) => {
    await page.route('**/inventory.html', async (route) => {
      const response = await route.fetch();
      let body = await response.text();
      body = body.replace(
        '</body>',
        '<div data-test="admin-panel" data-role="admin">Admin Controls</div></body>',
      );
      await route.fulfill({ response, body });
    });

    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(env.loginUser, env.loginPassword);

    const dashboard = new DashboardPage(page);
    await dashboard.navigate();

    await expect(dashboard.adminPanel).toBeVisible();
    await expect(dashboard.adminPanel).toContainText('Admin Controls');
  });

  test('user role should not expose admin API endpoints in DOM', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(env.loginUser, env.loginPassword);

    const dashboard = new DashboardPage(page);
    await dashboard.navigate();

    const adminElements = await page.locator('[data-role="admin"]').count();
    expect(adminElements).toBe(0);
  });
});
