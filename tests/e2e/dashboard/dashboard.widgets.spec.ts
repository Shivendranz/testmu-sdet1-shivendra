import { test, expect } from '@playwright/test';
import { DashboardPage } from '../../../pages/dashboard/dashboard.page';
import { loginAsStandardUser } from '../../../utils/session';

test.describe('Dashboard Module — Widget Loading', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStandardUser(page);
  });

  test('should load all widgets within acceptable time', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.navigate();
    await dashboard.waitForWidgetsLoaded();

    const count = await dashboard.getWidgetCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should display widgets after simulated high-latency API', async ({ page }) => {
    // beforeEach already navigated to plain /inventory.html once (via
    // login), so re-requesting that exact URL would be served from the
    // browser's in-memory cache — this route would silently never fire, and
    // the test would falsely "pass" without ever exercising the simulated
    // latency. A cache-busting query string forces a genuinely new request.
    await page.route('**/inventory.html*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.continue();
    });

    const dashboard = new DashboardPage(page);
    await dashboard.navigate('?mock=high-latency');
    await dashboard.waitForWidgetsLoaded(10_000);

    expect(await dashboard.getWidgetCount()).toBeGreaterThan(0);
    await expect(dashboard.widgets.first()).toBeVisible();
  });

  test('should hide loader after widgets render', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.navigate();
    await dashboard.waitForWidgetsLoaded();
    await dashboard.waitForLoaderHidden();

    await expect(dashboard.widgets.first()).toBeVisible();
  });
});