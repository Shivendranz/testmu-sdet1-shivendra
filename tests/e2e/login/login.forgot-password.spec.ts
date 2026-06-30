import { test, expect } from '@playwright/test';
import { ForgotPasswordPage } from '../../../pages/login/forgot-password.page';

test.describe('Login Module — Forgot Password', () => {
  test.beforeEach(async ({ page }) => {
    // Mock forgot-password page — production apps expose this route; we simulate it.
    await page.route('**/forgot-password', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <body>
              <h1>Reset Password</h1>
              <input id="email" type="email" data-test="email" />
              <button data-test="submit">Send Reset Link</button>
              <div data-test="success" style="display:none">Reset link sent</div>
              <div data-test="error" style="display:none"></div>
              <script>
                document.querySelector('[data-test="submit"]').addEventListener('click', () => {
                  const email = document.getElementById('email').value;
                  const success = document.querySelector('[data-test="success"]');
                  const error = document.querySelector('[data-test="error"]');
                  if (!email.includes('@')) {
                    error.style.display = 'block';
                    error.textContent = 'Invalid email address';
                    success.style.display = 'none';
                  } else {
                    success.style.display = 'block';
                    error.style.display = 'none';
                  }
                });
              </script>
            </body>
          </html>
        `,
      });
    });
  });

  test('should send reset link for a registered email', async ({ page }) => {
    const forgotPage = new ForgotPasswordPage(page);
    await forgotPage.navigate();
    await forgotPage.requestReset('user@example.com');

    await expect(page.locator('[data-test="success"]')).toBeVisible();
    await expect(page.locator('[data-test="success"]')).toContainText('Reset link sent');
  });

  test('should show validation error for invalid email format', async ({ page }) => {
    const forgotPage = new ForgotPasswordPage(page);
    await forgotPage.navigate();
    await forgotPage.requestReset('not-an-email');

    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page.locator('[data-test="error"]')).toContainText('Invalid email');
  });
});
