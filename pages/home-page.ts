import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class HomePage extends BasePage {
  readonly homePageUserName: Locator;

  constructor(page: Page) {
    super(page);
    this.homePageUserName = this.page.getByRole('heading', { level: 6 }).first();
  }

  async getHomePageText(): Promise<string> {
    const text = await this.homePageUserName.textContent();
    return text || '';
  }
}