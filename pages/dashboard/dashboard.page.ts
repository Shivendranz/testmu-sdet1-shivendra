import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base.page';

export type UserRole = 'admin' | 'user';

/**
 * Dashboard Page Object — widgets, data table, and role-gated elements.
 * Targets Sauce Demo inventory as a widget grid with sortable product table semantics.
 */
export class DashboardPage extends BasePage {
  readonly widgets: Locator;
  readonly widgetLoader: Locator;
  readonly sortDropdown: Locator;
  readonly tableRows: Locator;
  readonly adminPanel: Locator;
  readonly userPanel: Locator;
  readonly sidebar: Locator;
  readonly mobileMenuButton: Locator;

  constructor(page: Page) {
    super(page);
    this.widgets = page.locator('.inventory_item, [data-test="widget"]');
    this.widgetLoader = page.locator('.widget-loader, [data-test="widget-loading"]');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.tableRows = page.locator('.inventory_item_name');
    this.adminPanel = page.locator('[data-test="admin-panel"], [data-role="admin"]');
    this.userPanel = page.locator('[data-test="user-panel"], .inventory_list');
    this.sidebar = page.locator('#react-burger-menu-btn, [data-test="sidebar"]');
    this.mobileMenuButton = page.locator('#react-burger-menu-btn');
  }

  async navigate(queryString = ''): Promise<void> {
    await this.goto(`/inventory.html${queryString}`);
    await this.waitForPageLoad();
  }

  async waitForWidgetsLoaded(timeout = 15_000): Promise<void> {
    await this.widgets.first().waitFor({ state: 'visible', timeout });
  }

  async waitForLoaderHidden(timeout = 15_000): Promise<void> {
    await this.widgetLoader.waitFor({ state: 'hidden', timeout }).catch(() => undefined);
  }

  async getWidgetCount(): Promise<number> {
    return this.widgets.count();
  }

  async sortBy(option: 'az' | 'za' | 'lohi' | 'hilo'): Promise<void> {
    const labels: Record<string, string> = {
      az: 'Name (A to Z)',
      za: 'Name (Z to A)',
      lohi: 'Price (low to high)',
      hilo: 'Price (high to low)',
    };
    await this.sortDropdown.waitFor({ state: 'visible', timeout: 10_000 });
    await this.sortDropdown.selectOption({ label: labels[option] });
  }

  async getWidgetTitles(): Promise<string[]> {
    return this.tableRows.allTextContents();
  }

  async isAdminPanelVisible(): Promise<boolean> {
    return this.adminPanel.isVisible();
  }

  async isUserPanelVisible(): Promise<boolean> {
    return this.userPanel.isVisible();
  }

  async openMobileMenu(): Promise<void> {
    await this.mobileMenuButton.click();
  }

  async isSidebarAccessible(): Promise<boolean> {
    return this.sidebar.isVisible();
  }
}