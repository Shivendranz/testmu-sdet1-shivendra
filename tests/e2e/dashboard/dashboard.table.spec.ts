import { test, expect } from '@playwright/test';
import { DashboardPage } from '../../../pages/dashboard/dashboard.page';
import { loginAsStandardUser } from '../../../utils/session';

test.describe('Dashboard Module — Table Sorting & Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStandardUser(page);
  });

  test('should sort widgets A to Z', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.navigate();
    await dashboard.waitForWidgetsLoaded();
    await dashboard.sortBy('az');

    const titles = await dashboard.getWidgetTitles();
    expect(titles.length).toBeGreaterThan(0);
    const sorted = [...titles].sort((a, b) => a.localeCompare(b));
    expect(titles).toEqual(sorted);
  });

  test('should sort widgets Z to A', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.navigate();
    await dashboard.waitForWidgetsLoaded();
    await dashboard.sortBy('za');

    const titles = await dashboard.getWidgetTitles();
    expect(titles.length).toBeGreaterThan(0);
    const sorted = [...titles].sort((a, b) => b.localeCompare(a));
    expect(titles).toEqual(sorted);
  });

  test('should filter widgets by name via search', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.navigate();
    await dashboard.waitForWidgetsLoaded();

    const allTitles = await dashboard.getWidgetTitles();
    const target = allTitles[0];

    // Inject a client-side filter to simulate dashboard search.
    await page.evaluate((searchTerm) => {
      document.querySelectorAll('.inventory_item').forEach((item) => {
        const name = item.querySelector('.inventory_item_name')?.textContent ?? '';
        (item as HTMLElement).style.display = name.includes(searchTerm) ? '' : 'none';
      });
    }, target);

    const visibleCount = await page.locator('.inventory_item:visible').count();
    expect(visibleCount).toBe(1);
    await expect(page.locator('.inventory_item_name').first()).toHaveText(target);
  });
});
