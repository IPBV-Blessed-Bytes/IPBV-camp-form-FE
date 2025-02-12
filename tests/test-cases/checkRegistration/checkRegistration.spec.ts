import { expect } from '@playwright/test';
import { checkRegistrationTest as test } from 'tests/fixtures/checkRegistrationTest';

test.describe('Check Registration flow', () => {
  test('Verify if it is possible to check the data of a registration', async ({ page, checkRegistration }) => {
    await page.goto('/', {
      waitUntil: 'commit',
    });

    await expect(checkRegistration.infoButton).toBeHidden();
    await checkRegistration.ageToast.click();
    await page.waitForTimeout(5000);
    await checkRegistration.openVerifyRegistrationPage();
    await expect(checkRegistration.verifyRegistrationHeading).toBeVisible();
    await checkRegistration.fillCamperData();
    await expect(checkRegistration.verifyDataHeading).toBeVisible();

    for (const textLocator of checkRegistration.dataInputs) {
      await expect(textLocator).toBeVisible();
    }

    await checkRegistration.backButton.click();
    await expect(checkRegistration.verifyRegistrationHeading).toBeVisible();
  });
});
