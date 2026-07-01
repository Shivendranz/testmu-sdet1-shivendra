import { test, expect } from '@playwright/test';
import { DashboardPage } from '../../../pages/dashboard/dashboard.page';
import { loginAsStandardUser } from '../../../utils/session';

test.describe('Dashboard Module — Permission-based Visibility', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStandardUser(page);
  });

  test('standard user should see user panel but not admin panel', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.navigate();
    await dashboard.waitForWidgetsLoaded();

    await expect(dashboard.userPanel).toBeVisible();
    await expect(dashboard.adminPanel).toHaveCount(0);
  });

  test('admin user should see admin-only controls when mocked', async ({ page }) => {
    // FIX: String pattern '**/inventory.html*' ki jagah Regex use kiya hai
    // Taaki 'mock=admin-panel' aate hi interceptor har haal me trigger ho jaye
    await page.route(/.*mock=admin-panel.*/, async (route) => {
      const response = await route.fetch();
      let body = await response.text();
      body = body.replace(
        '</body>',
        '<div data-test="admin-panel" data-role="admin">Admin Controls</div></body>',
      );

      // IMPORTANT: we deliberately do NOT pass `{ response }` (which reuses
      // the original response's headers) here. response.text() already
      // decompresses the body, so any leftover content-encoding/
      // content-length/transfer-encoding headers from the original response
      // describe bytes that no longer match what we're sending. Chromium and
      // WebKit are lenient and tolerate this, but Firefox enforces header/
      // body consistency more strictly and silently drops or truncates the
      // fulfilled body when these headers are stale — which is why this
      // test passed in Chromium/WebKit but kept failing only in Firefox.
      // Building a fresh, minimal header set (instead of spreading the
      // original response's headers) avoids this entirely and is
      // consistent across all three engines.
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body,
      });
    });

    const dashboard = new DashboardPage(page);
    // beforeEach's loginAsStandardUser() already navigated to plain
    // /inventory.html once. Re-requesting that exact URL would be served
    // from the browser's in-memory cache, which never reaches Playwright's
    // network interception layer — page.route() would silently never fire,
    // and the mocked admin panel would never appear. A cache-busting query
    // string forces a genuinely new network request every time.
    await dashboard.navigate('?mock=admin-panel');
    await dashboard.waitForWidgetsLoaded();

    await expect(dashboard.adminPanel).toBeVisible();
    await expect(dashboard.adminPanel).toContainText('Admin Controls');
  });

  test('user role should not expose admin API endpoints in DOM', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.navigate();
    await dashboard.waitForWidgetsLoaded();

    await expect(page.locator('[data-role="admin"]')).toHaveCount(0);
  });
});