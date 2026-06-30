import { test, expect } from '@playwright/test';
import { DashboardPage } from '../../../pages/dashboard/dashboard.page';
import { loginAsStandardUser } from '../../../utils/session';

test.describe('Dashboard Module — Responsive Layout', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStandardUser(page);
  });

  test('desktop layout should show full widget grid', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    const dashboard = new DashboardPage(page);
    await dashboard.navigate();
    await dashboard.waitForWidgetsLoaded();

    const count = await dashboard.getWidgetCount();
    expect(count).toBeGreaterThanOrEqual(4);

    await expect(dashboard.sortDropdown).toBeVisible();
    await expect(dashboard.userPanel).toBeVisible();
  });

  test('mobile layout should remain functional with reduced viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const dashboard = new DashboardPage(page);
    await dashboard.navigate();
    await dashboard.waitForWidgetsLoaded();

    expect(await dashboard.getWidgetCount()).toBeGreaterThan(0);
    await expect(dashboard.mobileMenuButton).toBeVisible();

    await dashboard.openMobileMenu();
    await expect(page.locator('#logout_sidebar_link')).toBeVisible();
  });

  test('tablet layout should render widgets without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    const dashboard = new DashboardPage(page);
    await dashboard.navigate();
    await dashboard.waitForWidgetsLoaded();

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasOverflow).toBeFalsy();
    expect(await dashboard.getWidgetCount()).toBeGreaterThan(0);
  });
});
