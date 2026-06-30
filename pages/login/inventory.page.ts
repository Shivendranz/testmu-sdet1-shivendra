import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Post-login inventory dashboard — used for session validation after login.
 */
export class InventoryPage extends BasePage {
  readonly pageTitle: Locator;
  readonly inventoryItems: Locator;
  readonly burgerMenu: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('.title');
    this.inventoryItems = page.locator('.inventory_item');
    this.burgerMenu = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
  }

  async isLoaded(): Promise<boolean> {
    return this.page.url().includes('inventory') && (await this.pageTitle.isVisible());
  }

  async logout(): Promise<void> {
    await this.burgerMenu.waitFor({ state: 'visible' }); // Wait karein menu ke liye
    await this.burgerMenu.click();
    await this.logoutLink.waitFor({ state: 'visible' }); // Wait karein logout link ke liye
    await this.logoutLink.click();
  }

  async getItemCount(): Promise<number> {
    return this.inventoryItems.count();
  }
}
