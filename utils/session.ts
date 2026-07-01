import { expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/login/login.page';
import { InventoryPage } from '../pages/login/inventory.page';
import { env } from './env';

/** Authenticate via UI and land on the post-login page. */
export async function loginAsStandardUser(page: Page): Promise<InventoryPage> {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await expect(loginPage.usernameInput).toBeVisible();
  await expect(loginPage.passwordInput).toBeVisible();
  await loginPage.login(env.loginUser, env.loginPassword);

  const inventory = new InventoryPage(page);
  await expect(page).toHaveURL(/inventory/);
  await expect(inventory.pageTitle).toBeVisible();
  await expect(inventory.inventoryItems.first()).toBeVisible();
  return inventory;
}

/** Clear session cookies and storage to simulate expiry. */
export async function clearSession(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}
