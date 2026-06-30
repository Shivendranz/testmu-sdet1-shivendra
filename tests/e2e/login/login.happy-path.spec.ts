import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/login/login.page';
import { InventoryPage } from '../../../pages/login/inventory.page';
import { env } from '../../../utils/env';

test.describe('Login Module — Happy Path', () => {
  test('should login with valid credentials and land on inventory page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(env.loginUser, env.loginPassword);

    const inventory = new InventoryPage(page);
    await expect(page).toHaveURL(/inventory\.html/);
    expect(await inventory.isLoaded()).toBeTruthy();
    expect(await inventory.getItemCount()).toBeGreaterThan(0);
  });

  test('should display inventory title after successful login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(env.loginUser, env.loginPassword);

    await expect(page.locator('.title')).toHaveText('Products');
  });
});
