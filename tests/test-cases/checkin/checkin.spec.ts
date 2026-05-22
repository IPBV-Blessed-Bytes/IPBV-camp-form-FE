import { expect, mergeTests } from '@playwright/test';
import { checkinTest } from 'tests/fixtures/checkinTest';
import { authenticationTest } from 'tests/fixtures/authenticationTest';
import { testsConfig } from 'tests/tests.config';

const test = mergeTests(authenticationTest, checkinTest);

test.describe('Checkin flow', () => {
  test('Verify if it is possible to check in a user', async ({ authentication, checkin }) => {
    const testCredentials = testsConfig.users.testUser;

    await authentication.login(testCredentials);

    await checkin.registeredButton.click();
    await expect(checkin.registeredHeading).toBeVisible();
    await expect(checkin.checkinCellInFirstCampersRow).toBeVisible();
    const initialCheckin = (await checkin.checkinCellInFirstCampersRow.textContent())?.trim();

    await checkin.backAndGoToCheckinPage();
    await expect(checkin.checkinHeading).toBeVisible();
    await checkin.findUser();

    for (const item of checkin.checkinItems) {
      await expect(item).toBeVisible();
    }

    await checkin.checkinSelectToggle('true');
    await expect(checkin.checkinSuccessfulyUpdatedToast).toBeVisible();

    await checkin.backAndGoToRegisteredPage();
    await expect(checkin.registeredHeading).toBeVisible();
    await expect(checkin.checkinCellInFirstCampersRow).toContainText(/Sim|Não/);
    await checkin.backAndGoToCheckinPage();

    await expect(checkin.checkinHeading).toBeVisible();
    await checkin.findUser();
    await checkin.checkinSelectToggle('false');
    await expect(checkin.checkinUpdatedToFalseToast).toBeVisible();

    expect(initialCheckin).toBeDefined();
  });
});
