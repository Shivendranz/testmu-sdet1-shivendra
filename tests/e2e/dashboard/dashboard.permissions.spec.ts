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
    await page.route('**/inventory.html*', async (route) => {
      const response = await route.fetch();
      let body = await response.text();
      body = body.replace(
        '</body>',
        '<div data-test="admin-panel" data-role="admin">Admin Controls</div></body>',
      );

      // IMPORTANT: response.text() already decompresses the body, but the
      // original response headers (content-encoding, content-length) are
      // still attached to `response`. If we pass them through unchanged via
      // { response, body }, the browser tries to gunzip/brotli-decode a body
      // that is no longer compressed and silently fails to render it — the
      // injected <div> never appears, even though route.fulfill() reports
      // no error. This only surfaces when the origin actually compresses
      // responses (common in CI/hosted environments, often absent when
      // hitting a local dev server), which is why this passed locally but
      // failed in GitHub Actions CI. Stripping these two headers forces the
      // browser to treat the body as plain, uncompressed HTML.
      const headers = { ...response.headers() };
      delete headers['content-encoding'];
      delete headers['content-length'];

      await route.fulfill({ response, body, headers });
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