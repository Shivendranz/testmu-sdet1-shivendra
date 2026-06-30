import { Page } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Example Page Object for playwright.dev — replace with your app pages.
 */
export class HomePage extends BasePage {
  private readonly getStartedLink = this.locator('text=Get started');

  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    await this.goto('/');
    await this.waitForPageLoad();
  }

  async clickGetStarted(): Promise<void> {
    await this.getStartedLink.click();
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }
}
