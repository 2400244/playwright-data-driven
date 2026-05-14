import { test, expect } from '../fixtures/base';

/**
 * Login feature tests.
 * Uses LoginPage and HomePage page objects from fixtures.
 */
test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://opensource-demo.orangehrmlive.com/');
  });

  test('Verify valid credentials allow successful login', async ({ loginPage, homePage }) => {
    await loginPage.login('Admin', 'admin123');
    await expect(homePage.homePageUserName).toBeVisible({ timeout: 10000 });
  });
});
