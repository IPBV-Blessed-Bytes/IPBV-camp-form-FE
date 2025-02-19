import { expect, mergeTests } from '@playwright/test';
import { adminHomeTest } from 'tests/fixtures/adminHomeTest';
import { authenticationTest } from 'tests/fixtures/authenticationTest';
import { testsConfig } from 'tests/tests.config';

const test = mergeTests(adminHomeTest, authenticationTest);

test.describe('Admin home flow', () => {
  test('Verify admin navigation for all sections', async ({ authentication, adminHome }) => {
    const testCredentials = testsConfig.users.testUser;

    await authentication.login(testCredentials);

    for (let i = 0; i < adminHome.cardsItems.length; i++) {
      const section = adminHome.cardsItems[i];
      await section.button.click();
      await expect(section.heading).toBeVisible();
      await adminHome.backButton.click();
    }

    for (let i = 0; i < adminHome.settingsItems.length; i++) {
      const section = adminHome.settingsItems[i];
      await adminHome.settingsButton.click();

      await section.button.click();
      await expect(section.heading).toBeVisible();
      await adminHome.backButton.click();
    }

    await adminHome.dataPanelButton.click();
    await expect(adminHome.dataPanelHeading).toBeVisible();
    await adminHome.backButton.click();

    await adminHome.logoutButton.click();
  });
});
