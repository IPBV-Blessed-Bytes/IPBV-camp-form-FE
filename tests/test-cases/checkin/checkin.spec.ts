import { expect, mergeTests } from '@playwright/test';
import { checkinTest } from 'tests/fixtures/checkinTest';
import { authenticationTest } from 'tests/fixtures/authenticationTest';
import { testsConfig } from 'tests/tests.config';

const test = mergeTests(authenticationTest, checkinTest);

test.describe('Check-in de acampante', () => {
  test('busca um acampante e alterna o status de check-in', async ({ authentication, checkin }) => {
    await authentication.login(testsConfig.users.adminUser);
    await checkin.open();

    await checkin.searchCamper();
    await expect(checkin.camperName).toBeVisible();
    await expect(checkin.birthdayLabel).toBeVisible();
    await expect(checkin.accommodationLabel).toBeVisible();

    await checkin.setCheckin('true');
    await expect(checkin.checkedInToast).toBeVisible();

    await checkin.setCheckin('false');
    await expect(checkin.checkedOutToast).toBeVisible();
  });
});
