import { expect } from '@playwright/test';
import { authenticationTest as test } from 'tests/fixtures/authentication/authenticationTest';
import { testsConfig } from 'tests/tests.config';

test.describe('Authentication flow', () => {
  test.beforeEach(async ({ authentication }) => {
    await authentication.goToAdminPage();
  });

  test.afterEach(async ({ authentication }) => {
    await expect(authentication.adminAccess).toBeVisible();
  });

  test('Verify if is possible open login page by icon click', async ({ authentication }) => {
    await authentication.goToHomePage();
    await authentication.churchFooterLogo.click();
  });

  test('Verify if it is possible to show and hide the login password', async ({ authentication }) => {
    const adminPassword = testsConfig.users.adminUser.password;

    await authentication.fillPassword(adminPassword);
    await authentication.eyeIcon.click();
    await expect(authentication.passwordInput).toHaveAttribute('type', 'text');
    await authentication.eyeIcon.click();
    await expect(authentication.passwordInput).toHaveAttribute('type', 'password');
  });

  test('Log the user into the systemwith common user credentials', async ({ authentication }) => {
    const commonUser = testsConfig.users.checkerUser;

    await authentication.login(commonUser);
    await authentication.logout();
  });

  test('Log the user into the system with admin credentials', async ({ authentication }) => {
    const adminUser = testsConfig.users.adminUser;

    await authentication.login(adminUser);
    await authentication.logout();
  });
});
