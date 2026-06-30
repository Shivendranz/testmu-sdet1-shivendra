import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/login/login.page';
import { InventoryPage } from '../../../pages/login/inventory.page';
import { loginAsStandardUser, clearSession } from '../../../utils/session';

test.describe('Login Module — Session Expiry', () => {
  test('should redirect to login when session cookies are cleared', async ({ page }) => {
    await loginAsStandardUser(page);

    const inventory = new InventoryPage(page);
    expect(await inventory.isLoaded()).toBeTruthy();

    await clearSession(page);
    await page.goto('/inventory.html');

    await expect(page).toHaveURL(/\/$/);
    const loginPage = new LoginPage(page);
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('should require re-authentication after logout', async ({ page }) => {
    const inventory = await loginAsStandardUser(page);
    await inventory.logout();

    await expect(page).toHaveURL(/\/$/);

    await page.goto('/inventory.html');
    await expect(page).toHaveURL(/\/$/);
  });

  test('should not access protected routes without active session', async ({ page }) => {
    await page.goto('/inventory.html');
    await expect(page).toHaveURL(/\/$/);

    const loginPage = new LoginPage(page);
    await expect(loginPage.usernameInput).toBeVisible();
  });
});
