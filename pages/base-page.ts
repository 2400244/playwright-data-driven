import { Page } from '@playwright/test';

/**
 * Base page class for all page objects.
 * Provides common page infrastructure and utilities.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /**
   * Navigate to a specific URL
   */
  async goto(url: string): Promise<void> {
    await this.page.goto(url);
  }

  /**
   * Get the current page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get the current page URL
   */
  getURL(): string {
    return this.page.url();
  }

  /**
   * Wait for page to be in a stable state
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }
}