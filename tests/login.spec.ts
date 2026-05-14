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
    await loginPage.login('valid_username', 'valid_password');
    await expect(homePage.homePageUserName).toBeVisible();
  });
});