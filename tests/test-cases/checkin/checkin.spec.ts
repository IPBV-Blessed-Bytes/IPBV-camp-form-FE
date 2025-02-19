import { expect, mergeTests } from '@playwright/test';
import { checkinTest } from 'tests/fixtures/checkinTest';
import { authenticationTest } from 'tests/fixtures/authenticationTest';
import { testsConfig } from 'tests/tests.config';
import { BASE_URL } from '@/config';

const test = mergeTests(authenticationTest, checkinTest);

test.describe('Checkin flow', () => {
  test('Verify if it is possible to check in a user', async ({ authentication, checkin, page }) => {
    const testCredentials = testsConfig.users.testUser;

    await authentication.login(testCredentials);

    await checkin.registeredButton.click();
    await expect(checkin.registeredHeading).toBeVisible();
    await page.waitForResponse(`${BASE_URL}/camper?size=100000`);
    await expect(checkin.checkinFieldInTheCampersTable).toHaveText('Não');
    await checkin.backAndGoToCheckinPage();
    await expect(checkin.checkinHeading).toBeVisible();
    await checkin.findUser();

    for (let i = 0; i < checkin.checkinItems.length; i++) {
      const section = checkin.checkinItems[i];
      await expect(section).toBeVisible();
    }

    await checkin.checkinSelectToggle('true');
    await expect(checkin.checkinSuccessfulyUpdatedToast).toBeVisible();

    await checkin.backAndGoToRegisteredPage();
    await expect(checkin.registeredHeading).toBeVisible();
    await page.waitForResponse(`${BASE_URL}/camper?size=100000`);
    await expect(checkin.checkinFieldInTheCampersTable).toHaveText(/Sim/);
    await checkin.backAndGoToCheckinPage();

    await expect(checkin.checkinHeading).toBeVisible();
    await checkin.findUser();
    await checkin.checkinSelectToggle('false');
    await expect(checkin.checkinUpdatedToFalseToast).toBeVisible();
  });
});
