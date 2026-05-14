import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * LoginPage class migrated from Selenium Java.
 * Extends BasePage to inherit common page functionality.
 */
export class LoginPage extends BasePage {
  // Locators defined as readonly properties
  private readonly userName: Locator;
  private readonly password: Locator;
  private readonly missingUsernameErrorMessage: Locator;
  private readonly missingPasswordErrorMessage: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators based on pre-parsed inventory
    this.userName = this.page.locator('[name="username"]');
    this.password = this.page.locator('[name="password"]');
    this.missingUsernameErrorMessage = this.page.locator('//*[@class=\'oxd-form\']/div[1]/div/span');
    this.missingPasswordErrorMessage = this.page.locator('//*[@class=\'oxd-form\']/div[2]/div/span');
    this.loginButton = this.page.locator('//*[@class=\'oxd-form\']/div[3]/button');
    this.errorMessage = this.page.locator('//*[@id=\'app\']/div[1]/div/div[1]/div/div[2]/div[2]/div/div[1]/div[1]/p');
  }

  /**
   * Performs login action with provided credentials.
   * @param strUserName - Username to enter
   * @param strPassword - Password to enter
   */
  async login(strUserName: string, strPassword: string): Promise<void> {
    await this.userName.fill(strUserName);
    await this.password.fill(strPassword);
    await this.loginButton.click();
  }

  /**
   * Gets the missing username error message text.
   * @returns The error message text
   */
  async getMissingUsernameText(): Promise<string> {
    return await this.missingUsernameErrorMessage.textContent() || '';
  }

  /**
   * Gets the missing password error message text.
   * @returns The error message text
   */
  async getMissingPasswordText(): Promise<string> {
    return await this.missingPasswordErrorMessage.textContent() || '';
  }

  /**
   * Gets the general error message text.
   * @returns The error message text
   */
  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }

  /**
   * Saves test results to Excel file.
   * TODO: migrate — ExcelUtils.setCellData() pattern replaced with JSON-based reporting.
   * Original method was used to write test results (PASSED/FAILED) to Excel cells.
   * Recommended approach: Use Playwright's built-in reporters or custom JSON output.
   * 
   * If Excel output is required:
   * 1. Convert test data to JSON format
   * 2. Use Playwright's custom reporter to write results
   * 3. Post-process JSON results to Excel if needed
   * 
   * @param row - Row number in Excel (1-based)
   * @param column - Column number in Excel (1-based)
   * @returns this for method chaining
   */
  saveTestResults(row: number, column: number): LoginPage {
    // TODO: migrate — ExcelUtils static properties no longer used
    // Original code: ExcelUtils.rowNumber = row; ExcelUtils.columnNumber = column;
    // This method was used for writing test results back to Excel during test execution.
    // In Playwright, test results are captured by reporters automatically.
    console.warn(`saveTestResults(${row}, ${column}) called - Excel writing not implemented. Use Playwright reporters instead.`);
    return this;
  }
}