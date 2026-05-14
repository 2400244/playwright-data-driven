import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { HomePage } from '../pages/home-page';
import * as fs from 'fs';
import * as path from 'path';

/**
 * LoginPageTests migrated from Selenium Java TestNG.
 * Originally extended BaseTests and used TestListener for result tracking.
 * 
 * MIGRATION NOTES:
 * - Migrated from Excel-based test data to JSON
 * - Test data loaded from test-data/testdata.json
 * - Test result tracking handled by Playwright reporters
 */

interface TestDataRow {
  username: string;
  password: string;
  expected: string;
}

interface TestData {
  LoginData: TestDataRow[];
}

test.describe('LoginPageTests', () => {
  let testData: TestData;

  test.beforeAll(async () => {
    console.log('Setup Test Data');
    const dataPath = path.join(__dirname, '..', 'test-data', 'testdata.json');
    
    try {
      const fileContent = fs.readFileSync(dataPath, 'utf-8');
      testData = JSON.parse(fileContent);
    } catch (error) {
      console.error(`Failed to load test data from ${dataPath}:`, error);
      // Create default test data structure if file doesn't exist
      testData = {
        LoginData: [
          { username: 'invalidUser', password: 'invalidPass', expected: 'Invalid credentials' },
          { username: '', password: 'somePassword', expected: 'Username cannot be empty' }
        ]
      };
    }
  });

  test('invalidCredentials', async ({ page, baseURL }) => {
    const objLoginPage = new LoginPage(page);
    await page.goto(baseURL || 'https://opensource-demo.orangehrmlive.com/');
    
    const rowData = testData.LoginData[0];
    const username = rowData.username;
    const password = rowData.password;
    const expectedResponse = rowData.expected;
    
    await objLoginPage.login(username, password);
    const actualResponse = await objLoginPage.getErrorMessage();
    
    await expect(actualResponse).toBe(expectedResponse);
  });

  test('missingUsername', async ({ page, baseURL }) => {
    const objLoginPage = new LoginPage(page);
    await page.goto(baseURL || 'https://opensource-demo.orangehrmlive.com/');
    
    const rowData = testData.LoginData[1];
    const username = rowData.username;
    const password = rowData.password;
    const expectedResponse = rowData.expected;
    
    await objLoginPage.login(username, password);
    const actualResponse = await objLoginPage.getMissingUsernameText();
    
    await expect(actualResponse).toBe(expectedResponse);
  });
});
