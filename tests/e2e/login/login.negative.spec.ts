import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/login/login.page';
import { env } from '../../../utils/env';

test.describe('Login Module — Invalid Credentials (Negative)', () => {
  test('should show error for wrong password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(env.loginUser, 'wrong_password');

    await expect(loginPage.errorBanner).toBeVisible();
    await expect(loginPage.errorBanner).toContainText(
      'Username and password do not match',
    );
  });

  test('should show error for unknown username', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('unknown_user', env.loginPassword);

    await expect(loginPage.errorBanner).toBeVisible();
    await expect(loginPage.errorBanner).toContainText(
      'Username and password do not match',
    );
  });

  test('should show error when both fields are empty', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('', '');

    await expect(loginPage.errorBanner).toBeVisible();
    await expect(loginPage.errorBanner).toContainText('Username is required');
  });

  test('should remain on login page after failed attempt', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('invalid', 'invalid');

    await expect(page).toHaveURL(/\/$/);
    await expect(loginPage.loginButton).toBeVisible();
  });
});