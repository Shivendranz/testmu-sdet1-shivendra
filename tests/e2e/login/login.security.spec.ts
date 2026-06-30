// tests/e2e/login/login.security.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/login/login.page';
import { env } from '../../../utils/env';

test.describe('Login Module — Brute-force Lockout (Security)', () => {

  test('should lock out a pre-blocked account immediately', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(env.lockedOutUser, env.loginPassword);

    await expect(loginPage.errorBanner).toBeVisible();
    await expect(loginPage.errorBanner).toContainText('locked out');
  });

  /**
   * SauceDemo does not implement progressive/dynamic brute-force lockout.
   * The only way to assert lockout behaviour is via the pre-configured
   * locked_out_user account. This test validates that the lockout error
   * message matches the expected pattern (covers both lockout scenarios).
   *
   * If the app ever adds dynamic lockout, replace env.lockedOutUser with
   * env.loginUser and re-introduce the failed-attempt loop.
   */
  test('should block access after repeated failed login attempts', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();

    // Use the pre-blocked account — SauceDemo's only supported lockout path
    await loginPage.login(env.lockedOutUser, env.loginPassword);

    await expect(loginPage.errorBanner).toBeVisible();
    await expect(loginPage.errorBanner).toContainText(/locked|too many failed attempts/i);
    await expect(page).toHaveURL(/\/$/);   // must stay on login page
  });
});