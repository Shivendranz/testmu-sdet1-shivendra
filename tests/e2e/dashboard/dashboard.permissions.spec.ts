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
    // Route pattern uses a trailing * to also match the cache-busting query
    // string appended below.
    //
    // NOTE: This previously fetched the real saucedemo.com response and did
    // a string-replace on '</body>' to inject the admin panel markup. That
    // approach had two problems:
    //   1. It depended on saucedemo.com's live markup staying byte-for-byte
    //      stable (case, whitespace, minification) — any drift on their end
    //      silently broke the injection with no error, just a missing panel.
    //   2. It reused/derived headers from the original compressed response
    //      (via route.fetch()/response.text()), which Firefox enforces more
    //      strictly than Chromium/WebKit re: content-length/content-encoding
    //      consistency, causing Firefox-only failures.
    //
    // Fulfilling with a fully self-contained fixture body removes the
    // dependency on the live third-party page entirely and sidesteps the
    // header-consistency issue by construction — there's no original
    // response to derive stale headers from.
    await page.route('**/inventory.html*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<!DOCTYPE html><html><body><div data-test="admin-panel" data-role="admin">Admin Controls</div></body></html>',
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

    // Note: waitForWidgetsLoaded() is intentionally NOT called here. The
    // fixture body above is a minimal admin-panel-only page and does not
    // contain the .inventory_item / [data-test="widget"] elements that
    // method waits on — calling it would time out against this mocked page.
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