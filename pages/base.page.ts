import { Page, Locator } from '@playwright/test';

/**
 * Base Page Object — all page classes should extend this.
 * Encapsulates shared navigation and wait helpers.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  protected locator(selector: string): Locator {
    return this.page.locator(selector);
  }
}
