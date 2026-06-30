import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/home.page';

test.describe('Home Page', () => {
  test('should display the correct title', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();

    await expect(page).toHaveTitle(/Swag Labs/);
  });

  test('should navigate to login when Get Started is clicked', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();

    // SauceDemo root IS the login page — verify login form is present
    await expect(page).toHaveURL(/saucedemo\.com/);
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });
});