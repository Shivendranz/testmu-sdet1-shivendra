import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Login Page Object — Sauce Demo (configurable via BASE_URL).
 * Encapsulates all login form interactions and error states.
 */
export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorBanner: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('#user-name');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#login-button');
    this.errorBanner = page.locator('[data-test="error"]');
  }

  async navigate(): Promise<void> {
    await this.goto('/');
    await this.waitForPageLoad();
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorMessage(): Promise<string> {
    return (await this.errorBanner.textContent()) ?? '';
  }

  async isErrorVisible(): Promise<boolean> {
    return this.errorBanner.isVisible();
  }

  async clickForgotPassword(): Promise<void> {
    await this.page.getByRole('link', { name: /forgot password/i }).click();
  }
}
