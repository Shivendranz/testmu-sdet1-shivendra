import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Forgot Password Page Object — handles password recovery flow.
 */
export class ForgotPasswordPage extends BasePage {
  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('#email, [data-test="email"], input[type="email"]');
    this.submitButton = page.getByRole('button', { name: /reset|submit|send/i });
    this.successMessage = page.locator('[data-test="success"], .success-message, [role="alert"]');
    this.errorMessage = page.locator('[data-test="error"], .error-message');
  }

  async navigate(path = '/forgot-password'): Promise<void> {
    await this.goto(path);
    await this.waitForPageLoad();
  }

  async requestReset(email: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.submitButton.click();
  }

  async getSuccessText(): Promise<string> {
    return (await this.successMessage.textContent()) ?? '';
  }
}
