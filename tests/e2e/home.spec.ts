import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/home.page';

test.describe('Home Page', () => {
  test('should display the correct title', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();

    await expect(page).toHaveTitle(/Playwright/);
  });

  test('should navigate to docs via Get Started', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();
    await homePage.clickGetStarted();

    await expect(page).toHaveURL(/docs/);
  });
});
